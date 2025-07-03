#!/usr/bin/env node

/**
 * Simple Node.js proxy server for Verus RPC calls
 * This handles CORS and authentication for RFID verification
 * 
 * Usage: node verus-proxy-server.js
 * Then access: http://localhost:3001/api/verus/identity/YOUR_VERUS_ID
 */

require('dotenv').config();

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration - use environment variables for security
const VERUS_CONFIG = {
  rpchost: process.env.VERUS_RPC_HOST || '127.0.0.1',
  rpcport: parseInt(process.env.VERUS_RPC_PORT) || 18843,
  rpcuser: process.env.VERUS_RPC_USER,
  rpcpassword: process.env.VERUS_RPC_PASSWORD,
  testnet: process.env.VERUS_TESTNET === 'true' || true
};

// Validate required configuration
if (!VERUS_CONFIG.rpcuser || !VERUS_CONFIG.rpcpassword) {
  console.warn('⚠️  Missing RPC credentials - blockchain queries will fail');
  console.warn('   Set VERUS_RPC_USER and VERUS_RPC_PASSWORD environment variables');
  console.warn('   Server will start but identity lookups will return errors');
}

const PROXY_PORT = parseInt(process.env.PORT) || 3001;

// Simple rate limiting
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const clientData = rateLimiter.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    clientData.count++;
  }
  
  rateLimiter.set(ip, clientData);
  return clientData.count <= RATE_LIMIT_MAX_REQUESTS;
}

// Input validation
function validateVerusId(id) {
  if (!id || typeof id !== 'string') return false;
  if (id.length < 10 || id.length > 100) return false;
  return /^[a-zA-Z0-9@.]+$/.test(id);
}

// Helper function to make RPC calls to Verus daemon
function makeVerusRPCCall(method, params) {
  return new Promise((resolve, reject) => {
    // Check if credentials are available
    if (!VERUS_CONFIG.rpcuser || !VERUS_CONFIG.rpcpassword) {
      reject(new Error('Blockchain connection not configured - missing RPC credentials'));
      return;
    }

    const rpcData = JSON.stringify({
      jsonrpc: "1.0",
      id: "rfid-proxy",
      method: method,
      params: params
    });

    const auth = Buffer.from(`${VERUS_CONFIG.rpcuser}:${VERUS_CONFIG.rpcpassword}`).toString('base64');
    
    const options = {
      hostname: VERUS_CONFIG.rpchost,
      port: VERUS_CONFIG.rpcport,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(rpcData),
        'Authorization': `Basic ${auth}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`RPC Error: ${response.error.message}`));
          } else {
            resolve(response.result);
          }
        } catch (error) {
          reject(new Error(`JSON Parse Error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request Error: ${error.message}`));
    });

    req.write(rpcData);
    req.end();
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Get client IP for rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
  
  // Security headers - Handle CORS properly
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim());
  const requestOrigin = req.headers.origin;
  
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else {
    // For development, allow localhost origins even if not explicitly listed
    if (requestOrigin && (requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1'))) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }));
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  try {
    // Route: GET /api/verus/identity/:verusId
    if (req.method === 'GET' && path.startsWith('/api/verus/identity/')) {
      const verusId = decodeURIComponent(path.split('/').pop());
      
      // Validate input
      if (!validateVerusId(verusId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid Verus ID format' }));
        return;
      }

      console.log(`Fetching identity for: ${verusId.substring(0, 20)}...`);
      
      const identity = await makeVerusRPCCall('getidentity', [verusId]);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(identity));
      return;
    }

    // Route: GET /api/verus/health (health check)
    if (req.method === 'GET' && path === '/api/verus/health') {
      try {
        const info = await makeVerusRPCCall('getinfo', []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          daemon: 'connected',
          testnet: VERUS_CONFIG.testnet,
          blocks: info.blocks || 'unknown'
        }));
      } catch (error) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'error', 
          daemon: 'disconnected',
          error: error.message 
        }));
      }
      return;
    }

    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Start server
server.listen(PROXY_PORT, () => {
  console.log(`🚀 Verus RFID Proxy Server running on http://localhost:${PROXY_PORT}`);
  console.log(`📡 Connecting to Verus daemon at ${VERUS_CONFIG.rpchost}:${VERUS_CONFIG.rpcport}`);
  console.log(`🧪 Testnet mode: ${VERUS_CONFIG.testnet}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /api/verus/health                     - Health check`);
  console.log(`  GET  /api/verus/identity/:verusId          - Get identity info`);
  console.log('');
  console.log('Example usage:');
  console.log(`  curl http://localhost:${PROXY_PORT}/api/verus/health`);
  console.log(`  curl http://localhost:${PROXY_PORT}/api/verus/identity/i5eFCADv8yxPLk9FNPQSzkx3UoHdgisYjb`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Verus RFID Proxy Server...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});
// RFID Verification System for IlluminatiCoin Merchandise

class RFIDVerifier {
  constructor() {
    // Frontend configuration - NO SENSITIVE DATA
    this.config = {
      development: {
        proxyUrl: 'http://localhost:3001/api/verus',
        testnet: true
      },
      production: {
        proxyUrl: '/api/verus', // Relative URL for production
        testnet: false
      }
    };
    
    this.isLoading = false;
    this.currentVerification = null;
    
    this.init();
  }

  init() {
    // Parse URL parameters on page load
    const params = Utils.getUrlParams();
    
    // Switch configuration based on environment
    this.setEnvironment(this.detectEnvironment());
    
    if (params.id || params.hash || params.item) {
      this.verifyFromUrl(params);
    } else {
      this.showScanInterface();
    }
    
    this.setupEventListeners();
  }

  detectEnvironment() {
    // Detect if we're running in development or production
    const hostname = window.location.hostname;
    const port = window.location.port;
    const fullHost = `${hostname}:${port}`;
    
    console.log('🌍 Hostname detection:', { hostname, port, fullHost });
    
    const isDev = (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local'));
    const environment = isDev ? 'development' : 'production';
    
    console.log('🔍 Environment detected as:', environment);
    
    return environment;
  }

  setEnvironment(env) {
    if (this.config[env]) {
      this.currentConfig = this.config[env];
      console.log(`🌐 RFID Verifier using ${env} configuration`);
      console.log('🔧 Proxy URL:', this.currentConfig.proxyUrl);
      console.log('🧪 Testnet mode:', this.currentConfig.testnet);
      
      // Failsafe: If we're on localhost but somehow got production config, force development
      if (window.location.hostname === 'localhost' && env === 'production') {
        console.warn('🔄 Forcing development config for localhost');
        this.currentConfig = this.config.development;
      }
    } else {
      console.warn(`⚠️ Unknown environment: ${env}, using development config`);
      this.currentConfig = this.config.development;
    }
  }

  setupEventListeners() {
    // Setup manual verification input if present
    const verifyBtn = Utils.qs('#verify-btn');
    const manualInput = Utils.qs('#manual-rfid-input');
    
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => this.handleManualVerification());
    }
    
    if (manualInput) {
      manualInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleManualVerification();
        }
      });
    }

    // Setup identity search functionality
    const searchBtn = Utils.qs('#search-identity-btn');
    const searchInput = Utils.qs('#identity-search-input');
    
    // Setup identity search listeners
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.handleIdentitySearch());
    }
    
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleIdentitySearch();
        }
      });
    }
  }

  async verifyFromUrl(params) {
    const { id, hash, item } = params;
    
    if (!id) {
      this.showError('Invalid RFID code: Missing ID parameter');
      return;
    }

    this.showLoading();
    
    try {
      // First, try to get data from Verus blockchain
      const verificationData = await this.fetchVerusIdentity(id);
      
      if (verificationData) {
        this.displayVerificationResult(verificationData, { id, hash, item });
      } else {
        this.showError('Item not found or not verified on blockchain');
      }
    } catch (error) {
      console.error('Verification error:', error);
      this.showError('Verification failed. Please try again.');
    }
  }

  async fetchVerusIdentity(verusId) {
    try {
      // Fetch from secure proxy endpoint only
      const proxyResponse = await this.fetchViaProxy(verusId);
      if (proxyResponse) {
        return proxyResponse;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Verus identity:', error);
      throw error;
    }
  }

  async fetchViaProxy(verusId) {
    try {
      // Validate input to prevent injection attacks
      if (!verusId || typeof verusId !== 'string' || !/^[a-zA-Z0-9@.]+$/.test(verusId)) {
        throw new Error('Invalid Verus ID format');
      }
      
      const url = `${this.currentConfig.proxyUrl}/identity/${encodeURIComponent(verusId)}`;
      console.log('🔍 Fetching identity from URL:', url);
      console.log('📊 Current config:', this.currentConfig);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Identity data received:', data.friendlyname || 'Unknown identity');
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ Server error:', response.status, response.statusText);
        console.error('❌ Error details:', errorText);
        return null;
      }
    } catch (error) {
      console.error('❌ Network/fetch error:', error.message);
      console.error('❌ Full error:', error);
      return null;
    }
  }



  decodeProductData(hexData) {
    // Mock implementation - you would integrate your actual decoder here
    return {
      brand: "IlluminatiCoin",
      size: "S",
      color: "Black",
      articleDescription: "Hoodie",
      materialComposition: {
        Cotton: "50%",
        Silver: "50%"
      },
      dimensions: "Length: 26in, Width: 20in, Sleeve: 23in",
      productionDate: "06102025",
      website: "illuminaticoin.io",
      telegram: "https://t.me/naticoincommunity",
      ticker: "NATI",
      digitalRepresentation: "nati-hoodie-design.vdxf",
      encryptedMessage: "access_key_nati_premium_2025",
      storeLink: "https://illuminaticoin.io/store",
      price: "$89.99",
      season: "Winter 2025",
      serialNumber: "NATI-H-2025-001"
    };
  }

  // HTML escaping to prevent XSS attacks
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Sanitize and validate product data
  sanitizeProductData(data) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = this.escapeHtml(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeProductData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  displayVerificationResult(verificationData, params) {
    this.hideLoading();
    
    const resultContainer = Utils.qs('#verification-result');
    
    // Validate verification data structure
    if (!verificationData?.identity?.contentmultimap) {
      this.showError('Invalid verification data structure');
      return;
    }
    
    const contentKeys = Object.keys(verificationData.identity.contentmultimap);
    if (contentKeys.length === 0) {
      this.showError('No product data found in blockchain record');
      return;
    }
    
    const hexData = verificationData.identity.contentmultimap[contentKeys[0]][0];
    const rawProductData = this.decodeProductData(hexData);
    const productData = this.sanitizeProductData(rawProductData);
    
    const html = `
      <div class="verification-success">
        <div class="verification-header">
          <div class="verification-status verified">
            <svg class="verification-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Verified Authentic</span>
          </div>
        </div>
        
        <div class="product-details">
          <h2>${productData.brand} ${productData.articleDescription}</h2>
          <div class="product-meta">
            <span class="size">Size: ${productData.size}</span>
            <span class="color">Color: ${productData.color}</span>
            <span class="price">${productData.price}</span>
          </div>
          
          <div class="product-info-grid">
            <div class="info-item">
              <strong>Serial Number:</strong>
              <span>${productData.serialNumber}</span>
            </div>
            <div class="info-item">
              <strong>Season:</strong>
              <span>${productData.season}</span>
            </div>
            <div class="info-item">
              <strong>Production Date:</strong>
              <span>${this.formatProductionDate(productData.productionDate)}</span>
            </div>
            <div class="info-item">
              <strong>Material:</strong>
              <span>${Object.entries(productData.materialComposition).map(([material, percent]) => `${material} ${percent}`).join(', ')}</span>
            </div>
            <div class="info-item">
              <strong>Dimensions:</strong>
              <span>${productData.dimensions}</span>
            </div>
          </div>
          
          <div class="blockchain-details">
            <h3>Blockchain Verification</h3>
            <div class="blockchain-info">
              <div class="info-item">
                <strong>Verus ID:</strong>
                <span class="mono">${this.escapeHtml(verificationData.identity?.identityaddress || 'Unknown')}</span>
              </div>
              <div class="info-item">
                <strong>Status:</strong>
                <span class="status-${this.escapeHtml(verificationData.status || 'unknown')}">${this.escapeHtml(verificationData.status || 'Unknown')}</span>
              </div>
              <div class="info-item">
                <strong>Block Height:</strong>
                <span>${parseInt(verificationData.blockheight) || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    resultContainer.innerHTML = html;
    resultContainer.style.display = 'block';
  }

  formatProductionDate(dateStr) {
    // Convert MMDDYYYY to readable format
    if (dateStr.length === 8) {
      const month = dateStr.substring(0, 2);
      const day = dateStr.substring(2, 4);
      const year = dateStr.substring(4, 8);
      return `${month}/${day}/${year}`;
    }
    return dateStr;
  }

  showLoading() {
    this.isLoading = true;
    const loader = Utils.qs('#verification-loader');
    if (loader) {
      loader.style.display = 'block';
    }
  }

  hideLoading() {
    this.isLoading = false;
    const loader = Utils.qs('#verification-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  showError(message) {
    this.hideLoading();
    const resultContainer = Utils.qs('#verification-result');
    
    // Sanitize error message and provide safe defaults
    const safeMessage = this.escapeHtml(message || 'An error occurred during verification');
    
    const html = `
      <div class="verification-error">
        <div class="verification-status error">
          <svg class="verification-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>Verification Failed</span>
        </div>
        <p class="error-message">${safeMessage}</p>
        <div class="error-actions">
          <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
          <a href="store.html" class="btn btn-secondary">Visit Store</a>
        </div>
      </div>
    `;
    resultContainer.innerHTML = html;
    resultContainer.style.display = 'block';
  }

  showScanInterface() {
    const scanContainer = Utils.qs('#scan-interface');
    const searchContainer = Utils.qs('#identity-search-interface');
    
    if (scanContainer) {
      scanContainer.style.display = 'flex';
    }
    
    if (searchContainer) {
      searchContainer.style.display = 'flex';
    }
  }

  handleManualVerification() {
    const input = Utils.qs('#manual-rfid-input');
    if (!input || !input.value.trim()) {
      this.showError('Please enter a verification URL');
      return;
    }

    const url = input.value.trim();
    
    // Validate URL length to prevent DoS
    if (url.length > 2000) {
      this.showError('URL too long. Please enter a valid verification URL.');
      return;
    }
    
    // Basic URL format validation
    if (!url.match(/^https?:\/\/.+/i) && !url.includes('?id=')) {
      this.showError('Invalid URL format. Please enter a valid verification URL.');
      return;
    }
    
    try {
      // For relative URLs, prepend current origin
      const fullUrl = url.startsWith('http') ? url : `${window.location.origin}/${url.replace(/^\//, '')}`;
      const urlObj = new URL(fullUrl);
      
      // Validate that required parameters exist
      const id = urlObj.searchParams.get('id');
      if (!id) {
        this.showError('Missing verification ID in URL. Please check the URL and try again.');
        return;
      }
      
      const params = {
        id: id,
        hash: urlObj.searchParams.get('hash'),
        item: urlObj.searchParams.get('item')
      };
      
      // Clear input field on successful parse
      input.value = '';
      
      this.verifyFromUrl(params);
    } catch (error) {
      this.showError('Invalid URL format. Please scan the RFID tag or enter a valid verification URL.');
    }
  }

  handleIdentitySearch() {
    const input = Utils.qs('#identity-search-input');
    
    if (!input || !input.value.trim()) {
      this.showError('Please enter a Verus ID or identity name');
      return;
    }

    const verusId = input.value.trim();
    
    // Validate input length to prevent DoS
    if (verusId.length > 500) {
      this.showError('Input too long. Please enter a valid Verus ID.');
      return;
    }
    
    // Basic format validation for Verus IDs and identity names
    if (!verusId.match(/^[a-zA-Z0-9@.]+$/) || verusId.length < 3) {
      this.showError('Invalid format. Please enter a valid Verus ID (I-address) or identity name.');
      return;
    }
    
    try {
      // Clear input field on successful validation
      input.value = '';
      
      // Directly search for the identity
      this.searchVerusIdentity(verusId);
    } catch (error) {
      this.showError('Invalid input format. Please enter a valid Verus ID or identity name.');
    }
  }

  async searchVerusIdentity(verusId) {
    this.showLoading();
    
    try {
      // Fetch identity data directly using the Verus ID
      const verificationData = await this.fetchVerusIdentity(verusId);
      
      if (verificationData) {
        // Display the results with enhanced VDXF information
        this.displayEnhancedVerificationResult(verificationData, { searchType: 'identity', verusId });
      } else {
        this.showError('Identity not found on blockchain or blockchain connection unavailable');
      }
    } catch (error) {
      console.error('Identity search error:', error);
      if (error.message.includes('Blockchain connection not configured')) {
        this.showError('Blockchain connection not configured. Please check server configuration.');
      } else if (error.message.includes('fetch')) {
        this.showError('Unable to connect to blockchain. Please check network connection.');
      } else {
        this.showError('Identity search failed. Please check the ID and try again.');
      }
    }
  }

  displayEnhancedVerificationResult(verificationData, params) {
    this.hideLoading();
    
    const resultContainer = Utils.qs('#verification-result');
    
    // Validate verification data structure
    if (!verificationData?.identity) {
      this.showError('Invalid identity data structure');
      return;
    }
    
    const identity = verificationData.identity;
    const hasContentMultimap = identity.contentmultimap && Object.keys(identity.contentmultimap).length > 0;
    
    let productData = null;
    if (hasContentMultimap) {
      const contentKeys = Object.keys(identity.contentmultimap);
      const hexData = identity.contentmultimap[contentKeys[0]][0];
      const rawProductData = this.decodeProductData(hexData);
      productData = this.sanitizeProductData(rawProductData);
    }
    
    const html = `
      <div class="verification-success">
        <div class="verification-header">
          <div class="verification-status verified">
            <svg class="verification-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Identity Found</span>
          </div>
        </div>
        
        <div class="identity-details">
          <h2>Verus Identity Information</h2>
          <div class="identity-meta">
            <span class="friendly-name">${this.escapeHtml(verificationData.friendlyname || 'N/A')}</span>
            <span class="status status-${this.escapeHtml(verificationData.status || 'unknown')}">${this.escapeHtml(verificationData.status || 'Unknown')}</span>
          </div>
          
          <div class="identity-info-grid">
            <div class="info-item">
              <strong>Identity Address:</strong>
              <span class="mono">${this.escapeHtml(identity.identityaddress || 'Unknown')}</span>
            </div>
            <div class="info-item">
              <strong>Name:</strong>
              <span>${this.escapeHtml(identity.name || 'Unknown')}</span>
            </div>
            <div class="info-item">
              <strong>Fully Qualified Name:</strong>
              <span>${this.escapeHtml(verificationData.fullyqualifiedname || 'N/A')}</span>
            </div>
            <div class="info-item">
              <strong>Primary Address:</strong>
              <span class="mono">${this.escapeHtml(identity.primaryaddresses?.[0] || 'Unknown')}</span>
            </div>
            <div class="info-item">
              <strong>Parent:</strong>
              <span class="mono">${this.escapeHtml(identity.parent || 'N/A')}</span>
            </div>
            <div class="info-item">
              <strong>System ID:</strong>
              <span class="mono">${this.escapeHtml(identity.systemid || 'N/A')}</span>
            </div>
          </div>
          
          ${hasContentMultimap ? `
          <div class="content-multimap">
            <h3>Content Multimap (VDXF Data)</h3>
            <div class="multimap-details">
              <div class="info-item">
                <strong>Content Keys:</strong>
                <span>${Object.keys(identity.contentmultimap).length} key(s)</span>
              </div>
              ${Object.entries(identity.contentmultimap).map(([key, values]) => `
                <div class="multimap-entry">
                  <div class="info-item">
                    <strong>Key:</strong>
                    <span class="mono">${this.escapeHtml(key)}</span>
                  </div>
                  <div class="info-item">
                    <strong>Values:</strong>
                    <span>${values.length} value(s)</span>
                  </div>
                  <details class="hex-data">
                    <summary>View Raw Data</summary>
                    <pre class="hex-content">${this.escapeHtml(values[0] || 'No data')}</pre>
                  </details>
                </div>
              `).join('')}
            </div>
          </div>
          ` : '<div class="no-content"><p>No content multimap data found for this identity.</p></div>'}
          
          ${productData ? `
          <div class="decoded-product-data">
            <h3>Decoded Product Information</h3>
            <div class="product-info-grid">
              <div class="info-item">
                <strong>Brand:</strong>
                <span>${productData.brand}</span>
              </div>
              <div class="info-item">
                <strong>Article:</strong>
                <span>${productData.articleDescription}</span>
              </div>
              <div class="info-item">
                <strong>Size:</strong>
                <span>${productData.size}</span>
              </div>
              <div class="info-item">
                <strong>Color:</strong>
                <span>${productData.color}</span>
              </div>
              <div class="info-item">
                <strong>Price:</strong>
                <span>${productData.price}</span>
              </div>
              <div class="info-item">
                <strong>Serial Number:</strong>
                <span>${productData.serialNumber}</span>
              </div>
              <div class="info-item">
                <strong>Production Date:</strong>
                <span>${this.formatProductionDate(productData.productionDate)}</span>
              </div>
              <div class="info-item">
                <strong>Material Composition:</strong>
                <span>${Object.entries(productData.materialComposition).map(([material, percent]) => `${material} ${percent}`).join(', ')}</span>
              </div>
              <div class="info-item">
                <strong>Dimensions:</strong>
                <span>${productData.dimensions}</span>
              </div>
            </div>
          </div>
          ` : ''}
          
          <div class="blockchain-details">
            <h3>Blockchain Information</h3>
            <div class="blockchain-info">
              <div class="info-item">
                <strong>Block Height:</strong>
                <span>${parseInt(verificationData.blockheight) || 'Unknown'}</span>
              </div>
              <div class="info-item">
                <strong>Transaction ID:</strong>
                <span class="mono">${this.escapeHtml(verificationData.txid || 'Unknown')}</span>
              </div>
              <div class="info-item">
                <strong>Can Spend For:</strong>
                <span>${verificationData.canspendfor ? 'Yes' : 'No'}</span>
              </div>
              <div class="info-item">
                <strong>Can Sign For:</strong>
                <span>${verificationData.cansignfor ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    resultContainer.innerHTML = html;
    resultContainer.style.display = 'block';
  }
}

// Initialize RFID system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RFIDVerifier();
});
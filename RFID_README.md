# RFID Verification System for IlluminatiCoin

This system enables RFID-based product verification using the Verus Protocol blockchain.

## 🚀 Quick Start

### 1. Configure Environment (IMPORTANT!)
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual RPC credentials
# NEVER commit .env to version control!
```

### 2. Start the Proxy Server
```bash
node verus-proxy-server.js
```

### 3. Open the Website
Navigate to `rfid.html` in your browser or use the "Verify" link in the navigation.

## 📱 RFID URL Format

The system handles URLs in this format:
```
https://illuminaticoin.io/rfid.html?id=VERUS_ID&hash=HASH&item=ITEM_ID
```

Example:
```
rfid.html?id=i5eFCADv8yxPLk9FNPQSzkx3UoHdgisYjb&hash=b37f3360af70db3d&item=5ca8e9e5
```

## 🔧 Configuration

### Development (Local Testnet)
- Uses `127.0.0.1:18843`
- Connects to your local VRSCTEST daemon
- Proxy server runs on `localhost:3001`

### Production
- Configure the production settings in `assets/js/rfid.js`
- Update the `production` config object with your live daemon details

## 📁 Files Added/Modified

### New Files
- `rfid.html` - RFID verification page
- `assets/js/rfid.js` - Verification logic
- `assets/css/rfid.css` - Styling
- `verus-proxy-server.js` - Backend proxy for RPC calls
- `test-verus-connection.js` - Connection test utility

### Modified Files
- `assets/js/app.js` - Added URL parameter utilities
- `index.html` - Added "Verify" navigation link
- `store.html` - Added "Verify" navigation link

## 🧪 Testing

### Test Proxy Server Health
```bash
curl http://localhost:3001/api/verus/health
```

### Test Identity Lookup
```bash
curl "http://localhost:3001/api/verus/identity/i5eFCADv8yxPLk9FNPQSzkx3UoHdgisYjb"
```

### Test RFID Verification Flow
1. Start proxy server: `node verus-proxy-server.js`
2. Open: `rfid.html?id=i5eFCADv8yxPLk9FNPQSzkx3UoHdgisYjb&hash=b37f3360af70db3d&item=5ca8e9e5`
3. Should show verification results with real blockchain data

## 🔒 Security Features

### ✅ **Implemented Security Measures**
- **No sensitive data in frontend**: RPC credentials removed from client-side code
- **Environment variables**: All sensitive config stored in `.env` file
- **Input validation**: All user inputs sanitized and validated
- **XSS protection**: HTML escaping prevents script injection
- **Rate limiting**: 20 requests per minute per IP address
- **Security headers**: XSS protection, content type sniffing prevention
- **Error handling**: Generic errors prevent information disclosure

### 🛡️ **Production Security Checklist**
- [ ] Set strong, unique RPC credentials
- [ ] Use HTTPS everywhere
- [ ] Configure firewall to restrict RPC access
- [ ] Set ALLOWED_ORIGINS to your domain only
- [ ] Monitor proxy server logs
- [ ] Keep Verus daemon updated
- [ ] Use a reverse proxy (nginx/cloudflare) in production

## 🌐 Production Deployment

1. Update production config in `rfid.js`
2. Deploy proxy server to your cloud infrastructure
3. Update proxy URL in the frontend code
4. Ensure HTTPS and proper CORS headers

## 🐛 Troubleshooting

### "Proxy endpoint not available"
- Ensure proxy server is running: `node verus-proxy-server.js`
- Check proxy server logs for errors

### "Verification failed"
- Verify Verus daemon is running and accessible
- Check RPC credentials in `verus-proxy-server.js`
- Test with: `node test-verus-connection.js`

### CORS Errors
- Make sure you're accessing the site through a web server (not file://)
- Check that proxy server CORS headers are properly set

## 📞 Support

For issues with:
- **Verus Protocol**: Check Verus documentation
- **RFID Implementation**: Review this README and test scripts
- **Website Integration**: Check browser console for JavaScript errors
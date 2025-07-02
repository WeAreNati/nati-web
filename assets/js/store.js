// Store functionality for IlluminatiCoin merchandise

class Store {
  constructor() {
    this.cart = this.loadCart();
    this.products = this.getProducts();
    this.currentFilter = 'all';
    
    this.init();
  }

  init() {
    this.renderProducts();
    this.updateCartUI();
    this.setupEventListeners();
  }

  // Sample products data (in a real app, this would come from an API)
  getProducts() {
    return [
      {
        id: 1,
        title: '$NATI Illuminati T-Shirt',
        description: 'Premium quality black t-shirt featuring the iconic IlluminatiCoin logo and owl symbol.',
        price: 29.99,
        category: 'apparel',
        image: './assets/img/products/tshirt-black.jpg', // placeholder
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'White', 'Gray']
      },
      {
        id: 2,
        title: 'Illuminati Owl Hoodie',
        description: 'Comfortable hoodie with embroidered owl design. Perfect for the enlightened community.',
        price: 49.99,
        category: 'apparel',
        image: './assets/img/products/hoodie-black.jpg', // placeholder
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'Navy', 'Gray']
      },
      {
        id: 3,
        title: '$NATI Baseball Cap',
        description: 'Adjustable baseball cap with embroidered $NATI logo. Show your allegiance to the brotherhood.',
        price: 24.99,
        category: 'accessories',
        image: './assets/img/products/cap-black.jpg', // placeholder
        sizes: ['One Size'],
        colors: ['Black', 'White', 'Navy']
      },
      {
        id: 4,
        title: 'Illuminati Coffee Mug',
        description: 'Start your day enlightened with our premium ceramic mug featuring the all-seeing owl.',
        price: 14.99,
        category: 'accessories',
        image: './assets/img/products/mug-black.jpg', // placeholder
        sizes: ['11oz'],
        colors: ['Black', 'White']
      },
      {
        id: 5,
        title: 'Limited Edition $NATI Coin',
        description: 'Physical commemorative coin made from premium metal. Limited to 10,000 pieces worldwide.',
        price: 99.99,
        category: 'collectibles',
        image: './assets/img/products/coin-gold.jpg', // placeholder
        sizes: ['One Size'],
        colors: ['Gold', 'Silver']
      },
      {
        id: 6,
        title: 'Illuminati Sticker Pack',
        description: 'Set of 10 premium vinyl stickers featuring various IlluminatiCoin designs.',
        price: 9.99,
        category: 'accessories',
        image: './assets/img/products/stickers.jpg', // placeholder
        sizes: ['Pack of 10'],
        colors: ['Mixed']
      }
    ];
  }

  // Render products grid
  renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const filteredProducts = this.currentFilter === 'all' 
      ? this.products 
      : this.products.filter(product => product.category === this.currentFilter);

    grid.innerHTML = filteredProducts.map(product => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <div style="width: 100%; height: 100%; background: rgba(240, 240, 240, 0.1); display: flex; align-items: center; justify-content: center; color: #f0f0f0; font-size: 0.9rem;">
            ${product.title}
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <button class="add-to-cart-btn" data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `).join('');
  }

  // Setup event listeners
  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        this.setFilter(filter);
      });
    });

    // Add to cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart-btn')) {
        const productId = parseInt(e.target.dataset.productId);
        this.addToCart(productId);
      }
    });

    // Product cards (for product modal)
    document.addEventListener('click', (e) => {
      const productCard = e.target.closest('.product-card');
      if (productCard && !e.target.classList.contains('add-to-cart-btn')) {
        const productId = parseInt(productCard.dataset.productId);
        this.showProductModal(productId);
      }
    });

    // Cart button
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => this.showCartModal());
    }

    // Cart modal close
    const cartCloseBtn = document.querySelector('.cart-modal-close');
    if (cartCloseBtn) {
      cartCloseBtn.addEventListener('click', () => this.hideCartModal());
    }

    // Product modal close
    const productCloseBtn = document.querySelector('.product-modal-close');
    if (productCloseBtn) {
      productCloseBtn.addEventListener('click', () => this.hideProductModal());
    }

    // Modal background click to close
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('cart-modal')) {
        this.hideCartModal();
      }
      if (e.target.classList.contains('product-modal')) {
        this.hideProductModal();
      }
    });

    // Checkout button
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('checkout-btn')) {
        this.initiateCheckout();
      }
    });
  }

  // Filter products
  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.renderProducts();
  }

  // Add product to cart
  addToCart(productId, options = {}) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = {
      id: productId,
      title: product.title,
      price: product.price,
      quantity: 1,
      size: options.size || product.sizes[0],
      color: options.color || product.colors[0],
      image: product.image
    };

    // Check if item already exists in cart with same options
    const existingItemIndex = this.cart.findIndex(item => 
      item.id === productId && 
      item.size === cartItem.size && 
      item.color === cartItem.color
    );

    if (existingItemIndex > -1) {
      this.cart[existingItemIndex].quantity += 1;
    } else {
      this.cart.push(cartItem);
    }

    this.saveCart();
    this.updateCartUI();
    this.showAddToCartFeedback();
  }

  // Remove item from cart
  removeFromCart(productId, size, color) {
    this.cart = this.cart.filter(item => 
      !(item.id === productId && item.size === size && item.color === color)
    );
    this.saveCart();
    this.updateCartUI();
    this.renderCartItems();
  }

  // Update item quantity
  updateQuantity(productId, size, color, newQuantity) {
    const item = this.cart.find(item => 
      item.id === productId && item.size === size && item.color === color
    );
    
    if (item) {
      if (newQuantity <= 0) {
        this.removeFromCart(productId, size, color);
      } else {
        item.quantity = newQuantity;
        this.saveCart();
        this.updateCartUI();
        this.renderCartItems();
      }
    }
  }

  // Update cart UI
  updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
    }
  }

  // Show cart modal
  showCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
      modal.classList.add('active');
      this.renderCartItems();
    }
  }

  // Hide cart modal
  hideCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // Render cart items
  renderCartItems() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems || !cartTotal) return;

    if (this.cart.length === 0) {
      cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
      cartTotal.textContent = 'Total: $0.00';
      return;
    }

    cartItems.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          <div style="width: 100%; height: 100%; background: rgba(240, 240, 240, 0.1); border-radius: 4px;"></div>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} • ${item.size} • ${item.color}</div>
        </div>
        <div class="cart-item-controls">
          <button class="quantity-btn" onclick="store.updateQuantity(${item.id}, '${item.size}', '${item.color}', ${item.quantity - 1})">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn" onclick="store.updateQuantity(${item.id}, '${item.size}', '${item.color}', ${item.quantity + 1})">+</button>
          <button class="remove-item-btn" onclick="store.removeFromCart(${item.id}, '${item.size}', '${item.color}')">&times;</button>
        </div>
      </div>
    `).join('');

    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }

  // Show product modal
  showProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('product-modal-body');
    
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="product-detail">
        <div class="product-detail-image">
          <div style="width: 100%; height: 100%; background: rgba(240, 240, 240, 0.1); display: flex; align-items: center; justify-content: center; color: #f0f0f0; border-radius: 8px;">
            ${product.title}
          </div>
        </div>
        <div class="product-detail-info">
          <h2>${product.title}</h2>
          <div class="product-detail-price">$${product.price.toFixed(2)}</div>
          <div class="product-detail-description">${product.description}</div>
          
          <div class="product-options">
            <h3>Size:</h3>
            <div class="size-options">
              ${product.sizes.map(size => `
                <button class="option-btn size-option ${size === product.sizes[0] ? 'selected' : ''}" data-size="${size}">${size}</button>
              `).join('')}
            </div>
            
            <h3>Color:</h3>
            <div class="color-options">
              ${product.colors.map(color => `
                <button class="option-btn color-option ${color === product.colors[0] ? 'selected' : ''}" data-color="${color}">${color}</button>
              `).join('')}
            </div>
          </div>
          
          <button class="add-to-cart-btn" onclick="store.addToCartFromModal(${product.id})">
            Add to Cart - $${product.price.toFixed(2)}
          </button>
        </div>
      </div>
    `;

    // Setup option button listeners
    modalBody.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const optionType = e.target.classList.contains('size-option') ? 'size-option' : 'color-option';
        modalBody.querySelectorAll(`.${optionType}`).forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
      });
    });

    modal.classList.add('active');
  }

  // Hide product modal
  hideProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // Add to cart from product modal
  addToCartFromModal(productId) {
    const modal = document.getElementById('product-modal');
    const selectedSize = modal.querySelector('.size-option.selected')?.dataset.size;
    const selectedColor = modal.querySelector('.color-option.selected')?.dataset.color;

    this.addToCart(productId, {
      size: selectedSize,
      color: selectedColor
    });

    this.hideProductModal();
  }

  // Show add to cart feedback
  showAddToCartFeedback() {
    // Simple feedback - could be enhanced with toast notifications
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
      cartBtn.style.transform = 'scale(1.1)';
      setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
      }, 200);
    }
  }

  // Initiate checkout process
  initiateCheckout() {
    if (this.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // In a real implementation, this would integrate with payment processors
    // For now, we'll show a placeholder message
    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    alert(`Checkout functionality coming soon!\\n\\nOrder Summary:\\n${this.cart.map(item => 
      `${item.title} (${item.size}, ${item.color}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\\n')}\\n\\nTotal: $${total.toFixed(2)}\\n\\nPayment integration will be added in the next phase.`);
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem('illuminati_cart', JSON.stringify(this.cart));
  }

  // Load cart from localStorage
  loadCart() {
    const saved = localStorage.getItem('illuminati_cart');
    return saved ? JSON.parse(saved) : [];
  }

  // Clear cart
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartUI();
    this.renderCartItems();
  }
}

// Initialize store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.store = new Store();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Store;
}
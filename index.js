// ================================================
//  ShopWave — Shared JavaScript
// ================================================

const API_BASE = 'http://localhost:8080/api';

// ── Auth helpers ──────────────────────────────
const Auth = {
  getToken:    () => localStorage.getItem('sw_token'),
  getUser:     () => JSON.parse(localStorage.getItem('sw_user') || 'null'),
  isLoggedIn:  () => !!localStorage.getItem('sw_token'),

  save(token, user) {
    localStorage.setItem('sw_token', token);
    localStorage.setItem('sw_user', JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_user');
  },

  logout() {
    this.clear();
    window.location.href = '/pages/login.html';
  }
};

// ── Cart helpers (also syncs with backend) ────
const Cart = {
  getLocal:  () => JSON.parse(localStorage.getItem('sw_cart') || '[]'),
  setLocal:  (items) => localStorage.setItem('sw_cart', JSON.stringify(items)),
  getCount:  () => Cart.getLocal().reduce((s, i) => s + i.quantity, 0),

  async addItem(productId, quantity = 1) {
    if (Auth.isLoggedIn()) {
      const res = await API.post('/cart', { productId, quantity });
      if (res.success) Toast.show('Added to cart', 'success');
      else Toast.show(res.message, 'error');
    } else {
      const items = Cart.getLocal();
      const idx = items.findIndex(i => i.productId === productId);
      if (idx >= 0) items[idx].quantity += quantity;
      else items.push({ productId, quantity });
      Cart.setLocal(items);
      Toast.show('Added to cart', 'success');
    }
    Cart.updateBadge();
  },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = Cart.getCount();
  }
};

// ── API client ────────────────────────────────
const API = {
  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (Auth.getToken()) headers['Authorization'] = `Bearer ${Auth.getToken()}`;

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await res.json();

      if (res.status === 401) {
        Auth.clear();
        window.location.href = '/pages/login.html';
        return;
      }

      return data;
    } catch (err) {
      console.error('API error:', err);
      return { success: false, message: 'Network error. Check if backend is running.' };
    }
  },

  get:    (path)        => API.request('GET',    path),
  post:   (path, body)  => API.request('POST',   path, body),
  put:    (path, body)  => API.request('PUT',    path, body),
  delete: (path)        => API.request('DELETE', path),
};

// ── Toast notifications ───────────────────────
const Toast = {
  show(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="font-size:16px">${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn .3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ── Navbar rendering ──────────────────────────
function renderNavbar(activePage = '') {
  const user = Auth.getUser();
  const cartCount = Cart.getCount();

  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
    <div class="container">
      <div class="navbar-inner">
        <a href="/pages/home.html" class="navbar-brand">Shop<span>Wave</span></a>
        <nav>
          <ul class="navbar-links">
            <li><a href="/pages/home.html"     class="${activePage === 'home'     ? 'active' : ''}">Home</a></li>
            <li><a href="/pages/products.html" class="${activePage === 'products' ? 'active' : ''}">Products</a></li>
            <li><a href="/pages/cart.html"     class="${activePage === 'cart'     ? 'active' : ''}">Cart</a></li>
            ${user ? `<li><a href="/pages/orders.html" class="${activePage === 'orders' ? 'active' : ''}">My Orders</a></li>` : ''}
          </ul>
        </nav>
        <div class="navbar-actions">
          <a href="/pages/cart.html" class="cart-btn">
            🛒
            <span id="cart-badge" class="cart-badge">${cartCount}</span>
          </a>
          ${user
            ? `<span style="font-size:14px;color:var(--gray-2)">Hi, ${user.name.split(' ')[0]}</span>
               <button class="btn btn-outline btn-sm" onclick="Auth.logout()">Logout</button>`
            : `<a href="/pages/login.html" class="btn btn-outline btn-sm">Login</a>
               <a href="/pages/register.html" class="btn btn-primary btn-sm">Sign Up</a>`
          }
        </div>
      </div>
    </div>
  `;
}

// ── Footer rendering ──────────────────────────
function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">Shop<span style="color:var(--indigo)">Wave</span></div>
          <p class="footer-desc">Your modern destination for everything worth buying. Quality products, fast delivery, happy customers.</p>
        </div>
        <div>
          <div class="footer-col-title">Shop</div>
          <ul class="footer-links">
            <li><a href="/pages/products.html">All Products</a></li>
            <li><a href="/pages/products.html?category=1">Electronics</a></li>
            <li><a href="/pages/products.html?category=2">Fashion</a></li>
            <li><a href="/pages/products.html?category=3">Home & Living</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Account</div>
          <ul class="footer-links">
            <li><a href="/pages/login.html">Login</a></li>
            <li><a href="/pages/register.html">Register</a></li>
            <li><a href="/pages/orders.html">My Orders</a></li>
            <li><a href="/pages/cart.html">Cart</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Support</div>
          <ul class="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Track Order</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        © 2024 ShopWave. Built with Spring Boot + MySQL.
      </div>
    </div>
  `;
}

// ── Stars renderer ────────────────────────────
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ── Format currency ───────────────────────────
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

// ── Init on DOMContentLoaded ──────────────────
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
});
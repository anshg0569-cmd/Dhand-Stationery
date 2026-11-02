/**
 * Dhand Stationery - Shared Core Logic
 * Handles Cart, Wishlist, Local Demo Authentication, Order History,
 * Toast Notifications, Header Badges, and Quick View Modals.
 */

// Storage Keys
const CART_STORAGE_KEY = 'dhand_stationery_cart';
const WISHLIST_STORAGE_KEY = 'dhand_stationery_wishlist';
const USER_STORAGE_KEY = 'dhand_stationery_current_user';
const USERS_LIST_KEY = 'dhand_stationery_registered_users';
const ORDERS_STORAGE_KEY = 'dhand_stationery_orders';

/* ================= CART MANAGEMENT ================= */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading cart from localStorage', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateHeaderBadges();
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
}

function addToCart(productId, quantity = 1) {
  const qty = parseInt(quantity, 10) || 1;
  if (qty <= 0) return;

  const product = window.getProductById ? window.getProductById(productId) : null;
  if (!product) {
    showToast('Product could not be found.', 'error');
    return;
  }

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === productId);

  if (existingIndex > -1) {
    const newQty = cart[existingIndex].quantity + qty;
    if (newQty > product.stock) {
      showToast(`Only ${product.stock} units available in stock.`, 'warning');
      cart[existingIndex].quantity = product.stock;
    } else {
      cart[existingIndex].quantity = newQty;
      showToast(`Updated quantity of "${product.name}" (${cart[existingIndex].quantity} in cart).`, 'success');
    }
  } else {
    if (qty > product.stock) {
      showToast(`Only ${product.stock} units available in stock.`, 'warning');
      return;
    }
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      quantity: qty
    });
    showToast(`Added "${product.name}" to cart!`, 'success');
  }

  saveCart(cart);
}

function updateCartQuantity(productId, newQty) {
  const cart = getCart();
  const index = cart.findIndex(item => item.id === productId);
  if (index === -1) return;

  const product = window.getProductById ? window.getProductById(productId) : null;
  const maxStock = product ? product.stock : 99;

  const qty = parseInt(newQty, 10);
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (qty > maxStock) {
    showToast(`Cannot exceed available stock of ${maxStock}.`, 'warning');
    cart[index].quantity = maxStock;
  } else {
    cart[index].quantity = qty;
  }

  saveCart(cart);
}

function removeFromCart(productId) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  if (item) {
    showToast(`Removed "${item.name}" from cart.`, 'info');
  }
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
}

/* ================= WISHLIST MANAGEMENT ================= */
function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveWishlist(list) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
    updateHeaderBadges();
  } catch (e) {
    console.error('Error saving wishlist', e);
  }
}

function toggleWishlist(productId) {
  let list = getWishlist();
  const product = window.getProductById ? window.getProductById(productId) : null;
  const name = product ? product.name : 'Item';

  if (list.includes(productId)) {
    list = list.filter(id => id !== productId);
    saveWishlist(list);
    showToast(`Removed "${name}" from Wishlist.`, 'info');
    updateWishlistButtons(productId, false);
    return false;
  } else {
    list.push(productId);
    saveWishlist(list);
    showToast(`Added "${name}" to Wishlist!`, 'success');
    updateWishlistButtons(productId, true);
    return true;
  }
}

function isInWishlist(productId) {
  const list = getWishlist();
  return list.includes(productId);
}

function updateWishlistButtons(productId, isWishlisted) {
  const buttons = document.querySelectorAll(`[data-wishlist-id="${productId}"]`);
  buttons.forEach(btn => {
    if (isWishlisted) {
      btn.classList.add('active', 'text-rose-500');
      btn.setAttribute('aria-label', 'Remove from wishlist');
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', 'currentColor');
    } else {
      btn.classList.remove('active', 'text-rose-500');
      btn.setAttribute('aria-label', 'Add to wishlist');
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', 'none');
    }
  });
}

/* ================= USER AUTHENTICATION (DEMO) ================= */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    updateHeaderUserDisplay();
  } catch (e) {
    console.error('Error setting current user', e);
  }
}

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (raw) return JSON.parse(raw);
    // Seed default demo user
    const defaultUser = [
      {
        name: 'Demo Student',
        email: 'student@dhandstationery.com',
        password: 'password123',
        phone: '9876543210',
        joinedAt: '2026-10-15'
      }
    ];
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  } catch (e) {
    return [];
  }
}

function registerUser(name, email, password) {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const newUser = {
    name: name.trim(),
    email: cleanEmail,
    password: password,
    joinedAt: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  setCurrentUser({ name: newUser.name, email: newUser.email });
  return { success: true, user: newUser };
}

function loginUser(email, password) {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

  if (user) {
    setCurrentUser({ name: user.name, email: user.email, phone: user.phone });
    return { success: true, user };
  }
  return { success: false, message: 'Invalid email address or password. Try demo: student@dhandstationery.com / password123' };
}

function logoutUser() {
  setCurrentUser(null);
  showToast('You have been logged out.', 'info');
}

/* ================= ORDERS MANAGEMENT (DEMO) ================= */
function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function createOrder(orderData) {
  const orders = getOrders();
  const orderId = 'DS-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
  const newOrder = {
    orderId,
    createdAt: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    ...orderData,
    status: 'Order Confirmed (Demo)'
  };

  orders.unshift(newOrder);
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving order', e);
  }
  return newOrder;
}

/* ================= UI NOTIFICATIONS & BADGES ================= */
function showToast(message, type = 'info') {
  let container = document.getElementById('dhand-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dhand-toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-900/90 text-white border-emerald-700',
    error: 'bg-rose-900/90 text-white border-rose-700',
    warning: 'bg-amber-900/90 text-white border-amber-700',
    info: 'bg-slate-900/95 text-white border-slate-700'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium backdrop-blur-sm transition-all duration-300 transform translate-y-3 opacity-0 pointer-events-auto ${typeStyles[type] || typeStyles.info}`;
  
  const iconSvg = type === 'success' 
    ? '<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
    : type === 'error'
    ? '<svg class="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
    : '<svg class="w-5 h-5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';

  toast.innerHTML = `
    ${iconSvg}
    <div class="flex-1 leading-snug">${message}</div>
    <button class="text-slate-400 hover:text-white transition-colors" onclick="this.parentElement.remove()" aria-label="Close notification">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  });

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function updateHeaderBadges() {
  const cartCount = getCartCount();
  const wishlistCount = getWishlist().length;

  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'inline-flex' : 'none';
  });

  document.querySelectorAll('.wishlist-badge-count').forEach(el => {
    el.textContent = wishlistCount;
    el.style.display = wishlistCount > 0 ? 'inline-flex' : 'none';
  });
}

function updateHeaderUserDisplay() {
  const user = getCurrentUser();
  document.querySelectorAll('.nav-user-label').forEach(el => {
    if (user && user.name) {
      const firstName = user.name.split(' ')[0];
      el.textContent = `Hi, ${firstName}`;
    } else {
      el.textContent = 'Account';
    }
  });
}

/* ================= QUICK VIEW MODAL ================= */
function openQuickView(productId) {
  const product = window.getProductById ? window.getProductById(productId) : null;
  if (!product) return;

  let modal = document.getElementById('dhand-quickview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dhand-quickview-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200';
    document.body.appendChild(modal);
  }

  const inWish = isInWishlist(productId);

  modal.innerHTML = `
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200" onclick="event.stopPropagation()">
      <button class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors" onclick="closeQuickView()" aria-label="Close modal">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2">
        <div class="bg-slate-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
          <img src="${product.image}" alt="${product.name}" class="max-h-72 w-full object-contain drop-shadow-md rounded-lg" onerror="this.src='images/doms-brush-pens.jpg';">
        </div>
        <div class="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
              <span>${product.category}</span>
              <span class="text-slate-500 font-normal">ID: ${product.id}</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 mb-2 leading-tight">${product.name}</h2>
            
            <div class="flex items-center gap-2 mb-4">
              <div class="flex text-amber-400">
                ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span class="text-xs font-medium text-slate-600">${product.rating} (${product.reviewsCount} reviews)</span>
            </div>

            <div class="flex items-baseline gap-3 mb-4">
              <span class="text-2xl font-bold text-slate-900">₹${product.price}</span>
              ${product.originalPrice ? `<span class="text-sm text-slate-400 line-through">₹${product.originalPrice}</span>` : ''}
              ${product.discount ? `<span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">${product.discount}% OFF</span>` : ''}
            </div>

            <p class="text-sm text-slate-600 mb-6 leading-relaxed">${product.description || product.shortDescription}</p>
            
            <div class="text-xs text-slate-500 mb-4">
              Availability: <span class="font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}">${product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}</span>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                <button type="button" class="px-3 py-2 text-slate-600 hover:bg-slate-200 transition-colors" onclick="adjustQuickViewQty(-1)" aria-label="Decrease quantity">-</button>
                <input id="quickview-qty" type="number" min="1" max="${product.stock}" value="1" class="w-12 text-center text-sm font-semibold bg-transparent border-none focus:outline-none" readonly>
                <button type="button" class="px-3 py-2 text-slate-600 hover:bg-slate-200 transition-colors" onclick="adjustQuickViewQty(1)" aria-label="Increase quantity">+</button>
              </div>

              <button class="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm" onclick="handleQuickViewAddToCart('${product.id}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                Add to Cart
              </button>

              <button class="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:text-rose-500 hover:border-rose-200 transition-colors ${inWish ? 'text-rose-500 bg-rose-50' : ''}" onclick="toggleWishlist('${product.id}'); this.classList.toggle('text-rose-500');" aria-label="Add to wishlist">
                <svg class="w-5 h-5" fill="${inWish ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.onclick = closeQuickView;
  document.body.style.overflow = 'hidden';
}

function adjustQuickViewQty(delta) {
  const input = document.getElementById('quickview-qty');
  if (!input) return;
  const current = parseInt(input.value, 10) || 1;
  const max = parseInt(input.getAttribute('max'), 10) || 99;
  const next = Math.max(1, Math.min(max, current + delta));
  input.value = next;
}

function handleQuickViewAddToCart(productId) {
  const input = document.getElementById('quickview-qty');
  const qty = input ? parseInt(input.value, 10) : 1;
  addToCart(productId, qty);
  closeQuickView();
}

function closeQuickView() {
  const modal = document.getElementById('dhand-quickview-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Global modal escape key listener
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuickView();
    closeAllModals();
  }
});

function closeAllModals() {
  document.querySelectorAll('.info-modal-backdrop').forEach(el => el.classList.add('hidden'));
  document.body.style.overflow = '';
}

function openInfoModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

/* ================= INITIALIZATION ================= */
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderBadges();
  updateHeaderUserDisplay();

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Header Search Forms
  document.querySelectorAll('.header-search-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="search"]') || form.querySelector('input[type="text"]');
      if (input && input.value.trim()) {
        window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
      } else {
        window.location.href = 'shop.html';
      }
    });
  });

  // Sync any active wishlist hearts on the page
  const wishlist = getWishlist();
  wishlist.forEach(id => {
    updateWishlistButtons(id, true);
  });
});

// Expose on window for direct HTML inline calls
if (typeof window !== 'undefined') {
  window.getCart = getCart;
  window.addToCart = addToCart;
  window.updateCartQuantity = updateCartQuantity;
  window.removeFromCart = removeFromCart;
  window.clearCart = clearCart;
  window.getCartCount = getCartCount;
  window.getCartSubtotal = getCartSubtotal;
  window.getWishlist = getWishlist;
  window.toggleWishlist = toggleWishlist;
  window.isInWishlist = isInWishlist;
  window.getCurrentUser = getCurrentUser;
  window.loginUser = loginUser;
  window.registerUser = registerUser;
  window.logoutUser = logoutUser;
  window.getOrders = getOrders;
  window.createOrder = createOrder;
  window.showToast = showToast;
  window.updateHeaderBadges = updateHeaderBadges;
  window.openQuickView = openQuickView;
  window.closeQuickView = closeQuickView;
  window.adjustQuickViewQty = adjustQuickViewQty;
  window.handleQuickViewAddToCart = handleQuickViewAddToCart;
  window.openInfoModal = openInfoModal;
  window.closeAllModals = closeAllModals;
}

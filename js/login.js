/**
 * Dhand Stationery - Login & Account Page Controller
 * Manages frontend demo authentication, registration validation,
 * account dashboard state, wishlist items, and order history viewing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const authFormsWrapper = document.getElementById('auth-forms-wrapper');
  const accountDashboard = document.getElementById('account-dashboard');
  
  // Forms
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const loginFeedback = document.getElementById('login-feedback');
  const registerFeedback = document.getElementById('register-feedback');

  // Password Visibility Toggles
  setupPasswordToggle('login-password', 'toggle-login-pwd');
  setupPasswordToggle('reg-password', 'toggle-reg-pwd');
  setupPasswordToggle('reg-confirm-password', 'toggle-reg-confirm-pwd');

  // Demo Credentials Fill Shortcut
  const fillDemoBtn = document.getElementById('fill-demo-credentials');
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', () => {
      const emailField = document.getElementById('login-email');
      const pwdField = document.getElementById('login-password');
      if (emailField) emailField.value = 'student@dhandstationery.com';
      if (pwdField) pwdField.value = 'password123';
      window.showToast('Demo student credentials filled!', 'info');
    });
  }

  // Tab switching
  if (tabLoginBtn && tabRegisterBtn) {
    tabLoginBtn.addEventListener('click', () => switchTab('login'));
    tabRegisterBtn.addEventListener('click', () => switchTab('register'));
  }

  function switchTab(tab) {
    if (tab === 'login') {
      loginForm?.classList.remove('hidden');
      registerForm?.classList.add('hidden');
      tabLoginBtn?.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600', 'font-bold');
      tabLoginBtn?.classList.remove('text-slate-500');
      tabRegisterBtn?.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600', 'font-bold');
      tabRegisterBtn?.classList.add('text-slate-500');
    } else {
      loginForm?.classList.add('hidden');
      registerForm?.classList.remove('hidden');
      tabRegisterBtn?.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600', 'font-bold');
      tabRegisterBtn?.classList.remove('text-slate-500');
      tabLoginBtn?.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600', 'font-bold');
      tabLoginBtn?.classList.add('text-slate-500');
    }
  }

  function setupPasswordToggle(inputId, toggleBtnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(toggleBtnId);
    if (!input || !btn) return;

    btn.addEventListener('click', () => {
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.innerHTML = isPwd 
        ? '<svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>'
        : '<svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>';
    });
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value;

      if (!email || !password) {
        setFeedback(loginFeedback, 'Please enter both your email address and password.', 'error');
        return;
      }

      const result = window.loginUser ? window.loginUser(email, password) : { success: false };

      if (result.success) {
        setFeedback(loginFeedback, 'Login successful! Redirecting to account...', 'success');
        window.showToast(`Welcome back, ${result.user.name}!`, 'success');
        setTimeout(() => {
          checkAuthState();
        }, 400);
      } else {
        setFeedback(loginFeedback, result.message || 'Invalid credentials.', 'error');
      }
    });
  }

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name')?.value.trim();
      const email = document.getElementById('reg-email')?.value.trim();
      const password = document.getElementById('reg-password')?.value;
      const confirmPassword = document.getElementById('reg-confirm-password')?.value;
      const termsAccepted = document.getElementById('reg-terms')?.checked;

      // Validations
      if (!name || !email || !password || !confirmPassword) {
        setFeedback(registerFeedback, 'All fields are required.', 'error');
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setFeedback(registerFeedback, 'Please enter a valid email address.', 'error');
        return;
      }

      if (password.length < 6) {
        setFeedback(registerFeedback, 'Password must be at least 6 characters long.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        setFeedback(registerFeedback, 'Passwords do not match. Please re-enter.', 'error');
        return;
      }

      if (!termsAccepted) {
        setFeedback(registerFeedback, 'You must accept the demonstration terms.', 'error');
        return;
      }

      const result = window.registerUser ? window.registerUser(name, email, password) : { success: false };

      if (result.success) {
        setFeedback(registerFeedback, 'Account created successfully! Logging you in...', 'success');
        window.showToast(`Account created for ${result.user.name}!`, 'success');
        setTimeout(() => {
          checkAuthState();
        }, 500);
      } else {
        setFeedback(registerFeedback, result.message || 'Error creating account.', 'error');
      }
    });
  }

  function setFeedback(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = `text-xs font-medium p-2.5 rounded-lg mt-2 ${type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`;
  }

  // Check Auth State & Switch Dashboard View
  function checkAuthState() {
    const user = window.getCurrentUser ? window.getCurrentUser() : null;

    if (user) {
      authFormsWrapper?.classList.add('hidden');
      accountDashboard?.classList.remove('hidden');
      renderAccountDashboard(user);
    } else {
      authFormsWrapper?.classList.remove('hidden');
      accountDashboard?.classList.add('hidden');
    }
  }

  function renderAccountDashboard(user) {
    const userNameEl = document.getElementById('dash-user-name');
    const userEmailEl = document.getElementById('dash-user-email');
    const wishlistContainer = document.getElementById('dash-wishlist-items');
    const ordersContainer = document.getElementById('dash-orders-items');
    const logoutBtn = document.getElementById('logout-btn');

    if (userNameEl) userNameEl.textContent = user.name || 'Student Customer';
    if (userEmailEl) userEmailEl.textContent = user.email;

    // Logout
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        if (window.logoutUser) window.logoutUser();
        checkAuthState();
      };
    }

    // Render Wishlist
    if (wishlistContainer) {
      const wishlistIds = window.getWishlist ? window.getWishlist() : [];
      if (wishlistIds.length === 0) {
        wishlistContainer.innerHTML = `
          <div class="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <svg class="w-8 h-8 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            Your wishlist is empty. Explore our stationery & school supplies!
            <div class="mt-3"><a href="shop.html" class="inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">Browse Shop</a></div>
          </div>
        `;
      } else {
        const items = wishlistIds.map(id => window.getProductById ? window.getProductById(id) : null).filter(Boolean);
        wishlistContainer.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${items.map(item => `
              <div class="border border-slate-200 rounded-xl p-3 bg-white flex flex-col justify-between shadow-xs">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain" onerror="this.src='images/doms-brush-pens.jpg';">
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-900 line-clamp-1">${item.name}</h4>
                    <span class="text-xs font-bold text-indigo-700 tabular-nums">₹${item.price}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button type="button" class="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors" onclick="addToCart('${item.id}', 1)">
                    Add to Cart
                  </button>
                  <button type="button" class="px-2 py-1.5 border border-slate-200 hover:bg-rose-50 text-rose-500 rounded-lg text-xs transition-colors" onclick="toggleWishlist('${item.id}'); location.reload();" title="Remove from wishlist">
                    ✕
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    // Render Orders in Dashboard
    if (ordersContainer) {
      const orders = window.getOrders ? window.getOrders() : [];
      if (orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No demonstration orders placed yet.
            <div class="mt-3"><a href="shop.html" class="inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">Start Shopping</a></div>
          </div>
        `;
      } else {
        ordersContainer.innerHTML = orders.map(ord => `
          <div class="border border-slate-200 rounded-xl p-4 bg-white mb-3 shadow-xs">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 text-xs">
              <span class="font-bold text-slate-900 font-mono">${ord.orderId}</span>
              <span class="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">${ord.status}</span>
            </div>
            <div class="text-xs text-slate-600 mb-2">
              ${ord.items.map(i => `${i.name} (×${i.quantity})`).join(', ')}
            </div>
            <div class="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
              <span>Date: ${ord.createdAt}</span>
              <span class="font-bold text-slate-900 tabular-nums">Total: ₹${ord.total}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Initial check
  checkAuthState();
});

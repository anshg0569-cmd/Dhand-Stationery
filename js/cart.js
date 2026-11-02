/**
 * Dhand Stationery - Cart & Checkout Controller
 * Manages shopping cart display, quantity stepper, subtotal/tax/shipping calculation,
 * promotional coupons, customer form validation, demo payment selection, order placement,
 * and local demo order history.
 */

document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const emptyCartState = document.getElementById('empty-cart-state');
  const cartContentWrapper = document.getElementById('cart-content-wrapper');
  
  // Summary Elements
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDiscount = document.getElementById('summary-discount');
  const summaryDiscountRow = document.getElementById('summary-discount-row');
  const summaryShipping = document.getElementById('summary-shipping');
  const summaryTotal = document.getElementById('summary-total');
  const freeShippingBanner = document.getElementById('free-shipping-banner');

  // Coupon
  const couponInput = document.getElementById('coupon-input');
  const applyCouponBtn = document.getElementById('apply-coupon-btn');
  const couponFeedback = document.getElementById('coupon-feedback');

  // Checkout Form
  const checkoutForm = document.getElementById('checkout-form');
  const placeOrderBtn = document.getElementById('place-order-btn');

  // Order History Container
  const orderHistoryContainer = document.getElementById('order-history-list');

  // State
  let appliedCoupon = null; // { code: 'DHAND10', rate: 0.10, discountAmount: 0 }
  const FREE_SHIPPING_THRESHOLD = 499;
  const STANDARD_SHIPPING_FEE = 49;

  // Render Cart Items
  function renderCart() {
    const cart = window.getCart ? window.getCart() : [];
    
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      if (emptyCartState) emptyCartState.classList.remove('hidden');
      if (cartContentWrapper) cartContentWrapper.classList.add('hidden');
      renderOrderHistory();
      return;
    }

    if (emptyCartState) emptyCartState.classList.add('hidden');
    if (cartContentWrapper) cartContentWrapper.classList.remove('hidden');

    cartItemsContainer.innerHTML = cart.map(item => {
      const subtotal = (item.price || 0) * (item.quantity || 1);
      return `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-200">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center p-1">
              <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain" onerror="this.src='images/doms-brush-pens.jpg';">
            </div>
            <div>
              <span class="text-xs text-indigo-600 font-semibold uppercase tracking-wider">${item.category || 'Stationery'}</span>
              <h3 class="text-sm font-bold text-slate-900 leading-snug">${item.name}</h3>
              <div class="text-xs text-slate-500 mt-0.5">Unit Price: <span class="font-medium text-slate-700 tabular-nums">₹${item.price}</span></div>
            </div>
          </div>

          <div class="flex items-center justify-between w-full sm:w-auto gap-6">
            <!-- Stepper -->
            <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
              <button 
                type="button" 
                class="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                onclick="handleCartQtyChange('${item.id}', ${item.quantity - 1})"
                aria-label="Decrease quantity"
              >-</button>
              <span class="w-10 text-center text-xs font-semibold tabular-nums text-slate-900">${item.quantity}</span>
              <button 
                type="button" 
                class="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                onclick="handleCartQtyChange('${item.id}', ${item.quantity + 1})"
                aria-label="Increase quantity"
              >+</button>
            </div>

            <!-- Subtotal -->
            <div class="text-right min-w-[70px]">
              <div class="text-sm font-bold text-slate-900 tabular-nums">₹${subtotal}</div>
            </div>

            <!-- Remove Button -->
            <button 
              type="button" 
              class="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
              onclick="handleRemoveCartItem('${item.id}')"
              aria-label="Remove item"
              title="Remove item"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    updateSummary();
    renderOrderHistory();
  }

  function updateSummary() {
    const subtotal = window.getCartSubtotal ? window.getCartSubtotal() : 0;
    
    // Calculate shipping
    let shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
    
    // Calculate coupon discount
    let discountAmount = 0;
    if (appliedCoupon && subtotal > 0) {
      discountAmount = Math.round(subtotal * appliedCoupon.rate);
    }

    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

    if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal}`;
    
    if (summaryDiscountRow && summaryDiscount) {
      if (discountAmount > 0) {
        summaryDiscountRow.classList.remove('hidden');
        summaryDiscount.textContent = `-₹${discountAmount}`;
      } else {
        summaryDiscountRow.classList.add('hidden');
      }
    }

    if (summaryShipping) {
      if (shippingFee === 0) {
        summaryShipping.innerHTML = `<span class="text-emerald-600 font-semibold">FREE</span>`;
      } else {
        summaryShipping.textContent = `₹${shippingFee}`;
      }
    }

    if (summaryTotal) summaryTotal.textContent = `₹${finalTotal}`;

    // Free delivery progress banner
    if (freeShippingBanner) {
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        freeShippingBanner.innerHTML = `
          <div class="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>You unlocked <strong>FREE Delivery</strong> on this order!</span>
          </div>
        `;
      } else {
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        freeShippingBanner.innerHTML = `
          <div class="flex items-center justify-between gap-2 text-xs text-slate-700 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
            <span>Add <strong class="text-indigo-700 font-bold tabular-nums">₹${remaining}</strong> more for <strong>FREE Delivery</strong></span>
            <a href="shop.html" class="text-indigo-600 hover:text-indigo-800 font-semibold underline text-xs">Add Items</a>
          </div>
        `;
      }
    }
  }

  // Stepper Handler
  window.handleCartQtyChange = (productId, newQty) => {
    if (window.updateCartQuantity) {
      window.updateCartQuantity(productId, newQty);
      renderCart();
    }
  };

  window.handleRemoveCartItem = (productId) => {
    if (window.removeFromCart) {
      window.removeFromCart(productId);
      renderCart();
    }
  };

  // Coupon code handling
  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (!code) return;

      if (code === 'DHAND10' || code === 'FIRST10' || code === 'STUDENT10') {
        appliedCoupon = { code, rate: 0.10 };
        if (couponFeedback) {
          couponFeedback.className = 'text-xs text-emerald-600 font-medium mt-1';
          couponFeedback.textContent = `Coupon "${code}" applied! 10% discount added.`;
        }
        updateSummary();
      } else if (code === 'DHAND20') {
        appliedCoupon = { code, rate: 0.20 };
        if (couponFeedback) {
          couponFeedback.className = 'text-xs text-emerald-600 font-medium mt-1';
          couponFeedback.textContent = `Coupon "${code}" applied! 20% discount added.`;
        }
        updateSummary();
      } else {
        if (couponFeedback) {
          couponFeedback.className = 'text-xs text-rose-500 font-medium mt-1';
          couponFeedback.textContent = 'Invalid promo code. Try DHAND10 or STUDENT10.';
        }
      }
    });
  }

  // Pre-fill user data if logged in
  const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
  if (currentUser) {
    const nameField = document.getElementById('checkout-name');
    const emailField = document.getElementById('checkout-email');
    const phoneField = document.getElementById('checkout-phone');
    if (nameField && !nameField.value) nameField.value = currentUser.name || '';
    if (emailField && !emailField.value) emailField.value = currentUser.email || '';
    if (phoneField && !phoneField.value && currentUser.phone) phoneField.value = currentUser.phone;
  }

  // Payment method selection tabs
  const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
  paymentMethods.forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.payment-tab-content').forEach(el => el.classList.add('hidden'));
      const activeBox = document.getElementById(`payment-content-${e.target.value}`);
      if (activeBox) activeBox.classList.remove('hidden');
    });
  });

  // Checkout Form Validation & Demo Order Placement
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const cart = window.getCart ? window.getCart() : [];
      if (cart.length === 0) {
        window.showToast('Your cart is empty. Add items before checking out.', 'warning');
        return;
      }

      // Read form values
      const name = document.getElementById('checkout-name')?.value.trim();
      const email = document.getElementById('checkout-email')?.value.trim();
      const phone = document.getElementById('checkout-phone')?.value.trim();
      const address = document.getElementById('checkout-address')?.value.trim();
      const city = document.getElementById('checkout-city')?.value.trim();
      const state = document.getElementById('checkout-state')?.value.trim();
      const pincode = document.getElementById('checkout-pincode')?.value.trim();
      const selectedPayment = document.querySelector('input[name="payment-method"]:checked')?.value || 'cod';

      // Validation
      if (!name || !email || !phone || !address || !city || !state || !pincode) {
        window.showToast('Please complete all required delivery fields.', 'error');
        return;
      }

      // Email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        window.showToast('Please enter a valid email address.', 'error');
        return;
      }

      // Indian Phone (10 digits)
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        window.showToast('Please enter a valid 10-digit mobile number.', 'error');
        return;
      }

      // Indian PIN code (6 digits)
      const cleanPin = pincode.replace(/\D/g, '');
      if (cleanPin.length !== 6) {
        window.showToast('Please enter a valid 6-digit Indian PIN code.', 'error');
        return;
      }

      const subtotal = window.getCartSubtotal ? window.getCartSubtotal() : 0;
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
      const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.rate) : 0;
      const total = subtotal - discount + shipping;

      // Construct Order Object
      const orderPayload = {
        customer: { name, email, phone: cleanPhone, address, city, state, pincode: cleanPin },
        items: [...cart],
        subtotal,
        discount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        shipping,
        total,
        paymentMethod: selectedPayment.toUpperCase()
      };

      // Create Order
      const confirmedOrder = window.createOrder ? window.createOrder(orderPayload) : null;

      // Clear the Cart after order creation
      if (window.clearCart) {
        window.clearCart();
      }

      // Display Order Confirmation Modal
      showOrderConfirmationModal(confirmedOrder || orderPayload);

      // Re-render empty cart
      renderCart();
    });
  }

  function showOrderConfirmationModal(order) {
    let modal = document.getElementById('order-confirmation-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'order-confirmation-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs';
      document.body.appendChild(modal);
    }

    const itemsHtml = order.items.map(item => `
      <div class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-medium text-slate-900">${item.name}</span>
          <span class="text-slate-500">×${item.quantity}</span>
        </div>
        <span class="font-semibold text-slate-800 tabular-nums">₹${item.price * item.quantity}</span>
      </div>
    `).join('');

    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 border border-slate-200 animate-in zoom-in-95 duration-200">
        <div class="text-center mb-6">
          <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </div>
          <span class="text-xs uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">College Project Demonstration</span>
          <h2 class="text-2xl font-bold text-slate-900 mt-2">Order Confirmed!</h2>
          <p class="text-xs text-slate-500 mt-1">Order ID: <strong class="text-slate-800 font-mono">${order.orderId || 'DS-DEMO-001'}</strong></p>
        </div>

        <div class="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
          <div class="text-xs font-bold uppercase text-slate-500 mb-2">Delivery Summary</div>
          <div class="text-xs text-slate-700 space-y-1">
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}</p>
            <p><strong>Phone:</strong> +91 ${order.customer.phone}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod} (Demo Mode)</p>
          </div>
        </div>

        <div class="mb-4 max-h-40 overflow-y-auto pr-1">
          <div class="text-xs font-bold uppercase text-slate-500 mb-2">Items Ordered (${order.items.length})</div>
          ${itemsHtml}
        </div>

        <div class="flex justify-between items-center text-sm font-bold border-t border-slate-200 pt-3 mb-6">
          <span>Final Amount:</span>
          <span class="text-indigo-600 text-lg tabular-nums">₹${order.total}</span>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-6">
          <strong>Important Note:</strong> This is a frontend project demonstration. No real money has been charged, and no real physical order has been dispatched.
        </div>

        <div class="flex gap-3">
          <button type="button" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition-colors" onclick="document.getElementById('order-confirmation-modal').remove(); window.location.href='shop.html';">
            Continue Shopping
          </button>
          <button type="button" class="py-2.5 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-xs transition-colors" onclick="document.getElementById('order-confirmation-modal').remove(); window.location.href='login.html';">
            View My Orders
          </button>
        </div>
      </div>
    `;

    document.body.style.overflow = 'hidden';
  }

  // Render Demonstration Order History
  function renderOrderHistory() {
    if (!orderHistoryContainer) return;

    const orders = window.getOrders ? window.getOrders() : [];
    if (orders.length === 0) {
      orderHistoryContainer.innerHTML = `
        <div class="text-center py-6 text-slate-400 text-xs">
          No previous demo orders found in this browser.
        </div>
      `;
      return;
    }

    orderHistoryContainer.innerHTML = orders.map(ord => `
      <div class="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-xs">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 text-xs">
          <div>
            <span class="font-bold text-slate-800 font-mono">${ord.orderId}</span>
            <span class="text-slate-400 mx-1.5">·</span>
            <span class="text-slate-500">${ord.createdAt}</span>
          </div>
          <span class="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">${ord.status}</span>
        </div>

        <div class="text-xs text-slate-600 mb-2">
          ${ord.items.map(i => `${i.name} (×${i.quantity})`).join(', ')}
        </div>

        <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
          <span class="text-slate-500">Payment: ${ord.paymentMethod}</span>
          <span class="font-bold text-slate-900 tabular-nums">Total: ₹${ord.total}</span>
        </div>
      </div>
    `).join('');
  }

  // Initial render
  renderCart();
});

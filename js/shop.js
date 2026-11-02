/**
 * Dhand Stationery - Shop Page Controller
 * Handles filtering (category, price range, in-stock, search),
 * sorting, pagination ("Load More"), Quick View, and Wishlist integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('products-grid');
  const searchInput = document.getElementById('shop-search-input');
  const sortSelect = document.getElementById('shop-sort-select');
  const priceRange = document.getElementById('price-range');
  const priceValueLabel = document.getElementById('price-range-val');
  const inStockCheckbox = document.getElementById('in-stock-checkbox');
  const categoryFiltersContainer = document.getElementById('category-filters');
  const resultsCountEl = document.getElementById('results-count');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const emptyState = document.getElementById('shop-empty-state');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');

  if (!productsGrid) return; // Not on shop page

  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let maxPrice = 1500;
  let inStockOnly = false;
  let currentSort = 'featured';
  let visibleCount = 12;
  const PAGE_SIZE = 12;

  // Read URL parameters (e.g. ?category=Pens%20%26%20Writing&search=notebook)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    currentCategory = urlParams.get('category');
  }
  if (urlParams.has('search')) {
    searchQuery = urlParams.get('search');
    if (searchInput) searchInput.value = searchQuery;
  }

  // Populate Categories Sidebar
  if (categoryFiltersContainer && window.DHAND_CATEGORIES) {
    const allBtn = document.createElement('button');
    allBtn.className = `w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${currentCategory === 'all' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`;
    allBtn.innerHTML = `<span>All Products</span><span class="text-xs text-slate-400 font-mono">${window.DHAND_PRODUCTS.length}</span>`;
    allBtn.addEventListener('click', () => {
      setCategory('all');
    });
    categoryFiltersContainer.appendChild(allBtn);

    window.DHAND_CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      const isActive = currentCategory.toLowerCase() === cat.name.toLowerCase();
      btn.className = `w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`;
      btn.innerHTML = `<span>${cat.name}</span><span class="text-xs text-slate-400 font-mono">${cat.count}</span>`;
      btn.addEventListener('click', () => {
        setCategory(cat.name);
      });
      categoryFiltersContainer.appendChild(btn);
    });
  }

  function setCategory(catName) {
    currentCategory = catName;
    visibleCount = PAGE_SIZE;

    // Update active UI classes
    if (categoryFiltersContainer) {
      const buttons = categoryFiltersContainer.querySelectorAll('button');
      buttons.forEach(btn => {
        const text = btn.querySelector('span')?.textContent;
        const isMatch = (catName === 'all' && text === 'All Products') || (text && text.toLowerCase() === catName.toLowerCase());
        if (isMatch) {
          btn.className = 'w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between bg-indigo-50 text-indigo-700';
        } else {
          btn.className = 'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between text-slate-600 hover:bg-slate-100';
        }
      });
    }

    // Update URL without full refresh
    const newUrl = new URL(window.location);
    if (catName === 'all') {
      newUrl.searchParams.delete('category');
    } else {
      newUrl.searchParams.set('category', catName);
    }
    window.history.replaceState({}, '', newUrl);

    applyFiltersAndRender();
  }

  // Filter & Sort Logic
  function getFilteredProducts() {
    let list = [...(window.DHAND_PRODUCTS || [])];

    // Category filter
    if (currentCategory && currentCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
      );
    }

    // Price filter
    list = list.filter(p => p.price <= maxPrice);

    // In Stock filter
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // Sorting
    switch (currentSort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }

  function renderCard(p) {
    const isWish = window.isInWishlist ? window.isInWishlist(p.id) : false;

    return `
      <div class="product-card group">
        <div class="product-image-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='images/doms-brush-pens.jpg';">
          
          <!-- Discount badge -->
          ${p.discount ? `
            <span class="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-xs">
              ${p.discount}% OFF
            </span>
          ` : ''}

          <!-- Wishlist Heart Button -->
          <button 
            type="button" 
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-500 flex items-center justify-center shadow-xs transition-colors ${isWish ? 'text-rose-500' : ''}" 
            data-wishlist-id="${p.id}"
            onclick="toggleWishlist('${p.id}')"
            aria-label="Save to wishlist"
          >
            <svg class="w-4 h-4" fill="${isWish ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>

          <!-- Quick View overlay button -->
          <div class="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
            <button 
              type="button" 
              class="w-full py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg backdrop-blur-xs shadow-md transition-colors"
              onclick="openQuickView('${p.id}')"
            >
              Quick View
            </button>
          </div>
        </div>

        <div class="p-4 flex flex-col flex-1 justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>${p.category}</span>
              <div class="flex items-center text-amber-500 text-xs">
                <span>★</span>
                <span class="ml-1 font-mono text-slate-600">${p.rating}</span>
              </div>
            </div>

            <h3 class="text-sm font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
              <a href="javascript:void(0)" onclick="openQuickView('${p.id}')" class="hover:underline">${p.name}</a>
            </h3>

            <p class="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              ${p.shortDescription}
            </p>
          </div>

          <div>
            <div class="flex items-baseline gap-2 mb-3">
              <span class="text-base font-bold text-slate-900 tabular-nums">₹${p.price}</span>
              ${p.originalPrice ? `<span class="text-xs text-slate-400 line-through tabular-nums">₹${p.originalPrice}</span>` : ''}
            </div>

            <div class="flex items-center gap-2">
              <button 
                type="button" 
                class="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                onclick="addToCart('${p.id}', 1)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                Add to Cart
              </button>
              
              <button 
                type="button" 
                class="sm:hidden p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs"
                onclick="openQuickView('${p.id}')"
                aria-label="View product details"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function applyFiltersAndRender() {
    const filtered = getFilteredProducts();
    const totalCount = filtered.length;

    if (resultsCountEl) {
      resultsCountEl.textContent = `Showing ${Math.min(visibleCount, totalCount)} of ${totalCount} products`;
    }

    if (totalCount === 0) {
      productsGrid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const toShow = filtered.slice(0, visibleCount);
    productsGrid.innerHTML = toShow.map(renderCard).join('');

    // Load More Visibility
    if (loadMoreBtn) {
      if (visibleCount < totalCount) {
        loadMoreBtn.classList.remove('hidden');
        loadMoreBtn.textContent = `Load More Products (${totalCount - visibleCount} remaining)`;
      } else {
        loadMoreBtn.classList.add('hidden');
      }
    }
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      visibleCount = PAGE_SIZE;
      applyFiltersAndRender();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFiltersAndRender();
    });
  }

  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      maxPrice = parseInt(e.target.value, 10);
      if (priceValueLabel) priceValueLabel.textContent = `₹${maxPrice}`;
      applyFiltersAndRender();
    });
  }

  if (inStockCheckbox) {
    inStockCheckbox.addEventListener('change', (e) => {
      inStockOnly = e.target.checked;
      applyFiltersAndRender();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      applyFiltersAndRender();
    });
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      currentCategory = 'all';
      searchQuery = '';
      maxPrice = 1500;
      inStockOnly = false;
      currentSort = 'featured';
      visibleCount = PAGE_SIZE;

      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'featured';
      if (priceRange) priceRange.value = 1500;
      if (priceValueLabel) priceValueLabel.textContent = '₹1500';
      if (inStockCheckbox) inStockCheckbox.checked = false;

      setCategory('all');
    });
  }

  // Initial render
  applyFiltersAndRender();
});

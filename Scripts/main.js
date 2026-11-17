/**
 * LOGIC CHÍNH CHO WEBSITE ĐẶC SẢN PHÚ YÊN
 * Bảng mã: Unicode (UTF-8)
 */

// 1. Quản lý Giỏ hàng (Cart State)
const CART_STORAGE_KEY = 'phuyen_cart';
const WISHLIST_STORAGE_KEY = 'phuyen_wishlist';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, quantity = 1, selectedUnit = null) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product) return;

  const cart = getCart();
  const unit = selectedUnit || product.unit;
  const existingIndex = cart.findIndex(item => item.id === productId && item.unit === unit);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      unit: unit,
      categoryName: product.categoryName,
      quantity: quantity
    });
  }

  saveCart(cart);
  playNotificationSound();
  showToast('Thành công!', `Đã thêm "${product.name}" vào giỏ hàng.`, 'success');
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const badgeEls = document.querySelectorAll('.cart-badge-count');
  badgeEls.forEach(el => el.textContent = totalCount);

  const priceEls = document.querySelectorAll('.cart-total-price');
  priceEls.forEach(el => {
    el.textContent = typeof formatPrice === 'function' ? formatPrice(totalPrice) : totalPrice.toLocaleString('vi-VN') + ' đ';
  });
}

function playNotificationSound() {
  try {
    const audio = new Audio('Sounds/bell-notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (e) {}
}

// 2. Wishlist
function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function toggleWishlist(productId) {
  let list = getWishlist();
  const exists = list.includes(productId);
  if (exists) {
    list = list.filter(id => id !== productId);
    showToast('Thông báo', 'Đã xóa sản phẩm khỏi danh sách yêu thích.', 'warning');
  } else {
    list.push(productId);
    showToast('Yêu thích!', 'Đã lưu sản phẩm vào danh sách yêu thích.', 'success');
  }
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const list = getWishlist();
  const els = document.querySelectorAll('.wishlist-badge-count');
  els.forEach(el => el.textContent = list.length);
}

// 3. Toast Notification
function showToast(title, message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconClass = type === 'success' ? 'fa-circle-check' : (type === 'danger' ? 'fa-circle-xmark' : 'fa-circle-info');

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <div class="toast-content">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 4. Tìm kiếm có gợi ý (Auto-suggest)
function initHeaderSearch() {
  const searchInput = document.getElementById('searchInput');
  const suggestBox = document.getElementById('searchSuggestBox');
  const searchForm = document.getElementById('headerSearchForm');
  const categorySelect = document.getElementById('searchCategorySelect');

  if (!searchInput || !suggestBox) return;

  searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    const cat = categorySelect ? categorySelect.value : 'all';

    if (query.length === 0) {
      suggestBox.innerHTML = '';
      suggestBox.classList.remove('active');
      return;
    }

    if (typeof PRODUCTS === 'undefined') return;

    let results = PRODUCTS.filter(p => {
      const matchCat = cat === 'all' || p.category === cat;
      const matchText = p.name.toLowerCase().includes(query) || 
                        p.origin.toLowerCase().includes(query) || 
                        p.categoryName.toLowerCase().includes(query);
      return matchCat && matchText;
    });

    if (results.length === 0) {
      suggestBox.innerHTML = `
        <div style="padding: 15px; text-align: center; color: #64748b; font-size: 13px;">
          Không tìm thấy đặc sản phù hợp với từ khóa "<strong>${query}</strong>"
        </div>
      `;
      suggestBox.classList.add('active');
      return;
    }

    let html = results.slice(0, 5).map(p => `
      <div class="suggest-item" onclick="window.location.href='product-detail.html?id=${p.id}'">
        <img src="${p.image}" alt="${p.name}">
        <div class="suggest-info">
          <h4>${p.name}</h4>
          <span>${formatPrice(p.price)}</span> • <small style="color:#64748b">${p.unit}</small>
        </div>
      </div>
    `).join('');

    suggestBox.innerHTML = html;
    suggestBox.classList.add('active');
  });

  // Ẩn dropdown khi click ngoài
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !suggestBox.contains(e.target)) {
      suggestBox.classList.remove('active');
    }
  });

  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const q = searchInput.value.trim();
      const cat = categorySelect ? categorySelect.value : 'all';
      window.location.href = `shop.html?search=${encodeURIComponent(q)}&cat=${cat}`;
    });
  }
}

// 5. Flash Sale Countdown Timer
function initFlashSaleCountdown() {
  const hEl = document.getElementById('fsHours');
  const mEl = document.getElementById('fsMinutes');
  const sEl = document.getElementById('fsSeconds');

  if (!hEl || !mEl || !sEl) return;

  function update() {
    const now = new Date();
    // Đếm ngược tới 23:59:59 mỗi ngày
    const target = new Date();
    target.setHours(23, 59, 59, 999);

    const diff = Math.max(0, target - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hEl.textContent = String(hours).padStart(2, '0');
    mEl.textContent = String(minutes).padStart(2, '0');
    sEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 6. Quick View Modal
function openQuickView(productId) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product) return;

  let modal = document.getElementById('quickViewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickViewModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-container" style="padding: 25px;">
      <button class="modal-close-btn" onclick="closeQuickView()"><i class="fa-solid fa-xmark"></i></button>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
        <div style="border-radius: 10px; overflow: hidden; background: #f8fafc; border: 1px solid #e2e8f0;">
          <img src="${product.image}" alt="${product.name}" style="width: 100%; height: auto;">
        </div>
        <div>
          <div style="margin-bottom: 8px;">
            <span class="badge badge-primary">${product.categoryName}</span>
            <span class="badge badge-secondary" style="margin-left: 5px;">${product.badge}</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">${product.name}</h2>
          <div style="color: #f59e0b; font-size: 13px; margin-bottom: 12px;">
            <i class="fa-solid fa-star"></i> ${product.rating.toFixed(1)} <span style="color: #64748b;">(${product.reviewCount} đánh giá)</span>
          </div>
          <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 15px;">
            <span style="font-size: 22px; font-weight: 900; color: #004e89;">${formatPrice(product.price)}</span>
            ${product.oldPrice ? `<span style="font-size: 14px; color: #94a3b8; text-decoration: line-through;">${formatPrice(product.oldPrice)}</span>` : ''}
          </div>
          <p style="font-size: 13px; color: #475569; margin-bottom: 15px; line-height: 1.5;">${product.description}</p>
          <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-size: 12px; margin-bottom: 15px;">
            <div><strong>Nguồn gốc:</strong> ${product.origin}</div>
            <div><strong>Quy cách:</strong> ${product.unit}</div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="addToCart('${product.id}'); closeQuickView();">
              <i class="fa-solid fa-cart-shopping"></i> Thêm vào giỏ
            </button>
            <a href="product-detail.html?id=${product.id}" class="btn btn-outline">Chi tiết sản phẩm →</a>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) modal.classList.remove('active');
}

// 7. Render Product Card HTML Helper
function renderProductCard(p) {
  return `
    <div class="product-card" data-id="${p.id}" data-category="${p.category}">
      <div class="product-thumb">
        <a href="product-detail.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </a>
        ${p.isGift ? `<span class="badge-gift"><i class="fa-solid fa-gift"></i> Quà Biếu</span>` : ''}
        ${p.badge ? `<span class="badge-season">${p.badge}</span>` : ''}
        <div class="product-actions">
          <button class="action-btn" title="Thêm vào giỏ" onclick="addToCart('${p.id}')">
            <i class="fa-solid fa-cart-plus"></i>
          </button>
          <button class="action-btn" title="Yêu thích" onclick="toggleWishlist('${p.id}')">
            <i class="fa-regular fa-heart"></i>
          </button>
          <button class="action-btn" title="Xem nhanh" onclick="openQuickView('${p.id}')">
            <i class="fa-regular fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-body">
        <span class="product-category">${p.categoryName}</span>
        <h3 class="product-title">
          <a href="product-detail.html?id=${p.id}">${p.name}</a>
        </h3>
        <div class="product-rating">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <span>(${p.reviewCount})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        ${p.isFlashSale ? `
          <div class="sale-progress">
            <div class="sale-progress-bar">
              <div class="sale-progress-fill" style="width: ${p.flashSaleQty || 75}%;"></div>
            </div>
            <span class="sale-progress-text">Đã bán ${p.flashSaleQty || 75}/100</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 8. Mobile Menu & Navigation Dropdown
function initNavInteractions() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  const deptBtn = document.getElementById('deptBtn');
  const deptDropdown = document.getElementById('deptDropdown');

  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-active');
    });
  }

  if (deptBtn && deptDropdown) {
    deptBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deptDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!deptBtn.contains(e.target) && !deptDropdown.contains(e.target)) {
        deptDropdown.classList.remove('show');
      }
    });
  }
}

// 9. Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
  updateWishlistBadge();
  initHeaderSearch();
  initFlashSaleCountdown();
  initNavInteractions();
});

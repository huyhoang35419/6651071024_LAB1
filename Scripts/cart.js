/**
 * LOGIC GIỎ HÀNG (SHOPPING CART & SHIPPING CALCULATOR)
 * Bảng mã: Unicode (UTF-8)
 */

let currentVoucher = null;
let packagingType = 'standard'; // 'standard', 'freezer', 'gift'
let selectedProvinceShipping = 25000; // Mặc định TP.HCM / Miền Trung

const VOUCHERS = {
  'PHUYEN10': { type: 'percent', value: 10, minOrder: 0, desc: 'Giảm 10% tổng đơn' },
  'XUNAU50K': { type: 'fixed', value: 50000, minOrder: 500000, desc: 'Giảm 50k cho đơn từ 500k' },
  'FREESHIP': { type: 'freeship', value: 0, minOrder: 0, desc: 'Miễn phí vận chuyển toàn quốc' }
};

const SHIPPING_RATES = {
  'phuyen': { name: 'Phú Yên (Nội tỉnh)', fee: 15000, carrier: 'Viettel Post Nội tỉnh (Giao 2-4h)' },
  'hcm': { name: 'TP. Hồ Chí Minh & Miền Nam', fee: 25000, carrier: 'Viettel Post / GHN Hỏa tốc (24h)' },
  'mientrung': { name: 'Đà Nẵng, Khánh Hòa, Bình Định', fee: 20000, carrier: 'Viettel Post Hỏa tốc (12-24h)' },
  'hanoi': { name: 'Hà Nội & Miền Bắc', fee: 35000, carrier: 'Viettel Post Bay Cấp Đông (24-36h)' },
  'taynguyen': { name: 'Tây Nguyên (Gia Lai, Đắk Lắk)', fee: 25000, carrier: 'Viettel Post (24h)' }
};

function renderCartPage() {
  const tableBody = document.getElementById('cartTableBody');
  const emptyCartState = document.getElementById('emptyCartState');
  const cartContentWrap = document.getElementById('cartContentWrap');

  if (!tableBody) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (emptyCartState) emptyCartState.style.display = 'block';
    if (cartContentWrap) cartContentWrap.style.display = 'none';
    return;
  }

  if (emptyCartState) emptyCartState.style.display = 'none';
  if (cartContentWrap) cartContentWrap.style.display = 'grid';

  let html = '';
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    html += `
      <tr>
        <td>
          <div class="cart-item-title">
            <div class="cart-item-thumb">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <span>Quy cách: ${item.unit}</span>
            </div>
          </div>
        </td>
        <td>
          <strong>${formatPrice(item.price)}</strong>
        </td>
        <td>
          <div class="qty-control" style="max-width: 130px;">
            <button class="qty-btn" onclick="updateCartItemQty(${index}, -1)">-</button>
            <input type="text" class="qty-input" value="${item.quantity}" readonly>
            <button class="qty-btn" onclick="updateCartItemQty(${index}, 1)">+</button>
          </div>
        </td>
        <td>
          <strong style="color: var(--primary); font-size: 16px;">${formatPrice(itemTotal)}</strong>
        </td>
        <td style="text-align: center;">
          <button class="cart-remove-btn" onclick="removeCartItem(${index})" title="Xóa món này">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
  calculateCartSummary();
}

function updateCartItemQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
    showToast('Thông báo', 'Đã xóa sản phẩm khỏi giỏ hàng.', 'warning');
  }

  saveCart(cart);
  renderCartPage();
}

function removeCartItem(index) {
  const cart = getCart();
  if (cart[index]) {
    const name = cart[index].name;
    cart.splice(index, 1);
    saveCart(cart);
    showToast('Đã xóa', `Đã bỏ "${name}" khỏi giỏ hàng.`, 'warning');
    renderCartPage();
  }
}

function calculateCartSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Phí đóng gói
  let packagingFee = 0;
  if (packagingType === 'freezer') {
    packagingFee = 0; // Khuyến mãi miễn phí đóng thùng xốp cấp đông
  } else if (packagingType === 'gift') {
    packagingFee = 30000; // Hộp quà biếu cao cấp kèm thiệp viết tay
  }

  // Phí ship dự kiến
  let shippingFee = selectedProvinceShipping;
  if (subtotal >= 500000) {
    shippingFee = 0; // Tự động freeship từ 500k
  }

  // Giảm giá voucher
  let discountAmount = 0;
  if (currentVoucher) {
    const v = VOUCHERS[currentVoucher];
    if (v) {
      if (v.type === 'percent') {
        discountAmount = (subtotal * v.value) / 100;
      } else if (v.type === 'fixed') {
        if (subtotal >= v.minOrder) {
          discountAmount = v.value;
        } else {
          showToast('Voucher không hợp lệ', `Mã này yêu cầu đơn hàng tối thiểu ${formatPrice(v.minOrder)}`, 'warning');
          currentVoucher = null;
        }
      } else if (v.type === 'freeship') {
        shippingFee = 0;
      }
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + packagingFee);

  // Lưu thông tin tổng kết vào localStorage để checkout sử dụng
  localStorage.setItem('phuyen_checkout_summary', JSON.stringify({
    subtotal,
    discountAmount,
    shippingFee,
    packagingFee,
    packagingType,
    voucherCode: currentVoucher,
    grandTotal
  }));

  // Cập nhật DOM
  const subtotalEl = document.getElementById('summarySubtotal');
  const discountEl = document.getElementById('summaryDiscount');
  const discountRow = document.getElementById('summaryDiscountRow');
  const shippingEl = document.getElementById('summaryShipping');
  const packageEl = document.getElementById('summaryPackaging');
  const totalEl = document.getElementById('summaryGrandTotal');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (discountRow) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = '-' + formatPrice(discountAmount);
    } else {
      discountRow.style.display = 'none';
    }
  }
  if (shippingEl) {
    shippingEl.textContent = shippingFee === 0 ? 'MIỄN PHÍ' : formatPrice(shippingFee);
  }
  if (packageEl) {
    packageEl.textContent = packagingFee === 0 ? '0 đ' : formatPrice(packagingFee);
  }
  if (totalEl) {
    totalEl.textContent = formatPrice(grandTotal);
  }
}

// Xử lý đổi tùy chọn đóng gói
function setPackagingType(type) {
  packagingType = type;
  document.querySelectorAll('.package-option').forEach(el => el.classList.remove('selected'));
  const target = document.getElementById(`pkg-${type}`);
  if (target) target.classList.add('selected');
  calculateCartSummary();
}

// Xử lý đổi tỉnh thành tính phí ship GHN / Viettel Post
function handleProvinceChange(provinceKey) {
  if (SHIPPING_RATES[provinceKey]) {
    selectedProvinceShipping = SHIPPING_RATES[provinceKey].fee;
    const carrierNote = document.getElementById('shippingCarrierNote');
    if (carrierNote) {
      carrierNote.innerHTML = `<i class="fa-solid fa-truck-fast"></i> Đơn vị: <strong>${SHIPPING_RATES[provinceKey].carrier}</strong>`;
    }
    calculateCartSummary();
  }
}

// Xử lý áp dụng mã Voucher
function applyCouponCode() {
  const input = document.getElementById('couponCodeInput');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    showToast('Nhắc nhở', 'Vui lòng nhập mã giảm giá.', 'warning');
    return;
  }

  if (VOUCHERS[code]) {
    currentVoucher = code;
    showToast('Thành công!', `Đã áp dụng mã "${code}": ${VOUCHERS[code].desc}`, 'success');
    calculateCartSummary();
  } else {
    showToast('Lỗi', 'Mã giảm giá không tồn tại hoặc đã hết hạn.', 'danger');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('cartTableBody')) {
    renderCartPage();

    const provSelect = document.getElementById('shippingProvinceSelect');
    if (provSelect) {
      provSelect.addEventListener('change', function() {
        handleProvinceChange(this.value);
      });
    }

    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', applyCouponCode);
    }
  }
});

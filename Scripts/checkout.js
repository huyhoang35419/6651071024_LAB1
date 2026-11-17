/**
 * LOGIC THANH TOÁN (CHECKOUT & VIETQR PAYMENT)
 * Bảng mã: Unicode (UTF-8)
 */

let selectedPaymentMethod = 'cod'; // 'cod', 'vietqr', 'momo', 'card'

function initCheckoutPage() {
  const summaryRaw = localStorage.getItem('phuyen_checkout_summary');
  const cart = getCart();

  if (cart.length === 0) {
    alert('Giỏ hàng của bạn đang trống! Hãy thêm đặc sản trước khi thanh toán.');
    window.location.href = 'shop.html';
    return;
  }

  let summary = {
    subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    discountAmount: 0,
    shippingFee: 25000,
    packagingFee: 0,
    grandTotal: 0
  };

  if (summaryRaw) {
    try {
      summary = JSON.parse(summaryRaw);
    } catch (e) {}
  }

  if (summary.subtotal >= 500000) summary.shippingFee = 0;
  summary.grandTotal = summary.subtotal - summary.discountAmount + summary.shippingFee + summary.packagingFee;

  // Render items in order review
  const itemsContainer = document.getElementById('checkoutItemsReview');
  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${item.image}" alt="${item.name}" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0;">
          <div>
            <strong style="color: #0f172a;">${item.name}</strong>
            <div style="color: #64748b; font-size: 12px;">SL: ${item.quantity} x ${formatPrice(item.price)}</div>
          </div>
        </div>
        <strong>${formatPrice(item.price * item.quantity)}</strong>
      </div>
    `).join('');
  }

  // Render totals
  const subtotalEl = document.getElementById('coSubtotal');
  const discountEl = document.getElementById('coDiscount');
  const shippingEl = document.getElementById('coShipping');
  const totalEl = document.getElementById('coGrandTotal');
  const qrAmountEl = document.getElementById('vietqrAmount');

  if (subtotalEl) subtotalEl.textContent = formatPrice(summary.subtotal);
  if (discountEl) discountEl.textContent = '-' + formatPrice(summary.discountAmount);
  if (shippingEl) shippingEl.textContent = summary.shippingFee === 0 ? 'MIỄN PHÍ' : formatPrice(summary.shippingFee);
  if (totalEl) totalEl.textContent = formatPrice(summary.grandTotal);
  if (qrAmountEl) qrAmountEl.textContent = formatPrice(summary.grandTotal);

  // Handle Payment Method selections
  const paymentItems = document.querySelectorAll('.payment-method-item');
  paymentItems.forEach(item => {
    item.addEventListener('click', function() {
      paymentItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      selectedPaymentMethod = this.getAttribute('data-method');

      const radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Handle Checkout Form Submission
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const fullname = document.getElementById('coFullname').value.trim();
      const phone = document.getElementById('coPhone').value.trim();
      const email = document.getElementById('coEmail').value.trim();
      const province = document.getElementById('coProvince').value;
      const address = document.getElementById('coAddress').value.trim();
      const note = document.getElementById('coNote').value.trim();

      if (!fullname || !phone || !address) {
        alert('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!');
        return;
      }

      // Generate Order ID (e.g. PY-8869)
      const orderId = 'PY-' + Math.floor(1000 + Math.random() * 9000);
      const orderDate = new Date().toLocaleString('vi-VN');

      const newOrder = {
        orderId: orderId,
        date: orderDate,
        customer: { fullname, phone, email, province, address, note },
        items: cart,
        summary: summary,
        paymentMethod: selectedPaymentMethod,
        status: 'Đang xử lý',
        timeline: [
          { status: 'Đặt hàng thành công', time: orderDate, completed: true, note: 'Khách hàng hoàn tất đơn online' },
          { status: 'Xác nhận đơn hàng', time: 'Dự kiến trong 15 phút', completed: false, note: 'Nhân viên Tuy Hòa gọi xác nhận' },
          { status: 'Đóng gói thùng xốp đông lạnh', time: 'Dự kiến', completed: false, note: 'Cấp đông giữ nhiệt 48h' },
          { status: 'Bàn giao Viettel Post', time: 'Dự kiến', completed: false, note: 'Vận chuyển hỏa tốc' },
          { status: 'Giao hàng thành công', time: 'Dự kiến', completed: false, note: 'Kiểm tra hàng trước khi thanh toán' }
        ]
      };

      // Save to localStorage orders list
      let orders = [];
      try {
        const rawOrders = localStorage.getItem('phuyen_orders');
        orders = rawOrders ? JSON.parse(rawOrders) : [];
      } catch (err) {}

      orders.unshift(newOrder);
      localStorage.setItem('phuyen_orders', JSON.stringify(orders));

      // Add loyalty points (1 điểm cho mỗi 10.000đ)
      const currentPoints = parseInt(localStorage.getItem('phuyen_points') || '0', 10);
      const earnedPoints = Math.floor(summary.grandTotal / 10000);
      localStorage.setItem('phuyen_points', currentPoints + earnedPoints);

      // Clear Cart
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem('phuyen_checkout_summary');

      // Show congratulations & Redirect
      showOrderSuccessModal(orderId, summary.grandTotal);
    });
  }
}

function showOrderSuccessModal(orderId, total) {
  let modal = document.getElementById('orderSuccessModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'orderSuccessModal';
    modal.className = 'modal-overlay active';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-container" style="max-width: 520px; text-align: center; padding: 35px 25px;">
      <div style="width: 70px; height: 70px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px;">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h2 style="font-size: 24px; font-weight: 800; color: #004e89; margin-bottom: 10px;">ĐẶT HÀNG THÀNH CÔNG!</h2>
      <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
        Cảm ơn quý khách đã ủng hộ đặc sản quê hương Xứ Nẫu Phú Yên. Mã đơn hàng của bạn là:
      </p>
      <div style="background: #f1f5f9; padding: 12px 20px; border-radius: 8px; font-size: 20px; font-weight: 900; color: #e36414; letter-spacing: 2px; margin-bottom: 20px;">
        ${orderId}
      </div>
      <p style="font-size: 13px; color: #475569; margin-bottom: 25px;">
        Nhân viên cửa hàng sẽ liên hệ qua điện thoại để xác nhận đơn và tiến hành đóng thùng xốp cấp đông hỏa tốc.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <a href="order-tracking.html?orderId=${orderId}" class="btn btn-primary">
          <i class="fa-solid fa-route"></i> Theo dõi đơn hàng
        </a>
        <a href="index.html" class="btn btn-outline">Về trang chủ</a>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('checkoutForm')) {
    initCheckoutPage();
  }
});

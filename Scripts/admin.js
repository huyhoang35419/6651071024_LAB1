/**
 * LOGIC QUẢN TRỊ ADMIN (MỤC 4 BÀI TẬP)
 * Bảng mã: Unicode (UTF-8)
 */

let adminProducts = [];
let adminOrders = [];

function initAdminDashboard() {
  // 1. Tải danh sách sản phẩm từ PRODUCTS hoặc localStorage
  try {
    const customProds = localStorage.getItem('phuyen_custom_products');
    adminProducts = customProds ? JSON.parse(customProds) : (typeof PRODUCTS !== 'undefined' ? [...PRODUCTS] : []);
  } catch (e) {
    adminProducts = typeof PRODUCTS !== 'undefined' ? [...PRODUCTS] : [];
  }

  // 2. Tải danh sách đơn hàng
  try {
    const rawOrders = localStorage.getItem('phuyen_orders');
    adminOrders = rawOrders ? JSON.parse(rawOrders) : [
      {
        orderId: 'PY-9201',
        date: '17/11/2026, 09:30',
        customer: { fullname: 'Lê Văn Hùng', phone: '0912345678', address: 'Quận 1, TP. Hồ Chí Minh' },
        summary: { grandTotal: 730000 },
        paymentMethod: 'vietqr',
        status: 'Đang giao'
      },
      {
        orderId: 'PY-8840',
        date: '16/11/2026, 15:45',
        customer: { fullname: 'Nguyễn Thị Mai', phone: '0987654321', address: 'Cầu Giấy, Hà Nội' },
        summary: { grandTotal: 1250000 },
        paymentMethod: 'cod',
        status: 'Hoàn thành'
      }
    ];
  } catch (e) {
    adminOrders = [];
  }

  renderAdminStats();
  renderProductsTable();
  renderOrdersTable();
  drawRevenueChart();
}

function renderAdminStats() {
  const totalRevenue = adminOrders.reduce((sum, ord) => sum + (ord.summary ? ord.summary.grandTotal : 0), 28450000);
  const totalOrders = adminOrders.length + 42;
  const totalProducts = adminProducts.length;

  const revEl = document.getElementById('adminStatRevenue');
  const ordEl = document.getElementById('adminStatOrders');
  const prodEl = document.getElementById('adminStatProducts');
  const convEl = document.getElementById('adminStatConversion');

  if (revEl) revEl.textContent = formatPrice(totalRevenue);
  if (ordEl) ordEl.textContent = totalOrders;
  if (prodEl) prodEl.textContent = totalProducts;
  if (convEl) convEl.textContent = '4.2%';
}

function renderProductsTable() {
  const tbody = document.getElementById('adminProductsTbody');
  if (!tbody) return;

  tbody.innerHTML = adminProducts.map((p, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${p.image}" alt="${p.name}" style="width:38px; height:38px; border-radius:6px; object-fit:cover;">
          <strong>${p.name}</strong>
        </div>
      </td>
      <td>${p.categoryName || p.category}</td>
      <td><strong>${formatPrice(p.price)}</strong></td>
      <td>
        ${p.inStock 
          ? (p.isSeasonal ? '<span class="badge badge-secondary">Mùa vụ</span>' : '<span class="badge badge-success">Còn hàng</span>')
          : '<span class="badge badge-danger">Hết hàng</span>'}
      </td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="toggleStockStatus(${idx})" title="Đổi trạng thái kho">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
        <button class="btn btn-sm" style="background:#fee2e2; color:#dc2626; border:none;" onclick="deleteAdminProduct(${idx})" title="Xóa">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function toggleStockStatus(idx) {
  if (!adminProducts[idx]) return;
  if (adminProducts[idx].inStock && !adminProducts[idx].isSeasonal) {
    adminProducts[idx].isSeasonal = true;
  } else if (adminProducts[idx].isSeasonal) {
    adminProducts[idx].inStock = false;
    adminProducts[idx].isSeasonal = false;
  } else {
    adminProducts[idx].inStock = true;
    adminProducts[idx].isSeasonal = false;
  }

  localStorage.setItem('phuyen_custom_products', JSON.stringify(adminProducts));
  renderProductsTable();
  showToast('Cập nhật', `Đã đổi trạng thái cho "${adminProducts[idx].name}"`, 'success');
}

function deleteAdminProduct(idx) {
  if (confirm(`Bạn có chắc muốn xóa "${adminProducts[idx].name}"?`)) {
    adminProducts.splice(idx, 1);
    localStorage.setItem('phuyen_custom_products', JSON.stringify(adminProducts));
    renderProductsTable();
    showToast('Đã xóa', 'Đã xóa sản phẩm khỏi danh mục quản trị.', 'warning');
  }
}

function openAddProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) modal.classList.add('active');
}

function closeAddProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) modal.classList.remove('active');
}

function handleAddProductSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('newProdName').value.trim();
  const price = parseInt(document.getElementById('newProdPrice').value, 10);
  const cat = document.getElementById('newProdCat').value;
  const unit = document.getElementById('newProdUnit').value.trim();
  const origin = document.getElementById('newProdOrigin').value.trim();

  const newP = {
    id: 'sp-' + (adminProducts.length + 1),
    name: name,
    category: cat,
    categoryName: cat === 'hai-san' ? 'Hải sản đặc trưng' : (cat === 'thit-nui-rung' ? 'Thịt & Núi rừng' : 'Gia vị & Bánh kẹo'),
    price: price,
    image: 'Images/sp-combo-qua-bieu.svg',
    badge: 'MỚI VỀ',
    inStock: true,
    isSeasonal: false,
    unit: unit || 'Hộp 500g',
    origin: origin || 'Tuy Hòa, Phú Yên',
    rating: 5.0,
    reviewCount: 1,
    description: `Đặc sản Phú Yên chính gốc tuyển chọn: ${name}.`
  };

  adminProducts.unshift(newP);
  localStorage.setItem('phuyen_custom_products', JSON.stringify(adminProducts));
  closeAddProductModal();
  renderProductsTable();
  showToast('Thành công!', `Đã thêm sản phẩm "${name}" thành công!`, 'success');
}

function renderOrdersTable() {
  const tbody = document.getElementById('adminOrdersTbody');
  if (!tbody) return;

  tbody.innerHTML = adminOrders.map((ord, idx) => `
    <tr>
      <td><strong>${ord.orderId}</strong></td>
      <td>${ord.customer ? ord.customer.fullname : 'Khách vãng lai'}</td>
      <td>${ord.customer ? ord.customer.phone : '-'}</td>
      <td><strong>${formatPrice(ord.summary ? ord.summary.grandTotal : 0)}</strong></td>
      <td>
        <span class="badge ${ord.status === 'Hoàn thành' ? 'badge-success' : (ord.status === 'Đang giao' ? 'badge-primary' : 'badge-secondary')}">
          ${ord.status}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="changeOrderStatus(${idx})" title="Cập nhật trạng thái">
          <i class="fa-solid fa-truck"></i> Cập nhật
        </button>
        <button class="btn btn-sm btn-secondary" onclick="printBill('${ord.orderId}')" title="In vận đơn">
          <i class="fa-solid fa-print"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function changeOrderStatus(idx) {
  if (!adminOrders[idx]) return;
  const current = adminOrders[idx].status;
  if (current === 'Đang xử lý') adminOrders[idx].status = 'Đang giao';
  else if (current === 'Đang giao') adminOrders[idx].status = 'Hoàn thành';
  else adminOrders[idx].status = 'Đang xử lý';

  localStorage.setItem('phuyen_orders', JSON.stringify(adminOrders));
  renderOrdersTable();
  showToast('Cập nhật đơn', `Đơn hàng ${adminOrders[idx].orderId} đã đổi sang "${adminOrders[idx].status}"`, 'success');
}

function printBill(orderId) {
  alert(`Chuẩn bị in Vận đơn & Tem cấp đông thùng xốp cho Đơn hàng: ${orderId}\nĐơn vị vận chuyển: Viettel Post Hỏa tốc.\n(Chức năng in vận đơn mẫu sẵn sàng!)`);
}

// Vẽ biểu đồ doanh thu bằng HTML5 Canvas thuần (Không phụ thuộc thư viện ngoài)
function drawRevenueChart() {
  const canvas = document.getElementById('adminRevenueCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Dữ liệu doanh thu 6 tháng gần nhất (Triệu đồng)
  const months = ['Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11'];
  const data = [38, 52, 45, 68, 74, 92]; // Tăng trưởng đều đặn

  const maxVal = 100;
  const padding = 45;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;

  // Trục tọa độ & lưới mờ
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${100 - i * 25} tr`, 10, y + 4);
  }

  // Vẽ các cột doanh thu
  const barWidth = 35;
  const step = chartW / months.length;

  data.forEach((val, i) => {
    const x = padding + i * step + (step - barWidth) / 2;
    const barH = (val / maxVal) * chartH;
    const y = padding + chartH - barH;

    // Gradient cột
    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, '#004e89');
    grad.addColorStop(1, '#0284c7');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
    ctx.fill();

    // Text giá trị
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${val}tr`, x + barWidth / 2, y - 6);

    // Text nhãn tháng
    ctx.fillStyle = '#64748b';
    ctx.fillText(months[i], x + barWidth / 2, h - 15);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('adminRevenueCanvas')) {
    initAdminDashboard();

    const addForm = document.getElementById('addProductForm');
    if (addForm) {
      addForm.addEventListener('submit', handleAddProductSubmit);
    }
  }
});

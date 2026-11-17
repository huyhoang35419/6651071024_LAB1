# HƯỚNG DẪN BÀI THỰC HÀNH LAB 1 - THIẾT KẾ WEB
## ĐỀ TÀI: WEBSITE THƯƠNG MẠI ĐIỆN TỬ ĐẶC SẢN PHÚ YÊN (HỒN QUÊ XỨ NẪU)
**MSSV:** `6651071024`  
**Môn:** Thiết Kế Web - GV: Nguyễn Thiện Dương

---

### 1. Cấu Trúc Thư Mục Nộp Bài (Đúng 100% Theo File PDF Yêu Cầu)
```text
6651071024_LAB1/
├── index.html                (Trang chủ: Hero slider, Danh mục, Flash sale, Best sellers, Audio sóng biển, Video làng nghề, Blog)
├── shop.html                 (Cửa hàng: Sidebar danh mục, Lọc khoảng giá, Lọc quà biếu/OCOP, Sort, View mode)
├── product-detail.html       (Chi tiết sản phẩm: Gallery ảnh, Video, Trọng lượng, Hướng dẫn chế biến chuẩn vị, Reviews)
├── cart.html                 (Giỏ hàng: Tính phí ship GHN/Viettel Post theo tỉnh, Mã voucher, Đóng thùng xốp cấp đông 48h)
├── checkout.html             (Thanh toán: Form địa chỉ, Chọn COD, VietQR tự động, MoMo, Thẻ quốc tế)
├── order-tracking.html       (Theo dõi đơn hàng: Tiến trình 5 bước trực quan, Lịch sử mua hàng, Tích điểm thành viên)
├── blog.html                 (Câu chuyện Xứ Nẫu: Danh sách bài viết văn hóa ẩm thực Phú Yên)
├── blog-detail.html          (Chi tiết bài viết: Công thức nướng bò 1 nắng, tiềm mắt cá ngừ thố đất, nước mắm Gành Đỏ)
├── about.html                (Về chúng tôi: Chứng nhận VSATTP, OCOP 4 sao tỉnh Phú Yên, Hợp tác xã ngư dân Tuy Hòa)
├── contact.html              (Liên hệ: Showroom Tuy Hòa, chi nhánh TP.HCM, Form liên hệ, Bản đồ, FAQ)
├── admin.html                (Bảng quản trị Mục 4: CRUD sản phẩm, kho hàng, duyệt đơn, in vận đơn, biểu đồ canvas doanh thu)
├── Images/                   (Lưu toàn bộ các file ảnh SVG sắc nét, logo, banners, huy hiệu OCOP, VSATTP, avatar)
├── Scripts/                  (Lưu các file Javascript: products-data.js, main.js, cart.js, checkout.js, admin.js)
├── Sounds/                   (Lưu các file audio .mp3: ocean-waves.mp3 - tiếng sóng biển, bell-notification.mp3)
├── Styles/                   (Lưu các file .css: style.css, responsive.css)
└── Videos/                   (Lưu file video .mp4: phu-yen-specialty.mp4)
```

---

### 2. Các Chức Năng Nổi Bật Đã Xây Dựng
1. **Giao diện chuẩn phong cách Organi:**
   - Top bar đầy đủ hotline, email, cam kết thùng xốp 48h.
   - Main header với thanh tìm kiếm Auto-suggest gợi ý nhanh sản phẩm, giỏ hàng badge cập nhật số lượng và tổng tiền tức thời.
   - Menu danh mục thả xuống (All Departments) mượt mà.
   - Bảng màu xanh dương biển Vũng Rô (`#004e89`) kết hợp vàng nắng/cam đất miền Trung (`#f77f00`).
2. **Flash Sale thời gian thực:**
   - Bộ đếm ngược Countdown Timer (Giờ : Phút : Giây) đến cuối ngày.
   - Thanh tiến độ hiển thị số lượng sản phẩm đã bán.
3. **Giỏ hàng & Đóng gói chuyên dụng:**
   - Tăng/giảm số lượng món hàng, xóa món hàng trực quan.
   - Tùy chọn đóng thùng xốp cấp đông 48h hoặc đóng hộp quà biếu cao cấp kèm thiệp viết tay.
   - Tích hợp tính phí vận chuyển Viettel Post / GHN theo tỉnh thành nhận hàng (Nội tỉnh Phú Yên 15k, TP.HCM 25k, Hà Nội 35k; Miễn phí từ 500k).
   - Áp dụng các mã voucher: `PHUYEN10` (-10%), `XUNAU50K` (-50k cho đơn từ 500k), `FREESHIP`.
4. **Thanh toán & Mã VietQR tự động:**
   - Tích hợp mã VietQR tự sinh số tiền tương ứng đơn hàng, số tài khoản MBBank và nội dung chuyển khoản tự động.
   - Đặt hàng xong chuyển ngay sang mã đơn hàng kèm tích điểm thành viên.
5. **Đặc tả Back-end dành cho Quản trị viên (Admin Portal):**
   - Truy cập qua menu hoặc mở trực tiếp `admin.html`.
   - Dashboard biểu đồ doanh thu theo tháng trực quan bằng HTML5 Canvas thuần.
   - Quản lý sản phẩm: Xem bảng, đổi trạng thái kho (Còn hàng / Mùa vụ / Hết hàng), xóa sản phẩm, modal thêm sản phẩm mới.
   - Quản lý đơn hàng: Đổi trạng thái (Đang xử lý -> Đang giao -> Hoàn thành), nút In vận đơn mẫu.
   - Quản lý mã khuyến mãi và phân nhóm khách hàng (Khách mới, Khách VIP).
6. **Âm thanh & Video thực tế:**
   - Audio tiếng sóng biển Tuy Hòa thư giãn đặt trong thư mục `Sounds/`.
   - Video cận cảnh quy trình đặc sản đặt trong thư mục `Videos/`.

---

### 3. Hướng Dẫn Deploy Lên GitHub Pages (Theo Yêu Cầu 3 & 4 Của GV)
1. **Khởi tạo Git và đẩy lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Khoi tao du an website Dac San Phu Yen - LAB1"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-github-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
2. **Bật GitHub Pages:**
   - Trên GitHub, vào mục **Settings** của repository -> chọn thẻ **Pages** ở thanh menu bên trái.
   - Tại mục **Build and deployment** -> **Source**, chọn nhánh `main` và thư mục `/(root)`.
   - Bấm **Save**. Sau 1-2 phút, bạn sẽ nhận được đường link website:  
     `https://<tai-khoan-cua-ban>.github.io/<ten-repo>/`

---

### 4. Hướng Dẫn Nộp Bài (Theo Mục 6 Của PDF)
1. Tạo 1 file `.pdf`:
   - Ghi rõ Họ tên: `[Họ và tên của bạn]`
   - Mã số sinh viên: `6651071024`
   - Link GitHub Repository: `https://github.com/...`
   - Link trang web đã deploy thành công trên GitHub Pages: `https://...github.io/...`
2. Quay video demo (1 - 3 phút) thao tác các chức năng: xem trang chủ, lọc shop, thêm giỏ hàng, áp mã giảm giá, đặt hàng thanh toán VietQR, theo dõi đơn và trang admin.
3. Nộp file `.pdf` lên LMS của GV Nguyễn Thiện Dương.

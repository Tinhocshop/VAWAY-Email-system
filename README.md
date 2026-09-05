# VAWAY Mail Server & SaaS Workspace

**VAWAY Mail Server** là nền tảng quản trị và vận hành Email doanh nghiệp đa khách hàng (Multi-Tenant SaaS Email Platform) theo tên miền riêng (`user@domain.com`), kết hợp giao diện **Webmail hiện đại, trực quan và quen thuộc theo phong cách Gmail**.

---

## 🌟 Trải nghiệm Webmail Chuẩn Phong cách Gmail

Hệ thống mang lại trải nghiệm người dùng tối ưu năng suất làm việc hằng ngày với đầy đủ các tính năng đặc trưng của Gmail:

1. **Phân loại Thư Thông minh (Tabs Category):**
   - **Chính (Primary):** Các thư từ cá nhân, đồng nghiệp và công việc quan trọng.
   - **Xã hội (Social):** Thông báo từ mạng xã hội, diễn đàn và cộng đồng.
   - **Quảng cáo (Promotions):** Bản tin, khuyến mãi và thông báo tiếp thị.

2. **Cửa sổ Soạn thư Nổi Đa nhiệm (Floating Docked Compose):**
   - Soạn thảo thư trong cửa sổ nổi gắn ở góc phải màn hình, không làm gián đoạn việc đọc hay tra cứu các email khác.
   - Hỗ trợ phóng to, thu nhỏ, đính kèm tệp, định dạng văn bản và chế độ gửi thư bảo mật.

3. **Tìm kiếm & Điều hướng Nhanh (Smart Search Bar):**
   - Thanh tìm kiếm bo tròn trung tâm cho phép lọc nhanh email theo người gửi, tiêu đề, nhãn (label) và nội dung thư.

4. **Hành động Nhanh & Tương tác Di chuột (Quick Hover Actions):**
   - Thao tác 1 chạm khi di chuột qua từng email: Đánh dấu Đã đọc/Chưa đọc, Xóa nhanh (Trash), Tạm ẩn (Snooze), Đánh dấu sao (Starred) và Đánh dấu thư quan trọng (Priority Bookmark).

5. **Xác thực An toàn & Phòng chống Thư rác (Email Security Verification):**
   - Tự động kiểm tra và hiển thị huy hiệu xác minh chuẩn **SPF, DKIM, DMARC** và điểm số Spam Score ngay trong chi tiết thư.

---

## ⚡ Tiện ích Đồng hành 1-Click (Productivity Companion Bar)

Thay thế các tiện ích dư thừa bằng các công cụ thiết thực phục vụ công việc:

- 👥 **Sổ danh bạ Đồng nghiệp (Company Directory):** Xem danh sách thành viên nội bộ trong công ty. **1-Click** vào tên đồng nghiệp để tự động mở cửa sổ soạn thư gửi ngay đến người đó.
- 🛡️ **Bí danh Ẩn danh Tức thì (1-Click Shield Alias):** Tự động tạo email bí danh ngẫu nhiên (dạng SimpleLogin/Anonmail) trỏ về hòm thư chính để đăng ký dịch vụ ngoài mà không lo lộ email gốc.
- 📱 **Tải Profile Apple Mail (.mobileconfig):** Tải ngay tệp cấu hình tự động chuẩn XML để cài đặt tài khoản vào iPhone, iPad, macOS chỉ với 1 lần chạm.
- ⚡ **Tra cứu Cổng Kết nối & DNS:** Sao chép nhanh cấu hình cổng IMAP 993 / SMTP 465 SSL và chuỗi bản ghi DNS SPF/DKIM của tên miền.

---

## 🏢 Quản trị Hệ thống Toàn diện (Admin Control Suite)

- **Quản trị Tên miền (Domain Management):** Cấp phát khóa mã hóa DKIM 2048-bit, hướng dẫn cài đặt bản ghi MX, SPF, DMARC, TLSA.
- **Quản lý Hòm thư & Nhân viên (Users & Mailboxes):** Phân bổ dung lượng (Quota), chuyển tiếp thư (Forwarding), phản hồi tự động (Auto-reply), chống Open Relay.
- **Định tuyến & Chuyển tiếp (Relay Domains):** Hỗ trợ cấu hình chuyển tiếp qua SMTP Smarthost bảo mật.
- **Quản trị viên & API Tokens:** Phân quyền quản trị viên phụ và cấp mã xác thực API Token cho ứng dụng bên thứ 3.
- **Trình tạo Cấu hình Docker (Docker Setup Generator):** Tự động sinh file `docker-compose.yml` và biến môi trường `vaway.env` sẵn sàng triển khai thực tế.

---

## 📁 Cấu trúc Thư mục Dự án

```
/
├── .env.example            # Cấu hình biến môi trường chuẩn (Process & Security)
├── index.html              # Entry HTML của ứng dụng
├── metadata.json           # Metadata ứng dụng
├── package.json            # Thư viện React 18, Vite, Tailwind CSS, Lucide icons
├── public/                 # Tài nguyên tĩnh
├── src/                    # Toàn bộ mã nguồn giao diện & logic
│   ├── App.tsx             # Điều hướng & Layout chính
│   ├── components/         # Các View quản trị, WebmailView (Gmail style), Sidebar, Navbar
│   ├── context/            # VawayMailContext (Quản lý State tập trung)
│   ├── data/               # Dữ liệu khởi tạo mẫu
│   └── types.ts            # Định nghĩa Interface & TypeScript Types
├── SAAS_SPECIFICATION.md   # Đặc tả Kỹ thuật & Lộ trình 5 Phase phát triển SaaS
├── SYSTEM_GUIDE.md         # Hướng dẫn Kỹ thuật, An toàn Thông tin & Nhật ký Xử lý Lỗi
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite & Tailwind
```

---

## 📖 Tài liệu Kỹ thuật Chi tiết

- **[Đặc tả SaaS & Lộ trình 5 Phase](./SAAS_SPECIFICATION.md)**: Chi tiết kiến trúc Multi-tenancy, Database schema, API Gateway và kế hoạch từng giai đoạn.
- **[Hướng dẫn Hệ thống & Bảo mật](./SYSTEM_GUIDE.md)**: Giải nghĩa các biến môi trường quan trọng, nguyên tắc chống Open Relay và nhật ký kỹ thuật.

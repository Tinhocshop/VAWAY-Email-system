# VAWAY Admin Suite & SaaS Workspace

Hệ thống quản trị và vận hành Email doanh nghiệp đa khách hàng (Multi-Tenant SaaS Email Platform) theo tên miền riêng dạng `user@domain.com`.

## 📁 Cấu trúc Dự án (Cleaned Project Structure)

```
/
├── .env.example            # Cấu hình biến môi trường chuẩn
├── index.html              # Entry HTML
├── metadata.json           # Metadata ứng dụng AI Studio
├── package.json            # Thư viện React 18, Tailwind, Lucide icons
├── public/                 # Tài nguyên tĩnh (Logo)
├── src/                    # Toàn bộ mã nguồn giao diện & logic ứng dụng
│   ├── App.tsx             # Điều hướng & View layout
│   ├── components/         # Các View quản trị, Webmail & DNS Wizard
│   ├── context/            # Quản lý State tập trung
│   ├── data/               # Dữ liệu khởi tạo
│   └── types.ts            # Định nghĩa TypeScript Types
├── SAAS_SPECIFICATION.md   # Tài liệu Đặc tả Kỹ thuật & Lộ trình 5 Phase phát triển SaaS
├── SYSTEM_GUIDE.md         # Hướng dẫn Kỹ thuật, Bảo mật, Biến môi trường & Xử lý lỗi
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite & Tailwind
```

## 🚀 Tính năng Nổi bật

1. **Quản trị Tên miền (Domain Management):** Cấp phát DKIM 2048-bit, Wizard bản ghi DNS (SPF, DMARC, MX, TLSA).
2. **Quản trị Hòm thư (Mailboxes):** Thiết lập Quota, Chuyển tiếp (Forwarding), Tự động trả lời (Auto-reply), Lọc thư rác.
3. **Bí danh Ẩn danh (Anonmail):** Hỗ trợ tạo alias định tuyến và bảo vệ email gốc (SimpleLogin style).
4. **Client Setup & Apple Profile:** Hướng dẫn kết nối Outlook, Thunderbird và tải trực tiếp file cấu hình `.mobileconfig` cho iOS / macOS.
5. **Interactive Webmail:** Soạn thảo, gửi nhận thư, thử nghiệm bộ lọc nội bộ.
6. **Docker Setup Generator:** Tự động sinh file cấu hình production `vaway.env` và `docker-compose.yml`.

## 📖 Tài liệu Kỹ thuật
- **[Đặc tả SaaS & Lộ trình 5 Phase](./SAAS_SPECIFICATION.md)**: Chi tiết kiến trúc Multi-tenancy, Database schema, API Gateway và kế hoạch từng giai đoạn.
- **[Hướng dẫn Hệ thống & Bảo mật](./SYSTEM_GUIDE.md)**: Giải nghĩa 8 biến môi trường quan trọng, nguyên tắc chống Open Relay và nhật ký kỹ thuật.

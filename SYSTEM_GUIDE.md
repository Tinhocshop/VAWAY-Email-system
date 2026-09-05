# VAWAY Mail Server - Technical Architecture & Configuration Guide

> **Mục đích:** Tài liệu kỹ thuật chi tiết giúp các kỹ sư / AI Agent tiếp theo nắm bắt toàn bộ kiến trúc, cấu hình biến môi trường, bảo mật và nhật ký xử lý lỗi mà không mất thời gian tìm hiểu lại mã nguồn.

---

## 1. Cấu trúc Dự án (Project Structure)

```
/
├── .env.example                # Khai báo các biến môi trường cấu hình VAWAY Mail Server chuẩn
├── index.html                  # HTML entry point (Meta tags, Title, Icon)
├── metadata.json               # Cấu hình AI Studio metadata
├── package.json                # Dependencies (React 18, Vite, Lucide icons, Tailwind)
├── src/
│   ├── main.tsx                # React DOM render entry
│   ├── App.tsx                 # Điều hướng chính (Navigation, Routing & View selector)
│   ├── index.css               # Tailwind CSS base styling
│   ├── types.ts                # TypeScript interfaces (Domain, User, Alias, Token, VawayMailConfig)
│   ├── context/
│   │   └── VawayMailContext.tsx # State store quản lý dữ liệu, bộ lọc email, DKIM, DNS wizard
│   ├── data/
│   │   └── initialData.ts      # Dữ liệu khởi tạo (Default domains, users, services, config)
│   └── components/
│       ├── Navbar.tsx          # Thanh công cụ trên (Trạng thái dịch vụ, chuyển đổi tài khoản)
│       ├── Sidebar.tsx         # Menu điều hướng trái (VAWAY Brand)
│       ├── DashboardView.tsx   # Tổng quan hệ thống & Microservices health
│       ├── DomainsView.tsx     # Quản lý tên miền & DNS Wizard (DKIM, SPF, DMARC, MX)
│       ├── DomainDetailsModal.tsx # Chi tiết DNS records & Alias alternatives
│       ├── UsersView.tsx       # Quản lý hòm thư, Quota, Auto-reply, Forwarding
│       ├── UserModal.tsx       # Modal thêm/sửa tài khoản & phân quyền
│       ├── AliasesView.tsx     # Quản lý bí danh tiêu chuẩn & Anonmail (SimpleLogin)
│       ├── RelaysView.tsx      # Cấu hình chuyển tiếp tên miền (Relayed domains)
│       ├── AdminsView.tsx      # Quản lý Super Admin và Domain Admin
│       ├── TokensView.tsx      # Cấp phát API Bearer Tokens
│       ├── ClientSetupView.tsx # Hướng dẫn cấu hình Mail Client & Tạo file .mobileconfig
│       ├── WebmailView.tsx     # Trình gửi/nhận email giả lập test trực tiếp hệ thống
│       └── SetupWizardView.tsx # Trình tạo file vaway.env và docker-compose.yml
```

---

## 2. Giải nghĩa & Thiết lập các biến Môi trường (Environment Variables)

Dưới đây là 8 biến cấu hình chính xuất hiện trong giao diện thiết lập gửi/nhận email của VAWAY Mail Server:

| Tên biến | Giá trị đề xuất | Ý nghĩa & Hướng dẫn |
|---|---|---|
| `COMPRESSION` | `gz` | Định dạng nén dữ liệu hòm thư khi lưu trữ trên ổ đĩa (`gz`, `bz2`, `lz4`, `zstd`, `none`). `gz` là chuẩn tương thích cao nhất. |
| `COMPRESSION_LEVEL` | `6` | Mức độ nén từ 1 đến 9. Mức `6` là tỷ lệ vàng giữa tải CPU và dung lượng tiết kiệm. |
| `REAL_IP_FROM` | `127.0.0.1/32,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16` | Dải IP / Subnet tin cậy của Reverse Proxy hoặc Docker Network. Cho phép Nginx đọc đúng IP thật của client thay vì IP nội bộ của proxy. |
| `REAL_IP_HEADER` | `X-Forwarded-For` | HTTP Header chứa IP thật của người gửi gửi từ Reverse Proxy (`X-Forwarded-For` hoặc `X-Real-IP`). |
| `REJECT_UNLISTED_RECIPIENT` | `yes` | Bật tính năng từ chối ngay tại giao thức SMTP nếu người nhận không tồn tại trong hệ thống. Ngăn chặn spammer dò quét email và bảo vệ hàng đợi thư. |
| `RELAYHOST` | *(Để trống)* hoặc `[smtp.sendgrid.net]:587` | Máy chủ SMTP trung gian (Smart Host). Để trống nếu server gửi mail trực tiếp (Direct MX). Nếu gửi qua SendGrid, Amazon SES, Brevo thì điền thông số tại đây. |
| `RELAYNETS` | *(Để trống)* hoặc `127.0.0.1/32` | Các dải mạng nội bộ được phép gửi thư không cần đăng nhập mật khẩu. **Khuyến cáo để trống** để tránh nguy cơ Open Relay. |
| `WEBROOT_REDIRECT` | `/webmail` | Đường dẫn chuyển hướng khi người dùng truy cập trang chủ domain gốc (ví dụ `/webmail` hoặc `/admin`). |

---

## 3. Nguyên tắc Bảo mật Dữ liệu (Security Guidelines)

1. **Chống Open Relay:** Không bao giờ mở rộng `RELAYNETS` ra ngoài `127.0.0.1` trừ khi máy chủ nằm hoàn toàn trong subnet VPN riêng biệt có tường lửa.
2. **Bảo mật Khóa DKIM:** Mỗi domain tạo mới đều được cấp cặp khóa DKIM riêng biệt (RSA 2048-bit). Khóa riêng tư (`private.key`) phải luôn được lưu trữ an toàn trong volume Docker `/vaway/dkim/` với phân quyền `chmod 600`.
3. **Giới hạn tốc độ (Rate Limiting):** Cấu hình `AUTH_RATELIMIT_IP=10/minute` và `AUTH_RATELIMIT_USER=50/minute` nhằm chống lại các cuộc tấn công Brute-Force mật khẩu SMTP/IMAP.
4. **Xác thực API Tokens:** Các API token sinh ra tuân thủ định dạng ngẫu nhiên an toàn mật mã (`crypto.getRandomValues`) và có thời hạn tự động hết hạn (`expires_at`).

---

## 4. Nhật ký Sửa lỗi (Troubleshooting & Resolution Log)

1. **Lỗi: `.env.example` chứa cú pháp Jinja template dở dang (`{% if webmail_type !=`)**
   - *Nguyên nhân:* File `.env.example` gốc từ repo Python có chứa template Jinja chưa render.
   - *Cách xử lý:* Đã viết lại `.env.example` sạch sẽ, chuẩn cú pháp dotenv, có sẵn giá trị mặc định tối ưu.
2. **Lỗi: AI Studio hiển thị popup "Enter your environment variable to continue" liên tục**
   - *Nguyên nhân:* Do các biến trong `.env.example` để trống không có giá trị mặc định.
   - *Cách xử lý:* Điền đầy đủ giá trị mặc định an toàn cho các biến `COMPRESSION`, `COMPRESSION_LEVEL`, `REAL_IP_FROM`, `REAL_IP_HEADER`, `REJECT_UNLISTED_RECIPIENT`, `WEBROOT_REDIRECT`.
3. **Lỗi TS6133 & TS2339 khi biên dịch TypeScript (`compile_applet`)**
   - *Nguyên nhân:* Các import icon không dùng đến và thuộc tính `expires_at`, `compression`, `relayhost` chưa được khai báo đầy đủ trong `src/types.ts`.
   - *Cách xử lý:* Bổ sung đầy đủ interface `VawayMailConfig` và `Token`, đồng thời dọn dẹp các biến/import thừa. Kiểm tra lại bằng `npm run lint` và `npm run build` thành công 100%.
4. **Tái cấu trúc & Đổi mới thương hiệu sang VAWAY Mail Server (Rebranding):**
   - *Yêu cầu:* Loại bỏ toàn bộ nhãn hiệu cũ, chuyển đổi toàn diện sang thương hiệu VAWAY.
   - *Cách xử lý:* Cập nhật toàn bộ Provider, hook `useVawayMail`, logo SVG vector hiện đại, file cấu hình `.env`, `docker-compose`, profile `.mobileconfig` và hệ thống DNS DKIM selector `vaway._domainkey`.

---

## 5. Đánh giá Khả năng SaaS & Lộ trình Hoàn thiện Email dạng Gmail

### A. Đánh giá hiện trạng
- **Giao diện & Logic quản lý:** Đã hoàn thiện 95% (quản lý tên miền, hòm thư, quota, bí danh, DNS wizard SPF/DKIM/DMARC/MX, phân quyền admin, tạo file cấu hình Docker).
- **Trạng thái gửi/nhận thực tế:** Hiện tại là môi trường **mô phỏng nội bộ (Simulator)**. Để gửi/nhận thật với các hệ thống bên ngoài (Gmail, Outlook, Yahoo) theo mô hình SaaS, cần giải quyết 2 bài toán cốt lõi:
  1. Hạ tầng giao thức SMTP (Cổng 25) và Reverse DNS (PTR) ra Internet.
  2. Cơ chế tách biệt dữ liệu đa khách hàng (Multi-tenancy) và lưu trữ tin nhắn thật.

### B. 4 Trụ cột bắt buộc cần bổ sung để thành SaaS hoàn chỉnh:

1. **Hạ tầng Gửi/Nhận Email Thật (Email Transmission Engine):**
   - *Lựa chọn 1 (Tự host VAWAY Engine trên VPS riêng):* Deploy cụm Docker VAWAY sinh ra từ Setup Wizard lên VPS có IP tĩnh sạch, mở cổng 25, cấu hình rDNS (PTR) trỏ về hostname.
   - *Lựa chọn 2 (Mô hình SaaS Hybrid qua Relay API):* Sử dụng SMTP Relay (SendGrid, Amazon SES, Postmark, Brevo, Resend) để gửi thư ra ngoài với tỷ lệ vào Inbox 99%; nhận thư qua Inbound Webhook (Cloudflare Email Routing hoặc SendGrid Inbound Parse) để nạp thư vào cơ sở dữ liệu.

2. **Kiến trúc Đa Khách Hàng (Multi-Tenancy Architecture):**
   - Bổ sung thực thể `Tenant / Organization` (Mỗi khách hàng là 1 Tenant sở hữu 1 hoặc nhiều Custom Domain).
   - Phân cấp 3 tầng người dùng:
     - **Platform Super Admin:** Quản lý toàn bộ gói cước, số lượng tenant, tài nguyên tổng.
     - **Tenant Admin:** Khách hàng tự thêm tên miền của họ, kiểm tra trạng thái xác thực DNS (Verify Domain TXT/MX), tạo hòm thư cho nhân viên trong công ty.
     - **End-User (Nhân viên):** Chỉ đăng nhập vào giao diện Webmail để đọc/gửi email của riêng mình.

3. **Giao diện Webmail chuẩn Gmail (Gmail-like Webmail Experience):**
   - Hỗ trợ soạn thảo thư định dạng phong phú (Rich-text WYSIWYG editor).
   - Đính kèm tệp tin (File attachments) lưu trữ đám mây (S3 / Cloud Storage / Supabase Storage).
   - Gom nhóm thư theo chuỗi hội thoại (Conversation Threads).
   - Hệ thống nhãn (Labels), gắn sao (Starred), thư mục (Folders) và bộ lọc tìm kiếm tức thì.

4. **Hệ thống Xác thực Tên miền Tự động (Automated Domain Verification):**
   - API tự động truy vấn DNS qua DoH (DNS over HTTPS) để kiểm tra xem khách hàng đã trỏ đúng bản ghi MX, SPF, DKIM, DMARC chưa trước khi cho phép kích hoạt gửi thư.

> **Tài liệu đặc tả chi tiết:** Toàn bộ bản thiết kế kiến trúc DB schema, API flow và lộ trình chi tiết theo 5 Phase đã được lập tại: [`SAAS_SPECIFICATION.md`](./SAAS_SPECIFICATION.md).


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

Dưới đây là bảng 8 biến cấu hình trọng yếu được tự động điền sẵn giá trị chuẩn cho nền tảng SaaS Email VAWAY:

| Tên biến | Giá trị đề xuất | Ý nghĩa & Hướng dẫn Kỹ thuật |
|---|---|---|
| `COMPRESSION` | `gz` (hoặc `zstd`) | Định dạng nén dữ liệu hòm thư khi lưu trữ trên ổ đĩa (`gz`, `bz2`, `lz4`, `zstd`, `none`). `gz` là chuẩn tương thích cao nhất; `zstd` tối ưu dung lượng nhất cho SaaS lớn. |
| `COMPRESSION_LEVEL` | `6` | Mức độ nén từ 1 đến 9. Mức `6` là tỷ lệ vàng giữa tải CPU máy chủ và dung lượng đĩa tiết kiệm. |
| `REAL_IP_FROM` | `127.0.0.1/32,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16` | Dải IP / Subnet tin cậy của Reverse Proxy hoặc Docker Network. Cho phép Nginx đọc đúng IP thật của người dùng thay vì IP nội bộ của proxy. |
| `REAL_IP_HEADER` | `X-Forwarded-For` | HTTP Header chứa IP thật của người gửi gửi từ Reverse Proxy (`X-Forwarded-For` hoặc `X-Real-IP`). |
| `REJECT_UNLISTED_RECIPIENT` | `yes` | Bật tính năng từ chối ngay tại giao thức SMTP nếu người nhận không tồn tại trong hệ thống. Ngăn chặn triệt để spammer dò quét email (Directory Harvest Attack) và bảo vệ hàng đợi thư (Queue). |
| `RELAYHOST` | *(Để trống khi Direct VPS)* hoặc `[smtp.sendgrid.net]:587` | Máy chủ SMTP trung gian (Smart Host). Khi triển khai SaaS, nếu IP VPS chưa có danh tiếng cao hoặc bị nhà mạng chặn port 25, cấu hình Relay qua SendGrid, Amazon SES hoặc Brevo để đảm bảo 100% email vào Inbox. |
| `RELAYNETS` | `127.0.0.1/32` | Các dải mạng nội bộ được phép gửi thư không cần đăng nhập mật khẩu. **Bắt buộc để 127.0.0.1/32** để triệt tiêu hoàn toàn nguy cơ Open Relay (bị hacker lợi dụng phát tán thư rác). |
| `WEBROOT_REDIRECT` | `/webmail` | Đường dẫn chuyển hướng khi người dùng truy cập trang chủ domain gốc (ví dụ `/webmail` hoặc `/admin`). |

---

## 3. Nguyên tắc Bảo mật Dữ liệu & Vận hành SaaS (Security & Operational Guidelines)

1. **Tuyệt đối Chống Open Relay:** Giữ `RELAYNETS=127.0.0.1/32`. Không bao giờ mở rộng subnet công khai để tránh bị đưa vào Spamhaus / SORBS Blacklist.
2. **Bộ 3 Xác thực Domain (SPF, DKIM, DMARC):**
   - **SPF:** `v=spf1 mx a:mail.domain.com ~all` (Xác thực IP gửi thư).
   - **DKIM:** Ký số RSA 2048-bit với selector `vaway._domainkey` cho từng tên miền khách hàng.
   - **DMARC:** `v=DMARC1; p=reject; rua=mailto:admin@domain.com` bảo vệ thương hiệu khách hàng khỏi bị giả mạo thư.
3. **Giới hạn Tốc độ (Rate Limiting):** Cấu hình `AUTH_RATELIMIT_IP=10/minute` và `AUTH_RATELIMIT_USER=50/minute` nhằm chống Brute-Force mật khẩu SMTP/IMAP.
4. **Bảo vệ Hàng Đợi (Queue Backscatter Prevention):** Bật `REJECT_UNLISTED_RECIPIENT=yes` giúp máy chủ từ chối thư rác ngay từ bắt tay TCP `RCPT TO`, không nhận thư rác vào bộ đệm rồi mới trả lại lỗi.

---

## 4. Nhật ký Sửa lỗi (Troubleshooting & Resolution Log)

1. **Lỗi: Popup yêu cầu nhập biến môi trường `RELAYHOST` và `RELAYNETS`**
   - *Nguyên nhân:* File `.env.example` có các biến để trống không có ghi chú hoặc giá trị khuyến nghị, dẫn đến hệ thống hỏi giá trị bảo mật.
   - *Cách xử lý:* Đã cập nhật `.env.example` chuẩn hóa đầy đủ tài liệu, gán giá trị mặc định tối ưu (`RELAYNETS=127.0.0.1/32`, `RELAYHOST` chú thích rõ tùy chọn Direct/Relay).
2. **Bổ sung SaaS Architecture Presets vào Setup Wizard:**
   - *Yêu cầu:* Cho phép quản trị viên chọn nhanh mô hình: Direct VPS MX, SendGrid Relay, Amazon SES Relay, Enterprise High-Sec.
   - *Cách xử lý:* Tích hợp 4 Profile mẫu vào `SetupWizardView.tsx`, người dùng chỉ cần 1 click là các thông số tự động điền chính xác.
3. **Lỗi: `.env.example` chứa cú pháp Jinja template dở dang (`{% if webmail_type !=`)**
   - *Nguyên nhân:* File `.env.example` gốc từ repo Python có chứa template Jinja chưa render.
   - *Cách xử lý:* Đã viết lại `.env.example` sạch sẽ, chuẩn cú pháp dotenv, có sẵn giá trị mặc định tối ưu.
4. **Lỗi TS6133 & TS2339 khi biên dịch TypeScript (`compile_applet`)**
   - *Nguyên nhân:* Các import icon không dùng đến và thuộc tính `expires_at`, `compression`, `relayhost` chưa được khai báo đầy đủ trong `src/types.ts`.
   - *Cách xử lý:* Bổ sung đầy đủ interface `VawayMailConfig` và `Token`, đồng thời dọn dẹp các biến/import thừa. Kiểm tra lại bằng `npm run lint` và `npm run build` thành công 100%.
5. **Tái cấu trúc & Đổi mới thương hiệu sang VAWAY Mail Server (Rebranding):**
   - *Yêu cầu:* Loại bỏ toàn bộ nhãn hiệu cũ, chuyển đổi toàn diện sang thương hiệu VAWAY.
   - *Cách xử lý:* Cập nhật toàn bộ Provider, hook `useVawayMail`, logo SVG vector hiện đại, file cấu hình `.env`, `docker-compose`, profile `.mobileconfig` và hệ thống DNS DKIM selector `vaway._domainkey`.
6. **Cập nhật Giao diện Phong cách Gmail & Thay thế các placeholder Meet/Hangouts:**
   - *Yêu cầu:* Chuyển đổi giao diện sang phong cách Gmail (màu sắc, thanh tìm kiếm bo tròn, floating compose window docked góc dưới, category tabs Primary/Social/Promotions). Đồng thời loại bỏ hoàn toàn các tiện ích Google không liên quan (như Google Meet, Google Hangouts), thay bằng các công cụ email thực tế có thể bấm vào là làm việc được ngay.
   - *Cách xử lý:*
     1. Tích hợp **Company Directory (Sổ danh bạ doanh nghiệp)**: Hiển thị đồng nghiệp trong công ty kèm trạng thái hoạt động; bấm vào đồng nghiệp bất kỳ sẽ tự động mở cửa sổ Soạn thư gửi ngay đến người đó.
     2. Tích hợp **1-Click Shield Alias (Tạo bí danh ẩn danh chống spam)**: Tạo ngay bí danh bảo vệ quyền riêng tư trỏ về hòm thư đang đăng nhập chỉ với 1 click.
     3. Tích hợp **Download iOS/macOS .mobileconfig Profile**: Tải profile cấu hình Apple Mail tự động điền sẵn host IMAP/SMTP và SSL.
     4. Tích hợp **Copy Server Ports & Live DNS Inspector**: Sao chép nhanh cổng kết nối 993/465/587 và kiểm tra trạng thái SPF/DKIM/DMARC của tên miền.

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


# TÀI LIỆU ĐẶC TẢ KỸ THUẬT & LỘ TRÌNH TRIỂN KHAI HỆ THỐNG EMAIL SAAS
## (Multi-Tenant Business Email Platform - "Workspace Mail SaaS")

> **Phiên bản:** 1.0.0  
> **Trạng thái:** Bản thiết kế kiến trúc chuẩn (Architectural Blueprint)  
> **Mục tiêu:** Xây dựng nền tảng SaaS cung cấp dịch vụ Email doanh nghiệp theo tên miền riêng (`user@domain.com`), hỗ trợ đa khách hàng (Multi-tenancy), giao diện gửi/nhận chuẩn Gmail và đảm bảo tỷ lệ vào Inbox cao.

---

## 1. TỔNG QUAN HỆ THỐNG & MỤC TIÊU SẢN PHẨM

### 1.1 Tầm nhìn
Xây dựng một giải pháp thay thế Google Workspace / Zoho Mail tự lưu trữ và thương mại hóa dạng SaaS:
- **Khách hàng doanh nghiệp (Tenant):** Tự đăng ký tài khoản, kết nối tên miền riêng của công ty, tạo và quản lý hòm thư nhân viên, phân bổ dung lượng lưu trữ (Quota).
- **Nhân viên (End-User):** Truy cập giao diện Webmail hiện đại, mượt mà, quen thuộc như Gmail để soạn thảo, gửi/nhận email thời gian thực, quản lý tệp đính kèm và danh bạ.
- **Quản trị viên nền tảng (Super Admin):** Giám sát toàn bộ các tenant, doanh thu, giới hạn gói cước và trạng thái cụm máy chủ truyền nhận thư.

### 1.2 Mô hình Kiến trúc Cấp cao (High-Level Architecture)

```
[ Khách hàng & Nhân viên ]
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND SINGLE PAGE APP (SPA)               │
│  - Multi-Tenant Auth (SuperAdmin / TenantAdmin / EndUser)    │
│  - Domain Onboarding & DNS Verifier Wizard                   │
│  - Modern Gmail-like Webmail (Threads, Rich-Text, Attach)    │
│  - Mailbox & Storage Management Dashboard                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / WSS / REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND API & APPLICATION ENGINE             │
│  - Tenant Isolation Layer (Row-level security / Schema)     │
│  - DNS Resolution Engine (DoH - DNS over HTTPS)             │
│  - Mail Indexer & Full-Text Search                          │
│  - Attachment Storage Service (S3 / Cloud Storage)          │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    (Outbound SMTP / API)              (Inbound Webhooks / MX)
               ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│    OUTBOUND TRANSMISSION     │ │    INBOUND PARSING ENGINE   │
│ - VAWAY Postfix SMTP Cluster │ │ - VAWAY Dovecot / Postfix   │
│ - Hoặc Smart Host Relay      │ │ - Hoặc Inbound Parse Webhook│
│   (Amazon SES / SendGrid)    │ │   (Cloudflare / SendGrid)   │
│ - DKIM, SPF, DMARC Signer    │ │ - Rspamd / SpamAssassin     │
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. PHÂN CẤP TÀI KHOẢN & MA TRẬN PHÂN QUYỀN (RBAC)

| Vai trò | Phạm vi quản lý | Quyền hạn chính |
|---|---|---|
| **Platform Super Admin** | Toàn bộ hệ thống | Quản lý danh sách Tenant, cài đặt gói cước, theo dõi IP Reputation, cấu hình cụm máy chủ SMTP/Relay toàn cục. |
| **Tenant Admin** (Chủ DN) | Tổ chức/Công ty của họ | Thêm/xác minh tên miền của công ty, tạo/xóa hòm thư nhân viên, cấu hình chữ ký chung, bí danh nhóm (Group alias), xem nhật ký gửi nhận nội bộ. |
| **End-User** (Nhân viên) | Hòm thư cá nhân | Chỉ truy cập giao diện Webmail: Đọc, gửi thư, gắn nhãn, phân loại thư, tạo bộ lọc tự động, đổi mật khẩu hòm thư. |

---

## 3. MÔ HÌNH DỮ LIỆU CỐT LÕI (DATABASE SCHEMAS)

### 3.1 Bảng Tổ chức (Tenants / Organizations)
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'starter', -- starter, business, enterprise
    max_domains INT DEFAULT 1,
    max_mailboxes INT DEFAULT 5,
    max_storage_bytes BIGINT DEFAULT 10737418240, -- 10 GB
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, trial
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Bảng Tên miền & Trạng thái DNS (Domains)
```sql
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NOT NULL, -- Mã TXT xác thực sở hữu domain
    mx_status VARCHAR(50) DEFAULT 'pending',  -- valid, invalid, pending
    spf_status VARCHAR(50) DEFAULT 'pending',
    dkim_status VARCHAR(50) DEFAULT 'pending',
    dmarc_status VARCHAR(50) DEFAULT 'pending',
    dkim_selector VARCHAR(50) DEFAULT 'vaway',
    dkim_private_key TEXT NOT NULL,
    dkim_public_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 Bảng Hòm thư (Mailboxes / Users)
```sql
CREATE TABLE mailboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,       -- nhanvien@congtyabc.com
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    quota_bytes BIGINT DEFAULT 2147483648,     -- 2 GB mặc định
    quota_used_bytes BIGINT DEFAULT 0,
    role VARCHAR(50) DEFAULT 'user',           -- tenant_admin, user
    is_enabled BOOLEAN DEFAULT TRUE,
    signature_html TEXT,
    auto_reply_enabled BOOLEAN DEFAULT FALSE,
    auto_reply_subject VARCHAR(255),
    auto_reply_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.4 Bảng Thư & Luồng hội thoại (Messages & Threads)
```sql
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mailbox_id UUID REFERENCES mailboxes(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INT DEFAULT 1,
    is_starred BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    folder VARCHAR(50) DEFAULT 'inbox' -- inbox, sent, draft, spam, trash
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    mailbox_id UUID REFERENCES mailboxes(id) ON DELETE CASCADE,
    from_address VARCHAR(255) NOT NULL,
    to_addresses JSONB NOT NULL,
    cc_addresses JSONB,
    bcc_addresses JSONB,
    subject VARCHAR(500),
    body_html TEXT,
    body_plain TEXT,
    attachments JSONB, -- mảng tệp đính kèm [{filename, url, size, mimeType}]
    spam_score NUMERIC(4,2) DEFAULT 0,
    headers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. LỘ TRÌNH TRIỂN KHAI CHI TIẾT (5 PHASES)

###  GIAI ĐOẠN 1: NỀN TẢNG ĐA KHÁCH HÀNG & XÁC THỰC TÊN MIỀN TỰ ĐỘNG (Tuần 1 - 2)
*Mục tiêu: Đảm bảo khách hàng doanh nghiệp có thể đăng ký, thêm domain và tự kiểm tra DNS.*
- **Công việc 1.1:** Tách biệt Tenant Context: Khách hàng đăng ký tài khoản Tenant Admin sẽ được cấp một Không gian làm việc (Workspace) riêng biệt.
- **Công việc 1.2:** Module Xác thực Tên miền (Domain Verification Wizard):
  - Khi khách hàng nhập `congtyabc.com`, hệ thống tự sinh mã bảo mật TXT (ví dụ: `vaway-site-verification=xyz123`).
  - Tích hợp API DNS lookup (sử dụng DNS-over-HTTPS của Google / Cloudflare) để người dùng bấm **"Kiểm tra ngay"** là biết ngay tên miền đã trỏ đúng MX, SPF, DKIM chưa.
- **Công việc 1.3:** Cấp quyền tạo hòm thư nhân viên trong giới hạn gói (Quota & User limits).

###  GIAI ĐOẠN 2: NÂNG CẤP GIAO DIỆN WEBMAIL CHUẨN GMAIL (Tuần 3 - 4)
*Mục tiêu: Đem lại trải nghiệm người dùng cuối chuyên nghiệp, dễ sử dụng.*
- **Công việc 2.1:** Trình soạn thảo Rich-Text WYSIWYG (Bold, Italic, Bullet lists, Chèn liên kết, Chữ ký tự động).
- **Công việc 2.2:** Quản lý đính kèm tệp tin (File Attachments) với cơ chế kéo thả, hiển thị thanh tiến trình tải và xem trước (Preview).
- **Công việc 2.3:** Cơ chế gom nhóm hội thoại (Conversation Threading): Các thư trả lời cùng một tiêu đề được gom thành chuỗi xem liền mạch.
- **Công việc 2.4:** Hệ thống Đánh dấu sao (Starred), Nhãn màu sắc (Labels), Thư mục (Inbox, Sent, Drafts, Spam, Trash) và Bộ lọc tìm kiếm nhanh theo Người gửi / Tiêu đề.

###  GIAI ĐOẠN 3: HẠ TẦNG GỬI / NHẬN EMAIL THẬT RA INTERNET (Tuần 5 - 6)
*Mục tiêu: Email gửi đi vào thẳng Inbox của Gmail/Outlook; nhận email từ bên ngoài gửi về hòm thư.*
- **Công việc 3.1 (Chiều gửi - Outbound):**
  - Cấu hình cụm Postfix SMTP với chứng chỉ TLS 1.3 và tự động ký chữ ký số **DKIM 2048-bit** cho từng tenant.
  - Tích hợp tùy chọn **Smart Host Relay (Amazon SES / Brevo / SendGrid)** để phòng ngừa trường hợp IP máy chủ VPS bị dính blacklist.
- **Công việc 3.2 (Chiều nhận - Inbound):**
  - Cấu hình bản ghi MX trỏ về máy chủ Gateway.
  - Xử lý nhận thư đến, phân tích tiêu đề (MIME parser), kiểm tra bộ lọc Spam (Rspamd) và định tuyến vào đúng bảng `messages` của tài khoản nhận.
- **Công việc 3.3:** Xử lý hàng đợi thư (Message Queue & Retry Logic) phòng khi máy chủ đích bị quá tải hoặc tạm thời không liên lạc được.

###  GIAI ĐOẠN 4: AN NINH, CHỐNG SPAM & BẢO MẬT DỮ LIỆU (Tuần 7)
*Mục tiêu: Đảm bảo nền tảng không bị lợi dụng để phát tán thư rác và bảo vệ thông tin khách hàng.*
- **Công việc 4.1:** Rate Limiting (Giới hạn tốc độ gửi): Giới hạn số lượng email gửi mỗi phút/giờ cho mỗi hòm thư để chống tấn công Spam.
- **Công việc 4.2:** Chống rò rỉ Open Relay: Bật cấm chuyển tiếp thư tự do (`REJECT_UNLISTED_RECIPIENT=yes`, `RELAYNETS=`).
- **Công việc 4.3:** Mã hóa hòm thư và dữ liệu nhạy cảm (Encryption at rest & in transit).
- **Công việc 4.4:** Nhật ký kiểm toán (Audit Logs): Ghi nhận lịch sử đăng nhập, IP truy cập và lịch sử gửi thư của nhân viên.

###  GIAI ĐOẠN 5: GÓI CƯỚC THƯƠNG MẠI & TÙY BIẾN THƯƠNG HIỆU (Tuần 8)
*Mục tiêu: Đóng gói sản phẩm thương mại cho khách hàng trả phí.*
- **Công việc 5.1:** Hệ thống gói cước (Starter: 5 hòm thư; Business: 50 hòm thư; Enterprise: Không giới hạn).
- **Công việc 5.2:** Tính năng White-label (Giao diện thương hiệu riêng): Cho phép công ty tải lên Logo công ty và truy cập qua đường dẫn riêng (ví dụ: `mail.congtyabc.com`).
- **Công việc 5.3:** Công cụ sao lưu (Backup) và Xuất dữ liệu email (Export Mbox/EML).

---

## 5. BẢNG TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

1. **Gửi vào Inbox:** Email gửi từ `user@domain.com` sang hộp thư Gmail cá nhân phải đạt tiêu chuẩn **Pass cả 3 bản ghi: SPF, DKIM, DMARC** và nằm ở hộp thư chính (Inbox), không rơi vào Spam.
2. **Nhận thư tức thì:** Thư gửi từ Gmail ngoài về hòm thư `user@domain.com` phải hiển thị trong giao diện Webmail trong vòng dưới 3 giây.
3. **Cách ly dữ liệu:** Công ty A tuyệt đối không thể nhìn thấy domain, danh sách nhân viên hay nội dung email của Công ty B.
4. **Trải nghiệm mượt mà:** Trình soạn thảo văn bản phản hồi nhanh, tải đính kèm mượt mà, hỗ trợ giao diện tiếng Việt hoàn chỉnh.

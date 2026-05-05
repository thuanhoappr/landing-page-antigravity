# Deploy checklist — pickleball-landing (Vercel)

> Mở file này trên máy, tick `[x]` khi đã kiểm tra xong từng mục. Chụp màn hình khi nộp bài (theo SOP).

## 1) Mã nguồn & nhánh

- [x] Đã push commit mới nhất lên repo GitHub đúng project Vercel đang trỏ tới.
- [x] Production đang trỏ đúng domain (ví dụ `pickleball30phut.com`) trong Vercel → Settings → Domains.

## 2) Biến môi trường trên Vercel (Production)

Trong Vercel → Project → Settings → Environment Variables → **Production**:

- [x] **Database (bắt buộc cho CRM / waitlist / đơn trên server):** một trong các biến  
  `POSTGRES_URL` **hoặc** `DATABASE_URL` **hoặc** `STORAGE_URL` (chuỗi Postgres hợp lệ, SSL).
- [x] **Resend (email waitlist + sequence + xác nhận đơn):**  
  `RESEND_API_KEY`  
  `RESEND_FROM_EMAIL` (domain đã verify với Resend, hoặc tạm `onboarding@resend.dev` khi test).
- [x] **Cron email sequence (khuyến nghị trên production):**  
  `CRON_SECRET` — chuỗi ngẫu nhiên; khi set trên Vercel, lịch cron gọi `/api/cron/email-sequence` sẽ kèm header `Authorization: Bearer <CRON_SECRET>` (theo tài liệu Vercel). Nếu **không** set `CRON_SECRET`, route vẫn cho phép gọi (tiện test; kém an toàn hơn nếu URL lộ).
- [x] **Thanh toán SePay (nếu dùng QR / IPN):**  
  `SEPAY_MERCHANT_ID`, `SEPAY_SECRET_KEY`  
  Tuỳ cấu hình: `SEPAY_WEBHOOK_API_KEY`, `SEPAY_PRODUCT_ID`  
  `NEXT_PUBLIC_SITE_URL` — URL site production (mặc định code có fallback `https://pickleball30phut.com` nếu không set).
- [x] **Make / CRM webhook (nếu form gửi sang Make):**  
  `NEXT_PUBLIC_MAKE_WEBHOOK_URL` — chỉ cần nếu `LeadForm` dùng webhook.

Sau khi sửa env: **Redeploy** (hoặc chạy lại workflow GitHub Actions) để biến mới có hiệu lực.

## 3) Cron (Vercel)

- [x] File `vercel.json` có cron gọi `/api/cron/email-sequence` (hiện tại: **1 lần/ngày** lúc 9:00 UTC — gói Hobby không chạy cron mỗi giờ).
- [x] Trên Vercel → Crons: thấy job tương ứng; sau 24h có thể xem log request (hoặc gọi tay endpoint với `Authorization` nếu đã set `CRON_SECRET`).

## 4) Kiểm tra nhanh trên production (trình duyệt / API)

- [x] Trang chủ `/` mở bình thường, không lỗi console chặn chức năng chính.
- [x] Form waitlist: điền tên + SĐT (+ email nếu có) → gửi thành công (hoặc báo lỗi rõ ràng nếu thiếu field).
- [x] Có email: thử email có `+test` → nhận đủ 3 email test (theo cấu hình dự án).
- [x] `/admin` (hoặc luồng admin bạn dùng): tạo đơn → khách có email nhận được mail xác nhận (nếu đã cấu hình Resend).
- [x] SePay: một giao dịch thử nhỏ hoặc kiểm tra IPN theo tài liệu SePay (nếu đang bật).

## 5) Deploy khi Git/Vercel “kẹt” — GitHub Actions

- [x] Repo có workflow `.github/workflows/deploy-production.yml`.
- [x] Secrets GitHub Actions đã set: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- [x] Đã từng chạy **Actions → Deploy Production (Vercel) → Run workflow** và deployment **Succeeded**.

## 6) Tài liệu

- [x] Đã đọc phần **Deploy (production)** trong `README.md` của repo (env + Actions + cron).

---

**Ghi chú:** Local có thể dùng SQLite (`brain.db`); trên Vercel production cần Postgres qua các biến ở mục 2 — nếu thiếu, API waitlist/admin sẽ không ghi DB đúng trên server.

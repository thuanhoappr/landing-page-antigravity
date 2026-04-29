# Brain score — Thử thách 21 ngày

## 2026-04-27 — Ngày 9

- [x] Đã đăng bài thông báo chatbot (copy từ `my-brain/day9.txt`, chỉnh tối đa 5 phút) lên **ít nhất 2 kênh** — dán link public vào đây:
  - Kênh 1: https://www.facebook.com/share/p/1SEzD4xL5U/
  - Kênh 2: https://www.facebook.com/share/p/1Kp2dhEQqb/
- [x] Đủ **3 bài** kéo người vào danh sách chờ (ngoài bài thông báo chatbot) — ghi nhanh link hoặc ghi chú:
  1. https://www.facebook.com/share/p/1FYs2TE3ys/
  2. https://www.facebook.com/share/p/17VSXRFgja/
  3. https://www.facebook.com/share/p/16ihMWMxdf/

Ghi chú nộp bài: link website có chatbot, screenshot `/data`, screenshot file này sau khi tick đủ.

## 2026-04-29 — Ngày 11 — Email marketing tự động (Resend)

**Đã xong (theo bạn báo — không cần làm lại):** Bước 1 CRM/email; Resend + key Vercel; form gửi mail; `email_sequence.md` 3 email.

**Còn lại để đúng SOP nộp bài (ưu tiên theo thứ tự):**

- [ ] **+test 3 email:** điền form với `ban+test@gmail.com` (đúng domain Gmail) → chụp hộp thư **3 email riêng biệt**, thấy rõ subject/body.
- [ ] **Email xác nhận đơn:** `/admin` → chọn khách có **email đúng chính tả** → tab Đơn hàng → thêm đơn thử → chụp mail **“Xác nhận đơn hàng”** (nếu khách không có email hoặc sai domain thì không gửi được).
- [ ] Screenshot file **`my-brain/email_sequence.md`** (đủ 3 `# Email …`).
- [ ] Đăng bài từ **`my-brain/day11.txt`** (≤5 phút chỉnh) → **≥2 link public** (dán dưới đây).
- [ ] **3 bài kéo waitlist** (ngoài bài email) — link hoặc ghi chú:
  1.
  2.
  3.
- [ ] Bài thông báo email — **≥2 kênh**, link public:
  - Kênh 1:
  - Kênh 2:

**Cron Email 2/3:** Production gọi `/api/cron/email-sequence` **mỗi giờ** (`vercel.json`). Nếu bạn có `CRON_SECRET` trên Vercel: phải trùng secret Vercel gửi kèm cron (hoặc xóa biến đó nếu không dùng). Deploy lại sau khi pull commit mới.

# Ngày 16 — Nội dung & hướng dẫn nộp bằng chứng (theo SOP "Tự Tay Tạo Skill")

Tài liệu này tổng hợp đủ **6 bằng chứng** cần nộp + checklist cuối.

---

## Tóm tắt skill đã tạo

- **Tên:** `pickleball-lead-reply`
- **Cấp:** 1 (chỉ `SKILL.md` — phù hợp với task ngôn ngữ thuần)
- **Folder:** `pickleball-landing/skills/pickleball-lead-reply/`
- **Mục đích:** soạn DM Telegram cho lead pickleball mới điền form, bám brand voice "Coach Culi"
- **Đã upload lên goClaw vault:** `/coach-ppr/coach-ppr/skills/pickleball-lead-reply/SKILL.md`

---

## 6 bằng chứng cần nộp

### 1. Ảnh dùng được 1 skill từ bộ `kp3-skills/`

> ⚠️ **Skip / pending** — bộ `kp3-skills/` chưa có trên máy. Khi mentor cấp link sẽ bổ sung sau. Coach có thể nộp bài với 5/6 bằng chứng và ghi rõ mục này đang chờ.

Hoặc Coach có thể tạm dùng 1 skill built-in của Cursor (vd `canvas`, `create-skill`, `babysit`) làm bằng chứng tương đương — gõ `@SKILL.md` vào agent coding rồi screenshot.

---

### 2. Ảnh hoàn thành 10 câu trắc nghiệm

✅ **Đã làm** — 10/10 câu, mỗi câu đều "Hỏi AI" trước khi chọn. Đáp án ghi nhớ:

| Câu | Tình huống | Đáp án |
|-----|-----------|--------|
| 01 | FAQ 20 câu | Cấp 1 |
| 02 | Edit video reels | Cấp 5 (min Cấp 3) |
| 03 | Proposal/báo giá template brand | Cấp 2 |
| 04 | Code tính năng web | Cấp 5 |
| 05 | Hợp đồng đúng luật VN | Cấp 4 |
| 06 | Báo cáo doanh thu + slide | Cấp 5 |
| 07 | Caption IG (Hook+Body+CTA) | Cấp 1 |
| 08 | Phân tích đối thủ | Cấp 1 |
| 09 | Poster quảng cáo | Cấp 5 |
| 10 | Tư vấn đầu tư | Cấp 4 |

→ Screenshot trang quiz với 10 câu đã trả lời.

---

### 3. Ảnh thư mục skill tự tạo

Mở **File Explorer** hoặc **Cursor / Antigravity Sidebar**, vào:

```
pickleball-landing/skills/pickleball-lead-reply/
└── SKILL.md
```

Screenshot khung sidebar / explorer thấy được folder `skills/pickleball-lead-reply/` với file `SKILL.md` bên trong.

---

### 4. Ảnh skill chạy trong agent coding (Cursor / Antigravity)

✅ **Đã có** — screenshot từ chat Antigravity, agent dùng `@SKILL.md` rồi output 3 biến thể DM cho lead `Test Day15`.

---

### 5. Ảnh skill chạy trên goClaw qua Telegram

✅ **Đã có** — DM `@coachppr_bot` với prompt:

```
Soạn DM lead mới cho khách: Nguyễn Văn A · 0901234567 · an.nguyen@gmail.com — vừa điền form trên landing
```

Bot output **3 mẫu DM** (Zalo/Email/Soft Sell) + box "Mẹo nhỏ từ Coach Culi" với 3 tip về tốc độ phản hồi & cá nhân hoá. End-to-end pass.

---

### 6. Link bài đăng (≥2 kênh public, FB tag mentor)

**Gợi ý nội dung** đã soạn sẵn ở: `day16_post.txt` — kể câu chuyện 25 phút → 30 giây + cảm giác "tri thức của mình có hình dạng".

**Checklist:**

- [ ] Facebook bài public + tag `Dương Trọng Nghĩa` (https://www.facebook.com/duongtrongnghia.theKP3/)
- [ ] Kênh thứ 2 (Zalo cá nhân / Threads / LinkedIn / fanpage / blog…)

**Điền link sau khi đăng:**

| Kênh | Link |
|------|------|
| Facebook | *(dán URL sau khi đăng)* |
| Kênh 2 | *(dán URL sau khi đăng)* |

---

## Mẫu tin nhắn nộp bài (copy & paste)

```
Em là [Họ tên] — dự án pickleball30phut.com / Coach PPR.
Nộp bài Ngày 16 — Tự tay tạo Skill:

1. Skill từ kp3-skills: [skip / link nếu có]
2. Quiz 10 câu: [link ảnh]
3. Folder skill tự tạo (pickleball-lead-reply, Cấp 1): [link ảnh]
4. Skill chạy trong Antigravity (@SKILL.md): [link ảnh]
5. Skill chạy trên goClaw qua Telegram: [link ảnh]
6. Link bài đăng:
   - Facebook (đã tag mentor): [URL]
   - Kênh 2: [URL]

Repo GitHub: https://github.com/thuanhoappr/landing-page-antigravity (commit Day 16)

Cảm ơn BTC ạ.
```

---

## Học được gì từ Day 16

1. **Skill ≠ code.** SKILL.md chỉ là markdown thuần — viết cho rõ thì agent dùng được.
2. **Frontmatter quyết định.** `description` phải có WHAT + WHEN + trigger phrases — đây là phần Claude/agent dùng để **quyết định có load skill không**.
3. **Cấp 1 đủ cho 80% use case.** Đừng quá tay làm Cấp 5 ngay — task càng đơn giản càng nên dùng Cấp 1.
4. **Knowledge has shape.** Trước Day 16, "cách Coach soạn DM" chỉ tồn tại trong đầu Coach. Sau Day 16, nó là 1 file 7 KB.

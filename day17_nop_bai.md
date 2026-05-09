# Ngày 17 — Nộp bài: Skill creative FB + Canva infographic

Tài liệu này tóm tắt **bằng chứng nộp Day 17** cho thử thách Angravity 21 ngày AI: build skill `tao-creative-fb` (MD-only) và dùng nó tạo bài viết FB cho fanpage Pickleball 30 phút.

---

## Tiêu chí hoàn thành Day 17

1. **Đã build 1 skill MD-only** (`skills/tao-creative-fb/SKILL.md`) — không code, ai có agent là dùng được.
2. **Đã chạy skill ít nhất 1 lần qua Telegram** — bot trả output có giọng riêng (không generic).
3. **Có 1 bài FB public** dùng output của skill — caption + ảnh.

---

## Files cần có (đã chuẩn bị sẵn trong repo)

| File | Mục đích |
|------|----------|
| `skills/tao-creative-fb/SKILL.md` | Skill v1.3 — 4 phần: Image LANE A · Caption · Checklist · Hashtag |
| `skills/tao-creative-fb/references/content-angles.md` | 7 góc nội dung (A1-A7) |
| `skills/tao-creative-fb/references/image-prompt-rules.md` | Quy tắc 3 LANE (A=Canva spec, B=Photo brief, C=B-roll AI) |
| `skills/tao-canva-spec/SKILL.md` | Fallback skill — chỉ xuất 9 mục Canva |
| `day17_canva_spec.md` | Canva Spec Sheet góc A3 (lỗi nhập môn dân văn phòng) — 9 mục, paste Canva 5 phút |
| `day17_post.txt` | Caption FB Day 17 narrative — 350 từ, copy-paste FB |
| `public/coach-avatar.png` | Ảnh Coach (chính chủ, không AI face) |
| `public/day17-laneC-bball.png` | B-roll paddle/ball (LANE C — gpt-image-1, không tiếng Việt overlay) |

---

## Checklist 4 ảnh / tài liệu nộp

### 1. Ảnh Telegram — câu lệnh + bot trả Canva Spec đầy đủ 9 mục

**Mục đích:** Chứng minh skill `tao-creative-fb` (hoặc `tao-canva-spec`) chạy ra **đúng output structured** — không phải caption generic.

**Cách chụp:**

1. DM `@coachppr_bot` (production).
2. Gõ: `tao canva spec góc A3` (hoặc `Mode 1, góc A3 lỗi nhập môn dân văn phòng`).
3. Chụp **toàn bộ message bot trả** — phải thấy đủ:
   - Header `Canva Spec · Lỗi nhập môn dân văn phòng` (hoặc `Mode 1 · ...`)
   - 9 mục đánh số 1–9 (Hook → Check Canva)
   - Brand info có Zalo + footer pickleball30phut.com

**Pass nhanh:** Bot xuất 9 mục Canva tiếng Việt + emoji nhẹ + có footer Coach PPR.

---

### 2. Ảnh Canva infographic đã làm xong

**Mục đích:** Chứng minh Coach đã paste Canva spec vào Canva và export ảnh thật.

**Cách làm Canva (5–7 phút):**

1. Mở [canva.com](https://canva.com) → Create design → Custom size → **1080 × 1350 px** (Aspect 4:5).
2. Search template: **"sport infographic vertical"** → chọn 1 template có 5 ô bullet ngang.
3. Áp dụng spec từ `day17_canva_spec.md`:
   - **Background:** đổi sang navy `#0E2A47`
   - **Headline (Hook):** "5 LỖI NHẬP MÔN PICKLEBALL DÂN VĂN PHÒNG HAY MẮC" — font Bebas Neue / Anton, accent vàng `#F7C400`
   - **5 bullet:** dùng số `(1)` `(2)` `(3)` `(4)` `(5)` — font Be Vietnam Pro Medium, text trắng
   - **Quote:** "Không cần đánh mạnh hơn. CẦN ĐÁNH ĐÚNG trước đã." — accent đỏ `#E11D2C`
   - **Slot ảnh:** chèn `public/coach-avatar.png` hoặc 1 ảnh Coach mid-swing — slot lớn ~50% diện tích
   - **Footer:** logo PPR top-right + `pickleball30phut.com` + Zalo `0919.117.687`
4. Check: dấu tiếng Việt đủ + ảnh thật ≥40% + footer đủ + logo rõ.
5. Export PNG 1080×1350.

**Cách chụp:** screenshot Canva preview + screenshot file PNG đã export.

---

### 3. Ảnh bài đăng Facebook public (caption + ảnh Canva)

**Mục đích:** Bằng chứng public chia sẻ + đủ điều kiện tag mentor.

**Cách đăng:**

1. Vào fanpage **Pickleball 30 phút** (hoặc FB cá nhân nếu fanpage chưa tiện).
2. Caption = nội dung trong `day17_post.txt`.
3. Ảnh = file PNG đã export từ Canva (mục 2).
4. **Tag mentor**: copy link `https://www.facebook.com/duongtrongnghia.theKP3/` đã có sẵn trong caption.
5. Privacy: **Public**.
6. Đăng + chụp link share.

**Pass nhanh:** Bài public, ảnh đẹp tiếng Việt đủ dấu, có tag Dương Trọng Nghĩa.

---

### 4. Link GitHub repo — chứng minh skill MD-only

**Mục đích:** Chứng minh skill là 1 file `.md` thuần, không code.

**Cách chụp:**

1. Push repo lên GitHub: `git push origin master`.
2. Mở GitHub → vào path `skills/tao-creative-fb/SKILL.md`.
3. Screenshot frame URL + nội dung file đầu (có frontmatter `version: 1.3.0`, `category: social-content`).

---

## Mẫu tin nộp bài (copy chỉnh)

**Tiêu đề:** `[Day 17] Nộp bài — Coach PPR — Pickleball30phut`

**Nội dung:**

```
Em là Hoá Trần — dự án pickleball30phut.com / Coach PPR.

Bằng chứng Day 17 (Skill creative FB MD-only):

1. Telegram: bot chạy skill `tao-canva-spec` ra 9 mục Canva spec — [ảnh]
2. Canva PNG đã export 1080×1350 — [ảnh / file]
3. Bài FB public + tag mentor: [link facebook.com/share/p/...]
4. GitHub repo skill MD-only: https://github.com/[user]/pickleball-landing/blob/master/skills/tao-creative-fb/SKILL.md

Ghi chú kỹ thuật: Skill v1.3.0 dùng 3-lane image system (A=Canva spec, B=Photo brief, C=B-roll gpt-image-1). DALL·E 3 đã loại khỏi flow vì sai tiếng Việt nặng. Skill có fallback `tao-canva-spec` cho trường hợp Telegram cắt message.

Cảm ơn anh đã xem bài ạ.
```

---

## Checklist tự soát trước khi gửi

- [ ] `day17_canva_spec.md` đã có đủ 9 mục đánh số.
- [ ] Đã làm Canva 1080×1350 — tiếng Việt đủ dấu, ảnh thật ≥40%, footer đủ.
- [ ] Bài FB public, có tag Dương Trọng Nghĩa.
- [ ] `day17_post.txt` đã copy-paste vào caption FB (350 từ, narrative cá nhân).
- [ ] Repo đã push GitHub master.

Chúc Coach nộp bài Day 17 một phát ăn ngay.

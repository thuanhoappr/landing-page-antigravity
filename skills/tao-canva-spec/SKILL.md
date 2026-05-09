---
name: tao-canva-spec
description: Sinh **Canva Spec Sheet** (9 mục, compact 1 dòng/mục) cho infographic FB của Coach PPR. Output siêu ngắn ~900 ký tự để chắc chắn vừa 1 tin Telegram. Dùng khi Coach gõ "tao canva spec góc A3", "spec canva 5 lỗi", "xin spec canva pickleball", hoặc khi `tao-creative-fb` Mode 1 bị cắt giữa chừng và Coach cần riêng phần Image LANE A. Bám brand voice [[brand-voice]] + `references/content-angles.md` (qua `tao-creative-fb`). Không sinh caption / hashtag — chỉ Canva spec.
license: MIT
metadata:
  author: Coach PPR — pickleball30phut.com
  version: 1.0.0
  category: social-content
  tags: [facebook, pickleball, vietnamese, canva, infographic, spec-sheet]
---

# tao-canva-spec — Canva Spec Sheet riêng (fallback ngắn gọn)

Skill phụ dùng khi `tao-creative-fb` Mode 1 bị Telegram cắt giữa chừng và Coach cần riêng phần **Image LANE A Canva Spec**.

Output siêu ngắn (~900 ký tự) — chắc chắn không bị truncate.

---

## Đầu vào

Coach nói góc nội dung (A1–A7 trong vault `tao-creative-fb/references/content-angles.md`) hoặc tự nêu chủ đề.

Vd:
- "tao canva spec góc A3" → 5 lỗi nhập môn
- "spec canva người bận rộn" → góc A1
- "xin spec canva pickleball cho dân văn phòng tập tại nhà" → tự suy ra A1+A3

---

## Output (BẮT BUỘC compact, 9 mục đánh số, 1 dòng/mục)

```markdown
## Canva Spec · [Tên góc ngắn]

1. **Hook:** [HEADLINE VIẾT HOA, 8–14 từ]
2. **Sub:** [sub-headline 1 dòng, 6–12 từ]
3. **5 Bullet:** (1) [BULLET 1 viết HOA] — [giải thích ngắn] · (2) [BULLET 2] — [...] · (3) [BULLET 3] — [...] · (4) [BULLET 4] — [...] · (5) [BULLET 5] — [...]
4. **Quote:** "[câu chốt 8–18 từ, nhấn HOA keyword]"
5. **Brand:** Logo PPR top-right · Footer: pickleball30phut.com · Zalo 0919.117.687 · CTA "Tải lộ trình 30' free trong link bio".
6. **Slot ảnh:** Slot lớn ~50% [mô tả ảnh chính]; 2 slot nhỏ [mô tả 2 ảnh phụ] (lấy từ `public/`).
7. **Color/Font:** BG navy `#0E2A47`, accent vàng `#F7C400`, đỏ `#E11D2C`, text trắng. Headline Bebas Neue/Anton; body Be Vietnam Pro Medium.
8. **Template:** Canva search "sport infographic vertical 4:5". Aspect 4:5 (1080×1350). Tham khảo "THIRD SHOT DROP 2026".
9. **Check Canva:** Tiếng Việt đủ dấu · logo rõ · ảnh thật ≥40% · footer đủ · export PNG 1080×1350.
```

**Quy tắc cứng:**
- Chỉ output 9 mục đánh số trên — KHÔNG kèm caption, hashtag, hay bất kỳ section nào khác.
- Nếu Coach hỏi caption → trả lời 1 câu: *"Phần caption gọi `tao-creative-fb` Mode 1 nhé, skill này chỉ làm Canva spec."*
- Bullet (mục 3) phải đúng **5 ý** trên 1 dòng, ngăn cách bởi `·`. Không xuống dòng từng bullet.
- Tổng output ≤ 1000 ký tự.

---

## WORKED EXAMPLE — góc A3 (lỗi nhập môn dân văn phòng)

```markdown
## Canva Spec · Lỗi nhập môn dân văn phòng

1. **Hook:** 5 LỖI NHẬP MÔN PICKLEBALL DÂN VĂN PHÒNG HAY MẮC
2. **Sub:** Sửa được trong 30 phút mỗi ngày — không cần ra sân nhiều.
3. **5 Bullet:** (1) ĐỨNG SAI CHỖ — quên về NVZ · (2) VÀO BÓNG TRỄ — đợi bóng mới swing · (3) DINK CAO QUÁ LƯỚI — đối thủ smash trả · (4) GIAO BÓNG NHẢY CHÂN — bắt lỗi · (5) QUÊN VỀ THỦ — ăn phản đòn.
4. **Quote:** "Không cần đánh mạnh hơn. CẦN ĐÁNH ĐÚNG trước đã."
5. **Brand:** Logo PPR top-right · Footer: pickleball30phut.com · Zalo 0919.117.687 · CTA "Tải lộ trình 30' free trong link bio".
6. **Slot ảnh:** Slot lớn ~50% Coach mid-swing áo PPR sân indoor; 2 slot nhỏ Coach hạ thấp thủ + Coach giao bóng (lấy `public/`).
7. **Color/Font:** BG navy `#0E2A47`, accent vàng `#F7C400`, đỏ `#E11D2C`, text trắng. Headline Bebas Neue/Anton; body Be Vietnam Pro Medium.
8. **Template:** Canva search "sport infographic vertical 4:5". Aspect 4:5 (1080×1350). Tham khảo "THIRD SHOT DROP 2026".
9. **Check Canva:** Tiếng Việt đủ dấu · logo rõ · ảnh thật ≥40% · footer đủ · export PNG 1080×1350.
```

Mẫu trên **920 ký tự** — chắc chắn vừa Telegram.

---

## Liên quan

- `skills/tao-creative-fb/SKILL.md` — skill chính (caption + hashtag + image + checklist).
- `skills/tao-creative-fb/references/content-angles.md` — danh sách góc + hook.
- `skills/tao-creative-fb/references/image-prompt-rules.md` — đầy đủ rule LANE A/B/C.

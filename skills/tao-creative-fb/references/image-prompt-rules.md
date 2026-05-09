# Quy tắc ảnh & prompt cho post FB — Coach PPR / pickleball30phut.com

> **Insight 2026 (đã test thực tế Day 17):**
> 1. **DALL·E 3 fail typography Tiếng Việt** — sai chính tả nặng, không dùng được cho infographic.
> 2. **`gpt-image-1`** (model mới của OpenAI) photoreal hơn, ít "AI-look" hơn, typography tốt hơn — **dùng model này** cho LANE C, KHÔNG dùng `dall-e-3`.
> 3. **Infographic chuyên nghiệp** (như "Third Shot Drop", "AI tự kêu mình", "Tri thức của bạn phải có hình dạng") — đều là **Canva template + ảnh thật + typography manual**, KHÔNG phải AI generate trong 1 cú.
> 4. AI **không bao giờ** generate face thật của Coach Thuận đẹp như ảnh thật. Mọi cố ép → ra mặt nhựa, độc giả nhận ra ngay.

---

## 3 LANE bắt buộc chọn 1 trước khi viết output

| LANE | Khi dùng | Bot output | Coach làm gì |
|------|----------|------------|--------------|
| **A. Canva Spec Sheet** | **Mặc định** cho post viral / checklist / "X điều cần biết" / infographic chuyên nghiệp | **Markdown spec sheet tiếng Việt** (headline exact, 4–5 bullet, brand color, font, slot ảnh, brand element) | Mở Canva → tìm template "Sport Infographic Vertical" → paste headline + bullet + chèn 2–3 ảnh thật → export. **5 phút.** |
| **B. Lifestyle photo (chất đời)** | Storytelling, behind the scenes, ảnh Coach + gia đình / sân thật | **KHÔNG generate**. Bot xuất **Photo brief tiếng Việt** | Coach tự chụp bằng phone hoặc chọn ảnh sẵn có |
| **C. B-roll / scene** | Ảnh minh hoạ paddle / ball / sân, không có face cận cảnh | Prompt English cho **`gpt-image-1`** (KHÔNG `dall-e-3`) | Đăng trực tiếp hoặc làm cover |

→ Output **phải bắt đầu bằng dòng `LANE: A | B | C`** để Coach biết chiều xử lý tiếp theo.

---

## LANE A — Canva Spec Sheet (PRIMARY, dùng cho 80% bài)

Bot **không** gọi DALL·E. Xuất spec sheet tiếng Việt theo đúng format dưới (Coach copy paste vào Canva):

### Format bắt buộc

```markdown
LANE: A — Canva Spec Sheet

## 1. Hook chính (vào Canva làm headline lớn)
[Hook viral 8–14 từ tiếng Việt, viết HOA, rõ Tiếng Việt có dấu, dùng dấu chấm cảm hoặc hỏi nếu hợp]

## 2. Sub-headline (dòng 2 nhỏ hơn, optional)
[6–12 từ giải thích / câu hỏi phụ — có thể bỏ qua]

## 3. Bullet ý chính (3–5 ý, mỗi ý ≤ 8 từ + 1 dòng giải thích ngắn ≤ 12 từ)
1. **[Bullet 1 viết HOA]** — [giải thích 1 dòng]
2. **[Bullet 2]** — [giải thích]
3. **[Bullet 3]** — [giải thích]
4. **[Bullet 4]** — [giải thích]
5. **[Bullet 5]** — [giải thích]

## 4. Quote box (1 câu chốt — placement giữa hoặc dưới)
"[Câu chốt 8–18 từ — viết HOA phần nhấn]"

## 5. Brand element (footer)
- Logo PPR top-right (đã có sẵn trong Canva brand kit)
- Footer: pickleball30phut.com · Zalo Coach PPR · 0919.117.687
- Domain hover: nếu post lead thì thêm "Tải lộ trình 30 phút free → link bio"

## 6. Slot ảnh thật (Coach chèn trong Canva)
- Slot lớn (center hoặc right 50%): [mô tả ảnh — vd: "Coach mid-swing forehand, áo PPR trắng, sân indoor đêm" → dùng `public/coach-action-1.jpg` nếu có]
- Slot nhỏ 1: [mô tả — vd: "Coach hạ thấp trọng tâm thủ"]
- Slot nhỏ 2: [mô tả — vd: "Coach giao bóng"]
- Optional thêm 1–2 slot nếu bullet ≥ 5

## 7. Color & font (paste vào Canva style)
- Background: dark navy `#0E2A47` hoặc đen `#0B0B0B` (theo brand "Third Shot Drop" / "AI tự kêu mình")
- Accent: vàng `#F7C400` (highlight số / hook keyword)
- Brand red: `#E11D2C` (logo PPR + tag số bullet)
- Text chính: trắng `#FFFFFF`
- Headline font: Bebas Neue / Anton / Montserrat Black (sans-serif đậm, all caps)
- Body font: Montserrat / Be Vietnam Pro Medium

## 8. Canva template gợi ý
- Search Canva: "sport infographic vertical 4:5", "fitness checklist Vietnamese", "tips poster red navy"
- Aspect ratio: **4:5 (1080x1350)** cho FB feed; hoặc **1:1 (1080x1080)** cho carousel
- Tham khảo style: ảnh "NÂNG TRÌNH với THIRD SHOT DROP 2026" của Coach (đã có)

## 9. Checklist Canva trước khi export
- [ ] Tiếng Việt có dấu đầy đủ, không sai chính tả
- [ ] Logo PPR rõ, không che ảnh chính
- [ ] Ảnh thật Coach chiếm ≥ 40% diện tích (giống ảnh "Third Shot Drop")
- [ ] Footer có domain + Zalo
- [ ] Export PNG 1080x1350 (FB feed) hoặc 1080x1920 (story)
```

### Cách dùng spec này

Coach mở Canva → search template → kéo bullet trong spec vào headline + cards → chèn ảnh thật từ `public/` → export. Total **5 phút**.

---

## LANE B — Photo brief (KHÔNG dùng AI generate ảnh)

Bot **không** gọi Images API. Xuất Photo brief tiếng Việt:

```markdown
LANE: B — Photo brief

### Subject
Coach Thuận, [áo polo PPR trắng / áo đen Brainmaker / mặc đồ thường], [biểu cảm: tập trung / cười / nghiêm túc]

### Bối cảnh
[Sân indoor đêm / sân outdoor sáng / nhà / cà phê / bàn làm việc với laptop & phone]

### Action
[Mid-swing forehand / hạ thấp thủ / cầm phone đọc bot / về nhà ôm con / cầm cà phê]

### Mood
[Năng lượng / chất đời / ấm áp gia đình / tập trung công việc]

### Ánh sáng
[Đèn sân ấm vàng buổi tối / nắng tự nhiên ban ngày / đèn cà phê warm tone]

### Khung hình
[Dọc 4:5 (FB feed) / vuông 1:1 / ngang 16:9 (cover)]

### Tránh
- Filter làm da quá mịn / beauty AI
- Background lộn xộn / có người lạ / có brand khác
- Quần áo không thuộc PPR / Brainmaker

### Gợi ý ảnh có sẵn (kiểm tra public/)
- public/coach-avatar.png (portrait)
- [bot tự rà thư mục public/ và đề xuất nếu thấy có ảnh phù hợp]

### Nếu Coach không có ảnh phù hợp
→ Lên lịch tự shoot **1 buổi 30 phút** với phone (đèn tự nhiên) — không cần studio.
→ Tạm thay bằng **LANE A (Canva Spec Sheet)** kèm ảnh sẵn có cho bài này.
```

---

## LANE C — B-roll / scene prompt (English, cho `gpt-image-1`)

Subject **không có face cận cảnh**. Cho phép paddle, ball, sân, dụng cụ, hoặc người ở góc xa / silhouette / chụp lưng.

### Mẫu prompt LANE C (paste vào API call)

```
LANE: C
Photorealistic close-up of a white pickleball paddle and yellow pickleball resting on a vibrant blue outdoor court surface, golden hour soft sunlight, shallow depth of field, sharp focus on paddle texture, sport documentary style, shot on Sony A7IV 50mm f/1.8.
No human face, no logos, no text overlay, no watermark, no anime, no cartoon, no 3D render, no digital painting.
```

### API call (model BẮT BUỘC = `gpt-image-1`)

```bash
POST https://api.openai.com/v1/images/generations
{
  "model": "gpt-image-1",
  "prompt": "<LANE C prompt>",
  "size": "1024x1024",
  "n": 1
}
```

Response trả `b64_json` (không phải URL như DALL·E 3) → decode base64 → save PNG.

### Anti-AI-look magic phrases (luôn thêm cuối prompt LANE C)

`shot on real camera, natural lighting, real material texture, sport documentary photography, no smooth airbrush, no plastic skin, no anime, no cartoon, no 3D render, no digital painting, no fake AI person, no Vietnamese text overlay`

---

## Vì sao bỏ DALL·E 3 cho Tiếng Việt?

| Vấn đề | DALL·E 3 | `gpt-image-1` |
|---|---|---|
| Chính tả Tiếng Việt | **Hỏng nặng** ("DAMI", "VANI", "STZA") | Khá hơn nhưng **vẫn không đủ tin** cho production |
| Photoreal | "Chất AI" / hoạt hình | Tốt hơn rõ rệt |
| Reference image | Không support | **Có support** (image input) |
| Kích thước | 1024x1024 / 1024x1792 / 1792x1024 | Linh hoạt hơn |

**Quy tắc cứng:** Bất cứ ảnh nào cần **typography Tiếng Việt** → LANE A (Canva). Không cố ép bất kỳ AI image model nào.

---

## Brand-safety checklist (mọi LANE)

- [ ] Không có logo Meta / Google / OpenAI / brand môn thể thao khác trong ảnh.
- [ ] Pickleball: paddle mặt phẳng đặc, ball nhựa lỗ tròn (giống wiffle ball), sân nhỏ hơn tennis. Không lẫn racket tennis / cầu lông / padel.
- [ ] Tiếng Việt trong ảnh phải có dấu đầy đủ, không sai chính tả → bắt buộc dùng LANE A (Canva).
- [ ] Nếu cần ảnh có Coach → LANE B (ảnh thật) hoặc LANE A (chèn ảnh thật vào Canva).

---

## Khi nào fallback giữa các LANE?

- Coach yêu cầu "ảnh giống người thật / chất đời / có mặt Coach" → **LANE B**.
- Coach muốn post viral / "X điều cần biết" / "5 lỗi phổ biến" → **LANE A**.
- Coach chỉ cần ảnh minh hoạ paddle / ball / sân không người → **LANE C** với `gpt-image-1`.
- **Không bao giờ** dùng `dall-e-3` cho tiếng Việt overlay.

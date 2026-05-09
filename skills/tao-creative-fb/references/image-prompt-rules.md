# Quy tắc ảnh & prompt cho post FB — Coach PPR / pickleball30phut.com

> **Insight quan trọng (2026):** DALL·E 3 / `gpt-image-1` **không** sinh được mặt thật của Coach Thuận. Mọi cố ép → ra mặt "AI-look" / hoạt hình / nhựa, độc giả nhận ra ngay và mất tin tưởng.
> ⇒ **Quy tắc số 1:** AI **không** generate face người Việt cụ thể. Thay vào đó, chia 3 lane bên dưới và để Coach **chèn ảnh thật** ở khâu Canva.

---

## 3 LANE bắt buộc chọn 1 trước khi viết prompt

| LANE | Khi dùng | AI làm gì | Coach làm gì |
|------|----------|-----------|--------------|
| **A. Infographic** | Bài viral kiểu "5 câu nói Coach", "3 lỗi nhập môn", checklist, top tips | Sinh **layout + typography Tiếng Việt + brand color + icon vector** (KHÔNG có face người) | Mở Canva, **chèn ảnh thật** Coach vào slot trống / silhouette + đăng |
| **B. Lifestyle photo (chất đời)** | Bài storytelling, behind the scenes, ảnh Coach + gia đình / sân thật | **KHÔNG generate**. Bot xuất **Photo brief** (gợi ý setup chụp / chọn ảnh từ kho có sẵn) | Tự chụp bằng phone hoặc chọn ảnh thật đã có |
| **C. B-roll / scene (không có người)** | Cần ảnh minh hoạ: paddle, ball, sân, dụng cụ, cảnh sân từ xa | Sinh ảnh photoreal **không có face cận cảnh** (paddle close-up, ball trên sân, sân nhìn từ trên) | Đăng trực tiếp hoặc làm cover |

→ Output prompt **phải bắt đầu bằng dòng** `LANE: A` / `LANE: B` / `LANE: C` để Coach biết chiều xử lý tiếp theo.

---

## LANE A — Infographic prompt (English, cho DALL·E 3 / gpt-image-1)

### Cấu trúc bắt buộc

1. **Hook viral tiếng Việt** (8–14 từ, đặt trong dấu nháy kép trong prompt) — ví dụ: `"5 câu nói Coach giúp bạn tiến bộ mỗi ngày"`.
2. **3–5 ý chính** (mỗi ý ≤8 từ tiếng Việt, đánh số 1–5).
3. **Layout style:** `vertical 1024x1024 OR 1024x1792 modern sport infographic, bold sans-serif Vietnamese typography, brand colors red #E11D2C white and navy blue, clean grid, numbered cards 1 to 5, icon vector flat style for each point`.
4. **Slot ảnh thật:** `leave 3 to 5 empty rounded photo frames (placeholder gray) where real photos of the coach will be inserted later in Canva — DO NOT draw any human face inside these frames`.
5. **Brand:** `small "PPR PICKLEBALL" wordmark top-right, no other logos`.
6. **Negative:** `no realistic human face, no anime character, no cartoon mascot, no fake AI person, no watermark, no English-only text, no spelling errors in Vietnamese`.

### Mẫu prompt LANE A (paste vào Images API)

```
LANE: A
Vertical sport infographic poster 1024x1792, modern Vietnamese pickleball brand style.
Title at top in bold sans-serif Vietnamese: "5 CÂU NÓI COACH HAY NHẤT GIÚP BẠN TIẾN BỘ MỖI NGÀY".
Brand colors: red #E11D2C, navy blue, white. Small "PPR PICKLEBALL" wordmark top-right.
Below title: 5 numbered cards (1 to 5), each with a small flat-vector pickleball icon (paddle, ball, court, target, trophy) and a short Vietnamese phrase under it, placeholder text:
1. "HẠ THẤP TRỌNG TÂM"
2. "CẦM VỢT NHẸ TAY"
3. "GIAO BÓNG THẤP NHANH"
4. "VỀ TƯ THẾ THỦ NGAY"
5. "TẬP DINK MỖI BUỔI"
Between cards leave 3 empty rounded photo frames with light gray placeholder fill — DO NOT draw any human, face, or character inside these frames; they will be replaced with real coach photos in Canva.
Bottom strip: 4 small icon labels "KỸ THUẬT ĐÚNG · TƯ DUY ĐÚNG · KỶ LUẬT ĐÚNG · KẾT QUẢ SẼ ĐẾN".
Style: flat clean modern, sharp typography, no realistic human face anywhere, no anime, no cartoon mascot, no watermark, no fake AI person.
```

---

## LANE B — Photo brief (KHÔNG dùng AI generate ảnh)

Bot **không** xuất prompt DALL·E. Thay vào đó xuất **Photo brief tiếng Việt** ngắn để Coach tự chụp / chọn ảnh:

```
### Photo brief (Coach tự chụp hoặc chọn từ kho ảnh)

- Subject: Coach Thuận (áo polo PPR / áo thể thao trắng), [bối cảnh: sân indoor / về nhà ôm con / cầm paddle...]
- Action: [mid-swing / đi bộ vào nhà / setup paddle...]
- Mood: thật, đời thường, không pose cứng
- Ánh sáng: ánh sáng tự nhiên ban ngày HOẶC đèn sân ấm buổi tối
- Khung: dọc 4:5 (tối ưu FB feed) hoặc vuông 1:1
- Tránh: filter làm da quá mịn, beauty AI, background lộn xộn
- Gợi ý ảnh có sẵn: [tên file trong public/ nếu Coach đã có — ví dụ public/coach-avatar.png]
```

Lý do: với Coach mặt người Việt cụ thể, AI generate luôn bị **"chất AI"** lộ liễu. Ảnh thật + caption hay = engagement thật.

---

## LANE C — B-roll / scene prompt (English, cho DALL·E 3)

Subject **không có face cận cảnh**. Cho phép paddle, ball, sân, dụng cụ, hoặc người ở góc xa / silhouette / chụp lưng.

### Mẫu prompt LANE C

```
LANE: C
Photorealistic close-up of a white pickleball paddle and yellow pickleball resting on a vibrant blue outdoor court surface, golden hour soft sunlight, shallow depth of field, sharp focus on paddle texture, sport documentary style, shot on Sony A7IV 50mm f/1.8.
No human face, no logos, no text overlay, no watermark, no anime, no cartoon, no 3D render, no digital painting.
```

### Anti-AI-look magic phrases (thêm cuối mọi prompt LANE C)

`shot on real camera, natural lighting, real material texture, sport documentary photography, no smooth airbrush, no plastic skin, no anime, no cartoon, no 3D render, no digital painting, no fake AI person`

---

## Brand-safety checklist (cho mọi LANE)

- [ ] Không có logo Meta / Google / OpenAI / brand môn thể thao khác trong ảnh.
- [ ] Không sai dụng cụ (pickleball paddle ≠ tennis racket ≠ ping pong paddle ≠ padel racket).
- [ ] Pickleball: paddle mặt phẳng đặc, ball nhựa lỗ tròn (giống wiffle ball), sân nhỏ hơn tennis.
- [ ] Tiếng Việt trong ảnh phải có dấu đầy đủ, không sai chính tả.
- [ ] Nếu LANE A có placeholder ảnh thật → ghi rõ "DO NOT draw any human inside these frames".

---

## Khi nào fallback sang LANE B?

Nếu Coach yêu cầu ảnh **giống người thật / chất đời / có mặt Coach** → **luôn** chuyển sang LANE B (Photo brief). Đừng cố ép DALL·E.

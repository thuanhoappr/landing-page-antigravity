---
name: tao-creative-fb
description: Sinh nội dung Facebook cho pickleball30phut.com — Mode 1 (bài organic miễn phí, giá trị + CTA nhẹ) và Mode 2 (creative ads — headline, primary text, mô tả ảnh, CTA cho Ads Manager). Dùng khi Coach nói "tao creative fb", "ý tưởng post fb", "caption facebook pickleball", "mode 1 creative fb", "mode 2 ads pickleball", "viết bài page không quảng cáo", hoặc sau cron 9h sáng Day 17. Bám brand voice Coach PPR trong vault [[brand-voice]]. Không tự đăng FB; không hứa kết quả; không giảm giá nếu Coach không yêu cầu.
license: MIT
metadata:
  author: Coach PPR — pickleball30phut.com
  version: 1.0.0
  category: social-content
  tags: [facebook, pickleball, vietnamese, dalle, caption]
---

# tao-creative-fb — Creative Facebook cho Coach PPR

Skill Day 17 — **hai mode trong một file**. Luôn đọc `references/content-angles.md` và `references/image-prompt-rules.md` trước khi sinh output cuối.

---

## Chọn mode (bắt buộc)

Trước khi viết, xác nhận với Coach **hoặc** infer từ lệnh:

| Mode | Khi nào | Output |
|------|---------|--------|
| **Mode 1 — Content Free** | Bài Page organic, nuôi cộng đồng, không chạy ads | Caption đăng Page + gợi ý hashtag + **prompt ảnh** (English, cho DALL-E / Images API) |
| **Mode 2 — Creative Ads** | Chuẩn bị paste vào Meta Ads Manager (thủ công) | Headline + Primary text + Description + CTA button label + **prompt ảnh quảng cáo** |

Nếu Coach không nói mode → hỏi 1 câu: *"Anh muốn Mode 1 (bài organic) hay Mode 2 (creative ads)?"*

---

## Đầu vào tối thiểu

1. **Góc nội dung** — chọn 1 từ `references/content-angles.md` hoặc Coach tự nêu (vd: "lỗi nhập môn", "người bận rộn").
2. **Tuỳ chọn:** link landing `https://pickleball30phut.com`, tên khóa, giá (chỉ khi Coach cung cấp — không bịa).

---

## Brand voice (bắt buộc)

- Tiếng Việt, **câu ngắn**, gần gũi, mộc mạc — bám `vault-ready/brand-voice.md` hoặc vault `[[brand-voice]]`.
- **Từ hay dùng:** thật ra, đơn giản thôi, thử xem, không cần phức tạp, nó giống như là.
- **Tránh:** synergy, leverage, tối ưu hóa trải nghiệm, giọng corporate.
- **Emoji:** ít (0–2), không spam.
- **CTA:** nhẹ — "thử xem", "ghé link quà free", không hô hào "mua ngay".

---

## Mode 1 — Content Free (organic)

**Output** theo đúng thứ tự:

```markdown
## Mode 1 · [Tên góc ngắn]

### Caption (dán Page)
[120–400 từ tiếng Việt, đoạn ngắn, có 1 CTA nhẹ tới link quà / landing nếu phù hợp]

### Hashtag gợi ý (5–8 cái, tiếng Việt / không dấu tùy platform)
#...

### Prompt ảnh (English — cho OpenAI Images / DALL·E)
[Một đoạn tiếng Anh duy nhất, tuân references/image-prompt-rules.md]

### Checklist trước khi đăng
- [ ] Không hứa kết quả / không giá ảo
- [ ] CTA nhẹ, đúng brand voice
```

---

## Mode 2 — Creative Ads

**Output** (để Coach paste vào Ads Manager — **không** tự chạy ads):

```markdown
## Mode 2 · Creative Ads · [Tên góc]

### Headline (≤40 ký tự khuyến nghị)
...

### Primary text (≤125 ký tự cho một biến thể ngắn; có thể thêm bản dài ở dưới)
...

### Description (tuỳ placement)
...

### CTA button label gợi ý
[Một trong: Tìm hiểu thêm / Đăng ký / Nhận ưu đãi / Liên hệ — chọn 1 phù hợp]

### Prompt ảnh quảng cáo (English)
[Một đoạn, tuân image-prompt-rules.md — rõ subject, ánh sáng, không text overlay trong ảnh nếu có thể]

### Lưu ý
- Đây là **nháp** — Coach chỉnh sau khi xem Ads Manager preview.
- Không cam kết CPA/CTR.
```

---

## OpenAI Images / Chat (khi agent có tool)

- **Caption / headline:** model text (gpt-4o-mini hoặc gpt-4o).
- **Ảnh:** sau khi có prompt English ở trên — gọi Images API (`dall-e-3` hoặc `gpt-image-1` tuỳ dashboard) với prompt đó; hoặc Coach chạy tay trong Playground.

Agent **không** để lộ API key trong output.

---

## Xử lý khi thiếu vault

Nếu không đọc được `brand-voice`: dùng tóm tắt trong **Brand voice** phần trên của file này + `references/content-angles.md`.

---

## Files tham chiếu

- `references/content-angles.md` — danh sách góc + hook mẫu.
- `references/image-prompt-rules.md` — quy tắc prompt ảnh an toàn brand.

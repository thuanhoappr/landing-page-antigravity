---
name: tao-creative-fb
description: Sinh nội dung Facebook cho pickleball30phut.com — Mode 1 (bài organic miễn phí, giá trị + CTA nhẹ) và Mode 2 (creative ads — headline, primary text, mô tả ảnh, CTA cho Ads Manager). Dùng khi Coach nói "tao creative fb", "ý tưởng post fb", "caption facebook pickleball", "mode 1 creative fb", "mode 2 ads pickleball", "viết bài page không quảng cáo", hoặc sau cron 9h sáng Day 17. Bám brand voice Coach PPR trong vault [[brand-voice]]. Không tự đăng FB; không hứa kết quả; không giảm giá nếu Coach không yêu cầu.
license: MIT
metadata:
  author: Coach PPR — pickleball30phut.com
  version: 1.2.0
  category: social-content
  tags: [facebook, pickleball, vietnamese, gpt-image-1, canva, caption, infographic, lane-system]
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

## Chọn LANE ảnh (bắt buộc, trước khi viết)

Đọc `references/image-prompt-rules.md` rồi chọn **1 trong 3**:

- **LANE A — Canva Spec Sheet** (mặc định cho bài viral / "X điều cần biết" / infographic). Bot xuất **markdown spec sheet tiếng Việt** — Coach paste vào Canva → 5 phút có ảnh đẹp. **KHÔNG dùng DALL·E** (typography Tiếng Việt fail).
- **LANE B — Lifestyle photo** (storytelling / behind the scenes — KHÔNG generate, xuất Photo brief để Coach tự chụp / chọn ảnh sẵn có).
- **LANE C — B-roll / scene** (paddle / ball / sân, không face cận cảnh — dùng `gpt-image-1`, KHÔNG `dall-e-3`).

**Quy tắc cứng:**
1. AI **không bao giờ** generate face thật của Coach. Coach yêu cầu "ảnh giống người thật / chất đời / có mặt Coach" → **luôn** chuyển sang LANE B.
2. Bất kỳ ảnh nào có **chữ Tiếng Việt overlay** → **luôn** chuyển sang LANE A (Canva). Không ép DALL·E / gpt-image-1 viết tiếng Việt — sai chính tả nặng.

Mặc định LANE theo góc nội dung —

| Góc (`content-angles.md`) | LANE mặc định |
|---|---|
| A1 Người bận rộn, A3 Lỗi nhập môn, A2 Ngại ra sân | **A** (Canva spec sheet) |
| A6 Behind the scenes, A4 Đôi/phối hợp story | **B** (lifestyle photo) |
| A5 Quà miễn phí | **A** (lead magnet checklist) |
| A7 So sánh | **A** hoặc **C** (b-roll) |

Output **phải có dòng `LANE: A | B | C` ngay đầu section ảnh**.

---

## Mode 1 — Content Free (organic)

> **Bắt buộc:** mọi lần chạy Mode 1 phải xuất **đủ 4 section** — Caption, Hashtag, **Image (theo LANE đã chọn)**, Checklist. Thiếu 1 section → coi như **fail**, agent **phải tự bổ sung** trước khi kết thúc turn (không đợi user nhắc).

**Output** theo đúng thứ tự:

```markdown
## Mode 1 · [Tên góc ngắn] · LANE [A|B|C]

### Caption (dán Page)
[120–400 từ tiếng Việt, đoạn ngắn, có 1 CTA nhẹ tới link quà / landing nếu phù hợp]

### Hashtag gợi ý (5–8 cái, tiếng Việt / không dấu tùy platform)
#...

### Image — LANE [A|B|C]
- **LANE A (Canva Spec Sheet):** xuất **markdown spec tiếng Việt 9 phần** theo `image-prompt-rules.md` (Hook / Sub-headline / 3–5 Bullet / Quote box / Brand element / Slot ảnh thật / Color & font / Canva template gợi ý / Checklist export). KHÔNG xuất prompt DALL·E.
- **LANE B (Lifestyle photo):** xuất **Photo brief tiếng Việt** (Subject / Bối cảnh / Action / Mood / Ánh sáng / Khung / Tránh / Gợi ý ảnh sẵn có trong `public/`). KHÔNG gọi Images API.
- **LANE C (B-roll):** prompt English bắt đầu `LANE: C`, subject paddle/ball/sân, kèm anti-AI-look magic phrases. Model = `gpt-image-1` (KHÔNG `dall-e-3`).

### Checklist trước khi đăng
- [ ] LANE đã khai báo rõ ở đầu section ảnh
- [ ] Không hứa kết quả / không giá ảo
- [ ] CTA nhẹ, đúng brand voice
- [ ] LANE A → Coach đã có ảnh thật để chèn Canva (kiểm tra `public/`)
- [ ] LANE B → Coach đã chọn / chụp được ảnh thật (không dùng AI face)
- [ ] LANE C → đã dùng `gpt-image-1`, không phải `dall-e-3`
```

---

## Mode 2 — Creative Ads

> **Bắt buộc:** mọi lần chạy Mode 2 phải xuất **đủ 6 section** — Headline, Primary text, Description, CTA button label, **Image (theo LANE)**, Lưu ý. Thiếu section → tự bổ sung trước khi kết thúc turn.
>
> **Khuyến nghị LANE cho Mode 2 ads:**
> - **LANE A** (infographic) khi muốn ad dạng checklist / so sánh / "X điều cần biết" — CTR thường cao với mobile feed.
> - **LANE B** (lifestyle photo có Coach) cho ads tin tưởng / personal brand — Coach phải chuẩn bị ảnh thật, KHÔNG AI face.
> - **LANE C** (b-roll paddle/sân) cho ads brand awareness, an toàn nhất khi không có ảnh thật.

**Output** (để Coach paste vào Ads Manager — **không** tự chạy ads):

```markdown
## Mode 2 · Creative Ads · [Tên góc] · LANE [A|B|C]

### Headline (≤40 ký tự khuyến nghị)
...

### Primary text (≤125 ký tự cho một biến thể ngắn; có thể thêm bản dài ở dưới)
...

### Description (tuỳ placement)
...

### CTA button label gợi ý
[Một trong: Tìm hiểu thêm / Đăng ký / Nhận ưu đãi / Liên hệ — chọn 1 phù hợp]

### Image — LANE [A|B|C]
- **LANE A (Canva Spec Sheet):** spec tiếng Việt 9 phần (xem image-prompt-rules.md). Coach chỉnh trên Canva. Lưu ý ad: tránh text > 20% diện tích ảnh nếu có thể (Meta khuyến nghị).
- **LANE B (Lifestyle photo):** Photo brief tiếng Việt — Coach chụp / chọn ảnh thật. KHÔNG AI.
- **LANE C (B-roll):** prompt English `LANE: C …`, dùng `gpt-image-1` (KHÔNG `dall-e-3`).

### Lưu ý
- Đây là **nháp** — Coach chỉnh sau khi xem Ads Manager preview.
- Không cam kết CPA/CTR.
- AI **không** generate face thật Coach. Ảnh có Coach = ảnh thật chụp tay.
- AI **không** viết Tiếng Việt trên ảnh. Mọi text Tiếng Việt → Canva (LANE A).
```

---

## OpenAI Images / Chat (khi agent có tool)

- **Caption / headline:** model text (gpt-4o-mini hoặc gpt-4o).
- **Ảnh:**
  - **LANE A:** **KHÔNG** gọi Images API. Trả Canva Spec Sheet — Coach làm trên Canva.
  - **LANE B:** **KHÔNG** gọi Images API. Trả Photo brief để Coach chụp / chọn ảnh thật.
  - **LANE C:** gọi `POST /v1/images/generations` với `model: "gpt-image-1"` (KHÔNG `dall-e-3`); size `1024x1024` mặc định. Response trả `b64_json` → decode base64 → save PNG.
- Trước khi gọi Images API (LANE C only), **kiểm tra prompt** có dòng `LANE: C` ở đầu, có negative anti-face + anti-AI-look, không yêu cầu chữ Tiếng Việt overlay. Thiếu → tự bổ sung.

Agent **không** để lộ API key trong output.

---

## Xử lý khi thiếu vault

Nếu không đọc được `brand-voice`: dùng tóm tắt trong **Brand voice** phần trên của file này + `references/content-angles.md`.

---

## Files tham chiếu

- `references/content-angles.md` — danh sách góc + hook mẫu.
- `references/image-prompt-rules.md` — quy tắc prompt ảnh an toàn brand.

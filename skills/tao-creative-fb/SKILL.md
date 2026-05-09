---
name: tao-creative-fb
description: Sinh nội dung Facebook cho pickleball30phut.com — Mode 1 (bài organic miễn phí, giá trị + CTA nhẹ) và Mode 2 (creative ads — headline, primary text, mô tả ảnh, CTA cho Ads Manager). Dùng khi Coach nói "tao creative fb", "ý tưởng post fb", "caption facebook pickleball", "mode 1 creative fb", "mode 2 ads pickleball", "viết bài page không quảng cáo", hoặc sau cron 9h sáng Day 17. Bám brand voice Coach PPR trong vault [[brand-voice]]. Không tự đăng FB; không hứa kết quả; không giảm giá nếu Coach không yêu cầu.
license: MIT
metadata:
  author: Coach PPR — pickleball30phut.com
  version: 1.3.0
  category: social-content
  tags: [facebook, pickleball, vietnamese, gpt-image-1, canva, caption, infographic, lane-system]
---

# tao-creative-fb — Creative Facebook cho Coach PPR

Skill Day 17 — **hai mode trong một file**. Luôn đọc `references/content-angles.md` và `references/image-prompt-rules.md` trước khi sinh output cuối.

---

## Chọn mode (bắt buộc)

Trước khi viết, xác nhận với Coach **hoặc** infer từ lệnh:

| Mode | Khi nào | Output (đủ section bắt buộc) |
|------|---------|------|
| **Mode 1 — Content Free** | Bài Page organic, nuôi cộng đồng, không chạy ads | **4 section**: Caption · Hashtag · **Image (Canva Spec Sheet hoặc Photo brief, KHÔNG prompt DALL-E)** · Checklist |
| **Mode 2 — Creative Ads** | Chuẩn bị paste vào Meta Ads Manager (thủ công) | **6 section**: Headline · Primary text · Description · CTA button · **Image (Canva Spec / Photo brief / B-roll)** · Lưu ý |

Nếu Coach không nói mode → hỏi 1 câu: *"Anh muốn Mode 1 (bài organic) hay Mode 2 (creative ads)?"*

> **HARD GATE (v1.2.1):** thiếu bất kỳ section nào trong Mode 1/Mode 2 = **TURN FAIL**. Riêng section **Image LANE A phải có đủ 9 mục đánh số** (Hook / Sub / Bullet / Quote / Brand / Slot ảnh / Color / Template / Check). Trước khi gửi tin cuối, **agent tự kiểm**: nếu output chỉ có Caption + Hashtag → tự bổ sung Image + Checklist, KHÔNG gửi câu nào kèm "anh có muốn em viết tiếp không" — viết luôn.
>
> **TELEGRAM SIZE RULE:** giới hạn 1 tin Telegram là ~4000 ký tự. Để chắc ăn, dùng **format LANE A compact** (1 dòng / mục) — full Mode 1 < 3500 ký tự, gói gọn trong **1 message duy nhất**. Cấm chia 2 message, cấm dừng nửa chừng. Nếu chữ vẫn dài → rút bớt Caption (không bao giờ rút Image LANE A 9 mục).

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

> **Bắt buộc:** mọi lần chạy Mode 1 phải xuất **đủ 4 section** theo **THỨ TỰ ƯU TIÊN MỚI (v1.3)**: Image LANE → Caption → Checklist → Hashtag. Thứ tự này **KHÔNG được đổi** — vì nếu Telegram cắt thì cắt phần Hashtag (Coach tự gõ được), KHÔNG cắt Image LANE A (Coach không tự nghĩ ra Canva spec).
>
> **Caption ngắn:** v1.3 ép Caption **≤ 80 từ tiếng Việt** (không phải 120–400). Lý do: bảo toàn token budget cho Image LANE A 9 mục. Coach có thể tự viết dài thêm sau.

**Output** theo đúng thứ tự (Image LANE đầu tiên):

```markdown
## Mode 1 · [Tên góc ngắn] · LANE [A|B|C]

### Image — LANE [A|B|C]
- **LANE A (Canva Spec, COMPACT 1 dòng/mục, 9 mục đánh số):** Hook · Sub · 5 Bullet · Quote · Brand · Slot ảnh · Color/Font · Template · Check Canva. Bám WORKED EXAMPLE bên dưới. **KHÔNG** xuất prompt DALL·E. **KHÔNG** xuống dòng nhiều cho 1 mục — 1 mục = 1 dòng.
- **LANE B (Lifestyle photo):** Photo brief 1 dòng/mục (Subject · Bối cảnh · Action · Mood · Ánh sáng · Khung · Tránh · Gợi ý ảnh `public/`). KHÔNG gọi Images API.
- **LANE C (B-roll):** prompt English bắt đầu `LANE: C`, subject paddle/ball/sân, kèm anti-AI-look magic phrases. Model = `gpt-image-1` (KHÔNG `dall-e-3`).

### Caption (≤80 từ)
[Caption tiếng Việt cực ngắn, 60–80 từ, đoạn ngắn, có 1 CTA nhẹ. Coach có thể tự viết dài thêm khi đăng FB.]

### Checklist trước khi đăng
- [ ] LANE rõ · Không hứa kết quả · CTA nhẹ
- [ ] LANE A: có ảnh thật trong `public/` để chèn Canva
- [ ] LANE B: có ảnh thật chụp tay (không dùng AI face)
- [ ] LANE C: đã dùng `gpt-image-1`

### Hashtag (5–8 cái)
#...
```

> **Fallback nếu Telegram vẫn cắt:** Coach có thể gõ skill phụ **`tao canva spec góc XX`** (skill `tao-canva-spec`) để xin riêng phần Image LANE A — output siêu ngắn ~900 ký tự, chắc chắn không bị cắt.

---

### WORKED EXAMPLE — Mode 1 · góc A3 · LANE A (v1.3, Image ĐẦU, Caption ngắn)

> Coach gõ: *"Mode 1, góc A3 lỗi nhập môn dân văn phòng"* → bot trả **CHÍNH XÁC** format dưới (~1800 ký tự, gói 1 tin Telegram). Image LANE A LÊN ĐẦU. Caption ≤ 80 từ. Không cắt, không hỏi tiếp.

```markdown
## Mode 1 · Lỗi nhập môn dân văn phòng · LANE A

### Image — LANE A (Canva Spec, 9 mục)
1. **Hook:** 5 LỖI NHẬP MÔN PICKLEBALL DÂN VĂN PHÒNG HAY MẮC
2. **Sub:** Sửa được trong 30 phút mỗi ngày — không cần ra sân nhiều.
3. **5 Bullet:** (1) ĐỨNG SAI CHỖ — quên về NVZ, mất thế · (2) VÀO BÓNG TRỄ — đợi bóng mới swing · (3) DINK CAO QUÁ LƯỚI — đối thủ smash trả · (4) GIAO BÓNG NHẢY CHÂN — bắt lỗi · (5) QUÊN VỀ THỦ — ăn phản đòn.
4. **Quote:** "Không cần đánh mạnh hơn. CẦN ĐÁNH ĐÚNG trước đã."
5. **Brand:** Logo PPR top-right · Footer: pickleball30phut.com · Zalo 0919.117.687 · CTA "Tải lộ trình 30' free trong link bio".
6. **Slot ảnh:** Slot lớn ~50% Coach mid-swing áo PPR sân indoor đêm; 2 slot nhỏ Coach hạ thấp thủ + Coach giao bóng (lấy `public/`).
7. **Color/Font:** BG navy `#0E2A47`, accent vàng `#F7C400`, đỏ `#E11D2C`, text trắng. Headline Bebas Neue/Anton; body Be Vietnam Pro Medium.
8. **Template:** Canva search "sport infographic vertical 4:5". Aspect 4:5 (1080×1350). Tham khảo "THIRD SHOT DROP 2026".
9. **Check Canva:** Tiếng Việt đủ dấu · logo rõ · ảnh thật ≥40% · footer đủ · export PNG 1080×1350.

### Caption (≤80 từ)
Dân văn phòng mới chơi pickleball hay mắc 5 lỗi này. Thật ra ai cũng từng — mình cũng vậy.

Đơn giản thôi: đánh đúng trước, đánh mạnh tính sau.

Mình có lộ trình 30 phút mỗi ngày, học online rồi ra sân thử. Anh em ghé link bio nhận lộ trình free.

— Coach PPR / pickleball30phut.com

### Checklist trước khi đăng
- [ ] LANE A đã khai báo · Không hứa kết quả · CTA nhẹ
- [ ] Có ảnh thật Coach để chèn Canva (`public/`)

### Hashtag
#pickleball #pickleballvietnam #coachppr #pickleball30phut #lonhapmonpickleball #danvanphongchoithethao
```

> Mẫu ~1800 ký tự — vừa 1 tin Telegram. **Image LANE A đầu tiên** vì Coach không tự viết được, đó là phần quý nhất của bot.

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

# Ngày 19 — Nộp bài: Sản phẩm số đầu tiên (Cẩm nang PDF)

Tài liệu **nội bộ thử thách** — không share link SOP admin ra nhóm công khai.

---

## Sản phẩm đã chốt

| Mục | Giá trị |
|-----|---------|
| Tên | Cẩm nang thực chiến Pickleball cho NewBie |
| Giá | **68.000đ** |
| Format | PDF ~30 phút đọc (16 trang Canva) |
| Avatar | `Day19-avatar.md` |
| Offer / trang bán | `Day19-offer.md` |
| Draft nội dung | `Day19-pdf-draft.md` |

---

## Checklist nộp Day 19

| # | Yêu cầu SOP | Trạng thái | Bằng chứng / việc cần làm |
|---|-------------|------------|---------------------------|
| 1 | 5 câu hỏi + chọn sản phẩm | ✅ | `Day19-avatar.md`, `Day19-offer.md` — chụp màn hình file hoặc Notion |
| 2 | Draft + Coach chỉnh sửa | ✅ | `Day19-pdf-draft.md` + Canva — chụp highlight chỉnh sửa |
| 3 | **File PDF hoàn chỉnh** | ✅ | `Cam-nang-Pickleball-Newbie (A4).pdf` (16 trang) |
| 4 | **Trang bán live** (6 phần) + checkout + thank-you/tải | 🔄 | URL: **`/san-pham/cam-nang-newbie`** — xem mục Triển khai bên dưới |
| 5 | **Test Sepay** 68k (VietQR + dashboard) | ⬜ | Tự mua thử trên mobile — chụp QR + SePay dashboard |
| 6 | Trang bán trên **mobile** | ⬜ | Chụp full scroll trang sản phẩm |
| 7 | **2 bài announce** có link | ⬜ | FB + Zalo (copy trong `Day19-offer.md` mục 12) |
| 8 | Bundle screenshot Demo Day | ⬜ | Gom 1 folder / 1 slide |

---

## Triển khai web (làm ngay sau PDF)

### Bước A — Upload PDF lên site

1. Export Canva: `Cam-nang-Pickleball-Newbie (A4).pdf`
2. Đổi tên (hoặc copy) thành: `public/downloads/Cam-nang-Pickleball-Newbie.pdf`
3. Deploy lên Vercel / VPS

### Bước B — Thêm sản phẩm trong Admin

1. Vào `https://pickleball30phut.com/admin`
2. Tab **Sản phẩm** → Thêm mới:
   - **Tên:** `Cẩm nang thực chiến Pickleball cho NewBie`
   - **Giá:** `68000`
   - **Tồn kho:** `9999` (số sản phẩm số)
3. Ghi lại **ID sản phẩm** (ví dụ `3`)

### Bước C — Biến môi trường (Vercel)

```env
CAM_NANG_PRODUCT_ID=3
SEPAY_PRODUCT_ID=3
NEXT_PUBLIC_SITE_URL=https://pickleball30phut.com
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
SEPAY_MERCHANT_ID=...
SEPAY_SECRET_KEY=...
```

*(Có thể chỉ dùng `SEPAY_PRODUCT_ID` nếu trùng ID cẩm nang.)*

### Bước D — Test end-to-end

1. Mở **`/san-pham/cam-nang-newbie`** trên điện thoại
2. Điền họ tên, SĐT, **email thật**
3. Thanh toán **68.000đ** qua SePay
4. Kiểm tra:
   - Trang `/thank-you?invoice=PB-...&product=cam-nang` có nút **Tải PDF**
   - Email Resend có link tải
   - Admin → Đơn hàng: `paid`

### Bước E — 2 bài announce (mẫu ngắn)

**Hook:** *Ra sân mà không biết Kitchen — thua vì rối, không phải vì yếu.*

**CTA:** `https://pickleball30phut.com/san-pham/cam-nang-newbie`

Đính kèm mockup 3D book / multi-device từ Canva.

---

## Link nộp nhanh cho người chấm

| Mục | Link / file |
|-----|-------------|
| Trang bán | https://pickleball30phut.com/san-pham/cam-nang-newbie |
| PDF (sau deploy) | https://pickleball30phut.com/downloads/Cam-nang-Pickleball-Newbie.pdf |
| Avatar / Offer | `Day19-avatar.md`, `Day19-offer.md` |

---

## Repo (code Day 19)

| File | Mục đích |
|------|----------|
| `src/app/san-pham/cam-nang-newbie/page.tsx` | Trang bán 6 phần |
| `src/components/CamNangCheckout.tsx` | Form + SePay 68k |
| `src/lib/camNangProduct.ts` | Giá, slug, product ID |
| `src/lib/fulfillDigitalOrder.ts` | Email tải PDF sau `paid` |
| `src/app/api/orders/by-invoice/route.ts` | Poll trạng thái thank-you |
| `public/downloads/` | Đặt file PDF |

---

_Kế thừa Day 17–21: `context-files/SOP_INHERITANCE_DAY17-21.md`_

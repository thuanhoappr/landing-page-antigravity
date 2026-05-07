# Vault Index

> Mục lục knowledge vault của Coach PPR — sinh từ `brain.db` để dùng với goClaw / Obsidian. Mỗi file dưới đây dùng cú pháp `[[wikilink]]` để liên kết các khái niệm.

## Các tài liệu

- [[brand-voice]] — Brand Voice — tone, từ vựng, đối tượng, ví dụ bài viết.  *(≈1199 từ)*
- [[my-business]] — My Business — sản phẩm chủ lực và chân dung khách hàng.  *(≈93 từ)*
- [[knowledge-base]] — Knowledge Base — insight chuyên môn và bài học cốt lõi.  *(≈83 từ)*
- [[products]] — Products — danh mục sản phẩm trả phí và quà tặng.  *(≈274 từ)*

## Sơ đồ liên kết

```
     [[brand-voice]] <───┐
         │               │
         │               │
         ▼               │
     [[my-business]] ───►[[products]]
         ▲
         │
     [[knowledge-base]]
```

## Nguồn

Nguồn data: `brain.db` (SQLite). Bảng đã xuất:
- `brand_voice` → `brand-voice.md`
- `business` → `my-business.md`
- `knowledge` → `knowledge-base.md`
- `products` → `products.md`

Bảng skip (không phải knowledge):
- `customers` (PII/giao dịch — không export)
- `orders` (PII/giao dịch — không export)
- `sqlite_sequence` (SQLite internal)

*Generated 2026-05-07 16:05:28 từ brain.db*

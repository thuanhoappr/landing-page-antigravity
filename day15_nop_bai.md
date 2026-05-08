# Ngày 15 — Nội dung & hướng dẫn nộp bằng chứng (theo SOP “Nộp Bài”)

Tài liệu này giúp Coach chuẩn bị **đủ 5 mục** checklist và **2 tiêu chí hoàn thành** trước khi gửi bài.

---

## Tiêu chí hoàn thành (nhắc ngắn)

1. **Agent trả lời đúng giọng** — không còn kiểu ChatGPT chung chung; bám persona / quy tắc trong Context Files + Knowledge Vault.
2. **Agent tự nhắn trước khi Coach hỏi** — có tin Telegram **chủ động** khi có **đơn mới / form lead mới** (không phải trả lời sau khi Coach gõ câu hỏi).

> **Lưu ý kỹ thuật (minh bạch khi nộp):** Pipeline chủ động hiện dùng **systemd timer trên VPS** + **MCP `get_business_signals`** + **Telegram Bot API**. goClaw Heartbeat có thể đã tắt để tránh trùng với cron — **ảnh Telegram chủ động vẫn là bằng chứng hợp lệ** vì đúng tiêu chí “tự nhắn khi có sự kiện kinh doanh”.

---

## Checklist 5 ảnh / tài liệu

### 1. Ảnh Knowledge Vault (goClaw Dashboard)

**Mục đích:** Chứng minh vault đã có file `.md` và trạng thái **đã xử lý / indexed**.

**Cách chụp:**

1. Đăng nhập **goClaw Dashboard** → vào agent **Coach PPR** (hoặc đúng workspace có Knowledge Vault).
2. Mở trang **Knowledge Vault** (hoặc mục tương đương: Vault / Documents).
3. Đảm bảo trong khung hình thấy được **tên file**, ví dụ:
   - `brand-voice.md`
   - `knowledge-base.md`
   - `my-business.md`
   - `products.md`
   - `index.md`
4. Nếu có cột trạng thái (processed / ready / indexed), để **hiển thị rõ “đã xử lý”**.

**Nếu chưa thấy file:** đồng bộ lại từ máy (`vault-ready/`) bằng script `scripts/sync_vault.py` hoặc upload tay vào đúng thư mục vault trên VPS rồi **Rescan** trong Dashboard (theo tài liệu goClaw).

---

### 2. Ảnh 4 Context Files (tab Files của agent)

**Mục đích:** Chứng minh đã nạp đủ **SOUL / USER / AGENTS / HEARTBEAT**.

**Cách chụp:**

1. goClaw → **Agent Coach PPR** → tab **Files** (hoặc **Context / Tệp**).
2. Cuộn để trong **một ảnh** (hoặc 2 ảnh ghép) thấy rõ **4 file**:
   - `SOUL.md`
   - `USER.md`
   - `AGENTS.md`
   - `HEARTBEAT.md`
3. Nếu UI chỉ hiện tên ngắn, đảm bảo **đủ 4 tên**, có timestamp / “đã lưu” nếu có.

**Nguồn chuẩn trong repo:** thư mục `context-files/` (đã push GitHub).

---

### 3. Ảnh Telegram — agent **tự nhắn** (quan trọng nhất)

**Mục đích:** Chứng minh **không cần Coach hỏi** — bot vẫn gửi tin khi có sự kiện.

**Yêu cầu nội dung ảnh:**

- Chat **DM riêng** với `@coachppr_bot` (hoặc bot đúng production).
- Một bubble tin do **hệ thống chủ động** gửi, ví dụ:
  - `🆕 Lead mới (1):` kèm tên · SĐT · email  
  - hoặc `💰 Đơn paid mới` kèm mã invoice / số tiền  
- **Không** dùng ảnh chỉ là Coach hỏi rồi bot trả lời (đó là ảnh mục 4).

**Gợi ý tái hiện (an toàn):**

1. Điền **form lead** trên site với SĐT/email **test chưa dùng** (nhận DM trong ~5 phút), **hoặc**
2. Sau khi có lead/đơn thật, chụp ngay bubble chủ động đầu tiên.

---

### 4. Ảnh Telegram — **đúng giọng** (Q&A)

**Mục đích:** Chứng minh Context Files đang được agent dùng khi chat.

**Cách chụp:**

1. Trong **cùng DM** (hoặc luồng rõ ràng), đặt **ít nhất 1 câu**:
   - Ví dụ: **“Bạn là ai?”**
2. Chụp **câu hỏi + câu trả lời đầy đủ** của bot.
3. (Khuyến nghị thêm 1 câu): **“Bạn có được phép giảm giá cho khách không?”** — pass khi bot **không tự giảm giá** và **đẩy về Coach** quyết.

**Pass nhanh:** Trả lời tiếng Việt, có identity Coach PPR / pickleball, **không** kiểu “Tôi là trợ lý AI ngôn ngữ lớn…”.

---

### 5. Link bài đăng (tối thiểu 2 kênh)

**Mục đích:** Minh chứng chia sẻ công khai + đủ điều kiện tag mentor (nếu SOP yêu cầu).

**Checklist:**

- [ ] **Facebook:** bài **public**, trong nội dung **tag / nhắc Dương Trọng Nghĩa** (đúng format challenge — có link Facebook mentor trong bài nếu được phép).
- [ ] **Kênh thứ 2:** ví dụ Zalo cá nhân, fanpage, LinkedIn, Threads, blog… — link **truy cập được**.

**Gợi ý nội dung bài:** có thể dựa trên `day15_post.txt` trong repo (đã có narrative “11h41 submit — 11h42 Telegram rung”).

**Điền sẵn (Coach PPR — đã cập nhật):**

| Kênh / bài | Link công khai |
|------------|----------------|
| Bài viết 1 (Facebook share) | [https://www.facebook.com/share/p/1CgN6CTvEM/](https://www.facebook.com/share/p/1CgN6CTvEM/) |
| Bài viết 2 (Facebook share) | [https://www.facebook.com/share/p/1BLxadQepB/](https://www.facebook.com/share/p/1BLxadQepB/) |

> Cả hai link đều dạng `facebook.com/share/p/...` (bài public khi đã bật quyền xem). Nếu SOP bắt buộc **1 Facebook + 1 kênh không phải Facebook**, hãy bổ sung thêm link kênh thứ 3 (Zalo, fanpage phụ, v.v.).

---

## Mẫu tin nhắn / email nộp bài (copy chỉnh)

**Tiêu đề gợi ý:** `[Day 15] Nộp bài — Coach PPR — Pickleball30phut`

**Nội dung:**

```
Em/cháu là [Họ tên] — dự án pickleball30phut.com / Coach PPR.

Đính kèm / link bằng chứng Ngày 15 theo checklist:

1. Knowledge Vault (Dashboard): [ảnh / link album]
2. 4 Context Files (SOUL, USER, AGENTS, HEARTBEAT): [ảnh / link album]
3. Telegram — tin chủ động (lead hoặc đơn paid): [ảnh / link album]
4. Telegram — Q&A đúng giọng (“Bạn là ai?” + tuỳ chọn giảm giá): [ảnh / link album]
5. Bài đăng:
   - Bài 1: https://www.facebook.com/share/p/1CgN6CTvEM/
   - Bài 2: https://www.facebook.com/share/p/1BLxadQepB/

Ghi chú kỹ thuật (nếu BTC cần): proactive alert chạy qua systemd timer + MCP get_business_signals + Telegram Bot API; vault đồng bộ file markdown.

Cảm ơn anh/chị đã xem bài ạ.
```

---

## Checklist tự soát trước khi bấm gửi

- [ ] Ảnh 1: thấy **tên file vault** + trạng thái **đã xử lý** (nếu UI có).
- [ ] Ảnh 2: đủ **4 file** context.
- [ ] Ảnh 3: tin **chủ động** (lead/đơn), **không** chỉ là trả lời câu hỏi.
- [ ] Ảnh 4: **hỏi–đáp** thể hiện **giọng Coach PPR**, không generic.
- [ ] Link Facebook **public** + **tag mentor** đúng SOP.
- [ ] Link kênh 2 mở được.

Chúc Coach nộp bài một phát ăn ngay.

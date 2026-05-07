# Coach PPR — Telegram Bot Operations Runbook

Tài liệu này ghi lại cấu hình, quy trình vận hành, và procedure rollback cho bot **Coach PPR** trong nhóm Telegram cộng đồng học viên Pickleball.

---

## 1. Thông tin cấu hình production

| Mục | Giá trị |
|---|---|
| Bot username | `@coachppr_bot` |
| Telegram group (production) | `Pickleball cùng Coach PPR ❤️` |
| Owner / Admin Telegram user_id | `8616188982` (Hoá Trần) |
| AI agent platform | goClaw — Agent **Coach PPR** |
| BotFather settings | Allow Groups: **Enabled**, Group Privacy: **Disabled** |
| Bot quyền trong group | Admin với Delete + Pin + Change info (đủ dùng) |
| MCP server | `https://admin.pickleball30phut.com/mcp` (proxy qua Caddy → 127.0.0.1:3001) |
| MCP tool prefix | `biz__` |
| MCP tools available | `biz__get_daily_ops_digest`, `biz__confirm_order_paid_by_invoice`, `biz__create_customer_from_telegram`, `biz__get_business_signals` |

---

## 2. Hành vi mặc định (theo System Prompt)

Bot đọc tin nhắn group nhưng **chỉ trả lời khi**:
1. Tin nhắn @mention `@coachppr_bot`.
2. Reply trực tiếp 1 tin của bot.
3. Bắt đầu bằng `coach`, `/coach`, hoặc `?`.

Quy tắc khác:
- Trả lời ngắn 3–6 câu, xưng `anh/chị`, tone coach thực chiến.
- Không tự gửi link bán hàng nếu không có người hỏi giá.
- Không trả lời tin nhắn random / spam.

### MCP whitelist
Các tool `biz__*` chỉ được gọi khi `from.id = 8616188982`. Người ngoài hỏi đơn hàng/khách hàng/digest → bot từ chối lịch sự "Anh/chị inbox riêng giúp em".

---

## 3. Use case thường dùng (admin)

| Lệnh trong group | Tool gọi | Kết quả |
|---|---|---|
| `@coachppr_bot tóm tắt hôm nay` | `biz__get_daily_ops_digest` | Báo cáo digest 24h: lead mới, đơn pending/paid, tồn kho, email queue |
| `@coachppr_bot báo cáo digest hôm nay` | `biz__get_daily_ops_digest` | Tương tự |
| `@coachppr_bot xác nhận đơn PB-1234 đã paid` | `biz__confirm_order_paid_by_invoice` | Đánh paid 1 đơn theo SePay invoice |
| `@coachppr_bot thêm khách Nguyễn A 091xxx` | `biz__create_customer_from_telegram` | Thêm khách mới vào CRM |

Trong DM 1-1 với bot (chat riêng): các tool dùng tự nhiên, không cần `@coachppr_bot`.

---

## 4. Test acceptance đã pass (May 7, 2026)

| # | Test | Kết quả |
|---|---|---|
| 1 | Bot im khi không mention | ✅ |
| 2 | Bot trả lời mention đúng tone | ✅ |
| 3 | Admin trigger digest qua MCP | ✅ (trả số liệu thật từ brain.db) |
| 4 | Reply chain duy trì context | ✅ |
| 5 | Bot từ chối role-play impersonate hỏi đơn hàng | ✅ (defense-in-depth) |
| 6 | Bot không trả lời 3 tin random spam | ✅ |

---

## 5. Rollback / Tắt bot khẩn cấp

### 5.1. Tắt nhanh (giữ bot trong group, chỉ ngừng đọc tin)
1. Mở Telegram → chat với `@BotFather`.
2. Gửi: `/setprivacy` → chọn `Coach PPR` → bấm **Turn on**.
3. Bot ngừng đọc mọi tin trong group ngay lập tức (trừ tin có @mention bot hoặc /lệnh).
4. Khi muốn bật lại: lặp lại bước trên, chọn **Turn off**.

### 5.2. Tắt hoàn toàn (kick bot khỏi group)
1. Vào group → Members → tìm `Coach PPR` → **Remove from group**.
2. Bot không còn nhận được tin nhắn nào từ group.

### 5.3. Tắt agent ở goClaw (nếu lỗi prompt)
1. goClaw → Agent **Coach PPR** → Channel Telegram → **Disable**.
2. Bot vẫn ở group nhưng goClaw không xử lý tin nhắn → bot không trả lời.

---

## 6. Risk còn lại & monitoring

### Risk: Test người ngoài bypass whitelist (chưa test bằng tài khoản phụ)
- **Mitigation hiện tại:** Bot đã pass test role-play impersonate (defense-in-depth). Khả năng leak data thấp.
- **Đề xuất:** Trong 7 ngày đầu, kiểm tra log goClaw cuối ngày — nếu thấy MCP tool được trigger bởi `from.id ≠ 8616188982` → tắt bot ngay theo §5.1.

### Cảnh báo goClaw API key
Banner cảnh báo: "Tác vụ nền gặp lỗi: Xác thực thất bại (API key không hợp lệ hoặc hết hạn)".
- Không ảnh hưởng bot trả lời chính, chỉ ảnh hưởng memory tổng hợp / vault enrich.
- Khi nào rảnh: vào goClaw → Cài đặt → cập nhật API key OpenAI/Claude/Gemini.

---

## 7. Thay đổi prompt sau này

File chứa prompt: `goClaw → Agent Coach PPR → Tệp → USER.md`. Section bot group nằm sau dòng phân cách `────────────────────────────────────────`, đánh dấu bằng `=== GROUP CHAT MODE (Telegram) ===` và `=== ADMIN WHITELIST (MCP / CRM) ===`.

Thay đổi xong nhớ:
1. Bấm **Lưu** trên USER.md.
2. Bấm **Lưu thay đổi** ở modal System Prompt.
3. Mở tab **Full** → cuộn xuống cuối → xác nhận đoạn mới đã có.

---

## 8. Khi cần thêm admin mới (mở rộng whitelist)

Nếu sau này có người phụ vận hành (ví dụ trợ lý), cập nhật:

1. Lấy Telegram user_id của người đó (qua `@getidsbot`).
2. Vào USER.md → tìm dòng `Các tool sau CHỈ được gọi khi from.id = 8616188982:`.
3. Đổi thành:
   ```
   Các tool sau CHỈ được gọi khi from.id ∈ {8616188982, NEW_USER_ID}:
   ```
4. Lưu + verify như §7.

---

## 9. Tín hiệu kinh doanh chủ động (Proactive DM)

Bot DM **riêng** với admin (Hoá Trần, `8616188982`) khi phát hiện:

| Tín hiệu | Trigger | Tool gọi | Ngưỡng |
|---|---|---|---|
| **01** Đơn vừa paid | Có `orders.status='paid'` chưa thông báo (`paid_notified_at IS NULL`) | `biz__get_business_signals` | Mỗi 5 phút |
| **02** Lead mới đăng ký | Có `customers` chưa thông báo (`lead_notified_at IS NULL`) | `biz__get_business_signals` | Mỗi 5 phút |
| **03** Báo cáo sáng | Tổng hợp 24h qua + đơn pending > 3h | `biz__get_daily_ops_digest` | 8:00 sáng (cron `0 8 * * *`) |

### Cơ chế chống nhắn trùng (idempotency)
- `biz__get_business_signals` mặc định `mark_notified=true`: ngay khi trả về paid_orders/new_leads, nó set `paid_notified_at = NOW()` / `lead_notified_at = NOW()` trong cùng transaction.
- Lần poll tiếp theo sẽ KHÔNG trả lại các bản ghi đã thông báo.
- Khi mới enable lần đầu: backfill tự động đánh dấu mọi bản ghi cũ > 1 giờ là "đã thông báo" để tránh spam toàn bộ DB lịch sử.

### Cấu hình scheduled task trong goClaw
1. **Task A — Instant alert (5 phút):**
   - Cron: `*/5 * * * *`
   - Tool call: `biz__get_business_signals` với `pending_threshold_hours=3, mark_notified=true, limit_per_signal=10`
   - Prompt sau khi gọi: nếu `paid_orders` hoặc `new_leads` không rỗng → DM tới `chat_id=8616188982` với format ngắn:
     - `💰 Đơn paid mới: PB-{invoice} — {customer_name} — {amount}đ ({product_name})`
     - `🆕 Lead mới: {name} — {phone} — {email or "-"}`
   - Nếu cả hai rỗng → im lặng, KHÔNG gửi gì.
2. **Task B — Báo cáo sáng (8h):**
   - Cron: `0 8 * * *` (timezone Asia/Ho_Chi_Minh — chú ý setting trên goClaw)
   - Tool call: `biz__get_daily_ops_digest`
   - Prompt: format Báo cáo sáng `📊 BÁO CÁO 24h QUA` gồm: số lead mới, paid/pending/cancelled, đơn pending > 3h cần nhắc, tồn kho thấp, email queue overdue → DM tới `chat_id=8616188982`.

### Test idempotency thủ công
```bash
# Trên VPS, từ session MCP đã init:
curl -sS -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: $SID" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_business_signals",
       "arguments":{"pending_threshold_hours":3,"mark_notified":false,"limit_per_signal":5}}}'
```
`mark_notified=false` → preview không tiêu thụ tín hiệu.

---

## 10. Vận hành DB & deploy

- **Brain DB nằm tại** `/opt/pickleball-landing/data/brain.db` (Docker bind mount → `/app/data` trong container Next.js, đồng thời MCP service đọc trực tiếp qua `BRAIN_DB_PATH`).
- **Bài học deploy (May 7, 2026):** `git stash push -u` (untracked) khi pull code đã từng xóa thư mục `data/` vì nó chưa nằm trong `.gitignore`. Đã fix:
  - `.gitignore` thêm `/data/` (giữ `.gitkeep` để bind mount target tồn tại).
  - Script deploy nên dùng `git stash` (không `-u`) hoặc `git pull --ff-only` trên repo sạch.
- Khi recover sau khi mất `/opt/pickleball-landing/data/brain.db`:
  ```bash
  mkdir -p /opt/pickleball-landing/data
  docker exec pickleball-landing-landing-1 cat /app/brain.db > /opt/pickleball-landing/data/brain.db
  chown -R 1001:1001 /opt/pickleball-landing/data && chmod -R 775 /opt/pickleball-landing/data
  cd /opt/pickleball-landing && docker compose up -d --force-recreate landing
  systemctl restart mcp-server
  ```

---

## 11. Thông tin liên hệ kỹ thuật

- VPS production: `103.97.127.221:2018`
- Repo code: GitHub `thuanhoappr/landing-page-antigravity`
- File runbook này: `coach_ppr_telegram_bot.md` ở repo root.

---

_Last updated: May 7, 2026 (added §9 proactive signals + §10 DB ops)_

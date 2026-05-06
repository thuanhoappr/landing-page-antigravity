# MCP server (Streamable HTTP) — Pickleball landing

Server MCP dùng [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk), transport **Streamable HTTP** (JSON), lắng nghe **chỉ trên `127.0.0.1:3001`** — phù hợp goClaw / agent gọi `http://127.0.0.1:3001/mcp`.

## Công cụ (tools)

| Tool | Mô tả ngắn |
|------|------------|
| `get_daily_ops_digest` | Lead mới, tổng đơn theo status, đơn SePay pending, tồn kho thấp, hàng đợi email |
| `confirm_order_paid_by_invoice` | Gạch `paid` theo mã `PB-…` (cùng logic `sepayIpnMarkPaid`) |
| `create_customer_from_telegram` | Thêm khách vào bảng `customers` (+ tùy chọn chuỗi email như waitlist) |

Dữ liệu dùng **cùng Postgres hoặc cùng file SQLite** với website (`src/lib/brainDb.ts`). Biến môi trường giống Next (xem `.env` / `.env.local` ở root repo).

### SQLite trên máy dev / VPS

- Website mặc định dùng file dưới `/app/data/brain.db` (Docker) hoặc có thể ghi đè:

```bash
export BRAIN_DB_PATH=/path/to/brain.db
```

Server MCP **đổi `process.cwd()` về root repo** khi khởi động để `my-brain/email_sequence.md` và đường dẫn DB khớp với Next.

## Cài đặt & chạy tay

```bash
cd mcp
npm ci
npm start
```

- `MCP_PORT` (tùy chọn, mặc định `3001`).
- Health: `GET http://127.0.0.1:3001/health`

## Kiểm thử (client SDK)

```bash
# terminal 1
cd mcp && npm start

# terminal 2
cd mcp && npm run smoke
```

## Kiểm thử bằng `curl` (JSON-RPC + phiên)

Client **phải** gửi header `Accept: application/json, text/event-stream`. Sau `initialize`, gửi thông báo `notifications/initialized` cùng `mcp-session-id`, rồi mới `tools/call`.

File mẫu trong `mcp/scripts/` (`curl-init.json`, `curl-notify-initialized.json`, `curl-tools-call-*.json`).

**Bước 1 — initialize** (đọc header `mcp-session-id`):

```bash
curl -sS -D headers.txt -o body.json -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data-binary @mcp/scripts/curl-init.json
```

**Bước 2 — `notifications/initialized`** và **bước 3 — `tools/call`** (thay `SESSION_ID`):

```bash
curl -sS -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: SESSION_ID" \
  --data-binary @mcp/scripts/curl-notify-initialized.json

curl -sS -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: SESSION_ID" \
  --data-binary @mcp/scripts/curl-tools-call-digest.json
```

Tương tự dùng `curl-tools-call-confirm.json` và `curl-tools-call-create.json`.

## Triển khai production (Linux + systemd)

1. Clone repo, `cd mcp && npm ci`.
2. Tạo user hệ thống riêng (khuyến nghị), cấp quyền đọc/ghi `brain.db` hoặc biến `POSTGRES_URL`.
3. File service mẫu: `mcp/pickleball-mcp.service` (chỉnh `User`, `WorkingDirectory`, `EnvironmentFile`).

```bash
sudo cp mcp/pickleball-mcp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pickleball-mcp
sudo systemctl status pickleball-mcp
```

**Lưu ý bảo mật:** service chỉ bind `127.0.0.1`. Không mở port 3001 ra firewall công cộng; chỉ goClaw/agent trên cùng máy (hoặc qua SSH tunnel) mới gọi được.

## Gợi ý tunnel (nếu agent ở máy khác)

```bash
ssh -L 3001:127.0.0.1:3001 user@vps
```

Sau đó agent trỏ tới `http://127.0.0.1:3001/mcp` trên máy local.

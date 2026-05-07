/**
 * Kiểm thử MCP qua Streamable HTTP (giống goClaw).
 * Chạy: từ thư mục repo root hoặc mcp/, với server đã listen 127.0.0.1:3001.
 *
 *   cd mcp && npm run smoke
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(path.resolve(__dirname, "../.."));
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const BASE = process.env.MCP_SMOKE_URL ?? "http://127.0.0.1:3001/mcp";

async function main() {
  const client = new Client({ name: "pickleball-mcp-smoke", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(BASE));
  await client.connect(transport);

  const listed = await client.request({ method: "tools/list", params: {} }, ListToolsResultSchema);
  const names = listed.tools.map((t) => t.name).sort();
  console.log("tools/list:", names);
  const need = [
    "get_daily_ops_digest",
    "confirm_order_paid_by_invoice",
    "create_customer_from_telegram",
    "get_business_signals",
  ];
  for (const n of need) {
    if (!names.includes(n)) {
      throw new Error(`Missing tool: ${n}`);
    }
  }

  const digest = await client.request(
    {
      method: "tools/call",
      params: {
        name: "get_daily_ops_digest",
        arguments: { include_email_queue: true, pending_orders_limit: 10 },
      },
    },
    CallToolResultSchema,
  );
  console.log("\n--- get_daily_ops_digest ---\n", digest.content[0]?.type === "text" ? digest.content[0].text : digest);

  const confirm = await client.request(
    {
      method: "tools/call",
      params: {
        name: "confirm_order_paid_by_invoice",
        arguments: { sepay_invoice: "PB-999999999", idempotency_key: "smoke-test-1" },
      },
    },
    CallToolResultSchema,
  );
  console.log("\n--- confirm_order_paid_by_invoice (expect not found) ---\n", confirm.content[0]?.type === "text" ? confirm.content[0].text : confirm);

  const create = await client.request(
    {
      method: "tools/call",
      params: {
        name: "create_customer_from_telegram",
        arguments: {
          name: "MCP Smoke",
          phone: "0900000999",
          enqueue_welcome_sequence: false,
        },
      },
    },
    CallToolResultSchema,
  );
  console.log("\n--- create_customer_from_telegram ---\n", create.content[0]?.type === "text" ? create.content[0].text : create);

  // Preview only (mark_notified=false) để smoke test không tiêu thụ tín hiệu thực.
  const signals = await client.request(
    {
      method: "tools/call",
      params: {
        name: "get_business_signals",
        arguments: { pending_threshold_hours: 3, mark_notified: false, limit_per_signal: 5 },
      },
    },
    CallToolResultSchema,
  );
  console.log(
    "\n--- get_business_signals (preview, mark_notified=false) ---\n",
    signals.content[0]?.type === "text" ? signals.content[0].text : signals,
  );

  await transport.close();
  console.log("\nSmoke OK.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

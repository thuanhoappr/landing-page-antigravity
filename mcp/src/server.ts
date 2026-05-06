import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { Request, Response } from "express";
import { z } from "zod";
import brainDb from "../../src/lib/brainDb";
import mcpCustomer from "../../src/lib/mcpCustomer";

const { getDailyOpsDigest, getOrderViewBySepayInvoice, sepayIpnMarkPaid } = brainDb;
const { createCustomerFromTelegram } = mcpCustomer;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** brainDb / email_sequence dùng process.cwd() — luôn chạy như thể từ root repo. */
process.chdir(path.resolve(__dirname, "../.."));
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const HOST = "127.0.0.1";
const PORT = Number(process.env.MCP_PORT ?? "3001") || 3001;

function ts() {
  return new Date().toISOString();
}

function logTool(name: string, detail: Record<string, unknown>) {
  console.log(`[${ts()}] mcp_tool_call name=${name}`, detail);
}

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
  };
}

const idempotencyCache = new Map<string, { at: number; payload: string }>();
const IDEMPOTENCY_TTL_MS = 60 * 60 * 1000;

function pruneIdempotency() {
  const now = Date.now();
  for (const [k, v] of idempotencyCache) {
    if (now - v.at > IDEMPOTENCY_TTL_MS) idempotencyCache.delete(k);
  }
}

async function withIdempotency<T extends Record<string, unknown>>(
  key: string | undefined,
  run: () => Promise<T>,
): Promise<T> {
  if (!key?.trim()) {
    return run();
  }
  const k = key.trim();
  pruneIdempotency();
  const hit = idempotencyCache.get(k);
  if (hit) {
    return JSON.parse(hit.payload) as T;
  }
  const out = await run();
  idempotencyCache.set(k, { at: Date.now(), payload: JSON.stringify(out) });
  return out;
}

const PB_INVOICE_RE = /^PB-\d+$/i;

function buildMcpServer() {
  const server = new McpServer({
    name: "pickleball-landing-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "get_daily_ops_digest",
    {
      description:
        "Bản tin vận hành: lead (customers) mới trong khoảng thời gian, tổng đơn theo trạng thái, đơn SePay chờ thanh toán, sản phẩm tồn kho thấp, tình trạng hàng đợi email tự động.",
      inputSchema: {
        since: z
          .string()
          .optional()
          .describe("Thời điểm bắt đầu (ISO 8601). Mặc định: 24 giờ trước."),
        include_email_queue: z
          .boolean()
          .optional()
          .describe("Có tính email_automation_jobs hay không (mặc định true)."),
        pending_orders_limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Số đơn pending có mã SePay tối đa trả về (mặc định 20)."),
        low_stock_threshold: z
          .number()
          .int()
          .min(0)
          .max(1_000_000)
          .optional()
          .describe("Ngưỡng tồn kho thấp (quantity_remaining <= ngưỡng, mặc định 5)."),
      },
    },
    async (args) => {
      const includeEmail =
        args.include_email_queue === undefined ? true : Boolean(args.include_email_queue);
      const pendingLimit = args.pending_orders_limit ?? 20;
      const lowStock = args.low_stock_threshold ?? 5;
      let sinceIso: string;
      if (args.since?.trim()) {
        const t = Date.parse(args.since.trim());
        if (Number.isNaN(t)) {
          logTool("get_daily_ops_digest", { error: "invalid_since", since: args.since });
          return jsonResult({
            success: false,
            error: "VALIDATION",
            message: "Tham số since không phải ngày giờ ISO 8601 hợp lệ.",
          });
        }
        sinceIso = new Date(t).toISOString();
      } else {
        sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      }
      const untilIso = new Date().toISOString();
      logTool("get_daily_ops_digest", {
        sinceIso,
        untilIso,
        include_email_queue: includeEmail,
        pending_orders_limit: pendingLimit,
        low_stock_threshold: lowStock,
      });
      try {
        const digest = await getDailyOpsDigest({
          sinceIso,
          untilIso,
          includeEmailQueue: includeEmail,
          pendingOrdersLimit: pendingLimit,
          lowStockThreshold: lowStock,
        });
        return jsonResult({ success: true, message: "OK", data: digest });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[${ts()}] get_daily_ops_digest failed`, e);
        return jsonResult({ success: false, error: "INTERNAL", message: msg });
      }
    },
  );

  server.registerTool(
    "confirm_order_paid_by_invoice",
    {
      description:
        "Xác nhận đơn đã thanh toán thủ công theo mã SePay (PB-…). Gọi cùng logic sepayIpnMarkPaid như webhook.",
      inputSchema: {
        sepay_invoice: z.string().min(1).describe("Mã hóa đơn, ví dụ PB-12345"),
        idempotency_key: z
          .string()
          .optional()
          .describe("Khóa idempotent (tránh xử lý trùng khi gửi lại cùng tin nhắn)."),
      },
    },
    async (args) => {
      const invoiceRaw = args.sepay_invoice.trim();
      const normalized = invoiceRaw.match(/PB-\d+/i)?.[0] ?? invoiceRaw;
      if (!PB_INVOICE_RE.test(normalized)) {
        logTool("confirm_order_paid_by_invoice", { error: "invalid_invoice", invoice: invoiceRaw });
        return jsonResult({
          success: false,
          error: "VALIDATION",
          message: "sepay_invoice phải khớp dạng PB-<số> (ví dụ PB-12345).",
        });
      }
      const inv = normalized.toUpperCase();
      logTool("confirm_order_paid_by_invoice", {
        sepay_invoice: inv,
        idempotency_key: args.idempotency_key ?? null,
      });
      try {
        const payload = await withIdempotency(args.idempotency_key, async () => {
          const result = await sepayIpnMarkPaid(inv);
          const order = await getOrderViewBySepayInvoice(inv);
          if (!result.matched) {
            return {
              success: false as const,
              error: "NOT_FOUND",
              message: "Không có đơn pending khớp mã hóa đơn này.",
              matched: false,
              order: null,
            };
          }
          return {
            success: true as const,
            message: result.alreadyPaid ? "Đơn đã ở trạng thái paid trước đó." : "Đã chuyển đơn sang paid.",
            matched: true,
            already_paid: Boolean(result.alreadyPaid),
            order: order
              ? {
                  order_id: order.id,
                  customer_name: order.customer_name,
                  product_name: order.product_name,
                  amount: order.amount,
                  status: order.status,
                  quantity: order.quantity,
                }
              : null,
          };
        });
        return jsonResult(payload);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[${ts()}] confirm_order_paid_by_invoice failed`, e);
        return jsonResult({ success: false, error: "INTERNAL", message: msg });
      }
    },
  );

  server.registerTool(
    "create_customer_from_telegram",
    {
      description:
        "Thêm khách vào CRM (bảng customers) giống waitlist; tùy chọn gửi/schedule chuỗi email chào mừng khi có email.",
      inputSchema: {
        name: z.string().min(1).describe("Họ tên khách"),
        phone: z.string().optional().describe("Số điện thoại (khuyến nghị nếu không có Zalo)"),
        zalo: z.string().optional().describe("Tài khoản / số Zalo"),
        email: z.string().optional().describe("Email (tùy chọn)"),
        enqueue_welcome_sequence: z
          .boolean()
          .optional()
          .describe("Nếu true và có email: gửi email 1 và hẹn bước 2–3 (giống /api/waitlist)."),
      },
    },
    async (args) => {
      const emailArg = args.email?.trim() || undefined;
      logTool("create_customer_from_telegram", {
        name: args.name.trim(),
        has_phone: Boolean(args.phone?.trim()),
        has_zalo: Boolean(args.zalo?.trim()),
        has_email: Boolean(emailArg),
        enqueue_welcome_sequence: Boolean(args.enqueue_welcome_sequence),
      });
      try {
        const result = await createCustomerFromTelegram({
          name: args.name,
          phone: args.phone?.trim() || null,
          zalo: args.zalo?.trim() || null,
          email: emailArg ?? null,
          enqueueWelcomeSequence: Boolean(args.enqueue_welcome_sequence),
        });
        if (!result.ok) {
          return jsonResult({
            success: false,
            error: result.error,
            message: result.message,
          });
        }
        return jsonResult({
          success: true,
          message: result.message ?? "OK",
          customer_id: result.customer_id,
          created: result.created,
          deduped: result.deduped,
          ...(result.email_jobs_scheduled != null
            ? { email_jobs_scheduled: result.email_jobs_scheduled }
            : {}),
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[${ts()}] create_customer_from_telegram failed`, e);
        return jsonResult({ success: false, error: "INTERNAL", message: msg });
      }
    },
  );

  return server;
}

const app = createMcpExpressApp({
  host: HOST,
  // Allow requests proxied by Caddy from public admin domain.
  allowedHosts: [HOST, "localhost", "admin.pickleball30phut.com"],
});
const transports: Record<string, StreamableHTTPServerTransport> = {};

const mcpPostHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  try {
    if (sessionId && transports[sessionId]) {
      await transports[sessionId].handleRequest(req, res, req.body);
      return;
    }
    if (!sessionId && isInitializeRequest(req.body)) {
      const transportNew = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
        onsessioninitialized: (sid) => {
          transports[sid] = transportNew;
        },
      });
      transportNew.onclose = () => {
        const sid = transportNew.sessionId;
        if (sid && transports[sid]) {
          delete transports[sid];
        }
      };
      const mcpServer = buildMcpServer();
      await mcpServer.connect(transportNew);
      await transportNew.handleRequest(req, res, req.body);
      return;
    }
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32_000, message: "Bad Request: Session ID required" },
      id: null,
    });
  } catch (error) {
    console.error(`[${ts()}] MCP POST error`, error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32_603, message: "Internal server error" },
        id: null,
      });
    }
  }
};

app.post("/mcp", mcpPostHandler);

app.get("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Missing or unknown session");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

app.delete("/mcp", async (req: Request, res: Response) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Missing or unknown session");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

/** Health check cho deploy / monitoring (không thay MCP). */
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "pickleball-mcp", time: ts() });
});

const httpServer = createServer(app);
httpServer.listen(PORT, HOST, () => {
  console.log(`[${ts()}] MCP streamable HTTP on http://${HOST}:${PORT}/mcp (JSON response mode)`);
});

process.on("SIGINT", async () => {
  for (const sid of Object.keys(transports)) {
    try {
      await transports[sid]?.close();
    } catch {
      /* ignore */
    }
    delete transports[sid];
  }
  httpServer.close();
  process.exit(0);
});

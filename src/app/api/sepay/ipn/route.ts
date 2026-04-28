import { NextResponse } from "next/server";
import {
  sepayIpnMarkPaid,
  sepayProcessBankIncomeWebhook,
} from "@/lib/brainDb";

export const runtime = "nodejs";

type GatewayPayload = {
  notification_type?: string;
  order?: {
    order_invoice_number?: string;
    order_status?: string;
    order_amount?: string;
  };
};

type BankIncomePayload = {
  id?: number;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  code?: string | null;
  content?: string | null;
  transferType?: string;
  transferAmount?: number;
  accumulated?: number;
  subAccount?: string | null;
  referenceCode?: string | null;
  description?: string | null;
};

function getSecretFromRequest(request: Request) {
  return request.headers.get("x-secret-key") ?? request.headers.get("X-Secret-Key");
}

/** SePay WebHooks: `Authorization: Apikey <KEY>` (tài liệu SePay). */
function getApiKeyFromAuthorization(request: Request) {
  const raw = request.headers.get("Authorization") ?? request.headers.get("authorization");
  if (!raw) return null;
  const m = raw.match(/^Apikey\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

function verifySeapyAuth(request: Request): boolean {
  const secretKey = process.env.SEPAY_SECRET_KEY?.trim();
  const webhookKey = process.env.SEPAY_WEBHOOK_API_KEY?.trim() || secretKey;
  if (!secretKey && !webhookKey) return false;

  const headerSecret = getSecretFromRequest(request);
  if (headerSecret && secretKey && headerSecret === secretKey) return true;

  const apiKey = getApiKeyFromAuthorization(request);
  if (apiKey && webhookKey && apiKey === webhookKey) return true;
  if (apiKey && secretKey && apiKey === secretKey) return true;

  return false;
}

function isPaidGatewayNotification(payload: GatewayPayload) {
  if (payload.notification_type === "ORDER_PAID") return true;
  const st = payload.order?.order_status;
  return st === "CAPTURED" || st === "APPROVED";
}

function isBankIncomeShape(body: unknown): body is BankIncomePayload {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  /* IPN cổng thanh toán luôn có object `order` — webhook ngân hàng thì không */
  if (o.order != null && typeof o.order === "object") return false;
  return typeof o.transferAmount === "number";
}

export async function POST(request: Request) {
  if (!verifySeapyAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  let body: unknown;
  try {
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    /* --- Webhook ngân hàng "Có tiền vào" (developer.sepay.vn) --- */
    if (isBankIncomeShape(body)) {
      const r = await sepayProcessBankIncomeWebhook(body);
      if (!r.handled) {
        return NextResponse.json({ success: true, ignored: true });
      }
      return NextResponse.json({ success: true, bank: true, matched: r.matched, duplicate: r.duplicate });
    }

    /* --- IPN cổng thanh toán (ORDER_PAID + order.order_invoice_number) --- */
    const payload = body as GatewayPayload;
    if (!payload?.order?.order_invoice_number) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    if (!isPaidGatewayNotification(payload)) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const invoice = String(payload.order.order_invoice_number).trim();
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Missing invoice" }, { status: 400 });
    }

    const updated = await sepayIpnMarkPaid(invoice);
    if (!updated.matched) {
      return NextResponse.json({ success: true, warning: "order_not_found" });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[SePay IPN]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

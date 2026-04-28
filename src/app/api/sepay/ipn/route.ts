import { NextResponse } from "next/server";
import { sepayIpnMarkPaid } from "@/lib/brainDb";

export const runtime = "nodejs";

type SepayOrderPayload = {
  notification_type?: string;
  order?: {
    order_invoice_number?: string;
    order_status?: string;
    order_amount?: string;
  };
};

function getSecretFromRequest(request: Request) {
  return request.headers.get("x-secret-key") ?? request.headers.get("X-Secret-Key");
}

function isPaidNotification(payload: SepayOrderPayload) {
  if (payload.notification_type === "ORDER_PAID") return true;
  const st = payload.order?.order_status;
  return st === "CAPTURED" || st === "APPROVED";
}

export async function POST(request: Request) {
  const secretKey = process.env.SEPAY_SECRET_KEY;
  const headerKey = getSecretFromRequest(request);

  if (!secretKey || headerKey !== secretKey) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as SepayOrderPayload | null;
  if (!payload?.order?.order_invoice_number) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }

  if (!isPaidNotification(payload)) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const invoice = String(payload.order.order_invoice_number).trim();
  if (!invoice) {
    return NextResponse.json({ success: false, error: "Missing invoice" }, { status: 400 });
  }

  try {
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

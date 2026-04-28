import { NextResponse } from "next/server";
import { db } from "@/lib/brainDb";

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
    const updated = db.transaction(() => {
      const order = db
        .prepare(
          "SELECT id, product_id, quantity, status FROM orders WHERE sepay_invoice = ?",
        )
        .get(invoice) as { id: number; product_id: number; quantity: number; status: string } | undefined;
      if (!order) {
        console.warn("[SePay IPN] No order for invoice", invoice);
        return { matched: false as const };
      }
      if (order.status === "paid") {
        return { matched: true as const, alreadyPaid: true };
      }
      db.prepare("UPDATE products SET quantity_remaining = quantity_remaining - ? WHERE id = ?").run(
        order.quantity,
        order.product_id,
      );
      db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(order.id);
      return { matched: true as const, alreadyPaid: false };
    })();

    if (!updated.matched) {
      return NextResponse.json({ success: true, warning: "order_not_found" });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[SePay IPN]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { sepayCheckoutInsertPending } from "@/lib/brainDb";
import { getBaseUrl, getCheckoutEndpoint, signSepayFields } from "@/lib/sepay";

export const runtime = "nodejs";

function sanitizeAmount(input: unknown) {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 2000) return 2000;
  return Math.round(n);
}

export async function POST(request: Request) {
  const merchant = process.env.SEPAY_MERCHANT_ID;
  const secretKey = process.env.SEPAY_SECRET_KEY;

  if (!merchant || !secretKey) {
    return NextResponse.json(
      { error: "Thiếu SEPAY_MERCHANT_ID hoặc SEPAY_SECRET_KEY trong môi trường." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const amount = sanitizeAmount(body.amount);
  const customerName = String(body.name || "Khach hang").trim();
  const customerPhone = String(body.phone || "").trim();
  if (!customerPhone) {
    return NextResponse.json({ error: "Vui lòng nhập số điện thoại." }, { status: 400 });
  }

  const invoice = `PB-${Date.now()}`;
  const baseUrl = getBaseUrl();

  try {
    await sepayCheckoutInsertPending({
      customerName,
      customerPhone,
      amount,
      invoice,
    });

    const fields = {
      order_amount: String(amount),
      merchant,
      currency: "VND" as const,
      operation: "PURCHASE" as const,
      order_description: `Nhập môn Pickleball - ${customerName} ${customerPhone}`.trim(),
      order_invoice_number: invoice,
      customer_id: customerPhone,
      payment_method: "BANK_TRANSFER" as const,
      success_url: `${baseUrl}/thank-you?invoice=${invoice}`,
      error_url: `${baseUrl}/thanh-toan?status=error`,
      cancel_url: `${baseUrl}/thanh-toan?status=cancel`,
    };

    const signature = signSepayFields(fields, secretKey);
    const payload = {
      ...fields,
      signature,
    };

    return NextResponse.json({
      endpoint: getCheckoutEndpoint(),
      fields: payload,
    });
  } catch (e) {
    console.error("[SePay checkout] DB error", e);
    return NextResponse.json({ error: "Không ghi được đơn hàng. Thử lại sau." }, { status: 500 });
  }
}

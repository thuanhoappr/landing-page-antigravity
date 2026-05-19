import { NextResponse } from "next/server";
import { sepayCheckoutInsertPending } from "@/lib/brainDb";
import { CAM_NANG_PRICE_VND, getCamNangProductId } from "@/lib/camNangProduct";
import { getBaseUrl, getCheckoutEndpoint, signSepayFields } from "@/lib/sepay";

export const runtime = "nodejs";

function sanitizeAmount(input: unknown, fallback: number) {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 2000) return fallback;
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
  const productKey = String(body.product || "").trim();
  const isCamNang = productKey === "cam-nang-newbie";
  const amount = isCamNang ? CAM_NANG_PRICE_VND : sanitizeAmount(body.amount, 2000);
  const customerName = String(body.name || "Khach hang").trim();
  const customerPhone = String(body.phone || "").trim();
  const customerEmail = String(body.email || "").trim();
  if (!customerPhone) {
    return NextResponse.json({ error: "Vui lòng nhập số điện thoại." }, { status: 400 });
  }
  if (isCamNang && !customerEmail) {
    return NextResponse.json({ error: "Vui lòng nhập email để nhận PDF." }, { status: 400 });
  }

  const invoice = `PB-${Date.now()}`;
  const baseUrl = getBaseUrl();
  const productId = isCamNang ? getCamNangProductId() ?? undefined : undefined;

  if (isCamNang && !productId) {
    return NextResponse.json(
      {
        error:
          "Chưa cấu hình CAM_NANG_PRODUCT_ID (hoặc SEPAY_PRODUCT_ID) trên server. Thêm sản phẩm 68k trong /admin trước.",
      },
      { status: 500 },
    );
  }

  const orderDescription = isCamNang
    ? `Cam nang Pickleball NewBie - ${customerName} ${customerPhone}`.trim()
    : `Nhập môn Pickleball - ${customerName} ${customerPhone}`.trim();

  const successUrl = isCamNang
    ? `${baseUrl}/thank-you?invoice=${invoice}&product=cam-nang`
    : `${baseUrl}/thank-you?invoice=${invoice}`;

  try {
    await sepayCheckoutInsertPending({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      amount,
      invoice,
      productId,
    });

    const fields = {
      order_amount: String(amount),
      merchant,
      currency: "VND" as const,
      operation: "PURCHASE" as const,
      order_description: orderDescription,
      order_invoice_number: invoice,
      customer_id: customerPhone,
      payment_method: "BANK_TRANSFER" as const,
      success_url: successUrl,
      error_url: `${baseUrl}/san-pham/cam-nang-newbie?status=error`,
      cancel_url: `${baseUrl}/san-pham/cam-nang-newbie?status=cancel`,
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

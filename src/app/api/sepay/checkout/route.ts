import { NextResponse } from "next/server";
import { db } from "@/lib/brainDb";
import { getBaseUrl, getCheckoutEndpoint, signSepayFields } from "@/lib/sepay";

export const runtime = "nodejs";

const SEPAY_PLACEHOLDER_PRODUCT = "Thanh toán khóa học (SePay)";

function sanitizeAmount(input: unknown) {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 2000) return 2000;
  return Math.round(n);
}

function resolveProductIdForCheckout(): number {
  const envId = Number(process.env.SEPAY_PRODUCT_ID);
  if (Number.isInteger(envId) && envId > 0) {
    const row = db.prepare("SELECT id FROM products WHERE id = ?").get(envId) as { id: number } | undefined;
    if (row) return row.id;
  }
  const first = db.prepare("SELECT id FROM products ORDER BY id ASC LIMIT 1").get() as { id: number } | undefined;
  if (first) return first.id;
  const result = db
    .prepare(
      "INSERT INTO products (name, price, description, quantity_remaining) VALUES (?, 0, ?, 999999)",
    )
    .run(SEPAY_PLACEHOLDER_PRODUCT, "Đơn tạo từ trang thanh-toan / SePay");
  return Number(result.lastInsertRowid);
}

function upsertCustomerId(name: string, phone: string): number {
  const existing = db.prepare("SELECT id FROM customers WHERE phone = ?").get(phone) as { id: number } | undefined;
  if (existing) {
    db.prepare("UPDATE customers SET name = ? WHERE id = ?").run(name, existing.id);
    return existing.id;
  }
  const inserted = db.prepare("INSERT INTO customers (name, phone) VALUES (?, ?)").run(name, phone);
  return Number(inserted.lastInsertRowid);
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
    db.transaction(() => {
      const customerId = upsertCustomerId(customerName, customerPhone);
      const productId = resolveProductIdForCheckout();
      db.prepare(
        "INSERT INTO orders (customer_id, product_id, quantity, amount, status, sepay_invoice) VALUES (?, ?, 1, ?, 'pending', ?)",
      ).run(customerId, productId, amount, invoice);
    })();

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

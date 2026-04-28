import { NextResponse } from "next/server";
import { createOrderManual, listOrdersApi, type OrderView } from "@/lib/brainDb";

export const runtime = "nodejs";

export async function GET() {
  const rows = await listOrdersApi();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const customerId = Number(body.customer_id);
  const productId = Number(body.product_id);
  const quantity = Number(body.quantity ?? 1);
  const status = String(body.status ?? "pending").trim() || "pending";
  const purchaseDate = String(body.purchase_date ?? "").trim() || new Date().toISOString();

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return NextResponse.json({ error: "Khách hàng không hợp lệ." }, { status: 400 });
  }
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Sản phẩm không hợp lệ." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Số lượng phải lớn hơn 0." }, { status: 400 });
  }

  const created = await createOrderManual({
    customer_id: customerId,
    product_id: productId,
    quantity,
    amount: body.amount,
    status,
    purchase_date: purchaseDate,
  });

  if ("error" in created) {
    const code = created.error;
    if (code === "CUSTOMER_NOT_FOUND") {
      return NextResponse.json({ error: "Không tìm thấy khách hàng." }, { status: 404 });
    }
    if (code === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }
    if (code === "NOT_ENOUGH_STOCK") {
      return NextResponse.json({ error: "Số lượng tồn kho không đủ." }, { status: 409 });
    }
    if (code === "INVALID_AMOUNT") {
      return NextResponse.json({ error: "Số tiền đơn hàng không hợp lệ." }, { status: 400 });
    }
    return NextResponse.json({ error: "Không tạo được đơn hàng." }, { status: 500 });
  }

  return NextResponse.json(created as OrderView, { status: 201 });
}

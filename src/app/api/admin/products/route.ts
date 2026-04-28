import { NextResponse } from "next/server";
import { insertProduct, listProductsApi, type ProductRow } from "@/lib/brainDb";

export const runtime = "nodejs";

export async function GET() {
  const rows = await listProductsApi();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const price = Number(body.price ?? 0);
  const description = String(body.description ?? "").trim() || null;
  const quantityRemaining = Number(body.quantity_remaining ?? 0);

  if (!name) {
    return NextResponse.json({ error: "Tên sản phẩm là bắt buộc." }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Giá sản phẩm không hợp lệ." }, { status: 400 });
  }
  if (!Number.isInteger(quantityRemaining) || quantityRemaining < 0) {
    return NextResponse.json({ error: "Số lượng tồn không hợp lệ." }, { status: 400 });
  }

  const created = await insertProduct(name, price, description, quantityRemaining);
  return NextResponse.json(created as ProductRow, { status: 201 });
}

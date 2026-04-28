import { NextResponse } from "next/server";
import { db, type ProductRow } from "@/lib/brainDb";

export const runtime = "nodejs";

export async function GET() {
  const rows = db
    .prepare(
      "SELECT id, name, price, description, quantity_remaining, created_at FROM products ORDER BY id DESC",
    )
    .all() as ProductRow[];

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

  const result = db
    .prepare(
      "INSERT INTO products (name, price, description, quantity_remaining) VALUES (?, ?, ?, ?)",
    )
    .run(name, price, description, quantityRemaining);

  const created = db
    .prepare(
      "SELECT id, name, price, description, quantity_remaining, created_at FROM products WHERE id = ?",
    )
    .get(result.lastInsertRowid) as ProductRow;

  return NextResponse.json(created, { status: 201 });
}

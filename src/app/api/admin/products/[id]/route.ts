import { NextResponse } from "next/server";
import { db, type ProductRow } from "@/lib/brainDb";

export const runtime = "nodejs";

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "ID sản phẩm không hợp lệ." }, { status: 400 });
  }

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
      "UPDATE products SET name = ?, price = ?, description = ?, quantity_remaining = ? WHERE id = ?",
    )
    .run(name, price, description, quantityRemaining, id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
  }

  const updated = db
    .prepare(
      "SELECT id, name, price, description, quantity_remaining, created_at FROM products WHERE id = ?",
    )
    .get(id) as ProductRow;

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "ID sản phẩm không hợp lệ." }, { status: 400 });
  }

  const linkedOrder = db
    .prepare("SELECT id FROM orders WHERE product_id = ? LIMIT 1")
    .get(id) as { id: number } | undefined;
  if (linkedOrder) {
    return NextResponse.json(
      { error: "Sản phẩm đang có đơn hàng, không thể xóa." },
      { status: 409 },
    );
  }

  const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { db, type CustomerRow } from "@/lib/brainDb";

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
    return NextResponse.json({ error: "ID khách hàng không hợp lệ." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim() || null;
  const zalo = String(body.zalo ?? "").trim() || null;
  const registrationDate = String(body.registration_date ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Tên khách hàng là bắt buộc." }, { status: 400 });
  }
  if (!phone && !zalo) {
    return NextResponse.json({ error: "Cần ít nhất SĐT hoặc Zalo." }, { status: 400 });
  }
  if (!registrationDate) {
    return NextResponse.json({ error: "Ngày đăng ký là bắt buộc." }, { status: 400 });
  }

  try {
    const result = db
      .prepare(
        "UPDATE customers SET name = ?, phone = ?, zalo = ?, registration_date = ? WHERE id = ?",
      )
      .run(name, phone, zalo, registrationDate, id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Không tìm thấy khách hàng." }, { status: 404 });
    }

    const updated = db
      .prepare(
        "SELECT id, name, phone, zalo, registration_date, created_at FROM customers WHERE id = ?",
      )
      .get(id) as CustomerRow;

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "SĐT hoặc Zalo đã tồn tại trong hệ thống." },
      { status: 409 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "ID khách hàng không hợp lệ." }, { status: 400 });
  }

  const linkedOrder = db
    .prepare("SELECT id FROM orders WHERE customer_id = ? LIMIT 1")
    .get(id) as { id: number } | undefined;
  if (linkedOrder) {
    return NextResponse.json(
      { error: "Khách hàng đang có đơn hàng, không thể xóa." },
      { status: 409 },
    );
  }

  const result = db.prepare("DELETE FROM customers WHERE id = ?").run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

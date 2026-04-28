import { NextResponse } from "next/server";
import { db, type CustomerRow } from "@/lib/brainDb";

export const runtime = "nodejs";

export async function GET() {
  const rows = db
    .prepare(
      "SELECT id, name, phone, zalo, registration_date, created_at FROM customers ORDER BY id DESC",
    )
    .all() as CustomerRow[];
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim() || null;
  const zalo = String(body.zalo ?? "").trim() || null;
  const registrationDate =
    String(body.registration_date ?? "").trim() || new Date().toISOString();

  if (!name) {
    return NextResponse.json({ error: "Tên khách hàng là bắt buộc." }, { status: 400 });
  }
  if (!phone && !zalo) {
    return NextResponse.json({ error: "Cần ít nhất SĐT hoặc Zalo." }, { status: 400 });
  }

  try {
    const result = db
      .prepare(
        "INSERT INTO customers (name, phone, zalo, registration_date) VALUES (?, ?, ?, ?)",
      )
      .run(name, phone, zalo, registrationDate);

    const created = db
      .prepare(
        "SELECT id, name, phone, zalo, registration_date, created_at FROM customers WHERE id = ?",
      )
      .get(result.lastInsertRowid) as CustomerRow;

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "SĐT hoặc Zalo đã tồn tại trong hệ thống." },
      { status: 409 },
    );
  }
}

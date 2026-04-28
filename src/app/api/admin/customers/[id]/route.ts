import { NextResponse } from "next/server";
import { deleteCustomerIfNoOrders, updateCustomer, type CustomerRow } from "@/lib/brainDb";

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
  const email = String(body.email ?? "").trim() || null;
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
    const updated = await updateCustomer(id, name, email, phone, zalo, registrationDate);
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy khách hàng." }, { status: 404 });
    }
    return NextResponse.json(updated as CustomerRow);
  } catch {
    return NextResponse.json(
      { error: "Email, SĐT hoặc Zalo đã tồn tại trong hệ thống." },
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

  const result = await deleteCustomerIfNoOrders(id);
  if ("error" in result && result.error === "linked") {
    return NextResponse.json(
      { error: "Khách hàng đang có đơn hàng, không thể xóa." },
      { status: 409 },
    );
  }
  if ("error" in result && result.error === "missing") {
    return NextResponse.json({ error: "Không tìm thấy khách hàng." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

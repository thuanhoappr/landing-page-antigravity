import { NextResponse } from "next/server";
import { deleteOrderById, getOrderRecord, updateOrderPut } from "@/lib/brainDb";

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
    return NextResponse.json({ error: "ID đơn hàng không hợp lệ." }, { status: 400 });
  }

  const existing = await getOrderRecord(id);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const customerId = Number(body.customer_id ?? existing.customer_id);
  const productId = Number(body.product_id ?? existing.product_id);
  const quantity = Number(body.quantity ?? existing.quantity);
  const status = String(body.status ?? existing.status).trim() || existing.status;
  const purchaseDate = String(body.purchase_date ?? existing.purchase_date).trim() || existing.purchase_date;

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return NextResponse.json({ error: "Khách hàng không hợp lệ." }, { status: 400 });
  }
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Sản phẩm không hợp lệ." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Số lượng phải lớn hơn 0." }, { status: 400 });
  }

  const updated = await updateOrderPut(id, {
    customer_id: customerId,
    product_id: productId,
    quantity,
    amount: body.amount,
    status,
    purchase_date: purchaseDate,
  });

  if (updated === null) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }
  if (updated && "error" in updated) {
    const code = updated.error;
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
    return NextResponse.json({ error: "Không cập nhật được đơn hàng." }, { status: 500 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "ID đơn hàng không hợp lệ." }, { status: 400 });
  }

  const ok = await deleteOrderById(id);
  if (!ok) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

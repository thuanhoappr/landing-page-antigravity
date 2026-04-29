import { NextResponse } from "next/server";
import { createOrderManual, getCustomerEmailById, listOrdersApi, type OrderView } from "@/lib/brainDb";
import { sendEmail } from "@/lib/resend";

export const runtime = "nodejs";

function orderConfirmationBody(order: OrderView): string {
  const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.amount);
  return [
    `Chào ${order.customer_name},`,
    "",
    "Cảm ơn bạn đã đồng hành cùng Pickleball 30 Phút.",
    "",
    "Đơn hàng của bạn đã được ghi nhận:",
    `- Mã đơn: #${order.id}`,
    `- Sản phẩm: ${order.product_name}`,
    `- Số lượng: ${order.quantity}`,
    `- Thành tiền: ${money}`,
    `- Trạng thái: ${order.status}`,
    "",
    "Hướng dẫn nhận hàng / vào học:",
    "Bạn giữ máy — trong 24h mình sẽ gửi link truy cập khóa học hoặc lịch buổi tập thử qua email/Zalo bạn đã để lại. Cần gấp cứ nhắn Zalo, mình hỗ trợ nhanh.",
    "",
    "Cảm ơn bạn đã tin tưởng. Chúc bạn sớm vào sân tự tin.",
    "",
    "— Coach Thuận Hóa",
    "Pickleball 30 Phút",
    "https://pickleball30phut.com",
  ].join("\n");
}

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

  const order = created as OrderView;
  try {
    const to = await getCustomerEmailById(order.customer_id);
    if (to) {
      await sendEmail({
        to,
        subject: `Xác nhận đơn hàng #${order.id} — ${order.product_name}`,
        text: orderConfirmationBody(order),
      });
    }
  } catch (e) {
    console.error("[admin/orders POST] order confirmation email failed", e);
  }

  return NextResponse.json(order, { status: 201 });
}

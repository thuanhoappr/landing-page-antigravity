import { getCustomerEmailById, getOrderViewBySepayInvoice, type OrderView } from "@/lib/brainDb";
import { CAM_NANG_DOWNLOAD_PATH, isCamNangOrder } from "@/lib/camNangProduct";
import { getBaseUrl } from "@/lib/sepay";
import { sendEmail } from "@/lib/resend";

function normalizeEmail(email: string): string {
  return email.replace(/\+test[^@]*(?=@)/i, "");
}

function camNangDeliveryBody(order: OrderView, downloadUrl: string): string {
  return [
    `Chào ${order.customer_name},`,
    "",
    "Cảm ơn anh/chị đã mua Cẩm nang thực chiến Pickleball cho NewBie.",
    "",
    `Mã đơn: #${order.id}`,
    `Số tiền: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.amount)}`,
    "",
    "Tải PDF (link trực tiếp):",
    downloadUrl,
    "",
    "Gợi ý: mở trên điện thoại trước buổi ra sân — đọc phần Checklist 30 phút và 5 lỗi hay gặp.",
    "",
    "Bước tiếp theo (tuỳ chọn):",
    "- Khoá online Nhập môn tốc độ: https://pickleball30phut.com",
    "- Zalo Coach PPR: 0919.117.687",
    "",
    "File không mở được? Nhắn Zalo, Coach gửi lại trong ngày làm việc.",
    "",
    "— Coach Thuận Hóa · Pickleball 30 Phút",
  ].join("\n");
}

/** Gửi email tải PDF sau khi đơn Cẩm nang chuyển paid (gọi từ IPN SePay). */
export async function fulfillCamNangOrderByInvoice(invoice: string): Promise<{
  sent: boolean;
  reason?: string;
}> {
  const order = await getOrderViewBySepayInvoice(invoice);
  if (!order || order.status !== "paid") {
    return { sent: false, reason: "order_not_paid" };
  }
  if (!isCamNangOrder(order.product_id, order.product_name)) {
    return { sent: false, reason: "not_cam_nang_product" };
  }

  const to = await getCustomerEmailById(order.customer_id);
  if (!to) {
    return { sent: false, reason: "no_customer_email" };
  }

  const downloadUrl = `${getBaseUrl()}${CAM_NANG_DOWNLOAD_PATH}`;
  const result = await sendEmail({
    to: normalizeEmail(to),
    subject: `Tải Cẩm nang Pickleball NewBie — đơn #${order.id}`,
    text: camNangDeliveryBody(order, downloadUrl),
  });

  if (!result.sent) {
    console.error("[fulfillCamNang] email not sent", { invoice, reason: result.reason });
  }
  return { sent: result.sent, reason: result.reason };
}

export function getCamNangDownloadUrl(): string {
  return `${getBaseUrl()}${CAM_NANG_DOWNLOAD_PATH}`;
}

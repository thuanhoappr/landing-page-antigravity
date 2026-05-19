import { NextResponse } from "next/server";
import { getOrderViewBySepayInvoice } from "@/lib/brainDb";
import { getCamNangDownloadUrl, isCamNangOrder } from "@/lib/camNangProduct";
import { getBaseUrl } from "@/lib/sepay";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const invoice = new URL(request.url).searchParams.get("invoice")?.trim();
  if (!invoice) {
    return NextResponse.json({ error: "Thiếu mã đơn." }, { status: 400 });
  }

  const order = await getOrderViewBySepayInvoice(invoice);
  if (!order) {
    return NextResponse.json({ found: false });
  }

  const isCamNang = isCamNangOrder(order.product_id, order.product_name);
  const downloadUrl = isCamNang ? `${getBaseUrl()}${getCamNangDownloadUrl(invoice)}` : null;

  return NextResponse.json({
    found: true,
    status: order.status,
    productName: order.product_name,
    amount: order.amount,
    isCamNang,
    downloadUrl,
  });
}

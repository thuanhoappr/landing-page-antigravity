import { NextResponse } from "next/server";
import { getOrderViewBySepayInvoice } from "@/lib/brainDb";
import { isCamNangOrder } from "@/lib/camNangProduct";
import { CAM_NANG_PDF_FILENAME, readCamNangPdfBuffer } from "@/lib/camNangPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const invoice = new URL(request.url).searchParams.get("invoice")?.trim();

  if (invoice) {
    if (!invoice.startsWith("PB-")) {
      return NextResponse.json({ error: "Mã đơn không hợp lệ." }, { status: 400 });
    }
    const order = await getOrderViewBySepayInvoice(invoice);
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
    }
    if (!isCamNangOrder(order.product_id, order.product_name)) {
      return NextResponse.json({ error: "Đơn không phải Cẩm nang PDF." }, { status: 403 });
    }
    if (order.status === "cancelled") {
      return NextResponse.json({ error: "Đơn đã hủy." }, { status: 403 });
    }
  }

  try {
    const buffer = await readCamNangPdfBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${CAM_NANG_PDF_FILENAME}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("[download/cam-nang] PDF not found on disk", e);
    return NextResponse.json(
      { error: "File PDF chưa có trên server. Nhắn Zalo Coach 0919.117.687." },
      { status: 404 },
    );
  }
}

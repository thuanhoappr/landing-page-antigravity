"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Download, MessageCircle, ArrowLeft } from "lucide-react";
import { getCamNangDownloadUrl } from "@/lib/camNangProduct";

type OrderStatus = {
  found: boolean;
  status?: string;
};

export default function ThankYouCamNang({ invoice }: { invoice: string }) {
  const downloadUrl = getCamNangDownloadUrl(invoice);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/by-invoice?invoice=${encodeURIComponent(invoice)}`);
        const json = (await res.json()) as OrderStatus;
        if (cancelled) return;
        if (json.status === "paid") {
          setPaid(true);
          return;
        }
        timer = setTimeout(poll, 3000);
      } catch {
        /* vẫn cho tải PDF — khách vừa từ SePay success */
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [invoice]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 max-w-xl w-full text-center relative z-10 shadow-2xl">
      <div className="w-24 h-24 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle className="w-12 h-12 text-brand" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Thanh toán thành công!</h1>

      <p className="text-slate-400 text-lg mb-6">
        Cảm ơn anh/chị đã mua <strong className="text-white">Cẩm nang Pickleball NewBie</strong>. Bấm nút bên dưới để
        tải PDF ngay — không cần đợi Coach gọi.
      </p>

      <a
        href={downloadUrl}
        className="w-full flex items-center justify-center gap-2 bg-brand text-navy py-4 px-4 rounded-xl font-bold text-lg mb-3 hover:bg-brand-hover transition-colors shadow-lg"
      >
        <Download className="w-6 h-6" />
        Tải PDF Cẩm nang (16 trang)
      </a>

      <p className="text-slate-500 text-xs mb-6">
        {paid
          ? "Đơn đã xác nhận thanh toán. Email có link dự phòng (kiểm tra Spam nếu cần)."
          : "Đang đồng bộ trạng thái đơn — PDF vẫn tải được ngay. Email gửi trong 1–5 phút."}
      </p>

      <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 text-left border border-slate-700/50">
        <p className="text-slate-300 text-sm mb-3">
          <strong className="text-white">Bước tiếp theo:</strong> Đọc Checklist 30 phút trước buổi ra sân. Muốn học
          sâu — khoá Nhập môn 499k hoặc Zalo book tập thử.
        </p>
        <a
          href="https://zalo.me/0919117687"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#0068FF] hover:bg-[#0055D4] text-white py-3 px-4 rounded-xl font-medium transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Zalo Coach PPR 0919.117.687
        </a>
      </div>

      <p className="text-xs text-slate-500 mb-6">Mã đơn: {invoice}</p>

      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Về trang chủ
      </Link>
    </div>
  );
}

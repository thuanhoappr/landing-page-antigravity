"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Download, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";

type OrderStatus = {
  found: boolean;
  status?: string;
  downloadUrl?: string | null;
};

export default function ThankYouCamNang({ invoice }: { invoice: string }) {
  const [data, setData] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/by-invoice?invoice=${encodeURIComponent(invoice)}`);
        const json = (await res.json()) as OrderStatus;
        if (cancelled) return;
        setData(json);
        setLoading(false);
        if (json.status !== "paid") {
          timer = setTimeout(poll, 4000);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [invoice]);

  const paid = data?.status === "paid";
  const downloadUrl = data?.downloadUrl;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 max-w-xl w-full text-center relative z-10 shadow-2xl">
      <div className="w-24 h-24 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-8">
        {loading && !paid ? (
          <Loader2 className="w-12 h-12 text-brand animate-spin" />
        ) : (
          <CheckCircle className="w-12 h-12 text-brand" />
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        {paid ? "Thanh toán thành công!" : "Đang xác nhận thanh toán…"}
      </h1>

      <p className="text-slate-400 text-lg mb-8">
        {paid
          ? "Cảm ơn anh/chị đã mua Cẩm nang Pickleball NewBie. Tải PDF bên dưới hoặc kiểm tra email (có thể vào thư mục Quảng cáo)."
          : "SePay đang đồng bộ — trang tự cập nhật trong vài giây. Nếu đã chuyển khoản mà sau 2 phút vẫn chưa có link, nhắn Zalo Coach."}
      </p>

      {paid && downloadUrl ? (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-brand text-navy py-3 px-4 rounded-xl font-bold text-lg mb-6 hover:bg-brand-hover transition-colors"
        >
          <Download className="w-5 h-5" />
          Tải PDF Cẩm nang (16 trang)
        </a>
      ) : null}

      <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 text-left border border-slate-700/50">
        <p className="text-slate-300 text-sm mb-3">
          <strong className="text-white">Bước tiếp theo:</strong> Làm theo Checklist 30 phút trước buổi ra sân. Muốn học
          sâu hơn — xem khoá Nhập môn tốc độ (499k) hoặc nhắn Zalo book tập thử.
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

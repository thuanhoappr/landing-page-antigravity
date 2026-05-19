"use client";

import { useState } from "react";
type CheckoutResponse = {
  endpoint: string;
  fields: Record<string, string>;
};

function postToSepay(endpoint: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = endpoint;
  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function CamNangCheckout() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Vui lòng nhập email để nhận link tải PDF.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/sepay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "cam-nang-newbie",
          name,
          phone,
          email,
        }),
      });
      const data = (await res.json()) as CheckoutResponse | { error: string };
      if (!res.ok || !("endpoint" in data)) {
        throw new Error(("error" in data && data.error) || "Không tạo được đơn thanh toán.");
      }
      postToSepay(data.endpoint, data.fields);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    }
  };

  const priceLabel = "68.000₫";

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand";

  return (
    <div id="mua-ngay" className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 scroll-mt-24">
      <p className="text-3xl font-bold text-brand mb-1">{priceLabel}</p>
      <p className="text-slate-400 text-sm mb-6">
        Thanh toán VietQR / chuyển khoản qua SePay — nhận PDF qua email sau khi thành công.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-slate-300">Họ tên</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-slate-300">Số điện thoại</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-slate-300">Email nhận PDF</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@email.com"
          />
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-xl bg-brand text-navy font-bold py-3.5 text-lg disabled:opacity-60 hover:bg-brand-hover transition-colors"
        >
          {loading ? "Đang tạo đơn..." : "Mua và nhận PDF ngay"}
        </button>
        <p className="text-xs text-slate-500 text-center">
          Không mở được file? Nhắn Zalo Coach PPR 0919.117.687 — gửi lại link trong ngày làm việc.
        </p>
      </div>
    </div>
  );
}

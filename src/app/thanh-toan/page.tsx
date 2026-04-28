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

export default function CheckoutPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(2000);
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

    try {
      setLoading(true);
      const res = await fetch("/api/sepay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, amount }),
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

  return (
    <main className="min-h-screen bg-darker text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold mb-2">Thanh toán qua SePay</h1>
        <p className="text-slate-400 text-sm mb-6">
          Điền thông tin để tạo đơn và chuyển sang màn hình QR của SePay.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-300">Họ tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand"
              placeholder="Nguyen Van A"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Số điện thoại</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand"
              placeholder="0912345678"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Số tiền (VND)</label>
            <input
              type="number"
              min={2000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 2000)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-brand"
            />
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-lg bg-brand text-navy font-bold py-3 disabled:opacity-60"
          >
            {loading ? "Đang tạo đơn..." : "Tạo đơn & tới trang QR SePay"}
          </button>
        </div>
      </div>
    </main>
  );
}

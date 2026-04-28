"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

/** Kiểm tra SĐT Việt Nam: 9–11 số, cho phép +84 / 84 / 0 */
function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length >= 11) return true;
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 11) return true;
  return digits.length >= 9 && digits.length <= 11;
}

export default function LeadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("Chưa");
  const [obstacle, setObstacle] = useState("");
  const [goal, setGoal] = useState("Biết chơi cơ bản");
  const [customGoal, setCustomGoal] = useState("");

  const handleSubmit = async () => {
    setError(null);

    // --- Validation ---
    if (!name.trim() || name.trim().length < 2) {
      setError("Vui lòng nhập tên (ít nhất 2 ký tự).");
      return;
    }
    if (!phone.trim() || !isValidPhone(phone.trim())) {
      setError("Vui lòng nhập số điện thoại / Zalo hợp lệ.");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email chưa đúng định dạng.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ghi lead vào CRM nội bộ trước (brain.db / Postgres) để admin thấy ngay.
      const crmRes = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
        }),
      });
      if (!crmRes.ok) {
        const data = await crmRes.json().catch(() => ({}));
        throw new Error(data?.error || "Không lưu được CRM.");
      }
    } catch (err) {
      console.error("[LeadForm] CRM error:", err);
      setError("Không lưu được thông tin vào CRM. Vui lòng thử lại.");
      setIsSubmitting(false);
      return;
    }

    const finalGoal = goal === "Khác" ? customGoal.trim() : goal;
    if (goal === "Khác" && !finalGoal) {
      setError("Vui lòng nhập mong muốn của bạn.");
      setIsSubmitting(false);
      return;
    }

    // --- Payload khớp với cột Google Sheets qua Make.com ---
    const payload = {
      ho_ten: name.trim(),
      so_dien_thoai: phone.trim(),
      email: email.trim(),
      kinh_nghiem: experience,
      dieu_ngai: obstacle.trim(),
      mong_muon: finalGoal,
      nguon: "Pickleball Landing Page",
      thoi_gian: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
      admin_email: "trolycoachpickleball@gmail.com",
    };

    const webhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl === "your_webhook_url_here") {
      // Dev mode: giả lập thành công
      console.warn("[LeadForm] NEXT_PUBLIC_MAKE_WEBHOOK_URL chưa cấu hình — giả lập thành công.");
      console.table(payload);
      setTimeout(() => {
        setIsSubmitting(false);
        router.push("/thank-you");
      }, 800);
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/thank-you");
      } else {
        const text = await response.text().catch(() => "");
        console.error("[LeadForm] Webhook error:", response.status, text);
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("[LeadForm] Lỗi gửi form:", err);
      setError(
        "Không gửi được thông tin. Vui lòng kiểm tra kết nối mạng và thử lại, hoặc liên hệ trực tiếp qua Zalo."
      );
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-darker border border-slate-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all";
  const labelClass = "text-sm font-medium text-slate-300 block ml-1 mb-1";

  return (
    <section id="lead-form" className="py-24 bg-brand relative">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: "url('/images/form-bg.png')" }}
      />
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand via-brand-dark/80 to-sky/90 pointer-events-none mix-blend-hard-light" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-navy rounded-3xl p-8 md:p-12 border-4 border-white/20 shadow-2xl shadow-navy/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-emerald-500" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: value proposition */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase text-white mb-4">
                Nhận Quà Tặng Online{" "}
                <span className="text-brand">ngay hôm nay</span>
              </h2>
              <p className="text-slate-400 mb-8">
                Để lại thông tin — mình gửi bạn lộ trình 4 tuần và bộ checklist
                &quot;bỏ túi&quot; trước khi gặp Coach, đỡ phí buổi tập đầu tiên.
              </p>
              <div className="space-y-4">
                {[
                  "Lộ trình 4 tuần thực chiến",
                  'Checklist "bỏ túi" sửa lỗi trên sân',
                  "Cảm giác kiểm soát, ít lỗi ngớ ngẩn",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                      <span className="text-brand font-bold">{i + 1}</span>
                    </div>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form fields */}
            <div className="space-y-4">
              {/* Câu 1 — Tên */}
              <div className="space-y-1">
                <label htmlFor="lf-name" className={labelClass}>
                  1. Anh/Chị tên gì? *
                </label>
                <input
                  type="text"
                  id="lf-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  className={inputClass}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              {/* Câu 2 — SĐT/Zalo */}
              <div className="space-y-1">
                <label htmlFor="lf-phone" className={labelClass}>
                  2. SĐT/Zalo để mình gửi tài liệu &amp; hỗ trợ nhanh: *
                </label>
                <input
                  type="tel"
                  id="lf-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="off"
                  className={inputClass}
                  placeholder="0912 345 678"
                />
              </div>

              {/* Email (optional) */}
              <div className="space-y-1">
                <label htmlFor="lf-email" className={labelClass}>
                  Email (để mình gửi tài liệu qua hộp thư):
                </label>
                <input
                  type="email"
                  id="lf-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className={inputClass}
                  placeholder="email@example.com"
                />
              </div>

              {/* Câu 3 — Kinh nghiệm */}
              <div className="space-y-1">
                <label htmlFor="lf-experience" className={labelClass}>
                  3. Anh/Chị đã từng chơi pickleball chưa? *
                </label>
                <select
                  id="lf-experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={inputClass}
                >
                  <option value="Chưa">Chưa</option>
                  <option value="Chơi thử">Chơi thử</option>
                  <option value="Đang chơi">Đang chơi</option>
                </select>
              </div>

              {/* Câu 4 — Điều ngại */}
              <div className="space-y-1">
                <label htmlFor="lf-obstacle" className={labelClass}>
                  4. Điều khiến Anh/Chị còn ngại ra sân là gì?
                </label>
                <textarea
                  id="lf-obstacle"
                  value={obstacle}
                  onChange={(e) => setObstacle(e.target.value)}
                  rows={2}
                  className={inputClass + " resize-none"}
                  placeholder="Câu trả lời của bạn..."
                />
              </div>

              {/* Câu 5 — Mong muốn */}
              <div className="space-y-1">
                <label htmlFor="lf-goal" className={labelClass}>
                  5. Anh/Chị mong muốn điều gì nhất khi học pickleball? *
                </label>
                <select
                  id="lf-goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className={inputClass}
                >
                  <option value="Biết chơi cơ bản">Biết chơi cơ bản</option>
                  <option value="Rèn sức khỏe">Rèn sức khỏe</option>
                  <option value="Tự tin ra sân">Tự tin ra sân</option>
                  <option value="Khác">Khác...</option>
                </select>
              </div>

              {goal === "Khác" && (
                <div className="space-y-1">
                  <label htmlFor="lf-customGoal" className={labelClass}>
                    Mong muốn khác của Anh/Chị là gì? *
                  </label>
                  <input
                    type="text"
                    id="lf-customGoal"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    className={inputClass}
                    placeholder="Nhập mong muốn của bạn..."
                  />
                </div>
              )}

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full group flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black italic uppercase text-lg text-white transition-all ${
                    isSubmitting
                      ? "bg-slate-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.4)] border-b-4 border-orange-600"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </div>
                  ) : (
                    <>
                      ĐĂNG KÝ NHẬN QUÀ TẶNG
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <p className="text-center text-xs text-slate-500">
                Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi không spam.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

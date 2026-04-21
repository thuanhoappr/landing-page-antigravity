"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, User, Mail, Phone } from "lucide-react";

export default function LeadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitType, setSubmitType] = useState<"free" | "99k">("free");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      buyCourse99k: submitType === "99k" ? "Có (Đăng ký mua 99K)" : "Không",
      source: "Pickleball Landing Page",
      timestamp: new Date().toISOString()
    };

    if (!data.name || !data.phone || !data.email) {
      setError("Vui lòng nhập lại đủ thông tin để Nhận Quà");
      setIsSubmitting(false);
      return;
    }

    const webhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;
    
    if (!webhookUrl || webhookUrl === "your_webhook_url_here") {
      console.warn("Chưa cấu hình NEXT_PUBLIC_MAKE_WEBHOOK_URL. Giả lập thành công.");
      setTimeout(() => {
        setIsSubmitting(false);
        router.push("/thank-you");
      }, 1000);
      return;
    }

    try {
      // Sử dụng Make.com Webhook để xử lý dữ liệu (Lưu Google Sheets & Gửi Email)
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitting(false);
        router.push("/thank-you");
      } else {
        throw new Error("Lỗi khi gửi thông tin tới Webhook");
      }
    } catch (err) {
      console.error("Lỗi gửi form Webhook:", err);
      setError("Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại!");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="lead-form" className="py-24 bg-brand relative">
      {/* Abstract Background Image */}
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
          {/* Accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-emerald-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase text-white mb-4">
                Đừng Trì Hoãn Nữa, <span className="text-brand">Sân Chơi</span> Đang Chờ Bạn!
              </h2>
              <p className="text-slate-400 mb-8">
                ĐĂNG KÝ NGAY HÔM NAY: Nhận ngay 1 buổi Tập Thử Miễn Phí (có sẵn vợt) được thiết kế dành riêng cho người bận rộn.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-brand font-bold">1</span>
                  </div>
                  <p>Tập thử miễn phí (có vợt sẵn)</p>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-brand font-bold">2</span>
                  </div>
                  <p>Giáo trình tối ưu cho người bận rộn</p>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-brand font-bold">3</span>
                  </div>
                  <p>Biết đánh ngay sau vài buổi</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium text-slate-300 block ml-1 mb-1">Tên/Nickname*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full bg-darker border border-slate-700 text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium text-slate-300 block ml-1 mb-1">Điện thoại*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full bg-darker border border-slate-700 text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="0912 345 678"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-slate-300 block ml-1 mb-1">Email*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full bg-darker border border-slate-700 text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  onClick={() => setSubmitType("99k")}
                  disabled={isSubmitting}
                  className={`w-full group flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black italic uppercase text-lg text-white transition-all ${
                    isSubmitting 
                      ? "bg-slate-600 cursor-not-allowed" 
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.4)] border-b-4 border-orange-600"
                  }`}
                >
                  {isSubmitting && submitType === "99k" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </div>
                  ) : (
                    <>
                      MUA KHÓA HỌC ƯU ĐÃI 99K
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-700/50"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-medium">HOẶC</span>
                  <div className="flex-grow border-t border-slate-700/50"></div>
                </div>

                <button
                  type="submit"
                  onClick={() => setSubmitType("free")}
                  disabled={isSubmitting}
                  className={`w-full group flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black italic uppercase text-lg text-white transition-all ${
                    isSubmitting 
                      ? "bg-slate-600 cursor-not-allowed" 
                      : "bg-accent hover:bg-accent-hover hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,77,0,0.4)] border-b-4 border-accent-hover"
                  }`}
                >
                  {isSubmitting && submitType === "free" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </div>
                  ) : (
                    <>
                      TẬP THỬ MIỄN PHÍ
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-sm p-3 rounded-lg text-center mt-4">
                  {error}
                </div>
              )}
              <p className="text-center text-xs text-slate-500 mt-4">
                Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi không spam.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

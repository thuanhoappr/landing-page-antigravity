"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const stories = [
  {
    name: "Chị Lan",
    meta: "56 tuổi — KDC Bàu Cát, TP.HCM",
    before:
      "Ra sân lần đầu không biết đứng đâu, cứ chạy lung tung, mọi người nhìn xấu hổ lắm.",
    after:
      "Buổi thứ 2 ra sân đã biết vị trí của mình. Biết rõ luật chơi, các khu vực trên sân, đánh bóng qua lưới khá dễ.",
  },
  {
    name: "Anh Tú",
    meta: "48 tuổi — Tòa Oriental Plaza, TP.HCM",
    before:
      "Chơi tennis được 5 năm nhưng qua Pickleball vẫn bỡ ngỡ — kỹ thuật khác hoàn toàn.",
    after:
      "Coach giải thích rất rõ tại sao kỹ thuật tennis không áp dụng được sang Pickleball. Học xong 1 tuần là chơi được ngay.",
  },
  {
    name: "Em Hiền",
    meta: "35 tuổi — Quản lý kinh doanh, TP.HCM",
    before:
      "Ban đầu em lo vì nghĩ mình bận quá, ít vận động.",
    after:
      "Môn này không cần chạy nhiều, quan trọng là biết đặt bóng. 15 phút/ngày ôn bài online và 1–2 buổi/tuần ra sân — vừa lo việc, vừa relax.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="hoc-vien-noi-gi"
      className="py-24 bg-darker relative border-t border-slate-800/60"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand/[0.03] to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase text-white mb-6 tracking-tight"
          >
            Học viên <span className="text-brand drop-shadow-[0_0_15px_rgba(234,255,0,0.5)]">nói thật</span> sau lộ trình
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-lg text-slate-400 max-w-3xl mx-auto"
          >
            Không phải lời quảng cáo — là tình huống thật trên sân, kể lại có chỉnh nhẹ cho dễ đọc.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {stories.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-white/10 bg-navy-light/20 p-6 md:p-8 flex flex-col gap-5 shadow-lg shadow-black/20 hover:border-brand/25 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{item.meta}</p>
                </div>
                <Quote className="w-10 h-10 text-brand/80 shrink-0" aria-hidden />
              </div>
              <div className="space-y-4 text-slate-300 text-[15px] leading-relaxed flex-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Trước khi học
                  </p>
                  <p>&ldquo;{item.before}&rdquo;</p>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
                    Sau khi học
                  </p>
                  <p className="text-white font-medium">&ldquo;{item.after}&rdquo;</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

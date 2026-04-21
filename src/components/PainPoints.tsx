"use client";

import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

const painPoints = [
  {
    title: "Lịch tập chập chờn",
    description: "Bận quá, lịch tập cứ chập chờn — lên sân chỉ “đánh cho đỡ cứng người”, chứ chưa kịp sửa gì.",
  },
  {
    title: "Thử hết mọi thứ",
    description: "Drop, drive, lob… thử đủ kiểu xong về nhà vẫn không biết mình cần nhất cú đánh nào cho đánh đôi.",
  },
  {
    title: "Đánh đôi như đánh đơn",
    description: "Không rõ lúc nào mình cover, lúc nào nhường cho bạn. Serve và return quá an toàn, không tạo được áp lực.",
  },
  {
    title: "Ngại lên lưới, sợ NVZ",
    description: "Lên lưới kiểu “thấy người ta lên mình lên”, nghe NVZ tưởng khó nên né, trong khi chỉ cần dink đủ dùng là trận đã khác.",
  },
];

export default function PainPoints() {
  return (
    <section className="py-24 bg-darker relative border-t-8 border-brand">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16 bg-navy/50 p-8 rounded-3xl border border-white/5">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase text-white mb-6 tracking-tight"
          >
            Có quen không? Những <span className="text-brand drop-shadow-[0_0_15px_rgba(234,255,0,0.5)]">"Hạt cát"</span> làm bạn khó chịu trên sân
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Thua thường đến từ nhịp và vị trí, không phải từ một cú hoành tráng nào cả. Rất nhiều người bận rộn cũng gặp cảnh này.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-navy border-l-4 border-accent rounded-r-xl p-6 shadow-lg flex gap-5 items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="flex-shrink-0 mt-1">
                <XCircle className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic text-white mb-2">{point.title}</h3>
                <p className="text-slate-300 leading-relaxed font-medium">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

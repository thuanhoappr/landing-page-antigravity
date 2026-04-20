"use client";

import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

const painPoints = [
  {
    title: "Lịch trình dày đặc",
    description: "Sáng bận rộn ở văn phòng, tối về mệt mỏi, không có thời gian theo đuổi những khóa học kéo dài hàng tháng trời.",
  },
  {
    title: "Sợ chấn thương",
    description: "Lâu ngày không vận động thể thao, lo lắng việc tự tập sai tư thế sẽ dẫn đến đau nhức xương khớp, ảnh hưởng công việc.",
  },
  {
    title: "Choáng ngợp thông tin",
    description: "Xem video hướng dẫn trên mạng nhưng luật chơi quá rườm rà, không biết bắt đầu từ đâu, cách chọn vợt ra sao.",
  },
  {
    title: "Ngại ra sân vì 'Gà mờ'",
    description: "Rất muốn tham gia cùng hội bạn nhưng sợ đánh hỏng, làm 'tạ' kéo lùi cả đội và mất tự tin.",
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
            Bạn Có Đang Bỏ Lỡ Trào Lưu Mới Chỉ Vì Những <span className="text-brand drop-shadow-[0_0_15px_rgba(234,255,0,0.5)]">"Rào Cản"</span> Này?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Đừng lo lắng! Rất nhiều người bận rộn giống như bạn cũng từng gặp những khó khăn này trước khi tìm thấy giải pháp của chúng tôi.
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

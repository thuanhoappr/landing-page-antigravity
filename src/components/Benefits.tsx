"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, HeartPulse, Medal } from "lucide-react";

const benefits = [
  {
    icon: <Medal className="w-12 h-12 text-navy" />,
    title: "Tuần 1 - Đỡ 'ngơ' trên sân",
    description: "Bạn đứng đúng chỗ, di chuyển ít hơn nhưng lại che sân tốt hơn — hết kiểu chạy loạn xạ mà vẫn lỗ hổng.",
    color: "bg-brand",
    textColor: "text-navy",
  },
  {
    icon: <Zap className="w-12 h-12 text-white" />,
    title: "Tuần 2 - Mở trận có ý đồ",
    description: "Serve và return không còn 'đưa bóng qua cho có'; bạn bắt nhịp rally theo hướng mình muốn.",
    color: "bg-sky",
    textColor: "text-white",
  },
  {
    icon: <ShieldCheck className="w-12 h-12 text-white" />,
    title: "Tuần 3 - Lên lưới & NVZ",
    description: "Biết khi nào lên để gây áp lực, khi nào giữ chân; ở NVZ không còn chỉ đứng chịu trận.",
    color: "bg-accent",
    textColor: "text-white",
  },
  {
    icon: <HeartPulse className="w-12 h-12 text-white" />,
    title: "Tuần 4 - Đôi ăn ý",
    description: "Hai người hiểu vai, nói ít mà vẫn khớp; chọn cú đánh theo tình huống — trận 'đỡ rối' hẳn.",
    color: "bg-navy-light",
    textColor: "text-white",
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-dark relative border-y-4 border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase text-white mb-6 tracking-tight"
          >
            4 tuần — <span className="text-brand">mỗi tuần một sự tự tin</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-400 max-w-4xl mx-auto font-bold italic"
          >
            Thiết kế cho người bận: mỗi ngày một chút, nhưng mỗi tuần phải thấy “chơi khác đi” khi ra sân đôi.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${benefit.color} rounded-2xl p-6 lg:p-5 xl:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-3 transition-all duration-300 border-[3px] border-white/20 relative overflow-hidden group transform -skew-x-2`}
            >
              {/* Dynamic sporty background slash */}
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500" />
              
              <div className="relative z-10 transform skew-x-2">
                <div className="flex items-center gap-5 mb-5">
                  <div className="flex-shrink-0 opacity-90 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className={`text-2xl md:text-xl lg:text-3xl font-black uppercase italic tracking-tight drop-shadow-sm leading-tight ${benefit.textColor}`}>
                    {benefit.title}
                  </h3>
                </div>
                <p className={`text-base lg:text-lg font-medium leading-relaxed ${benefit.textColor} opacity-90`}>
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

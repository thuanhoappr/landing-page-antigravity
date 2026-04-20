"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Solution() {
  return (
    <section className="py-24 bg-darker relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[450px] lg:h-[600px]">
              <div className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-brand/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-darker/80 to-transparent z-10" />
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: "url('/images/solution-couple-u50.png')" }}
                />
              </div>
              <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-t from-darker/80 to-transparent z-10" />
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: "url('/images/solution-img.png')" }}
                />
              </div>
              <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-t from-darker/80 to-transparent z-10" />
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: "url('/images/solution-man-u50.png')" }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black italic uppercase text-white mb-6 leading-tight tracking-tight lg:whitespace-nowrap xl:whitespace-nowrap">
              Khóa Học <span className="text-brand drop-shadow-[0_0_15px_rgba(234,255,0,0.5)]">"Nhập Môn Tốc Độ"</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Chúng tôi đã chắt lọc những kỹ thuật cốt lõi nhất để giúp bạn từ "con số 0" trở thành người chơi tự tin trên sân chỉ trong khoảng thời gian ngắn nhất!
            </p>

            <ul className="space-y-6">
              {[
                "Giáo trình 'Thực Chiến': Bỏ qua lý thuyết rườm rà, tập trung đánh được ngay",
                "Thời gian cực kỳ linh hoạt: Tập trưa, tối hoặc cuối tuần tùy lịch rảnh",
                "Huấn luyện viên tận tâm: Chỉnh sửa từng dáng đứng, cách vung vợt",
                "An toàn tuyệt đối: Đảm bảo chơi đúng kỹ thuật, hạn chế chấn thương",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-6 bg-navy-light/30 p-4 rounded-xl border border-white/5 hover:border-brand/30 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand flex items-center justify-center shadow-[0_0_15px_rgba(234,255,0,0.4)]">
                    <span className="text-navy font-black text-2xl italic">{index + 1}</span>
                  </div>
                  <span className="text-white text-lg font-medium pt-2">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-brand to-emerald-500">
                <div className="px-4 py-3 md:px-6 bg-darker rounded-full text-white font-medium text-xs md:text-sm lg:text-base xl:whitespace-nowrap lg:whitespace-nowrap md:whitespace-nowrap whitespace-nowrap overflow-x-auto custom-scrollbar">
                  Cam kết: Bạn sẽ chắc chắn Tự tin nhập môn nhờ thông tin tập luyện đơn giản, dễ hiểu!
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

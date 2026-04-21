"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-start overflow-hidden bg-navy py-20">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[128px] opacity-50 mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-brand/10 rounded-full blur-[128px] opacity-30 mix-blend-screen" />
        {/* Overlays for text readability */}
        <div className="absolute inset-0 bg-navy/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/70 to-transparent z-10" />
      </div>

      <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm font-medium mb-8"
        >
          <Trophy className="w-4 h-4 text-brand" />
          <span>Hướng dẫn Thực chiến Pickleball cùng Coach PPR (USA)</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tight text-white mb-6 leading-[1.2] max-w-4xl drop-shadow-lg"
        >
          Muốn tập luyện, chơi Pickleball nhưng bận rộn, chưa có thời gian ra sân tập luyện? <br className="hidden md:block" /><span className="block mt-4 text-brand drop-shadow-[0_0_15px_rgba(234,255,0,0.5)]">Làm chủ kiến thức tập luyện cơ bản Pickleball chỉ sau vài buổi!</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl font-medium drop-shadow-md"
        >
          Khóa học "Nhập Môn Tốc Độ" thiết kế riêng cho người đi làm. Tập đúng kỹ thuật ngay từ đầu - Tránh chấn thương - Tự tin ra sân giao lưu cùng đồng nghiệp, bạn bè.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-start gap-6"
        >
          <button
            onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
            className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-base font-black italic uppercase text-white bg-accent rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_8px_rgba(255,77,0,0.4)] focus:outline-none border-b-4 border-accent-hover"
          >
            <span className="relative z-10 flex items-center gap-2">
              TẬP THỬ MIỄN PHÍ
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          <button
            onClick={() => document.getElementById("benefits")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto px-5 py-3 text-base font-bold italic uppercase text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-white/20 transition-colors focus:outline-none"
          >
            Xem Giáo trình Tập Online
          </button>
        </motion.div>
        
        {/* Statistics or trust indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 pt-8 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-3xl"
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">100+</span>
            <span className="text-sm text-slate-500">Học viên tốt nghiệp</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">100%</span>
            <span className="text-sm text-slate-500">Tự tin ra sân</span>
          </div>
          <div className="flex flex-col items-center col-span-2 md:col-span-1">
            <span className="text-3xl font-bold text-white mb-1">5★</span>
            <span className="text-sm text-slate-500">Đánh giá chất lượng</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-darker flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 max-w-xl w-full text-center relative z-10 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-brand" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Đăng Ký Thành Công!
        </h1>
        
        <p className="text-slate-400 text-lg mb-8">
          Cảm ơn bạn đã quan tâm đến Khóa huấn luyện Pickleball Thực chiến. Chuyên viên của chúng tôi sẽ liên hệ lại với bạn trong vòng 24h tới để tư vấn lộ trình.
        </p>

        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 text-left border border-slate-700/50">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            Bước tiếp theo:
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Hãy nhắn tin ngay với Huấn luyện viên qua Zalo để xác nhận đăng ký và nhận tư vấn lộ trình học phù hợp nhất.
          </p>
          <a 
            href="https://zalo.me/0919117687" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full flex items-center justify-center gap-2 bg-[#0068FF] hover:bg-[#0055D4] text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <MessageCircle className="w-5 h-5" />
            Liên Hệ Zalo Admin (0919117687)
          </a>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-brand transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </Link>
      </motion.div>
    </main>
  );
}

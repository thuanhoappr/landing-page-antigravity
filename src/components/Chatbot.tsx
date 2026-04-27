"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
}

const FAQS = [
  {
    q: "Tôi chưa biết gì về Pickleball có học được không?",
    a: "Dạ được hoàn toàn ạ! Khóa học này thiết kế riêng cho người mới bắt đầu từ con số 0. Anh/Chị sẽ được học từ cách cầm vợt, vị trí đứng đến luật chơi cơ bản chỉ trong 30 phút, để ra sân là chơi được ngay không bị bỡ ngỡ."
  },
  {
    q: "Tôi trên 50 tuổi rồi, môn này có nặng quá không?",
    a: "Anh/Chị yên tâm nhé, Pickleball là môn 'thắng bằng đầu, không thắng bằng chân'. Sân nhỏ, bóng chậm nên ít áp lực lên khớp gối hơn cầu lông hay tennis. Học viên của Coach Thuận Hóa có người 63 tuổi vẫn chơi đều 3 buổi/tuần đó ạ."
  },
  {
    q: "Học online thì làm sao mà biết đánh thật được?",
    a: "Đúng là kỹ năng cần ra sân luyện, nhưng kiến thức nền (biết luật, biết đứng đâu, biết cách di chuyển) thì học online trước sẽ giúp Anh/Chị tiết kiệm 50% thời gian bỡ ngỡ trên sân. Anh/Chị học xong lý thuyết, ra sân thực hành là chuẩn bài luôn ạ."
  },
  {
    q: "Khóa học giá bao nhiêu?",
    a: "Dạ, khóa học trọn đời chỉ 99.000đ — chỉ bằng một ly cà phê Starbucks thôi ạ. Nhưng trước hết, Anh/Chị có thể đăng ký Học Thử Miễn Phí buổi đầu để xem cách dạy của Coach có phù hợp với mình không nhé!"
  },
  {
    q: "Coach Thuận Hóa có bằng cấp gì không?",
    a: "Dạ có ạ, Coach Thuận Hóa đạt chứng chỉ chuẩn PPR Level 2 — đây là bằng cấp huấn luyện Pickleball quốc tế uy tín nhất hiện nay. Coach luôn làm việc với phương châm 'Nói được làm được' nên Anh/Chị hoàn toàn yên tâm về chuyên môn."
  },
  {
    q: "Tôi đã chơi Tennis/Cầu lông rồi thì qua đây có nhanh không?",
    a: "Có lợi thế về cảm giác bóng nhưng kỹ thuật Pickleball rất khác ạ. Nhiều Anh/Chị chơi Tennis qua đây hay đánh mạnh nhưng lại dễ hỏng. Coach sẽ chỉ cho Anh/Chị cách điều chỉnh để tận dụng tối đa kỹ năng cũ mà không bị sai bộ chân."
  },
  {
    q: "Tôi cần chuẩn bị gì cho buổi đầu ra sân?",
    a: "Chỉ cần một đôi giày thể thao bám sân tốt và một tinh thần thoải mái thôi ạ. Vợt thì nếu chưa có, Anh/Chị đừng mua vội, ra sân Coach sẽ cho mượn và tư vấn loại vợt phù hợp với túi tiền của mình sau."
  },
  {
    q: "Học xong có cộng đồng nào để chơi cùng không?",
    a: "Dạ có ạ! Sau khi học xong, Anh/Chị sẽ được tham gia nhóm Zalo học viên của Coach để cùng giao lưu, tìm bạn chơi và hẹn lịch ra sân cùng nhau."
  },
  {
    q: "Một buổi tập thường kéo dài bao lâu?",
    a: "Với lộ trình online thì mỗi video chỉ tầm 5-10 phút, cực kỳ hợp cho người bận rộn. Còn ra sân tập thực tế thường sẽ là 1-2 tiếng tùy vào thể lực của Anh/Chị ạ."
  },
  {
    q: "Làm sao để đăng ký học thử?",
    a: "Anh/Chị chỉ cần để lại thông tin vào Form đăng ký trên website, trợ lý của Coach sẽ liên hệ gửi tài liệu và hướng dẫn Anh/Chị vào lớp ngay ạ."
  }
];

/** Chuẩn hoá để bắt từ khóa tiếng Việt có/không dấu */
function normalizeVi(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Trả lời tin nhắn tự do theo kịch bản (giá / phù hợp / chưa mua). */
function replyForFreeText(raw: string): string | null {
  const n = normalizeVi(raw.trim());
  if (!n) return null;

  if (/(gia|bao nhieu|tien|dong hoc|hoc phi|99|99000)/.test(n)) {
    return FAQS[3].a;
  }
  if (/(phu hop|hop voi|co nen|minh co|voi minh|co hoc duoc|co cho)/.test(n)) {
    return `${FAQS[0].a} ${FAQS[3].a}`;
  }
  if (/(nghi them|de toi|chua chac|tu tu|de em|suy nghi|chua muon|de minh)/.test(n)) {
    return "Nếu Anh/Chị còn chút băn khoăn, không sao cả ạ! Anh/Chị cứ bấm nút 'Nhận lộ trình 4 tuần & Học thử' bên dưới để để lại thông tin — nhận lộ trình 15 phút đầu miễn phí. Khi nào sẵn sàng thì mình nâng cấp sau cũng được ạ!";
  }
  return null;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: "1",
            type: "bot",
            text: "Chào Anh/Chị! Em là trợ lý AI của Coach Thuận Hóa. Rất vui được hỗ trợ Anh/Chị nhập môn Pickleball một cách tự tin nhất. Anh/Chị đang quan tâm đến điều gì ạ?"
          }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleQuestionClick = (q: string, a: string) => {
    const userMsg: Message = { id: Date.now().toString(), type: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    
    setIsTyping(true);
    setTimeout(() => {
      const botMsg: Message = { id: (Date.now() + 1).toString(), type: "bot", text: a };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleCTA = () => {
    setIsOpen(false);
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    const t = draft.trim();
    if (!t || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), type: "user", text: t };
    setDraft("");
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    const body = replyForFreeText(t);
    const answer =
      body ??
      "Em chưa bắt được ý rõ lắm ạ. Anh/Chị thử nhắn về giá, hoặc hỏi khóa có hợp với mình không, hoặc chọn một câu ở dưới nhé.";
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: "bot", text: answer },
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-navy-light rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-brand flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-brand font-bold">
                  TH
                </div>
                <div>
                  <h3 className="text-navy font-black italic uppercase text-sm leading-tight">Coach Thuận Hóa</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-navy/70 font-bold uppercase">Đang hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-navy/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-navy" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-navy/30"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.type === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.type === "user" 
                      ? "bg-accent text-white rounded-tr-none shadow-lg shadow-accent/20" 
                      : "bg-white/10 text-slate-200 border border-white/5 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <span className="w-1 h-1 bg-brand rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-brand rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-brand rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              {/* Quick Actions / FAQs */}
              {!isTyping && (
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">Câu hỏi thường gặp</p>
                  <div className="flex flex-wrap gap-2">
                    {FAQS.map((faq, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuestionClick(faq.q, faq.a)}
                        className="text-xs py-2 px-3 bg-white/5 hover:bg-brand/10 hover:text-brand border border-white/10 rounded-full transition-all text-left max-w-full truncate"
                      >
                        {faq.q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Composer — gõ thử: giá / có hợp với mình / để tôi nghĩ thêm */}
            <div className="px-3 py-2 bg-navy-light border-t border-white/10 flex gap-2 items-center">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhắn nhanh cho em…"
                className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/40"
                disabled={isTyping}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isTyping || !draft.trim()}
                className="shrink-0 p-2.5 rounded-xl bg-brand text-navy disabled:opacity-40 disabled:pointer-events-none hover:opacity-90 transition-opacity"
                aria-label="Gửi"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Footer / CTA */}
            <div className="p-4 bg-navy-light border-t border-white/10">
              <button 
                onClick={handleCTA}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-black italic uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
              >
                Nhận lộ trình 4 tuần & Học thử
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isOpen ? "bg-white text-navy" : "bg-brand text-navy"
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}

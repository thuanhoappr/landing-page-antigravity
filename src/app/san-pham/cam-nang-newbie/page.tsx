import Link from "next/link";
import CamNangCheckout from "@/components/CamNangCheckout";
/** Tránh ký tự ₫/đ bị lỗi font trên một số máy */
const priceLabel = "68.000₫";
const priceLabelLong = "68.000 đ";

export const metadata = {
  title: "Cẩm nang Pickleball NewBie — 68.000đ | Pickleball 30 Phút",
  description:
    "30 phút đọc xong — 5 lỗi hay gặp, checklist buổi đầu, hiểu Kitchen. PDF thực chiến từ Coach PPR.",
};

export default function CamNangNewbiePage() {
  return (
    <main className="min-h-screen bg-darker text-white">
      <header className="border-b border-slate-800 bg-navy/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-400 hover:text-brand">
            pickleball30phut.com
          </Link>
          <a href="#mua-ngay" className="text-sm font-semibold text-brand hover:underline">
            Mua {priceLabel}
          </a>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-10 space-y-12">
        {/* Phần 1 — Tên + tagline */}
        <section className="text-center space-y-4">
          <p className="text-brand text-sm font-semibold uppercase tracking-wide">Sản phẩm số · PDF</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Cẩm nang thực chiến Pickleball cho NewBie
          </h1>
          <p className="text-xl text-slate-300">
            30 phút đọc xong — biết tập gì, đứng đâu, đánh đúng trước khi vào Kitchen.
          </p>
          <p className="text-slate-400 italic">
            Ra sân mà không biết Kitchen — thua vì rối, không phải vì yếu.
          </p>
        </section>

        {/* Phần 2 — Lợi ích */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xl font-bold mb-4">Anh/chị nhận được gì?</h2>
          <ul className="space-y-3 text-slate-300">
            <li>✓ Sửa <strong className="text-white">5 lỗi</strong> người mới hay mắc — đánh đúng trước, mạnh sau.</li>
            <li>✓ <strong className="text-white">Checklist 30 phút</strong> — mang theo điện thoại hoặc in 1 trang.</li>
            <li>✓ Hiểu <strong className="text-white">Kitchen</strong> — đứng đâu, khi nào không nên chen.</li>
            <li>✓ <strong className="text-white">7 ngày</strong> tự luyện ngắn — phù hợp người bận rộn.</li>
            <li>✓ Giọng Coach PPR — thẳng, thực chiến, không corporate.</li>
          </ul>
        </section>

        {/* Phần 3 — Đối tượng */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5">
            <h2 className="font-bold text-emerald-400 mb-3">Phù hợp nếu</h2>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>Mới / sắp chơi, 30–59 tuổi</li>
              <li>Bận, muốn lộ trình ngắn trước khoá dài</li>
              <li>Chưa tập với Coach PPR — thử cách dạy qua PDF</li>
              <li>Sắp có buổi social — ngại lúng túng trên sân</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/30 p-5">
            <h2 className="font-bold text-slate-400 mb-3">Không phù hợp nếu</h2>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>Đã là học viên 1:1 với Coach → xem khoá 499k</li>
              <li>Chỉ muốn thi đấu nâng cao</li>
            </ul>
          </div>
        </section>

        {/* Phần 4 — Tác giả */}
        <section className="rounded-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold mb-3">Coach PPR — đứng sân, dạy nhập môn</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Phương pháp: ít ồn ào, nhiều thực hành — học online ngắn, ra sân có mục tiêu. PDF này là bản Coach dùng cho
            học viên mới; anh/chị chưa tập với Coach vẫn đọc được.
          </p>
          <p className="text-slate-500 text-sm italic">
            &ldquo;Đọc checklist trước buổi social — đỡ rối hơn hẳn, không còn đứng như trúng phải.&rdquo; — học viên
            nhập môn, Zalo Coach PPR
          </p>
        </section>

        {/* Phần 5 — Giá + CTA */}
        <section>
          <h2 className="text-xl font-bold mb-2 text-center">Giá ra mắt</h2>
          <p className="text-center text-slate-400 text-sm mb-6">
            Chỉ {priceLabelLong} — ít hơn một buổi học sai trên sân, đủ chuẩn bị trước khi book tập thử.
          </p>
          <CamNangCheckout />
        </section>

        {/* Phần 6 — Trust */}
        <footer className="text-center text-sm text-slate-500 pb-12 space-y-2 border-t border-slate-800 pt-8">
          <p>pickleball30phut.com · Zalo 0919.117.687</p>
          <p>Không spam — không hứa kết quả thi đấu. Hỗ trợ mở file qua Zalo trong ngày làm việc.</p>
          <p className="text-xs">Mua xong không mở được file — nhắn Zalo, Coach gửi lại link.</p>
        </footer>
      </article>
    </main>
  );
}

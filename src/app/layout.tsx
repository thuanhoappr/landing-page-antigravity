import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickleball 30 Phút - Học Nhanh Chơi Chất",
  description: "Khóa học Pickleball 30 phút giúp bạn nắm bắt kỹ thuật cơ bản, tự tin ra sân thi đấu ngay. Trải nghiệm môn thể thao hot nhất hiện nay!",
  keywords: "pickleball, học pickleball, khóa học pickleball, pickleball 30 phút, dạy chơi pickleball, thể thao",
  openGraph: {
    title: "Pickleball 30 Phút - Học Nhanh Chơi Chất",
    description: "Nắm bắt kỹ thuật và ra sân thi đấu Pickleball chỉ sau 30 phút làm quen. Đăng ký ngay hôm nay!",
    type: "website",
    locale: "vi_VN",
    siteName: "Pickleball 30 Phút",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

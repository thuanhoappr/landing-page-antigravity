import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickleball cho Người Nhập Môn",
  description: "Dành cho người bận rộn. Học online trước để ra sân với Coach không còn là buổi lý thuyết kéo dài, mà là buổi bạn đánh bóng có mục đích.",
  keywords: "pickleball, học pickleball, khóa học pickleball, pickleball cho người nhập môn, pickleball thực chiến",
  openGraph: {
    title: "Pickleball cho Người Nhập Môn",
    description: "Dành cho người bận rộn. Học online trước để ra sân với Coach không còn là buổi lý thuyết kéo dài.",
    type: "website",
    locale: "vi_VN",
    siteName: "Pickleball cho Người Nhập Môn",
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
      <body className="min-h-full flex flex-col">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}

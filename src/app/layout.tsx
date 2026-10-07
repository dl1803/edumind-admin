import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduMind Admin — Hệ thống Quản trị & Điều hành",
  description: "Bảng điều khiển quản trị nền tảng học trực tuyến thông minh EduMind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

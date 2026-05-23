import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sisko Stock Sense | Premium AI Screener",
  description: "Institutional-grade AI stock screener powered by DeepSeek v4 Pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col relative text-slate-50">
        <div className="liquid-background" />
        <main className="flex-1 relative z-10 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}

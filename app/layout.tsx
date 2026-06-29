import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PLUCK — 본질을 뽑아 제품으로",
  description:
    "디자인 · 개발 · AI · 그로스를 한 팀이 처음부터 끝까지. 디지털 프로덕트 스튜디오 PLUCK.",
  metadataBase: new URL("https://pluck.studio"),
  openGraph: {
    title: "PLUCK — Digital Product Studio",
    description:
      "디자인 · 개발 · AI · 그로스. 한 팀이 처음부터 끝까지 책임지는 디지털 프로덕트 스튜디오.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

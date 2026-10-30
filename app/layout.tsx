import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { SourceTracker } from "@/components/source-tracker";
import {
  baseOpenGraph,
  BRAND,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  THEME_COLOR,
} from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Hangul face behind Geist: Latin stays Geist, Korean renders the same on every OS. */
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Search Console / 서치어드바이저 / Bing codes come from env so the owner can add them in Vercel without a code change. */
const verificationOther: Record<string, string> = {};
if (process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION) {
  verificationOther["naver-site-verification"] =
    process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) {
  verificationOther["msvalidate.01"] =
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "홈페이지 제작",
    "웹사이트 제작",
    "앱 개발 외주",
    "MVP 개발",
    "AI 자동화",
    "개발 에이전시",
  ],
  authors: [{ name: BRAND, url: SITE_URL }],
  creator: BRAND,
  publisher: BRAND,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    ...baseOpenGraph,
    type: "website",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: verificationOther,
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansKr.variable}`}
    >
      <body>
        {children}
        <SourceTracker />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./admin.css";

/** Admin is a private tool: noindex, and no inherited SEO/OG/Twitter metadata. */
export const metadata: Metadata = {
  title: { absolute: "PLUCK 관리자" },
  description: null,
  keywords: null,
  openGraph: null,
  twitter: null,
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}

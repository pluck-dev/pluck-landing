import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "관리자", template: "%s | PLUCK 관리자" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}

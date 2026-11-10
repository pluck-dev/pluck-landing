import type { Metadata } from "next";
import Link from "next/link";
import { StudioFooter } from "@/components/site-chrome";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage } from "@/lib/site";
import { isInquiryConfigured } from "@/lib/supabase/env";
import { TRUST_PROMISES } from "@/lib/quote/trust";
import { QuoteFunnel } from "./quote-funnel";

/**
 * Hook-first ad landing page: 개발비 30초 계산기. Not in the nav, not indexed.
 * Prices come from lib/quote/pricing.ts; leads go through submitQuoteInquiry (form tag "lp-quote").
 */
const TITLE = "우리 서비스 개발비, 30초면 나옵니다";
const DESCRIPTION =
  "무엇을 만들지, 화면 수, 필요한 기능만 고르면 개발비 참고 범위와 기간이 바로 나옵니다. 상세 견적서·기획안은 무료로 보내드립니다.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | PLUCK 플럭` },
  description: DESCRIPTION,
  alternates: { canonical: "/lp/quote" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    ...baseOpenGraph,
    type: "website",
    url: "/lp/quote",
    title: `${TITLE} | PLUCK 플럭`,
    description: DESCRIPTION,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | PLUCK 플럭`,
    description: DESCRIPTION,
  },
};

export default function QuotePage() {
  return (
    <div className="lp lp-quote" id="top">
      <header className="lp-header">
        <div className="shell lp-header-inner">
          <Link className="wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <a className="qz-header-link" href="#calculator">
            개발비 계산기
          </a>
        </div>
      </header>

      <main id="main" className="qz-main">
        <div className="qz-shell">
          <QuoteFunnel email={CONTACT_EMAIL} formEnabled={isInquiryConfigured()} />
        </div>

        <section className="qz-trust" aria-label="PLUCK 진행 방식">
          <ul className="qz-shell">
            {TRUST_PROMISES.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <StudioFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import {
  contactMail,
  StudioFooter,
  StudioHeader,
} from "@/components/site-chrome";
import { isInquiryConfigured } from "@/lib/supabase/env";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage } from "@/lib/site";
import { ContactForm } from "./contact-form";

const TITLE = "프로젝트 문의";
const DESCRIPTION =
  "홈페이지 제작, 웹 서비스·앱 개발, AI 업무 자동화 프로젝트를 PLUCK에 문의하세요. 만들고 싶은 것과 일정, 예산 범위를 남겨주시면 무엇부터 만들지 함께 정리해 드립니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    ...baseOpenGraph,
    type: "website",
    url: "/contact",
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

const MAIL_BODY = [
  "이름:",
  "회사/브랜드:",
  "연락처:",
  "프로젝트 종류(웹사이트/웹 서비스/앱/AI 자동화/유지보수/기타):",
  "예산 범위:",
  "희망 일정:",
  "",
  "내용(무엇을, 누구를 위해, 꼭 필요한 기능):",
  "",
].join("\n");

export default function ContactPage() {
  const enabled = isInquiryConfigured();
  const mailHref = `${contactMail("PLUCK 프로젝트 문의")}&body=${encodeURIComponent(MAIL_BODY)}`;

  return (
    <>
      <StudioHeader />
      <main id="main" className="contact-page shell">
        <div className="contact-page-intro">
          <h1>
            만들고 싶은 것을
            <br />
            알려주세요.
          </h1>
          <p>
            아직 정리되지 않은 생각이어도 괜찮습니다. 해결하고 싶은 문제와 대략의
            일정만 알려주시면, 무엇부터 만들지와 예상 범위를 정리해 답장드립니다.
          </p>
          <div className="contact-page-mail">
            <span>메일로 바로 보내셔도 돼요</span>
            <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="contact-page-panel">
          {enabled ? (
            <ContactForm email={CONTACT_EMAIL} />
          ) : (
            <div className="inquiry-fallback">
              <h2>메일로 문의해 주세요</h2>
              <p>
                지금은 온라인 문의 접수를 준비하고 있어요. 아래 버튼을 누르면 문의
                양식이 채워진 메일이 열립니다. 만들고 싶은 것, 일정, 예산 범위를
                적어 보내주세요.
              </p>
              <a className="button button-primary" href={mailHref}>
                메일로 문의하기 <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>
          )}
        </div>
      </main>
      <StudioFooter />
    </>
  );
}

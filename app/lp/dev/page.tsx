import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Plus } from "lucide-react";
import { getPortfolioStats, projects, type PortfolioProject } from "@/lib/portfolio";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage, GITHUB_URL } from "@/lib/site";
import { isInquiryConfigured } from "@/lib/supabase/env";
import { devVariantOf, type DevVariant } from "@/lib/crm/constants";
import { formatPriceRange, PROJECT_KINDS, type KindKey } from "@/lib/quote/pricing";
import { TRUST_PROMISES } from "@/lib/quote/trust";
import { KAKAO_URL, PLAN_PROMISE, REPLY_PROMISE } from "./config";
import { DevQuizProvider, HeroQuiz, QuizSection } from "./dev-quiz";
import { StickyBar } from "./sticky-bar";
import { FAQS } from "./faqs";
import { WorkShowcase, type ShowcaseItem, type ShowcaseType } from "./work-showcase";

/**
 * Main paid-ad landing page (blueprint: C:\Temp\lpresearch\report.md). Not in nav/sitemap, noindex.
 * Headline follows the ad via ?v=price|work|solo. Leads: submitDevInquiry → source.form "lp-dev"
 * + source.variant. Owner settings live in ./config.ts.
 */
const TITLE = "개발비, 30초면 범위가 나옵니다";
const DESCRIPTION =
  "만들 서비스 유형과 기능만 고르면 개발비 참고 범위와 기간이 바로 나옵니다. 기획안 초안·견적·일정은 무료로 정리해 드립니다.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | PLUCK 플럭` },
  description: DESCRIPTION,
  alternates: { canonical: "/lp/dev" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    ...baseOpenGraph,
    type: "website",
    url: "/lp/dev",
    title: `${TITLE} | PLUCK 플럭`,
    description: DESCRIPTION,
    images: [defaultOgImage],
  },
  twitter: { card: "summary_large_image", title: `${TITLE} | PLUCK 플럭`, description: DESCRIPTION },
};

const HEADLINES: Record<DevVariant, { title: [string, string]; sub: string }> = {
  price: {
    title: ["개발비, 30초면", "범위가 나옵니다"],
    sub: "견적 3곳 받았는데 300만~3,000만? 기준부터 알려드릴게요.",
  },
  work: {
    title: ["외주 개발,", "만든 서비스부터 눌러보세요"],
    sub: "말 대신 지금 접속되는 실제 서비스로 보여드립니다. 마음에 들면 30초 견적부터.",
  },
  solo: {
    title: ["상담한 사람이", "그대로 만듭니다"],
    sub: "영업 담당 없이, 처음 상담한 개발자가 기획부터 오픈까지 직접 맡습니다.",
  },
};

/** Owner rule: never feature 보령 on ad pages. */
const EXCLUDED = new Set(["boryoung"]);

const TYPE_RULES: Record<ShowcaseType, RegExp> = {
  web: /website|brand site|marketing|event page|e-commerce|seo/i,
  app: /mobile web|flutter|pwa|android|webview/i,
  system: /admin|operations|settlement|lms|reservation|platform|community|web app|web service/i,
};

function showcaseItems(list: readonly PortfolioProject[]): ShowcaseItem[] {
  return list
    .filter((p) => p.status === "live" && p.url && p.coverKind === "screenshot" && !EXCLUDED.has(p.slug))
    .map((p) => {
      const tags = p.disciplines.join(" ");
      const types = (Object.keys(TYPE_RULES) as ShowcaseType[]).filter((type) => TYPE_RULES[type].test(tags));
      return {
        slug: p.slug,
        name: p.name,
        oneLiner: p.detail.oneLiner,
        url: p.url!,
        linkLabel: p.url!.includes("play.google.com") ? "스토어에서 보기" : "사이트 열기",
        cover: { src: p.cover.src, alt: p.cover.alt },
        types: types.length ? types : ["web"],
      };
    });
}

const toWeeks = ([low, high]: readonly [number, number]) =>
  [Math.max(2, Math.round(low / 7)), Math.max(3, Math.round(high / 7))] as const;

const KIND_KEYS = Object.keys(PROJECT_KINDS) as KindKey[];

const PAINS = [
  {
    title: "견적 3곳, 300만~3,000만?",
    text: "같은 설명을 했는데 금액이 10배 차이. 무엇이 포함된 금액인지 기준이 없어서 비교가 안 됩니다.",
  },
  {
    title: "상담한 사람 따로, 만드는 사람 따로",
    text: "영업 담당과 상담하고, 실제 개발은 처음 보는 사람이. 전달되는 사이 처음 의도가 빠집니다.",
  },
  {
    title: "오픈하고 나면 연락이 안 됩니다",
    text: "고치고 싶은데 답이 없고, 소스코드도 받지 못해 다른 곳에 맡기기도 어렵습니다.",
  },
];

const OFFER = [
  { title: "기획안 초안", text: "꼭 필요한 기능과 화면 흐름, 1차로 열 범위를 정리합니다." },
  { title: "예상 견적 범위", text: "기능별로 나눈 금액 범위. 무엇이 비용을 올리는지 같이 적습니다." },
  { title: "일정", text: "디자인·개발·오픈까지 단계별 예상 일정을 드립니다." },
];

const CHECKLIST = [
  {
    title: "기능이 화면 단위로 적혀 있나요?",
    text: "“쇼핑몰 제작 일체”처럼 한 줄이면 나중에 빠진 기능이 전부 추가 비용이 됩니다. 화면·기능 목록을 받아 두세요.",
  },
  {
    title: "수정은 몇 번, 어디까지인가요?",
    text: "디자인 시안 수정 횟수와 개발 중 변경을 어떻게 처리하는지 계약 전에 적어 두면 분쟁이 줄어듭니다.",
  },
  {
    title: "소스코드와 계정은 누구 것이 되나요?",
    text: "완료 후 소스코드, 서버·도메인·스토어 계정을 넘겨받는지 확인하세요. 못 받으면 다른 곳에 맡기기 어렵습니다.",
  },
  {
    title: "오픈 후 수정·유지보수는요?",
    text: "버그 수정을 언제까지 무상으로 하는지, 이후 유지보수 비용은 얼마인지 견적서에 따로 있는지 보세요.",
  },
  {
    title: "실제로 만드는 사람은 누구인가요?",
    text: "상담한 사람이 직접 만드는지, 다른 곳에 다시 맡기는지 물어보세요. 소통 속도와 결과물이 달라집니다.",
  },
];


export default async function DevLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { v } = await searchParams;
  const variant = devVariantOf(Array.isArray(v) ? v[0] : v);
  const headline = HEADLINES[variant];
  const stats = getPortfolioStats(projects);
  const work = showcaseItems(projects);
  const formEnabled = isInquiryConfigured();

  const allDays = KIND_KEYS.flatMap((key) => PROJECT_KINDS[key].days);
  const buildWeeks = toWeeks([Math.min(...allDays), Math.max(...allDays)]);
  const homepageWeeks = toWeeks(PROJECT_KINDS.homepage.days);
  const adminWeeks = toWeeks(PROJECT_KINDS.admin.days);

  const steps = [
    { title: "견적 계산·신청", time: "30초", text: "유형과 기능을 고르고 연락처를 남기면 끝입니다." },
    { title: "상담", time: REPLY_PROMISE, text: "남겨주신 연락처로 직접 연락드려 필요한 것을 여쭙습니다." },
    { title: "기획안·견적·일정", time: PLAN_PROMISE, text: "화면 흐름, 기능별 견적, 단계별 일정을 정리해 보내드립니다." },
    {
      title: "디자인·개발",
      time: `${buildWeeks[0]}~${buildWeeks[1]}주`,
      text: `홈페이지 ${homepageWeeks[0]}~${homepageWeeks[1]}주, 관리자·업무 시스템 ${adminWeeks[0]}~${adminWeeks[1]}주 정도. 매주 실제로 동작하는 화면을 공유합니다.`,
    },
    { title: "오픈·이전", time: "오픈 주", text: "배포와 안정화 후 소스코드와 계정을 모두 넘겨드립니다." },
  ];

  return (
    <div className="lp ld" id="top">
      <a className="skip-link" href="#quiz">
        견적 계산으로 건너뛰기
      </a>
      <header className="lp-header">
        <div className="shell lp-header-inner">
          <Link className="wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <a className="header-contact" href="#quiz">
            무료 견적
          </a>
        </div>
      </header>

      <DevQuizProvider>
        <main id="main">
          {/* S1 hero */}
          <section className="ld-hero" aria-labelledby="ld-title">
            <div className="shell ld-hero-inner">
              <div className="ld-hero-copy">
                <h1 id="ld-title">
                  {headline.title[0]}
                  <br />
                  <em>{headline.title[1]}</em>
                </h1>
                <p className="ld-hero-sub">{headline.sub}</p>
                <ul className="ld-proof" aria-label="PLUCK 실적">
                  <li>
                    프로젝트 <strong>{stats.total}개</strong>
                  </li>
                  <li>
                    지금 접속 가능 <strong>{stats.live}개</strong>
                  </li>
                  <li>
                    <strong>소스코드 전부 이전</strong>
                  </li>
                </ul>
              </div>
              <div className="ld-hero-side">
                <HeroQuiz />
                {KAKAO_URL && (
                  <a className="button ld-kakao ld-hero-kakao" href={KAKAO_URL} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} aria-hidden="true" /> 카카오톡 상담
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* S2 pain */}
          <section className="ld-section ld-pain" aria-labelledby="ld-pain-title">
            <div className="shell">
              <h2 id="ld-pain-title" className="ld-title">
                외주 맡기기 전, 이런 경험 있으셨죠
              </h2>
              <ul className="ld-pain-list">
                {PAINS.map((pain) => (
                  <li key={pain.title}>
                    <h3>{pain.title}</h3>
                    <p>{pain.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* S3 work first */}
          <section className="ld-section ld-work" id="work" aria-labelledby="ld-work-title">
            <div className="shell">
              <div className="ld-head">
                <h2 id="ld-work-title" className="ld-title">
                  결과물 먼저 보세요
                </h2>
                <p>
                  PLUCK이 만들어 지금 접속되는 서비스 {work.length}개. 설명 대신 직접 눌러 보세요.
                </p>
              </div>
              <WorkShowcase items={work} />
            </div>
          </section>

          {/* S4 free offer */}
          <section className="ld-section ld-offer" aria-labelledby="ld-offer-title">
            <div className="shell ld-offer-inner">
              <div>
                <h2 id="ld-offer-title" className="ld-title">
                  무료로 받는 것
                </h2>
                <p className="ld-offer-promise">
                  <Check size={18} aria-hidden="true" /> {REPLY_PROMISE} · 받아 보고 진행 여부 결정
                </p>
              </div>
              <ol className="ld-offer-list">
                {OFFER.map((item) => (
                  <li key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* S5 price table */}
          <section className="ld-section" aria-labelledby="ld-price-title">
            <div className="shell">
              <div className="ld-head">
                <h2 id="ld-price-title" className="ld-title">
                  유형별 참고 가격
                </h2>
                <p>기능을 더하지 않은 기본 범위입니다. 화면 수와 기능에 따라 달라져요.</p>
              </div>
              <div className="ld-price">
                <table>
                  <caption>실제 제안 금액 기반 참고 범위 · 상담 후 확정 · VAT 별도</caption>
                  <thead>
                    <tr>
                      <th scope="col">유형</th>
                      <th scope="col">참고 금액</th>
                      <th scope="col">기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KIND_KEYS.map((key) => {
                      const kind = PROJECT_KINDS[key];
                      const weeks = toWeeks(kind.days);
                      return (
                        <tr key={key}>
                          <th scope="row">{kind.label}</th>
                          <td>{formatPriceRange(kind.price)}</td>
                          <td>
                            {weeks[0]}~{weeks[1]}주
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <a className="button button-primary ld-price-cta" href="#quiz">
                  내 조건으로 30초 계산하기 <ArrowRight size={18} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>

          {/* S6 why solo */}
          <section className="ld-section ld-why" aria-labelledby="ld-why-title">
            <div className="shell">
              <div className="ld-head">
                <h2 id="ld-why-title" className="ld-title">
                  왜 1인 개발 스튜디오인가
                </h2>
                <p>상담하는 사람과 만드는 사람이 같으면, 말한 것이 그대로 화면이 됩니다.</p>
              </div>
              <ul className="ld-why-list">
                {TRUST_PROMISES.map((item) => (
                  <li key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* S7 process */}
          <section className="ld-section" aria-labelledby="ld-steps-title">
            <div className="shell">
              <h2 id="ld-steps-title" className="ld-title">
                진행은 이렇게 합니다
              </h2>
              <ol className="ld-steps">
                {steps.map((step) => (
                  <li key={step.title}>
                    <p className="ld-step-time">{step.time}</p>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* S8 checklist */}
          <section className="ld-section" aria-labelledby="ld-check-title">
            <div className="shell ld-check">
              <div className="ld-check-head">
                <h2 id="ld-check-title" className="ld-title">
                  견적서 받을 때 꼭 확인할 5가지
                </h2>
                <p>어디에 맡기시든 이것만 확인하면 같은 기준으로 비교할 수 있습니다.</p>
              </div>
              <ol className="ld-check-list">
                {CHECKLIST.map((item) => (
                  <li key={item.title}>
                    <Check size={20} aria-hidden="true" />
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* S9 FAQ */}
          <section className="ld-section" aria-labelledby="ld-faq-title">
            <div className="shell lp-faq">
              <h2 id="ld-faq-title" className="ld-title">
                자주 묻는 질문
              </h2>
              <div className="faq-list">
                {FAQS.map(([question, answer]) => (
                  <details key={question}>
                    <summary>
                      {question}
                      <Plus size={20} aria-hidden="true" />
                    </summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* S10 quiz → result → form */}
          <section className="ld-apply" id="quiz" aria-labelledby="ld-quiz-title">
            <div className="shell ld-apply-inner">
              <div className="ld-apply-copy">
                <h2 id="ld-quiz-title">
                  30초 견적 계산
                </h2>
                <p>질문 5개에 탭만 하면 참고 범위가 바로 나옵니다. 연락처는 결과를 본 뒤에 남기셔도 됩니다.</p>
                <ul>
                  <li>
                    <Check size={18} aria-hidden="true" /> 상담·견적 무료
                  </li>
                  <li>
                    <Check size={18} aria-hidden="true" /> {REPLY_PROMISE}
                  </li>
                  <li>
                    <Check size={18} aria-hidden="true" /> 받아 보고 진행 여부 결정
                  </li>
                </ul>
              </div>
              <QuizSection variant={variant} formEnabled={formEnabled} email={CONTACT_EMAIL} />
            </div>
          </section>
        </main>
      </DevQuizProvider>

      {/* S11 footer */}
      <footer className="shell footer ld-footer">
        <Link className="wordmark" href="/" aria-label="PLUCK 홈">
          pluck<span>®</span>
        </Link>
        <span>© {new Date().getFullYear()} PLUCK</span>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <Link href="/privacy">개인정보처리방침</Link>
        <a href="#top">맨 위로 ↑</a>
      </footer>

      <StickyBar />
    </div>
  );
}

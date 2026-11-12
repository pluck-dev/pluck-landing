import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { getPortfolioStats, getProject, projects, type PortfolioProject } from "@/lib/portfolio";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage, GITHUB_URL } from "@/lib/site";
import { isInquiryConfigured } from "@/lib/supabase/env";
import { formatPriceRange, PROJECT_KINDS, type KindKey } from "@/lib/quote/pricing";
import { TRUST_PROMISES } from "@/lib/quote/trust";
import { PLAN_PROMISE, REPLY_PROMISE } from "../dev/config";
import { FAQS } from "../dev/faqs";
import { GoBar, GoTabs } from "./go-chrome";
import { GoQuiz } from "./go-quiz";
import "./go.css";

/**
 * 상세페이지형 ad landing page (reference feel: a Korean long-scroll sales page — narrow dark column,
 * neon highlights, big proof numbers, sticky tabs + bottom offer bar). Not in nav/sitemap, noindex.
 * Every number comes from lib/portfolio.ts or lib/quote/pricing.ts. Leads: submitGoInquiry → "lp-go".
 */
const TITLE = "외주 개발, 결과물부터 보고 맡기세요";
const DESCRIPTION =
  "홈페이지·앱·관리자 시스템·자동화까지 기획부터 오픈까지 대표가 직접. 지금 접속되는 실제 서비스를 먼저 보고, 기획안 초안·견적·일정은 무료로 받아 보세요.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | PLUCK 플럭` },
  description: DESCRIPTION,
  alternates: { canonical: "/lp/go" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    ...baseOpenGraph,
    type: "website",
    url: "/lp/go",
    title: `${TITLE} | PLUCK 플럭`,
    description: DESCRIPTION,
    images: [defaultOgImage],
  },
  twitter: { card: "summary_large_image", title: `${TITLE} | PLUCK 플럭`, description: DESCRIPTION },
};

/**
 * Case cards: live client/app work with real screenshots (owner rule: never 보령 on ad pages).
 * before/after are short paraphrases of each project's detail.problem / detail.solution.
 */
const CASES: { slug: string; image: string; before: string; after: string }[] = [
  {
    slug: "knife-sharpening",
    image: "/work/knife-sharpening/cover.webp",
    before: "매장에 직접 가야 하는 칼갈이",
    after: "몇 단계 만에 수거 신청·정기 구독",
  },
  {
    slug: "dealer-settlement",
    image: "/work/dealer-settlement/01.webp",
    before: "엑셀로 계약·수수료를 사람이 대조",
    after: "관리자·딜러 웹이 한 DB에서 정산",
  },
  {
    slug: "homecare-platform",
    image: "/work/homecare-platform/02.webp",
    before: "안내·상담·교육이 채널마다 따로",
    after: "웹·아카데미·관리자 3개 앱을 한 흐름으로",
  },
  {
    slug: "setflow",
    image: "/work/setflow/cover.webp",
    before: "입력이 번거로우면 끊기는 운동 기록",
    after: "캘린더에서 바로 세트 기록·코칭·정산",
  },
  {
    slug: "dvia",
    image: "/work/dvia/cover.webp",
    before: "수치로만 설명하던 정밀 장비",
    after: "3D 분해 구조·스크롤 모션으로 원리를 보여줌",
  },
];

const OFFER = [
  { kicker: "무엇부터 만들지", title: "기획안 초안", text: "꼭 필요한 기능과 화면 흐름, 1차로 열 범위" },
  { kicker: "얼마나 드는지", title: "예상 견적 범위", text: "기능별로 나눈 금액, 무엇이 비용을 올리는지까지" },
  { kicker: "언제 열 수 있는지", title: "단계별 일정", text: "디자인 · 개발 · 오픈까지 주 단위로" },
];

const BENEFITS = [
  {
    title: "상담한 사람이 그대로 만듭니다",
    text: "영업 담당 없이, 처음 상담한 대표가 기획부터 오픈까지 직접 맡습니다.",
  },
  {
    title: "매주 실제 화면을 공유합니다",
    text: "보고서 대신, 일주일마다 실제로 눌러 볼 수 있는 화면을 보여드립니다.",
  },
  {
    title: "소스코드·계정 전부 넘겨드립니다",
    text: "완료 후 소스코드와 계정을 모두 넘겨드려서, 나중에 다른 개발자가 이어서 작업할 수 있습니다.",
  },
];

const WHY_SOLO = [
  { title: "전달 과정이 없습니다", text: "말한 사람과 만드는 사람이 같아서, 처음 의도가 중간에 빠지지 않습니다." },
  { title: "관리 단계가 붙지 않습니다", text: "영업·PM·재하청 단계가 없어 견적이 개발에 쓰입니다." },
  { title: "답이 빠릅니다", text: "질문하면 코드를 아는 사람이 바로 답합니다. 확인하고 다시 연락드릴 일이 줄어듭니다." },
  {
    title: "동시 진행 수를 제한합니다",
    text: "그래서 계약 전에 착수일과 오픈 일정을 먼저 확정합니다. 못 맞추면 계약 전에 그대로 말씀드립니다.",
  },
];

const QUIZ_STEPS = ["무엇을 만들지", "화면은 몇 개쯤", "필요한 기능", "디자인 수준", "원하는 일정"];

const KIND_KEYS = Object.keys(PROJECT_KINDS) as KindKey[];
const toWeeks = ([low, high]: readonly [number, number]) =>
  [Math.max(2, Math.round(low / 7)), Math.max(3, Math.round(high / 7))] as const;

/** The /lp/dev FAQ, minus its pointer to a checklist this page doesn't have. */
const GO_FAQS = FAQS.map(([question, answer]): [string, string] => [
  question,
  answer.replace(" 위 체크리스트로 같은 기준을 맞추면 비교가 쉬워집니다.", " 무료 기획안에는 화면·기능 단위 범위를 적어 드려서 다른 견적과 같은 기준으로 비교할 수 있습니다."),
]);

function linksOf(project: PortfolioProject) {
  if (project.apps?.length) {
    return project.apps
      .filter((app) => app.url)
      .map((app) => ({ label: app.name.split(" · ")[0], url: app.url! }));
  }
  if (!project.url) return [];
  return [{ label: project.url.includes("play.google.com") ? "스토어에서 보기" : "사이트 열기", url: project.url }];
}

export default function GoLandingPage() {
  const stats = getPortfolioStats(projects);
  const formEnabled = isInquiryConfigured();
  const cases = CASES.map((item) => ({ ...item, project: getProject(item.slug) })).filter(
    (item): item is typeof item & { project: PortfolioProject } =>
      Boolean(item.project && item.project.status === "live"),
  );

  return (
    <div className="go" id="top">
      <a className="skip-link" href="#quiz">
        30초 견적으로 건너뛰기
      </a>
      <div className="go-col">
        <header className="go-header">
          <Link className="go-wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <a className="go-header-link" href="#quiz">
            무료 견적
          </a>
        </header>

        <main id="main">
          {/* Hero: real product screens composed on a dark gradient */}
          <section className="go-hero" aria-labelledby="go-title">
            <div className="go-hero-visual" aria-hidden="true">
              <div className="go-laptop">
                <div className="go-laptop-screen" />
                <div className="go-laptop-base" />
              </div>
              <div className="go-phone go-phone-knife" />
              <div className="go-phone go-phone-setflow" />
            </div>
            <div className="go-hero-copy">
              <p className="go-kicker">
                <span className="go-dot" aria-hidden="true" />
                1인 개발 스튜디오 PLUCK · 상담·견적 무료
              </p>
              <h1 id="go-title">
                외주 개발,
                <br />
                <span className="go-mark">결과물부터</span> 보고 맡기세요
              </h1>
              <p className="go-hero-sub">
                홈페이지·앱·관리자 시스템·자동화까지
                <br />
                기획부터 오픈까지 대표가 직접 합니다.
              </p>
              <ul className="go-chips">
                {["기획안 무료", "소스코드 전부 이전", "매주 진행 공유"].map((chip) => (
                  <li key={chip}>
                    <Check size={12} strokeWidth={3.5} aria-hidden="true" />
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <GoTabs />

          {/* Proof: real counts from lib/portfolio.ts */}
          <section className="go-sec go-proof" id="intro" aria-labelledby="go-proof-title">
            <p className="go-eyebrow">말보다 먼저, 만든 것</p>
            <h2 id="go-proof-title" className="go-h2">
              숫자로 보는 <span className="go-hl">PLUCK</span>
            </h2>
            <ul className="go-proof-list">
              <li className="go-card">
                <Check className="go-badge" size={16} strokeWidth={3.5} aria-hidden="true" />
                <p className="go-proof-label">지금까지 만든 프로젝트</p>
                <p className="go-big">
                  {stats.total}
                  <small>개</small>
                </p>
                <p className="go-proof-note">클라이언트 작업·자체 서비스·앱·AI 자동화 ({stats.span})</p>
              </li>
              <li className="go-card">
                <Check className="go-badge" size={16} strokeWidth={3.5} aria-hidden="true" />
                <p className="go-proof-label">지금 접속해 볼 수 있는 서비스</p>
                <p className="go-big">
                  {stats.live}
                  <small>개</small>
                </p>
                <p className="go-proof-note">링크를 눌러 직접 확인할 수 있습니다</p>
              </li>
              <li className="go-card">
                <Check className="go-badge" size={16} strokeWidth={3.5} aria-hidden="true" />
                <p className="go-proof-label">클라이언트 프로젝트</p>
                <p className="go-big">
                  {stats.client}
                  <small>개</small>
                </p>
                <p className="go-proof-note">방문간호·보험 딜러·제조·학원·커뮤니티 등</p>
              </li>
              <li className="go-card go-card-pink">
                <Check className="go-badge" size={16} strokeWidth={3.5} aria-hidden="true" />
                <p className="go-proof-label">기획·디자인·개발, 대표가 직접</p>
                <p className="go-big">
                  100<small>%</small>
                </p>
                <p className="go-proof-note">재하청 없음</p>
              </li>
            </ul>
          </section>

          {/* Story */}
          <section className="go-sec go-story" aria-labelledby="go-story-title">
            <h2 id="go-story-title" className="go-story-line">
              아직도
              <br />
              <span className="go-hl">견적서만 3장째</span>라면
            </h2>
            <div className="go-quotes" aria-hidden="true">
              <div className="go-quote go-quote-a">
                <span>A사 견적</span>
                <strong>300만 원</strong>
              </div>
              <div className="go-quote go-quote-b">
                <span>B사 견적</span>
                <strong>1,200만 원</strong>
              </div>
              <div className="go-quote go-quote-c">
                <span>C사 견적</span>
                <strong>3,000만 원</strong>
              </div>
            </div>
            <p className="go-caption">같은 설명, 10배 차이 나는 견적 (예시)</p>
            <p className="go-story-sub">
              무엇이 들어간 금액인지 기준이 없으면
              <br />
              비교도, 결정도 할 수 없습니다.
            </p>
            <p className="go-story-line go-story-end">
              더 늦기 전에
              <br />
              <span className="go-hl">기준부터</span> 잡으세요
            </p>
          </section>

          {/* Stacked offer */}
          <section className="go-sec go-offer" aria-labelledby="go-offer-title">
            <p className="go-eyebrow">상담만 받아도, 무료로</p>
            <h2 id="go-offer-title" className="go-h2">
              손에 쥐고
              <br />
              비교할 수 있게 드립니다
            </h2>
            <ol className="go-stack">
              {OFFER.map((item, index) => (
                <li key={item.title}>
                  {index > 0 && (
                    <span className="go-plus" aria-hidden="true">
                      <Plus size={22} strokeWidth={3.5} />
                    </span>
                  )}
                  <div className="go-card go-stack-card">
                    <p className="go-stack-kicker">{item.kicker}</p>
                    <h3>{item.title}</h3>
                    <p className="go-stack-text">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="go-pill">받아 보고 결정하세요</p>
            <p className="go-fine">
              {REPLY_PROMISE} · 기획안은 {PLAN_PROMISE}
            </p>
          </section>

          {/* 01/02/03 */}
          <section className="go-sec go-benefits" aria-labelledby="go-benefit-title">
            <p className="go-eyebrow">맡기고 나서가 더 중요하니까</p>
            <h2 id="go-benefit-title" className="go-h2">
              PLUCK에 맡기면
              <br />
              <span className="go-hl">이렇게 진행됩니다</span>
            </h2>
            <ol className="go-num-list">
              {BENEFITS.map((item, index) => (
                <li key={item.title} className="go-card">
                  <span className="go-num">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Case studies */}
          <section className="go-sec go-work" id="work" aria-labelledby="go-work-title">
            <p className="go-eyebrow">지금 접속되는 서비스 {stats.live}개 중</p>
            <h2 id="go-work-title" className="go-h2">
              말 대신
              <br />
              <span className="go-hl">결과물로</span> 보여드립니다
            </h2>
            <ul className="go-cases">
              {cases.map(({ project, image, before, after }) => (
                <li key={project.slug} className="go-case">
                  <div className="go-case-shot">
                    <Image
                      src={image}
                      alt={project.cover.alt}
                      width={1600}
                      height={1000}
                      sizes="(max-width: 480px) 100vw, 440px"
                    />
                    <span className="go-live">
                      <span className="go-dot" aria-hidden="true" /> 지금 접속 가능
                    </span>
                  </div>
                  <div className="go-case-body">
                    <p className="go-case-role">{project.detail.role.slice(0, 4).join(" · ")}</p>
                    <h3>{project.name}</h3>
                    <p className="go-case-one">{project.detail.oneLiner}</p>
                    <div className="go-ba">
                      <p>
                        <span>전</span>
                        {before}
                      </p>
                      <ArrowRight className="go-ba-arrow" size={20} strokeWidth={3} aria-hidden="true" />
                      <p className="go-ba-after">
                        <span>후</span>
                        {after}
                      </p>
                    </div>
                    <ul className="go-feats">
                      {project.detail.features.slice(0, 4).map((feature) => (
                        <li key={feature}>
                          <Check size={14} strokeWidth={3} aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="go-case-links">
                      {linksOf(project).map((link) => (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.label} <ArrowUpRight size={15} aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link className="go-more" href="/#work">
              전체 {stats.total}개 작업 보기 <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>

          {/* Why solo */}
          <section className="go-sec go-why" aria-labelledby="go-why-title">
            <p className="go-eyebrow">그런데,</p>
            <h2 id="go-why-title" className="go-h2">
              왜 <span className="go-hl">1인 스튜디오</span>인가요?
            </h2>
            <ol className="go-why-list">
              {WHY_SOLO.map((item, index) => (
                <li key={item.title}>
                  <span className="go-num">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
            <ul className="go-promises" aria-label="약속">
              {TRUST_PROMISES.map((item) => (
                <li key={item.title}>
                  <Check size={18} strokeWidth={3} aria-hidden="true" />
                  {item.title}
                </li>
              ))}
            </ul>
          </section>

          {/* Price reference */}
          <section className="go-sec go-price" aria-labelledby="go-price-title">
            <p className="go-eyebrow">숨기지 않습니다</p>
            <h2 id="go-price-title" className="go-h2">
              유형별 <span className="go-hl">참고 가격</span>
            </h2>
            <div className="go-card go-price-card">
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
              <p className="go-price-note">기능을 더하지 않은 기본 범위입니다. 내 조건은 아래 30초 견적으로 확인하세요.</p>
            </div>
          </section>

          {/* Quiz → result → form */}
          <section className="go-sec go-apply" id="quiz" aria-labelledby="go-quiz-title">
            <p className="go-eyebrow">연락처 없이 결과부터</p>
            <h2 id="go-quiz-title" className="go-h2">
              단 <span className="go-hl">30초</span>면
              <br />
              범위가 나옵니다
            </h2>
            <ul className="go-checks">
              {QUIZ_STEPS.map((step) => (
                <li key={step}>
                  <span className="go-checkbox" aria-hidden="true">
                    <Check size={16} strokeWidth={3.5} />
                  </span>
                  {step}
                </li>
              ))}
            </ul>
            <GoQuiz formEnabled={formEnabled} email={CONTACT_EMAIL} />
          </section>

          {/* FAQ */}
          <section className="go-sec go-faq" id="faq" aria-labelledby="go-faq-title">
            <h2 id="go-faq-title" className="go-h2">
              자주 묻는 질문
            </h2>
            <div className="go-faq-list">
              {GO_FAQS.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    <span>
                      <b>Q.</b> {question}
                    </span>
                    <Plus size={20} aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
            <a className="go-cta" href="#quiz">
              30초 견적 시작하기 <ArrowRight size={18} aria-hidden="true" />
            </a>
          </section>
        </main>

        <footer className="go-footer">
          <Link className="go-wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <p>상호 PLUCK · 1인 개발 스튜디오</p>
          <p>
            문의 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p className="go-footer-links">
            <Link href="/privacy">개인정보처리방침</Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <Link href="/">pluck.co.kr</Link>
          </p>
          <p className="go-footer-copy">© {new Date().getFullYear()} PLUCK</p>
        </footer>
      </div>

      <GoBar />
    </div>
  );
}

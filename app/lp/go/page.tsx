import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Noto_Serif_KR } from "next/font/google";
import { ArrowDown, ArrowRight, ArrowUpRight, Minus, Plus } from "lucide-react";
import { getPortfolioStats, getProject, projects, type PortfolioProject } from "@/lib/portfolio";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage, GITHUB_URL } from "@/lib/site";
import { isInquiryConfigured } from "@/lib/supabase/env";
import { formatPriceRange, PROJECT_KINDS, type KindKey } from "@/lib/quote/pricing";
import { PLAN_PROMISE, REPLY_PROMISE } from "../dev/config";
import { FAQS } from "../dev/faqs";
import type { CSSProperties, ReactNode } from "react";
import { GoChrome } from "./go-chrome";
import { GoMotion } from "./go-motion";
import { GoQuiz } from "./go-quiz";
import "./go.css";

/** Editorial display face for headlines (Korean serif); body stays the site's Geist + Noto Sans KR. */
const serif = Noto_Serif_KR({
  variable: "--font-go-serif",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
  preload: false,
});

/** Stagger index for CSS (transition-delay: calc(var(--i) * …)). */
const idx = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * 3D renders generated locally (ComfyUI · Wan 2.2 TI2V-5B single frame, background removed).
 * The originals are lime/pink; go.css re-tints them to PLUCK blue (.go-tint) instead of regenerating.
 */
const ART = {
  hero: { src: "/lp/go/hero-dev.webp", width: 575, height: 733 },
  quotes: { src: "/lp/go/icon-quotes.webp", width: 420, height: 406 },
  check: { src: "/lp/go/icon-check.webp", width: 353, height: 360 },
  calendar: { src: "/lp/go/icon-calendar.webp", width: 378, height: 420 },
  code: { src: "/lp/go/icon-code.webp", width: 417, height: 420 },
  magnifier: { src: "/lp/go/icon-magnifier.webp", width: 408, height: 420 },
  rocket: { src: "/lp/go/icon-rocket.webp", width: 296, height: 353 },
  chat: { src: "/lp/go/icon-chat.webp", width: 192, height: 420 },
} as const;

/** Generic "developer went silent" chat (no names). Every message stays unread. */
const SILENT_CHAT = [
  { day: "월요일", time: "오전 10:12", text: "이번 주 진행 상황 공유 부탁드려요" },
  { day: "수요일", time: "오후 2:30", text: "혹시 메시지 확인하셨을까요?" },
  { day: "금요일", time: "오후 6:05", text: "오픈 일정 때문에 연락 꼭 부탁드립니다" },
] as const;

/**
 * /lp/go — editorial ad landing page in PLUCK's own language: full-width asymmetric chapters
 * (01 문제 · 02 증거 · 03 약속 · 04 견적 · 05 질문), navy/paper + brand blue, serif display headlines,
 * top progress line + floating quiz-progress chip. Not in nav/sitemap, noindex.
 * Every number comes from lib/portfolio.ts or lib/quote/pricing.ts. Leads: submitGoInquiry → "lp-go".
 */
const TITLE = "견적서 말고, 만든 걸 먼저 보세요";
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
 * Proof tiles: live client/app work with real screenshots (owner rule: never 보령 on ad pages).
 * before/after are short paraphrases of each project's detail.problem / detail.solution.
 */
const CASES: { slug: string; image: string; before: string; after: string }[] = [
  {
    slug: "dealer-settlement",
    image: "/work/dealer-settlement/01.webp",
    before: "엑셀로 계약·수수료를 사람이 대조",
    after: "관리자·딜러 웹이 한 DB에서 정산",
  },
  {
    slug: "knife-sharpening",
    image: "/work/knife-sharpening/cover.webp",
    before: "매장에 직접 가야 하는 칼갈이",
    after: "몇 단계 만에 수거 신청·정기 구독",
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

/** "흔한 외주 진행" is phrased as common experience, not a claim about any company. */
const COMPARE: { row: string; usual: string; pluck: string }[] = [
  { row: "상담하는 사람", usual: "영업 담당이 상담하고, 개발은 다른 사람이 맡음", pluck: "상담한 대표가 기획부터 오픈까지 직접" },
  { row: "견적서", usual: "총액 한 줄, 무엇이 들어갔는지 알기 어려움", pluck: "화면·기능 단위로 나눈 금액과 이유" },
  { row: "진행 확인", usual: "중간 보고서, 완성 무렵에야 첫 화면", pluck: "매주 실제로 눌러 볼 수 있는 화면 공유" },
  { row: "일정", usual: "착수 후에 조정되는 경우가 많음", pluck: "동시 진행 수를 제한하고, 계약 전에 착수일·오픈일 확정" },
  { row: "질문했을 때", usual: "확인해 보고 다시 연락드리겠습니다", pluck: "코드를 아는 사람이 바로 답장" },
  { row: "끝난 뒤", usual: "소스코드·계정 이전은 별도 협의", pluck: "소스코드와 계정 전부 이전, 누구든 이어서 작업 가능" },
];

const DOC_PARTS = [
  { title: "꼭 필요한 기능", art: ART.check },
  { title: "기능별 견적 범위", art: ART.magnifier },
  { title: "단계별 일정", art: ART.rocket },
] as const;

const KIND_KEYS = Object.keys(PROJECT_KINDS) as KindKey[];
const toWeeks = ([low, high]: readonly [number, number]) =>
  [Math.max(2, Math.round(low / 7)), Math.max(3, Math.round(high / 7))] as const;

/** The /lp/dev FAQ, minus its pointer to a checklist this page doesn't have. */
const GO_FAQS = FAQS.map(([question, answer]): [string, string] => [
  question,
  answer.replace(
    " 위 체크리스트로 같은 기준을 맞추면 비교가 쉬워집니다.",
    " 무료 기획안에는 화면·기능 단위 범위를 적어 드려서 다른 견적과 같은 기준으로 비교할 수 있습니다.",
  ),
]);

function linksOf(project: PortfolioProject) {
  if (project.apps?.length) {
    return project.apps
      .filter((app) => app.url)
      .map((app) => ({ label: app.name.split(" · ")[0], url: app.url! }));
  }
  if (!project.url) return [];
  return [{ label: project.url.includes("play.google.com") ? "스토어" : "사이트 열기", url: project.url }];
}

/** Left rail of every chapter: chapter number + name, then the headline. Sticky on desktop. */
function ChapterHead({ no, name, id, children, lead }: { no: string; name: string; id: string; children: ReactNode; lead?: ReactNode }) {
  return (
    <header className="go-ch-head" data-reveal>
      <p className="go-ch-no">
        <span>Chapter {no}</span>
        <b>{name}</b>
      </p>
      <h2 id={id} className="go-h2">
        {children}
      </h2>
      {lead && <p className="go-lead-text">{lead}</p>}
    </header>
  );
}

export default function GoLandingPage() {
  const stats = getPortfolioStats(projects);
  const formEnabled = isInquiryConfigured();
  const cases = CASES.map((item) => ({ ...item, project: getProject(item.slug) })).filter(
    (item): item is typeof item & { project: PortfolioProject } =>
      Boolean(item.project && item.project.status === "live"),
  );

  return (
    <div className={`go ${serif.variable}`} id="top">
      <GoMotion />
      <a className="skip-link" href="#quiz">
        30초 견적으로 건너뛰기
      </a>
      <GoChrome />

      <main id="main">
        {/* Hero: split — headline left, mascot + real screens right (mobile: headline first) */}
        <section className="go-hero" aria-labelledby="go-title">
          <div className="go-wrap go-hero-grid">
            <div className="go-hero-copy">
              <p className="go-tag go-in" style={idx(0)}>
                <span>PLUCK</span>1인 개발 스튜디오 · 외주 개발
              </p>
              <h1 id="go-title" className="go-in" style={idx(1)}>
                견적서 말고,
                <br />
                <em>만든 걸</em> 먼저
                <br />
                보세요
              </h1>
              <p className="go-hero-sub go-in" style={idx(2)}>
                홈페이지·앱·관리자 시스템·자동화. 상담한 대표가 기획부터 오픈까지 직접 만들고, 지금 접속되는 서비스로
                먼저 보여드립니다.
              </p>
              <div className="go-hero-actions go-in" style={idx(3)}>
                <a className="go-btn go-btn-blue" href="#quiz">
                  30초 견적 계산 <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a className="go-btn go-btn-line" href="#proof">
                  만든 것 먼저 보기 <ArrowDown size={18} aria-hidden="true" />
                </a>
              </div>
              <p className="go-hero-note go-in" style={idx(4)}>
                상담·견적·기획안 초안 무료 · {REPLY_PROMISE}
              </p>
            </div>

            <div className="go-hero-stage" aria-hidden="true">
              <div className="go-layer" data-depth="0.08">
                <span className="go-disc" />
                <Image className="go-hero-glow go-tint" src="/lp/go/glow-orb.webp" alt="" width={480} height={479} sizes="420px" />
              </div>
              <div className="go-layer" data-depth="-0.16">
                <div className="go-float go-float-a go-win go-win-laptop">
                  <span className="go-win-bar">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="go-win-view go-screen-dvia" />
                </div>
              </div>
              <div className="go-layer" data-depth="-0.28">
                <div className="go-float go-float-b go-phone go-screen-knife" />
              </div>
              <div className="go-layer go-hero-char-layer" data-depth="0.05">
                <div className="go-bob">
                  <Image
                    className="go-hero-char"
                    src={ART.hero.src}
                    alt=""
                    width={ART.hero.width}
                    height={ART.hero.height}
                    sizes="(max-width: 900px) 58vw, 340px"
                    preload
                  />
                </div>
              </div>
              <div className="go-layer" data-depth="-0.22">
                <div className="go-float go-float-c go-phone go-screen-setflow" />
              </div>
              <div className="go-layer" data-depth="-0.4">
                <span className="go-float go-float-d go-live-tag">
                  <span className="go-dot" /> 지금 접속 가능 {stats.live}개
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 01 — the problem (tension scenes) */}
        <section className="go-ch go-ch-dark" id="ch-problem" data-chapter="01 문제" aria-labelledby="go-problem-title">
          <div className="go-wrap go-split">
            <ChapterHead no="01" name="문제" id="go-problem-title" lead="외주를 처음 맡기면 대부분 이 두 장면 중 하나에서 멈춥니다.">
              견적서는 세 장째,
              <br />
              답장은 없고
            </ChapterHead>
            <div className="go-scenes">
              <figure className="go-scene go-scene-quotes" data-reveal>
                <div className="go-quotes" aria-hidden="true">
                  {[
                    ["A사 견적", "300만 원"],
                    ["B사 견적", "1,200만 원"],
                    ["C사 견적", "3,000만 원"],
                  ].map(([label, price], index) => (
                    <div key={label} className={`go-quote go-quote-${index}`}>
                      <span>{label}</span>
                      <strong>{price}</strong>
                      <i />
                      <i />
                      <i />
                    </div>
                  ))}
                  <Image className="go-qart go-tint" src={ART.quotes.src} alt="" width={ART.quotes.width} height={ART.quotes.height} sizes="110px" loading="lazy" />
                </div>
                <figcaption>
                  <b>같은 설명, 10배 차이 나는 견적</b>
                  <span>무엇이 들어간 금액인지 기준이 없으면 비교도 결정도 할 수 없습니다. (예시)</span>
                </figcaption>
              </figure>

              <figure className="go-scene go-scene-chat" data-reveal>
                <div className="go-phone-ui" role="img" aria-label="답장 없는 외주 개발자와의 대화 (예시)">
                  <div className="go-phone-top">
                    <span className="go-avatar" aria-hidden="true" />
                    <span>
                      <b>외주 개발자</b>
                      <small>메시지를 읽지 않았습니다</small>
                    </span>
                  </div>
                  <ol className="go-chat" aria-hidden="true">
                    {SILENT_CHAT.map((msg, index) => (
                      <li key={msg.day} style={idx(index)}>
                        <span className="go-chat-day">{msg.day}</span>
                        <span className="go-chat-row">
                          <span className="go-chat-meta">
                            <em>1</em>
                            {msg.time}
                          </span>
                          <span className="go-chat-bubble">{msg.text}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <figcaption>
                  <b>계약하고 나니 연락이 끊겼다</b>
                  <span>흔히 듣는 외주 이야기 (예시)</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Chapter 02 — proof: one ledger strip of real counts + a bento of live screens */}
        <section className="go-ch go-ch-paper" id="proof" data-chapter="02 증거" aria-labelledby="go-proof-title">
          <div className="go-wrap">
            <ChapterHead no="02" name="증거" id="go-proof-title" lead={`설명 대신 지금 열어 볼 수 있는 서비스로 보여드립니다. (${stats.span})`}>
              말보다 먼저,
              <br />
              만든 것
            </ChapterHead>
            <dl className="go-ledger" data-reveal>
              {[
                { label: "지금까지 만든 프로젝트", value: stats.total },
                { label: "지금 접속되는 서비스", value: stats.live },
                { label: "클라이언트 프로젝트", value: stats.client },
                { label: "재하청", value: 0 },
              ].map((item, index) => (
                <div key={item.label} style={idx(index)}>
                  <dt>{item.label}</dt>
                  <dd>
                    <span data-count={item.value}>{item.value}</span>
                    <small>{item.label === "재하청" ? "건" : "개"}</small>
                  </dd>
                </div>
              ))}
            </dl>
            <ul className="go-bento">
              {cases.map(({ project, image, before, after }, index) => (
                <li key={project.slug} className={`go-tile go-tile-${index}`} data-reveal style={idx(index % 3)}>
                  <div className="go-tile-shot">
                    <Image
                      src={image}
                      alt={project.cover.alt}
                      width={1600}
                      height={1000}
                      sizes={index === 0 ? "(max-width: 900px) 100vw, 640px" : "(max-width: 900px) 100vw, 400px"}
                      loading="lazy"
                    />
                  </div>
                  <div className="go-tile-body">
                    <p className="go-tile-role">{project.detail.role.slice(0, 3).join(" · ")}</p>
                    <h3>{project.name}</h3>
                    <p className="go-tile-ba">
                      <s>{before}</s>
                      <span>{after}</span>
                    </p>
                    <p className="go-tile-links">
                      {linksOf(project).map((link) => (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.label} <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      ))}
                    </p>
                  </div>
                </li>
              ))}
              <li className="go-tile go-tile-more" data-reveal>
                <Link href="/#work">
                  <span className="go-tile-more-num">{stats.total}</span>
                  <span>
                    전체 작업 보기 <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 03 — the promise: comparison table + what you get (document preview) */}
        <section className="go-ch go-ch-paper go-ch-promise" id="ch-promise" data-chapter="03 약속" aria-labelledby="go-promise-title">
          <div className="go-wrap go-split">
            <ChapterHead no="03" name="약속" id="go-promise-title" lead="업체마다 다르지만, 외주를 맡길 때 자주 겪는 경우와 나란히 놓았습니다.">
              맡긴 뒤가
              <br />
              불안하지 않게
            </ChapterHead>
            <div className="go-compare" data-reveal>
              <table>
                <caption className="go-sr">흔한 외주 진행과 PLUCK 비교</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="go-sr">항목</span>
                    </th>
                    <th scope="col">흔한 외주 진행</th>
                    <th scope="col" className="go-col-pluck">
                      PLUCK
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((item, index) => (
                    <tr key={item.row} style={idx(index)}>
                      <th scope="row">{item.row}</th>
                      <td>
                        <Minus size={14} aria-hidden="true" />
                        {item.usual}
                      </td>
                      <td className="go-col-pluck">{item.pluck}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="go-wrap go-split go-split-rev go-deliver">
            <div className="go-deliver-copy" data-reveal>
              <h3 className="go-h3">
                상담만 받아도
                <br />
                이 문서를 드립니다
              </h3>
              <ul className="go-deliver-list">
                {DOC_PARTS.map((part) => (
                  <li key={part.title}>
                    <Image className="go-tint" src={part.art.src} alt="" width={part.art.width} height={part.art.height} sizes="44px" loading="lazy" />
                    {part.title}
                  </li>
                ))}
              </ul>
              <p className="go-fine">
                {REPLY_PROMISE} · 기획안은 {PLAN_PROMISE}. 받아 보고 결정하시면 됩니다.
              </p>
            </div>
            <figure className="go-doc" data-reveal aria-label="기획안 초안 예시 미리보기" role="img">
              <div className="go-doc-page" aria-hidden="true">
                <div className="go-doc-head">
                  <span>기획안 초안</span>
                  <b>○○ 예약 앱 · 1차 범위</b>
                </div>
                <div className="go-doc-part" style={idx(0)}>
                  <p>1. 꼭 필요한 기능</p>
                  <ul className="go-doc-tags">
                    <li>회원가입</li>
                    <li>예약 캘린더</li>
                    <li>결제</li>
                    <li>알림톡</li>
                    <li className="go-doc-later">리뷰 (2차)</li>
                  </ul>
                </div>
                <div className="go-doc-part" style={idx(1)}>
                  <p>2. 화면 흐름</p>
                  <div className="go-doc-flow">
                    <span>홈</span>
                    <ArrowRight size={12} />
                    <span>예약</span>
                    <ArrowRight size={12} />
                    <span>결제</span>
                    <ArrowRight size={12} />
                    <span>완료</span>
                  </div>
                </div>
                <div className="go-doc-part" style={idx(2)}>
                  <p>3. 기능별 견적 범위</p>
                  <div className="go-doc-bars">
                    <span style={{ width: "72%" }} />
                    <span style={{ width: "48%" }} />
                    <span style={{ width: "30%" }} />
                  </div>
                </div>
                <div className="go-doc-part" style={idx(3)}>
                  <p>4. 단계별 일정</p>
                  <div className="go-doc-gantt">
                    <span style={{ marginLeft: "0%", width: "30%" }}>디자인</span>
                    <span style={{ marginLeft: "22%", width: "55%" }}>개발</span>
                    <span style={{ marginLeft: "74%", width: "26%" }}>오픈</span>
                  </div>
                </div>
              </div>
              <figcaption>기획안 초안 미리보기 (예시)</figcaption>
            </figure>
          </div>
        </section>

        {/* Chapter 04 — the quote: price reference + quiz */}
        <section className="go-ch go-ch-dark" id="quiz-ch" data-chapter="04 견적" aria-labelledby="go-quiz-title">
          <div className="go-wrap go-split">
            <div className="go-quote-side">
              <ChapterHead no="04" name="견적" id="go-quiz-title" lead="연락처 없이 다섯 가지만 고르면 범위가 바로 나옵니다.">
                30초면
                <br />
                범위가 나옵니다
              </ChapterHead>
              <div className="go-price" data-reveal>
                <table>
                  <caption>유형별 참고 가격 · 실제 제안 금액 기반 · 상담 후 확정 · VAT 별도</caption>
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
                <p className="go-fine">기능을 더하지 않은 기본 범위입니다.</p>
              </div>
            </div>
            <div className="go-quiz-wrap" id="quiz">
              <GoQuiz formEnabled={formEnabled} email={CONTACT_EMAIL} />
            </div>
          </div>
        </section>

        {/* Chapter 05 — questions */}
        <section className="go-ch go-ch-paper" id="faq" data-chapter="05 질문" aria-labelledby="go-faq-title">
          <div className="go-wrap go-split">
            <div>
              <ChapterHead no="05" name="질문" id="go-faq-title">
                자주 묻는
                <br />
                질문
              </ChapterHead>
              <a className="go-btn go-btn-blue go-faq-cta" href="#quiz">
                30초 견적 계산 <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className="go-faq-list">
              {GO_FAQS.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    <span>{question}</span>
                    <Plus size={18} aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="go-footer">
        <div className="go-wrap go-footer-grid">
          <Link className="go-wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <div>
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
          </div>
        </div>
      </footer>
    </div>
  );
}

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
import type { CSSProperties } from "react";
import { GoBar, GoTabs } from "./go-chrome";
import { GoMotion } from "./go-motion";
import { GoQuiz } from "./go-quiz";
import "./go.css";

/** Stagger index for CSS (transition-delay: calc(var(--i) * …)). */
const idx = (i: number) => ({ "--i": i }) as CSSProperties;

/** 3D renders generated locally (ComfyUI · Wan 2.2 TI2V-5B single frame, background removed). */
const ART = {
  hero: { src: "/lp/go/hero-dev.webp", width: 575, height: 733 },
  quotes: { src: "/lp/go/icon-quotes.webp", width: 420, height: 406 },
  bell: { src: "/lp/go/icon-bell.webp", width: 384, height: 420 },
  check: { src: "/lp/go/icon-check.webp", width: 353, height: 360 },
  calendar: { src: "/lp/go/icon-calendar.webp", width: 378, height: 420 },
  code: { src: "/lp/go/icon-code.webp", width: 417, height: 420 },
  magnifier: { src: "/lp/go/icon-magnifier.webp", width: 408, height: 420 },
  rocket: { src: "/lp/go/icon-rocket.webp", width: 296, height: 353 },
  handshake: { src: "/lp/go/icon-handshake.webp", width: 420, height: 276 },
  chat: { src: "/lp/go/icon-chat.webp", width: 192, height: 420 },
} as const;

/** Generic "developer went silent" chat (no names). Every message stays unread. */
const SILENT_CHAT = [
  { day: "월요일", time: "오전 10:12", text: "이번 주 진행 상황 공유 부탁드려요" },
  { day: "수요일", time: "오후 2:30", text: "혹시 메시지 확인하셨을까요?" },
  { day: "금요일", time: "오후 6:05", text: "오픈 일정 때문에 연락 꼭 부탁드립니다" },
] as const;

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
  { kicker: "무엇부터 만들지", title: "기획안 초안", text: "꼭 필요한 기능과 화면 흐름, 1차로 열 범위", art: ART.check },
  {
    kicker: "얼마나 드는지",
    title: "예상 견적 범위",
    text: "기능별로 나눈 금액, 무엇이 비용을 올리는지까지",
    art: ART.magnifier,
  },
  { kicker: "언제 열 수 있는지", title: "단계별 일정", text: "디자인 · 개발 · 오픈까지 주 단위로", art: ART.rocket },
];

const BENEFITS = [
  {
    title: "상담한 사람이 그대로 만듭니다",
    text: "영업 담당 없이, 처음 상담한 대표가 기획부터 오픈까지 직접 맡습니다.",
    art: ART.handshake,
  },
  {
    title: "매주 실제 화면을 공유합니다",
    text: "보고서 대신, 일주일마다 실제로 눌러 볼 수 있는 화면을 보여드립니다.",
    art: ART.calendar,
  },
  {
    title: "소스코드·계정 전부 넘겨드립니다",
    text: "완료 후 소스코드와 계정을 모두 넘겨드려서, 나중에 다른 개발자가 이어서 작업할 수 있습니다.",
    art: ART.code,
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
  // Marquee: names of services you can open right now (owner rule: never 보령 on ad pages).
  const liveNames = projects
    .filter((project) => project.status === "live" && project.slug !== "boryoung")
    .map((project) => project.name);
  const half = Math.ceil(liveNames.length / 2);
  const marqueeRows = [liveNames.slice(0, half), liveNames.slice(half)];

  return (
    <div className="go" id="top">
      <GoMotion />
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
          {/* Hero: 3D mascot at a laptop, real product screens drifting around it */}
          <section className="go-hero" aria-labelledby="go-title">
            <div className="go-hero-stage" aria-hidden="true">
              <div className="go-layer" data-depth="0.12">
                <Image className="go-hero-glow" src="/lp/go/glow-orb.webp" alt="" width={480} height={479} />
              </div>
              <div className="go-layer" data-depth="-0.18">
                <div className="go-float go-float-a go-screen go-screen-laptop" />
              </div>
              <div className="go-layer" data-depth="-0.3">
                <div className="go-float go-float-b go-screen go-screen-knife" />
              </div>
              <div className="go-layer" data-depth="-0.24">
                <div className="go-float go-float-c go-screen go-screen-setflow" />
              </div>
              <div className="go-layer go-hero-char-layer" data-depth="0.06">
                <div className="go-bob">
                  <Image
                    className="go-hero-char"
                    src={ART.hero.src}
                    alt=""
                    width={ART.hero.width}
                    height={ART.hero.height}
                    sizes="(max-width: 480px) 62vw, 300px"
                    preload
                  />
                </div>
              </div>
              <div className="go-layer" data-depth="-0.42">
                <Image
                  className="go-float go-float-d go-hero-icon go-hero-icon-check"
                  src={ART.check.src}
                  alt=""
                  width={ART.check.width}
                  height={ART.check.height}
                  sizes="64px"
                />
              </div>
              <div className="go-layer" data-depth="-0.5">
                <Image
                  className="go-float go-float-e go-hero-icon go-hero-icon-rocket"
                  src={ART.rocket.src}
                  alt=""
                  width={ART.rocket.width}
                  height={ART.rocket.height}
                  sizes="56px"
                />
              </div>
            </div>
            <div className="go-hero-copy">
              <p className="go-kicker go-in" style={idx(0)}>
                <span className="go-dot go-dot-live" aria-hidden="true" />
                1인 개발 스튜디오 PLUCK · 상담·견적 무료
              </p>
              <h1 id="go-title" className="go-in" style={idx(1)}>
                외주 개발,
                <br />
                <span className="go-mark">
                  <span>결과물부터</span>
                </span>{" "}
                보고 맡기세요
              </h1>
              <p className="go-hero-sub go-in" style={idx(2)}>
                홈페이지·앱·관리자 시스템·자동화까지
                <br />
                기획부터 오픈까지 대표가 직접 합니다.
              </p>
              <ul className="go-chips">
                {["기획안 무료", "소스코드 전부 이전", "매주 진행 공유"].map((chip, index) => (
                  <li key={chip} className="go-in" style={idx(3 + index)}>
                    <Check size={12} strokeWidth={3.5} aria-hidden="true" />
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <GoTabs />

          {/* Proof: real counts from lib/portfolio.ts, counting up on view */}
          <section className="go-sec go-proof" id="intro" aria-labelledby="go-proof-title">
            <Image className="go-bg-blob" src="/lp/go/glow-blob.webp" alt="" width={480} height={400} aria-hidden="true" />
            <div className="go-reveal" data-reveal>
              <Image className="go-sec-icon go-ring" src={ART.bell.src} alt="" width={ART.bell.width} height={ART.bell.height} sizes="96px" />
              <p className="go-eyebrow">말보다 먼저, 만든 것</p>
              <h2 id="go-proof-title" className="go-h2">
                숫자로 보는 <span className="go-hl">PLUCK</span>
              </h2>
            </div>
            <ul className="go-proof-list">
              {[
                { label: "지금까지 만든 프로젝트", value: stats.total, unit: "개", note: `클라이언트 작업·자체 서비스·앱·AI 자동화 (${stats.span})` },
                { label: "지금 접속해 볼 수 있는 서비스", value: stats.live, unit: "개", note: "링크를 눌러 직접 확인할 수 있습니다" },
                { label: "클라이언트 프로젝트", value: stats.client, unit: "개", note: "방문간호·보험 딜러·제조·학원·커뮤니티 등" },
                { label: "기획·디자인·개발, 대표가 직접", value: 100, unit: "%", note: "재하청 없음", pink: true },
              ].map((item, index) => (
                <li key={item.label} className={`go-card go-reveal${item.pink ? " go-card-pink" : ""}`} data-reveal style={idx(index)}>
                  <Image className="go-badge3d" src={ART.check.src} alt="" width={ART.check.width} height={ART.check.height} sizes="44px" />
                  <p className="go-proof-label">{item.label}</p>
                  <p className="go-big">
                    <span data-count={item.value}>{item.value}</span>
                    <small>{item.unit}</small>
                  </p>
                  <p className="go-proof-note">{item.note}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Tension 1: three quotes, three prices */}
          <section className="go-sec go-story" aria-labelledby="go-story-title">
            <p className="go-warn go-reveal" data-reveal>
              <span aria-hidden="true">!</span>외주 맡기기 전 꼭 확인
            </p>
            <h2 id="go-story-title" className="go-story-line go-reveal" data-reveal>
              아직도
              <br />
              <span className="go-hl">견적서만 3장째</span>라면
            </h2>
            <div className="go-quotes" data-reveal aria-hidden="true">
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
              <span className="go-qmark">?</span>
            </div>
            <p className="go-ticker" data-reveal aria-label="300만 원에서 3,000만 원까지 (예시)">
              <span>300만</span>
              <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />
              <span>1,200만</span>
              <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />
              <span>3,000만</span>
            </p>
            <p className="go-caption">같은 설명, 10배 차이 나는 견적 (예시)</p>
            <p className="go-story-sub go-reveal" data-reveal>
              무엇이 들어간 금액인지 기준이 없으면
              <br />
              비교도, 결정도 할 수 없습니다.
            </p>
          </section>

          {/* Tension 2: the developer who went quiet */}
          <section className="go-sec go-ghost" aria-labelledby="go-ghost-title">
            <h2 id="go-ghost-title" className="go-story-line go-reveal" data-reveal>
              계약하고 나니
              <br />
              <span className="go-red">연락이 끊겼다면</span>
            </h2>
            <div className="go-phone-ui" data-reveal aria-label="답장 없는 외주 개발자와의 대화 (예시)" role="img">
              <div className="go-phone-top">
                <span className="go-avatar" aria-hidden="true" />
                <span>
                  <b>외주 개발자</b>
                  <small>대화 상대가 메시지를 읽지 않았습니다</small>
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
            <p className="go-caption">흔히 듣는 외주 이야기 (예시)</p>
            <p className="go-story-line go-story-end go-reveal" data-reveal>
              더 늦기 전에
              <br />
              <span className="go-hl">기준부터</span> 잡으세요
            </p>
          </section>

          {/* The turn: dark → light, three promises light up */}
          <section className="go-sec go-turn" aria-labelledby="go-benefit-title">
            <div className="go-reveal" data-reveal>
              <p className="go-turn-kicker">그래서 PLUCK은</p>
              <h2 id="go-benefit-title" className="go-h2">
                맡긴 뒤가
                <br />
                <span className="go-turn-mark">불안하지 않게</span> 합니다
              </h2>
            </div>
            <ol className="go-promise-list" data-reveal>
              {BENEFITS.map((item, index) => (
                <li key={item.title} style={idx(index)}>
                  <Image className="go-promise-art" src={item.art.src} alt="" width={item.art.width} height={item.art.height} sizes="84px" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Stacked offer: items drop in one by one */}
          <section className="go-sec go-offer" aria-labelledby="go-offer-title">
            <div className="go-reveal" data-reveal>
              <p className="go-eyebrow">상담만 받아도, 무료로</p>
              <h2 id="go-offer-title" className="go-h2">
                손에 쥐고
                <br />
                비교할 수 있게 드립니다
              </h2>
            </div>
            <ol className="go-stack" data-reveal>
              {OFFER.map((item, index) => (
                <li key={item.title} style={idx(index)}>
                  {index > 0 && (
                    <span className="go-plus" aria-hidden="true">
                      <Plus size={22} strokeWidth={3.5} />
                    </span>
                  )}
                  <div className="go-card go-stack-card">
                    <Image className="go-stack-art" src={item.art.src} alt="" width={item.art.width} height={item.art.height} sizes="64px" />
                    <p className="go-stack-kicker">{item.kicker}</p>
                    <h3>{item.title}</h3>
                    <p className="go-stack-text">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="go-pill go-reveal" data-reveal>
              받아 보고 결정하세요
            </p>
            <p className="go-fine">
              {REPLY_PROMISE} · 기획안은 {PLAN_PROMISE}
            </p>
          </section>

          {/* Contrast: full-bleed black, one huge line, then live project names */}
          <section className="go-black" aria-labelledby="go-black-title">
            <h2 id="go-black-title" className="go-black-line" data-reveal>
              <span>말 말고</span>
              <span className="go-hl">결과물로</span>
            </h2>
            <p className="go-black-sub">지금 접속되는 서비스 {stats.live}개</p>
            <div className="go-marquee" aria-hidden="true">
              {marqueeRows.map((row, rowIndex) => (
                <div key={rowIndex} className={`go-marquee-row${rowIndex ? " go-marquee-rev" : ""}`}>
                  {[0, 1].map((copy) => (
                    <ul key={copy}>
                      {row.map((name) => (
                        <li key={name}>
                          <span className="go-dot" />
                          {name}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Case studies */}
          <section className="go-sec go-work" id="work" aria-labelledby="go-work-title">
            <div className="go-reveal" data-reveal>
              <p className="go-eyebrow">지금 접속되는 서비스 {stats.live}개 중</p>
              <h2 id="go-work-title" className="go-h2">
                말 대신
                <br />
                <span className="go-hl">결과물로</span> 보여드립니다
              </h2>
            </div>
            <ul className="go-cases">
              {cases.map(({ project, image, before, after }) => (
                <li key={project.slug} className="go-case go-reveal" data-reveal>
                  <div className="go-case-shot">
                    <div className="go-browser" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="go-case-view">
                      <Image
                        src={image}
                        alt={project.cover.alt}
                        width={1600}
                        height={1000}
                        sizes="(max-width: 480px) 100vw, 440px"
                      />
                    </div>
                    <span className="go-live">
                      <span className="go-dot go-dot-live" aria-hidden="true" /> 지금 접속 가능
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
            <div className="go-reveal" data-reveal>
              <p className="go-eyebrow">그런데,</p>
              <h2 id="go-why-title" className="go-h2">
                왜 <span className="go-hl">1인 스튜디오</span>인가요?
              </h2>
            </div>
            <ol className="go-why-list" data-reveal>
              {WHY_SOLO.map((item, index) => (
                <li key={item.title} style={idx(index)}>
                  <span className="go-num">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
            <ul className="go-promises" aria-label="약속" data-reveal>
              {TRUST_PROMISES.map((item, index) => (
                <li key={item.title} style={idx(index)}>
                  <Check size={18} strokeWidth={3} aria-hidden="true" />
                  {item.title}
                </li>
              ))}
            </ul>
          </section>

          {/* Price reference */}
          <section className="go-sec go-price" aria-labelledby="go-price-title">
            <div className="go-reveal" data-reveal>
              <p className="go-eyebrow">숨기지 않습니다</p>
              <h2 id="go-price-title" className="go-h2">
                유형별 <span className="go-hl">참고 가격</span>
              </h2>
            </div>
            <div className="go-card go-price-card go-reveal" data-reveal>
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
            <div className="go-reveal" data-reveal>
              <p className="go-eyebrow">연락처 없이 결과부터</p>
              <h2 id="go-quiz-title" className="go-h2">
                단 <span className="go-hl">30초</span>면
                <br />
                범위가 나옵니다
              </h2>
            </div>
            <ul className="go-checks" data-reveal>
              {QUIZ_STEPS.map((step, index) => (
                <li key={step} style={idx(index)}>
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
            <a className="go-cta go-shine" href="#quiz">
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

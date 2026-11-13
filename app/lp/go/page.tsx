import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getPortfolioStats, getProject, projects, type PortfolioProject } from "@/lib/portfolio";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage, GITHUB_URL } from "@/lib/site";
import { isInquiryConfigured } from "@/lib/supabase/env";
import { DESIGNS, estimate, FEATURES, formatPrice, formatPriceRange, PROJECT_KINDS, SCALES, type KindKey, type QuoteAnswers } from "@/lib/quote/pricing";
import { PLAN_PROMISE, REPLY_PROMISE } from "../dev/config";
import { CouponNote } from "./coupon/coupon-note";
import { GoCoupon } from "./coupon/go-coupon";
import { GoCrumple } from "./crumple/go-crumple";
import { GoDraw } from "./go-draw";
import { GoFlapStats } from "./flap/go-flap";
import { GoQuiz } from "./go-quiz";
import { GoHeroReel, GoVideo, type HeroClip, type Loop } from "./go-video";
import { Shot } from "./shot";
import { GoShred } from "./shred/go-shred";
import { GoStamps, type Step } from "./stamps/go-stamps";
import "./go.css";

/**
 * /lp/go (v5, video-first): an ad landing page that should read like the owner wrote it himself.
 * v5 rule (outside marketer + owner): visuals persuade, text is a caption. One short headline per section,
 * at most one short line, real recorded loops of the live sites (public/lp/go/video/, go-video.tsx),
 * the paper moments (coupon, receipt, stamps, crumple, seal) kept. Legal/honesty text stays, small.
 * No generated imagery, no gradients/glows, no scroll-reveal on everything (see .fry/MEMORY.md "AI 티").
 * Every number comes from lib/portfolio.ts or lib/quote/pricing.ts. Leads: submitGoInquiry → "lp-go".
 * Not in nav/sitemap, noindex.
 */
const TITLE = "상담한 개발자가 직접 만들어요";
const DESCRIPTION =
  "홈페이지, 앱, 회사에서 쓰는 관리자 화면을 만드는 1인 개발 스튜디오예요. 최근에 만든 서비스, 실제 제안 금액 기준 참고 비용, 30초 견적 계산이 있어요.";

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

/** The reel. Videos are real recordings of the public live sites (C:\Temp\lp-v5\rec.mjs, scroll/click only). */
type Reel = {
  slug: string;
  name: string;
  /** One line, ≤ 30 chars, facts from lib/portfolio.ts only. */
  result: string;
  loop: Loop;
  /** Small honesty label under the media. */
  note?: string;
  /** 카영: the old spreadsheet printout crumples off the admin screenshot (crumple/). */
  crumple?: boolean;
};

const KNIFE: Loop = { name: "knife", device: "phone", alt: "칼가는곳 사이트를 폰으로 내려 보는 화면" };
const DEALER: Loop = { name: "dealer", device: "phone", alt: "카영 딜러 웹을 넘겨 보는 화면. 로그인 전 샘플 데이터 대시보드" };
/**
 * Hero: one phone, three real loops in turn (go-video.tsx GoHeroReel). Every clip opens on a bright,
 * readable frame (hero-knife is re-recorded from the price cards, not the dark knife intro).
 * Only 카영 carries a label: its screens are the pre-login sample data.
 */
const HERO: HeroClip[] = [
  { name: "hero-bayada", label: "BAYADA", alt: "BAYADA 고객용 사이트를 폰으로 내려 보는 화면" },
  { name: "hero-knife", label: "칼가는곳", alt: "칼가는곳 사이트의 연마 종류와 가격 카드를 폰으로 내려 보는 화면" },
  { name: "dealer", label: "카영", alt: DEALER.alt, note: "카영 · 로그인 전 샘플 데이터" },
];

/** Owner rule: never 보령 on ad pages. */
const REEL: Reel[] = [
  { slug: "dealer-settlement", name: "카영", result: "엑셀 정산 → 웹 3개", loop: DEALER, note: "로그인 전 샘플 데이터", crumple: true },
  {
    slug: "homecare-platform",
    name: "BAYADA",
    result: "웹 · 교육 · 관리자, 한 번에 3개",
    loop: { name: "academy", device: "browser", url: "BAYADA Academy", alt: "BAYADA 교육 아카데미 첫 화면과 프로그램 목록을 내려 보는 화면" },
    note: "개발·시연 서버",
  },
  { slug: "knife-sharpening", name: "칼가는곳", result: "가게 방문 → 집에서 수거 신청", loop: KNIFE },
  {
    slug: "dvia",
    name: "DVIA 대일시스템",
    result: "장비 제조사, 3D 글로벌 사이트",
    loop: { name: "dvia", device: "browser", url: "DVIA", alt: "대일시스템 사이트의 진동 파형 파티클 첫 화면과 3D 제품 섹션" },
  },
];

/**
 * The shredder (shred/): three total-only example quotes (generic, labelled 예시) against one itemised
 * sheet whose every row and total come from lib/quote/pricing.ts for one example answer set.
 */
const SHRED_QUOTES = [300, 1200, 3000].map((manwon) => ({ total: formatPrice(manwon) }));
const SHRED_ANSWERS: QuoteAnswers = { kind: "shop", scale: "m", features: ["auth", "payment", "admin"], design: "basic", timeline: "m2" };
const plus = (range: readonly [number, number]) => `+${formatPriceRange(range)}`;
const SHRED_SHEET = {
  rows: [
    { label: `${PROJECT_KINDS.shop.label} 기본`, amount: formatPriceRange(PROJECT_KINDS.shop.price) },
    ...SHRED_ANSWERS.features.map((key) => ({ label: FEATURES[key].label, amount: plus(FEATURES[key].price) })),
    { label: `화면 ${SCALES.m.label}`, amount: `×${SCALES.m.factor[0].toFixed(1)}` },
    { label: DESIGNS.basic.label, amount: `×${DESIGNS.basic.factor[0]}` },
  ],
  total: formatPriceRange(estimate(SHRED_ANSWERS).price),
  note: "(예시) 참고 범위 · VAT 별도",
};

const KIND_KEYS = Object.keys(PROJECT_KINDS) as KindKey[];
const toWeeks = ([low, high]: readonly [number, number]) =>
  [Math.max(2, Math.round(low / 7)), Math.max(3, Math.round(high / 7))] as const;

/**
 * The process as a stamp card (stamps/go-stamps.tsx). `when` is cut from the same promises
 * (app/lp/dev/config.ts), so the stamp can never say a different duration than elsewhere.
 */
const STEPS: Step[] = [
  { label: "신청", text: "30초 견적 후 연락처만" },
  { label: "답장", when: REPLY_PROMISE.replace(/^영업일 기준 /, "").replace(/에 답장$/, ""), text: "통화로 몇 가지 여쭤봐요" },
  { label: "기획안", when: PLAN_PROMISE.match(/\d+~\d+일/)?.[0], text: "기획안·견적·일정, 무료" },
  { label: "중간 확인", text: "눌러 보는 화면으로 공유" },
  { label: "오픈", text: "소스코드·계정 전부 이전" },
];

/** The 4 questions that decide it. Same answers as the /lp/dev FAQ, one line each. No new promises. */
const FAQ: [string, string][] = [
  ["견적 받으면 꼭 해야 해요?", "아니요. 상담·견적은 무료예요."],
  ["소스코드는 누구 거예요?", "맡기신 분 거예요. 전부 넘겨드려요."],
  ["얼마나 걸려요?", "홈페이지는 몇 주, 업무 시스템은 두세 달이에요."],
  ["혼자면 바쁠 땐요?", "동시 진행 수를 정해 두고, 일정부터 확정해요."],
];

function linksOf(project: PortfolioProject) {
  // Public pages only: admin apps link to a login screen, so they are left out here.
  const apps = project.apps?.filter((app) => app.url && !app.summary.includes("로그인 화면"));
  if (!apps?.length) return project.url ? [{ url: project.url, label: "사이트 열기" }] : [];
  return apps.map((app) => ({ url: app.url!, label: app.name.split(" · ").at(-1)! }));
}

export default function GoLandingPage() {
  const stats = getPortfolioStats(projects);
  const formEnabled = isInquiryConfigured();
  const reel = REEL.map((item) => ({ ...item, project: getProject(item.slug) })).filter(
    (item): item is typeof item & { project: PortfolioProject } => Boolean(item.project),
  );
  const crumpleShot = getProject("dealer-settlement")?.gallery.find((image) => image.src === "/work/dealer-settlement/05.webp");

  return (
    <div className="go" id="top">
      <GoDraw />
      <a className="skip-link" href="#quiz">
        견적 계산으로 건너뛰기
      </a>

      <header className="go-top">
        <div className="shell go-top-row">
          <Link className="wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <a className="header-contact" href="#quiz">
            견적 받기
          </a>
        </div>
      </header>

      <main id="main">
        {/* Five-second read: what (h1 + sub), proof (real loops + two numbers), what to tap (one button). */}
        <section className="gh shell" aria-labelledby="go-title">
          <div className="gh-copy">
            <h1 id="go-title">
              상담한 개발자가
              <br />
              직접 만들어요
            </h1>
            <p className="gh-sub">홈페이지 · 앱 · 업무 시스템</p>
            {/* The two numbers as a split-flap board: turns once on load, tap to turn again (flap/). */}
            <GoFlapStats
              items={[
                { label: "만든 서비스", value: stats.total },
                { label: "지금 접속 가능", value: stats.live },
              ]}
            />
            <a className="button button-primary gh-cta" href="#quiz">
              30초 견적 받기 <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <GoHeroReel clips={HERO} />
        </section>

        <GoCoupon />

        {/* Tension before the proof: vague total-only quotes go into the shredder, an itemised one comes out. */}
        <section className="shr shell" aria-labelledby="go-shred-title">
          <GoShred quotes={SHRED_QUOTES} sheet={SHRED_SHEET} label="총액만 적힌 견적은 그만" />
        </section>

        <section className="gr" id="work" aria-labelledby="go-work-title">
          <div className="shell">
            <h2 id="go-work-title" className="section-title">
              최근에 만든 것
            </h2>
            {reel.map(({ project, name, result, loop, note, crumple }, index) => (
              <article
                key={project.slug}
                className={`gr-item is-${loop.device}${index % 2 ? " is-flip" : ""}`}
                aria-labelledby={`reel-${project.slug}`}
              >
                <div className="gr-media">
                  <GoVideo
                    loop={loop}
                    sizes={loop.device === "phone" ? "(max-width: 900px) 62vw, 300px" : "(max-width: 900px) 92vw, 720px"}
                  />
                  {note && <p className="go-tiny">{note}</p>}
                </div>
                <div className="gr-body">
                  <h3 id={`reel-${project.slug}`}>{name}</h3>
                  <p className="gr-result">{result}</p>
                  <p className="gr-links">
                    {linksOf(project).map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label} <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    ))}
                  </p>
                  {crumple && crumpleShot && (
                    <div className="gr-crumple">
                      <GoCrumple>
                        <Shot
                          src={crumpleShot.src}
                          alt={crumpleShot.alt}
                          crop={[320, 490, 1280, 510]}
                          marks={[
                            {
                              ring: [1378, 557, 196, 40],
                              arrow: [900, 575, 1166, 566, -24],
                              note: { text: "쓰던 엑셀 그대로", at: [890, 586], corner: "br" },
                            },
                          ]}
                          caption="관리자 화면 (가상 데이터)"
                          vw={92}
                          px={460}
                        />
                      </GoCrumple>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="gp shell" id="price" aria-labelledby="go-price-title">
          <h2 id="go-price-title" className="section-title">
            비용은 이 정도예요
          </h2>
          {/* The price anchor is a printed receipt: same numbers as lib/quote/pricing.ts, no prose around them. */}
          <div className="gp-receipt">
            <table>
              <caption>
                참고 견적 <span>PLUCK</span>
              </caption>
              <thead className="go-sr">
                <tr>
                  <th scope="col">만들 것</th>
                  <th scope="col">금액</th>
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
            <p className="go-tiny">참고 범위 · VAT 별도 · 실제 제안 금액 기준</p>
          </div>
          <a className="button button-primary gp-cta" href="#quiz">
            내 경우로 계산하기 <ArrowRight size={18} aria-hidden="true" />
          </a>
        </section>

        <section className="go-process shell" aria-labelledby="go-process-title">
          <h2 id="go-process-title" className="section-title">
            이렇게 진행해요
          </h2>
          <GoStamps steps={STEPS} />
        </section>

        <section className="go-faq shell" aria-labelledby="go-faq-title">
          <h2 id="go-faq-title" className="section-title">
            자주 묻는 것
          </h2>
          <div className="go-faq-list">
            {FAQ.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="go-quiz-sec shell" aria-labelledby="go-quiz-title">
          <div className="go-quiz-copy">
            <h2 id="go-quiz-title" className="section-title">
              30초 견적
            </h2>
            <p>다섯 개만 고르면 바로 나와요.</p>
            <CouponNote />
          </div>
          <div className="go-quiz-wrap" id="quiz">
            <GoQuiz formEnabled={formEnabled} email={CONTACT_EMAIL} />
            <p className="go-tiny">
              메일: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </section>

      </main>

      <footer className="go-footer">
        <div className="shell footer">
          <Link className="wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <span>© {new Date().getFullYear()} PLUCK · 1인 개발 스튜디오</span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <Link href="/privacy">개인정보처리방침</Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="#top">맨 위로</a>
        </div>
      </footer>
    </div>
  );
}

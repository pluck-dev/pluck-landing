import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { categoryLabels, getPortfolioStats, getProject, projects, type PortfolioProject } from "@/lib/portfolio";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage, GITHUB_URL } from "@/lib/site";
import { isInquiryConfigured } from "@/lib/supabase/env";
import { formatPriceRange, PROJECT_KINDS, type KindKey } from "@/lib/quote/pricing";
import { PLAN_PROMISE, REPLY_PROMISE } from "../dev/config";
import { CouponNote } from "./coupon/coupon-note";
import { GoCoupon } from "./coupon/go-coupon";
import { GoDraw } from "./go-draw";
import { GoQuiz } from "./go-quiz";
import { Shot, type Mark } from "./shot";
import "./go.css";

/**
 * /lp/go (v4): an ad landing page that should read like the owner wrote it himself.
 * Same type, colours and buttons as pluck.co.kr; content first: real screenshots with hand-drawn notes,
 * plain first-person copy, the real proposal price table, a numbered process, the quiz, plain FAQ.
 * No generated imagery, no gradients/glows, no scroll-reveal on everything (see .fry/MEMORY.md "AI 티").
 * Every number comes from lib/portfolio.ts or lib/quote/pricing.ts. Leads: submitGoInquiry → "lp-go".
 * Not in nav/sitemap, noindex.
 */
const TITLE = "혼자 하는 개발 스튜디오, 상담한 사람이 직접 만들어요";
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

type Story = {
  slug: string;
  /** Paragraphs in the owner's voice. Facts only from the project's entry in lib/portfolio.ts. */
  text: string[];
  main: { src: string; crop?: readonly [number, number, number, number]; marks?: Mark[]; caption: string; tall?: boolean };
  side?: { src: string; crop?: readonly [number, number, number, number]; marks?: Mark[]; caption: string };
};

/** Owner rule: never 보령 on ad pages. Captions keep the portfolio's honesty notes (가상·데모 데이터). */
const STORIES: Story[] = [
  {
    slug: "dealer-settlement",
    text: [
      "카영은 자동차보험 딜러들에게 수수료를 정산해 주는 회사예요. 계약이랑 딜러별 수수료를 엑셀로 사람이 하나하나 맞춰 보고 있어서 누락이 생기기 쉬웠어요.",
      "그래서 웹을 3개 만들었어요. 회사 소개 사이트, 운영팀이 쓰는 관리자, 딜러가 폰으로 보는 딜러 웹이요. 관리자랑 딜러 웹은 같은 DB를 봐요.",
      "쓰던 엑셀은 버리지 않고 가져오기·내보내기로 남겨뒀어요. 지금 실서비스로 돌아가고 있고, 현업에서 오는 수정 요청을 계속 반영하고 있어요.",
    ],
    main: {
      src: "/work/dealer-settlement/05.webp",
      crop: [320, 490, 1280, 510],
      marks: [
        { ring: [1378, 557, 196, 40], arrow: [900, 575, 1166, 566, -24], note: { text: "쓰던 엑셀 그대로 넣고 빼기", at: [890, 586], corner: "br" } },
      ],
      caption: "관리자 · 계약 관리 (로컬 실행, 가상 데이터)",
    },
    side: {
      src: "/work/dealer-settlement/06.webp",
      crop: [306, 92, 640, 186],
      marks: [{ ring: [372, 205, 62, 30] }],
      caption: "관리자 · 정산 관리. 정산 안 된 건이 먼저 보여요. (로컬 실행, 가상 데이터)",
    },
  },
  {
    slug: "homecare-platform",
    text: [
      "바야다는 방문간호·요양 회사예요. 서비스 안내, 상담 접수, 직원 교육이 채널마다 흩어져 있었어요.",
      "고객용 웹이랑 요양보호사·간호 인력이 듣는 교육 아카데미, 이 둘을 같이 운영하는 관리자까지 앱 3개를 한 저장소에서 만들었어요. 관리자는 계정 하나로 아카데미와 웹사이트를 오가요.",
      "지금은 개발·시연 서버에 올라가 있어서 셋 다 들어가 볼 수 있어요.",
    ],
    main: {
      src: "/work/homecare-platform/05.webp",
      crop: [0, 0, 1120, 700],
      marks: [
        { ring: [143, 132, 138, 40], arrow: [215, 300, 160, 182, 34], note: { text: "여기서 아카데미 ↔ 웹사이트 전환", at: [150, 305], corner: "tl" } },
        { ring: [476, 213, 168, 86], arrow: [760, 360, 640, 270, -30], note: { text: "올라온 교육 프로그램 승인 대기", at: [700, 365], corner: "tl" } },
      ],
      caption: "관리자 · 아카데미 대시보드 (QA 캡처, 계정명 가림)",
    },
    side: {
      src: "/work/homecare-platform/03.webp",
      crop: [100, 140, 1440, 520],
      caption: "아카데미 · 첫 화면",
    },
  },
  {
    slug: "knife-sharpening",
    text: [
      "칼 갈려면 보통 가게에 직접 들고 가야 하잖아요. 칼가는곳은 그걸 집에서 신청하게 만든 서비스예요.",
      "문자 인증으로 가입하고 주소만 넣으면 몇 단계 만에 수거 신청이 끝나요. 정기 구독이랑 쿠폰도 붙여서 또 맡기기 쉽게 했어요.",
      "디자인은 받은 Figma 시안으로 작업했고, 화면부터 서버, 관리자까지 제가 만들었어요.",
    ],
    main: {
      src: "/work/knife-sharpening/cover.webp",
      crop: [905, 130, 340, 700],
      tall: true,
      marks: [
        { ring: [1068, 407, 152, 22], arrow: [1290, 330, 1215, 392, -30], note: { text: "쿠폰·배송비까지 계산", at: [1275, 315], corner: "bl" } },
        { ring: [1072, 775, 128, 30], arrow: [1290, 690, 1205, 760, -30], note: { text: "확인한 금액 그대로 결제", at: [1275, 675], corner: "bl" } },
      ],
      caption: "칼가는곳 · 연마 신청 결제 화면",
    },
  },
  {
    slug: "setflow",
    text: [
      "이건 의뢰받은 게 아니라 제가 만든 앱이에요. 운동 기록은 입력이 귀찮으면 금방 안 하게 되더라고요.",
      "캘린더 홈에서 바로 세트를 적고, 적으면 휴식 타이머로 넘어가요. 트레이너랑 짐 운영자 화면, 정산까지 한 앱 안에 있어요.",
    ],
    main: {
      src: "/work/setflow/cover.webp",
      crop: [612, 92, 376, 560],
      tall: true,
      marks: [
        { ring: [920, 332, 54, 28], arrow: [1030, 250, 970, 312, -26], note: { text: "휴식 90초, 바로 이어서", at: [1015, 235], corner: "bl" } },
        { ring: [800, 599, 74, 24], arrow: [1030, 560, 880, 596, 26], note: { text: "세트 추가는 한 번에", at: [1015, 545], corner: "bl" } },
      ],
      caption: "Setflow · 세트 기록 화면",
    },
    side: {
      src: "/work/setflow/03.webp",
      crop: [1052, 88, 380, 520],
      caption: "짐 정산 화면 (데모 데이터)",
    },
  },
];

const KIND_KEYS = Object.keys(PROJECT_KINDS) as KindKey[];
const toWeeks = ([low, high]: readonly [number, number]) =>
  [Math.max(2, Math.round(low / 7)), Math.max(3, Math.round(high / 7))] as const;

const STEPS = [
  "아래 견적 계산을 해 보고 연락처를 남기시거나, 메일을 보내주세요.",
  `${REPLY_PROMISE}드려요. 통화나 메시지로 몇 가지 여쭤볼게요.`,
  `${PLAN_PROMISE} 안에 기획안 초안이랑 기능별 견적, 일정을 보내드려요. 보시고 안 하셔도 괜찮아요.`,
  "계약하면 만드는 동안 실제로 눌러볼 수 있는 화면으로 중간중간 보여드려요.",
  "오픈하면 소스코드랑 계정을 전부 넘겨드려요. 나중에 다른 개발자가 이어받아도 돼요.",
];

/** Same answers as the /lp/dev FAQ (app/lp/dev/faqs.ts), in the owner's 해요체. No new promises. */
const FAQ: [string, string][] = [
  [
    "견적이 업체마다 왜 이렇게 달라요?",
    "화면 수, 기능 범위, 디자인을 새로 하는지, 유지보수나 소스코드 이전이 들어갔는지가 업체마다 달라서예요. 제 기획안에는 화면·기능 단위로 범위를 적어 드려서 다른 견적이랑 같은 기준으로 비교할 수 있어요.",
  ],
  ["아이디어만 있어도 돼요?", "네. 해결하고 싶은 문제랑 대충 원하는 모습만 알려주시면, 필요한 기능이랑 먼저 만들 범위를 같이 정리해요."],
  [
    "기간은 얼마나 걸려요?",
    "위 표처럼 홈페이지는 몇 주, 업무 시스템은 두세 달까지 걸려요. 급하면 꼭 필요한 기능만 먼저 여는 1차 오픈으로 나눌 수 있어요.",
  ],
  ["오픈하고 나서 고칠 게 생기면요?", "오픈 후 수정이랑 유지보수 범위, 비용은 계약 전에 견적서에 따로 적어 드려요. 뭐가 포함되는지 보고 정하시면 돼요."],
  ["소스코드는 누구 거예요?", "맡기신 분 거예요. 완료하면 소스코드랑 계정을 전부 넘겨드려요."],
  [
    "혼자면 바쁠 땐 어떻게 해요?",
    "동시에 진행하는 프로젝트 수를 정해두고 있어요. 그래서 계약 전에 착수일이랑 오픈 일정을 먼저 정하고, 원하시는 일정에 못 맞추면 그때 그대로 말씀드려요.",
  ],
  ["견적 받으면 꼭 해야 해요?", "아니요. 상담이랑 견적은 무료예요. 받아 보시고 정하시면 돼요."],
];

function linksOf(project: PortfolioProject) {
  if (project.apps?.length) {
    return project.apps
      .filter((app) => app.url)
      .map((app) => ({
        label: app.name.split(" · ")[0] + (app.summary.includes("로그인 화면") ? " (로그인 화면)" : ""),
        url: app.url!,
      }));
  }
  if (!project.url) return [];
  return [{ label: project.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), url: project.url }];
}

function yearsOf(project: PortfolioProject) {
  const [from, to] = project.years;
  return from === to ? `${from}` : `${from}~${String(to).slice(2)}`;
}

export default function GoLandingPage() {
  const stats = getPortfolioStats(projects);
  const formEnabled = isInquiryConfigured();
  const stories = STORIES.map((story) => ({ ...story, project: getProject(story.slug) })).filter(
    (story): story is typeof story & { project: PortfolioProject } => Boolean(story.project),
  );

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
            견적 받아보기
          </a>
        </div>
      </header>

      <main id="main">
        <section className="go-intro shell" aria-labelledby="go-title">
          <h1 id="go-title">
            혼자 하는 개발 스튜디오예요.
            <br />
            상담한 제가 직접 만듭니다.
          </h1>
          <div className="go-intro-copy">
            <p>
              홈페이지, 앱, 회사에서 쓰는 관리자 화면 같은 걸 만들어요. 영업 담당이 따로 없어서 처음 통화한 사람이 끝까지
              코드를 짭니다.
            </p>
            <p>
              지금까지 {stats.total}개를 만들었고, 그중 {stats.live}개는 지금도 접속해 볼 수 있어요. 아래 화면도 전부 실제로
              만든 거예요.
            </p>
            <div className="go-intro-actions">
              <a className="button button-primary" href="#quiz">
                30초 견적 받아보기 <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button-ghost" href="#work">
                만든 것부터 볼게요 <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <Shot
            className="go-intro-shot"
            src="/work/dealer-settlement/cover.webp"
            alt="카영 딜러 웹 데스크톱 화면. 소개 수수료 등급표와 추천 코드 옆에 샘플 데이터로 채운 딜러 대시보드"
            browser="dealer.caryoung.co.kr"
            crop={[190, 20, 1330, 960]}
            vw={100}
            px={780}
            eager
            marks={[
              {
                ring: [1200, 60, 312, 50],
                arrow: [860, 150, 905, 76, -40],
                note: { text: "로그인 전엔 샘플 데이터로 미리 보여요", at: [850, 160], corner: "tr" },
              },
            ]}
            caption="카영 딜러 웹. 딜러가 자기 계약이랑 수익을 보는 화면이에요."
          />
        </section>

        <GoCoupon />

        <section className="go-work" id="work" aria-labelledby="go-work-title">
          <div className="shell">
            <div className="go-head">
              <h2 id="go-work-title" className="section-title">
                최근에 만든 것
              </h2>
              <p>설명보다 화면이 빠를 것 같아서요. 아래 링크는 지금 다 열려요.</p>
            </div>

            {stories.map(({ project, text, main, side }, index) => (
              <article
                key={project.slug}
                className={`go-story${index % 2 ? " is-flip" : ""}${main.tall ? " is-tall" : ""}`}
                aria-labelledby={`story-${project.slug}`}
              >
                <div className="go-story-media">
                  <Shot
                    src={main.src}
                    alt={project.gallery.find((image) => image.src === main.src)?.alt ?? project.cover.alt}
                    crop={main.crop}
                    marks={main.marks}
                    caption={main.caption}
                    vw={main.tall ? 62 : 100}
                    px={main.tall ? 340 : 720}
                  />
                </div>
                <div className="go-story-text">
                  <p className="go-story-meta">
                    {categoryLabels[project.category]} · {yearsOf(project)}
                  </p>
                  <h3 id={`story-${project.slug}`}>{project.name}</h3>
                  {text.map((paragraph) => (
                    <p key={paragraph.slice(0, 12)}>{paragraph}</p>
                  ))}
                  <p className="go-story-links">
                    {linksOf(project).map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label} <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    ))}
                  </p>
                  {side && (
                    <Shot
                      className="go-story-side"
                      src={side.src}
                      alt={project.gallery.find((image) => image.src === side.src)?.alt ?? side.caption}
                      crop={side.crop}
                      marks={side.marks}
                      caption={side.caption}
                      vw={80}
                      px={380}
                    />
                  )}
                </div>
              </article>
            ))}

            <div className="go-after">
              <p>
                비슷한 걸 생각하고 계시면, 얼마쯤 나올지 먼저 계산해 볼 수 있어요. 이 넷 말고도{" "}
                {stats.total - stories.length}개를 더 만들었어요.
              </p>
              <div className="go-after-actions">
                <a className="button button-ink go-btn-sm" href="#quiz">
                  견적 계산하기 <ArrowRight size={16} aria-hidden="true" />
                </a>
                <Link className="button button-ghost go-btn-sm" href="/#work">
                  전체 작업 보기
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="go-price shell" id="price" aria-labelledby="go-price-title">
          <div className="go-price-copy">
            <h2 id="go-price-title" className="section-title">
              비용은 이 정도예요
            </h2>
            <p>
              외주 견적은 같은 설명으로 받아도 300만 원부터 3,000만 원까지 벌어지곤 해요. 관리자 화면이 들어가는지, 화면이
              몇 개인지 같은 범위를 업체마다 다르게 잡아서 그래요.
            </p>
            <p>
              표에 있는 금액은 제가 실제로 냈던 제안 금액을 유형별로 모은 거예요. 계약 금액이 아니라 제안 금액이라 참고용이고,
              상담하고 범위를 정하면 그때 확정돼요.
            </p>
          </div>
          <div className="go-price-table">
            <table>
              <caption className="go-sr">유형별 참고 금액과 기간</caption>
              <thead>
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
            <p className="go-fine">VAT 별도. 기능을 더하지 않은 기본 범위예요.</p>
            <a className="button button-ink go-btn-sm" href="#quiz">
              내 경우로 계산해 보기 <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="go-process shell" aria-labelledby="go-process-title">
          <h2 id="go-process-title" className="section-title">
            이렇게 진행해요
          </h2>
          <ol>
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="go-quiz-sec shell" aria-labelledby="go-quiz-title">
          <div className="go-quiz-copy">
            <h2 id="go-quiz-title" className="section-title">
              얼마쯤 나올지
              <br />
              먼저 볼까요?
            </h2>
            <p>다섯 개만 고르면 금액 범위랑 기간이 바로 나와요. 연락처는 결과를 본 다음에 남기셔도 되고, 안 남기셔도 돼요.</p>
            <CouponNote />
            <p className="go-fine">
              메일이 편하시면 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
          <div className="go-quiz-wrap" id="quiz">
            <GoQuiz formEnabled={formEnabled} email={CONTACT_EMAIL} />
          </div>
        </section>

        <section className="go-faq shell" aria-labelledby="go-faq-title">
          <h2 id="go-faq-title" className="section-title">
            자주 물어보시는 것
          </h2>
          <dl>
            {FAQ.map(([question, answer]) => (
              <div key={question}>
                <dt>{question}</dt>
                <dd>{answer}</dd>
              </div>
            ))}
          </dl>
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

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { StudioFooter } from "@/components/site-chrome";
import { StatusPill } from "@/components/status-pill";
import { getPortfolioStats, getProject, projects } from "@/lib/portfolio";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage } from "@/lib/site";
import { isInquiryConfigured } from "@/lib/supabase/env";
import { contactMail } from "@/components/site-chrome";
import { StartForm } from "./start-form";
import { StickyCta } from "./sticky-cta";

/**
 * Ad landing page for Meta (Instagram/Facebook) campaigns. Not in the nav, not indexed.
 * Inquiries go through the same server action pipeline as /contact and are tagged
 * source.form = "lp-start" (see submitStartInquiry).
 */
const TITLE = "외주 개발, 결과물부터 보고 맡기세요";
const DESCRIPTION =
  "만들고 싶은 서비스를 알려주시면 기획안 초안·예상 견적·일정을 정리해 보내드립니다. 상담·견적 비용은 없습니다.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | PLUCK 플럭` },
  description: DESCRIPTION,
  alternates: { canonical: "/lp/start" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    ...baseOpenGraph,
    type: "website",
    url: "/lp/start",
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

/** Owner-pinned order (MEMORY: Portfolio 함정). Never boryoung here. */
const PROOF = [
  "knife-sharpening",
  "homecare-platform",
  "boxon",
  "setflow",
  "naengkeep",
  "dvia",
  "dealer-settlement",
  "drivingzone-campaign",
] as const;

/** Only kinds of work backed by portfolio entries; `examples` are real slugs. */
const KINDS = [
  {
    title: "홈페이지·쇼핑몰",
    text: "회사·제품 소개, 상담·예약 신청, 다국어, 상품 판매까지. 모바일에서 먼저 보기 좋게 만듭니다.",
    image: "/work/dvia/cover.webp",
    alt: "대일시스템(DVIA) 웹사이트 메인 화면",
    examples: ["dvia", "homecare-platform", "thousand"],
  },
  {
    title: "앱",
    text: "회원가입부터 기록·알림·결제 흐름까지, 실제로 쓰는 모바일 앱과 모바일 웹을 만듭니다.",
    image: "/work/naengkeep/cover.webp",
    alt: "냉킵 앱 화면 3장 - 시작 화면, 나의 작은 냉장고, 재료 넣기",
    examples: ["naengkeep", "setflow", "knife-sharpening"],
  },
  {
    title: "관리자·업무 시스템",
    text: "엑셀과 단톡방으로 돌리던 계약·정산·문의 관리를 한 화면에서 처리하도록 만듭니다.",
    image: "/work/dealer-settlement/05.webp",
    alt: "카영 관리자 계약 관리 화면 - 상태 필터, 엑셀 내보내기·가져오기, 계약 목록 (가상 데이터)",
    examples: ["dealer-settlement", "homecare-platform", "drivingzone-campaign"],
  },
  {
    title: "업무 자동화·AI",
    text: "반복되는 작업은 자동으로, 필요한 곳에만 AI 기능을 붙입니다. 업무 흐름을 먼저 보고 제안합니다.",
    image: "/work/webtoon-voice/cover.webp",
    alt: "더빙고 화면 - 상황 한 줄로 AI가 웹툰 컷과 대사를 만드는 서비스",
    examples: ["webtoon-voice", "threads-agent", "card-news-studio"],
  },
] as const;

const OFFER = [
  {
    title: "기획안 초안",
    text: "꼭 필요한 기능과 화면 흐름, 먼저 만들 범위를 정리합니다.",
  },
  {
    title: "예상 견적",
    text: "정리한 범위를 기준으로 예상 비용을 범위로 안내합니다.",
  },
  {
    title: "일정",
    text: "디자인·개발·오픈까지 단계별 예상 일정을 함께 드립니다.",
  },
];

const STEPS = [
  {
    title: "상담",
    text: "만들고 싶은 것과 지금 겪는 불편을 듣습니다. 정리되지 않은 생각이어도 괜찮습니다.",
  },
  {
    title: "기획안·견적",
    text: "필요한 기능과 화면 흐름을 정리한 기획안 초안, 예상 견적과 일정을 보내드립니다.",
  },
  {
    title: "디자인·개발",
    text: "핵심 기능부터 만들고, 실제로 동작하는 화면을 보면서 피드백을 반영합니다.",
  },
  {
    title: "오픈·운영",
    text: "배포와 안정화 후, 운영하면서 필요한 개선과 추가 기능을 함께 검토합니다.",
  },
];

const FAQS = [
  [
    "비용은 얼마나 드나요?",
    "만들 기능과 규모에 따라 달라서 미리 정해진 금액을 말씀드리기 어렵습니다. 상담에서 범위를 정리한 뒤 예상 견적을 범위로 안내드리고, 상담과 견적에는 비용이 들지 않습니다.",
  ],
  [
    "기간은 얼마나 걸리나요?",
    "이것도 규모에 따라 다릅니다. 기획안과 함께 디자인·개발·오픈까지 단계별 예상 일정을 범위로 안내드립니다.",
  ],
  [
    "아이디어만 있어도 신청할 수 있나요?",
    "네. 해결하고 싶은 문제와 대략 원하는 모습만 알려주시면, 필요한 기능과 우선순위를 함께 정리합니다.",
  ],
  [
    "기획안을 받으면 꼭 진행해야 하나요?",
    "아니요. 기획안과 견적을 보고 진행 여부를 결정하시면 됩니다.",
  ],
  [
    "이미 있는 서비스를 고치거나 기능을 추가할 수도 있나요?",
    "네. 지금 서비스의 구조와 요구사항을 살펴본 뒤 리디자인, 기능 개선, 관리자 기능, AI 연동 등 필요한 범위를 제안합니다.",
  ],
] as const;

export default function StartPage() {
  const stats = getPortfolioStats(projects);
  const proof = PROOF.map((slug) => getProject(slug)).filter(
    (project) => project !== undefined,
  );
  const enabled = isInquiryConfigured();

  return (
    <div className="lp" id="top">
      <a className="skip-link" href="#apply">
        신청 양식으로 건너뛰기
      </a>
      <header className="lp-header">
        <div className="shell lp-header-inner">
          <Link className="wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <a className="header-contact" href="#apply">
            무료 기획안 받기
          </a>
        </div>
      </header>

      <main id="main">
        <section className="lp-hero" aria-labelledby="lp-title">
          <div className="shell lp-hero-inner">
            <div className="lp-hero-copy">
              <p className="lp-badge">11월 오픈 상담 · 상담·견적 비용 없음</p>
              <h1 id="lp-title">
                외주 개발,
                <br />
                결과물부터 보고
                <br />
                맡기세요.
              </h1>
              <p className="lp-lead">
                만들고 싶은 서비스를 알려주시면{" "}
                <strong>기획안 초안·예상 견적·일정</strong>을 정리해
                보내드립니다.
              </p>
              <div className="lp-hero-actions" id="lp-hero-cta">
                <a className="button button-primary button-xl" href="#apply">
                  무료 기획안·견적 받기 <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a className="button button-ghost" href="#work">
                  만든 서비스 먼저 보기
                </a>
              </div>
              <dl className="lp-facts">
                <div>
                  <dt>지금까지 만든 프로젝트</dt>
                  <dd>{stats.total}개</dd>
                </div>
                <div>
                  <dt>지금 접속해 볼 수 있는 서비스</dt>
                  <dd>{stats.live}개</dd>
                </div>
              </dl>
            </div>

            <div className="lp-hero-visual" aria-hidden="true">
              <figure className="lp-frame lp-frame-main">
                <Image
                  src="/work/knife-sharpening/cover.webp"
                  alt=""
                  width={1600}
                  height={1000}
                  sizes="(max-width: 960px) 92vw, 640px"
                  preload
                />
              </figure>
              <figure className="lp-frame lp-frame-side">
                <Image
                  src="/work/dealer-settlement/05.webp"
                  alt=""
                  width={1600}
                  height={1000}
                  sizes="(max-width: 960px) 60vw, 380px"
                />
              </figure>
            </div>
          </div>
        </section>

        <section className="lp-offer" aria-labelledby="lp-offer-title">
          <div className="shell">
            <h2 id="lp-offer-title" className="lp-title">
              신청하면 이렇게 정리해 드립니다
            </h2>
            <ul className="lp-offer-list">
              {OFFER.map((item) => (
                <li key={item.title}>
                  <Check size={22} aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
            <p className="lp-offer-note">
              상담과 견적은 무료이고, 받아 보신 뒤 진행 여부를 정하시면 됩니다.
            </p>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-kinds-title">
          <div className="shell">
            <h2 id="lp-kinds-title" className="lp-title">
              이런 걸 만들어 왔습니다
            </h2>
            <div className="lp-kinds">
              {KINDS.map((kind) => (
                <article className="lp-kind" key={kind.title}>
                  <div className="lp-kind-shot">
                    <Image
                      src={kind.image}
                      alt={kind.alt}
                      width={1600}
                      height={1000}
                      sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 600px"
                    />
                  </div>
                  <div className="lp-kind-body">
                    <h3>{kind.title}</h3>
                    <p>{kind.text}</p>
                    <ul className="lp-kind-examples" aria-label={`${kind.title} 사례`}>
                      {kind.examples.map((slug) => {
                        const project = getProject(slug);
                        if (!project) return null;
                        return (
                          <li key={slug}>
                            <Link href={`/work/${slug}`}>{project.name}</Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-work" id="work" aria-labelledby="lp-work-title">
          <div className="shell">
            <div className="lp-work-head">
              <h2 id="lp-work-title" className="lp-title">
                말보다 실제 화면으로 보여드립니다
              </h2>
              <p>
                PLUCK이 기획·디자인·개발한 프로젝트 {stats.total}개 중 일부입니다. 눌러서
                화면과 만든 범위를 확인해 보세요.
              </p>
            </div>
            <ul className="lp-work-grid">
              {proof.map((project) => (
                <li key={project.slug}>
                  <Link className="lp-card" href={`/work/${project.slug}`}>
                    <div className="lp-card-shot">
                      <Image
                        src={project.cover.src}
                        alt={project.cover.alt}
                        width={1600}
                        height={1000}
                        sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 320px"
                      />
                    </div>
                    <div className="lp-card-meta">
                      <StatusPill status={project.status} />
                      <h3>{project.name}</h3>
                      <p>{project.detail.oneLiner}</p>
                    </div>
                    <ArrowUpRight className="lp-card-arrow" size={20} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="button button-ghost lp-work-all" href="/#work">
              프로젝트 {stats.total}개 전체 보기
            </Link>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-steps-title">
          <div className="shell">
            <h2 id="lp-steps-title" className="lp-title">
              진행은 이렇게 합니다
            </h2>
            <ol className="lp-steps">
              {STEPS.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-faq-title">
          <div className="shell lp-faq">
            <h2 id="lp-faq-title" className="lp-title">
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

        <section className="lp-apply" id="apply" aria-labelledby="lp-apply-title">
          <div className="shell lp-apply-inner">
            <div className="lp-apply-copy">
              <h2 id="lp-apply-title">
                만들고 싶은 서비스를
                <br />
                알려주세요.
              </h2>
              <p>
                한두 줄이면 충분합니다. 확인 후 연락드려 내용을 여쭙고, 기획안 초안·예상
                견적·일정을 정리해 보내드립니다.
              </p>
              <ul>
                <li>
                  <Check size={18} aria-hidden="true" /> 상담·견적 비용 없음
                </li>
                <li>
                  <Check size={18} aria-hidden="true" /> 받아 보고 진행 여부 결정
                </li>
                <li>
                  <Check size={18} aria-hidden="true" /> 메일로도 문의 가능 ·{" "}
                  <a href={contactMail("PLUCK 기획안·견적 문의")}>{CONTACT_EMAIL}</a>
                </li>
              </ul>
            </div>
            <div className="lp-apply-panel">
              {enabled ? (
                <StartForm email={CONTACT_EMAIL} />
              ) : (
                <div className="inquiry-fallback">
                  <h2>메일로 신청해 주세요</h2>
                  <p>
                    지금은 온라인 접수를 준비하고 있어요. 만들고 싶은 것과 연락처를 적어
                    메일로 보내주시면 기획안 초안·예상 견적·일정을 정리해 드립니다.
                  </p>
                  <a
                    className="button button-primary"
                    href={contactMail("PLUCK 기획안·견적 문의")}
                  >
                    메일로 신청하기 <ArrowRight size={18} aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <StudioFooter />
      <StickyCta />
    </div>
  );
}

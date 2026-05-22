"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Globe } from "lucide-react";
import { GlitchText } from "@/components/glitch-text";
import { LineReveal } from "@/components/motion/line-reveal";
import { Reveal } from "@/components/motion/reveal";
import { FlyInCard } from "@/components/motion/fly-in-card";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { cn } from "@/lib/utils";

type Work = {
  title: string;
  tagline: string;
  category: "외주" | "개인" | "AI";
  stack: string[];
  highlight: string;
  link?: string;
  domain: string;
  /** 카드 사이즈 */
  size?: "wide" | "tall" | "default";
  grad: string;
  accent: string;
};

const WORKS: Work[] = [
  {
    title: "몇기야",
    tagline: "ROTC 동기 커뮤니티 플랫폼",
    category: "개인",
    stack: ["Next.js 16", "Supabase", "TipTap", "React Query"],
    highlight: "기획 → 디자인 → 풀스택 → 런칭 5주",
    link: "https://www.myotgiya.com/",
    domain: "myotgiya.com",
    size: "wide",
    grad: "from-fuchsia-500/70 via-violet-500/55 to-cyan-400/55",
    accent: "fuchsia",
  },
  {
    title: "NDrop",
    tagline: "디지털 명함 플랫폼",
    category: "외주",
    stack: ["Next.js 15", "Supabase", "JWT"],
    highlight: "B2B/B2C · QR 통합 인증",
    link: "https://www.ndrop.kr/",
    domain: "ndrop.kr",
    grad: "from-cyan-400/70 via-fuchsia-500/55 to-violet-500/55",
    accent: "cyan",
  },
  {
    title: "DVIA",
    tagline: "진동절연 시스템 글로벌 웹",
    category: "외주",
    stack: ["Next.js 14", "Three.js", "GSAP"],
    highlight: "3D + 다국어 + 견적 문의",
    link: "https://web-daeilsys-v2.vercel.app/",
    domain: "daeilsys.com",
    grad: "from-emerald-400/70 via-cyan-400/55 to-fuchsia-500/55",
    accent: "emerald",
  },
  {
    title: "FitGenie + 스포짐",
    tagline: "피트니스 CRM + 회원 앱",
    category: "외주",
    stack: ["Next.js", "Prisma", "Supabase", "FullCalendar"],
    highlight: "어드민 + 모바일 분리 운영",
    link: "https://admin-pando.vercel.app/",
    domain: "fitgenie / 스포짐",
    grad: "from-orange-400/70 via-rose-500/55 to-fuchsia-500/55",
    accent: "orange",
  },
  {
    title: "사주 오케스트레이터",
    tagline: "5단계 LLM 파이프라인",
    category: "AI",
    stack: ["Claude API", "MCP", "n8n", "Node.js"],
    highlight: "CLI / MCP / Webhook 3-mode",
    domain: "AI Agent",
    grad: "from-violet-500/70 via-fuchsia-500/55 to-rose-500/55",
    accent: "violet",
  },
  {
    title: "플럭 드로우",
    tagline: "QR 기반 이벤트 추첨",
    category: "개인",
    stack: ["Next.js 16", "Supabase", "QRCode"],
    highlight: "실시간 추첨 + 관리자",
    link: "https://draw.pluck.co.kr/",
    domain: "draw.pluck.co.kr",
    grad: "from-rose-500/70 via-violet-500/55 to-cyan-400/55",
    accent: "rose",
  },
];

const CATEGORY_COLOR: Record<Work["category"], string> = {
  외주: "bg-purple-400/15 border-purple-400/30 text-purple-200",
  개인: "bg-orange-400/15 border-orange-400/30 text-orange-200",
  AI: "bg-cyan-400/15 border-cyan-400/30 text-cyan-200",
};

export function Showreel() {
  return (
    <section id="showreel" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow mb-5">— 우리가 만든 것들</div>
            <h2 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">
                <LineReveal>실제 라이브 중인</LineReveal>
              </span>
              <span className="block">
                <LineReveal delay={0.15} sweep>
                  <GlitchText className="inline-block">프로덕트</GlitchText>
                  <span className="ml-2 inline-block gradient-text">들.</span>
                </LineReveal>
              </span>
            </h2>
            <p className="lead-copy mt-5 max-w-xl">
              외주 · 개인 · AI 작품 합쳐 30개 이상. 아래는 최근 라인업입니다.
            </p>
          </div>
          <a
            href="https://github.com/pluck-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.04] px-4 text-[13px] font-medium text-foreground/85 transition hover:border-fuchsia-400/40 hover:bg-white/[0.08] hover:text-foreground sm:self-auto"
          >
            전체 작업 보기
            <ArrowUpRight className="size-3.5" />
          </a>
        </Reveal>

        {/* Bento 그리드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKS.map((w, i) => (
            <FlyInCard
              key={w.title}
              index={i}
              from="scatter"
              className={cn(w.size === "wide" && "sm:col-span-2 lg:col-span-2")}
            >
              <WorkCard work={w} />
            </FlyInCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ work }: { work: Work }) {
  const inner = (
    <SpotlightCard
      color="oklch(0.78 0.22 305 / 0.22)"
      className="group relative h-full overflow-hidden rounded-3xl glass transition-transform duration-300 hover:-translate-y-1.5"
    >
      {/* 브라우저 mockup */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl m-3",
          work.size === "wide" ? "aspect-[16/9]" : "aspect-[16/10]"
        )}
      >
        <div
          aria-hidden
          className={cn("absolute inset-0 bg-gradient-to-br", work.grad)}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_30%,oklch(1_0_0_/_0.1),transparent_55%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,oklch(0_0_0_/_0.5)_100%)]"
        />
        <div aria-hidden className="absolute inset-0 noise" />

        {/* 브라우저 chrome */}
        <div className="absolute inset-x-0 top-0 flex h-8 items-center gap-1.5 bg-black/30 px-3 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-rose-400/80" />
          <span className="size-2 rounded-full bg-amber-400/80" />
          <span className="size-2 rounded-full bg-emerald-400/80" />
          <div className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-mono text-foreground/75">
            <Globe className="size-2.5" />
            {work.domain}
          </div>
        </div>

        {/* 사이트 뼈대 — 와이어 라인 */}
        <div className="absolute inset-x-6 top-12 space-y-2">
          <div className="h-3 w-1/3 rounded bg-white/25" />
          <div className="h-2 w-3/5 rounded bg-white/15" />
          <div className="h-2 w-1/2 rounded bg-white/15" />
        </div>
        <div
          className={cn(
            "absolute inset-x-6 grid gap-2",
            work.size === "wide"
              ? "bottom-6 grid-cols-3"
              : "bottom-6 grid-cols-2"
          )}
        >
          <div className="aspect-square rounded-lg bg-white/15" />
          <div className="aspect-square rounded-lg bg-white/10" />
          {work.size === "wide" && (
            <div className="aspect-square rounded-lg bg-white/15" />
          )}
        </div>

        {/* 카테고리 뱃지 */}
        <div className="absolute right-3 top-12">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
              CATEGORY_COLOR[work.category]
            )}
          >
            {work.category}
          </span>
        </div>

        {/* 호버 시 우상단 화살표 */}
        {work.link && (
          <div className="absolute right-3 bottom-3 inline-flex size-9 items-center justify-center rounded-full bg-background/40 backdrop-blur-md transition-transform group-hover:-translate-y-1 group-hover:scale-110">
            <ArrowUpRight className="size-4 text-foreground" />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-5 pt-2 sm:p-6 sm:pt-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-fuchsia-300">
          {work.highlight}
        </div>
        <h3 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {work.title}
        </h3>
        <p className="mt-1 text-[14px] text-muted-foreground">{work.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {work.stack.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-foreground/85"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </SpotlightCard>
  );

  if (work.link) {
    return (
      <a
        href={work.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {inner}
      </a>
    );
  }
  return <div className="h-full">{inner}</div>;
}

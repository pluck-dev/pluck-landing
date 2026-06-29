"use client";

import { ArrowUpRight, Globe } from "lucide-react";
import { KineticText } from "@/components/motion/kinetic-text";
import { Reveal } from "@/components/motion/reveal";
import { Panel3D } from "@/components/motion/panel-3d";
import { DisplaceDefs } from "@/components/motion/displace-defs";
import { cn } from "@/lib/utils";

type Work = {
  title: string;
  tagline: string;
  category: "외주" | "개인" | "AI";
  stack: string[];
  highlight: string;
  link?: string;
  domain: string;
  /** 마소너리 카드 높이 — 가변 */
  h: "sm" | "md" | "lg";
  grad: string;
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
    h: "lg",
    grad: "from-fuchsia-500/35 via-violet-500/22 to-cyan-400/18",
  },
  {
    title: "NDrop",
    tagline: "디지털 명함 플랫폼",
    category: "외주",
    stack: ["Next.js 15", "Supabase", "JWT"],
    highlight: "B2B/B2C · QR 통합 인증",
    link: "https://www.ndrop.kr/",
    domain: "ndrop.kr",
    h: "md",
    grad: "from-cyan-400/32 via-fuchsia-500/20 to-violet-500/18",
  },
  {
    title: "DVIA",
    tagline: "진동절연 시스템 글로벌 웹",
    category: "외주",
    stack: ["Next.js 14", "Three.js", "GSAP"],
    highlight: "3D + 다국어 + 견적 문의",
    link: "https://web-daeilsys-v2.vercel.app/",
    domain: "daeilsys.com",
    h: "sm",
    grad: "from-emerald-400/32 via-cyan-400/20 to-fuchsia-500/16",
  },
  {
    title: "FitGenie + 스포짐",
    tagline: "피트니스 CRM + 회원 앱",
    category: "외주",
    stack: ["Next.js", "Prisma", "Supabase", "FullCalendar"],
    highlight: "어드민 + 모바일 분리 운영",
    link: "https://admin-pando.vercel.app/",
    domain: "fitgenie / 스포짐",
    h: "lg",
    grad: "from-orange-400/32 via-rose-500/20 to-fuchsia-500/16",
  },
  {
    title: "사주 오케스트레이터",
    tagline: "5단계 LLM 파이프라인",
    category: "AI",
    stack: ["Claude API", "MCP", "n8n", "Node.js"],
    highlight: "CLI / MCP / Webhook 3-mode",
    domain: "AI Agent",
    h: "md",
    grad: "from-violet-500/35 via-fuchsia-500/20 to-rose-500/16",
  },
  {
    title: "플럭 드로우",
    tagline: "QR 기반 이벤트 추첨",
    category: "개인",
    stack: ["Next.js 16", "Supabase", "QRCode"],
    highlight: "실시간 추첨 + 관리자",
    link: "https://draw.pluck.co.kr/",
    domain: "draw.pluck.co.kr",
    h: "sm",
    grad: "from-rose-500/32 via-violet-500/20 to-cyan-400/16",
  },
];

const CATEGORY_COLOR: Record<Work["category"], string> = {
  외주: "bg-purple-400/15 border-purple-400/30 text-purple-200",
  개인: "bg-orange-400/15 border-orange-400/30 text-orange-200",
  AI: "bg-cyan-400/15 border-cyan-400/30 text-cyan-200",
};

const HEIGHT: Record<Work["h"], string> = {
  sm: "min-h-[300px]",
  md: "min-h-[380px]",
  lg: "min-h-[460px]",
};

export function Showreel() {
  return (
    <section id="showreel" className="relative overflow-hidden py-24 sm:py-32">
      <DisplaceDefs />
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow mb-5">— 우리가 만든 것들</div>
            <h2 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">
                <KineticText text="실제 라이브 중인" eager />
              </span>
              <span className="block">
                <KineticText text="프로덕트들." gradient delay={0.18} />
              </span>
            </h2>
            <p className="lead-copy mt-5 max-w-xl">
              외주 · 개인 · AI 작품 합쳐 30개 이상. 마우스를 올려보세요.
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

        {/* Fluid 마소너리 — CSS columns 로 가변 높이 흐름 */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {WORKS.map((w) => (
            <div key={w.title} className="break-inside-avoid">
              <Panel3D>
                <WorkCard work={w} />
              </Panel3D>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ work }: { work: Work }) {
  const inner = (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl border border-white/10 bg-card/40",
        HEIGHT[work.h]
      )}
    >
      {/* 아트 레이어 — 호버 시 displace + scale */}
      <div
        aria-hidden
        className={cn(
          "displace-art chroma scanlines absolute inset-0 bg-gradient-to-br",
          work.grad
        )}
      />
      {/* 노이즈 + 거대 워터마크 타이포 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-6 -right-3 select-none font-heading text-[7rem] font-black leading-none tracking-tighter text-white/[0.06] sm:text-[9rem]"
      >
        {work.category}
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 flex h-full flex-col p-6">
        <div className="flex items-start gap-2">
          <div className="inline-flex max-w-[70%] items-center gap-1.5 rounded-full border border-white/10 bg-background/40 px-3 py-1 text-[11px] font-mono text-foreground/80 backdrop-blur-md">
            <Globe className="size-3 shrink-0" />
            <span className="truncate">{work.domain}</span>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase",
              CATEGORY_COLOR[work.category]
            )}
          >
            {work.category}
          </span>
        </div>

        {/* 하단 정보 — 평소엔 타이틀, 호버 시 디테일이 부드럽게 올라옴 */}
        <div className="mt-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-fuchsia-200/90">
            {work.highlight}
          </div>
          <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {work.title}
          </h3>
          <p className="mt-1 text-[15px] text-foreground/75">{work.tagline}</p>

          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-1.5 pt-4">
                {work.stack.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-foreground/85 backdrop-blur-md"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {work.link && (
          <span className="absolute right-6 top-6 inline-flex size-10 translate-y-1 items-center justify-center rounded-full bg-background/55 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4 text-foreground" />
          </span>
        )}
      </div>
    </div>
  );

  if (work.link) {
    return (
      <a
        href={work.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

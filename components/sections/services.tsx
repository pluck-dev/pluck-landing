"use client";

import {
  FileText,
  Palette,
  Code2,
  Smartphone,
  Cpu,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlitchText } from "@/components/glitch-text";
import { FlyInCard } from "@/components/motion/fly-in-card";
import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { CharReveal } from "@/components/motion/char-reveal";

const SERVICES = [
  {
    icon: FileText,
    tag: "기획",
    title: "Product Planning",
    desc: "PRD · 화면설계서 · 기능명세서 · API 명세서 · RBAC. 클라이언트 미팅부터 설계까지 1인 풀스펙.",
    metric: "21개 템플릿 · Obsidian",
    accent: "from-fuchsia-500/40 to-fuchsia-500/0",
    spot: "oklch(0.78 0.22 305 / 0.25)",
  },
  {
    icon: Palette,
    tag: "디자인",
    title: "UI/UX Design",
    desc: "와이어 · 비주얼 · 인터랙션. shadcn/ui · Framer Motion 기반의 모던 인터페이스.",
    metric: "Figma · shadcn · Motion",
    accent: "from-violet-500/40 to-violet-500/0",
    spot: "oklch(0.7 0.25 295 / 0.25)",
  },
  {
    icon: Code2,
    tag: "프론트",
    title: "Frontend",
    desc: "Next.js 14/15/16 · React 19 · TypeScript. 빠르고 견고한 풀-페이지 인터랙티브 웹.",
    metric: "Next.js · React · TS",
    accent: "from-cyan-400/40 to-cyan-400/0",
    spot: "oklch(0.85 0.18 200 / 0.25)",
  },
  {
    icon: Smartphone,
    tag: "모바일",
    title: "Mobile App",
    desc: "React Native · Expo · Flutter. Play Store · App Store 배포까지 책임.",
    metric: "RN · Expo · Flutter",
    accent: "from-rose-500/40 to-rose-500/0",
    spot: "oklch(0.78 0.24 340 / 0.25)",
  },
  {
    icon: Workflow,
    tag: "백엔드",
    title: "Backend & DB",
    desc: "NestJS · Node · Python · FastAPI · Supabase · Prisma · GraphQL. 결제 · 인증 · 자동화까지.",
    metric: "NestJS · Supabase · FastAPI",
    accent: "from-lime-400/40 to-lime-400/0",
    spot: "oklch(0.9 0.22 130 / 0.22)",
  },
  {
    icon: Cpu,
    tag: "AI",
    title: "AI & Automation",
    desc: "LLM 파이프라인 · MCP 서버 · Claude Code 스킬. 진짜 운영되는 AI 기능을 만듭니다.",
    metric: "Claude · OpenAI · MCP",
    accent: "from-orange-400/40 to-orange-400/0",
    spot: "oklch(0.83 0.18 60 / 0.22)",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mb-14 max-w-2xl">
          <div className="eyebrow mb-5">— 우리가 잘하는 일</div>
          <h2 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            <CharReveal text="한 사람이 처음부터 " />
            <GlitchText className="inline-block">끝까지</GlitchText>{" "}
            <span className="gradient-text">
              <CharReveal text="만듭니다." delay={0.2} />
            </span>
          </h2>
          <p className="lead-copy mt-5 max-w-xl">
            기획 · 디자인 · 풀스택 · AI까지 한 명이 책임집니다. 외주 핑퐁 없이,
            결정이 빠르고 결과물에 흔들림이 없습니다.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <FlyInCard key={s.title} index={i} from="scatter">
                <SpotlightCard
                  color={s.spot}
                  className="group glow-border h-full rounded-2xl glass p-6 transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br ${s.accent} blur-2xl transition-transform duration-500 group-hover:scale-125`}
                  />
                  <div className="flex items-center justify-between">
                    <div className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-fuchsia-300 shadow-[inset_0_0_24px_oklch(0.78_0.22_305_/_0.18)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <Badge className="rounded-full bg-white/[0.06] text-[10px] font-medium text-foreground hover:bg-white/[0.06]">
                      {s.tag}
                    </Badge>
                  </div>

                  <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="body-copy mt-2.5 text-[14.5px]">{s.desc}</p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Stack
                    </span>
                    <span className="font-mono text-sm font-semibold gradient-text">
                      {s.metric}
                    </span>
                  </div>
                </SpotlightCard>
              </FlyInCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

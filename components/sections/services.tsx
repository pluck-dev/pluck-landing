"use client";

import {
  Palette,
  Code2,
  Cpu,
  TrendingUp,
  Sparkles,
  Cloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlitchText } from "@/components/glitch-text";
import { FlyInCard } from "@/components/motion/fly-in-card";
import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { CharReveal } from "@/components/motion/char-reveal";

const SERVICES = [
  {
    icon: Palette,
    tag: "디자인",
    title: "Product Design",
    desc: "리서치 → IA → 와이어 → 비주얼. 사용자 행동을 끌어내는 UX/UI를 설계합니다.",
    metric: "Figma · 디자인 시스템",
    accent: "from-fuchsia-500/40 to-fuchsia-500/0",
    spot: "oklch(0.78 0.22 305 / 0.25)",
  },
  {
    icon: Code2,
    tag: "엔지니어링",
    title: "Web & App",
    desc: "Next.js · React Native · TypeScript. 빠르고 견고한 풀스택 구현.",
    metric: "Web · iOS · Android",
    accent: "from-violet-500/40 to-violet-500/0",
    spot: "oklch(0.7 0.25 295 / 0.25)",
  },
  {
    icon: Cpu,
    tag: "AI",
    title: "AI & Automation",
    desc: "LLM, 추천, 검색, RAG. 실제 비즈니스에 들어가는 AI 기능 구현.",
    metric: "OpenAI · Anthropic · 자체모델",
    accent: "from-rose-500/40 to-rose-500/0",
    spot: "oklch(0.78 0.24 340 / 0.25)",
  },
  {
    icon: Sparkles,
    tag: "브랜드",
    title: "Brand & Motion",
    desc: "로고 · 가이드 · 모션. 제품과 한 몸이 되는 브랜드 시스템을 만듭니다.",
    metric: "Identity · Storytelling",
    accent: "from-cyan-400/40 to-cyan-400/0",
    spot: "oklch(0.85 0.18 200 / 0.25)",
  },
  {
    icon: TrendingUp,
    tag: "그로스",
    title: "Growth",
    desc: "퍼포먼스 · CRM · 그로스 실험. 런칭 후 매출 곡선을 책임집니다.",
    metric: "GA4 · Amplitude · A/B",
    accent: "from-lime-400/40 to-lime-400/0",
    spot: "oklch(0.9 0.22 130 / 0.22)",
  },
  {
    icon: Cloud,
    tag: "DevOps",
    title: "Cloud & DevOps",
    desc: "AWS · Vercel · Supabase · 모니터링. 안정적이고 확장 가능한 인프라.",
    metric: "CI/CD · Observability",
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
            <CharReveal text="한 팀이 처음부터 " />
            <GlitchText className="inline-block">끝까지</GlitchText>{" "}
            <span className="gradient-text">
              <CharReveal text="책임집니다." delay={0.2} />
            </span>
          </h2>
          <p className="lead-copy mt-5 max-w-xl">
            6개 디시플린이 한 스튜디오에 모여 있습니다. 외주 핑퐁 없이 한
            팀에서 본질만 뽑아냅니다.
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

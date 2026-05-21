"use client";

import { Briefcase, FileText, Calendar, Wand2 } from "lucide-react";
import { GlitchText } from "@/components/glitch-text";
import { Counter } from "@/components/motion/counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CharReveal } from "@/components/motion/char-reveal";
import { Parallax } from "@/components/motion/parallax";

const STATS = [
  {
    icon: Briefcase,
    to: 30,
    suffix: "+",
    l: "프로덕트 출시",
    sub: "외주 · 개인 · AI 작품 합산",
  },
  {
    icon: Calendar,
    to: 5,
    suffix: "년차",
    l: "스타트업 경험",
    sub: "기획 · 디자인 · 개발 · 마케팅",
  },
  {
    icon: FileText,
    to: 324,
    suffix: "+",
    l: "스펙 문서",
    sub: "Obsidian + 21개 템플릿",
  },
  {
    icon: Wand2,
    to: 4,
    suffix: "",
    l: "AI 자체 도구",
    sub: "Planning Kit · Video Kit · MCP · Orchestrator",
  },
];

export function Stats() {
  return (
    <section id="stats" className="relative overflow-hidden py-24 sm:py-32">
      <Parallax
        speed={-120}
        className="pointer-events-none absolute -left-8 top-8 -z-10 hidden select-none sm:-left-12 sm:top-6 sm:block"
      >
        <span className="font-heading text-[12rem] font-black leading-none tracking-tight text-white/[0.025] sm:text-[18rem]">
          STUDIO
        </span>
      </Parallax>

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mb-12 flex flex-col items-start gap-4">
          <div className="eyebrow">— PLUCK에 대하여</div>
          <h2 className="max-w-3xl font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            <CharReveal text="혼자서도 " />
            <GlitchText className="inline-block">서비스를</GlitchText>{" "}
            <span className="gradient-text">
              <CharReveal text="만들어내는 사람." delay={0.2} />
            </span>
          </h2>
          <p className="lead-copy mt-4 max-w-2xl">
            스타트업 5년차, 5번의 이직을 통해 기획 · 디자인 · 개발 · 마케팅을
            모두 거쳤습니다. 월급이 밀리기도 했고 회사가 망하기도 했지만, 그
            과정에서 &ldquo;혼자서도 서비스를 만들어낼 수 있는 사람&rdquo;이
            됐습니다.
          </p>
        </Reveal>

        <Stagger
          stagger={0.12}
          className="grid gap-px overflow-hidden rounded-3xl glass sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <StaggerItem
                key={s.l}
                y={40}
                className="group relative bg-background/40 p-7 transition-colors hover:bg-white/[0.04]"
              >
                <div className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-300 shadow-[inset_0_0_20px_oklch(0.85_0.18_200_/_0.15)] transition-transform group-hover:rotate-6 group-hover:scale-110">
                  <Icon className="size-5" />
                </div>
                <Counter
                  to={s.to}
                  suffix={s.suffix}
                  className="mt-6 block font-heading text-4xl font-bold tracking-tight gradient-text sm:text-5xl"
                />
                <div className="mt-2 text-[15px] font-semibold text-foreground">
                  {s.l}
                </div>
                <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {s.sub}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

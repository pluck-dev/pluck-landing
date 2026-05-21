"use client";

import { Briefcase, Users, Calendar, Award } from "lucide-react";
import { GlitchText } from "@/components/glitch-text";
import { Counter } from "@/components/motion/counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CharReveal } from "@/components/motion/char-reveal";
import { Parallax } from "@/components/motion/parallax";

const STATS = [
  {
    icon: Briefcase,
    to: 120,
    suffix: "+",
    l: "프로젝트",
    sub: "스타트업부터 대기업까지",
  },
  {
    icon: Users,
    to: 18,
    suffix: "",
    l: "팀 멤버",
    sub: "디자이너 · 엔지니어 · PM · AI",
  },
  {
    icon: Calendar,
    to: 8,
    suffix: "년",
    l: "운영 기간",
    sub: "2018년 창립 이래 흑자 운영",
  },
  {
    icon: Award,
    to: 23,
    suffix: "",
    l: "수상 & 피처",
    sub: "Awwwards · CSS Design Awards 등",
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
          <div className="eyebrow">— 우리에 대하여</div>
          <h2 className="max-w-3xl font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            <CharReveal text="8년간 멈추지 않고 " />
            <GlitchText className="inline-block">만들어왔습니다</GlitchText>{" "}
            <span className="gradient-text">
              <CharReveal text="제품을." delay={0.2} />
            </span>
          </h2>
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

"use client";

import { Quote } from "lucide-react";
import { GlitchText } from "@/components/glitch-text";
import { FlyInCard } from "@/components/motion/fly-in-card";
import { Reveal } from "@/components/motion/reveal";
import { CharReveal } from "@/components/motion/char-reveal";

const QUOTES = [
  {
    quote:
      "기획부터 개발까지 한 사람이 다 들어가니까 의사결정이 비교할 수 없이 빨랐어요. 매주 데모가 진짜 데모였습니다.",
    name: "스타트업 대표",
    role: "Pre-A · SaaS",
    accent: "from-fuchsia-500/30 to-fuchsia-500/0",
  },
  {
    quote:
      "AI 기능을 어떻게 끼울지 막막했는데, MVP 안에 자연스럽게 들어왔어요. 출시 후에도 같이 봐주는 게 진짜 좋았습니다.",
    name: "프로덕트 매니저",
    role: "Seed · 커머스",
    accent: "from-cyan-400/30 to-cyan-400/0",
  },
  {
    quote:
      "기획서 퀄리티가 인하우스 PM보다 좋아서 놀랐습니다. 외주 받는 느낌이 아니라 우리 팀 한 명이 늘어난 느낌.",
    name: "CTO",
    role: "Series A · B2B",
    accent: "from-violet-500/30 to-violet-500/0",
  },
  {
    quote:
      "사이드 프로젝트로 시작했는데 한 달 만에 라이브 가능한 형태로 나왔어요. 가성비도 좋고 결과물 만족도가 가장 큽니다.",
    name: "솔로 창업자",
    role: "Bootstrapped",
    accent: "from-rose-500/30 to-rose-500/0",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mb-14 max-w-2xl">
          <div className="eyebrow mb-5">— 함께한 분들 후기</div>
          <h2 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            <CharReveal text="결과로 " />
            <GlitchText className="inline-block">증명합니다</GlitchText>
            <span className="ml-2 gradient-text">
              <CharReveal text="." delay={0.2} />
            </span>
          </h2>
          <p className="lead-copy mt-5">
            지난 5년간 함께한 분들의 이야기입니다.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {QUOTES.map((q, i) => (
            <FlyInCard
              key={q.name}
              index={i}
              from={i % 2 === 0 ? "left" : "right"}
            >
              <article className="group relative overflow-hidden rounded-3xl glass p-8 transition-transform duration-300 hover:-translate-y-1">
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br ${q.accent} blur-2xl transition-transform group-hover:scale-125`}
                />
                <Quote className="size-7 text-fuchsia-300" />
                <p className="mt-5 text-pretty text-[17px] leading-[1.7] text-foreground sm:text-lg">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 shadow-[0_0_18px_oklch(0.78_0.22_305_/_0.45)]" />
                  <div>
                    <div className="text-[15px] font-semibold text-foreground">
                      {q.name}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                      {q.role}
                    </div>
                  </div>
                </div>
              </article>
            </FlyInCard>
          ))}
        </div>
      </div>
    </section>
  );
}

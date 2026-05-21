"use client";

import { Quote } from "lucide-react";
import { GlitchText } from "@/components/glitch-text";
import { FlyInCard } from "@/components/motion/fly-in-card";
import { Reveal } from "@/components/motion/reveal";
import { CharReveal } from "@/components/motion/char-reveal";

const QUOTES = [
  {
    quote:
      "스튜디오가 아니라 한 팀처럼 일했습니다. 디자인부터 운영까지 끊김 없이 흘러갔고, 출시 3개월만에 핵심 지표가 두 배가 됐어요.",
    name: "정민호",
    role: "CPO · 시리즈 B 핀테크",
    accent: "from-fuchsia-500/30 to-fuchsia-500/0",
  },
  {
    quote:
      "AI 기능을 처음 도입할 때 사실 반신반의했는데, 실제 매출이 따라왔어요. 가설부터 검증까지 우리보다 더 빨랐습니다.",
    name: "이수진",
    role: "Founder · AI 커머스",
    accent: "from-cyan-400/30 to-cyan-400/0",
  },
  {
    quote:
      "여러 에이전시랑 일해봤지만 이렇게 코드 품질이 좋은 곳은 처음입니다. 6개월 지나도 우리가 그대로 운영해도 막힘이 없어요.",
    name: "김도윤",
    role: "CTO · SaaS",
    accent: "from-violet-500/30 to-violet-500/0",
  },
  {
    quote:
      "디자이너 한 명, PM 한 명이 우리 채널에 풀타임처럼 들어왔습니다. 분기 OKR을 같이 맞추는 게 진짜 큰 차이예요.",
    name: "박지혜",
    role: "VP Product · 대기업",
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
          <div className="eyebrow mb-5">— 클라이언트 후기</div>
          <h2 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            <CharReveal text="우리보다 " />
            <GlitchText className="inline-block">고객이</GlitchText>
            <span className="ml-2 gradient-text">
              <CharReveal text=" 더 잘 압니다." delay={0.2} />
            </span>
          </h2>
          <p className="lead-copy mt-5">
            지난 8년간 함께한 분들이 들려준 이야기입니다.
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

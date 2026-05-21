"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { GlitchText } from "@/components/glitch-text";
import { Reveal } from "@/components/motion/reveal";
import { CharReveal } from "@/components/motion/char-reveal";
import { LineReveal } from "@/components/motion/line-reveal";

const STEPS = [
  {
    n: "01",
    t: "Kickoff",
    d: "클라이언트 미팅 · 비즈니스 목표 · KPI · 마일스톤 정의. PRD 초안까지 첫 주에 끝냅니다.",
  },
  {
    n: "02",
    t: "Plan",
    d: "유저 페르소나 · 시나리오 · IA · 화면설계서 · 기능명세서 · API 명세서 · 데이터 정의서 · 권한 매트릭스.",
  },
  {
    n: "03",
    t: "Design",
    d: "Figma · shadcn 기반 디자인 시스템 → 와이어 → 비주얼 → 인터랙션. 프로토타입까지.",
  },
  {
    n: "04",
    t: "Build",
    d: "Next.js · NestJS · Supabase · React Native. 스프린트 단위 개발과 매주 데모 리뷰.",
  },
  {
    n: "05",
    t: "Launch",
    d: "QA · 모니터링 · 분석 셋업 · 운영 핸드오버. 끄지 않고 안정적으로 띄웁니다.",
  },
  {
    n: "06",
    t: "Grow",
    d: "지표 분석 · A/B · 다음 이터레이션. 런칭이 아닌 운영이 진짜 시작.",
  },
];

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:mb-20">
          <div className="max-w-xl">
            <div className="eyebrow mb-5">— 일하는 방식</div>
            <h2 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">
                <LineReveal>1인 풀스펙</LineReveal>
              </span>
              <span className="block">
                <LineReveal delay={0.15} sweep>
                  <GlitchText className="inline-block">6 PHASES</GlitchText>
                </LineReveal>
              </span>
            </h2>
          </div>
          <p className="lead-copy text-[15px] sm:max-w-sm sm:text-right sm:text-[16px]">
            평균 킥오프 1주, 첫 데모 2~3주.
            <br />
            324개+ 스펙 문서를 굴려본 검증된 워크플로.
          </p>
        </Reveal>

        <div ref={ref} className="relative">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[2.6rem] hidden h-px bg-white/[0.06] lg:block"
          />
          <motion.div
            aria-hidden
            style={{ width: lineWidth }}
            className="absolute left-0 top-[2.6rem] hidden h-px bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-400 shadow-[0_0_24px_oklch(0.78_0.22_305_/_0.7)] lg:block"
          />

          <ol className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-6">
            {STEPS.map((s, i) => (
              <li key={s.n} className="group relative">
                <motion.div
                  initial={{ opacity: 0, y: 80, scale: 0.7 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative"
                >
                  <span
                    className="block font-heading text-[5.5rem] font-black leading-none tracking-tighter text-transparent sm:text-[6rem]"
                    style={{
                      WebkitTextStroke:
                        "1.5px oklch(0.78 0.22 305 / 0.65)",
                    }}
                  >
                    {s.n}
                  </span>
                  <span
                    aria-hidden
                    className="absolute left-0 top-[2.4rem] hidden size-3 -translate-y-1/2 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 shadow-[0_0_18px_oklch(0.78_0.22_305_/_0.85)] lg:block"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.08 + 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-4 lg:mt-6"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-fuchsia-300">
                    phase {s.n}
                  </div>
                  <h3 className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-xl xl:text-2xl">
                    {s.t}
                  </h3>
                  <p className="body-copy mt-3 text-[14px]">{s.d}</p>
                </motion.div>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-16 sm:mt-20">
          <div className="rounded-3xl glass p-6 text-center sm:p-10">
            <p className="font-heading text-2xl font-bold leading-[1.2] tracking-tight sm:text-4xl">
              <LineReveal>
                <CharReveal text="기획부터 운영까지, 끊김 없이." />
              </LineReveal>
            </p>
            <p className="lead-copy mt-3">
              외주 핑퐁이 없으니 빠르고, 한 사람이 책임지니 흔들리지 않습니다.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

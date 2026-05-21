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
    t: "Discover",
    d: "사용자 인터뷰 · 시장 분석 · 경쟁사 매핑. 진짜 풀어야 할 문제를 정합니다.",
  },
  {
    n: "02",
    t: "Define",
    d: "JTBD · 페르소나 · 메트릭 정의. 성공의 기준을 숫자로 박아둡니다.",
  },
  {
    n: "03",
    t: "Design",
    d: "IA · 와이어 · 비주얼 · 프로토타입. 개발 직전까지 손에 잡히는 형태로.",
  },
  {
    n: "04",
    t: "Build",
    d: "스프린트 단위 개발 · 매주 리뷰 데모. 변경에 강한 견고한 코드.",
  },
  {
    n: "05",
    t: "Launch",
    d: "QA · 모니터링 · 운영 핸드오버. 끄지 않고 안정적으로 띄웁니다.",
  },
  {
    n: "06",
    t: "Grow",
    d: "지표 분석 · A/B · 다음 이터레이션. 런칭이 아닌 성장이 끝입니다.",
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
                <LineReveal>아이디어에서 매출까지</LineReveal>
              </span>
              <span className="block">
                <LineReveal delay={0.15} sweep>
                  <GlitchText className="inline-block">6 PHASES</GlitchText>
                </LineReveal>
              </span>
            </h2>
          </div>
          <p className="lead-copy text-[15px] sm:max-w-sm sm:text-right sm:text-[16px]">
            평균 킥오프 1주, 첫 데모까지 3주.
            <br />
            매주 한 번의 데모로 방향을 함께 잡습니다.
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
                <CharReveal text="한 번도 멈춘 적 없습니다." />
              </LineReveal>
            </p>
            <p className="lead-copy mt-3">
              지난 8년간 진행한 모든 프로젝트가 라이브로 돌아갑니다.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

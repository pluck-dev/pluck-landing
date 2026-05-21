"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineReveal, MultiLineReveal } from "@/components/motion/line-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { Counter } from "@/components/motion/counter";
import { FloatingOrbs } from "@/components/motion/floating-orbs";

const METRICS = [
  { v: 30, suffix: "+", l: "Products" },
  { v: 5, suffix: "년차", l: "Experience" },
  { v: 324, suffix: "+", l: "Spec Docs" },
  { v: 4, suffix: "", l: "Disciplines" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden noise"
    >
      <FloatingOrbs />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 top-32 -z-10 bg-grid"
      />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
        <motion.div
          initial={{ y: -32, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.21, 1.02, 0.73, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-2 text-sm font-medium text-foreground/90 sm:text-[15px]"
        >
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-fuchsia-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-400" />
          </span>
          새 프로젝트 받고 있어요 · 2026 슬롯 4자리 남음
        </motion.div>

        <h1 className="mt-6 text-balance font-heading text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:mt-8 sm:text-6xl md:text-7xl lg:text-[5.5rem]">
          <MultiLineReveal
            eager
            lines={[
              <span key="l1">AI와 함께 빠르게 만들고,</span>,
              <span key="l2">
                <span
                  data-text="끝까지"
                  className="glitch gradient-text mr-2 sm:mr-3"
                >
                  끝까지
                </span>
                <span>완성합니다.</span>
              </span>,
            ]}
            step={0.14}
          />
        </h1>

        <motion.div
          initial={{ y: 30, opacity: 0, filter: "blur(8px)" }}
          whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="lead-copy mt-7 max-w-2xl text-pretty sm:mt-8"
        >
          <span className="block">
            <LineReveal eager delay={0.7} sweep={false}>
              기획 · 디자인 · 풀스택 개발 · AI 자동화.
            </LineReveal>
          </span>
          <span className="block">
            <LineReveal eager delay={0.85} sweep={false}>
              <span className="text-foreground">1인 풀스펙 스튜디오</span>가
              제품을 통째로 책임집니다.
            </LineReveal>
          </span>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.0, duration: 0.7 }}
          className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center"
        >
          <Magnetic strength={0.3} className="w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-7 text-[15px] font-semibold text-black shadow-[0_0_40px_oklch(0.78_0.22_305_/_0.55)] transition-shadow hover:shadow-[0_0_60px_oklch(0.78_0.22_305_/_0.85)] sm:w-auto"
            >
              <Link href="#contact">
                프로젝트 문의하기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic strength={0.2} className="w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-white/15 bg-white/[0.03] px-6 text-[15px] backdrop-blur hover:bg-white/[0.08] sm:w-auto"
            >
              <Link href="#showreel">
                <Play className="size-4 fill-current" />
                작업 보기
              </Link>
            </Button>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl glass sm:mt-16 sm:grid-cols-4"
        >
          {METRICS.map((m) => (
            <div key={m.l} className="bg-background/40 px-4 py-5 text-left">
              <Counter
                to={m.v}
                suffix={m.suffix}
                className="block font-heading text-3xl font-bold tracking-tight gradient-text sm:text-3xl"
              />
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {m.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

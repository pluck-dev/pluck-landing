"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { GlitchText } from "@/components/glitch-text";
import { Reveal } from "@/components/motion/reveal";
import { CharReveal } from "@/components/motion/char-reveal";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "정말 1인이 다 하나요? 품질이 괜찮나요?",
    a: "기획 · 디자인 · 풀스택 개발 · AI 자동화까지 한 명이 합니다. 5년간 30개 이상의 프로덕트를 라이브로 띄웠고, 324+개의 스펙 문서를 굴려왔습니다. 외주 핑퐁이 없으니 의사결정과 결과물이 더 단단합니다.",
  },
  {
    q: "어떤 규모의 프로젝트를 받나요?",
    a: "MVP 2~3개월짜리부터 6개월+ 풀스케일까지. Pre-Seed/Seed/Series A 스타트업과 가장 잘 맞습니다. 동시에 받는 프로젝트는 1~2개로 제한합니다.",
  },
  {
    q: "사용하는 기술 스택은요?",
    a: "Frontend: Next.js 14/15/16, React 19, TypeScript, Tailwind, shadcn, Framer Motion / Backend: NestJS, Node, Python, FastAPI, Supabase, Prisma, PostgreSQL / Mobile: React Native, Expo, Flutter / AI: Claude, OpenAI, MCP, LangChain.",
  },
  {
    q: "기획 문서는 어떻게 산출되나요?",
    a: "Obsidian + 21개 Templater 템플릿 기반으로 PRD · 화면설계서 · 기능명세서 · API 명세서 · 데이터 정의서 · RBAC 매트릭스를 자동 생성합니다. 문서 간 [[양방향 링크]] 자동 참조, 진행률 대시보드까지.",
  },
  {
    q: "AI 기능 도입도 가능한가요?",
    a: "사주 오케스트레이터(5-Stage LLM), Claude Planning Kit, Claude Video Kit, Pluck Orchestrator(Electron) 등 자체 AI 도구를 4개 운영 중. LLM 파이프라인, MCP 서버, RAG, 자동화까지 운영 가능한 형태로 만들어 드립니다.",
  },
  {
    q: "런칭 후에도 운영을 맡길 수 있나요?",
    a: "기본 패키지에 런칭 후 1개월 안정화가 포함됩니다. 이후엔 월 단위 리테이너 또는 장기 임베디드(EMBEDDED)로 전환합니다.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <Reveal className="mb-12">
          <div className="eyebrow mb-5">— 자주 묻는 질문</div>
          <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            <CharReveal text="궁금한 것들 " />
            <GlitchText className="inline-block">먼저</GlitchText>
          </h2>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                  ease: [0.21, 1.02, 0.73, 1],
                }}
                className={cn(
                  "overflow-hidden rounded-2xl glass transition-colors",
                  isOpen && "border-fuchsia-400/30 bg-white/[0.06]"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15.5px] font-semibold text-foreground sm:text-base">
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "inline-flex size-7 shrink-0 items-center justify-center rounded-full border",
                      isOpen
                        ? "border-fuchsia-400/40 bg-fuchsia-400/15 text-fuchsia-300"
                        : "border-white/10 bg-white/[0.04] text-muted-foreground"
                    )}
                  >
                    <Plus className="size-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.21, 1.02, 0.73, 1],
                      }}
                    >
                      <div className="body-copy px-5 pb-5 text-[14.5px]">
                        {f.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

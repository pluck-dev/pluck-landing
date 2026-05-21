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
    q: "어떤 규모의 회사와 일하나요?",
    a: "Pre-Seed부터 대기업까지 함께합니다. 다만 '왜 이걸 만드는가'에 답이 명확한 팀과 가장 좋은 결과가 나옵니다.",
  },
  {
    q: "최소 프로젝트 규모는 어떻게 되나요?",
    a: "SPRINT(2주, 9.9M)부터 시작할 수 있습니다. 짧은 검증 → 풀빌드로 자연스럽게 이어지는 경우가 많습니다.",
  },
  {
    q: "기존 디자이너/개발자 팀과 협업이 가능한가요?",
    a: "네. EMBEDDED 모델에서는 고객 팀과 매일 같이 일합니다. 코드 컨벤션 · 디자인 시스템 · OKR을 정합하는 방식으로요.",
  },
  {
    q: "사용하는 기술 스택은요?",
    a: "Next.js, React Native, TypeScript, Python, Go, AWS, Vercel, Supabase, OpenAI/Anthropic. 새 스택 도입도 가능합니다.",
  },
  {
    q: "AI 프로젝트도 가능한가요?",
    a: "LLM 기반 챗봇, RAG 검색, 추천, 자동화까지. 데모만이 아니라 운영까지 책임지는 형태로 진행합니다.",
  },
  {
    q: "런칭 이후에도 운영을 맡길 수 있나요?",
    a: "기본 BUILD 패키지에 런칭 후 1개월 안정화가 포함됩니다. 그 이후는 리테이너 또는 EMBEDDED로 전환합니다.",
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

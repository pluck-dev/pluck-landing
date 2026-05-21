"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/glitch-text";
import { FlyInCard } from "@/components/motion/fly-in-card";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { CharReveal } from "@/components/motion/char-reveal";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "SPRINT",
    price: "₩ 9.9M",
    sub: "2주 / 단발 검증",
    desc: "프로토타이핑 · UX 리서치 · 디자인 시스템 세팅 같은 짧고 깊은 작업.",
    features: [
      "디자이너 1 + PM 1",
      "Figma 결과물 인도",
      "최종 인사이트 리포트",
      "차주 미팅 1회",
    ],
    cta: "스프린트 시작하기",
    featured: false,
    from: "left" as const,
  },
  {
    name: "BUILD",
    price: "₩ 50M~",
    sub: "3개월 / MVP 풀빌드",
    desc: "0에서 1을 만드는 가장 일반적인 방식. 디자인부터 런칭까지.",
    features: [
      "디자이너 + 풀스택 + PM",
      "리서치 · 디자인 · 개발 · QA",
      "주간 데모 + Slack 채널",
      "런칭 후 1개월 안정화 포함",
      "분석 & 모니터링 셋업",
    ],
    cta: "빌드 상담받기",
    featured: true,
    from: "bottom" as const,
  },
  {
    name: "EMBEDDED",
    price: "맞춤형",
    sub: "장기 / 팀에 합류",
    desc: "고객 팀에 우리 팀이 들어가는 형태. 시리즈 B+ 기업에 적합.",
    features: [
      "전담 3~6명 풀타임",
      "고객 워크플로 통합",
      "쿼터별 OKR 정합",
      "고객 PM과 조인트 리뷰",
      "분기별 인사이트 워크숍",
    ],
    cta: "엠베디드 문의",
    featured: false,
    from: "right" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mb-14 max-w-2xl">
          <div className="eyebrow mb-5">— 참여 방식</div>
          <h2 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            <GlitchText className="inline-block">3가지</GlitchText>{" "}
            <span className="gradient-text">엔게이지먼트</span>{" "}
            <CharReveal text="모델" delay={0.15} />
          </h2>
          <p className="lead-copy mt-5">
            상황과 단계에 맞춰 고르세요. 사이에 있다면 함께 정의합니다.
          </p>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <FlyInCard key={p.name} index={i} from={p.from}>
              <SpotlightCard
                color={
                  p.featured
                    ? "oklch(0.78 0.22 305 / 0.32)"
                    : "oklch(0.85 0.18 200 / 0.18)"
                }
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-2",
                  p.featured
                    ? "glow-border bg-gradient-to-b from-fuchsia-500/15 via-background to-background scale-[1.02]"
                    : "glass"
                )}
              >
                {p.featured && (
                  <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-fuchsia-300">
                    <Star className="size-3 fill-current" />
                    Most picked
                  </div>
                )}

                <div className="font-mono text-xs uppercase tracking-[0.32em] text-muted-foreground">
                  {p.name}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span
                    className={cn(
                      "font-heading text-5xl font-bold tracking-tight",
                      p.featured && "gradient-text"
                    )}
                  >
                    {p.price}
                  </span>
                </div>
                <div className="mt-1.5 text-[13px] text-muted-foreground">
                  {p.sub}
                </div>

                <p className="body-copy mt-5 text-[14.5px]">{p.desc}</p>

                <ul className="mt-6 flex-1 space-y-3 text-[14.5px]">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                          p.featured
                            ? "bg-gradient-to-br from-fuchsia-400 to-cyan-400 text-black"
                            : "bg-white/[0.06] text-foreground"
                        )}
                      >
                        <Check className="size-3" />
                      </span>
                      <span className="text-foreground-soft">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Magnetic strength={0.2}>
                    <Button
                      asChild
                      size="lg"
                      className={cn(
                        "h-11 w-full rounded-full",
                        p.featured
                          ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-black shadow-[0_0_28px_oklch(0.78_0.22_305_/_0.5)] hover:opacity-90"
                          : "bg-white/[0.06] text-foreground hover:bg-white/[0.1]"
                      )}
                    >
                      <Link href="#contact">{p.cta}</Link>
                    </Button>
                  </Magnetic>
                </div>
              </SpotlightCard>
            </FlyInCard>
          ))}
        </div>
      </div>
    </section>
  );
}

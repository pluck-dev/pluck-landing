"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/glitch-text";
import { FlyInCard } from "@/components/motion/fly-in-card";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "기획 스프린트",
    price: "₩ 9.9M~",
    sub: "2주 / 범위와 방향 정리",
    desc: "아이디어는 있는데 무엇을 먼저 만들지 애매할 때. 사용자 흐름, 핵심 화면, 개발 범위를 빠르게 정리합니다.",
    features: [
      "문제 정의 + 사용자 시나리오",
      "핵심 화면 와이어프레임",
      "MVP 기능 범위와 우선순위",
      "개발 일정 · 예산 가이드",
    ],
    cta: "기획부터 상담하기",
    featured: false,
    from: "left" as const,
  },
  {
    name: "MVP 빌드",
    price: "₩ 50M~",
    sub: "8–12주 / 설계부터 런칭까지",
    desc: "검증할 제품을 실제로 출시해야 할 때. 디자인, 개발, QA, 배포까지 한 팀처럼 맡습니다.",
    features: [
      "제품 기획 + UI 디자인",
      "프론트엔드 · 백엔드 개발",
      "주간 데모와 의사결정 미팅",
      "배포 · QA · 기본 분석 셋업",
      "런칭 후 1개월 안정화",
    ],
    cta: "MVP 상담받기",
    featured: true,
    from: "bottom" as const,
  },
  {
    name: "운영 파트너",
    price: "맞춤 견적",
    sub: "3개월+ / 개선과 확장",
    desc: "이미 운영 중인 서비스의 기능 개선, 자동화, 실험, 유지보수가 필요할 때 월 단위로 함께합니다.",
    features: [
      "월별 개발·개선 백로그 운영",
      "기존 코드 진단과 리팩터링",
      "관리자·자동화·데이터 기능 추가",
      "정기 릴리즈와 성과 리뷰",
      "고객 팀 툴·프로세스에 맞춰 협업",
    ],
    cta: "운영 파트너 문의",
    featured: false,
    from: "right" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mb-14 max-w-2xl">
          <div className="eyebrow mb-5">— 협업 방식</div>
          <h2 className="font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            <GlitchText className="inline-block">필요한 만큼만</GlitchText>{" "}
            <span className="gradient-text">함께합니다.</span>
          </h2>
          <p className="lead-copy mt-5">
            아직 범위가 흐리면 기획부터, 출시가 목표면 MVP 빌드부터, 운영 중이면 월 단위 파트너로 시작하세요.
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
                    추천
                  </div>
                )}

                <div className="text-sm font-semibold text-muted-foreground">
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

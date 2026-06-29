"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

type KineticTextProps = {
  text: string;
  className?: string;
  /** 글자 단위 stagger 간격(초) */
  stagger?: number;
  /** 시작 지연(초) */
  delay?: number;
  /** 마운트 즉시 발동 (히어로용) */
  eager?: boolean;
  /** hover 시 글자가 튀어오르는 인터랙션 */
  interactive?: boolean;
  /** 등장 방향 */
  from?: "bottom" | "top";
  /** 글자별 네온 그라데이션 클리핑 (부모 gradient-text는 글자 분할 시 깨지므로 이걸 사용) */
  gradient?: boolean;
};

const SPRING = { type: "spring" as const, stiffness: 420, damping: 16, mass: 0.9 };

/**
 * KineticText — 글자 단위 spring bounce 등장 + hover wobble.
 * Savee의 "Bouncy / Letter Grid" 모션 템플릿 감각을 한국어/영문 모두에 적용한다.
 * 단어 단위로 묶어 줄바꿈이 자연스럽게 일어난다.
 */
export function KineticText({
  text,
  className,
  stagger = 0.035,
  delay = 0,
  eager = false,
  interactive = true,
  from = "bottom",
  gradient = false,
}: KineticTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const active = eager || inView;

  const words = text.split(" ");
  const dy = from === "bottom" ? "0.9em" : "-0.9em";
  let charIndex = -1;

  return (
    <span
      ref={ref}
      aria-label={text}
      className={cn("inline-flex flex-wrap", className)}
    >
      {words.map((word, wi) => (
        <span
          key={`${word}-${wi}`}
          aria-hidden
          className="inline-flex whitespace-nowrap"
        >
          {Array.from(word).map((char, ci) => {
            charIndex += 1;
            const i = charIndex;
            return (
              <motion.span
                key={`${char}-${ci}`}
                className={cn(
                  "inline-block will-change-transform",
                  gradient && "kinetic-grad"
                )}
                initial={{ y: dy, opacity: 0, rotate: from === "bottom" ? 6 : -6 }}
                animate={
                  active
                    ? { y: 0, opacity: 1, rotate: 0 }
                    : { y: dy, opacity: 0, rotate: from === "bottom" ? 6 : -6 }
                }
                transition={{ ...SPRING, delay: delay + i * stagger }}
                {...(interactive
                  ? {
                      whileHover: {
                        y: -10,
                        scale: 1.12,
                        transition: { type: "spring", stiffness: 600, damping: 12 },
                      },
                    }
                  : {})}
              >
                {char}
              </motion.span>
            );
          })}
          {/* 단어 사이 공백 — stagger 카운트에서 제외 */}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

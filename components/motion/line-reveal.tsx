"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * LineReveal — 텍스트 라인 마스크 슬라이드업.
 *  eager=true 면 마운트 즉시 발동 (히어로용),
 *  기본은 viewport 진입 시 발동.
 */
type LineRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  sweep?: boolean;
  /** 마운트 즉시 발동 — 히어로/접힘 위 텍스트 */
  eager?: boolean;
};

export function LineReveal({
  children,
  className,
  delay = 0,
  sweep = true,
  eager = false,
}: LineRevealProps) {
  const inMotion = { y: "0%", opacity: 1 };
  const sweepIn = { x: "110%", opacity: 1 };

  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden align-bottom",
        className
      )}
    >
      <motion.span
        initial={{ y: "105%", opacity: 0 }}
        {...(eager
          ? { animate: inMotion }
          : { whileInView: inMotion, viewport: { once: true, amount: 0.1 } })}
        transition={{
          y: { duration: 1.25, delay, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] },
        }}
        className="inline-block"
      >
        {children}
      </motion.span>
      {sweep && (
        <motion.span
          aria-hidden
          initial={{ x: "-100%" }}
          {...(eager
            ? { animate: { x: "110%" } }
            : {
                whileInView: { x: "110%" },
                viewport: { once: true, amount: 0.1 },
              })}
          transition={{
            duration: 1.4,
            delay: delay + 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400/30 to-transparent mix-blend-overlay"
        />
      )}
    </span>
  );
}

/**
 * 멀티라인 — 여러 줄을 차례로 reveal
 */
export function MultiLineReveal({
  lines,
  className,
  baseDelay = 0,
  step = 0.18,
  eager = false,
}: {
  lines: ReactNode[];
  className?: string;
  baseDelay?: number;
  step?: number;
  eager?: boolean;
}) {
  return (
    <span className={cn("inline-block", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          <LineReveal
            delay={baseDelay + i * step}
            sweep={i === 0}
            eager={eager}
          >
            {line}
          </LineReveal>
        </span>
      ))}
    </span>
  );
}

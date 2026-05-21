"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type CRTRevealProps = {
  children: ReactNode;
  className?: string;
  scanlines?: boolean;
  flicker?: boolean;
};

/**
 * 컨테이너에 브라운관 켜짐 효과를 입힌다.
 *  - 외곽 div는 aspect/rounded/overflow 등 사용처 className을 받음
 *  - 내부 motion.div가 absolute inset-0으로 컨텐츠를 풀로 채워서
 *    자식(absolute video, 그라데이션 오버레이 등)이 정상 위치하도록 함.
 *  - scale 키프레임으로 점→가로선→풀화면 시퀀스.
 */
export function CRTReveal({
  children,
  className,
  scanlines = true,
  flicker = true,
}: CRTRevealProps) {
  return (
    <div className={cn("relative isolate", className)}>
      <motion.div
        initial={{
          scaleY: 0.005,
          scaleX: 0.4,
          opacity: 0,
        }}
        whileInView={{
          scaleY: [0.005, 0.005, 1, 1, 1],
          scaleX: [0.4, 1, 1, 1, 1],
          opacity: [0, 1, 1, 1, 1],
        }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 1.6,
          times: [0, 0.22, 0.62, 0.86, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: "center" }}
        className="absolute inset-0"
      >
        {/* 본체 — 자식 absolute 요소들이 들어옴 */}
        <motion.div
          className="absolute inset-0"
          animate={
            flicker
              ? {
                  opacity: [1, 0.985, 1, 0.97, 1],
                }
              : undefined
          }
          transition={
            flicker
              ? {
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.8,
                }
              : undefined
          }
        >
          {children}
        </motion.div>

        {/* 켜질 때 가운데 흰색 가로선 (라인 펼침 직후 사라짐) */}
        <motion.span
          aria-hidden
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{
            opacity: [0, 1, 1, 0, 0],
            scaleX: [0, 1, 1, 1, 1],
          }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1.6,
            times: [0, 0.22, 0.5, 0.72, 1],
            ease: "easeOut",
          }}
          style={{ transformOrigin: "center" }}
          className="pointer-events-none absolute left-0 right-0 top-1/2 z-30 h-[2px] -translate-y-1/2 bg-white shadow-[0_0_28px_8px_oklch(0.99_0.005_280_/_0.85)]"
        />

        {/* scanlines */}
        {scanlines && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
            style={{
              background:
                "repeating-linear-gradient(0deg, oklch(0 0 0 / 0.22) 0px, oklch(0 0 0 / 0.22) 1px, transparent 1px, transparent 3px)",
            }}
          />
        )}

        {/* 비네팅 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            boxShadow:
              "inset 0 0 80px 10px oklch(0 0 0 / 0.4), inset 0 0 20px oklch(0 0 0 / 0.2)",
          }}
        />
      </motion.div>
    </div>
  );
}

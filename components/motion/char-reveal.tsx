"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type CharRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  /** 각 글자가 다양한 방향에서 들어오는 효과 */
  scatter?: boolean;
  /** 마운트 즉시 발동 (히어로용) */
  eager?: boolean;
};

/**
 * CharReveal — 글자 단위 등장.
 * scatter=true면 4방향에서 살짝씩 들어오는 부드러운 비산.
 */
export function CharReveal({
  text,
  className,
  delay = 0,
  scatter = true,
  eager = false,
}: CharRevealProps) {
  const chars = Array.from(text);

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      {...(eager
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, amount: 0.1 } })}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.045,
            delayChildren: delay,
          },
        },
      }}
      aria-label={text}
    >
      {chars.map((c, i) => {
        const dir = scatter ? i % 4 : 0;
        const offsets: Record<
          number,
          { x: number; y: number; r: number }
        > = {
          0: { x: 0, y: 22, r: -2 },
          1: { x: -16, y: 12, r: 3 },
          2: { x: 16, y: -10, r: -3 },
          3: { x: 0, y: -22, r: 2 },
        };
        const off = offsets[dir];
        return (
          <motion.span
            key={`${c}-${i}`}
            aria-hidden
            className="inline-block whitespace-pre"
            variants={{
              hidden: {
                opacity: 0,
                x: off.x,
                y: off.y,
                rotate: off.r,
                filter: "blur(8px)",
              },
              show: {
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 0,
                filter: "blur(0px)",
                transition: {
                  opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                  x: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                  rotate: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
                  filter: { duration: 0.9, ease: "easeOut" },
                },
              },
            }}
          >
            {c === " " ? " " : c}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

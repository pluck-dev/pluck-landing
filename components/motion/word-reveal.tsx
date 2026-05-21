"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type WordRevealProps = {
  text: string;
  className?: string;
  delay?: number;
};

/**
 * WordReveal — 단어 단위로 천천히 페이드/슬라이드 인.
 */
export function WordReveal({ text, className, delay = 0 }: WordRevealProps) {
  const words = text.split(" ");
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.09, delayChildren: delay },
        },
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block whitespace-pre"
          variants={{
            hidden: { opacity: 0, y: "30%", filter: "blur(6px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                opacity: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
                filter: { duration: 0.8, ease: "easeOut" },
              },
            },
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

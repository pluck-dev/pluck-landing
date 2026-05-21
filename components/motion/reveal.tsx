"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

/**
 * 부드러운 페이드 등장 — opacity 중심, 살짝의 y 이동,
 * 길고 자연스러운 ease.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount: 0.25 }}
      transition={{
        opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.9, ease: "easeOut" },
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
};

export function Stagger({
  children,
  className,
  stagger = 0.12,
  once = true,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 12,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: "blur(6px)" },
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
      {children}
    </motion.div>
  );
}

/**
 * 본문/캡션처럼 강한 모션이 어울리지 않는 곳에 쓰는 가장 부드러운 페이드.
 * y 이동 거의 없음, opacity만 매우 천천히.
 */
export function SoftFade({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 1.4,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

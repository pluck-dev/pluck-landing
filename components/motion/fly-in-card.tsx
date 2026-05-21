"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type FlyInCardProps = {
  children: ReactNode;
  className?: string;
  index?: number;
  from?: "left" | "right" | "bottom" | "top" | "scatter";
};

const directions: Record<
  NonNullable<FlyInCardProps["from"]>,
  (i: number) => { x: number; y: number; rotate: number; scale: number }
> = {
  left: () => ({ x: -160, y: 30, rotate: -8, scale: 0.85 }),
  right: () => ({ x: 160, y: 30, rotate: 8, scale: 0.85 }),
  top: () => ({ x: 0, y: -140, rotate: -4, scale: 0.9 }),
  bottom: () => ({ x: 0, y: 120, rotate: 4, scale: 0.9 }),
  scatter: (i) => {
    const presets = [
      { x: -180, y: 60, rotate: -12, scale: 0.8 },
      { x: 180, y: 80, rotate: 14, scale: 0.8 },
      { x: 0, y: 160, rotate: -6, scale: 0.85 },
      { x: -120, y: -90, rotate: 10, scale: 0.85 },
      { x: 140, y: -60, rotate: -10, scale: 0.85 },
      { x: -60, y: 130, rotate: 6, scale: 0.85 },
    ];
    return presets[i % presets.length];
  },
};

export function FlyInCard({
  children,
  className,
  index = 0,
  from = "scatter",
}: FlyInCardProps) {
  const start = directions[from](index);
  return (
    <motion.div
      initial={{
        opacity: 0,
        filter: "blur(14px)",
        ...start,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 18,
        mass: 0.9,
        delay: index * 0.06,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

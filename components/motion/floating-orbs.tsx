"use client";

import { motion } from "motion/react";

const ORBS = [
  {
    size: 380,
    color: "oklch(0.78 0.22 305 / 0.35)",
    left: "8%",
    top: "12%",
    duration: 14,
  },
  {
    size: 320,
    color: "oklch(0.85 0.18 200 / 0.3)",
    left: "78%",
    top: "30%",
    duration: 17,
  },
  {
    size: 280,
    color: "oklch(0.78 0.24 340 / 0.32)",
    left: "55%",
    top: "70%",
    duration: 20,
  },
];

export function FloatingOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {ORBS.map((o, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0 }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: o.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: o.size,
            height: o.size,
            left: o.left,
            top: o.top,
            backgroundColor: o.color,
          }}
          className="absolute rounded-full blur-[100px]"
        />
      ))}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { CharReveal } from "@/components/motion/char-reveal";

export function BigStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const blur = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["blur(14px)", "blur(0px)", "blur(14px)"]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-5 py-24 sm:px-6 sm:py-32"
    >
      <motion.div
        style={{ filter: blur, scale, opacity }}
        className="relative z-10 text-center"
      >
        <div className="eyebrow">— 우리의 약속</div>
        <h3 className="mt-5 font-heading text-[2.4rem] font-black leading-[1.0] tracking-tighter sm:text-7xl md:text-[7.5rem]">
          <span className="block gradient-text">
            <CharReveal text="CRAFT." />
          </span>
          <span className="block">
            <span
              className="text-transparent"
              style={{
                WebkitTextStroke: "1.5px oklch(0.78 0.22 305 / 0.85)",
              }}
            >
              <CharReveal text="SHIP." delay={0.15} />
            </span>
          </span>
          <span className="block">
            <span data-text="REPEAT." className="glitch gradient-text">
              <CharReveal text="REPEAT." delay={0.3} />
            </span>
          </span>
        </h3>
        <p className="lead-copy mx-auto mt-6 max-w-xl">
          잘 만들고, 빨리 띄우고, 다시 잘 만든다. 우리가 8년간 멈추지 않은
          이유.
        </p>
      </motion.div>

      <motion.span
        aria-hidden
        style={{
          y: useTransform(scrollYProgress, [0, 1], [80, -80]),
          opacity: useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [0.05, 0.1, 0.04]
          ),
        }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-heading text-[10rem] font-black leading-none tracking-tighter text-white sm:text-[18rem] md:text-[24rem]"
      >
        P
      </motion.span>
    </section>
  );
}

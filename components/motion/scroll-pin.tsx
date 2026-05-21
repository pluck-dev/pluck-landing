"use client";

import { ReactNode, useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

type ScrollPinProps = {
  children: (progress: MotionValue<number>) => ReactNode;
  /** 전체 높이 (예: "300vh") — sticky 영역 길이 결정 */
  height?: string;
  className?: string;
};

export function ScrollPin({
  children,
  height = "260vh",
  className,
}: ScrollPinProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} style={{ height }} className={cn("relative", className)}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {children(scrollYProgress)}
      </div>
    </div>
  );
}

export { motion, useTransform };
export type { MotionValue };

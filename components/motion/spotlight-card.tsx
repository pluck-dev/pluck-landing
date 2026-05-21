"use client";

import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /** 스포트라이트 색상 (oklch 권장) */
  color?: string;
};

export function SpotlightCard({
  children,
  className,
  color = "oklch(0.78 0.22 305 / 0.22)",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handle = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handle}
      style={{
        // 기본 위치 (호버 전엔 중앙)
        ["--mx" as string]: "50%",
        ["--my" as string]: "50%",
        ["--spot" as string]: color,
      }}
      className={cn("group relative overflow-hidden", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--mx) var(--my), var(--spot), transparent 55%)",
        }}
      />
      {children}
    </div>
  );
}

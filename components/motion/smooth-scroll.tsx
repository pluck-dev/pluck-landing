"use client";

import { ReactNode, useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

/**
 * SmoothScroll — Lenis 관성(momentum) 스크롤 프로바이더.
 * Savee 템플릿류의 "버터처럼 흐르는" 스크롤 감각을 사이트 전역에 적용한다.
 * 접근성: prefers-reduced-motion 사용자는 네이티브 스크롤로 우회한다.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        // 살짝 묵직하면서도 따라붙는 감각 — 너무 둥둥 뜨지 않게 절제
        lerp: 0.09,
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      }}
    >
      {children}
    </ReactLenis>
  );
}

"use client";

import { useEffect, useRef } from "react";

/**
 * Server-rendered final value; counts up from 0 once on first view.
 * Reduced motion keeps the static number.
 */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    // Already on screen at mount: leave it alone instead of flashing 0.
    if (el.getBoundingClientRect().top < innerHeight) return;
    let raf = 0;
    el.textContent = "0";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1400);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = String(Math.round(value * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = String(value);
    };
  }, [value]);

  return (
    <span ref={ref} className="count-up">
      {value}
    </span>
  );
}

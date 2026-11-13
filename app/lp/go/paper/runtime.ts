"use client";

/**
 * Small runtime pieces shared by the /lp/go moments: lazy start near the viewport, reduced-motion
 * check and a rAF loop that sleeps when nothing moves. Scenes stay pure (render(t)); this only moves t.
 */

/** Runs `start` once when `el` comes within `margin` of the viewport. Returns a disposer. */
export function whenNear(el: Element, start: () => void, margin = "600px 0px") {
  if (!("IntersectionObserver" in window)) {
    start();
    return () => {};
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      start();
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => io.disconnect();
}

export const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** rAF loop: `tick(dt, now)` returns true while it still needs frames; `wake()` restarts it. */
export class Loop {
  private raf = 0;
  private last = 0;
  constructor(private tick: (dt: number, now: number) => boolean) {}

  wake() {
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame = (now: number) => {
    this.raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    if (this.tick(dt, now)) this.raf = requestAnimationFrame(this.frame);
  };
}

/** Font the canvases print with: the page's own (Noto Sans KR via the site font stack). */
export const pageFont = () => getComputedStyle(document.body).fontFamily;

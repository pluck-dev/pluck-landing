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

/** The page font (go.css @font-face). Canvas text names it first so the paper moments print in it too. */
export const PAPER_FONT = "Paperlogy";
const PAPER_WEIGHTS = [400, 600, 700, 800];

/** Font stack the canvases print with: Paperlogy, then the site stack for anything it lacks. */
export const pageFont = () => `"${PAPER_FONT}", ${getComputedStyle(document.body).fontFamily}`;

let fontReady: Promise<void> | null = null;
/**
 * Resolves once every Paperlogy weight the canvases use is loaded (or after `timeout`, so a slow network
 * still gets its moment, in the fallback font). Canvas text is baked once, so bake after this.
 * Sample text is Latin on purpose: Hangul would also match the -ext faces' unicode-range and fetch them.
 */
export function paperFontReady(timeout = 3000): Promise<void> {
  if (!fontReady) {
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    const load = fonts
      ? Promise.all(PAPER_WEIGHTS.map((w) => fonts.load(`${w} 16px "${PAPER_FONT}"`, "PLK56"))).then(
          () => undefined,
          () => undefined,
        )
      : Promise.resolve();
    fontReady = Promise.race([load, new Promise<void>((done) => window.setTimeout(done, timeout))]);
  }
  return fontReady;
}

/** True when Paperlogy is already usable (then there is nothing to wait for). */
export const paperFontLoaded = () =>
  typeof document !== "undefined" && Boolean(document.fonts?.check(`800 16px "${PAPER_FONT}"`, "PLK"));

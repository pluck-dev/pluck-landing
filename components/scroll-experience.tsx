"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keep native scrolling; only decorative layers receive per-frame transforms. */
export function ScrollExperience({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia(
      "(min-width: 901px) and (min-height: 741px)",
    );
    const scenes = [...element.querySelectorAll<HTMLElement>("[data-scene]")];
    let frame = 0;

    const update = () => {
      frame = 0;
      if (preference.matches || !desktop.matches) return;
      // Read all geometry before writing styles to avoid repeated layout work.
      const values = scenes.map((scene) => {
        const rect = scene.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)),
        );
        return { scene, progress };
      });
      values.forEach(({ scene, progress }) =>
        scene.style.setProperty("--progress", progress.toFixed(4)),
      );
    };
    const schedule = () => {
      if (!frame && !preference.matches && desktop.matches)
        frame = requestAnimationFrame(update);
    };
    const configure = () => {
      element.dataset.motion = String(!preference.matches && desktop.matches);
      scenes.forEach((scene) => scene.style.removeProperty("--progress"));
      schedule();
    };
    configure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", configure);
    preference.addEventListener("change", configure);
    desktop.addEventListener("change", configure);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", configure);
      preference.removeEventListener("change", configure);
      desktop.removeEventListener("change", configure);
      delete element.dataset.motion;
      scenes.forEach((scene) => scene.style.removeProperty("--progress"));
    };
  }, []);

  return (
    <div ref={root} className="scroll-experience">
      {children}
    </div>
  );
}

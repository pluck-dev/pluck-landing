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
        const progress =
          scene.dataset.scene === "hero"
            ? Math.max(
                0,
                Math.min(
                  1,
                  (80 - rect.top) / Math.max(1, rect.height - innerHeight + 80),
                ),
              )
            : Math.max(
                0,
                Math.min(
                  1,
                  (innerHeight - rect.top) / (innerHeight + rect.height),
                ),
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

export function PluckSculpture() {
  return (
    <div className="sculpture" aria-hidden="true">
      <div className="sculpture-orbit" />
      <div className="sculpture-object">
        <svg viewBox="0 0 480 550" fill="none">
          <defs>
            <linearGradient
              id="metal-face"
              x1="80"
              y1="40"
              x2="430"
              y2="470"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f9fbff" />
              <stop offset=".28" stopColor="#c6d0df" />
              <stop offset=".5" stopColor="#718198" />
              <stop offset=".67" stopColor="#eef3fa" />
              <stop offset="1" stopColor="#9cabbf" />
            </linearGradient>
            <linearGradient
              id="metal-edge"
              x1="90"
              y1="90"
              x2="400"
              y2="500"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#e4eaf1" />
              <stop offset=".5" stopColor="#536680" />
              <stop offset="1" stopColor="#18273e" />
            </linearGradient>
          </defs>
          {Array.from({ length: 12 }, (_, index) => (
            <path
              key={index}
              transform={`translate(${(12 - index) * 4} ${(12 - index) * 3})`}
              fill="url(#metal-edge)"
              stroke="#64738b"
              strokeWidth=".65"
              fillRule="evenodd"
              d="M80 60H255C360 60 410 111 410 207C410 305 352 353 255 353H180V480H80V60ZM180 155V260H248C288 260 309 242 309 207C309 173 288 155 248 155H180Z"
            />
          ))}
          <path
            fill="url(#metal-face)"
            stroke="#f4f7ff"
            strokeWidth="1.5"
            fillRule="evenodd"
            d="M80 60H255C360 60 410 111 410 207C410 305 352 353 255 353H180V480H80V60ZM180 155V260H248C288 260 309 242 309 207C309 173 288 155 248 155H180Z"
          />
        </svg>
      </div>
      <span className="sculpture-coordinate">
        P / 001
        <br />
        IDEAS INTO FORM
      </span>
    </div>
  );
}

"use client";

import { useEffect } from "react";

/**
 * Draws the hand marks on each annotated screenshot once, when it is mostly on screen.
 * go.css only hides the strokes under (prefers-reduced-motion: no-preference) and (scripting: enabled).
 */
export function GoDraw() {
  useEffect(() => {
    const figures = Array.from(document.querySelectorAll<HTMLElement>("[data-draw]"));
    if (!("IntersectionObserver" in window)) {
      figures.forEach((figure) => figure.classList.add("is-drawn"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-drawn");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.4 },
    );
    figures.forEach((figure) => observer.observe(figure));
    return () => observer.disconnect();
  }, []);

  return null;
}

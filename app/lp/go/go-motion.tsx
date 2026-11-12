"use client";

import { useEffect } from "react";
import { animate, inView } from "motion";

/**
 * Scroll motion for /lp/go. CSS does the drawing (transform/opacity only); this only flips state:
 * - [data-reveal] gets .is-in once it scrolls into view (go.css hides start states only under
 *   @media (prefers-reduced-motion: no-preference) and (scripting: enabled))
 * - [data-count] counts up from 0 to its server-rendered value
 * - [data-depth] hero layers drift with scroll (parallax) while the hero is on screen
 */
export function GoMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stops: (() => void)[] = [];

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      stops.push(
        inView(
          el,
          () => {
            el.classList.add("is-in");
          },
          { margin: "0px 0px -12% 0px" },
        ),
      );
    });

    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target)) return;
      el.textContent = "0";
      stops.push(
        inView(
          el,
          () => {
            const control = animate(0, target, {
              duration: 2.2,
              ease: "easeOut",
              onUpdate: (value) => {
                el.textContent = String(Math.round(value));
              },
            });
            return () => control.stop();
          },
          { amount: 0.6 },
        ),
      );
    });

    const hero = document.querySelector<HTMLElement>(".go-hero");
    const layers = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
    if (hero && layers.length) {
      let frame = 0;
      const update = () => {
        frame = 0;
        const y = Math.min(window.scrollY, hero.offsetHeight);
        for (const layer of layers) {
          layer.style.transform = `translate3d(0, ${(y * Number(layer.dataset.depth)).toFixed(1)}px, 0)`;
        }
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      stops.push(() => {
        window.removeEventListener("scroll", onScroll);
        if (frame) cancelAnimationFrame(frame);
      });
    }

    return () => stops.forEach((stop) => stop());
  }, []);

  return null;
}

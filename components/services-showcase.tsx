"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

export type ServiceShowcaseItem = {
  id: string;
  title: string;
  lead: string;
  description: string;
  deliverables: readonly string[];
  example: {
    href: string;
    name: string;
    src: string;
    alt: string;
    /** "실제 … 화면입니다" line under the frame. */
    caption: string;
    /** What this project shows about the service (facts from lib/portfolio.ts only). */
    point: string;
  };
};

/** Same string for the stage and the inline (reduced-motion) image so both share one srcset URL. */
const SHOT_SIZES = "(max-width: 960px) calc(100vw - 40px), 760px";

/**
 * Services as a scroll-linked step list (기획 → 디자인 → 개발 → AI 자동화).
 * Native scrolling only: the step crossing a reading line becomes active and the
 * sticky stage shows that service's real project screen. Desktop: stage sticks on
 * the right. ≤960px: stage sticks under the header and steps scroll beneath it.
 * prefers-reduced-motion: no stage, every step shows its own screen inline (CSS).
 */
export function ServicesShowcase({ items }: { items: readonly ServiceShowcaseItem[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const steps = [...element.querySelectorAll<HTMLElement>("[data-step]")];
    const figures = [...element.querySelectorAll<HTMLElement>("[data-figure]")];
    const stage = element.querySelector<HTMLElement>(".svc-stage");
    const header = document.querySelector<HTMLElement>(".site-header");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 960px)");
    let frame = 0;
    let current = -1;

    const activate = (index: number) => {
      if (index === current) return;
      current = index;
      steps.forEach((step, i) => step.toggleAttribute("data-on", i === index));
      figures.forEach((figure, i) => figure.toggleAttribute("data-on", i === index));
    };

    const update = () => {
      frame = 0;
      if (reduce.matches || !stage) return;
      let line = innerHeight * 0.55;
      if (narrow.matches) {
        const bottom = stage.getBoundingClientRect().bottom;
        line = bottom + (innerHeight - bottom) * 0.3;
      }
      let index = 0;
      steps.forEach((step, i) => {
        if (step.getBoundingClientRect().top <= line) index = i;
      });
      activate(index);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const configure = () => {
      element.style.setProperty("--svc-top", `${header?.offsetHeight ?? 80}px`);
      if (reduce.matches) {
        delete element.dataset.live;
        current = -1;
        steps.forEach((step) => step.removeAttribute("data-on"));
        figures.forEach((figure, i) => figure.toggleAttribute("data-on", i === 0));
        return;
      }
      element.dataset.live = "true";
      schedule();
    };
    // Keyboard users reach links in dimmed steps: follow focus.
    const onFocus = (event: FocusEvent) => {
      if (reduce.matches) return;
      const step = (event.target as HTMLElement).closest<HTMLElement>("[data-step]");
      if (step) activate(steps.indexOf(step));
    };

    configure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", configure);
    reduce.addEventListener("change", configure);
    element.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", configure);
      reduce.removeEventListener("change", configure);
      element.removeEventListener("focusin", onFocus);
      delete element.dataset.live;
    };
  }, []);

  return (
    <div className="svc" ref={root}>
      <div className="svc-stage">
        {items.map((item, i) => (
          <figure
            className="svc-figure"
            data-figure
            data-on={i === 0 ? "" : undefined}
            key={item.id}
          >
            <Link
              className="svc-frame"
              href={item.example.href}
              tabIndex={-1}
              aria-label={`${item.example.name} 적용 사례 보기`}
            >
              <Image
                src={item.example.src}
                alt={item.example.alt}
                fill
                sizes={SHOT_SIZES}
              />
            </Link>
            <figcaption className="svc-caption">
              <span className="svc-caption-text">
                <small>{item.example.caption}</small>
                <strong>{item.example.name}</strong>
              </span>
              <Link
                className="svc-caption-link"
                href={item.example.href}
                tabIndex={-1}
              >
                적용 사례 보기
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </figcaption>
          </figure>
        ))}
      </div>

      <ol className="svc-steps">
        {items.map((item) => (
          <li className="svc-step" data-step key={item.id}>
            <div className="svc-step-text">
              <h3>{item.title}</h3>
              <p className="svc-lead">{item.lead}</p>
              <p className="svc-desc">{item.description}</p>
              <ul className="chip-list" aria-label={`${item.title} 결과물`}>
                {item.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
              <Link className="svc-link" href={item.example.href}>
                <span>
                  <small>적용 사례</small>
                  <strong>{item.example.name}</strong>
                  <em>{item.example.point}</em>
                </span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </div>
            <figure className="svc-shot">
              <span className="svc-shot-frame">
                <Image
                  src={item.example.src}
                  alt={item.example.alt}
                  fill
                  sizes={SHOT_SIZES}
                />
              </span>
              <figcaption>{item.example.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </div>
  );
}

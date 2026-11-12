"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const TABS = [
  { id: "intro", label: "소개" },
  { id: "work", label: "작업물" },
  { id: "faq", label: "FAQ" },
] as const;

/** Sticky tab bar under the hero; the last tab section whose top has passed 40% of the viewport is active. */
export function GoTabs() {
  const [active, setActive] = useState<string>(TABS[0].id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string = TABS[0].id;
      for (const tab of TABS) {
        const section = document.getElementById(tab.id);
        if (section && section.getBoundingClientRect().top <= line) current = tab.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav className="go-tabs" aria-label="페이지 안 이동">
      {TABS.map((tab) => (
        <a key={tab.id} href={`#${tab.id}`} aria-current={active === tab.id ? "true" : undefined}>
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

/** Bottom offer bar. Slides away while the quiz/form is on screen so it never covers the submit button. */
export function GoBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const quiz = document.getElementById("quiz");
    if (!quiz || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      rootMargin: "0px 0px -30% 0px",
    });
    observer.observe(quiz);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="go-bar" data-hidden={hidden ? "" : undefined} aria-hidden={hidden || undefined}>
      <p className="go-bar-offer">
        <strong>상담·견적 무료</strong>
        <span>기획안 초안까지</span>
      </p>
      <a className="go-bar-cta" href="#quiz" tabIndex={hidden ? -1 : undefined}>
        30초 견적 <ArrowRight size={18} aria-hidden="true" />
      </a>
    </div>
  );
}

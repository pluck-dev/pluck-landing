"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Mobile-only bottom bar. Shows once the hero buttons scroll away and hides again
 * while the form section is on screen, so it never covers the submit button.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("lp-hero-cta");
    const form = document.getElementById("apply");
    if (!hero || !form || !("IntersectionObserver" in window)) return;
    let heroVisible = true;
    let formVisible = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === form) formVisible = entry.isIntersecting;
      }
      setVisible(!heroVisible && !formVisible);
    });
    observer.observe(hero);
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-sticky" data-visible={visible ? "" : undefined}>
      <a
        className="button button-primary"
        href="#apply"
        tabIndex={visible ? undefined : -1}
        aria-hidden={visible ? undefined : true}
      >
        무료 기획안·견적 받기 <ArrowRight size={18} aria-hidden="true" />
      </a>
    </div>
  );
}

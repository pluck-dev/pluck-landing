"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import type { PluckScene } from "@/lib/pluck-scene";

type Props = { contactHref: string };

/**
 * Full-bleed WebGL hero. The copy is real DOM and renders first; three.js is
 * imported after first paint/idle so it never blocks LCP. A still render of
 * the symbol (poster) covers the gap and is the fallback for reduced motion
 * or missing WebGL (`data-state="fallback"` collapses the scroll track).
 *
 * One number drives everything: p = how far the pinned track has scrolled.
 * JS writes it to the scene and to `--p` on the section; CSS derives the copy
 * fade and the logo-moment caption from it.
 */
export function Hero3D({ contactHref }: Props) {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = root.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const stage = section.querySelector<HTMLElement>(".hero3d-stage")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || new URLSearchParams(location.search).has("nofx")) {
      section.dataset.state = "fallback";
      return;
    }

    let scene: PluckScene | null = null;
    let disposed = false;
    let visible = true;
    let scrollRaf = 0;
    let idle = 0;

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const span = Math.max(1, section.offsetHeight - stage.offsetHeight);
      // sticky top (= header height) is where the pin starts
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      return Math.min(1, Math.max(0, (top - rect.top) / span));
    };
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const p = progress();
        section.style.setProperty("--p", p.toFixed(4));
        section.dataset.phase = p > 0.22 ? "logo" : "intro";
        scene?.setProgress(p);
      });
    };
    const onPointer = (e: PointerEvent) => {
      if (!scene || e.pointerType === "touch") return;
      const r = stage.getBoundingClientRect();
      const inside =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      scene.setPointer(e.clientX, e.clientY, inside);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (scene && t) scene.setPointer(t.clientX, t.clientY, true);
    };
    const onTouchEnd = () => scene?.setPointer(0, 0, false);
    const onLeave = () => scene?.setPointer(0, 0, false);
    const sync = () => {
      if (!scene) return;
      if (visible && !document.hidden) scene.start();
      else scene.stop();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    // Union of the copy's visible parts, so the swarm keeps clear of the text.
    const copyRect = () => {
      const parts = [...section.querySelectorAll<HTMLElement>(".hero3d-copy > *")];
      if (!parts.length) return null;
      const rs = parts.map((el) => el.getBoundingClientRect());
      return {
        left: Math.min(...rs.map((r) => r.left)),
        right: Math.max(...rs.map((r) => r.right)),
        top: Math.min(...rs.map((r) => r.top)),
        bottom: Math.max(...rs.map((r) => r.bottom)),
      };
    };
    // sticky top = real header height (CSS default 81px / 105px mobile)
    const measureHead = () => {
      const header = document.querySelector<HTMLElement>(".site-header");
      if (header) section.style.setProperty("--head", `${header.offsetHeight}px`);
    };
    measureHead();
    const ro = new ResizeObserver(() => {
      measureHead();
      scene?.resize();
      scene?.setCopyRect(copyRect());
      onScroll();
    });

    const boot = async () => {
      try {
        const { createPluckScene } = await import("@/lib/pluck-scene");
        if (disposed) return;
        const mobile = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
        scene = createPluckScene(canvas, { mobile });
        scene.setProgress(progress());
        scene.setCopyRect(copyRect());
        io.observe(section);
        ro.observe(canvas);
        sync();
        await scene.ready;
        if (!disposed) section.dataset.state = "live";
      } catch {
        // No WebGL (or context creation failed): keep the still poster.
        section.dataset.state = "fallback";
        scene?.dispose();
        scene = null;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    stage.addEventListener("touchstart", onTouch, { passive: true });
    stage.addEventListener("touchmove", onTouch, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("visibilitychange", sync);
    // After first paint + idle, so the DOM headline is the LCP.
    const kick = () => {
      if ("requestIdleCallback" in window) idle = requestIdleCallback(() => void boot(), { timeout: 1200 });
      else idle = globalThis.setTimeout(() => void boot(), 200) as unknown as number;
    };
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });

    return () => {
      disposed = true;
      if ("cancelIdleCallback" in window) cancelIdleCallback(idle);
      clearTimeout(idle);
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener("load", kick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("touchstart", onTouch);
      stage.removeEventListener("touchmove", onTouch);
      stage.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("visibilitychange", sync);
      io.disconnect();
      ro.disconnect();
      scene?.dispose();
      delete section.dataset.state;
      delete section.dataset.phase;
      section.style.removeProperty("--p");
      section.style.removeProperty("--head");
    };
  }, []);

  return (
    <section ref={root} className="hero3d" aria-labelledby="hero-title">
      <div className="hero3d-stage">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative poster, swapped for WebGL */}
        <img
          className="hero3d-poster"
          src="/brand/pluck-symbol-3d.webp"
          alt=""
          aria-hidden="true"
          width={1200}
          height={1200}
          decoding="async"
        />
        <canvas ref={canvasRef} className="hero3d-canvas" aria-hidden="true" />
        <div className="shell hero3d-copy">
          <h1 id="hero-title" className="hero3d-title">
            <span>아이디어를 뽑아,</span> <span className="hero3d-accent">제품으로.</span>
          </h1>
          <p className="hero3d-lead">
            기획·디자인·개발·AI 자동화까지, 한 팀이 처음부터 끝까지 맡습니다.
          </p>
          <div className="hero3d-actions">
            <a className="button button-primary button-xl" href={contactHref}>
              프로젝트 상담하기 <ArrowRight size={20} aria-hidden="true" />
            </a>
            <a className="button button-ghost button-xl" href="#work">
              포트폴리오 보기
            </a>
          </div>
        </div>
        <p className="hero3d-closing" aria-hidden="true">
          한 팀이, 처음부터 끝까지.
        </p>
      </div>
    </section>
  );
}

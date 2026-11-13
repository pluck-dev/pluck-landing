"use client";

import { useEffect, useRef } from "react";
import { DEG, rng } from "../paper/ease";
import {
  begin,
  BLUE,
  dprOf,
  drawInk,
  drawStampTool,
  fibers,
  fitCanvas,
  handledRim,
  makeStampTool,
  offscreen,
  PAPER,
  rubberStamp,
  type StampTool,
} from "../paper/draw";
import { Loop, pageFont, paperFontReady, prefersReduced, whenNear } from "../paper/runtime";
import { carryPose, STAMP_LIFT, stampPose, stampShake } from "../paper/stamp";
import { sfxStamp, unlockSound, vibrate } from "../paper/sfx";
import "./stamps.css";

export type Step = { label: string; when?: string; text: string };

const BLEED = 80;
/** Stamps that come due together (fast scroll) land one after another: one hand, one tool in the air. */
const SPACING = 0.36;
/** Hits closer than this are one hand carrying the stamp across (carryPose), not separate drops. */
const CARRY = 0.9;

type Box = { x: number; y: number; size: number };

/**
 * /lp/go "이렇게 진행해요" as a paper stamp card (reveal-craft moment).
 * Scrolling through the section stamps each step's box in turn (a box is due when it passes 82% of
 * the screen height; close hits are one hand carrying the stamp box to box): the wooden stamp falls, hits with a 쿵, squashes, the ink spreads, the card
 * shakes a little; the last box lands heavier ([20,30,40] + a bigger shake). Forward only.
 * Paths: scroll (auto), tap the card (hand: stamps the next box), arriving below it (skip: all
 * stamped at once, silently), reduced motion (stamped already, nothing moves).
 * render(clock) is a pure function of the clock and each box's hit time.
 */
export function GoStamps({ steps }: { steps: Step[] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;
    const rows = Array.from(card.querySelectorAll<HTMLElement>("[data-step]"));
    const boxEls = rows.map((row) => row.querySelector<HTMLElement>(".stc-box")!);
    const reduced = prefersReduced();
    const hits: (number | null)[] = steps.map(() => null);
    const dpr = dprOf();
    let clock = 0;
    let W = 0;
    let H = 0;
    let boxes: Box[] = [];
    let sheet: HTMLCanvasElement | null = null;
    let inks: ReturnType<typeof rubberStamp>[] = [];
    let tool: StampTool | null = null;
    let ready = false;
    const rots = steps.map((_, i) => {
      const r = rng(101 + i * 7);
      return { rot: (-14 + r() * 22) * DEG, dx: (r() - 0.5) * 6, dy: (r() - 0.5) * 6 };
    });

    const measure = () => {
      W = card.clientWidth;
      H = card.clientHeight;
      const base = card.getBoundingClientRect();
      boxes = boxEls.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2, size: r.width };
      });
      fitCanvas(canvas, W + BLEED * 2, H + BLEED * 2, dpr);
      canvas.style.left = `${-BLEED}px`;
      canvas.style.top = `${-BLEED}px`;
      const font = pageFont();
      const size = boxes[0]?.size ?? 64;
      // Card: paper, fibres, handled rim, printed boxes with their numbers.
      const { canvas: c, g } = offscreen(W, H, dpr);
      g.fillStyle = PAPER;
      g.beginPath();
      g.roundRect(0, 0, W, H, 14);
      g.fill();
      g.save();
      g.clip();
      fibers(g, 0, 0, W, H, 47, 60);
      handledRim(g, 0, 0, W, H, 0.12);
      g.restore();
      boxes.forEach((b, i) => {
        const s = b.size;
        g.save();
        g.translate(b.x, b.y);
        g.strokeStyle = "rgba(32,37,35,0.34)";
        g.lineWidth = 1.2;
        g.setLineDash([4, 3]);
        g.beginPath();
        g.roundRect(-s / 2, -s / 2, s, s, 8);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = "rgba(32,37,35,0.42)";
        g.font = `700 ${Math.round(s * 0.17)}px ${font}`;
        g.fillText(String(i + 1), -s / 2 + 6, -s / 2 + s * 0.22);
        g.restore();
      });
      sheet = c;
      const ink = size * 0.94;
      inks = steps.map((step, i) =>
        rubberStamp({
          w: ink,
          h: ink,
          u: ink / 30,
          font,
          shape: "round",
          seed: 60 + i * 13,
          specks: 160,
          stripeAt: 0.2 + (i % 3) * 0.22,
          lines: step.when
            ? [
                { text: step.label, size: step.label.length > 2 ? 6.6 : 7.8, weight: 800, y: 0.54 },
                { text: step.when, size: 4.6, weight: 700, y: 0.76 },
                { text: "PLUCK", size: 3, weight: 800, y: 0.29, spacing: 0.4 },
              ]
            : [
                { text: step.label, size: step.label.length > 3 ? 6 : 8.2, weight: 800, y: step.label.length > 3 ? 0.6 : 0.63 },
                { text: "PLUCK", size: 3, weight: 800, y: 0.32, spacing: 0.4 },
              ],
          color: BLUE,
        }),
      );
      tool = makeStampTool(ink, ink, 9, "round");
      ready = true;
    };

    const render = () => {
      if (!ready || !sheet || !tool) return;
      const g = begin(canvas, W + BLEED * 2, H + BLEED * 2, dpr);
      g.translate(BLEED, BLEED);
      // Card contact shadow on the page.
      g.save();
      g.filter = "blur(10px)";
      g.fillStyle = "rgba(32,37,35,0.12)";
      g.beginPath();
      g.roundRect(6, 12, W - 10, H - 8, 14);
      g.fill();
      g.restore();
      let shake = { x: 0, y: 0 };
      hits.forEach((hit, i) => {
        if (hit === null || reduced) return;
        const s = stampShake(clock - hit, i === steps.length - 1 ? 3.6 : 1.6);
        shake = { x: shake.x + s.x, y: shake.y + s.y };
      });
      // The whole card (paper, ink and the DOM text) jumps a little with each hit.
      card.style.transform = shake.x || shake.y ? `translate3d(${shake.x.toFixed(2)}px, ${shake.y.toFixed(2)}px, 0)` : "";
      g.drawImage(sheet, 0, 0, W, H);
      const size = (boxes[0]?.size ?? 64) * 0.94;
      // Ink first (all boxes), then tools on top, so a lifting tool never hides under a neighbour's ink.
      const poses = hits.map((hit, i) => (hit === null ? null : stampPose(clock - hit, rots[i].rot, reduced, -1)));
      poses.forEach((P, i) => {
        if (!P?.ink) return;
        const b = boxes[i];
        drawInk(g, inks[i], size, size, { x: b.x + rots[i].dx, y: b.y + rots[i].dy, rot: rots[i].rot, k: P.spread, alpha: 0.86 });
      });
      const T = toolPose(poses);
      if (T) drawStampTool(g, tool, T);
      rows.forEach((row, i) => row.toggleAttribute("data-stamped", hits[i] !== null && clock >= hits[i]!));
    };

    /** One tool: falling onto the first box, carried between close hits, or lifting off the last. */
    const toolPose = (poses: (ReturnType<typeof stampPose> | null)[]) => {
      const at = (i: number) => ({ x: boxes[i].x + rots[i].dx, y: boxes[i].y + rots[i].dy });
      let i = -1;
      hits.forEach((hit, k) => {
        if (hit !== null && clock >= hit) i = k;
      });
      const next = i + 1 < hits.length ? hits[i + 1] : null;
      if (i >= 0 && next !== null && next - hits[i]! < CARRY && !reduced) {
        const C = carryPose(clock - hits[i]!, next - hits[i]!, rots[i].rot, rots[i + 1].rot);
        const a = at(i);
        const b = at(i + 1);
        return { x: a.x + (b.x - a.x) * C.k, y: a.y + (b.y - a.y) * C.k, height: C.h, rot: C.rot, sx: C.sx, sy: C.sy, alpha: 1 };
      }
      const k = i >= 0 ? i : hits.findIndex((hit) => hit !== null);
      const P = k >= 0 ? poses[k] : null;
      if (!P || P.alpha <= 0) return null;
      const a = at(k);
      return { x: a.x + P.dx, y: a.y + P.dy, height: P.h, rot: P.rot, sx: P.sx, sy: P.sy, alpha: P.alpha };
    };

    const busy = () => hits.some((hit) => hit !== null && clock < hit + STAMP_LIFT + 0.75);
    const loop = new Loop((dt) => {
      const prev = clock;
      clock += dt;
      hits.forEach((hit, i) => {
        if (hit === null || !(prev < hit && clock >= hit)) return;
        const last = i === steps.length - 1;
        sfxStamp(last ? 1 : 0, i);
        vibrate(last ? [20, 30, 40] : 8);
      });
      render();
      return busy();
    });

    /** Schedules box i (and any skipped before it) to be hit, each SPACING after the previous one. */
    const due = (i: number) => {
      for (let k = 0; k <= i; k++) {
        if (hits[k] !== null) continue;
        const prev = k > 0 && hits[k - 1] !== null ? hits[k - 1]! : -Infinity;
        hits[k] = Math.max(clock + 0.24, prev + SPACING);
      }
      loop.wake();
    };

    const check = () => {
      if (!ready) return;
      const line = window.innerHeight * 0.82;
      let last = -1;
      boxEls.forEach((el, i) => {
        if (el.getBoundingClientRect().top + el.offsetHeight / 2 < line) last = i;
      });
      if (last >= 0 && hits[last] === null) due(last);
    };

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      measure();
      card.setAttribute("data-armed", "");
      // Skip: reaching the card from below (anchor jump past it, reload lower down) or reduced motion
      // → all stamped at once, silently.
      const below = card.getBoundingClientRect().top < 0;
      if (reduced || below) hits.forEach((_, i) => (hits[i] = -10));
      render();
      check();
    };
    let alive = true;
    // The card's printed numbers and the stamp faces are baked once, so they wait for Paperlogy.
    const stopNear = whenNear(card, () => void paperFontReady().then(() => alive && start()), "400px 0px");
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          check();
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const onTap = () => {
      if (!ready) return;
      unlockSound();
      const next = hits.findIndex((hit) => hit === null);
      if (next >= 0) due(next);
    };
    card.addEventListener("click", onTap);
    const resize = new ResizeObserver(() => {
      if (ready && (card.clientWidth !== W || card.clientHeight !== H)) {
        measure();
        render();
      }
    });
    resize.observe(card);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __stamps?: unknown }).__stamps = {
        /** Frame at `at` seconds where box i was hit at times[i] (null = not yet). */
        seek: (at: number, times: (number | null)[]) => {
          if (!started) start();
          loop.stop();
          times.forEach((v, i) => (hits[i] = v));
          clock = at;
          render();
        },
      };
    }

    return () => {
      alive = false;
      stopNear();
      loop.stop();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      card.removeEventListener("click", onTap);
      resize.disconnect();
    };
  }, [steps]);

  return (
    <div className="stc" ref={cardRef}>
      <canvas ref={canvasRef} className="stc-canvas" aria-hidden="true" />
      <p className="stc-head" aria-hidden="true">
        PLUCK · 진행 카드
      </p>
      <ol className="stc-list">
        {steps.map((step, i) => (
          <li key={step.label} className="stc-row" data-step={i}>
            <span className="stc-box" aria-hidden="true" />
            <div className="stc-text">
              <strong>
                {i + 1}. {step.label}
                {step.when && <span> · {step.when}</span>}
              </strong>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

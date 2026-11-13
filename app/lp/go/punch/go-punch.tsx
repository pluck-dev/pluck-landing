"use client";

import { useEffect, useRef } from "react";
import { DEG, outCubic, ring, rng, seg } from "../paper/ease";
import { begin, dprOf, fibers, fitCanvas, handledRim, INK, offscreen, PAPER } from "../paper/draw";
import { Loop, pageFont, paperFontReady, prefersReduced } from "../paper/runtime";
import { sfxPunch, vibrate } from "../paper/sfx";
import { stampPose, STAMP_FALL } from "../paper/stamp";
import "./punch.css";

/** Room above the card for the punch coming down, below it for the chad falling. */
const ABOVE = 70;
const BELOW = 150;
/** Holes due together (a quick double answer) are punched this far apart. */
const SPACING = 0.28;
const HOLE_R = 7;

/** Chad k of hole i at s seconds after the hit: falls (gravity), drifts, flips (ellipse), fades. */
export function chadPose(s: number, seed: number) {
  if (s < 0) return null;
  const r = rng(seed);
  const drift = (r() - 0.5) * 40;
  const spin = 9 + r() * 8;
  const y = 0.5 * 1500 * s * s + 30 * s;
  if (y > BELOW + 40) return null;
  return {
    dx: drift * outCubic(seg(s, 0, 0.6)) + Math.sin(s * 11 + seed) * 3,
    dy: y,
    flip: Math.cos(spin * s),
    rot: s * (r() < 0.5 ? -1 : 1) * 260 * DEG,
    alpha: 1 - seg(y, BELOW * 0.6, BELOW + 30),
  };
}

/**
 * /lp/go quiz progress as a paper punch card (reveal-craft moment). One column per question; each
 * answer brings a steel ticket punch down on its column (stampPose: falls, bites with a squash, lifts
 * away), a clean hole appears with a little shade inside, and the paper chad tumbles out below. The fifth
 * hole is the heavy one ([20,30,40], bigger shake, two chads). A pencil caret marks the open question.
 * Reads the quiz state only (answered count), never changes it. Holes stay when you go back (the answer
 * is still there); a restart brings a fresh card. Reduced motion: holes appear, nothing falls or shakes.
 */
export function GoPunch({ answered, labels, current }: { answered: number; labels: string[]; current: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ sync: (answered: number, current: number) => void } | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;
    const reduced = prefersReduced();
    const dpr = dprOf();
    const n = labels.length;
    const hits: (number | null)[] = labels.map(() => null);
    let clock = 0;
    let caret = 0;
    let W = 0;
    let H = 0;
    let sheet: HTMLCanvasElement | null = null;
    let ready = false;
    let pending: [number, number] | null = null;

    const hole = (i: number) => ({ x: (W / n) * (i + 0.5), y: H * 0.4 });

    const measure = () => {
      W = card.clientWidth;
      H = card.clientHeight;
      fitCanvas(canvas, W, H + ABOVE + BELOW, dpr);
      canvas.style.top = `${-ABOVE}px`;
      const font = pageFont();
      const { canvas: c, g } = offscreen(W, H, dpr);
      g.fillStyle = PAPER;
      g.beginPath();
      g.roundRect(0, 0, W, H, 6);
      g.fill();
      g.save();
      g.clip();
      fibers(g, 0, 0, W, H, 33, 50);
      handledRim(g, 0, 0, W, H, 0.12);
      // Printed column rules and the punch targets (dashed rings), labels under them.
      g.strokeStyle = "rgba(51,90,235,0.18)";
      g.lineWidth = 1;
      for (let i = 1; i < n; i++) {
        g.beginPath();
        g.moveTo((W / n) * i, 8);
        g.lineTo((W / n) * i, H - 8);
        g.stroke();
      }
      g.restore();
      g.textAlign = "center";
      g.font = `700 12.5px ${font}`;
      for (let i = 0; i < n; i++) {
        const { x, y } = hole(i);
        g.strokeStyle = "rgba(32,37,35,0.32)";
        g.setLineDash([2.5, 2.5]);
        g.beginPath();
        g.arc(x, y, HOLE_R + 3, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = "rgba(32,37,35,0.7)";
        g.fillText(labels[i], x, H - 9);
      }
      sheet = c;
    };

    /** The punch seen from above: a steel jaw with its round die over the hole, handle off to the upper right. */
    const drawPunch = (x: number, y: number, P: ReturnType<typeof stampPose>) => {
      if (P.alpha <= 0.01) return;
      const near = 1 + 0.45 * P.h;
      g0.save();
      g0.globalAlpha = P.alpha;
      // Shadow on the card.
      g0.save();
      g0.translate(x + 5 + P.h * 26, y + 6 + P.h * 30);
      g0.rotate(P.rot - 38 * DEG);
      g0.filter = `blur(${(2 + P.h * 8).toFixed(1)}px)`;
      g0.fillStyle = `rgba(32,37,35,${(0.28 * (1 - 0.5 * P.h)).toFixed(3)})`;
      g0.beginPath();
      g0.roundRect(-10, -9, 84, 18, 9);
      g0.fill();
      g0.restore();
      g0.translate(x + P.dx * 0.6, y + P.dy * 0.6 - P.h * 34);
      g0.rotate(P.rot - 38 * DEG);
      g0.scale(near * P.sx, near * P.sy);
      // Jaw / handle: dark steel bar with a bright edge.
      g0.fillStyle = "#5d635f";
      g0.beginPath();
      g0.roundRect(-10, -8, 90, 16, 8);
      g0.fill();
      g0.fillStyle = "rgba(255,255,255,0.32)";
      g0.fillRect(6, -7, 72, 2);
      g0.fillStyle = "rgba(0,0,0,0.22)";
      g0.fillRect(6, 4.6, 72, 2.2);
      // Spring coil near the pivot.
      g0.strokeStyle = "#8d938e";
      g0.lineWidth = 1.6;
      for (let k = 0; k < 4; k++) {
        g0.beginPath();
        g0.ellipse(30 + k * 4.5, 0, 2.2, 7.5, 0, 0, Math.PI * 2);
        g0.stroke();
      }
      // Die head over the hole.
      g0.fillStyle = "#6c726e";
      g0.beginPath();
      g0.arc(0, 0, 12, 0, Math.PI * 2);
      g0.fill();
      g0.fillStyle = "#b9beb8";
      g0.beginPath();
      g0.arc(-2, -2.5, 7.5, 0, Math.PI * 2);
      g0.fill();
      g0.fillStyle = "rgba(255,255,255,0.6)";
      g0.beginPath();
      g0.arc(-4, -5, 2.2, 0, Math.PI * 2);
      g0.fill();
      g0.restore();
    };

    let g0: CanvasRenderingContext2D;
    const render = () => {
      if (!ready || !sheet) return;
      g0 = begin(canvas, W, H + ABOVE + BELOW, dpr);
      const g = g0;
      g.translate(0, ABOVE);
      let shake = 0;
      hits.forEach((hit, i) => {
        if (hit === null || reduced) return;
        shake += ring(clock - hit, i === n - 1 ? 2.2 : 1, 10, 13);
      });
      card.style.transform = shake ? `translate3d(0, ${shake.toFixed(2)}px, 0)` : "";
      g.save();
      g.filter = "blur(6px)";
      g.fillStyle = "rgba(32,37,35,0.1)";
      g.fillRect(4, 8, W - 8, H - 4);
      g.restore();
      g.drawImage(sheet, 0, 0, W, H);
      // Holes: the page shows through, shaded at the top edge (the card has thickness).
      hits.forEach((hit, i) => {
        if (hit === null || clock < hit) return;
        const { x, y } = hole(i);
        const k = reduced ? 1 : outCubic(seg(clock - hit, 0, 0.06));
        // Cover the printed dashed target, then cut the hole: page seen through, in the card's own shade.
        g.fillStyle = PAPER;
        g.beginPath();
        g.arc(x, y, HOLE_R + 4.2, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#c7cac1";
        g.beginPath();
        g.arc(x, y, HOLE_R * (0.6 + 0.4 * k), 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "rgba(32,37,35,0.5)";
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(x, y + 0.6, HOLE_R - 1.2, Math.PI * 1.02, Math.PI * 1.98);
        g.stroke();
        g.strokeStyle = "rgba(120,108,80,0.35)";
        g.lineWidth = 0.8;
        g.beginPath();
        g.arc(x, y, HOLE_R + 0.6, 0, Math.PI * 2);
        g.stroke();
      });
      // Pencil caret under the open question.
      if (caret < n) {
        const { x } = hole(caret);
        g.strokeStyle = INK;
        g.lineWidth = 1.6;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(x - 5, H * 0.4 + HOLE_R + 9);
        g.lineTo(x, H * 0.4 + HOLE_R + 5);
        g.lineTo(x + 5, H * 0.4 + HOLE_R + 9);
        g.stroke();
      }
      if (reduced) return;
      // Chads tumbling out below the card.
      hits.forEach((hit, i) => {
        if (hit === null) return;
        const { x, y } = hole(i);
        for (let c = 0; c < (i === n - 1 ? 2 : 1); c++) {
          const C = chadPose(clock - hit - c * 0.05, 7 + i * 13 + c * 5);
          if (!C) continue;
          g.save();
          g.globalAlpha = C.alpha;
          g.translate(x + C.dx + c * 6, y + C.dy);
          g.rotate(C.rot);
          g.fillStyle = C.flip > 0 ? PAPER : "#e5e2d6";
          g.strokeStyle = "rgba(32,37,35,0.3)";
          g.lineWidth = 0.8;
          g.beginPath();
          g.ellipse(0, 0, HOLE_R, Math.max(0.8, HOLE_R * Math.abs(C.flip)), 0, 0, Math.PI * 2);
          g.fill();
          g.stroke();
          g.restore();
        }
      });
      // One punch in the air at a time: the latest hit that is still moving.
      let latest = -1;
      hits.forEach((hit, i) => {
        if (hit !== null && clock >= hit - STAMP_FALL - 0.02 && clock < hit + 0.5) latest = i;
      });
      if (latest >= 0) {
        const { x, y } = hole(latest);
        drawPunch(x, y, stampPose(clock - hits[latest]!, 0, false, 1));
      }
    };

    const busy = () => hits.some((hit) => hit !== null && clock < hit + 1.2);
    const loop = new Loop((dt) => {
      const prev = clock;
      clock += dt;
      hits.forEach((hit, i) => {
        if (hit === null || !(prev < hit && clock >= hit)) return;
        const heavy = i === n - 1;
        sfxPunch(heavy);
        vibrate(heavy ? [20, 30, 40] : 8);
      });
      render();
      return busy();
    });

    /** answered = holes that should exist; holes are never un-punched except by a fresh card (0). */
    const sync = (count: number, open: number) => {
      caret = open;
      if (count === 0 && hits.some((h) => h !== null)) hits.fill(null);
      let last = -Infinity;
      for (let i = 0; i < Math.min(count, n); i++) {
        if (hits[i] !== null) {
          last = hits[i]!;
          continue;
        }
        hits[i] = reduced ? -10 : Math.max(clock + STAMP_FALL + 0.02, last + SPACING);
        last = hits[i]!;
      }
      render();
      if (!reduced) loop.wake();
    };

    let alive = true;
    void paperFontReady().then(() => {
      if (!alive) return;
      measure();
      ready = true;
      api.current = { sync };
      if (pending) sync(...pending);
      render();
    });
    api.current = { sync: (a, c) => (pending = [a, c]) };
    const resize = new ResizeObserver(() => {
      if (ready && (card.clientWidth !== W || card.clientHeight !== H)) {
        measure();
        render();
      }
    });
    resize.observe(card);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __punch?: unknown }).__punch = {
        seek: (at: number, times: (number | null)[], open = 0) => {
          loop.stop();
          times.forEach((v, i) => (hits[i] = v));
          caret = open;
          clock = at;
          render();
        },
      };
    }

    return () => {
      alive = false;
      loop.stop();
      resize.disconnect();
    };
  }, [labels]);

  useEffect(() => {
    api.current?.sync(answered, current);
  }, [answered, current]);

  return (
    <div className="pch" ref={cardRef} aria-hidden="true">
      <canvas ref={canvasRef} className="pch-canvas" />
    </div>
  );
}


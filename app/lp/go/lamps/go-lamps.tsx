"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { clamp, outBack, ring, rng, seg } from "../paper/ease";
import { begin, dprOf, fitCanvas, offscreen } from "../paper/draw";
import { Loop, prefersReduced, whenNear } from "../paper/runtime";
import { sfxEmboss, sfxRelay, unlockSound, vibrate } from "../paper/sfx";
import "./lamps.css";

export type Lamp = { name: string; url?: string };

const COLS = 7;
const CHASE0 = 0.2;
const CHASE_GAP = 0.055;
/** Seconds per character the label maker presses. */
const CHAR = 0.05;
const TAPE0 = 0.25;
const IDLE_MS = 7000;

/** Lamp i brightness at t: dark → filament overshoot (outBack) with one flicker, then the bank's inrush dip. */
export function lampLevel(t: number, i: number, n: number, blink: { at: number; i: number } | null) {
  const on = CHASE0 + i * CHASE_GAP;
  if (t < on) return 0;
  const s = t - on;
  let b = s < 0.14 ? outBack(seg(s, 0, 0.14), 2.2) : 1;
  b *= 1 - 0.35 * Math.max(0, Math.sin(Math.PI * seg(s, 0.05, 0.09)));
  const end = CHASE0 + (n - 1) * CHASE_GAP;
  // When the last lamp latches every lamp sags (inrush) and recovers.
  if (t >= end) b *= 1 - 0.22 * Math.exp(-9 * (t - end)) * Math.abs(Math.cos(18 * (t - end)));
  if (blink && blink.i === i) b *= 1 - Math.sin(Math.PI * seg(t, blink.at, blink.at + TAPE0)) ** 0.6;
  return clamp(b, 0, 1.2);
}

/**
 * /lp/go "지금 접속 가능 21" as a small metal panel of indicator lamps, one per live project in
 * lib/portfolio.ts (the count IS the headline number). When it comes into view the lamps switch on in a
 * chase with relay clicks; the last one latches heavier (every lamp sags and recovers, the panel shakes,
 * [20,30,40]). Tapping a lamp blinks it and a label maker presses the project name into a strip of tape,
 * with its live link. One client is not named on ad pages: its lamp is lit but the tape says so, no link.
 * Paths: hand (tap / keyboard: lamps are buttons) · auto (chase on view) · idle 7 s (the first lamp's
 * label prints by itself, to show what a tap does) · skip (arrived from below: all lit) · reduced motion
 * (same chase and tape, lamps only switch on: no panel shake). render(t) is a pure function of t, the blink and the tape clock.
 */
export function GoLamps({ lamps }: { lamps: Lamp[] }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const pickRef = useRef<(i: number, byHand: boolean) => void>(() => {});

  useEffect(() => {
    const panel = panelRef.current;
    const canvas = canvasRef.current;
    const tape = tapeRef.current;
    if (!panel || !canvas || !tape) return;
    const reduced = prefersReduced();
    const dpr = dprOf();
    const n = lamps.length;
    const rows = Math.ceil(n / COLS);
    let W = 0;
    let H = 0;
    let cell = 0;
    let lampR = 0;
    let gridTop = 0;
    let face: HTMLCanvasElement | null = null;
    let t = -1;
    let blink: { at: number; i: number } | null = null;
    let tapeAt = -1;
    let tapeLen = 0;
    let touched = false;
    let idleTimer = 0;
    const end = CHASE0 + (n - 1) * CHASE_GAP;
    const TOTAL = end + 0.6;

    const centre = (i: number) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const inRow = Math.min(COLS, n - row * COLS);
      const x0 = (W - inRow * cell) / 2;
      return { x: x0 + (col + 0.5) * cell, y: gridTop + (row + 0.5) * cell };
    };

    const measure = () => {
      W = panel.clientWidth;
      const pad = Math.max(18, W * 0.05);
      cell = Math.min((W - pad * 2) / COLS, 64);
      lampR = cell * 0.3;
      gridTop = Math.max(18, W * 0.05);
      // Height follows the lamp grid + the tape slot (set here, so the ResizeObserver sees it unchanged).
      H = Math.round(gridTop + rows * cell + 12 + 34 + 22);
      panel.style.height = `${H}px`;
      fitCanvas(canvas, W, H, dpr);
      // Brushed steel plate, chamfered edge, four screws, the lamp bezels and the tape slot.
      const { canvas: c, g } = offscreen(W, H, dpr);
      g.fillStyle = "#c3c7c0";
      g.beginPath();
      g.roundRect(0, 0, W, H, 12);
      g.fill();
      g.save();
      g.clip();
      const r = rng(17);
      for (let y = 0; y < H; y += 1.2) {
        g.strokeStyle = `rgba(${r() < 0.5 ? "255,255,255" : "70,76,72"},${0.03 + r() * 0.06})`;
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y + (r() - 0.5) * 0.6);
        g.stroke();
      }
      g.restore();
      g.strokeStyle = "rgba(255,255,255,0.7)";
      g.lineWidth = 1.2;
      g.beginPath();
      g.roundRect(1.5, 1.5, W - 3, H - 3, 11);
      g.stroke();
      g.strokeStyle = "rgba(60,66,62,0.45)";
      g.lineWidth = 1;
      g.beginPath();
      g.roundRect(0.5, 0.5, W - 1, H - 1, 12);
      g.stroke();
      for (const [x, y] of [
        [10, 10],
        [W - 10, 10],
        [10, H - 10],
        [W - 10, H - 10],
      ]) {
        g.fillStyle = "#9aa098";
        g.beginPath();
        g.arc(x, y, 3.6, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "rgba(40,44,42,0.55)";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x - 2.4, y + 1);
        g.lineTo(x + 2.4, y - 1);
        g.stroke();
        g.fillStyle = "rgba(255,255,255,0.5)";
        g.beginPath();
        g.arc(x - 1, y - 1.2, 1, 0, Math.PI * 2);
        g.fill();
      }
      for (let i = 0; i < n; i++) {
        const { x, y } = centre(i);
        // Chrome bezel: dark recess ring, bright rim catching the light from the top-left.
        g.fillStyle = "rgba(40,44,42,0.35)";
        g.beginPath();
        g.arc(x + 0.8, y + 1.4, lampR + 4.2, 0, Math.PI * 2);
        g.fill();
        const bez = g.createLinearGradient(x - lampR, y - lampR, x + lampR, y + lampR);
        bez.addColorStop(0, "#f4f5f2");
        bez.addColorStop(0.5, "#9da39b");
        bez.addColorStop(1, "#5f655f");
        g.fillStyle = bez;
        g.beginPath();
        g.arc(x, y, lampR + 3.4, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#2b302d";
        g.beginPath();
        g.arc(x, y, lampR + 0.6, 0, Math.PI * 2);
        g.fill();
      }
      // Tape slot under the lamps.
      const slotY = gridTop + rows * cell + 12;
      g.fillStyle = "#2b302d";
      g.beginPath();
      g.roundRect(W * 0.06, slotY, 6, 34, 2);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.55)";
      g.fillRect(W * 0.06 + 6, slotY, 1, 34);
      face = c;
      // Place the DOM hit targets and the tape.
      panel.querySelectorAll<HTMLElement>(".lmp-btn").forEach((btn, i) => {
        const { x, y } = centre(i);
        btn.style.left = `${x - cell / 2}px`;
        btn.style.top = `${y - cell / 2}px`;
        btn.style.width = btn.style.height = `${cell}px`;
      });
      tape.style.top = `${slotY + 3}px`;
      tape.style.left = `${W * 0.06 + 4}px`;
      tape.style.maxWidth = `${W * 0.88}px`;
    };

    const render = () => {
      if (!face) return;
      const g = begin(canvas, W, H, dpr);
      const sh = reduced || t < end ? 0 : ring(t - end, 1.6, 10, 12);
      panel.style.transform = sh ? `translate3d(${sh.toFixed(2)}px, 0, 0)` : "";
      g.drawImage(face, 0, 0, W, H);
      for (let i = 0; i < n; i++) {
        const { x, y } = centre(i);
        const b = t < 0 ? 0 : lampLevel(t, i, n, blink);
        // Lens: dull green glass when off; lit = bright green with the lens' own shading. No outer glow.
        const lens = g.createRadialGradient(x - lampR * 0.3, y - lampR * 0.35, lampR * 0.1, x, y, lampR);
        const lit = clamp(b);
        const mix = (a: number[], z: number[], k: number) => `rgb(${a.map((v, j) => Math.round(v + (z[j] - v) * k)).join(",")})`;
        lens.addColorStop(0, mix([92, 112, 92], [236, 255, 222], lit));
        lens.addColorStop(0.55, mix([52, 70, 54], [110, 226, 112], lit));
        lens.addColorStop(1, mix([34, 46, 36], [44, 150, 62], lit));
        g.fillStyle = lens;
        g.beginPath();
        g.arc(x, y, lampR, 0, Math.PI * 2);
        g.fill();
        if (b > 1) {
          g.fillStyle = `rgba(236,255,226,${((b - 1) * 2).toFixed(3)})`;
          g.beginPath();
          g.arc(x, y, lampR * 0.6, 0, Math.PI * 2);
          g.fill();
        }
        // Specular highlight on the glass dome.
        g.fillStyle = "rgba(255,255,255,0.55)";
        g.beginPath();
        g.ellipse(x - lampR * 0.35, y - lampR * 0.42, lampR * 0.28, lampR * 0.16, -0.5, 0, Math.PI * 2);
        g.fill();
      }
      // Tape: revealed one pressed character at a time (stepwise), with the link once it is through.
      if (tapeAt >= 0 && blink) {
        const k = Math.floor(clamp((t - blink.at - TAPE0) / CHAR, 0, tapeLen));
        const frac = tapeLen ? k / tapeLen : 1;
        tape.style.clipPath = `inset(0 ${((1 - frac) * 100).toFixed(1)}% 0 0)`;
        tape.toggleAttribute("data-full", frac >= 1);
      }
    };

    const tapeEnd = () => (blink ? blink.at + TAPE0 + tapeLen * CHAR + 0.2 : 0);
    const loop = new Loop((dt) => {
      const prev = t;
      t += dt;
      for (let i = 0; i < n; i++) {
        const on = CHASE0 + i * CHASE_GAP;
        if (prev < on && t >= on) {
          sfxRelay(i, i === n - 1);
          vibrate(i === n - 1 ? [20, 30, 40] : 8);
        }
      }
      if (blink) {
        if (prev < blink.at && t >= blink.at) sfxRelay(blink.i);
        const a = Math.floor((prev - blink.at - TAPE0) / CHAR);
        const b = Math.floor((t - blink.at - TAPE0) / CHAR);
        if (b > a && b >= 1 && b <= tapeLen) {
          sfxEmboss(b);
          vibrate(8);
        }
      }
      render();
      return t < TOTAL || t < tapeEnd();
    });

    const pick = (i: number, byHand: boolean) => {
      if (t < 0) return;
      if (byHand) {
        touched = true;
        window.clearTimeout(idleTimer);
        unlockSound();
      }
      if (t < end) t = end + 0.6; // tapping during the chase finishes it
      blink = { at: t + 0.02, i };
      tapeAt = t;
      tapeLen = Array.from(lamps[i].name).length;
      tape.style.clipPath = "inset(0 100% 0 0)";
      tape.removeAttribute("data-full");
      setPicked(i);
      loop.wake();
    };
    pickRef.current = pick;

    let started = false;
    const start = (skip: boolean) => {
      if (started) return;
      started = true;
      t = skip ? TOTAL : 0;
      render();
      if (t < TOTAL) loop.wake();
      idleTimer = window.setTimeout(() => {
        if (!touched && blink === null) pick(0, false);
      }, IDLE_MS + (t < TOTAL ? TOTAL * 1000 : 0));
    };

    measure();
    render();
    const stopNear = whenNear(panel, () => {
      // Skip: reached from below (anchor jump, reload lower down) → all lit already.
      if (panel.getBoundingClientRect().bottom < 0) start(true);
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        start(entry.boundingClientRect.top < 0);
      },
      { threshold: 0.6 },
    );
    io.observe(panel);
    const resize = new ResizeObserver(() => {
      if (panel.clientWidth !== W || panel.clientHeight !== H) {
        measure();
        render();
      }
    });
    resize.observe(panel);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lamps?: unknown }).__lamps = {
        total: TOTAL,
        /** Frame at t; `tap` = [lamp, tapped at] or null. */
        seek: (at: number, tap: [number, number] | null = null) => {
          loop.stop();
          started = true;
          window.clearTimeout(idleTimer);
          if (tap) {
            blink = { at: tap[1], i: tap[0] };
            tapeAt = tap[1];
            tapeLen = Array.from(lamps[tap[0]].name).length;
            setPicked(tap[0]);
          } else {
            blink = null;
            tapeAt = -1;
            setPicked(null);
          }
          t = at;
          render();
        },
      };
    }

    return () => {
      stopNear();
      io.disconnect();
      resize.disconnect();
      loop.stop();
      window.clearTimeout(idleTimer);
    };
  }, [lamps]);

  const current = picked === null ? null : lamps[picked];
  return (
    <div className="lmp" ref={panelRef}>
      <canvas ref={canvasRef} className="lmp-canvas" aria-hidden="true" />
      {lamps.map((lamp, i) => (
        <button
          key={i}
          type="button"
          className="lmp-btn"
          aria-label={lamp.name}
          aria-pressed={picked === i}
          onClick={() => pickRef.current(i, true)}
        />
      ))}
      <div className="lmp-tape" ref={tapeRef} aria-live="polite">
        {current && (
          <>
            <span className="lmp-name">{current.name}</span>
            {current.url && (
              <a href={current.url} target="_blank" rel="noopener noreferrer" className="lmp-link">
                열기 <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

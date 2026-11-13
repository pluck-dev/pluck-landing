"use client";

import { useEffect, useRef } from "react";
import { clamp } from "../paper/ease";
import { begin, dprOf, fitCanvas } from "../paper/draw";
import { Loop, pageFont, paperFontReady, prefersReduced, whenNear } from "../paper/runtime";
import { sfxBite, sfxChew, sfxMotorOff, sfxSettle, sfxSlide, sfxSwallow, shredHum, unlockSound, vibrate } from "../paper/sfx";
import {
  bakeAssets,
  DROP,
  FEED,
  HAND_OUT,
  LAND,
  LAND_END,
  layout,
  LIFT,
  MOTOR_OFF,
  render,
  SHEETS,
  sheetStart,
  type Assets,
  type Layout,
  type PluckSheet,
  type Quote,
} from "./scene";
import "./shred.css";

/** Track progress 0..1 that drives p (the rest of the track is the hand-out and the release). */
const SCRUB_END = 0.86;
/** Auto (tap / idle) feeds this much p per second. */
const AUTO_RATE = 0.42;
const IDLE_MS = 5000;

/**
 * /lp/go 파쇄기 section (reveal-craft moment, scene.ts). A tall track with a sticky stage inside it:
 * scrolling through the track scrubs p (forward only, exp-smoothed so wheel steps feel like a hand),
 * three total-only example quotes get shredded, then the itemised PLUCK quote is handed out on its own
 * clock. No scroll-jacking: stop scrolling and the shredder stops.
 * Paths: scroll (hand) · tap the stage, or stop inside the stage for 5 s (auto) · arriving from below or
 * an anchor jump past it (skip, final state) · reduced motion (same scroll scrub, the scene drops the
 * motor jitter, wobble, landing shake and rattle). Tap = a real tap (click): on phones the finger that
 * scrolls the pinned stage also lands on it, and pointerdown used to start the auto run mid-scroll.
 * Sound only after a gesture (paper/sfx.ts); the motor hum follows the feed speed.
 */
export function GoShred({ quotes, sheet, label }: { quotes: Quote[]; sheet: PluckSheet; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!track || !stage || !canvas) return;
    const reduced = prefersReduced();
    const dpr = dprOf();
    let L: Layout | null = null;
    let A: Assets | null = null;
    let target = 0;
    let p = 0;
    let land = -1;
    let motor = 0;
    let clock = 0;
    let auto = false;
    let visible = false;
    let lastMove = performance.now();
    let biteAcc = 0;

    const measure = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (!W || !H) return;
      L = layout(W, H);
      fitCanvas(canvas, W, H, dpr);
      A = bakeAssets(L, quotes, sheet, pageFont());
    };
    const draw = () => {
      if (!L || !A) return;
      const g = begin(canvas, L.W, L.H, dpr);
      render(g, L, A, { p, land, motor, clock, reduced });
    };

    const finish = () => {
      target = 1;
      p = 1;
      land = LAND_END;
      motor = 0;
      stage.setAttribute("data-done", "");
      draw();
    };

    /** Sounds and haptics when p crosses a beat (same for scroll, auto and idle). */
    const beats = (prev: number) => {
      for (let i = 0; i < SHEETS; i++) {
        const b = sheetStart(i);
        if (prev < b + LIFT && p >= b + LIFT) {
          sfxBite();
          vibrate(8);
        }
        if (prev < b + FEED && p >= b + FEED) {
          sfxSwallow();
          vibrate(14);
        }
      }
      if (prev < MOTOR_OFF && p >= MOTOR_OFF) sfxMotorOff();
    };
    const feeding = () => {
      for (let i = 0; i < SHEETS; i++) {
        const b = sheetStart(i);
        if (p > b + LIFT && p < b + DROP) return true;
      }
      return false;
    };

    const loop = new Loop((dt) => {
      clock += dt;
      const prev = p;
      if (auto) target = Math.min(1, target + AUTO_RATE * dt);
      p = target - (target - p) * Math.exp(-dt * 9);
      if (target - p < 0.0005) p = target;
      const speed = (p - prev) / Math.max(dt, 1e-3);
      const load = feeding() && p < MOTOR_OFF ? clamp(speed * 3.2) : 0;
      motor += (load - motor) * (1 - Math.exp(-dt * (load > motor ? 14 : 6)));
      if (motor < 0.01) motor = 0;
      shredHum(visible ? motor : 0);
      if (load > 0.05) {
        biteAcc += dt * (4 + load * 10);
        if (biteAcc > 1) {
          biteAcc = 0;
          sfxChew(load);
          vibrate(6);
        }
      }
      beats(prev);
      if (prev < HAND_OUT && p >= HAND_OUT && land < 0) {
        land = 0;
        sfxSlide();
      }
      if (land >= 0 && land < LAND_END) {
        const before = land;
        land = Math.min(LAND_END, land + dt);
        if (before < LAND && land >= LAND) {
          sfxSettle();
          vibrate([20, 30, 40]);
        }
        if (land >= LAND_END) stage.setAttribute("data-done", "");
      }
      // Stopped inside the pinned stage, part-way through: finish on its own.
      if (!auto && p > 0.02 && p < HAND_OUT && performance.now() - lastMove > IDLE_MS && pinned()) auto = true;
      draw();
      const moving = Math.abs(target - p) > 0 || motor > 0 || (land >= 0 && land < LAND_END) || (auto && target < 1);
      const waitingIdle = p > 0.02 && p < HAND_OUT && !auto;
      return visible && (moving || waitingIdle);
    });

    const pinned = () => {
      const r = track.getBoundingClientRect();
      return r.top <= 1 && r.bottom >= window.innerHeight - 1;
    };
    const progress = () => {
      const r = track.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      return range > 0 ? clamp(-r.top / range / SCRUB_END) : 0;
    };
    const onScroll = () => {
      if (!L) return;
      // Jumped clean past it (anchor link): don't play the rest offscreen and replay it on the way back.
      if (land < 0 && track.getBoundingClientRect().bottom < 0) {
        finish();
        return;
      }
      const v = progress();
      if (v > target) {
        target = v;
        lastMove = performance.now();
        loop.wake();
      }
    };

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      measure();
      stage.setAttribute("data-armed", "");
      // Skip: already past the section (anchor jump, reload lower down) → final.
      // (Started with the track's top already above the screen = we came from below, not through it.)
      if (track.getBoundingClientRect().top < -2) finish();
      else {
        onScroll();
        draw();
      }
    };
    let alive = true;
    const stopNear = whenNear(track, () => void paperFontReady().then(() => alive && start()), "500px 0px");
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) loop.wake();
      else shredHum(0);
    });
    io.observe(track);
    window.addEventListener("scroll", onScroll, { passive: true });
    const onTap = () => {
      unlockSound();
      if (!L || target >= 1) return;
      auto = true;
      loop.wake();
    };
    stage.addEventListener("click", onTap);
    const resize = new ResizeObserver(() => {
      if (L && (stage.clientWidth !== L.W || stage.clientHeight !== L.H)) {
        measure();
        draw();
      }
    });
    resize.observe(stage);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __shred?: unknown }).__shred = {
        /** Frame at p with the hand-out clock `l` (−1 = not yet) and motor level m. */
        seek: (at: number, l = -1, m = 0) => {
          if (!started) start();
          loop.stop();
          stage.removeAttribute("data-done");
          target = p = at;
          land = l;
          motor = m;
          clock = 0.37;
          draw();
        },
        state: () => ({ p, target, land, motor, auto }),
      };
    }

    return () => {
      alive = false;
      stopNear();
      io.disconnect();
      loop.stop();
      shredHum(0);
      window.removeEventListener("scroll", onScroll);
      stage.removeEventListener("click", onTap);
      resize.disconnect();
    };
  }, [quotes, sheet]);

  return (
    <div className="shr-track" ref={trackRef}>
      <div className="shr-pin">
        <h2 id="go-shred-title" className="section-title shr-title">
          {label}
        </h2>
        <div className="shr-stage" ref={stageRef}>
          <canvas ref={canvasRef} className="shr-canvas" aria-hidden="true" />
        </div>
        {/* What the canvas shows, for screen readers: the three example totals, then the itemised sheet. */}
        <div className="go-sr">
          <p>(예시) 총액만 적힌 견적서: {quotes.map((q) => q.total).join(", ")}</p>
          <table>
            <caption>(예시) PLUCK 항목별 견적서</caption>
            <tbody>
              {sheet.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.amount}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">합계</th>
                <td>{sheet.total}</td>
              </tr>
            </tbody>
          </table>
          <p>{sheet.note}</p>
        </div>
      </div>
    </div>
  );
}

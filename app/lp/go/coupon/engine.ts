"use client";

import { makeLayout, NOTCHES, Painter, pose, T_END, T_RIP, T_RISE, type Layout, type Mode, type SceneInput } from "./scene";
import { sfxChime, sfxRip, sfxSlide, sfxTap, sfxTick, unlockSound, vibrate } from "./sfx";

/**
 * Drives t for the envelope scene. Four ways to open, all ending at the same coupon:
 *   hand  drag the strip sideways (t = tear progress), release past 80% finishes it
 *   tap   three knocks, each tears a third
 *   auto  "자동으로 열기" button (or Enter on the strip)
 *   skip  "바로 받기": straight to the final state
 *   idle  7 s on screen untouched → tab tug → auto
 * Sounds/vibration fire on crossings of t, so scrubbing and playback sound the same.
 */
export type EngineEls = {
  stage: HTMLElement;
  back: HTMLCanvasElement;
  front: HTMLCanvasElement;
  coupon: HTMLElement;
  sweep: HTMLElement;
  veil: HTMLElement;
};

export type EngineEvents = {
  /** Strip fully torn (or skipped): issue/reuse the coupon. */
  rip: (mode: Mode) => void;
  end: () => void;
};

const IDLE_SECONDS = 7;
const NUDGE_MS = 1000;
const RESIST = 0.16;
const GIVE = 0.06;

const resist = (raw: number) => (raw < RESIST ? GIVE * Math.max(0, raw / RESIST) ** 1.5 : GIVE + (raw - RESIST) * 1.05);
const unresist = (p: number) => (p < GIVE ? RESIST * (p / GIVE) ** (2 / 3) : RESIST + (p - GIVE) / 1.05);
const inOutSine = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;
const outCubic = (k: number) => 1 - (1 - k) ** 3;

type Tween = { from: number; to: number; start: number; dur: number; ease: (k: number) => number };

export class CouponEngine {
  t = 0;
  mode: Mode = "hand";
  private L!: Layout;
  private painter!: Painter;
  private input: SceneInput = { mode: "hand", breath: 0, nudge: 0, reduced: false };
  private state: "rest" | "play" | "done" = "rest";
  private tween: Tween | null = null;
  private raf = 0;
  private last = 0;
  private visible = false;
  private idle = 0;
  private nudgeStart: number | null = null;
  private frozen = false;
  private drag: { id: number; x: number; y: number; raw0: number; at: number; moved: boolean } | null = null;
  private cleanup: (() => void)[] = [];

  constructor(
    private els: EngineEls,
    private events: EngineEvents,
    private font: string,
    opened: boolean,
    reduced: boolean,
  ) {
    this.input.reduced = reduced;
    if (opened) {
      this.t = T_END;
      this.state = "done";
    }
    this.relayout();
    this.bind();
    this.render();
  }

  get done() {
    return this.state === "done";
  }

  relayout() {
    const { stage, coupon } = this.els;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    if (!W || !H) return;
    this.L = makeLayout(W, H);
    this.painter = new Painter(this.els.back, this.els.front, this.L, this.font, this.input);
    coupon.style.width = `${this.L.cw}px`;
    coupon.style.height = `${this.L.ch}px`;
    coupon.style.setProperty("--cw", `${this.L.cw}px`);
    this.render();
  }

  setReduced(reduced: boolean) {
    this.input.reduced = reduced;
    this.relayout();
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) this.wake();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach((fn) => fn());
    this.els.veil.style.opacity = "0";
  }

  /* ---------- paths ---------- */

  auto(mode: "auto" | "idle" = "auto") {
    if (this.state !== "rest" || this.frozen) return;
    if (mode === "auto") unlockSound();
    this.mode = mode;
    this.resetIdle();
    const now = performance.now();
    this.tween = { from: this.t, to: T_RIP, start: now, dur: 250 + 1150 * (1 - this.t), ease: inOutSine };
    this.wake();
  }

  skip() {
    if (this.state === "done" || this.frozen) return;
    unlockSound();
    this.mode = "skip";
    this.tween = null;
    if (this.t < T_RIP) this.events.rip("skip");
    this.t = T_END;
    this.finish();
  }

  /** Keyboard: one perforation hole per arrow press. */
  stepKey() {
    if (this.state !== "rest" || this.frozen) return;
    unlockSound();
    this.mode = "hand";
    this.resetIdle();
    const next = Math.min(T_RIP, (Math.floor(this.t * NOTCHES + 1e-6) + 1) / NOTCHES);
    this.tween = { from: this.t, to: next, start: performance.now(), dur: 140, ease: outCubic };
    this.wake();
  }

  private tap() {
    if (this.state !== "rest") return;
    this.mode = "tap";
    const from = this.tween ? this.tween.to : this.t;
    const knocks = Math.min(3, Math.floor(from * 3 + 1e-6) + 1);
    sfxTap(knocks);
    vibrate(8);
    this.tween = { from: this.t, to: Math.min(T_RIP, knocks / 3), start: performance.now(), dur: 320, ease: outCubic };
    this.wake();
  }

  /* ---------- input ---------- */

  private bind() {
    const { stage } = this.els;
    const down = (event: PointerEvent) => {
      if (this.state !== "rest" || this.frozen || !event.isPrimary) return;
      if (this.tween && this.mode !== "tap") return;
      unlockSound();
      this.resetIdle();
      this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, raw0: unresist(this.t), at: performance.now(), moved: false };
      try {
        stage.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic pointers can't be captured.
      }
    };
    const move = (event: PointerEvent) => {
      const drag = this.drag;
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - drag.y)) {
        drag.moved = true;
        this.mode = "hand";
      }
      if (!drag.moved) return;
      event.preventDefault();
      const p = Math.min(T_RIP, resist(drag.raw0 + dx / (this.L.ew * 0.9)));
      // Torn paper stays torn: the tear only moves forward.
      if (p > this.t) this.advance(p);
      if (this.t >= T_RIP) this.drag = null;
      this.wake();
    };
    const up = (event: PointerEvent) => {
      const drag = this.drag;
      if (!drag || event.pointerId !== drag.id) return;
      this.drag = null;
      const dist = Math.hypot(event.clientX - drag.x, event.clientY - drag.y);
      if (!drag.moved && dist < 12 && performance.now() - drag.at < 600) {
        this.tap();
        return;
      }
      if (drag.moved && this.t >= 0.8 && this.t < T_RIP) {
        this.tween = { from: this.t, to: T_RIP, start: performance.now(), dur: 200, ease: outCubic };
        this.wake();
      }
    };
    const cancel = () => {
      this.drag = null;
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", cancel);
    this.cleanup.push(() => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", cancel);
    });
  }

  private resetIdle() {
    this.idle = 0;
    this.nudgeStart = null;
    this.input.nudge = 0;
  }

  /* ---------- time ---------- */

  /** Moves t forward and fires whatever it crossed. */
  private advance(next: number) {
    const prev = this.t;
    if (next <= prev) return;
    this.t = next;
    if (prev < T_RIP) {
      const a = Math.floor(prev * NOTCHES + 1e-6);
      const b = Math.floor(Math.min(next, 0.9999) * NOTCHES + 1e-6);
      if (b > a && this.mode !== "tap") {
        sfxTick(next);
        vibrate(8);
      }
    }
    if (prev < T_RIP && next >= T_RIP) {
      sfxRip();
      vibrate([20, 30, 40]);
      this.events.rip(this.mode);
      this.state = "play";
      if (this.input.reduced) {
        this.t = T_END;
        this.finish();
        return;
      }
    }
    if (prev < T_RISE && next >= T_RISE) sfxSlide();
    if (prev < 2.3 && next >= 2.3) sfxChime();
    if (next >= T_END) {
      this.t = T_END;
      this.finish();
    }
  }

  private finish() {
    this.state = "done";
    this.tween = null;
    this.render();
    this.events.end();
  }

  private wake() {
    if (this.raf || this.frozen) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.raf = 0;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;

    if (this.tween) {
      const k = Math.min(1, (now - this.tween.start) / this.tween.dur);
      const target = this.tween.from + (this.tween.to - this.tween.from) * this.tween.ease(k);
      if (k >= 1) this.tween = null;
      this.advance(target);
    } else if (this.state === "play") {
      this.advance(this.t + dt);
    } else if (this.state === "rest" && this.visible && !this.drag && this.t === 0) {
      this.idle += dt;
      if (this.idle >= IDLE_SECONDS && this.nudgeStart === null) this.nudgeStart = now;
    }
    if (this.nudgeStart !== null && this.state === "rest") {
      const k = (now - this.nudgeStart) / NUDGE_MS;
      this.input.nudge = Math.min(1, k);
      if (k >= 1) {
        this.resetIdle();
        this.auto("idle");
      }
    }
    this.input.breath = now / 1000;
    this.render();

    const busy = this.tween || this.state === "play" || this.drag;
    if (this.state !== "done" && (busy || this.visible)) this.raf = requestAnimationFrame(this.tick);
  };

  render() {
    if (!this.L || !this.painter) return;
    this.input.mode = this.mode;
    const P = pose(this.t, this.L, this.input);
    this.painter.draw(P);
    const { coupon, sweep, veil, back, front, stage } = this.els;
    const c = P.coupon;
    coupon.style.transform = `translate3d(${(c.x - this.L.cw / 2).toFixed(2)}px, ${(c.y - this.L.ch / 2).toFixed(2)}px, 0) rotate(${c.rot.toFixed(4)}rad) scale(${c.scale.toFixed(4)})`;
    coupon.style.zIndex = c.front ? "3" : "1";
    const sweeping = c.sweep > 0 && c.sweep < 1;
    sweep.style.opacity = sweeping ? "1" : "0";
    sweep.style.transform = `translateX(${(-140 + 280 * c.sweep).toFixed(1)}%) skewX(-18deg)`;
    const dim = `brightness(${(1 - 0.16 * P.veil).toFixed(3)})`;
    back.style.filter = dim;
    front.style.filter = dim;
    stage.toggleAttribute("data-lit", P.veil > 0.001);
    veil.style.opacity = P.veil.toFixed(3);
    if (P.veil > 0.001) {
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + c.x;
      const cy = rect.top + c.y;
      // Uniform dim with only a faint lift around the coupon (no bright halo).
      const r = Math.max(this.L.cw, this.L.ch) * 0.7;
      veil.style.background = `radial-gradient(circle at ${cx.toFixed(0)}px ${cy.toFixed(0)}px, rgba(18,22,20,0.34) ${r.toFixed(0)}px, rgba(18,22,20,0.5) ${(r * 2.4).toFixed(0)}px)`;
    }
  }

  /** Dev harness: show the frame at t without firing events (no coupon is issued). */
  seek(t: number, mode: Mode = "hand", nudge = 0) {
    this.frozen = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.tween = null;
    this.t = t;
    this.mode = mode;
    this.input.breath = 0;
    this.input.nudge = nudge;
    this.render();
  }
}

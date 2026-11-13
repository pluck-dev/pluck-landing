"use client";

import { useEffect, useRef } from "react";
import { clamp, DEG, outCubic, ring, rng, seg } from "../paper/ease";
import {
  begin,
  BLUE,
  dprOf,
  drawInk,
  drawStampTool,
  fibers,
  fitCanvas,
  handledRim,
  INK,
  makeStampTool,
  offscreen,
  PAPER,
  rubberStamp,
  type StampTool,
} from "../paper/draw";
import { Loop, pageFont, paperFontReady, prefersReduced } from "../paper/runtime";
import { sfxScribble, sfxStamp, unlockSound, vibrate } from "../paper/sfx";
import { stampPose } from "../paper/stamp";
import "./sign.css";

/** Seconds of holding for the whole signature. */
const HOLD = 1.3;
/** After the last stroke: stamp hits at +0.25s, then a 0.6s rest before going to the form. */
const STAMP_AT = 0.25;
const GO_AT = 1.15;
const IDLE_MS = 7000;

type Pt = { x: number; y: number };

/**
 * A generic cursive scrawl (never the visitor's name): a run of loops (prolate cycloid) whose height
 * swells and fades, then a flourish underline. Points in a 0..1 box, seeded so it is the same every time.
 */
function scrawl(seed: number): Pt[] {
  const r = rng(seed);
  const pts: Pt[] = [];
  // Strokes of a made-up hand: each a loop of its own width/height; some are tall ascenders.
  const strokes = Array.from({ length: 7 }, (_, i) => ({
    w: 0.06 + r() * 0.06,
    h: i === 0 ? 0.62 : r() < 0.3 ? 0.5 + r() * 0.15 : 0.18 + r() * 0.2,
    open: 0.3 + r() * 0.5,
  }));
  let x = 0.03;
  for (const k of strokes) {
    const steps = 34;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const a = 2 * Math.PI * u;
      // Up-and-over loop, slanted forward (italic), ending lower than it started.
      const yy = 0.72 - k.h * (0.5 - 0.5 * Math.cos(a)) + 0.04 * u;
      const xx = x + k.w * u + k.w * k.open * Math.sin(a) * 0.6 + (0.72 - yy) * 0.22;
      pts.push({ x: xx, y: yy });
    }
    x += k.w;
  }
  // Flourish: a long low swash back under and out to the right.
  const last = pts[pts.length - 1];
  for (let i = 1; i <= 50; i++) {
    const u = i / 50;
    pts.push({ x: last.x - 0.42 * Math.sin(Math.PI * u * 0.55) + 0.62 * u * u, y: last.y + 0.12 * Math.sin(Math.PI * u) + 0.03 * u });
  }
  return pts;
}

/**
 * Pen progress → how much of the stroke is drawn. Not linear: quick through the loops, slower into the
 * turn before the flourish, a final flick (layered: base outCubic-ish + a wobble that never goes backward).
 */
export const strokeAt = (h: number) => clamp(h + 0.035 * Math.sin(h * 19) * (1 - h));

/**
 * /lp/go "작업 지시서" above the form (reveal-craft moment): a playful commitment slip, not a contract.
 * It restates the quiz answers and the estimate. Press and hold the signature line: a steel ballpoint
 * writes a scrawl while you hold (scratch sound by pen speed, 8 ms ticks); let go and it waits, hold again
 * and it continues. When it finishes the pen flicks off, a small "확인" stamp lands (쿵, [20,30,40], the slip
 * shakes), it rests 0.6 s, then the page scrolls to the form and focuses the name field.
 * Paths: hand (hold; keyboard: hold Space/Enter on the line) · plain button (straight to the form) ·
 * idle 7 s (the pen only wiggles over the line: signing stays the visitor's) · reduced motion (same hold,
 * no pen wiggle, no shake, the stamp ink just soaks in). render() is a pure function of (h, since-done, clock).
 */
export function GoSign({ rows, onDone }: { rows: [string, string][]; onDone: () => void }) {
  const slipRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const slip = slipRef.current;
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!slip || !canvas || !pad) return;
    const reduced = prefersReduced();
    const dpr = dprOf();
    const path = scrawl(41);
    let W = 0;
    let H = 0;
    let box = { x: 0, y: 0, w: 0, h: 0 };
    let paper: HTMLCanvasElement | null = null;
    let ink: ReturnType<typeof rubberStamp> | null = null;
    let tool: StampTool | null = null;
    let h = 0;
    let holding = false;
    let after = -1;
    let clock = 0;
    let went = false;
    let lastTick = 0;
    let idle = false;
    let idleTimer = 0;

    const measure = () => {
      W = slip.clientWidth;
      H = slip.clientHeight;
      fitCanvas(canvas, W, H, dpr);
      const r = pad.getBoundingClientRect();
      const s = slip.getBoundingClientRect();
      box = { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
      const { canvas: c, g } = offscreen(W, H, dpr);
      g.fillStyle = PAPER;
      g.fillRect(0, 0, W, H);
      fibers(g, 0, 0, W, H, 71, 60);
      handledRim(g, 0, 0, W, H, 0.12);
      // Carbon-copy rules, and the signature line.
      g.strokeStyle = "rgba(51,90,235,0.12)";
      g.lineWidth = 1;
      for (let y = 46; y < box.y - 6; y += 30) {
        g.beginPath();
        g.moveTo(16, y);
        g.lineTo(W - 16, y);
        g.stroke();
      }
      g.strokeStyle = "rgba(32,37,35,0.55)";
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(box.x + 8, box.y + box.h * 0.8);
      g.lineTo(box.x + box.w - 8, box.y + box.h * 0.8);
      g.stroke();
      g.fillStyle = "rgba(32,37,35,0.55)";
      g.font = `700 13px ${pageFont()}`;
      g.fillText("지시인 서명", box.x + 8, box.y + box.h * 0.8 + 18);
      paper = c;
      const s2 = 64;
      tool = makeStampTool(s2, s2, 5, "round");
      ink = rubberStamp({
        w: s2,
        h: s2,
        u: s2 / 30,
        font: pageFont(),
        shape: "round",
        seed: 52,
        specks: 90,
        stripeAt: 0.35,
        color: BLUE,
        lines: [
          { text: "확인", size: 8.6, weight: 800, y: 0.62 },
          { text: "PLUCK", size: 3, weight: 800, y: 0.32, spacing: 0.4 },
        ],
      });
    };

    const at = (k: number): Pt & { i: number } => {
      const i = Math.min(path.length - 1, Math.floor(k * (path.length - 1)));
      const p = path[i];
      // A hand doesn't widen with the slip: cap the scrawl's width on desktop.
      return { x: box.x + 10 + p.x * Math.min(box.w - 20, 360), y: box.y + 6 + p.y * (box.h * 0.8 - 4), i };
    };

    const render = () => {
      if (!paper || !ink) return;
      const g = begin(canvas, W, H, dpr);
      const sh = reduced || after < STAMP_AT ? 0 : ring(after - STAMP_AT, 1.8, 10, 12);
      slip.style.transform = sh ? `translate3d(${sh.toFixed(2)}px, ${(sh * 0.6).toFixed(2)}px, 0)` : "";
      g.drawImage(paper, 0, 0, W, H);
      // The stroke so far: width follows the pen's speed (fast = thin), ink a little uneven.
      const k = strokeAt(h);
      const end = at(k);
      g.lineCap = "round";
      g.lineJoin = "round";
      g.strokeStyle = INK;
      for (let i = 1; i <= end.i; i++) {
        const a = at(i / (path.length - 1));
        const b = at((i - 1) / (path.length - 1));
        const v = Math.hypot(a.x - b.x, a.y - b.y);
        g.lineWidth = clamp(2.6 - v * 0.35, 1.1, 2.6);
        g.globalAlpha = 0.86 + 0.1 * Math.sin(i * 0.7);
        g.beginPath();
        g.moveTo(b.x, b.y);
        g.lineTo(a.x, a.y);
        g.stroke();
      }
      g.globalAlpha = 1;
      // Stamp beside the signature once done.
      const stampX = box.x + box.w - 44;
      const stampY = box.y + box.h * 0.45;
      if (after >= 0) {
        const P = stampPose(after - STAMP_AT, -14 * DEG, reduced);
        if (P.ink) drawInk(g, ink, 64, 64, { x: stampX, y: stampY, rot: -14 * DEG, k: P.spread, alpha: 0.85 });
        if (P.alpha > 0.01 && !reduced) {
          drawStampTool(g, tool!, { x: stampX + P.dx, y: stampY + P.dy, height: P.h, rot: P.rot, sx: P.sx, sy: P.sy, alpha: P.alpha });
        }
      }
      // The pen: steel ballpoint leaning to the right, tip on the line while held, hovering otherwise.
      const pen = after >= 0 ? null : end;
      const lift = after >= 0 ? 1 : holding ? 0 : idle ? 0.35 + 0.12 * Math.sin(clock * 7) : 0.45;
      const flick = after >= 0 ? outCubic(seg(after, 0, 0.3)) : 0;
      const tip = pen ?? at(1);
      if (flick < 1) {
        const wig = idle && !holding ? Math.sin(clock * 9) * 3 : 0;
        const x = tip.x + wig + flick * 60;
        const y = tip.y - lift * 10 - flick * 50;
        g.save();
        g.globalAlpha = 1 - flick;
        g.save();
        g.translate(x + 6 + lift * 16, y + 8 + lift * 18);
        g.rotate(-55 * DEG);
        g.filter = `blur(${(1.5 + lift * 5).toFixed(1)}px)`;
        g.fillStyle = "rgba(32,37,35,0.22)";
        g.fillRect(0, -4, 96, 8);
        g.restore();
        g.translate(x, y);
        g.rotate(-55 * DEG);
        g.fillStyle = "#2b2f2d";
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(12, -3.2);
        g.lineTo(12, 3.2);
        g.closePath();
        g.fill();
        g.fillStyle = "#a7ada6";
        g.beginPath();
        g.roundRect(11, -4.4, 88, 8.8, 4.4);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.55)";
        g.fillRect(14, -3.6, 82, 1.6);
        g.fillStyle = "#6e746f";
        g.fillRect(30, -4.4, 3, 8.8);
        g.fillStyle = BLUE;
        g.beginPath();
        g.roundRect(70, -5.4, 22, 2.6, 1.3);
        g.fill();
        g.restore();
      }
    };

    const go = () => {
      if (went) return;
      went = true;
      doneRef.current();
    };

    const loop = new Loop((dt) => {
      clock += dt;
      if (holding && after < 0) {
        const before = h;
        // Reduced motion signs at the same pace: the pen line is the visitor's own press, not decoration.
        h = Math.min(1, h + dt / HOLD);
        const speed = clamp(((strokeAt(h) - strokeAt(before)) / Math.max(dt, 1e-3)) * 0.8);
        if (clock - lastTick > 0.06) {
          sfxScribble(speed);
          if (Math.floor(clock / 0.12) !== Math.floor((clock - dt) / 0.12)) vibrate(8);
          lastTick = clock;
        }
        if (h >= 1) {
          after = 0;
          slip.setAttribute("data-signed", "");
        }
      } else if (after >= 0) {
        const prev = after;
        after += dt;
        if (prev < STAMP_AT && after >= STAMP_AT) {
          sfxStamp(1);
          vibrate([20, 30, 40]);
        }
        if (after >= GO_AT) go();
      }
      render();
      return holding || (after >= 0 && after < GO_AT + 0.4) || idle;
    });

    const press = () => {
      if (after >= 0) return;
      unlockSound();
      holding = true;
      idle = false;
      window.clearTimeout(idleTimer);
      loop.wake();
    };
    const release = () => {
      holding = false;
      render();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      if (!holding) press();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") release();
    };
    const onDown = (event: PointerEvent) => {
      event.preventDefault();
      pad.setPointerCapture?.(event.pointerId);
      press();
    };
    pad.addEventListener("pointerdown", onDown);
    pad.addEventListener("pointerup", release);
    pad.addEventListener("pointercancel", release);
    pad.addEventListener("lostpointercapture", release);
    pad.addEventListener("keydown", onKeyDown);
    pad.addEventListener("keyup", onKeyUp);
    pad.addEventListener("contextmenu", (event) => event.preventDefault());

    let alive = true;
    void paperFontReady().then(() => {
      if (!alive) return;
      measure();
      render();
      idleTimer = window.setTimeout(() => {
        if (h === 0 && after < 0 && !reduced) {
          idle = true;
          loop.wake();
          window.setTimeout(() => {
            idle = false;
            render();
          }, 1600);
        }
      }, IDLE_MS);
    });
    const resize = new ResizeObserver(() => {
      if (paper && (slip.clientWidth !== W || slip.clientHeight !== H)) {
        measure();
        render();
      }
    });
    resize.observe(slip);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __sign?: unknown }).__sign = {
        /** Frame with pen progress hh, seconds since done (−1 = not yet), held or not. */
        seek: (hh: number, since = -1, held = false, c = 0) => {
          loop.stop();
          if (!paper) measure();
          h = hh;
          after = since;
          holding = held;
          clock = c;
          went = true;
          render();
        },
      };
    }

    return () => {
      alive = false;
      loop.stop();
      window.clearTimeout(idleTimer);
      resize.disconnect();
      pad.removeEventListener("pointerdown", onDown);
      pad.removeEventListener("pointerup", release);
      pad.removeEventListener("pointercancel", release);
      pad.removeEventListener("lostpointercapture", release);
      pad.removeEventListener("keydown", onKeyDown);
      pad.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="sgn">
      <p className="sgn-hint">꾹 눌러 서명하면 신청서로 가요</p>
      <div className="sgn-slip" ref={slipRef}>
        <canvas ref={canvasRef} className="sgn-canvas" aria-hidden="true" />
        <h3 className="sgn-title">작업 지시서</h3>
        <dl className="sgn-rows">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <button type="button" className="sgn-pad" ref={padRef} aria-label="길게 눌러 서명하기, 끝나면 신청서로 이동" />
      </div>
      <p className="go-tiny sgn-fine">재미로 하는 서명이에요 · 법적 효력 없음</p>
      <button type="button" className="button button-ghost sgn-plain" onClick={() => doneRef.current()}>
        서명 없이 입력하기
      </button>
    </div>
  );
}

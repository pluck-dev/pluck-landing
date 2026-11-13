"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DEG, inOutCubic, lerp, seg } from "../paper/ease";
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
  INSIDE,
  makeStampTool,
  offscreen,
  PAPER,
  PAPER_BACK,
  rubberStamp,
  type StampTool,
} from "../paper/draw";
import { Loop, pageFont, prefersReduced } from "../paper/runtime";
import { sfxFold, sfxSend, sfxStamp, vibrate } from "../paper/sfx";
import { sealLayout, sealPose, T_DROP, T_END, T_FLAP, T_FOLD1, T_FOLD2, T_SEND, T_STAMP, type SealLayout, type SealPose } from "./scene";
import "./seal.css";

export type SealSheet = { name: string; contact: string; kind: string; memo: string; coupon?: string };

const mask = (value: string) => {
  const v = value.trim();
  if (v.length <= 6) return v;
  return v.slice(0, 3) + "•".repeat(Math.min(6, v.length - 7)) + v.slice(-4);
};

const STAMP_W = 64;
const STAMP_H = 36;

class SealPainter {
  private dpr = dprOf();
  private face: HTMLCanvasElement;
  private ink: ReturnType<typeof rubberStamp>;
  private tool: StampTool;

  constructor(
    private L: SealLayout,
    private canvas: HTMLCanvasElement,
    private font: string,
    private sheet: SealSheet,
  ) {
    this.face = this.makeFace();
    this.ink = rubberStamp({
      w: STAMP_W,
      h: STAMP_H,
      u: STAMP_W / 27,
      font,
      lines: [
        { text: "PLUCK", size: 6.2, weight: 800, y: 0.58, spacing: 0.5 },
        { text: "개발 스튜디오", size: 2.6, weight: 600, y: 0.82 },
      ],
      seed: 11,
    });
    this.tool = makeStampTool(STAMP_W, STAMP_H, 7);
  }

  /** The sheet the visitor just filled in: same fields, their own words. */
  private makeFace() {
    const { cw, ch } = this.L;
    const { canvas, g } = offscreen(cw, ch);
    g.fillStyle = PAPER;
    g.fillRect(0, 0, cw, ch);
    fibers(g, 0, 0, cw, ch, 53);
    handledRim(g, 0, 0, cw, ch);
    const u = cw / 100;
    const x = 8 * u;
    g.fillStyle = INK;
    g.font = `800 ${6 * u}px ${this.font}`;
    g.fillText("기획안·견적 신청서", x, 13 * u);
    g.fillStyle = "#65725d";
    g.font = `600 ${3.4 * u}px ${this.font}`;
    g.fillText("PLUCK 앞", x, 19.5 * u);
    const rows: [string, string][] = [
      ["이름", this.sheet.name || "-"],
      ["연락처", mask(this.sheet.contact) || "-"],
      ["만들 것", this.sheet.kind],
      ["메모", this.sheet.memo || "-"],
    ];
    if (this.sheet.coupon) rows.push(["할인권", this.sheet.coupon]);
    let y = 32 * u;
    for (const [label, value] of rows) {
      g.fillStyle = "#65725d";
      g.font = `600 ${3.4 * u}px ${this.font}`;
      g.fillText(label, x, y);
      g.fillStyle = BLUE;
      g.font = `700 ${4.6 * u}px ${this.font}`;
      let text = value;
      while (g.measureText(text).width > cw - x - 30 * u && text.length > 2) text = text.slice(0, -2) + "…";
      g.fillText(text, x + 20 * u, y);
      g.strokeStyle = "rgba(32,37,35,0.22)";
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(x + 19 * u, y + 2.2 * u);
      g.lineTo(cw - x, y + 2.2 * u);
      g.stroke();
      y += 13 * u;
    }
    g.fillStyle = INK;
    g.font = `600 ${3.4 * u}px ${this.font}`;
    g.fillText("☑ 개인정보 수집·이용 동의", x, ch - 10 * u);
    return canvas;
  }

  draw(P: SealPose) {
    const L = this.L;
    const g = begin(this.canvas, L.W, L.H, this.dpr);
    g.translate(P.shake.x, P.shake.y);
    const folded = P.t >= T_DROP;

    // Envelope group (moves out the top when sending). While the sheet is still folding, the whole
    // envelope lies behind it; once the letter drops in: back panel, letter, then the front pocket.
    if (P.envIn > 0) {
      g.save();
      g.translate(L.env.x, L.env.y + (1 - P.envIn) * 14 + P.sendY);
      g.rotate(P.sendRot);
      g.globalAlpha = P.envIn;
      this.envelopeBack(g, P);
      if (folded) this.packet(g, P);
      this.envelopeFront(g, P);
      g.restore();
    }
    if (!folded) this.sheetFolding(g, P);
  }

  private sheetFolding(g: CanvasRenderingContext2D, P: SealPose) {
    const { cw, third, sheet } = this.L;
    const x0 = sheet.x;
    const y0 = sheet.y + P.bounce;
    const src = (i: number) => [0, (i * third * this.face.height) / (third * 3), this.face.width, (third * this.face.height) / (third * 3)] as const;
    // Shadow under the sheet (shrinks as it folds).
    const cover = 3 - (1 - Math.cos(P.f1)) / 2 - (1 - Math.cos(P.f2)) / 2;
    g.save();
    g.filter = "blur(8px)";
    g.fillStyle = "rgba(32,37,35,0.14)";
    const top = y0 + third * (1 - Math.max(0, Math.cos(P.f2)));
    g.fillRect(x0 + 4, top + 8, cw - 4, third * cover - 4);
    g.restore();

    // Middle third.
    g.drawImage(this.face, ...src(1), x0, y0 + third, cw, third);
    // Bottom third folds up about y = 2/3.
    this.flap(g, P.f1, 2, x0, y0 + third * 2, 1);
    // Top third folds down about y = 1/3 (after the bottom one, so it lies on top).
    this.flap(g, P.f2, 0, x0, y0 + third, -1);
  }

  /** One third of the sheet turning about a horizontal crease: front until 90°, then its back. */
  private flap(g: CanvasRenderingContext2D, theta: number, part: number, x0: number, hinge: number, dir: 1 | -1) {
    const { cw, third } = this.L;
    const c = Math.cos(theta);
    const h = third * Math.abs(c);
    // Nearer the eye while upright: a touch wider.
    const grow = 1 + 0.06 * Math.sin(theta);
    const w = cw * grow;
    const x = x0 - (w - cw) / 2;
    const sy = (part * third * this.face.height) / (third * 3);
    const sh = (third * this.face.height) / (third * 3);
    if (c >= 0) {
      const y = dir === 1 ? hinge : hinge - h;
      if (h < 0.5) return;
      g.drawImage(this.face, 0, sy, this.face.width, sh, x, y, w, h);
      g.fillStyle = `rgba(60,52,34,${(0.22 * (1 - c)).toFixed(3)})`;
      g.fillRect(x, y, w, h);
    } else {
      const y = dir === 1 ? hinge - h : hinge;
      if (h < 0.5) return;
      g.save();
      g.filter = "blur(4px)";
      g.fillStyle = "rgba(32,37,35,0.16)";
      g.fillRect(x + 2, y + (dir === 1 ? 4 : 6), w - 2, h);
      g.restore();
      g.fillStyle = PAPER_BACK;
      g.fillRect(x, y, w, h);
      g.fillStyle = `rgba(60,52,34,${(0.18 * (1 + c)).toFixed(3)})`;
      g.fillRect(x, y, w, h);
      g.strokeStyle = "rgba(32,37,35,0.16)";
      g.lineWidth = 1;
      g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }
  }

  /** The folded letter: back of the top third showing, crease at both long edges. */
  private packet(g: CanvasRenderingContext2D, P: SealPose) {
    const { cw, third, env } = this.L;
    const y = P.packetY - env.y;
    g.fillStyle = PAPER_BACK;
    g.fillRect(-cw / 2, y - third / 2, cw, third);
    g.strokeStyle = "rgba(32,37,35,0.18)";
    g.lineWidth = 1;
    g.strokeRect(-cw / 2 + 0.5, y - third / 2 + 0.5, cw - 1, third - 1);
    g.strokeStyle = "rgba(255,255,250,0.7)";
    g.beginPath();
    g.moveTo(-cw / 2 + 2, y - third / 2 + 1.5);
    g.lineTo(cw / 2 - 2, y - third / 2 + 1.5);
    g.stroke();
  }

  private envelopeBack(g: CanvasRenderingContext2D, P: SealPose) {
    const { ew, eh } = this.L;
    // Shadow on the table.
    g.save();
    g.filter = "blur(9px)";
    g.fillStyle = "rgba(32,37,35,0.18)";
    g.fillRect(-ew / 2 + 6, -eh / 2 + 12, ew - 6, eh - 4);
    g.restore();
    g.fillStyle = INSIDE;
    g.fillRect(-ew / 2, -eh / 2, ew, eh);
    // Open flap stands up behind the letter (inside colour), until it passes 90°.
    if (P.flap < Math.PI / 2) {
      const h = eh * 0.62 * Math.cos(P.flap);
      g.fillStyle = "#d6d2c2";
      g.beginPath();
      g.moveTo(-ew / 2, -eh / 2);
      g.lineTo(0, -eh / 2 - h);
      g.lineTo(ew / 2, -eh / 2);
      g.closePath();
      g.fill();
      g.strokeStyle = "rgba(32,37,35,0.14)";
      g.stroke();
    }
  }

  private envelopeFront(g: CanvasRenderingContext2D, P: SealPose) {
    const { ew, eh } = this.L;
    const top = -eh / 2 + 8;
    // Front pocket with the two side folds meeting low in the middle.
    g.fillStyle = PAPER;
    g.fillRect(-ew / 2, top, ew, eh / 2 - top);
    g.strokeStyle = "rgba(32,37,35,0.12)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(-ew / 2, top);
    g.lineTo(-ew * 0.08, eh * 0.18);
    g.moveTo(ew / 2, top);
    g.lineTo(ew * 0.08, eh * 0.18);
    g.stroke();
    g.strokeStyle = "rgba(32,37,35,0.16)";
    g.strokeRect(-ew / 2 + 0.5, -eh / 2 + 0.5, ew - 1, eh - 1);
    // Address, in the page's type.
    const u = ew / 100;
    g.fillStyle = "#65725d";
    g.font = `600 ${3.2 * u}px ${this.font}`;
    g.fillText("보내는 사람", -ew / 2 + 7 * u, eh / 2 - 13 * u);
    g.fillStyle = INK;
    g.font = `700 ${4.2 * u}px ${this.font}`;
    g.fillText(`${this.sheet.name || "신청하신 분"}`, -ew / 2 + 7 * u, eh / 2 - 6.5 * u);
    // Flap closing over the front (outside colour) once past 90°.
    if (P.flap >= Math.PI / 2) {
      const h = eh * 0.62 * -Math.cos(P.flap);
      g.save();
      g.filter = "blur(3px)";
      g.fillStyle = "rgba(32,37,35,0.14)";
      g.beginPath();
      g.moveTo(-ew / 2, -eh / 2 + 2);
      g.lineTo(0, -eh / 2 + h + 4);
      g.lineTo(ew / 2, -eh / 2 + 2);
      g.fill();
      g.restore();
      g.fillStyle = "#f1eee3";
      g.beginPath();
      g.moveTo(-ew / 2, -eh / 2);
      g.lineTo(0, -eh / 2 + h);
      g.lineTo(ew / 2, -eh / 2);
      g.closePath();
      g.fill();
      g.strokeStyle = "rgba(32,37,35,0.16)";
      g.stroke();
    }
    // PLUCK stamp on the front, upper right.
    const sx = ew / 2 - STAMP_W * 0.75;
    const sy = -eh / 2 + STAMP_H * 0.95;
    const S = P.stamp;
    if (S.ink) drawInk(g, this.ink, STAMP_W, STAMP_H, { x: sx, y: sy, rot: -7 * DEG, k: S.spread });
    if (S.alpha > 0) drawStampTool(g, this.tool, { x: sx + S.dx, y: sy + S.dy, height: S.h, rot: S.rot, sx: S.sx, sy: S.sy, alpha: S.alpha });
  }
}

/**
 * The success moment: the sheet the visitor filled in folds into an envelope, gets the PLUCK stamp and
 * slides out the top; then the existing thank-you text comes up. Mounted only inside QuoteLeadForm's
 * success render, i.e. after the server action returned success. Reduced motion: text only.
 * Tap/click skips to the text. Drag up on the envelope sends it right away (hand path).
 */
export function GoSeal({ sheet, children }: { sheet: SealSheet; children: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Mounted only on the client after a confirmed send, so window is there; reduced motion = text only.
  const [done, setDone] = useState(() => typeof window !== "undefined" && prefersReduced());
  const skipRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!stage || !canvas || !root) return;
    const W = stage.clientWidth;
    const L = sealLayout(W);
    fitCanvas(canvas, L.W, L.H);
    const painter = new SealPainter(L, canvas, pageFont(), sheet);
    let t = 0;
    let finished = false;

    const textEl = root.querySelector<HTMLElement>(".seal-text");
    const render = () => {
      const P = sealPose(t, L, false);
      painter.draw(P);
      root.style.setProperty("--seal-text", P.text.toFixed(3));
      // Once the envelope is gone the stage shrinks to the thank-you text (no jump at the end).
      const k = inOutCubic(seg(t, T_SEND + 0.5, T_END));
      stage.style.height = `${lerp(L.H, textEl?.offsetHeight ?? 0, k).toFixed(1)}px`;
    };
    const advance = (next: number) => {
      const prev = t;
      t = Math.min(T_END, next);
      const crossed = (at: number) => prev < at && t >= at;
      if (crossed(T_FOLD1 + 0.02) || crossed(T_FOLD2 + 0.02)) {
        sfxFold();
        vibrate(8);
      }
      if (crossed(T_FLAP + 0.3)) vibrate(8);
      if (crossed(T_STAMP)) {
        sfxStamp(1);
        vibrate([20, 30, 40]);
      }
      if (crossed(T_SEND + 0.1)) sfxSend();
      if (t >= T_END) finish();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      t = T_END;
      render();
      setDone(true);
    };
    const loop = new Loop((dt) => {
      advance(t + dt);
      render();
      return !finished;
    });
    render();
    loop.wake();

    skipRef.current = () => {
      loop.stop();
      finish();
    };
    // Hand: flick the envelope up once it's stamped → it leaves now.
    let y0: number | null = null;
    const down = (event: PointerEvent) => {
      y0 = event.clientY;
    };
    const up = (event: PointerEvent) => {
      if (y0 === null) return;
      const dy = event.clientY - y0;
      y0 = null;
      if (dy < -24 && t > T_STAMP + 0.1 && t < T_SEND) t = T_SEND;
      else if (Math.abs(dy) < 8) skipRef.current();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointerup", up);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __seal?: unknown }).__seal = {
        seek: (at: number) => {
          loop.stop();
          t = at;
          render();
        },
      };
    }
    return () => {
      loop.stop();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointerup", up);
    };
    // The sheet is what was sent; it doesn't change while this plays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done) rootRef.current?.style.setProperty("--seal-text", "1");
  }, [done]);

  return (
    <div className="seal" ref={rootRef} data-done={done ? "" : undefined}>
      {!done && (
        <div className="seal-stage" ref={stageRef} aria-hidden="true">
          <canvas ref={canvasRef} />
        </div>
      )}
      <div className="seal-text">{children}</div>
    </div>
  );
}

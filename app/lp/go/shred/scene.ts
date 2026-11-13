/**
 * /lp/go "총액만 적힌 견적은 그만": a desk shredder as a pure function (reveal-craft moment).
 *
 * p 0→1 (the visitor's scroll, forward only) feeds three total-only example quotes, one after another,
 * into the shredder: each is lifted out of the wire tray, lowered over the slot and drawn in; 14 strips
 * come out under the head, each curling and twisting its own way, and drop into the wire basket when the
 * tail goes through. Then the motor stops and the last sheet in the tray, the itemised PLUCK quote,
 * is handed out over the shredder: that part runs on its own clock `land` (seconds) so it always lands.
 *
 *   p  0.02+i·0.26   sheet i lifts out of the tray (outCubic + arc)
 *      +0.05→+0.22   fed into the slot (strips curl out, motor jitter)
 *      +0.22→+0.25   tail swallowed, strips fall into the pile (inCubic + bounce)
 *      0.80          motor off
 *      ≥ 0.82        land clock starts: lift 0→0.25s, travel 0.25→0.85s, LAND at 0.85s, settle to 1.4s
 *
 * render() draws everything from (p, land, motor, clock); the runtime only moves those numbers.
 */
import { clamp, DEG, inCubic, inOutCubic, lerp, outCubic, ring, rng, seg } from "../paper/ease";
import { fibers, handledRim, INK, offscreen, PAPER, rubberStamp, BLUE } from "../paper/draw";

export const SHEETS = 3;
export const STRIPS = 14;
export const sheetStart = (i: number) => 0.02 + i * 0.26;
export const LIFT = 0.05;
export const FEED = 0.22;
export const DROP = 0.25;
export const MOTOR_OFF = 0.8;
export const HAND_OUT = 0.82;
export const LAND = 0.85;
export const LAND_END = 1.4;

export type Layout = {
  W: number;
  H: number;
  cx: number;
  sw: number;
  sh: number;
  trayTop: number;
  slotY: number;
  hw: number;
  hh: number;
  binTop: number;
  binBottom: number;
  binW: number;
  fw: number;
  fh: number;
  restY: number;
};

export function layout(W: number, H: number): Layout {
  const cx = W / 2;
  const slotY = Math.round(H * 0.6);
  const trayTop = 22;
  // Sheets standing in the tray must clear the shredder's lid.
  const sw = Math.round(Math.min(W * 0.7, 330, (slotY - 40 - trayTop) / 1.32));
  const sh = Math.round(sw * 1.32);
  const hw = Math.round(sw * 1.26);
  const hh = Math.round(Math.max(52, sw * 0.24));
  const binTop = slotY + hh;
  const binBottom = H - 6;
  const fw = Math.round(Math.min(W * 0.92, 380));
  const fh = Math.round(fw * 1.12);
  const restY = Math.round(clamp(H * 0.55, fh / 2 + 8, H - fh / 2 - 8));
  return { W, H, cx, sw, sh, trayTop, slotY, hw, hh, binTop, binBottom, binW: Math.round(hw * 0.9), fw, fh, restY };
}

/* ---------- baked assets ---------- */

export type Quote = { total: string };
export type Row = { label: string; amount: string };
export type PluckSheet = { rows: Row[]; total: string; note: string };

export type Assets = {
  quotes: HTMLCanvasElement[];
  pluck: HTMLCanvasElement;
  head: HTMLCanvasElement;
  lid: HTMLCanvasElement;
  tray: HTMLCanvasElement;
  /** The PLUCK quote's back: it waits face-down in the tray and flips over when handed out. */
  back: HTMLCanvasElement;
  piles: HTMLCanvasElement[];
  stripTwist: number[];
  stripCurl: number[];
};

/** A total-only competitor-style quote: title, a blank 귀하 line, one vague line, the total. "(예시)" stamped. */
function bakeQuote(w: number, h: number, total: string, seed: number, font: string) {
  const { canvas, g } = offscreen(w, h);
  g.fillStyle = "#efede4";
  g.fillRect(0, 0, w, h);
  fibers(g, 0, 0, w, h, seed, 55);
  handledRim(g, 0, 0, w, h, 0.14);
  const u = w / 100;
  g.fillStyle = INK;
  g.textAlign = "center";
  g.font = `800 ${9 * u}px ${font}`;
  g.fillText("견 적 서", w / 2, 17 * u);
  g.strokeStyle = "rgba(32,37,35,0.55)";
  g.lineWidth = Math.max(1, 0.5 * u);
  g.beginPath();
  g.moveTo(w / 2 - 17 * u, 20 * u);
  g.lineTo(w / 2 + 17 * u, 20 * u);
  g.stroke();
  g.textAlign = "left";
  g.font = `600 ${4.6 * u}px ${font}`;
  g.fillStyle = "rgba(32,37,35,0.75)";
  g.fillText("귀하", 46 * u, 32 * u);
  g.strokeStyle = "rgba(32,37,35,0.3)";
  g.beginPath();
  g.moveTo(10 * u, 33 * u);
  g.lineTo(44 * u, 33 * u);
  g.stroke();
  // A table with one vague line and lots of nothing.
  const top = 42 * u;
  g.strokeStyle = "rgba(32,37,35,0.28)";
  g.lineWidth = Math.max(0.8, 0.3 * u);
  g.strokeRect(10 * u, top, 80 * u, 54 * u);
  g.beginPath();
  g.moveTo(10 * u, top + 9 * u);
  g.lineTo(90 * u, top + 9 * u);
  g.moveTo(62 * u, top);
  g.lineTo(62 * u, top + 54 * u);
  for (let r = 1; r < 6; r++) {
    g.moveTo(10 * u, top + 9 * u + r * 9 * u);
    g.lineTo(90 * u, top + 9 * u + r * 9 * u);
  }
  g.stroke();
  g.fillStyle = "rgba(32,37,35,0.7)";
  g.font = `700 ${4.2 * u}px ${font}`;
  g.fillText("품목", 13 * u, top + 6.4 * u);
  g.fillText("금액", 65 * u, top + 6.4 * u);
  g.font = `600 ${4.4 * u}px ${font}`;
  g.fillText("개발비 일체", 13 * u, top + 15.6 * u);
  g.fillText("—", 72 * u, top + 15.6 * u);
  // The total, big: the only thing this sheet says.
  g.fillStyle = INK;
  g.font = `700 ${5 * u}px ${font}`;
  g.fillText("합계", 10 * u, 110 * u);
  g.textAlign = "right";
  g.font = `800 ${11 * u}px ${font}`;
  g.fillText(total, 90 * u, 112 * u);
  g.textAlign = "left";
  g.font = `700 ${4.2 * u}px ${font}`;
  g.fillStyle = "rgba(32,37,35,0.6)";
  g.fillText("(예시)", 10 * u, 124 * u);
  const stamp = rubberStamp({ w: 24 * u, h: 12 * u, u: u * 0.5, font, seed: seed + 3, specks: 90, color: "#7a7f78", lines: [{ text: "(예시)", size: 7, weight: 800, y: 0.66 }] });
  g.save();
  g.translate(74 * u, 22 * u);
  g.rotate(-8 * DEG);
  g.globalAlpha = 0.8;
  g.drawImage(stamp.canvas, -12 * u - stamp.pad, -6 * u - stamp.pad);
  g.restore();
  return canvas;
}

/** The itemised PLUCK quote (pricing.ts rows), printed clean with a blue studio stamp. */
function bakePluck(w: number, h: number, sheet: PluckSheet, font: string) {
  const { canvas, g } = offscreen(w, h);
  g.fillStyle = PAPER;
  g.fillRect(0, 0, w, h);
  fibers(g, 0, 0, w, h, 91, 60);
  handledRim(g, 0, 0, w, h, 0.1);
  const u = w / 100;
  const x0 = 8 * u;
  const x1 = 92 * u;
  g.fillStyle = INK;
  g.font = `800 ${7.4 * u}px ${font}`;
  g.fillText("견적서", x0, 13 * u);
  g.textAlign = "right";
  g.font = `800 ${4.6 * u}px ${font}`;
  g.fillStyle = BLUE;
  g.fillText("PLUCK", x1, 12.6 * u);
  g.textAlign = "left";
  g.strokeStyle = INK;
  g.lineWidth = Math.max(1.2, 0.45 * u);
  g.beginPath();
  g.moveTo(x0, 17 * u);
  g.lineTo(x1, 17 * u);
  g.stroke();
  const rowH = 9.4 * u;
  let y = 17 * u + rowH * 0.78;
  g.font = `600 ${4.5 * u}px ${font}`;
  for (const row of sheet.rows) {
    g.fillStyle = "rgba(32,37,35,0.82)";
    g.textAlign = "left";
    g.fillText(row.label, x0, y);
    g.textAlign = "right";
    g.fillStyle = INK;
    g.fillText(row.amount, x1, y);
    g.strokeStyle = "rgba(32,37,35,0.18)";
    g.lineWidth = 1;
    g.setLineDash([2, 3]);
    g.beginPath();
    g.moveTo(x0, y + rowH * 0.34);
    g.lineTo(x1, y + rowH * 0.34);
    g.stroke();
    g.setLineDash([]);
    y += rowH;
  }
  y += rowH * 0.12;
  g.strokeStyle = INK;
  g.lineWidth = Math.max(1.2, 0.45 * u);
  g.beginPath();
  g.moveTo(x0, y - rowH * 0.62);
  g.lineTo(x1, y - rowH * 0.62);
  g.stroke();
  g.textAlign = "left";
  g.fillStyle = INK;
  g.font = `800 ${5.2 * u}px ${font}`;
  g.fillText("합계", x0, y + 1.4 * u);
  g.textAlign = "right";
  g.fillStyle = BLUE;
  g.font = `800 ${6.4 * u}px ${font}`;
  g.fillText(sheet.total, x1, y + 1.8 * u);
  g.textAlign = "left";
  g.fillStyle = "rgba(32,37,35,0.6)";
  g.font = `600 ${3.5 * u}px ${font}`;
  g.fillText(sheet.note, x0, h - 6 * u);
  const s = 22 * u;
  const stamp = rubberStamp({
    w: s,
    h: s,
    u: s / 30,
    font,
    shape: "round",
    seed: 77,
    specks: 120,
    stripeAt: 0.3,
    color: BLUE,
    lines: [
      { text: "항목별", size: 6.2, weight: 800, y: 0.58 },
      { text: "PLUCK", size: 3, weight: 800, y: 0.32, spacing: 0.4 },
    ],
  });
  g.save();
  g.translate(x1 - s * 0.55, h - 15 * u);
  g.rotate(-12 * DEG);
  g.globalAlpha = 0.86;
  g.drawImage(stamp.canvas, -s / 2 - stamp.pad, -s / 2 - stamp.pad);
  g.restore();
  return canvas;
}

/** Shredder head: dark painted steel, brushed, a vent and a rocker switch. Front face only. */
function bakeHead(w: number, h: number) {
  const { canvas, g } = offscreen(w, h);
  const body = () => {
    g.beginPath();
    g.roundRect(0, 0, w, h, [4, 4, 12, 12]);
  };
  g.fillStyle = "#3a3f3c";
  body();
  g.fill();
  g.save();
  body();
  g.clip();
  const r = rng(5);
  for (let y = 0; y < h; y += 1.5) {
    g.strokeStyle = `rgba(255,255,255,${0.015 + r() * 0.03})`;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  // Top edge catches light, bottom edge falls into shade.
  g.fillStyle = "rgba(255,255,255,0.1)";
  g.fillRect(0, 0, w, 2);
  g.fillStyle = "rgba(0,0,0,0.22)";
  g.fillRect(0, h - 5, w, 5);
  g.restore();
  // Vent grooves.
  for (let i = 0; i < 5; i++) {
    const y = h * 0.34 + i * 5;
    g.fillStyle = "rgba(0,0,0,0.38)";
    g.beginPath();
    g.roundRect(w * 0.08, y, w * 0.2, 2.2, 1);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.07)";
    g.fillRect(w * 0.08, y + 2.2, w * 0.2, 0.8);
  }
  // Rocker switch (on side pressed in).
  const sx = w * 0.8;
  const sy = h * 0.32;
  g.fillStyle = "#262a28";
  g.beginPath();
  g.roundRect(sx, sy, 22, 14, 3);
  g.fill();
  g.fillStyle = "#4a504c";
  g.beginPath();
  g.roundRect(sx + 2, sy + 2, 10, 10, 2);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.12)";
  g.fillRect(sx + 2, sy + 2, 10, 1.2);
  // Screws.
  for (const x of [8, w - 8]) {
    g.fillStyle = "#6d736e";
    g.beginPath();
    g.arc(x, h - 11, 2.4, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(0,0,0,0.45)";
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(x - 1.6, h - 11);
    g.lineTo(x + 1.6, h - 11);
    g.stroke();
  }
  return canvas;
}

/** Lid seen a little from above, with the feed slot across it. */
function bakeLid(w: number, h: number, slotW: number) {
  const { canvas, g } = offscreen(w, h);
  g.fillStyle = "#545a56";
  g.beginPath();
  g.moveTo(8, 0);
  g.lineTo(w - 8, 0);
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.closePath();
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.08)";
  g.fillRect(8, 0, w - 16, 1.5);
  g.fillStyle = "#151816";
  g.beginPath();
  g.roundRect((w - slotW) / 2, h * 0.38, slotW, 3.2, 1.6);
  g.fill();
  return canvas;
}

/** Wire letter tray: a back plate and side posts (the front rails are drawn live, over the sheets). */
function bakeTray(w: number, h: number) {
  const { canvas, g } = offscreen(w, h);
  g.fillStyle = "#cfd2cb";
  g.beginPath();
  g.roundRect(6, 0, w - 12, h, 6);
  g.fill();
  const r = rng(9);
  g.save();
  g.beginPath();
  g.roundRect(6, 0, w - 12, h, 6);
  g.clip();
  for (let x = 6; x < w; x += 1.4) {
    g.strokeStyle = `rgba(${r() < 0.5 ? "255,255,255" : "60,66,62"},${0.02 + r() * 0.03})`;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }
  g.restore();
  g.strokeStyle = "rgba(60,66,62,0.35)";
  g.lineWidth = 1;
  g.beginPath();
  g.roundRect(6.5, 0.5, w - 13, h - 1, 6);
  g.stroke();
  for (const x of [3, w - 3]) {
    g.fillStyle = "#9da29b";
    g.fillRect(x - 3, 0, 6, h);
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.fillRect(x - 2, 0, 1.4, h);
  }
  return canvas;
}

function bakeBack(w: number, h: number) {
  const { canvas, g } = offscreen(w, h);
  g.fillStyle = "#eceadf";
  g.fillRect(0, 0, w, h);
  fibers(g, 0, 0, w, h, 93, 55);
  handledRim(g, 0, 0, w, h, 0.12);
  // Print showing through from the other side: a few faint mirrored rows.
  g.fillStyle = "rgba(32,37,35,0.06)";
  for (let i = 0; i < 7; i++) g.fillRect(w * (0.08 + (i % 2) * 0.04), h * (0.2 + i * 0.075), w * (0.3 + ((i * 37) % 30) / 100), h * 0.018);
  g.fillStyle = "rgba(51,90,235,0.08)";
  g.fillRect(w * 0.12, h * 0.8, w * 0.38, h * 0.03);
  return canvas;
}

/** A pile of shredded strips lying in the basket (one per sheet, so it grows). */
function bakePile(w: number, h: number, seed: number, paper: string) {
  const { canvas, g } = offscreen(w, h);
  const r = rng(seed);
  for (let i = 0; i < 70; i++) {
    const x = r() * w;
    const y = h * 0.25 + r() * h * 0.75;
    const len = 18 + r() * 40;
    const a0 = (r() - 0.5) * Math.PI;
    const c = (r() - 0.5) * 0.12;
    const width = 3 + r() * 2.5;
    g.lineCap = "round";
    g.lineWidth = width + 1;
    g.strokeStyle = "rgba(60,58,48,0.22)";
    const path = () => {
      g.beginPath();
      let px = x;
      let py = y;
      let a = a0;
      g.moveTo(px, py);
      for (let s = 0; s < len; s += 3) {
        a += c * 3;
        px += Math.cos(a) * 3;
        py += Math.sin(a) * 3 * 0.55;
        g.lineTo(px, py);
      }
    };
    path();
    g.stroke();
    g.lineWidth = width;
    g.strokeStyle = r() < 0.2 ? "#d9d6ca" : paper;
    path();
    g.stroke();
    if (r() < 0.35) {
      g.lineWidth = 0.8;
      g.strokeStyle = "rgba(32,37,35,0.45)";
      path();
      g.stroke();
    }
  }
  return canvas;
}

export function bakeAssets(L: Layout, quotes: Quote[], pluck: PluckSheet, font: string): Assets {
  const r = rng(2026);
  return {
    quotes: quotes.map((q, i) => bakeQuote(L.sw, L.sh, q.total, 30 + i * 11, font)),
    pluck: bakePluck(L.fw, L.fh, pluck, font),
    head: bakeHead(L.hw, L.hh),
    lid: bakeLid(L.hw, 14, L.sw + 16),
    tray: bakeTray(L.sw + 44, Math.round(L.sh * 0.52)),
    back: bakeBack(L.sw, Math.round(L.sw * 1.12)),
    piles: Array.from({ length: SHEETS }, (_, i) => bakePile(L.binW, Math.round((L.binBottom - L.binTop) * 0.3), 300 + i * 17, "#efede4")),
    stripTwist: Array.from({ length: STRIPS * SHEETS }, () => (r() - 0.5) * 0.022),
    stripCurl: Array.from({ length: STRIPS * SHEETS }, () => (r() < 0.5 ? -1 : 1) * (0.0012 + r() * 0.0036)),
  };
}

/* ---------- poses ---------- */

/** Where sheet k stands in the tray (k = 0 is the front one, taken first; 3 = the PLUCK quote at the back). */
export function trayPose(L: Layout, k: number) {
  return { x: L.cx + (1.5 - k) * 9, top: L.trayTop + k * 5, rot: (k - 1.5) * 1.3 * DEG };
}

/**
 * Sheet i of the shredded three at progress p.
 * stage: "tray" | "lift" | "feed" | "gone"; fed = px of the sheet that went through the slot.
 */
export function sheetPose(L: Layout, i: number, p: number) {
  const b = sheetStart(i);
  const T = trayPose(L, i);
  const readyTop = L.slotY - L.sh - 6;
  if (p < b) return { stage: "tray" as const, x: T.x, top: T.top, rot: T.rot, fed: 0, lift: 0 };
  if (p < b + LIFT) {
    const k = seg(p, b, b + LIFT);
    const e = outCubic(k);
    return {
      stage: "lift" as const,
      x: lerp(T.x, L.cx, inOutCubic(k)),
      top: lerp(T.top, readyTop, e) - Math.sin(Math.PI * k) * 26,
      rot: lerp(T.rot, 0, e) + ring(k, 3 * DEG, 5, 1.2),
      fed: 0,
      lift: Math.sin(Math.PI * k),
    };
  }
  if (p < b + FEED) {
    const k = seg(p, b + LIFT, b + FEED);
    const fed = (L.sh + 6) * k;
    return { stage: "feed" as const, x: L.cx, top: readyTop + fed, rot: 0, fed, lift: 0 };
  }
  return { stage: "gone" as const, x: L.cx, top: L.slotY, rot: 0, fed: L.sh + 6, lift: 0 };
}

/** The PLUCK quote's hand-out on its own clock (seconds since p crossed HAND_OUT; < 0 = still in the tray). */
export function pluckPose(L: Layout, land: number) {
  const T = trayPose(L, 3);
  const s0 = L.sw / L.fw;
  if (land < 0) return { x: T.x, y: T.top + (L.fh * s0) / 2, rot: T.rot, scale: s0, lift: 0, landed: false };
  const up = outCubic(seg(land, 0, 0.25));
  const k = inOutCubic(seg(land, 0.25, LAND));
  const ys = T.top + (L.fh * s0) / 2 - 26 * up;
  const settle = land >= LAND ? ring(land - LAND, 1.6 * DEG, 7, 2.2) : 0;
  const bounce = land >= LAND ? ring(land - LAND, -3, 9, 3) : 0;
  return {
    x: lerp(T.x, L.cx, k),
    y: lerp(ys, L.restY, k) + bounce,
    rot: lerp(T.rot, -1.2 * DEG, outCubic(seg(land, 0.25, LAND))) + Math.sin(Math.PI * k) * 4 * DEG + settle,
    scale: lerp(s0, 1, outCubic(seg(land, 0.3, LAND))),
    lift: land < LAND ? Math.max(up, Math.sin(Math.PI * k)) : 0,
    landed: land >= LAND,
  };
}

/** Desk shake at the landing: damped sine, 0 at rest. */
export const landShake = (land: number) =>
  land >= LAND ? { x: ring(land - LAND, 2, 9, 11), y: ring(land - LAND, 1.4, 9, 14, 1) } : { x: 0, y: 0 };

/* ---------- render ---------- */

export type Frame = { p: number; land: number; motor: number; clock: number; reduced?: boolean };

export function render(g: CanvasRenderingContext2D, L: Layout, A: Assets, F: Frame) {
  const { p, land, motor, clock } = F;
  const shake = F.reduced ? { x: 0, y: 0 } : landShake(land);
  const jx = F.reduced ? 0 : Math.sin(clock * 93) * 0.8 * motor;
  const jy = F.reduced ? 0 : Math.sin(clock * 71 + 1) * 0.6 * motor;
  g.save();
  g.translate(shake.x, shake.y);

  // Tray: back plate, the sheets still in it (back to front), then its two front rails.
  const trayRattle = F.reduced ? 0 : land >= LAND ? ring(land - LAND, 1.2, 10, 12) : 0;
  const tx = L.cx - (L.sw + 44) / 2;
  const plateH = A.tray.height / (A.tray.width / (L.sw + 44));
  const tTop = L.trayTop + L.sh + 8 - plateH + trayRattle;
  g.drawImage(A.tray, tx, tTop, L.sw + 44, plateH);
  if (land < 0) drawSheetAt(g, A.back, trayPose(L, 3), L.sw, L.sw * (L.fh / L.fw), 0);
  for (let i = SHEETS - 1; i >= 0; i--) {
    const P = sheetPose(L, i, p);
    if (P.stage === "tray") drawSheetAt(g, A.quotes[i], P, L.sw, L.sh, 0);
  }
  for (const f of [0.3, 0.96]) {
    const y = tTop + plateH * f;
    g.fillStyle = "#8f948d";
    g.beginPath();
    g.roundRect(tx - 2, y, L.sw + 48, 5, 2.5);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.45)";
    g.fillRect(tx, y + 1, L.sw + 44, 1.2);
  }

  // Basket interior (behind strips): a darker floor seen through the mesh.
  const bx = L.cx - L.binW / 2 + jx * 0.4;
  const bTop = L.binTop;
  const bH = L.binBottom - bTop;
  g.fillStyle = "rgba(32,37,35,0.16)";
  g.beginPath();
  g.roundRect(bx, bTop, L.binW, bH, [0, 0, 10, 10]);
  g.fill();

  // Pile: one bundle per sheet already swallowed, each dropping in and bouncing.
  g.save();
  g.beginPath();
  g.rect(bx + 2, bTop, L.binW - 4, bH - 2);
  g.clip();
  const ph = A.piles[0].height / (A.piles[0].width / L.binW);
  for (let i = 0; i < SHEETS; i++) {
    const b = sheetStart(i);
    const k = seg(p, b + FEED, b + DROP);
    if (k <= 0) continue;
    const settle = F.reduced ? 0 : land >= LAND ? ring(land - LAND, -2.5, 8, 6) : 0;
    const y = L.binBottom - ph * (0.8 + i * 0.6) + (1 - outCubic(k)) * ph * 0.6 + settle;
    g.globalAlpha = clamp(k * 1.6);
    g.drawImage(A.piles[i], bx, y, L.binW, ph);
  }
  g.globalAlpha = 1;
  g.restore();

  // Active sheets: strips under the head, then the part still above the slot.
  for (let i = 0; i < SHEETS; i++) {
    const P = sheetPose(L, i, p);
    if (P.stage === "tray") continue;
    const b = sheetStart(i);
    const fall = seg(p, b + FEED, b + DROP);
    if (P.fed > L.hh && fall < 1) drawStrips(g, L, A, i, P.fed, fall, jx, jy, bx, bTop, bH);
  }
  // Lid back half, then the sheet above the slot (it goes in behind the lid's front half).
  g.drawImage(A.lid, L.cx - L.hw / 2 + jx, L.slotY - 14 + jy, L.hw, 14);
  for (let i = 0; i < SHEETS; i++) {
    const P = sheetPose(L, i, p);
    if (P.stage === "tray" || P.stage === "gone") continue;
    g.save();
    g.beginPath();
    g.rect(0, -400, L.W, L.slotY - 8.5 + jy + 400);
    g.clip();
    const wob = P.stage === "feed" && !F.reduced ? Math.sin(clock * 37 + i) * 0.5 * motor * DEG : 0;
    drawSheetAt(g, A.quotes[i], { ...P, x: P.x + jx * 0.6, rot: P.rot + wob }, L.sw, L.sh, P.lift);
    g.restore();
  }
  // Head front face.
  g.drawImage(A.head, L.cx - L.hw / 2 + jx, L.slotY - 1 + jy, L.hw, L.hh);

  // Basket mesh over everything inside it.
  drawMesh(g, bx, bTop, L.binW, bH);

  // The PLUCK quote, handed out over the shredder: the desk behind it washes out to the page colour
  // (focus without a dark box), the sheet flips face-up on the way.
  if (land >= 0) {
    const P = pluckPose(L, land);
    const wash = outCubic(seg(land, 0.2, LAND + 0.2));
    if (wash > 0) {
      g.fillStyle = `rgba(247,247,242,${(0.38 * wash).toFixed(3)})`;
      g.fillRect(-20, -20, L.W + 40, L.H + 40);
    }
    const flip = Math.cos(Math.PI * outCubic(seg(land, 0.22, 0.7)));
    const w = L.fw * P.scale * Math.max(0.02, Math.abs(flip));
    const h = L.fh * P.scale;
    g.save();
    g.filter = `blur(${(4 + P.lift * 12).toFixed(1)}px)`;
    g.fillStyle = `rgba(32,37,35,${(0.2 * (1 - 0.4 * P.lift)).toFixed(3)})`;
    g.translate(P.x + 3 + P.lift * 14, P.y + 6 + P.lift * 22);
    g.rotate(P.rot);
    g.fillRect(-w / 2, -h / 2, w, h);
    g.restore();
    g.save();
    g.translate(P.x, P.y);
    g.rotate(P.rot);
    g.drawImage(flip > 0 ? A.back : A.pluck, -w / 2, -h / 2, w, h);
    // Edge-on: the sheet catches a little shade.
    if (Math.abs(flip) < 0.6) {
      g.fillStyle = `rgba(32,37,35,${(0.18 * (1 - Math.abs(flip) / 0.6)).toFixed(3)})`;
      g.fillRect(-w / 2, -h / 2, w, h);
    }
    g.restore();
  }
  g.restore();
}

function drawSheetAt(
  g: CanvasRenderingContext2D,
  tex: HTMLCanvasElement,
  P: { x: number; top: number; rot: number },
  w: number,
  h: number,
  lift: number,
) {
  g.save();
  g.filter = `blur(${(2 + lift * 8).toFixed(1)}px)`;
  g.fillStyle = `rgba(32,37,35,${(0.16 * (1 - 0.4 * lift)).toFixed(3)})`;
  g.translate(P.x + 2 + lift * 8, P.top + h / 2 + 3 + lift * 12);
  g.rotate(P.rot);
  g.fillRect(-w / 2, -h / 2, w, h);
  g.restore();
  g.save();
  g.translate(P.x, P.top + h / 2);
  g.rotate(P.rot);
  g.drawImage(tex, -w / 2, -h / 2, w, h);
  g.restore();
}

/**
 * The strips of sheet i hanging out under the head. Each strip is a chain of short texture slices: its
 * angle bends more along its length (curl) and it twists (width foreshortened by |cos|, darker when edge-on).
 * `fall` 0→1: the tail has gone through, the bundle drops into the basket.
 */
function drawStrips(
  g: CanvasRenderingContext2D,
  L: Layout,
  A: Assets,
  i: number,
  fed: number,
  fall: number,
  jx: number,
  jy: number,
  bx: number,
  bTop: number,
  bH: number,
) {
  const tex = A.quotes[i];
  const scale = tex.width / L.sw;
  const len = Math.min(fed - L.hh, L.sh);
  const sw = L.sw / STRIPS;
  const exitY = L.binTop + jy;
  const drop = inCubic(fall) * bH * 0.7;
  g.save();
  g.beginPath();
  g.rect(bx + 2, bTop, L.binW - 4, bH - 2);
  g.clip();
  g.globalAlpha = 1 - fall * 0.85;
  const STEP = 5;
  for (let j = 0; j < STRIPS; j++) {
    const id = i * STRIPS + j;
    const curl = A.stripCurl[id] * (1 + fall * 2);
    const twist = A.stripTwist[id];
    const sx = L.cx - L.sw / 2 + j * sw + jx;
    let x = sx + sw / 2;
    let y = exitY + drop;
    const fan = (j - (STRIPS - 1) / 2) * 0.012;
    // The leading end of the strip is the sheet's bottom edge: texture rows sh-len .. sh.
    for (let u = 0; u < len - 1; u += STEP) {
      const a = Math.PI / 2 - fan - curl * u * u * 0.012;
      const psi = twist * u;
      const wf = Math.max(0.22, Math.abs(Math.cos(psi)));
      const row = L.sh - len + u;
      g.save();
      g.translate(x, y);
      g.rotate(a - Math.PI / 2);
      // Slices overlap by 1.6px so the chain never shows seams.
      g.drawImage(tex, j * sw * scale, row * scale, sw * scale, (STEP + 1.6) * scale, (-sw / 2) * wf, 0, sw * wf, STEP + 1.6);
      const dark = (1 - wf) * 0.35;
      if (dark > 0.01) {
        g.fillStyle = `rgba(32,37,35,${dark.toFixed(3)})`;
        g.fillRect((-sw / 2) * wf, 0, sw * wf, STEP + 1.6);
      }
      g.restore();
      x += Math.cos(a) * STEP;
      y += Math.sin(a) * STEP;
    }
  }
  g.restore();
}

function drawMesh(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.save();
  g.strokeStyle = "rgba(58,63,60,0.32)";
  g.lineWidth = 0.9;
  for (let vx = x + 8; vx < x + w - 4; vx += 12) {
    g.beginPath();
    g.moveTo(vx, y);
    g.lineTo(vx, y + h - 4);
    g.stroke();
  }
  for (const f of [0, 0.34, 0.68]) {
    g.fillStyle = "#6e746f";
    g.fillRect(x, y + h * f + (f ? 0 : 1), w, 2.4);
    g.fillStyle = "rgba(255,255,255,0.3)";
    g.fillRect(x, y + h * f + (f ? 0 : 1), w, 0.8);
  }
  g.strokeStyle = "#5c625e";
  g.lineWidth = 2.4;
  g.beginPath();
  g.roundRect(x, y, w, h, [0, 0, 10, 10]);
  g.stroke();
  g.restore();
}

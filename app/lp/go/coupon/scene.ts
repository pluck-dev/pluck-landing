/**
 * The envelope scene as a pure function of t (reveal-craft: render(t), no accumulated state).
 *
 *   t 0 → 1      pull: t is the tear progress (the hand scrubs it, taps/auto tween it)
 *   t = 1        rip: strip flies off, shake, paper flash, bits fall, envelope squashes
 *   t 1.22→2.5   coupon slides out (lift outCubic + rotation damped sine), envelope drops away,
 *                coupon comes forward to its final place, envelope tucks in behind it
 *   t 1.0→3.6    veil dims the page, coupon stays lit; light sweeps across the coupon once (2.5→3.0)
 *   t 3.7        END, everything at rest
 *
 * Two canvases sandwich the coupon (a real DOM element so the code is selectable and readable):
 * back = contact shadow + back panel, front = front face, tear strip, fibers, bits, flash.
 */
import { clamp, DEG, inOutCubic, lerp, outCubic, rng, seg, smooth } from "../paper/ease";
import { BLUE, fibers, handledRim, INK, INSIDE, PAPER, PAPER_BACK, rubberStamp } from "../paper/draw";

export { rng };

export const T_RIP = 1;
export const T_RISE = 1.22;
export const T_END = 3.7;
export const NOTCHES = 12;

export type Mode = "hand" | "tap" | "auto" | "idle" | "skip" | "scroll";

export type SceneInput = {
  mode: Mode;
  /** Wall-clock seconds for the resting breath (0 in harness frames). */
  breath: number;
  /** 0→1 idle nudge (tab tug) before the idle auto-open. */
  nudge: number;
  reduced: boolean;
};

export type Layout = ReturnType<typeof makeLayout>;
export const BLEED = 96;

/** maxEw: 420 in the in-page card, larger in the full-screen stage. */
export function makeLayout(W: number, H: number, maxEw = 420) {
  // Room on the left for the tab (≈0.13·ew) without clipping.
  const ew = Math.round(Math.min(W * 0.86, (W / 2 - 8) / 0.57, H * 0.98, maxEw));
  const eh = Math.round(ew * 0.6);
  const stripH = Math.round(eh * 0.15);
  const tabW = Math.round(stripH * 1.45);
  const top = -eh / 2;
  const y1 = top + stripH;
  const cw = Math.round(ew * 0.88);
  const ch = Math.round(Math.min(eh * 0.8, cw * 0.5));
  const peek = 5;
  const yIn = y1 - peek + ch / 2;
  /** Lift (envelope space) at which the coupon's bottom clears the opening + the back lip. */
  const clear = yIn + ch / 2 - (y1 - 4);
  const E0 = { x: W / 2 + tabW * 0.5, y: H * 0.56 };
  const CF = { x: W / 2, y: H * 0.4 };
  const EF = { x: W / 2 + ew * 0.05, y: Math.min(CF.y + ch / 2 - ch * 0.36 + eh / 2, H - eh / 2 - 8) };
  // How far the envelope drops while the coupon lifts, so the coupon tops out a little above CF.
  const over = ch * 0.12;
  const drop = Math.max(0, CF.y - over - (E0.y + yIn - clear * 1.08));
  const floorY = Math.min(H - 4, EF.y + eh / 2 + 6);
  /** Canvases hang below the stage so the envelope can drop away without being cut off. */
  const CH = H + BLEED;
  return { W, H, CH, ew, eh, stripH, tabW, top, y1, cw, ch, yIn, clear, E0, CF, EF, drop, floorY };
}

export type Pose = ReturnType<typeof pose>;

type EnvPose = { x: number; y: number; rot: number; sx: number; sy: number };

function envPose(t: number, L: Layout, input: SceneInput): EnvPose {
  const p = clamp(t, 0, T_RIP);
  const s = t - T_RIP;
  const motion = input.reduced ? 0 : 1;

  // Resting breath, gone as soon as the strip moves.
  const amb = (1 - smooth(0, 0.04, p)) * motion;
  let rot = 0.55 * DEG * Math.sin(input.breath * 1.3) * amb;
  let x = L.E0.x;
  let y = L.E0.y + 1.6 * Math.sin(input.breath * 0.9 + 0.5) * amb;
  let sx = 1;
  let sy = 1;

  // The envelope resists (dragged along, tilting toward the pull) until the first hole gives.
  const tension = tensionOf(p, input);
  rot += tension * 2.2 * DEG + p * 0.9 * DEG * (1 - smooth(1, 1.5, t));
  x += tension * L.ew * 0.014;

  // Taps: a knock per third; sin(π·segment) so frames between taps sit still.
  if (input.mode === "tap" && p > 0 && p < 1) {
    const k = Math.sin(Math.PI * ((p * 3) % 1));
    y += k * 3 * motion;
    sy -= k * 0.02 * motion;
    sx += k * 0.01 * motion;
  }

  // Rip: squash + kick (damped sines starting at 0, so no jump at t = 1).
  if (s > 0 && !input.reduced) {
    const sq = 0.05 * Math.exp(-7 * s) * Math.sin(2 * Math.PI * 4.5 * s);
    sy -= sq;
    sx += sq * 0.45;
    rot += 2.4 * DEG * Math.exp(-6 * s) * Math.sin(2 * Math.PI * 2.6 * s);
  }

  // Coupon leaves: envelope drops away, then tucks in behind the coupon, a little turned.
  const dropK = inOutCubic(seg(t, T_RISE - 0.04, T_RISE + 0.55));
  const tuck = outCubic(seg(t, T_RISE + 0.72, T_RISE + 1.45));
  x = lerp(x, L.EF.x, tuck);
  y = lerp(y + L.drop * dropK, L.EF.y, tuck);
  rot = lerp(rot, -3.2 * DEG, tuck);
  const k = lerp(1, 0.97, tuck);
  return { x, y, rot, sx: sx * k, sy: sy * k };
}

function tensionOf(p: number, input: SceneInput) {
  const give = 0.06;
  let tension = p < give ? smooth(0, give, p) : Math.exp(-(p - give) * 26) * Math.cos((p - give) * 60);
  if (p >= 1) tension = 0;
  tension += 0.75 * Math.sin(Math.PI * input.nudge) ** 2;
  return tension;
}

export function apply(e: EnvPose, lx: number, ly: number) {
  const c = Math.cos(e.rot);
  const s = Math.sin(e.rot);
  const x = lx * e.sx;
  const y = ly * e.sy;
  return { x: e.x + x * c - y * s, y: e.y + x * s + y * c };
}

function couponLift(t: number, L: Layout) {
  return 1.08 * L.clear * outCubic(seg(t, T_RISE, T_RISE + 0.62));
}

/** Coupon pose for time t (stage space), before deciding its layer. */
function couponAt(t: number, L: Layout, input: SceneInput) {
  const env = envPose(t, L, input);
  const sR = Math.max(0, t - T_RISE);
  const rr = input.reduced ? 0 : -11 * DEG * Math.exp(-3.1 * sR) * Math.sin(2 * Math.PI * 0.85 * sR);
  const lift = couponLift(t, L);
  const attached = apply(env, 0, L.yIn - lift);
  const w = inOutCubic(seg(t, T_RISE + 0.42, T_RISE + 1.25));
  const pop = 0.035 * Math.sin(Math.PI * seg(t, T_RISE + 0.85, T_RISE + 1.3));
  return {
    x: lerp(attached.x, L.CF.x, w),
    y: lerp(attached.y, L.CF.y, w),
    rot: env.rot * (1 - w) + rr,
    scale: lerp(0.97, 1, w) + (input.reduced ? 0 : pop),
    env,
    lift,
  };
}

/** True once the coupon has fully cleared the pocket at some moment ≤ t (then it stays in front). */
function cleared(t: number, L: Layout, input: SceneInput) {
  if (t < T_RISE) return false;
  if (t >= T_END) return true;
  for (let u = T_RISE; u <= t + 1e-6; u += 0.02) {
    const c = couponAt(u, L, input);
    // Bottom edge of the coupon, in envelope space.
    const rel = c.rot - c.env.rot;
    const dx = c.x - c.env.x;
    const dy = c.y - c.env.y;
    const cos = Math.cos(-c.env.rot);
    const sin = Math.sin(-c.env.rot);
    const ly = (dx * sin + dy * cos) / c.env.sy;
    const bottom = ly + (L.ch / 2) * Math.cos(rel) * c.scale + (L.cw / 2) * Math.abs(Math.sin(rel)) * c.scale;
    if (bottom < L.y1 - 4) return true;
  }
  return false;
}

export function pose(t: number, L: Layout, input: SceneInput) {
  const p = clamp(t, 0, T_RIP);
  const s = t - T_RIP;
  const motion = input.reduced ? 0 : 1;

  // Tear position steps from hole to hole: slow at each hole, quick between (the paper "gives").
  const q = p * NOTCHES;
  const k = Math.min(Math.floor(q), NOTCHES - 1);
  const f = q - k;
  const stepped = (k + f * f * f * (f * (f * 6 - 15) + 10)) / NOTCHES;
  const pv = p >= 1 ? 1 : lerp(p, stepped, 0.55);
  const tension = tensionOf(p, input);
  // Fold angle of the torn strip: 0 = lying flat, π = folded back over the band.
  const theta = Math.max(Math.PI * smooth(0, 0.07, pv), Math.PI * 0.42 * Math.sin(Math.PI * input.nudge));

  const env = envPose(t, L, input);
  const shake =
    s > 0 && s < 0.6 && motion
      ? {
          x: 6 * Math.exp(-8 * s) * Math.sin(2 * Math.PI * 13 * s),
          y: 3.5 * Math.exp(-8 * s) * Math.sin(2 * Math.PI * 17 * s + 1),
        }
      : { x: 0, y: 0 };
  env.x += shake.x;
  env.y += shake.y;

  const flash = motion && s >= 0 && s < 0.35 ? 0.42 * (s < 0.03 ? s / 0.03 : Math.exp(-(s - 0.03) * 22)) : 0;

  const c = couponAt(t, L, input);
  const coupon = {
    x: c.x + shake.x,
    y: c.y + shake.y,
    rot: c.rot,
    scale: c.scale,
    front: cleared(t, L, input),
    sweep: motion ? seg(t, 2.5, 3.05) : 0,
  };

  const veil = motion ? outCubic(seg(t, 1.0, 1.45)) * (1 - inOutCubic(seg(t, 3.0, 3.6))) : 0;

  // Strip flight after the rip (relative to its last pulled pose).
  const fly =
    s >= 0
      ? {
          dx: 170 * s,
          dy: -230 * s + 0.5 * 1500 * s * s,
          rot: 2.6 * s,
          alpha: 1 - smooth(0.25, 0.55, s),
        }
      : null;

  return { t, p, pv, s, theta, tension, env, shake, flash, coupon, veil, fly, reduced: input.reduced };
}

/* ------------------------------------------------------------------ painter ---- */

type Bit = { x0: number; y0: number; vx: number; vy: number; rot: number; spin: number; floor: number; pts: number[]; tape: boolean; sway: number };

export class Painter {
  private L: Layout;
  private dpr: number;
  private face: HTMLCanvasElement;
  private bits: Bit[] = [];
  private edge: number[] = [];

  constructor(
    private back: HTMLCanvasElement,
    private front: HTMLCanvasElement,
    L: Layout,
    private font: string,
    private input: SceneInput,
  ) {
    this.L = L;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const canvas of [back, front]) {
      canvas.width = Math.round(L.W * this.dpr);
      canvas.height = Math.round(L.CH * this.dpr);
    }
    this.face = this.makeFace();
    this.makeEdge();
    this.makeBits();
  }

  /** Paper, fibers, tape, perforation, print and the PLUCK stamp, baked once per size. */
  private makeFace() {
    const { ew, eh, stripH, top, y1 } = this.L;
    const pad = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round((ew + pad * 2) * this.dpr);
    canvas.height = Math.round((eh + pad * 2) * this.dpr);
    const g = canvas.getContext("2d")!;
    g.scale(this.dpr, this.dpr);
    g.translate(pad + ew / 2, pad + eh / 2);
    g.fillStyle = PAPER;
    g.fillRect(-ew / 2, -eh / 2, ew, eh);
    fibers(g, -ew / 2, -eh / 2, ew, eh, 7);
    handledRim(g, -ew / 2, -eh / 2, ew, eh);

    // Tear strip: blue tape down the middle of the band + perforation along its lower edge.
    g.fillStyle = BLUE;
    g.fillRect(-ew / 2, top + stripH * 0.42, ew, Math.max(2, stripH * 0.16));
    g.fillStyle = "rgba(32,37,35,0.34)";
    for (let x = -ew / 2 + 3; x < ew / 2 - 2; x += 7) g.fillRect(x, y1 - 0.7, 3.2, 1.4);

    // Printed text and the hand note, in the page's own type.
    const u = ew / 100;
    g.save();
    g.translate(-ew / 2 + 7 * u, y1 + 24 * u);
    g.rotate(-2 * DEG);
    g.fillStyle = BLUE;
    g.font = `700 ${5.2 * u}px ${this.font}`;
    g.fillText("광고 보고 오신 분께", 0, 0);
    g.restore();
    g.fillStyle = INK;
    g.font = `700 ${4.3 * u}px ${this.font}`;
    g.fillText("첫 계약 할인권 1매", -ew / 2 + 7 * u, eh / 2 - 12 * u);
    g.fillStyle = "#65725d";
    g.font = `500 ${3.1 * u}px ${this.font}`;
    g.fillText("PLUCK 개발 스튜디오", -ew / 2 + 7 * u, eh / 2 - 6.5 * u);

    // Rubber stamp.
    const sw = 27 * u;
    const sh = 15 * u;
    const stamp = rubberStamp({
      w: sw,
      h: sh,
      u,
      font: this.font,
      lines: [
        { text: "PLUCK", size: 6.2, weight: 800, y: 0.58, spacing: 0.5 },
        { text: "개발 스튜디오", size: 2.6, weight: 600, y: 0.82 },
      ],
    }).canvas;
    g.save();
    g.translate(ew / 2 - 22 * u, eh / 2 - 17 * u);
    g.rotate(-8 * DEG);
    g.globalAlpha = 0.86;
    g.drawImage(stamp, -sw / 2 - 4, -sh / 2 - 4, sw + 8, sh + 8);
    g.restore();
    return canvas;
  }

  /** Torn perforation edge: little paper bridges between the holes, slightly ragged. */
  private makeEdge() {
    const { ew } = this.L;
    const rand = rng(23);
    this.edge = [];
    for (let i = 0; i <= Math.ceil(ew); i++) {
      const u = ((i + 0.5) % 7) / 7;
      const bridge = u > 0.55 ? Math.sin(Math.PI * ((u - 0.55) / 0.45)) : 0;
      this.edge.push(-bridge * 1.6 + (rand() - 0.5) * 0.9);
    }
  }

  private makeBits() {
    const L = this.L;
    const rand = rng(41);
    const env = envPose(T_RIP, L, { ...this.input, breath: 0, nudge: 0 });
    this.bits = [];
    for (let i = 0; i < 18; i++) {
      const lx = -L.ew / 2 + (i + rand() * 0.8) * (L.ew / 18);
      const start = apply(env, lx, L.y1 - rand() * 4);
      const pts: number[] = [];
      const r = 2 + rand() * 3.4;
      for (let j = 0; j < 4; j++) {
        const a = (j / 4) * Math.PI * 2 + rand() * 0.9;
        const rr = r * (0.55 + rand() * 0.6);
        pts.push(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      this.bits.push({
        x0: start.x,
        y0: start.y,
        vx: (rand() - 0.35) * 190,
        vy: -(110 + rand() * 230),
        rot: rand() * 6,
        spin: (rand() - 0.5) * 16,
        floor: L.floorY - rand() * 14,
        pts,
        tape: rand() < 0.22,
        sway: rand() * 6,
      });
    }
  }

  draw(P: Pose) {
    this.drawBack(P);
    this.drawFront(P);
  }

  private begin(canvas: HTMLCanvasElement) {
    const g = canvas.getContext("2d")!;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.L.W, this.L.CH);
    return g;
  }

  private envTransform(g: CanvasRenderingContext2D, P: Pose) {
    const e = P.env;
    g.translate(e.x, e.y);
    g.rotate(e.rot);
    g.scale(e.sx, e.sy);
  }

  private drawBack(P: Pose) {
    const g = this.begin(this.back);
    const { ew, eh, top, y1 } = this.L;
    const xt = -ew / 2 + P.pv * ew;
    g.save();
    this.envTransform(g, P);
    // Contact shadow: the envelope lies on the table.
    g.save();
    g.filter = "blur(9px)";
    g.fillStyle = "rgba(32,37,35,0.16)";
    g.fillRect(-ew / 2 + 6, -eh / 2 + 14, ew - 6, eh - 6);
    g.restore();
    // Back panel: inside colour shows as a thin lip above the torn front edge.
    g.fillStyle = INSIDE;
    g.beginPath();
    g.moveTo(-ew / 2, y1 - 3.2);
    g.lineTo(xt, y1 - 3.2);
    g.lineTo(xt, top);
    g.lineTo(ew / 2, top);
    g.lineTo(ew / 2, eh / 2);
    g.lineTo(-ew / 2, eh / 2);
    g.closePath();
    g.fill();
    g.restore();
  }

  private facePath(g: CanvasRenderingContext2D, xt: number) {
    const { ew, eh, top, y1 } = this.L;
    g.beginPath();
    g.moveTo(-ew / 2, eh / 2);
    g.lineTo(-ew / 2, y1 + this.edge[0]);
    const end = Math.min(Math.round(xt + ew / 2), this.edge.length - 1);
    for (let i = 1; i <= end; i++) g.lineTo(-ew / 2 + i, y1 + this.edge[i]);
    if (xt < ew / 2 - 0.5) {
      // Torn end of the strip that's still attached.
      for (let y = y1; y > top; y -= 3) g.lineTo(xt + Math.sin(y * 1.7) * 1.1, y);
      g.lineTo(xt, top);
      g.lineTo(ew / 2, top);
    }
    g.lineTo(ew / 2, eh / 2);
    g.closePath();
  }

  private drawFront(P: Pose) {
    const g = this.begin(this.front);
    const L = this.L;
    const { ew, eh, top, y1, stripH } = L;
    const xt = -ew / 2 + P.pv * ew;
    const torn = P.pv > 0.0005;

    g.save();
    this.envTransform(g, P);

    // Pocket shadow falling onto whatever sits in the opening (the coupon's top edge).
    if (torn) {
      const grad = g.createLinearGradient(0, y1, 0, y1 - 9);
      grad.addColorStop(0, "rgba(32,37,35,0.22)");
      grad.addColorStop(1, "rgba(32,37,35,0)");
      g.fillStyle = grad;
      g.fillRect(-ew / 2, y1 - 9, xt + ew / 2, 9);
    }

    // Front face (+ the part of the band still attached).
    g.save();
    this.facePath(g, xt);
    g.clip();
    g.drawImage(this.face, -ew / 2 - 2, -eh / 2 - 2, ew + 4, eh + 4);
    if (P.flash > 0) {
      g.fillStyle = `rgba(255,254,248,${P.flash})`;
      g.fillRect(-ew / 2, -eh / 2, ew, eh);
    }
    g.restore();
    g.strokeStyle = "rgba(32,37,35,0.16)";
    g.lineWidth = 1;
    this.facePath(g, xt);
    g.stroke();

    // Exposed paper core along the torn edge.
    if (torn) {
      g.strokeStyle = "rgba(255,255,251,0.95)";
      g.lineWidth = 1.3;
      g.beginPath();
      const end = Math.min(Math.round(xt + ew / 2), this.edge.length - 1);
      for (let i = 0; i <= end; i++) g.lineTo(-ew / 2 + i, y1 + this.edge[i] + 0.6);
      g.stroke();
      const hairs = rng(5);
      g.lineWidth = 0.6;
      g.strokeStyle = "rgba(255,255,251,0.9)";
      for (let x = -ew / 2 + 4; x < xt - 2; x += 5 + hairs() * 9) {
        g.beginPath();
        g.moveTo(x, y1 + 0.5);
        g.lineTo(x + (hairs() - 0.5) * 3, y1 - 1.2 - hairs() * 2.2);
        g.stroke();
      }
    }

    // The strip: still pulling, or flying off after the rip.
    if (!P.fly || P.fly.alpha > 0) this.drawStrip(g, P, xt);

    // Fibers stretching between the torn end and the lifted strip while pulling.
    if (torn && P.p < 1) {
      const fr = rng(9);
      g.strokeStyle = `rgba(250,249,242,${0.55 + 0.4 * Math.min(1, Math.abs(P.tension))})`;
      g.lineWidth = 0.7;
      for (let i = 0; i < 6; i++) {
        const y = top + 3 + fr() * (stripH - 6);
        const len = 2.5 + fr() * 3 + Math.abs(P.tension) * 5;
        g.beginPath();
        g.moveTo(xt, y);
        g.quadraticCurveTo(xt + len * 0.6, y - 1.5, xt + len, y - 1 - fr() * 3 - P.tension * 2);
        g.stroke();
      }
    }
    g.restore();

    // Paper bits (stage space).
    if (P.s > 0 && !P.reduced) {
      for (const bit of this.bits) {
        const g2 = 1500;
        const disc = bit.vy * bit.vy - 2 * g2 * (bit.y0 - bit.floor);
        const land = disc > 0 ? (-bit.vy + Math.sqrt(disc)) / g2 : 9;
        const s = Math.min(P.s, land);
        const x = bit.x0 + bit.vx * s * (1 - 0.3 * Math.min(s, 1)) + Math.sin(s * 7 + bit.sway) * 4 * Math.min(1, s * 3);
        const y = bit.y0 + bit.vy * s + 0.5 * g2 * s * s;
        g.save();
        g.translate(x, y);
        g.rotate(bit.rot + bit.spin * s);
        g.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(bit.spin * s * 0.7)));
        g.beginPath();
        for (let j = 0; j < bit.pts.length; j += 2) g.lineTo(bit.pts[j], bit.pts[j + 1]);
        g.closePath();
        g.fillStyle = bit.tape ? BLUE : "#f6f4ec";
        g.fill();
        g.strokeStyle = "rgba(32,37,35,0.22)";
        g.lineWidth = 0.6;
        g.stroke();
        g.restore();
      }
    }
  }

  /**
   * The torn strip, seen face-on. Its width stays vertical; folding back and rolling happen in depth,
   * so they show as foreshortening, shading and a small paper roll at the fingers (the "curl").
   *   θ < π/2: front side, lying flat / starting to lift (tape stripe + blue tab with "당겨요")
   *   θ > π/2: folded back over the band (back side), the extra length wound into a roll + pinched tab
   */
  private drawStrip(g: CanvasRenderingContext2D, P: Pose, xt: number) {
    const { ew, top, stripH, tabW } = this.L;
    const len = P.pv * ew + tabW;
    const yc = top + stripH / 2;
    const w = stripH * 0.96;
    const fold = P.theta / Math.PI;
    const tension = Math.min(1, Math.abs(P.tension));
    const slope = (0.06 + 0.16 * tension) * fold;
    const reach = Math.min(len, ew * 0.15);
    const extra = Math.max(0, len - reach);
    const R = Math.min(stripH * 0.62, stripH * 0.2 + Math.sqrt(extra) * 0.55);
    const cos = Math.cos(P.theta);
    const backSide = P.theta > Math.PI / 2;
    // Strip runs from the fold (x = xt) to its far end; y rises a little along it (pulled up & toward us).
    // Once folded, the fingers can't leave the stage: near the right edge the strip just winds up.
    const room = this.L.W - this.L.E0.x - R * 2 - tabW * 0.75 - 6;
    const span = backSide ? Math.max(4, Math.min(reach * -cos, room - xt)) : len * -cos;
    const x2 = xt + span;
    const lift = Math.abs(span) * slope + (backSide ? Math.min(8, P.pv * 16) : 0);
    const grow = backSide ? 1 + 0.12 * fold : 1;

    g.save();
    if (P.fly) {
      const cx = x2 + R;
      const cy = yc - lift;
      g.translate(P.fly.dx, P.fly.dy);
      g.translate(cx, cy);
      g.rotate(P.fly.rot);
      g.translate(-cx, -cy);
      g.globalAlpha = P.fly.alpha;
    }

    const band = () => {
      g.beginPath();
      g.moveTo(xt, yc - w / 2);
      g.lineTo(x2, yc - lift - (w / 2) * grow);
      g.lineTo(x2, yc - lift + (w / 2) * grow);
      g.lineTo(xt, yc + w / 2);
      g.closePath();
    };

    if (backSide) {
      // Soft shadow on the band/face below the lifted strip and roll.
      g.save();
      g.filter = "blur(3px)";
      g.fillStyle = "rgba(32,37,35,0.18)";
      g.translate(2, 4.5);
      band();
      g.fill();
      if (extra > 0) {
        g.beginPath();
        g.roundRect(x2, yc - lift - w * 0.56, R * 2, w * 1.12, R);
        g.fill();
      }
      g.restore();

      // Back side of the strip, darker toward the fold.
      const grad = g.createLinearGradient(xt, 0, x2, 0);
      grad.addColorStop(0, "#d9d5c6");
      grad.addColorStop(0.35, PAPER_BACK);
      grad.addColorStop(1, "#f1eee4");
      g.fillStyle = grad;
      band();
      g.fill();
      g.strokeStyle = "rgba(32,37,35,0.18)";
      g.lineWidth = 0.8;
      g.stroke();
      // Torn perforation along its lower edge.
      g.strokeStyle = "rgba(255,255,251,0.9)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(xt, yc + w / 2 - 0.5);
      g.lineTo(x2, yc - lift + (w / 2) * grow - 0.5);
      g.stroke();

      if (extra > 0) this.drawRoll(g, x2, yc - lift, R, w * 1.12);
      else this.drawPinchedTab(g, x2, yc - lift, w);
    } else {
      // Front side, still mostly on the envelope.
      const flat = Math.max(0.0001, cos);
      g.fillStyle = PAPER;
      band();
      g.fill();
      // Tape stripe up to where the blue tab starts.
      const k = 1 - tabW / len;
      const tx = xt + span * k;
      const tapeY = yc - stripH * 0.08;
      g.strokeStyle = BLUE;
      g.lineWidth = Math.max(2, stripH * 0.16);
      g.beginPath();
      g.moveTo(xt, tapeY);
      g.lineTo(tx, tapeY - lift * k);
      g.stroke();
      g.beginPath();
      g.moveTo(tx, yc - lift * k - w / 2);
      g.lineTo(x2 + (x2 < xt ? 3 : -3) * flat, yc - lift - w / 2 + 2);
      g.quadraticCurveTo(x2, yc - lift - w / 2, x2, yc - lift - w / 2 + 4);
      g.lineTo(x2, yc - lift + w / 2 - 4);
      g.quadraticCurveTo(x2, yc - lift + w / 2, x2 + (x2 < xt ? 3 : -3) * flat, yc - lift + w / 2 - 2);
      g.lineTo(tx, yc - lift * k + w / 2);
      g.closePath();
      g.fillStyle = BLUE;
      g.fill();
      // Turning edge-on darkens it.
      if (P.theta > 0.05) {
        g.fillStyle = `rgba(40,36,24,${0.3 * (1 - flat)})`;
        band();
        g.fill();
      }
      g.strokeStyle = "rgba(32,37,35,0.18)";
      g.lineWidth = 0.8;
      band();
      g.stroke();
      if (!P.fly && flat > 0.25) {
        g.save();
        g.translate((tx + x2) / 2, yc - lift * (k + 1) * 0.5);
        g.scale(flat, 1);
        g.fillStyle = "#fff";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = `700 ${Math.max(10.5, stripH * 0.4)}px ${this.font}`;
        g.fillText("당겨요", 0, 0.5);
        g.restore();
      }
    }
    // Fold highlight right at the tear.
    if (P.theta > 0.2 && !P.fly) {
      g.strokeStyle = `rgba(255,255,250,${0.8 * Math.sin(P.theta / 2)})`;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(xt + 0.5, yc - w / 2);
      g.lineTo(xt + 0.5, yc + w / 2);
      g.stroke();
    }
    g.restore();
  }

  /** Wound-up strip: a short paper cylinder (vertical axis) with the blue tab pinched out of it. */
  private drawRoll(g: CanvasRenderingContext2D, x: number, cy: number, R: number, h: number) {
    const grad = g.createLinearGradient(x, 0, x + R * 2, 0);
    grad.addColorStop(0, "#cfcabb");
    grad.addColorStop(0.32, "#f6f3ea");
    grad.addColorStop(0.7, "#e2ded0");
    grad.addColorStop(1, "#c4bfae");
    g.fillStyle = grad;
    g.beginPath();
    g.roundRect(x, cy - h / 2, R * 2, h, Math.min(R, 4));
    g.fill();
    g.strokeStyle = "rgba(32,37,35,0.22)";
    g.lineWidth = 0.8;
    g.stroke();
    // Top end: a flat ellipse with the spiral of wound paper.
    g.fillStyle = "#efece2";
    g.beginPath();
    g.ellipse(x + R, cy - h / 2, R, R * 0.3, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.strokeStyle = "rgba(32,37,35,0.25)";
    g.lineWidth = 0.6;
    for (let r = R * 0.7; r > 1.5; r -= Math.max(1.6, R * 0.22)) {
      g.beginPath();
      g.ellipse(x + R, cy - h / 2, r, r * 0.3, 0, Math.PI * 0.1, Math.PI * 1.75);
      g.stroke();
    }
    this.drawPinchedTab(g, x + R * 1.6, cy - h * 0.18, h * 0.86);
  }

  /** The blue tab end between the fingers, pointing up and away. */
  private drawPinchedTab(g: CanvasRenderingContext2D, x: number, y: number, h: number) {
    const { tabW } = this.L;
    g.save();
    g.translate(x, y);
    g.rotate(-32 * DEG);
    g.fillStyle = BLUE;
    g.beginPath();
    g.moveTo(0, -h * 0.34);
    g.lineTo(tabW * 0.62, -h * 0.3);
    g.quadraticCurveTo(tabW * 0.74, -h * 0.28, tabW * 0.74, -h * 0.18);
    g.lineTo(tabW * 0.74, h * 0.18);
    g.quadraticCurveTo(tabW * 0.74, h * 0.28, tabW * 0.62, h * 0.3);
    g.lineTo(0, h * 0.34);
    g.closePath();
    g.fill();
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.fillRect(0, -h * 0.34, tabW * 0.12, h * 0.68);
    g.restore();
  }
}

/**
 * Shared paper-world drawing for the /lp/go moments (coupon envelope, receipt, stamp card, crumple, seal).
 * Paper, fibers, handled rims and rubber-stamp ink, baked once into offscreen canvases.
 * Colours are the site tokens (--paper, --ink, --blue) plus two paper shades. No glow, no gradients
 * beyond the shading a sheet of paper actually has.
 */
import { rng } from "./ease";

export const PAPER = "#f4f2e8";
export const PAPER_BACK = "#e9e6da";
export const INSIDE = "#dedbcd";
export const INK = "#202523";
export const BLUE = "#335aeb";
export const PAPER_EDGE = "rgba(32,37,35,0.16)";

export const dprOf = () => Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);

/** Offscreen canvas in CSS pixels (already scaled by dpr). */
export function offscreen(w: number, h: number, dpr = dprOf()) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  const g = canvas.getContext("2d")!;
  g.scale(dpr, dpr);
  return { canvas, g };
}

/** Sizes an on-page canvas to w×h CSS px at dpr and returns a context reset to CSS px. */
export function fitCanvas(canvas: HTMLCanvasElement, w: number, h: number, dpr = dprOf()) {
  const W = Math.max(1, Math.round(w * dpr));
  const H = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  return canvas.getContext("2d")!;
}

export function begin(canvas: HTMLCanvasElement, w: number, h: number, dpr: number) {
  const g = canvas.getContext("2d")!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  return g;
}

/** Short faint strokes, light and dark: the grain that makes a flat fill read as paper. */
export function fibers(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number, density = 70) {
  const rand = rng(seed);
  const count = Math.round((w * h) / density);
  g.save();
  g.lineWidth = 0.6;
  for (let i = 0; i < count; i++) {
    const fx = x + rand() * w;
    const fy = y + rand() * h;
    const a = rand() * Math.PI;
    const l = 1.5 + rand() * 5;
    g.strokeStyle = rand() < 0.55 ? `rgba(120,108,80,${0.05 + rand() * 0.06})` : `rgba(255,255,250,${0.3 + rand() * 0.3})`;
    g.beginPath();
    g.moveTo(fx, fy);
    g.lineTo(fx + Math.cos(a) * l, fy + Math.sin(a) * l);
    g.stroke();
  }
  g.restore();
}

/** Slightly darker rim, like paper that has been handled. */
export function handledRim(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha = 0.1) {
  g.save();
  g.filter = "blur(4px)";
  g.strokeStyle = `rgba(110,98,70,${alpha})`;
  g.lineWidth = 6;
  g.strokeRect(x, y, w, h);
  g.restore();
}

/** A plain sheet: fill + fibers + handled rim, centred at (0,0) of the returned canvas' coordinates. */
export function paperSheet(w: number, h: number, seed: number, color = PAPER, pad = 2) {
  const { canvas, g } = offscreen(w + pad * 2, h + pad * 2);
  g.translate(pad, pad);
  g.fillStyle = color;
  g.fillRect(0, 0, w, h);
  fibers(g, 0, 0, w, h, seed);
  handledRim(g, 0, 0, w, h);
  return { canvas, pad };
}

/** Rubber ink never prints evenly: knock random specks and one dry stripe out of a stamp impression. */
export function inkWear(g: CanvasRenderingContext2D, w: number, h: number, seed: number, specks = 260, stripeAt = 0.62) {
  g.save();
  g.globalCompositeOperation = "destination-out";
  const r = rng(seed);
  for (let i = 0; i < specks; i++) {
    g.globalAlpha = 0.25 + r() * 0.6;
    g.beginPath();
    g.arc(r() * w, r() * h, 0.3 + r() * 0.9, 0, Math.PI * 2);
    g.fill();
  }
  if (stripeAt > 0) {
    g.globalAlpha = 0.35;
    g.fillRect(w * stripeAt, -2, Math.max(2, w * 0.089), h + 4);
  }
  g.restore();
}

export type StampLine = { text: string; size: number; weight?: number; y: number; spacing?: number };

/**
 * A rubber-stamp impression baked into its own canvas (so it can be scaled, rotated, faded).
 *   rect  double rounded border (the PLUCK studio stamp on the envelope)
 *   round double circle (the process card's date-stamp style)
 * `u` is the stamp's design unit in px; line sizes and y are in u (y is a fraction of the height).
 */
export function rubberStamp({
  w,
  h,
  u,
  font,
  lines,
  shape = "rect",
  seed = 11,
  color = BLUE,
  specks = 260,
  stripeAt = 0.62,
}: {
  w: number;
  h: number;
  u: number;
  font: string;
  lines: StampLine[];
  shape?: "rect" | "round";
  seed?: number;
  color?: string;
  specks?: number;
  stripeAt?: number;
}) {
  const pad = 4;
  const { canvas, g } = offscreen(w + pad * 2, h + pad * 2);
  g.translate(pad, pad);
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = Math.max(1.6, 0.7 * u);
  g.beginPath();
  if (shape === "round") g.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2);
  else g.roundRect(0, 0, w, h, 2.2 * u);
  g.stroke();
  g.lineWidth = Math.max(0.8, 0.3 * u);
  g.beginPath();
  if (shape === "round") g.ellipse(w / 2, h / 2, w / 2 - 1.6 * u, h / 2 - 1.6 * u, 0, 0, Math.PI * 2);
  else g.roundRect(1.6 * u, 1.6 * u, w - 3.2 * u, h - 3.2 * u, 1.4 * u);
  g.stroke();
  g.textAlign = "center";
  const spaced = g as CanvasRenderingContext2D & { letterSpacing?: string };
  for (const line of lines) {
    g.font = `${line.weight ?? 700} ${line.size * u}px ${font}`;
    if ("letterSpacing" in g) spaced.letterSpacing = `${(line.spacing ?? 0) * u}px`;
    g.fillText(line.text, w / 2, h * line.y);
  }
  if ("letterSpacing" in g) spaced.letterSpacing = "0px";
  inkWear(g, w, h, seed, specks, stripeAt);
  return { canvas, pad };
}

/** Soft contact shadow under a lifted sheet: offset and blur grow with height (0 = lying flat). */
export function liftShadow(
  g: CanvasRenderingContext2D,
  path: () => void,
  height: number,
  { base = 0.16, blur = 3, spread = 14 }: { base?: number; blur?: number; spread?: number } = {},
) {
  g.save();
  g.filter = `blur(${(blur + height * spread * 0.6).toFixed(1)}px)`;
  g.fillStyle = `rgba(32,37,35,${(base * (1 - 0.45 * Math.min(1, height))).toFixed(3)})`;
  g.translate(height * spread * 0.35, 2 + height * spread);
  path();
  g.fill();
  g.restore();
}

/* ---------- the wooden rubber stamp, seen from above ---------- */

const WOOD = "#d6c19b";
const WOOD_SIDE = "#a98d64";
const KNOB = "#8f6f4a";

/**
 * Bakes the stamp tool's top face (wood block with grain, turned knob) once per size.
 * w×h is the rubber face; the block is the same size, the knob sits in the middle.
 */
export function makeStampTool(w: number, h: number, seed = 3, shape: "rect" | "round" = "rect") {
  const pad = 2;
  const { canvas, g } = offscreen(w + pad * 2, h + pad * 2);
  g.translate(pad, pad);
  const block = () => {
    g.beginPath();
    if (shape === "round") g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else g.roundRect(0, 0, w, h, Math.min(w, h) * 0.14);
  };
  g.fillStyle = WOOD;
  block();
  g.fill();
  g.save();
  block();
  g.clip();
  // Grain: long wavy strokes across the block.
  const r = rng(seed);
  g.lineWidth = 0.8;
  for (let y = -h * 0.2; y < h * 1.2; y += 2.6 + r() * 3.4) {
    g.strokeStyle = `rgba(120,88,48,${0.08 + r() * 0.14})`;
    g.beginPath();
    const phase = r() * 6;
    for (let x = -2; x <= w + 2; x += 4) g.lineTo(x, y + Math.sin(x / (w * 0.22) + phase) * (1.2 + r() * 0.6));
    g.stroke();
  }
  // Light from the top-left, worn darker toward the far edge.
  const shade = g.createLinearGradient(0, 0, w, h);
  shade.addColorStop(0, "rgba(255,250,236,0.28)");
  shade.addColorStop(1, "rgba(80,58,30,0.16)");
  g.fillStyle = shade;
  g.fillRect(0, 0, w, h);
  g.restore();
  g.strokeStyle = "rgba(70,52,28,0.45)";
  g.lineWidth = 1;
  block();
  g.stroke();
  // Turned knob.
  const kr = Math.min(w, h) * 0.27;
  const knob = g.createRadialGradient(w / 2 - kr * 0.35, h / 2 - kr * 0.4, kr * 0.1, w / 2, h / 2, kr);
  knob.addColorStop(0, "#b8956a");
  knob.addColorStop(1, KNOB);
  g.fillStyle = knob;
  g.beginPath();
  g.arc(w / 2, h / 2, kr, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(60,42,20,0.5)";
  g.stroke();
  g.strokeStyle = "rgba(255,240,215,0.35)";
  g.lineWidth = 1.2;
  g.beginPath();
  g.arc(w / 2, h / 2, kr * 0.62, Math.PI * 1.05, Math.PI * 1.6);
  g.stroke();
  return { canvas, pad, w, h, shape };
}

export type StampTool = ReturnType<typeof makeStampTool>;

/**
 * Draws the tool at (x, y) = centre of where its rubber meets the paper.
 * height 0 = pressed on the paper, 1 = a hand's length above it: it gets bigger (closer to the eye),
 * its shadow slides away and softens, and the block's side + inked rubber edge show beneath it.
 */
export function drawStampTool(
  g: CanvasRenderingContext2D,
  tool: StampTool,
  { x, y, height, rot = 0, sx = 1, sy = 1, alpha = 1 }: { x: number; y: number; height: number; rot?: number; sx?: number; sy?: number; alpha?: number },
) {
  if (alpha <= 0.001) return;
  const { w, h, canvas, pad, shape } = tool;
  const near = 1 + 0.5 * height;
  const foot = () => {
    g.beginPath();
    if (shape === "round") g.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    else g.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.14);
  };
  // Shadow on the paper (paper space: no "near" scale).
  g.save();
  g.globalAlpha = alpha;
  g.translate(x + 4 + height * 34, y + 6 + height * 40);
  g.rotate(rot);
  g.filter = `blur(${(3 + height * 12).toFixed(1)}px)`;
  g.fillStyle = `rgba(32,37,35,${(0.3 * (1 - 0.55 * height)).toFixed(3)})`;
  foot();
  g.fill();
  g.restore();

  g.save();
  g.globalAlpha = alpha;
  g.translate(x, y);
  g.rotate(rot);
  g.scale(near * sx, near * sy);
  // Block side (thickness) and the blue inked rubber edge peeking out below it.
  const depth = 3 + 3 * height;
  g.save();
  g.translate(1.2, depth);
  g.fillStyle = "#2f4bb8";
  foot();
  g.fill();
  g.restore();
  g.save();
  g.translate(0.8, depth * 0.6);
  g.fillStyle = WOOD_SIDE;
  foot();
  g.fill();
  g.restore();
  g.drawImage(canvas, -w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2);
  g.restore();
}

/**
 * A stamp impression on paper. k 0→1 = ink spreading into the fibres right after the hit:
 * the print grows a hair and a soft bleed copy comes up under it.
 */
export function drawInk(
  g: CanvasRenderingContext2D,
  ink: { canvas: HTMLCanvasElement; pad: number },
  w: number,
  h: number,
  { x, y, rot, k, alpha = 0.88 }: { x: number; y: number; rot: number; k: number; alpha?: number },
) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  const W = w + ink.pad * 2;
  const H = h + ink.pad * 2;
  if (k > 0) {
    g.save();
    g.globalAlpha = alpha * 0.22 * k;
    g.filter = `blur(${(0.4 + 0.9 * k).toFixed(2)}px)`;
    const s = 1 + 0.02 * k;
    g.drawImage(ink.canvas, (-W / 2) * s, (-H / 2) * s, W * s, H * s);
    g.restore();
  }
  g.globalAlpha = alpha * (0.75 + 0.25 * k);
  const s = 0.985 + 0.015 * k;
  g.drawImage(ink.canvas, (-W / 2) * s, (-H / 2) * s, W * s, H * s);
  g.restore();
}

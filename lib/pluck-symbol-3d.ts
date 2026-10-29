/**
 * PLUCK symbol in 3D: pill stem + ring bowl ("p") and the plucked seed.
 * Mirrors the flat construction in public/brand/pluck-symbol.svg.
 */
import {
  CapsuleGeometry,
  Color,
  SphereGeometry,
  TorusGeometry,
  type BufferGeometry,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/* ---------- symbol construction (see docs/brand-symbol.md) ----------
 * Flat grid: stroke 26, stem centreline x=24 y20..100, ring centre (48,44)
 * R24, seed r11 at (94,12). 3D unit = one stroke width (26 grid units),
 * origin = bbox centre (58,57), y up. */
const U = 26;
const gx = (x: number) => (x - 58) / U;
const gy = (y: number) => -(y - 57) / U;
export const SYMBOL = {
  tube: 0.5,
  stem: { x: gx(24), y0: gy(100), y1: gy(20) },
  ring: { x: gx(48), y: gy(44), R: 24 / U },
  seed: { x: gx(94), y: gy(12), r: 11 / U },
  height: 112 / U,
  width: 94 / U,
};

export function bodyGeometry(detail: number): BufferGeometry {
  const { tube, stem, ring } = SYMBOL;
  const len = stem.y1 - stem.y0;
  const capsule = new CapsuleGeometry(tube, len, 3 * detail, 8 * detail, 1);
  capsule.translate(stem.x, (stem.y0 + stem.y1) / 2, 0);
  const torus = new TorusGeometry(ring.R, tube, 6 * detail, 18 * detail);
  torus.translate(ring.x, ring.y, 0);
  const merged = mergeGeometries([capsule, torus])!;
  capsule.dispose();
  torus.dispose();
  return merged;
}

export function seedGeometry(detail: number) {
  const g = new SphereGeometry(SYMBOL.seed.r, 8 * detail, 6 * detail);
  g.translate(SYMBOL.seed.x, SYMBOL.seed.y, 0);
  return g;
}

/* ---------- palette ---------- */
export const BLUE = new Color("#335aeb");
export const INK = new Color("#202523");
export const PAPER = new Color("#f4f4ef");
export const LIME = new Color("#d9eba7");

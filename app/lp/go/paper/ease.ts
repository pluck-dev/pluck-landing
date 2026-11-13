/**
 * Piecewise easing for the /lp/go paper moments (reveal-craft: segments, ramps, exp decay, damped sines).
 * Every scene is a pure function of t built from these; no tween library.
 */
export const DEG = Math.PI / 180;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0→1 as t goes a→b, clamped. */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const smooth = (a: number, b: number, t: number) => {
  const k = seg(t, a, b);
  return k * k * (3 - 2 * k);
};
export const outCubic = (k: number) => 1 - (1 - k) ** 3;
export const inCubic = (k: number) => k * k * k;
export const inOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
export const inOutSine = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2;
/** Overshoots past 1 then settles (s ≈ 1.7 is a soft back-out). */
export const outBack = (k: number, s = 1.70158) => 1 + (s + 1) * (k - 1) ** 3 + s * (k - 1) ** 2;
/** Damped sine starting at 0 for s ≤ 0 (so nothing jumps at the beat). */
export const ring = (s: number, amp: number, decay: number, hz: number, phase = 0) =>
  s <= 0 ? 0 : amp * Math.exp(-decay * s) * Math.sin(2 * Math.PI * hz * s + phase);

/** Seeded PRNG (mulberry32): the same seed always draws the same paper. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

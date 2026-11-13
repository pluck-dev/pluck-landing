/**
 * One rubber stamp hit as a pure function of s = seconds since impact (negative = still falling).
 *   s -0.24→0  falls toward the paper (height 1→0, inCubic: it accelerates), turning a little
 *   s = 0      hits: squash (damped sine), ink appears under it and spreads (outCubic)
 *   s 0.1→0.46 lifts away up and to the right (outCubic), turning, fading out
 * Used by the receipt's coupon stamp and the process stamp card.
 */
import { clamp, DEG, inCubic, outCubic, ring, seg } from "./ease";

export const STAMP_FALL = 0.24;
export const STAMP_LIFT = 0.46;

/** dir = which side the hand comes from and goes back to (1 = right, -1 = left). */
export function stampPose(s: number, baseRot: number, reduced = false, dir = 1) {
  if (reduced) return { h: 0, alpha: 0, sx: 1, sy: 1, rot: baseRot, dx: 0, dy: 0, ink: s >= 0 ? 1 : 0, spread: s >= 0 ? 1 : 0 };
  const fall = seg(s, -STAMP_FALL, 0);
  const lift = outCubic(seg(s, 0.1, STAMP_LIFT));
  const squash = s >= 0 ? ring(s, 0.07, 16, 5.5) : 0;
  return {
    h: s < 0 ? 1 - inCubic(fall) : lift,
    alpha: s < 0 ? clamp((fall - 0.02) * 5) : 1 - seg(s, 0.22, STAMP_LIFT),
    sx: 1 + squash * 0.6,
    sy: 1 - squash,
    rot: baseRot + (s < 0 ? -6 * (1 - fall) : 9 * lift) * DEG * dir,
    dx: (s < 0 ? 18 * (1 - fall) : 26 * lift) * dir,
    dy: s < 0 ? -10 * (1 - fall) : -22 * lift,
    ink: s >= 0 ? 1 : 0,
    spread: outCubic(seg(s, 0, 0.28)),
  };
}

/** Table shake after a hit; zero between hits (sin envelope via the damped ring). */
export const stampShake = (s: number, amp: number) =>
  s > 0 && s < 0.7 ? { x: ring(s, amp, 8, 13), y: ring(s, amp * 0.75, 8, 17, 1) } : { x: 0, y: 0 };

/**
 * The same hand carrying the stamp from one hit to the next (gap seconds apart): it lifts, travels
 * (inOutCubic) and drops onto the next box, so rapid stamps never show two tools at once.
 * Returns the tool pose between hit A (s = 0) and hit B (s = gap); position k 0→1 from A to B.
 */
export function carryPose(s: number, gap: number, rotA: number, rotB: number) {
  const u = Math.min(1, Math.max(0, s / gap));
  const squash = ring(s, 0.07, 16, 5.5);
  const k = u < 0.12 ? 0 : u > 0.9 ? 1 : inOutCubicK((u - 0.12) / 0.78);
  return {
    h: Math.sin(Math.PI * u) ** 0.9 * Math.min(0.85, gap / 0.7),
    alpha: 1,
    sx: 1 + squash * 0.6,
    sy: 1 - squash,
    rot: rotA + (rotB - rotA) * k,
    k,
  };
}

const inOutCubicK = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

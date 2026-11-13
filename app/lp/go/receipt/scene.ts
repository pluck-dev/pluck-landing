/**
 * 견적 영수증: the quiz result as a receipt that feeds out of a small printer, a pure function of t.
 *
 *   0 → 0.42       printer drops into place (y outBack + squash on landing)
 *   start[i]       line i feeds (paper grows by that line's height, outCubic) and its ink comes up
 *   stampHit       (only with an opened coupon) paper/stamp.ts: the rubber stamp falls, hits the coupon
 *                  line (thunk, squash, ink spread, shake), lifts away turning
 *   cut            cutter: the receipt drops out of the slot (outBack), sways on its top (damped sine)
 *                  and its bottom curls up a little (outCubic), then rests
 *   end            everything at rest (≥ 0.5 s still frames before it)
 *
 * The numbers are real DOM text (selectable, readable by screen readers); the canvases only draw paper,
 * printer, stamp tool and ink. Line heights come from the DOM (layout.edges).
 */
import { clamp, DEG, lerp, outBack, outCubic, ring, seg } from "../paper/ease";
import { stampPose, stampShake } from "../paper/stamp";

export const FEED = 0.17;
const GAP = 0.23;

export type ReceiptLayout = {
  /** Paper width / full height (CSS px). */
  W: number;
  H: number;
  /** Paper length after each feed: edges[0] = stub showing at the start, edges[i+1] = after line i. */
  edges: number[];
  /** Index of the coupon line (-1 = no coupon). */
  coupon: number;
  /** Where the stamp lands (paper coords, centre). */
  stamp: { x: number; y: number };
};

export type Timeline = { start: number[]; stampHit: number | null; tail: number; cut: number; end: number };

export function timeline(L: ReceiptLayout): Timeline {
  const n = L.edges.length - 2;
  const start: number[] = [];
  let t = 0.5;
  let stampHit: number | null = null;
  for (let i = 0; i < n; i++) {
    start.push(t);
    t += GAP + (i === 0 ? 0.1 : 0);
    if (i === L.coupon) {
      stampHit = t + 0.3;
      t = stampHit + 0.42;
    }
  }
  const tail = t;
  const cut = tail + FEED + 0.28;
  return { start, stampHit, tail, cut, end: cut + 1.45 };
}

/** Paper length out of the slot at time t (monotonic in t). */
export function feedLength(t: number, L: ReceiptLayout, T: Timeline) {
  const e = L.edges;
  let len = e[0];
  for (let i = 0; i < T.start.length; i++) len += (e[i + 1] - e[i]) * outCubic(seg(t, T.start[i], T.start[i] + FEED));
  len += (e[e.length - 1] - e[e.length - 2]) * outCubic(seg(t, T.tail, T.tail + FEED + 0.06));
  return len;
}

/** Inverse of feedLength (bisection) for the hand: pull the paper to `len`, get the t that shows it. */
export function timeForLength(len: number, L: ReceiptLayout, T: Timeline) {
  let lo = 0;
  let hi = T.tail + FEED + 0.06;
  if (feedLength(hi, L, T) <= len) return hi;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (feedLength(mid, L, T) < len) lo = mid;
    else hi = mid;
  }
  return hi;
}

export type ReceiptPose = ReturnType<typeof pose>;

export function pose(t: number, L: ReceiptLayout, T: Timeline, reduced: boolean) {
  const motion = reduced ? 0 : 1;

  // Printer: drops in, lands with a little squash.
  const pIn = seg(t, 0, 0.32);
  const printer = {
    y: reduced ? 0 : lerp(-14, 0, outBack(pIn, 1.4)),
    alpha: reduced ? 1 : clamp(pIn * 2.2),
    sy: 1 + ring(t - 0.3, 0.05, 14, 5) * motion,
  };

  const len = feedLength(t, L, T);
  const ink = T.start.map((s) => seg(t, s + 0.06, s + 0.2));

  // Each feed nudges the paper (motor jerk), tiny and decaying.
  let jiggle = 0;
  if (motion) for (const s of T.start) jiggle += ring(t - s - FEED * 0.6, 0.9, 22, 10);

  // Stamp: tool falls, hits the coupon line, lifts away (shared paper/stamp.ts).
  const stamp = T.stampHit !== null ? stampPose(t - T.stampHit, -12 * DEG, reduced) : null;
  const shake = T.stampHit !== null && motion ? stampShake(t - T.stampHit, 3.2) : { x: 0, y: 0 };

  // Cut: drop out of the slot, sway on its top edge, curl the bottom.
  const sCut = t - T.cut;
  const detached = sCut >= 0;
  const drop = detached ? 6 * outBack(seg(sCut, 0, 0.3), 2) : 0;
  const sway = motion ? ring(sCut, 1.8 * DEG, 3.4, 1.15) : 0;
  const curl = outCubic(seg(sCut, 0.12, 0.85));
  // Paper under the slot is in the printer's shade; fades once it hangs free.
  const shade = 1 - seg(sCut, 0, 0.25);

  return { t, printer, len, ink, jiggle, stamp, shake, detached, drop, sway, curl, shade, reduced };
}

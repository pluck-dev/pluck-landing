/**
 * 견적 영수증: the quiz result as a receipt that feeds out of a small printer, a pure function of t.
 *
 *   0 → 0.42       printer drops into place (y outBack + squash on landing)
 *   start[i]       line i feeds (paper grows by that line's height, outCubic) and its ink comes up
 *   stampHit       (only with an opened coupon) the rubber stamp falls (inCubic), hits the coupon line
 *                  (thunk, squash, ink spread, shake), lifts away turning (outCubic)
 *   cut            cutter: the receipt drops out of the slot (outBack), sways on its top (damped sine)
 *                  and its bottom curls up a little (outCubic), then rests
 *   end            everything at rest (≥ 0.5 s still frames before it)
 *
 * The numbers are real DOM text (selectable, readable by screen readers); the canvases only draw paper,
 * printer, stamp tool and ink. Line heights come from the DOM (layout.edges).
 */
import { clamp, DEG, inCubic, lerp, outBack, outCubic, ring, seg } from "../paper/ease";

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

  // Stamp: tool falls (h 1→0), hits, lifts away. sImp = time since impact.
  let stamp = null as null | {
    h: number;
    alpha: number;
    sx: number;
    sy: number;
    rot: number;
    dx: number;
    dy: number;
    ink: number;
    spread: number;
  };
  let shake = { x: 0, y: 0 };
  if (T.stampHit !== null) {
    const sImp = t - T.stampHit;
    const fall = seg(t, T.stampHit - 0.24, T.stampHit);
    const lift = outCubic(seg(sImp, 0.1, 0.46));
    const h = sImp < 0 ? 1 - inCubic(fall) : lift;
    const squash = sImp >= 0 ? ring(sImp, 0.07, 16, 5.5) : 0;
    stamp = {
      h,
      alpha: sImp < 0 ? clamp((fall - 0.02) * 5) : 1 - seg(sImp, 0.22, 0.46),
      sx: 1 + squash * 0.6,
      sy: 1 - squash,
      rot: (-12 + (sImp < 0 ? -6 * (1 - fall) : 9 * lift)) * DEG,
      dx: sImp < 0 ? 18 * (1 - fall) : 26 * lift,
      dy: sImp < 0 ? -10 * (1 - fall) : -22 * lift,
      ink: sImp >= 0 ? 1 : 0,
      spread: outCubic(seg(sImp, 0, 0.28)),
    };
    if (motion && sImp > 0 && sImp < 0.7) {
      shake = { x: ring(sImp, 3.2, 8, 13), y: ring(sImp, 2.4, 8, 17, 1) };
    }
  }

  // Cut: drop out of the slot, sway on its top edge, curl the bottom.
  const sCut = t - T.cut;
  const detached = sCut >= 0;
  const drop = detached ? 6 * outBack(seg(sCut, 0, 0.3), 2) : 0;
  const sway = motion ? ring(sCut, 1.8 * DEG, 3.4, 1.15) : 0;
  const curl = outCubic(seg(sCut, 0.12, 0.85));
  // Paper under the slot is in the printer's shade; fades once it hangs free.
  const shade = 1 - seg(sCut, 0, 0.25);

  return { t, printer, len, ink, jiggle: jiggle + 0, stamp, shake, detached, drop, sway, curl, shade, reduced };
}

/**
 * 보내기 = 봉투 봉하기. Plays only after the server has confirmed the inquiry (QuoteLeadForm success).
 * Pure function of t (seconds):
 *
 *   0    → 0.3   the filled sheet (what the visitor just sent) rests
 *   0.3  → 0.78  bottom third folds up (θ 0→π, inOutCubic: foreshortened, back side once past 90°)
 *   0.8  → 1.26  top third folds down over it
 *   1.2  → 1.62  the folded letter drops into the envelope's pocket (outCubic + a little settle)
 *   1.62 → 2.0   the flap closes (θ, outBack: it slaps shut and lifts a hair)
 *   2.32         PLUCK stamp hits the envelope (paper/stamp.ts: thunk, squash, ink, shake)
 *   2.9  → 3.38  anticipation dip, then the envelope slides out the top (inCubic), turning a little
 *   3.4  → 3.9   thank-you text comes up (DOM)
 */
import { clamp, DEG, inCubic, inOutCubic, lerp, outBack, outCubic, ring, seg } from "../paper/ease";
import { stampPose, stampShake } from "../paper/stamp";

export const T_FOLD1 = 0.3;
export const T_FOLD2 = 0.8;
export const T_DROP = 1.2;
export const T_FLAP = 1.62;
export const T_STAMP = 2.32;
export const T_SEND = 2.9;
export const T_END = 3.9;

export type SealLayout = ReturnType<typeof sealLayout>;

export function sealLayout(W: number) {
  const cw = Math.round(Math.min(W - 24, 360));
  const ch = Math.round(cw * 1.2);
  const third = ch / 3;
  const ew = Math.round(cw * 1.06);
  const eh = Math.round(third + 26);
  const H = Math.round(ch + 36);
  /** Sheet top-left; envelope centre (its pocket sits where the folded letter lands). */
  const sheet = { x: (W - cw) / 2, y: 14 };
  const env = { x: W / 2, y: Math.round(sheet.y + ch / 2 + eh * 0.35) };
  return { W, H, cw, ch, third, ew, eh, sheet, env };
}

export type SealPose = ReturnType<typeof sealPose>;

export function sealPose(t: number, L: SealLayout, reduced: boolean) {
  const motion = reduced ? 0 : 1;
  const f1 = Math.PI * inOutCubic(seg(t, T_FOLD1, T_FOLD1 + 0.48));
  const f2 = Math.PI * inOutCubic(seg(t, T_FOLD2, T_FOLD2 + 0.46));
  // Each crease lands with a tiny bounce of the whole sheet.
  const bounce = ring(t - T_FOLD1 - 0.48, 2, 14, 6) + ring(t - T_FOLD2 - 0.46, 2, 14, 6);

  // Envelope appears under the sheet while folding (rises from the table).
  const envIn = outCubic(seg(t, 0.7, 1.15));
  // Folded packet (middle third) drops into the pocket.
  const drop = outBack(seg(t, T_DROP, T_DROP + 0.42), 1.2);
  const packetFrom = L.sheet.y + L.third + L.third / 2;
  const packetTo = L.env.y + 4;
  const packetY = lerp(packetFrom, packetTo, drop);
  const flap = Math.PI * clamp(outBack(seg(t, T_FLAP, T_FLAP + 0.38), 1.6), 0, 1.06);

  const stamp = stampPose(t - T_STAMP, -7 * DEG, reduced);
  const shake = motion ? stampShake(t - T_STAMP, 3.4) : { x: 0, y: 0 };

  // Send: dip, then out the top.
  const s = t - T_SEND;
  const dip = s > 0 ? 7 * Math.sin(Math.PI * seg(s, 0, 0.18)) : 0;
  const out = inCubic(seg(s, 0.1, 0.48));
  // Reduced motion: the envelope fades where it lies instead of flying out the top.
  const sendY = reduced ? 0 : dip - out * (L.env.y + L.eh + 40);
  const sendRot = reduced ? 0 : -4 * DEG * out + ring(s, 1.2 * DEG, 6, 3) * (1 - out);
  const sendAlpha = reduced ? 1 - out : 1;
  const text = outCubic(seg(t, 3.4, 3.9));

  return { t, f1, f2, bounce: bounce * motion, envIn, packetY, drop, flap, stamp, shake, sendY, sendRot, sendAlpha, sent: out >= 1, text };
}

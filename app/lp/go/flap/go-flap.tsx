"use client";

import { useEffect, useRef } from "react";
import { clamp, inCubic, outCubic, ring } from "../paper/ease";
import { Loop, prefersReduced } from "../paper/runtime";
import { sfxFlap, unlockSound, vibrate } from "../paper/sfx";
import "./flap.css";

export type FlapStat = { label: string; value: number };

/** Flaps per module: one full turn of the drum, so it lands back on the number it started from. */
const FLIPS = 10;
const START = 0.1;
/** Module m starts this much after module m-1 (left to right, first board then second). */
const STAGGER = 0.09;
/** Flap k of a run takes GAP(k): quick at first, slowing into the last one (cubic). */
const gap = (k: number) => 0.058 + 0.06 * (k / (FLIPS - 1)) ** 3;
/** The last flap swings past the stop and bounces this long. */
const BOUNCE = 0.42;

const starts = (() => {
  const out = [0];
  for (let k = 0; k < FLIPS; k++) out.push(out[k] + gap(k));
  return out; // out[k] = start of flap k relative to the module's start, out[FLIPS] = end
})();
const RUN = starts[FLIPS];

type ModulePose = {
  cur: number;
  nxt: number;
  /** Top leaf angle (0 → -90 deg), null = hidden. */
  top: number | null;
  /** Bottom leaf angle (90 → 0 deg, then the bounce), null = hidden. */
  bot: number | null;
  /** Shadow the falling top leaf casts on the lower half, 0..1. */
  cast: number;
};

/**
 * render(t) for one module: pure function of t (seconds since the run began) and its start offset.
 * Top leaf: inCubic (gravity), darkening as it turns away. Bottom leaf: outCubic onto the stop; after
 * the last flap a damped |sine| bounce (it hits the stop and swings back up a little, twice).
 */
export function modulePose(t: number, offset: number, digit: number): ModulePose {
  const s = t - offset;
  if (s < 0) return { cur: digit, nxt: digit, top: null, bot: null, cast: 0 };
  if (s >= RUN) {
    const b = s - RUN;
    const bounce = b < BOUNCE ? Math.abs(ring(b, 14, 9, 3.2)) : 0;
    return { cur: digit, nxt: digit, top: null, bot: bounce > 0.05 ? bounce : null, cast: 0 };
  }
  let k = 0;
  while (k < FLIPS - 1 && s >= starts[k + 1]) k++;
  const u = clamp((s - starts[k]) / gap(k));
  const cur = (digit + k) % 10;
  const nxt = (digit + k + 1) % 10;
  if (u < 0.5) {
    const a = inCubic(u / 0.5);
    return { cur, nxt, top: -90 * a, bot: null, cast: a };
  }
  const a = outCubic((u - 0.5) / 0.5);
  return { cur, nxt, top: null, bot: 90 * (1 - a), cast: 1 - a };
}

/** Board shake when the last module lands: damped sine, 0 at rest. */
export const boardShake = (t: number, end: number) => ring(t - end, 1.4, 11, 9);

/**
 * /lp/go hero numbers as a mechanical split-flap board (reveal-craft moment). The server renders the
 * final numbers (no flash, correct without JS); on load every module turns its drum once and lands back
 * on the same digit, staggered left to right, the last flap of each bouncing on its stop. Tapping the
 * board turns it again, with sound (WebAudio only exists after a gesture, so the load run is silent).
 * Paths: auto (load) · hand (tap) · skip (hero not on screen at load → stays at rest) ·
 * reduced motion (same run, flat: each card just changes in place, no turning leaves, no bounce or shake).
 * The digits are DOM text in Paperlogy; only transforms change per frame.
 */
export function GoFlapStats({ items }: { items: FlapStat[] }) {
  const rootRef = useRef<HTMLDListElement>(null);
  const digits = items.map((item) => String(item.value).split("").map(Number));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const modules = Array.from(root.querySelectorAll<HTMLElement>(".flp-m"));
    const boards = Array.from(root.querySelectorAll<HTMLElement>(".flp"));
    const flat = digits.flat();
    const parts = modules.map((m) => ({
      top: m.querySelector<HTMLElement>(".flp-top .flp-d")!,
      bot: m.querySelector<HTMLElement>(".flp-bot .flp-d")!,
      leafT: m.querySelector<HTMLElement>(".flp-lt")!,
      leafTd: m.querySelector<HTMLElement>(".flp-lt .flp-d")!,
      leafB: m.querySelector<HTMLElement>(".flp-lb")!,
      leafBd: m.querySelector<HTMLElement>(".flp-lb .flp-d")!,
      cast: m.querySelector<HTMLElement>(".flp-cast")!,
    }));
    // Second board starts a beat after the first, as if the same mechanism moves on.
    const offsets = modules.map((_, i) => START + i * STAGGER + (i >= digits[0].length ? 0.09 : 0));
    const end = offsets[offsets.length - 1] + RUN;
    const total = end + BOUNCE + 0.1;
    const reduced = prefersReduced();
    let t = total;
    let running = false;

    const setText = (el: HTMLElement, v: number) => {
      const s = String(v);
      if (el.textContent !== s) el.textContent = s;
    };
    const render = () => {
      modules.forEach((_, i) => {
        const P = modulePose(t, offsets[i], flat[i]);
        const el = parts[i];
        if (reduced) {
          // Flat card: the digit changes in place (cur while the top leaf would fall, then nxt).
          const shown = P.bot !== null ? P.nxt : P.cur;
          setText(el.top, shown);
          setText(el.bot, shown);
          el.leafT.style.visibility = "hidden";
          el.leafB.style.visibility = "hidden";
          el.cast.style.opacity = "0";
          return;
        }
        setText(el.top, P.nxt);
        setText(el.bot, P.cur);
        setText(el.leafTd, P.cur);
        setText(el.leafBd, P.nxt);
        el.leafT.style.visibility = P.top === null ? "hidden" : "visible";
        el.leafB.style.visibility = P.bot === null ? "hidden" : "visible";
        if (P.top !== null) {
          el.leafT.style.transform = `rotateX(${P.top.toFixed(2)}deg)`;
          el.leafT.style.setProperty("--shade", (Math.abs(P.top) / 90 * 0.3).toFixed(3));
        }
        if (P.bot !== null) {
          el.leafB.style.transform = `rotateX(${P.bot.toFixed(2)}deg)`;
          el.leafB.style.setProperty("--shade", ((P.bot / 90) * 0.22).toFixed(3));
        }
        el.cast.style.opacity = (P.cast * 0.16).toFixed(3);
      });
      const shake = reduced ? 0 : boardShake(t, end);
      boards.forEach((b) => (b.style.transform = shake ? `translate3d(0, ${shake.toFixed(2)}px, 0)` : ""));
    };

    /** Flap k of module i lands at offsets[i] + starts[k+1]: fire its sound when t crosses it. */
    const sounds = (prev: number) => {
      modules.forEach((_, i) => {
        for (let k = 0; k < FLIPS; k++) {
          const at = offsets[i] + starts[k + 1];
          if (prev < at && t >= at) sfxFlap(i * FLIPS + k, k === FLIPS - 1);
        }
      });
      if (prev < end && t >= end) vibrate([20, 30, 40]);
    };

    const loop = new Loop((dt) => {
      const prev = t;
      t = Math.min(total, t + dt);
      sounds(prev);
      render();
      running = t < total;
      return running;
    });

    const run = () => {
      t = 0;
      render();
      loop.wake();
    };

    // Skip: if the hero is not on screen at load (reloaded lower down), leave the board at rest.
    const r = root.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) run();

    const onTap = () => {
      unlockSound();
      if (!running) run();
    };
    // Replaying is decoration (the numbers are already readable), so it is a pointer affordance only.
    boards.forEach((b) => b.addEventListener("click", onTap));

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __flap?: unknown }).__flap = {
        total,
        seek: (at: number) => {
          loop.stop();
          t = at;
          render();
        },
        play: run,
      };
    }

    return () => {
      loop.stop();
      boards.forEach((b) => b.removeEventListener("click", onTap));
    };
    // digits derive from items; values are fixed for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dl className="gh-stats" ref={rootRef}>
      {items.map((item, b) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            <span className="go-sr">{item.value}</span>
            <span className="flp" aria-hidden="true">
              {digits[b].map((d, i) => (
                <span className="flp-m" key={i}>
                  <span className="flp-h flp-top">
                    <span className="flp-d">{d}</span>
                  </span>
                  <span className="flp-h flp-bot">
                    <span className="flp-d">{d}</span>
                    <span className="flp-cast" />
                  </span>
                  <span className="flp-h flp-top flp-lt">
                    <span className="flp-d">{d}</span>
                  </span>
                  <span className="flp-h flp-bot flp-lb">
                    <span className="flp-d">{d}</span>
                  </span>
                </span>
              ))}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

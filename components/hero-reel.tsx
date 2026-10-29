"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLayoutEffect, useEffect, useRef, type ReactNode } from "react";

export type ReelScreen = { src: string; alt: string; name: string };
export type ReelStep = { statement: string; detail: string; screen: ReelScreen };
export type ReelPhone = { src: string; alt: string };

type Props = {
  title: ReactNode;
  lead: string;
  contactHref: string;
  opening: ReelScreen;
  steps: readonly ReelStep[];
  phones: readonly ReelPhone[];
  extras: readonly ReelScreen[];
  closing: string;
};

/** Keyframe = [progress, x, y, scale, rotate(deg), opacity]. x/y are px from stage center. */
type Key = [number, number, number, number, number, number];

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function sample(keys: Key[], p: number) {
  if (p <= keys[0][0]) return keys[0];
  for (let i = 1; i < keys.length; i += 1) {
    const [p1] = keys[i];
    if (p <= p1) {
      const a = keys[i - 1];
      const b = keys[i];
      const t = ease((p - a[0]) / (p1 - a[0] || 1));
      return a.map((v, k) => (k === 0 ? p : v + (b[k] - v) * t)) as Key;
    }
  }
  return keys[keys.length - 1];
}

/** In/out window for a stacked text line or crossfading screen. */
function windowed(p: number, start: number, end: number, fade = 0.035) {
  const fadeIn = clamp((p - start) / fade);
  const fadeOut = end >= 1 ? 1 : clamp((end - p) / fade);
  return { o: Math.min(fadeIn, fadeOut), dir: p < start + fade ? 1 - fadeIn : -(1 - fadeOut) };
}

/**
 * Pinned opening scene: the hero headline sits on paper while a real client
 * screen peeks from below; scrolling grows it to full bleed, then it steps
 * aside as the studio's disciplines swap in, phones and more screens fly in.
 * Only transform/opacity are written per frame. Reduced motion = static CSS layout.
 */
export function HeroReel({
  title,
  lead,
  contactHref,
  opening,
  steps,
  phones,
  extras,
  closing,
}: Props) {
  const track = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = track.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const q = <T extends HTMLElement>(sel: string) =>
      [...root.querySelectorAll<T>(sel)];
    const stage = root.querySelector<HTMLElement>(".reel-stage")!;
    const intro = root.querySelector<HTMLElement>(".reel-intro")!;
    const frame = root.querySelector<HTMLElement>(".reel-frame")!;
    const dark = root.querySelector<HTMLElement>(".reel-dark")!;
    const shots = q(".reel-shot");
    const lines = q(".reel-line");
    const phoneEls = q(".reel-phone");
    const extraEls = q(".reel-extra");
    const finale = root.querySelector<HTMLElement>(".reel-closing")!;

    let frameId = 0;
    let geo = { w: 0, h: 0, fw: 0, fh: 0, pw: 0, ph: 0, ew: 0, eh: 0, mobile: false, top: 0, span: 1 };
    // Step windows: statements own 0.28–0.86, closing owns the rest.
    const s0 = 0.28;
    const stepLen = (0.86 - s0) / Math.max(1, steps.length);

    const measure = () => {
      const header = document.querySelector<HTMLElement>(".site-header");
      root.style.setProperty("--head", `${header?.offsetHeight ?? 81}px`);
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const rect = root.getBoundingClientRect();
      geo = {
        w,
        h,
        fw: frame.offsetWidth,
        fh: frame.offsetHeight,
        pw: phoneEls[0]?.offsetWidth ?? 0,
        ph: phoneEls[0]?.offsetHeight ?? 0,
        ew: extraEls[0]?.offsetWidth ?? 0,
        eh: extraEls[0]?.offsetHeight ?? 0,
        mobile: w < 760,
        top: rect.top + scrollY - (header?.offsetHeight ?? 0),
        span: Math.max(1, root.offsetHeight - stage.offsetHeight),
      };
    };

    const put = (el: HTMLElement, k: Key, extra = "") => {
      el.style.transform = `translate3d(${k[1].toFixed(1)}px, ${k[2].toFixed(1)}px, 0) rotate(${k[4].toFixed(2)}deg) scale(${k[3].toFixed(4)})${extra}`;
      el.style.opacity = k[5].toFixed(3);
    };

    const render = () => {
      frameId = 0;
      if (reduce.matches) return;
      const { w, h, fw, fh, pw, ph, ew, mobile } = geo;
      const p = clamp((scrollY - geo.top) / geo.span);
      root.dataset.phase = p < 0.1 ? "intro" : p < 0.92 ? "reel" : "end";

      // Intro copy lifts away first.
      const ip = clamp(p / 0.13);
      intro.style.transform = `translate3d(0, ${(-ip * h * 0.22).toFixed(1)}px, 0)`;
      intro.style.opacity = (1 - ease(ip)).toFixed(3);
      dark.style.opacity = clamp((p - 0.1) / 0.08).toFixed(3);

      // Frame: peek → full bleed → card aside → center for the finale.
      const peekY = h * (mobile ? 0.72 : 0.74) + fh / 2 - h / 2;
      const full = Math.max((w - (mobile ? 0 : 24)) / fw, (h - (mobile ? 0 : 24)) / fh);
      // Mobile: a 16:10 shot cannot cover a portrait stage without heavy upscaling, so overscale moderately.
      const bleed = mobile ? Math.min(full, 1.32) : full;
      const cardS = mobile ? 1 : 0.86;
      const cardX = mobile ? 0 : w / 2 - Math.max(56, (w - 1320) / 2) - (fw * cardS) / 2;
      const cardY = mobile ? h * 0.02 : 0;
      const endS = mobile ? 0.74 : 0.56;
      const endY = mobile ? h * 0.04 : h * 0.1;
      put(
        frame,
        sample(
          [
            [0, 0, peekY, 1, 0, 1],
            [0.16, 0, 0, bleed, 0, 1],
            [0.21, 0, 0, bleed, 0, 1],
            [0.33, cardX, cardY, cardS, 0, 1],
            [0.86, cardX, cardY, cardS, 0, 1],
            [0.95, 0, endY, endS, 0, 1],
          ],
          p,
        ),
      );

      // Screens inside the frame crossfade with each statement.
      shots.forEach((shot, i) => {
        if (i === 0) {
          shot.style.opacity = "1";
          return;
        }
        const start = s0 + (i - 1) * stepLen;
        shot.style.opacity = clamp((p - start + 0.01) / 0.03).toFixed(3);
      });

      lines.forEach((line, i) => {
        const start = s0 + i * stepLen;
        const end = i === steps.length - 1 ? 0.86 : start + stepLen;
        const { o, dir } = windowed(p, start, end);
        line.style.opacity = o.toFixed(3);
        line.style.transform = `translate3d(0, ${(dir * (mobile ? 36 : 70)).toFixed(1)}px, 0)`;
      });

      const fin = windowed(p, 0.88, 1, 0.05);
      finale.style.opacity = fin.o.toFixed(3);
      finale.style.transform = `translate3d(0, ${(fin.dir * 60).toFixed(1)}px, 0)`;

      // Phones rise from below during "개발", the rest join on "AI"; all fan out at the end.
      const devStart = s0 + 2 * stepLen;
      const aiStart = s0 + 3 * stepLen;
      const cx = cardX;
      const cardW = fw * cardS;
      const cardH = fh * cardS;
      const below = h / 2 + ph;
      const slots: { at: number; x: number; y: number; r: number; ex: number; ey: number; er: number }[] = [];
      if (mobile) {
        // Fanned row under the card; the finale keeps the fan under the centered frame.
        const base = cardY + cardH * 0.5 + ph * 0.18;
        const endBase = endY + fh * endS * 0.5 + ph * 0.1;
        [
          [devStart, -0.3, 0.06, -9],
          [devStart + 0.02, 0.3, 0.06, 9],
          [aiStart, -0.1, 0, -3],
          [aiStart + 0.02, 0.1, 0, 3],
        ].forEach(([at, fx, dy, r]) =>
          slots.push({ at, x: w * fx, y: base + ph * dy, r, ex: w * fx * 1.12, ey: endBase + ph * dy, er: r * 1.2 }),
        );
      } else {
        slots.push(
          { at: devStart, x: cx - cardW * 0.5 + pw * 0.1, y: cardH * 0.22, r: -8, ex: -w * 0.33, ey: h * 0.16, er: -9 },
          { at: devStart + 0.02, x: cx + cardW * 0.5 - pw * 0.45, y: cardH * 0.12, r: 6, ex: w * 0.33, ey: h * 0.16, er: 9 },
          { at: aiStart, x: cx - cardW * 0.14, y: cardH * 0.5 - ph * 0.22, r: -3, ex: -w * 0.205, ey: h * 0.24, er: -4 },
          { at: aiStart + 0.02, x: cx + cardW * 0.14, y: cardH * 0.5 - ph * 0.18, r: 4, ex: w * 0.205, ey: h * 0.24, er: 4 },
        );
      }
      phoneEls.forEach((el, i) => {
        const s = slots[i % slots.length];
        put(
          el,
          sample(
            [
              [0, s.x, below, 0.9, s.r * 2, 0],
              [s.at, s.x, below, 0.9, s.r * 2, 0],
              [s.at + 0.08, s.x, s.y, 1, s.r, 1],
              [0.86, s.x, s.y, 1, s.r, 1],
              [0.96, s.ex, s.ey, mobile ? 0.82 : 0.9, s.er, 1],
            ],
            p,
          ),
        );
      });

      // Two extra screens slide in from the sides for the finale spread.
      extraEls.forEach((el, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const tx = side * (mobile ? w * 0.3 : w * 0.31);
        const ty = mobile ? h * 0.12 : h * 0.05;
        put(
          el,
          sample(
            [
              [0, side * (w * 0.5 + ew), ty, 0.9, side * 6, 0],
              [0.86, side * (w * 0.5 + ew), ty, 0.9, side * 6, 0],
              [0.96, tx, ty, mobile ? 0.62 : 1, side * 3, 1],
            ],
            p,
          ),
        );
      });
    };

    const schedule = () => {
      if (!frameId) frameId = requestAnimationFrame(render);
    };
    const reset = () => {
      [intro, frame, dark, finale, ...shots, ...lines, ...phoneEls, ...extraEls].forEach((el) => {
        el.style.removeProperty("transform");
        el.style.removeProperty("opacity");
      });
      delete root.dataset.phase;
    };
    const configure = () => {
      root.dataset.motion = String(!reduce.matches);
      if (reduce.matches) {
        reset();
        return;
      }
      measure();
      render();
    };

    configure();
    // Fonts/images can shift the header height after first paint.
    const ro = new ResizeObserver(configure);
    ro.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", configure);
    reduce.addEventListener("change", configure);
    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", configure);
      reduce.removeEventListener("change", configure);
      reset();
    };
  }, [steps.length]);

  const screens = [opening, ...steps.map((step) => step.screen)];

  return (
    <div ref={track} className="reel" id="top">
      <div className="reel-stage">
        <div className="reel-dark" aria-hidden="true" />

        <div className="reel-intro shell">
          <h1 id="hero-title" className="reel-title">
            {title}
          </h1>
          <div className="reel-intro-row">
            <p className="reel-lead">{lead}</p>
            <div className="reel-actions">
              <a className="button button-primary button-xl" href={contactHref}>
                프로젝트 상담하기 <ArrowRight size={20} aria-hidden="true" />
              </a>
              <a className="button button-ghost button-xl" href="#work">
                포트폴리오 보기
              </a>
            </div>
          </div>
        </div>

        <ol className="reel-lines" aria-label="PLUCK이 맡는 일">
          {steps.map((step) => (
            <li className="reel-line" key={step.statement}>
              <p className="reel-statement">{step.statement}</p>
              <p className="reel-detail">
                <strong>{step.screen.name}</strong>
                {step.detail}
              </p>
            </li>
          ))}
        </ol>

        <p className="reel-closing">{closing}</p>

        <div className="reel-objects">
          {extras.map((extra) => (
            <figure className="reel-extra" key={extra.src}>
              <Image src={extra.src} alt={extra.alt} fill sizes="(max-width: 760px) 60vw, 30vw" />
            </figure>
          ))}

          <figure className="reel-frame">
            <span className="reel-bar" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="reel-screen">
              {screens.map((screen, i) => (
                <span className="reel-shot" key={screen.src}>
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    fill
                    sizes="100vw"
                    loading="eager"
                    fetchPriority={i === 0 ? "high" : "auto"}
                  />
                </span>
              ))}
            </span>
          </figure>

          {phones.map((phone) => (
            <figure className="reel-phone" key={phone.src}>
              <Image src={phone.src} alt={phone.alt} fill sizes="(max-width: 760px) 36vw, 220px" />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

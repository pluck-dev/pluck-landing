import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * A real screenshot from public/work, optionally cropped tight on one detail, with hand-drawn marks
 * (loose marker rings, curved arrows, short notes). All coordinates are in the source image's pixels
 * (portfolio images are 1600x1000), so a crop never moves the marks off their target.
 *
 * Strokes are drawn once when the figure scrolls into view (go-draw.tsx adds .is-drawn);
 * with reduced motion or no JS they are simply there.
 */
export type Mark = {
  /** Marker ring around a detail: centre x, centre y, radius x, radius y. */
  ring?: readonly [number, number, number, number];
  /** Curved arrow: from (x1,y1) to (x2,y2); bend = sideways pull of the curve in px. */
  arrow?: readonly [number, number, number, number, number?];
  /** Short note; `corner` is which corner of the note sits on `at`. */
  note?: { text: string; at: readonly [number, number]; corner?: "tl" | "tr" | "bl" | "br" };
};

type ShotProps = {
  src: string;
  alt: string;
  /** x, y, width, height of the visible part, in source pixels. Default: the whole image. */
  crop?: readonly [number, number, number, number];
  source?: readonly [number, number];
  marks?: readonly Mark[];
  caption?: string;
  /** Rendered frame width: on phones (vw) and above 900px (px). Used for the image `sizes`. */
  vw?: number;
  px?: number;
  /** Show a plain browser bar with this address above the screenshot. */
  browser?: string;
  eager?: boolean;
  className?: string;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A marker ring drawn the way a hand does it: slightly tilted, wobbly, overshooting its start. */
function ringPath([cx, cy, rx, ry]: readonly [number, number, number, number], seed: number) {
  const steps = 44;
  const start = -2.4 + seed * 0.7;
  const sweep = Math.PI * 2 + 0.55;
  const tilt = -0.06 + (seed % 3) * 0.03;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + sweep * t;
    const wobble = 1 + 0.035 * Math.sin(a * 3 + seed) + 0.02 * Math.sin(a * 5 + seed * 2);
    const grow = 0.95 + 0.1 * t;
    const x = rx * grow * wobble * Math.cos(a);
    const y = ry * grow * wobble * Math.sin(a);
    const px = cx + x * Math.cos(tilt) - y * Math.sin(tilt);
    const py = cy + x * Math.sin(tilt) + y * Math.cos(tilt);
    points.push(`${i ? "L" : "M"}${r1(px)} ${r1(py)}`);
  }
  return points.join("");
}

/** Quadratic arrow with an open head at the end. */
function arrowPaths([x1, y1, x2, y2, bend = 40]: readonly [number, number, number, number, number?], head: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const qx = mx + (-(y2 - y1) / len) * bend;
  const qy = my + ((x2 - x1) / len) * bend;
  const angle = Math.atan2(y2 - qy, x2 - qx);
  const wing = (offset: number) =>
    `${r1(x2 - head * Math.cos(angle + offset))} ${r1(y2 - head * Math.sin(angle + offset))}`;
  return {
    line: `M${r1(x1)} ${r1(y1)}Q${r1(qx)} ${r1(qy)} ${r1(x2)} ${r1(y2)}`,
    head: `M${wing(0.5)}L${r1(x2)} ${r1(y2)}L${wing(-0.5)}`,
  };
}

export function Shot({
  src,
  alt,
  crop,
  source = [1600, 1000],
  marks = [],
  caption,
  vw = 90,
  px = 720,
  browser,
  eager,
  className,
}: ShotProps) {
  const [sw, sh] = source;
  const [cx, cy, cw, ch] = crop ?? [0, 0, sw, sh];
  const scale = sw / cw;
  const sizes = `(max-width: 900px) ${Math.round(vw * scale)}vw, ${Math.round(px * scale)}px`;
  const stroke = r1(cw / 160);
  const pct = (value: number, of: number) => `${r1((value / of) * 1000) / 10}%`;
  let delay = 0;

  return (
    <figure className={["shot", className].filter(Boolean).join(" ")} data-draw={marks.length ? "" : undefined}>
      {browser && (
        <div className="shot-browser" aria-hidden="true">
          <span className="shot-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="shot-url">{browser}</span>
        </div>
      )}
      <div className="shot-stage">
        <div className="shot-frame" style={{ aspectRatio: `${cw} / ${ch}` }}>
          <Image
            src={src}
            alt={alt}
            width={sw}
            height={sh}
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            style={{ width: pct(sw, cw), left: pct(-cx, cw), top: pct(-cy, ch) }}
          />
        </div>
        {marks.length > 0 && (
          <>
            <svg className="mk" viewBox={`${cx} ${cy} ${cw} ${ch}`} aria-hidden="true" style={{ strokeWidth: stroke }}>
              {marks.map((mark, index) => {
                const paths: string[] = [];
                if (mark.ring) paths.push(ringPath(mark.ring, index + 1));
                if (mark.arrow) {
                  const arrow = arrowPaths(mark.arrow, stroke * 3.6);
                  paths.push(arrow.line, arrow.head);
                }
                return paths.map((d, part) => {
                  const style = { "--d": `${(delay++ * 0.22).toFixed(2)}s` } as CSSProperties;
                  return <path key={`${index}-${part}`} d={d} pathLength={1} style={style} />;
                });
              })}
            </svg>
            {marks.map((mark, index) =>
              mark.note ? (
                <span
                  key={index}
                  className={`mk-note mk-${mark.note.corner ?? "tl"}`}
                  aria-hidden="true"
                  style={
                    {
                      left: pct(mark.note.at[0] - cx, cw),
                      top: pct(mark.note.at[1] - cy, ch),
                      "--d": `${(index * 0.3 + 0.5).toFixed(2)}s`,
                    } as CSSProperties
                  }
                >
                  {mark.note.text}
                </span>
              ) : null,
            )}
          </>
        )}
      </div>
      {(caption || marks.some((mark) => mark.note)) && (
        <figcaption>
          {caption}
          {/* Notes are drawn for sighted users; screen readers get them here. */}
          {marks.some((mark) => mark.note) && (
            <span className="go-sr"> 메모: {marks.flatMap((mark) => (mark.note ? [mark.note.text] : [])).join(", ")}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { DEG, ring, rng } from "../paper/ease";
import { begin, BLUE, dprOf, fibers, fitCanvas, INK, offscreen, rubberStamp } from "../paper/draw";
import { Loop, pageFont, prefersReduced, whenNear } from "../paper/runtime";
import { sfxCrumple, sfxSettle, sfxToss, vibrate } from "../paper/sfx";
import { BEAT, makeMesh, pose, type CrumplePose, type Mesh } from "./scene";
import "./crumple.css";

const BLEED = 140;
/** The printout is a little bigger than the screenshot so it covers it completely. */
const OVER = 1.08;

/** Generic made-up rows (no real dealers, insurers or amounts). The sheet is stamped 예시. */
function bakeSheet(w: number, h: number, font: string) {
  const { canvas, g } = offscreen(w, h);
  const r = rng(77);
  g.fillStyle = "#fbfaf4";
  g.fillRect(0, 0, w, h);
  fibers(g, 0, 0, w, h, 91, 90);
  const u = w / 100;
  const pad = 4 * u;
  // Header line of a printed spreadsheet.
  g.fillStyle = "#4f5a4c";
  g.font = `600 ${Math.max(7, 2.1 * u)}px ${font}`;
  g.fillText("정산_최종_진짜최종(3).xlsx", pad, pad + 1.6 * u);
  const cols = ["No", "계약일", "딜러", "보험사", "보험료", "수수료율", "수수료", "정산"];
  const widths = [6, 13, 12, 13, 15, 12, 14, 9];
  // Room above the table for the 예시 stamp in the corner.
  const tableTop = pad + 8 * u;
  const rows = 9;
  const rowH = (h - tableTop - pad) / (rows + 1);
  const xs: number[] = [pad];
  const tw = w - pad * 2;
  for (const cw of widths) xs.push(xs[xs.length - 1] + (cw / 94) * tw);
  // Header row.
  g.fillStyle = "#e8eadf";
  g.fillRect(pad, tableTop, tw, rowH);
  const fs = Math.max(6.5, Math.min(rowH * 0.48, 2.3 * u));
  g.font = `700 ${fs}px ${font}`;
  g.fillStyle = INK;
  cols.forEach((col, i) => g.fillText(col, xs[i] + 0.8 * u, tableTop + rowH * 0.68));
  // Body rows.
  const dealers = ["딜러 A", "딜러 B", "딜러 C", "딜러 D", "딜러 E"];
  const insurers = ["가 손보", "나 화재", "다 손보"];
  g.font = `500 ${fs}px ${font}`;
  const data: string[][] = [];
  for (let i = 0; i < rows; i++) {
    const fee = 410 + Math.floor(r() * 900);
    const rate = [7, 8, 10, 12][Math.floor(r() * 4)];
    data.push([
      String(i + 1),
      `10/${String(2 + Math.floor(r() * 27)).padStart(2, "0")}`,
      dealers[Math.floor(r() * dealers.length)],
      insurers[Math.floor(r() * insurers.length)],
      `${fee},${String(Math.floor(r() * 1000)).padStart(3, "0")}`,
      `${rate}%`,
      i === 5 ? "#REF!" : `${Math.round((fee * rate) / 100)},${String(Math.floor(r() * 1000)).padStart(3, "0")}`,
      i % 3 === 2 ? "?" : i === 7 ? "" : "완료",
    ]);
  }
  // Highlighter on two rows (muted marker yellow), drawn under the print.
  g.fillStyle = "rgba(236,214,92,0.42)";
  for (const i of [2, 6]) g.fillRect(pad + 0.4 * u, tableTop + rowH * (i + 1) + rowH * 0.12, tw * 0.62, rowH * 0.78);
  data.forEach((row, i) => {
    const y = tableTop + rowH * (i + 1);
    row.forEach((cell, k) => {
      g.fillStyle = cell === "#REF!" ? "#9c3d2e" : INK;
      g.fillText(cell, xs[k] + 0.8 * u, y + rowH * 0.68);
    });
  });
  // Grid.
  g.strokeStyle = "rgba(32,37,35,0.28)";
  g.lineWidth = 0.6;
  for (let i = 0; i <= rows + 1; i++) {
    g.beginPath();
    g.moveTo(pad, tableTop + rowH * i);
    g.lineTo(w - pad, tableTop + rowH * i);
    g.stroke();
  }
  for (const x of xs) {
    g.beginPath();
    g.moveTo(x, tableTop);
    g.lineTo(x, tableTop + rowH * (rows + 1));
    g.stroke();
  }
  // Pen marks: a row struck through (double entry), a circled cell, a note.
  g.strokeStyle = "rgba(32,37,35,0.75)";
  g.lineWidth = Math.max(1, 0.35 * u);
  const sy = tableTop + rowH * 5.55;
  g.beginPath();
  g.moveTo(pad + 2 * u, sy);
  g.bezierCurveTo(w * 0.3, sy - 1.5, w * 0.6, sy + 2, w - pad - 4 * u, sy - 1);
  g.stroke();
  const cx = xs[6] + (xs[7] - xs[6]) / 2;
  const cy = tableTop + rowH * 6.5;
  g.beginPath();
  g.ellipse(cx, cy, (xs[7] - xs[6]) * 0.62, rowH * 0.62, -4 * DEG, 0.3, Math.PI * 2.15);
  g.stroke();
  g.save();
  g.translate(xs[5], tableTop + rowH * 10.1 > h - pad ? h - pad * 0.6 : tableTop + rowH * 10.1);
  g.rotate(-3 * DEG);
  g.fillStyle = "rgba(32,37,35,0.8)";
  g.font = `700 ${Math.max(8, 2.8 * u)}px ${font}`;
  g.fillText("중복? 다시 확인", 0, 0);
  g.restore();
  // The label: this is an example, not the client's file.
  const sw = 20 * u;
  const sh = 10 * u;
  const stamp = rubberStamp({
    w: sw,
    h: sh,
    u: sw / 30,
    font,
    lines: [
      { text: "예시", size: 7.6, weight: 800, y: 0.56 },
      { text: "가상 데이터", size: 3.2, weight: 700, y: 0.84 },
    ],
    seed: 29,
    color: BLUE,
    specks: 140,
  });
  g.save();
  // Top-right corner, over the header: clear of the pen marks and the numbers.
  g.translate(w - pad - sw * 0.55, pad + sh * 0.42);
  g.rotate(-9 * DEG);
  g.globalAlpha = 0.9;
  g.drawImage(stamp.canvas, -sw / 2 - stamp.pad, -sh / 2 - stamp.pad, sw + stamp.pad * 2, sh + stamp.pad * 2);
  g.restore();
  return canvas;
}

/** Affine map of texture triangle (u,v in px) onto screen triangle, then draw the clipped texture. */
function drawTri(g: CanvasRenderingContext2D, img: HTMLCanvasElement, s: number[], d: number[], iw: number, ih: number) {
  const [u0, v0, u1, v1, u2, v2] = s;
  const [x0, y0, x1, y1, x2, y2] = d;
  const den = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
  if (Math.abs(den) < 1e-6) return;
  const a = (x0 * (v1 - v2) + x1 * (v2 - v0) + x2 * (v0 - v1)) / den;
  const b = (y0 * (v1 - v2) + y1 * (v2 - v0) + y2 * (v0 - v1)) / den;
  const c = (x0 * (u2 - u1) + x1 * (u0 - u2) + x2 * (u1 - u0)) / den;
  const dd = (y0 * (u2 - u1) + y1 * (u0 - u2) + y2 * (u1 - u0)) / den;
  const e = (x0 * (u1 * v2 - u2 * v1) + x1 * (u2 * v0 - u0 * v2) + x2 * (u0 * v1 - u1 * v0)) / den;
  const f = (y0 * (u1 * v2 - u2 * v1) + y1 * (u2 * v0 - u0 * v2) + y2 * (u0 * v1 - u1 * v0)) / den;
  // Grow the clip a hair around the centroid so neighbouring facets don't show seams.
  const mx = (x0 + x1 + x2) / 3;
  const my = (y0 + y1 + y2) / 3;
  const grow = (x: number, y: number) => {
    const l = Math.hypot(x - mx, y - my) || 1;
    return [x + ((x - mx) / l) * 0.6, y + ((y - my) / l) * 0.6];
  };
  g.save();
  g.beginPath();
  g.moveTo(...(grow(x0, y0) as [number, number]));
  g.lineTo(...(grow(x1, y1) as [number, number]));
  g.lineTo(...(grow(x2, y2) as [number, number]));
  g.closePath();
  g.clip();
  g.transform(a, b, c, dd, e, f);
  g.drawImage(img, 0, 0, iw, ih);
  g.restore();
}

/**
 * Wraps the 카영 story screenshot. Scroll scrubs p (eased toward the scroll target both ways, so wheel
 * steps move like a hand); tapping the printout plays it to the end; reduced motion or arriving from
 * below shows the screenshot alone. The hand marks on the screenshot draw only once it's uncovered.
 */
export function GoCrumple({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const frame = root.querySelector<HTMLElement>(".shot-frame");
    const stage = root.querySelector<HTMLElement>(".shot-stage");
    if (!frame || !stage) return;
    if (prefersReduced()) return;

    const dpr = dprOf();
    let p = 0;
    let target = 0;
    let tapped = false;
    let clock = 0;
    let beatAt = -10;
    let fw = 0;
    let fh = 0;
    let sw = 0;
    let sh = 0;
    let ox = 0;
    let oy = 0;
    let mesh: Mesh | null = null;
    let sheet: HTMLCanvasElement | null = null;
    let lastCrackle = 0;
    let ready = false;

    root.setAttribute("data-covered", "");

    const measure = () => {
      fw = frame.offsetWidth;
      fh = frame.offsetHeight;
      sw = Math.round(fw * OVER);
      sh = Math.round(fh * OVER + fw * 0.03);
      const r0 = root.getBoundingClientRect();
      const rf = frame.getBoundingClientRect();
      ox = rf.left - r0.left;
      oy = rf.top - r0.top;
      fitCanvas(canvas, fw + BLEED * 2, fh + BLEED * 2, dpr);
      canvas.style.left = `${ox - BLEED}px`;
      canvas.style.top = `${oy - BLEED}px`;
      mesh = makeMesh(sw, sh);
      sheet = bakeSheet(sw, sh, pageFont());
      ready = true;
    };

    const render = () => {
      if (!ready || !mesh || !sheet) return;
      const P = pose(p, mesh, sw, sh, fw, fh);
      paint(P);
      const s = clock - beatAt;
      const shake = s > 0 && s < 0.6 ? ring(s, 2.2, 9, 15) : 0;
      stage.style.transform = `translate3d(${shake.toFixed(2)}px, ${P.shot.y.toFixed(2)}px, 0) scale(${P.shot.scale.toFixed(4)})`;
      frame.style.boxShadow = P.shot.shadow > 0.01 ? `0 ${(16 * P.shot.shadow).toFixed(1)}px ${(30 * P.shot.shadow).toFixed(1)}px -18px rgba(32,37,35,${(0.4 * P.shot.shadow).toFixed(3)})` : "";
      root.toggleAttribute("data-covered", P.covered);
    };

    const paint = (P: CrumplePose) => {
      const g = begin(canvas, fw + BLEED * 2, fh + BLEED * 2, dpr);
      if (P.alpha <= 0.001 || !mesh || !sheet) return;
      g.translate(BLEED + fw / 2, BLEED + fh / 2);
      g.globalAlpha = P.alpha;
      // Shadow on the screenshot/table: wide and soft while flat, tight under the ball.
      const R = Math.min(sw, sh) * 0.3;
      g.save();
      g.translate(P.dx + 6 + 10 * P.lift, P.dy + 8 + 14 * P.lift);
      g.filter = `blur(${(6 + 10 * P.lift).toFixed(1)}px)`;
      g.fillStyle = `rgba(32,37,35,${(0.2 + 0.08 * P.pull).toFixed(3)})`;
      g.beginPath();
      const ex = lerpN(sw / 2, R * 1.05, P.pull);
      const ey = lerpN(sh / 2, R * 0.95, P.pull);
      g.ellipse(0, 0, ex, ey, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();

      g.translate(P.dx, P.dy);
      g.rotate(P.rot);
      const { pts, shade, order } = P;
      const tris = mesh.tris;
      for (const t of order) {
        const a = tris[t * 3];
        const b = tris[t * 3 + 1];
        const c = tris[t * 3 + 2];
        const src = [mesh.uv[a * 2] * sw, mesh.uv[a * 2 + 1] * sh, mesh.uv[b * 2] * sw, mesh.uv[b * 2 + 1] * sh, mesh.uv[c * 2] * sw, mesh.uv[c * 2 + 1] * sh];
        const dst = [pts[a * 2], pts[a * 2 + 1], pts[b * 2], pts[b * 2 + 1], pts[c * 2], pts[c * 2 + 1]];
        drawTri(g, sheet, src, dst, sw, sh);
        // Facet light/shade + crease line.
        const k = shade[t];
        g.beginPath();
        g.moveTo(dst[0], dst[1]);
        g.lineTo(dst[2], dst[3]);
        g.lineTo(dst[4], dst[5]);
        g.closePath();
        if (P.c > 0) {
          g.fillStyle = k < 0.72 ? `rgba(70,60,40,${((0.72 - k) * 0.5 * Math.min(1, P.c * 2)).toFixed(3)})` : `rgba(255,255,250,${((k - 0.72) * 1.4 * Math.min(1, P.c * 2)).toFixed(3)})`;
          g.fill();
          g.strokeStyle = `rgba(32,37,35,${(0.1 * Math.min(1, P.c * 3)).toFixed(3)})`;
          g.lineWidth = 0.6;
          g.stroke();
        }
      }
      if (P.c === 0) {
        g.strokeStyle = "rgba(32,37,35,0.14)";
        g.lineWidth = 1;
        g.strokeRect(-sw / 2, -sh / 2, sw, sh);
      }
    };

    const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;

    const set = (next: number) => {
      const prev = p;
      p = Math.max(0, Math.min(1, next));
      if (p > prev) {
        // Crackles every few % of crumple, a toss as it starts rolling, a landing beat for the screenshot.
        if (p > 0.08 && p < 0.6 && p - lastCrackle > 0.045) {
          lastCrackle = p;
          sfxCrumple((p - 0.08) / 0.5);
          vibrate(8);
        }
        if (prev < 0.56 && p >= 0.56) sfxToss();
        if (prev < BEAT && p >= BEAT) {
          beatAt = clock;
          sfxSettle();
          vibrate([20, 30, 40]);
        }
      } else if (p < lastCrackle) lastCrackle = p;
    };

    const loop = new Loop((dt) => {
      clock += dt;
      const goal = tapped ? 1 : target;
      const gap = goal - p;
      // Tap = played (≈1.3 s, steady); scroll = eased toward the scroll position (exp), both ways.
      const step = tapped ? Math.sign(gap) * Math.min(Math.abs(gap), dt * 0.75) : Math.abs(gap) < 0.002 ? gap : gap * (1 - Math.exp(-dt * 10));
      set(p + step);
      render();
      return Math.abs(goal - p) > 0.0005 || clock - beatAt < 0.7;
    });

    const progress = () => {
      const r = frame.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts when the screenshot's top passes 80% of the screen, done when it reaches 25%.
      return Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (vh * 0.55)));
    };

    let raf = 0;
    const onScroll = () => {
      if (raf || !ready) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        target = progress();
        loop.wake();
      });
    };
    const onTap = () => {
      if (!ready || p >= 0.5 || tapped) return;
      tapped = true;
      loop.wake();
    };

    const stopNear = whenNear(root, () => {
      measure();
      target = progress();
      // Skip: arriving from below (already scrolled past) → the screenshot is just there.
      if (target >= 1 || frame.getBoundingClientRect().bottom < 0) {
        p = 1;
        lastCrackle = 1;
      } else p = target;
      render();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    stage.addEventListener("click", onTap);
    const resize = new ResizeObserver(() => {
      if (ready && (frame.offsetWidth !== fw || frame.offsetHeight !== fh)) {
        measure();
        render();
      }
    });
    resize.observe(frame);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __crumple?: unknown }).__crumple = {
        seek: (at: number) => {
          if (!ready) measure();
          loop.stop();
          p = at;
          beatAt = -10;
          render();
        },
      };
    }

    return () => {
      stopNear();
      loop.stop();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      stage.removeEventListener("click", onTap);
      resize.disconnect();
      root.removeAttribute("data-covered");
      stage.style.transform = "";
      frame.style.boxShadow = "";
    };
  }, []);

  return (
    <div className="crm" ref={rootRef}>
      {children}
      <canvas ref={canvasRef} className="crm-canvas" aria-hidden="true" />
      <p className="go-sr">스크롤하면 예전에 쓰던 엑셀 출력물(가상 데이터 예시)이 구겨져 치워지고 실제 관리자 화면이 보여요.</p>
    </div>
  );
}

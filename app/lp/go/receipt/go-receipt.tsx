"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { COUPON } from "@/lib/coupon";
import { trackQuoteResult } from "@/lib/analytics";
import {
  DESIGNS,
  estimate,
  FEATURES,
  formatPriceRange,
  PROJECT_KINDS,
  SCALES,
  type QuoteAnswers,
  type Range,
} from "@/lib/quote/pricing";
import { useActiveCoupon } from "../coupon/coupon-note";
import { fitCanvas } from "../paper/draw";
import { Loop, pageFont, prefersReduced } from "../paper/runtime";
import { sfxCut, sfxFeed, sfxPrinterOn, sfxStamp, vibrate } from "../paper/sfx";
import { BLEED, INK_BLEED, PRINTER, ReceiptPainter } from "./painter";
import { pose, timeForLength, timeline, type ReceiptLayout, type Timeline } from "./scene";
import "./receipt.css";

type Row = { key: string; label: string; value: string; kind?: "head" | "mult" | "sub" | "coupon" | "rule" | "total" | "note"; sub?: string };

const factor = ([a, b]: readonly [number, number]) => (a === b ? `× ${a}` : `× ${a}~${b}`);
const minus = ([low, high]: Range) => `−${formatPriceRange([low, high]).replace("~", "~−")}`;

/** Every line comes from lib/quote/pricing.ts; the total is estimate() itself (what the server sends too). */
function rowsOf(answers: QuoteAnswers, coupon: { code: string } | null) {
  const kind = PROJECT_KINDS[answers.kind];
  const result = estimate(answers);
  const rows: Row[] = [
    { key: "kind", label: `${kind.label} 기본`, value: formatPriceRange(kind.price) },
    { key: "scale", label: `화면 ${SCALES[answers.scale].label}`, value: factor(SCALES[answers.scale].factor), kind: "mult" },
    ...answers.features.map((key) => ({ key, label: `+ ${FEATURES[key].label}`, value: formatPriceRange(FEATURES[key].price) })),
    { key: "design", label: DESIGNS[answers.design].label, value: factor(DESIGNS[answers.design].factor), kind: "mult" },
  ];
  let total: Range = result.price;
  if (coupon) {
    const off: Range = [Math.round(total[0] * COUPON.percent) / 100, Math.round(total[1] * COUPON.percent) / 100];
    rows.push({ key: "sub", label: "합계", value: formatPriceRange(total), kind: "sub" });
    rows.push({ key: "coupon", label: `첫 계약 할인권 −${COUPON.percent}%`, sub: coupon.code, value: minus(off), kind: "coupon" });
    total = [total[0] - off[0], total[1] - off[1]];
  }
  rows.push({ key: "rule", label: "", value: "", kind: "rule" });
  rows.push({ key: "total", label: "예상 금액", sub: coupon ? "할인 적용" : undefined, value: formatPriceRange(total), kind: "total" });
  rows.push({ key: "weeks", label: "예상 기간", value: `${result.weeks[0]}~${result.weeks[1]}주` });
  return { rows, result };
}

const today = () =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replace(/\.$/, "");

/**
 * /lp/go 견적 영수증 (reveal-craft moment): the quiz result prints out of a small printer, line by line.
 * Paths: auto (prints once it is on screen), hand (drag the paper down to pull it out faster),
 * skip ("바로 보기", whole receipt at once) and reduced motion (printed already, nothing moves).
 * Replaces the dark QuoteResultCard on this page only; same estimate(), same QuoteCalculated event.
 */
export function GoReceipt({ answers, onRestart }: { answers: QuoteAnswers; onRestart: () => void }) {
  const coupon = useActiveCoupon();
  const { rows, result } = rowsOf(answers, coupon);
  const [printing, setPrinting] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const paperCanvas = useRef<HTMLCanvasElement>(null);
  const inkCanvas = useRef<HTMLCanvasElement>(null);
  const printerCanvas = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const tracked = useRef(false);
  const shape = rows.map((row) => row.key).join("|");

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackQuoteResult(answers.kind);
  }, [answers.kind]);

  // Layout effect: the paper must be clipped to its stub before the first paint (no flash of the full receipt).
  useLayoutEffect(() => {
    const root = rootRef.current;
    const paper = paperRef.current;
    const lines = linesRef.current;
    if (!root || !paper || !lines || !paperCanvas.current || !inkCanvas.current || !printerCanvas.current) return;
    const canvases = { paper: paperCanvas.current, ink: inkCanvas.current, printer: printerCanvas.current };
    const rowEls = Array.from(lines.querySelectorAll<HTMLElement>("[data-line]"));
    const couponIndex = rowEls.findIndex((el) => el.dataset.line === "coupon");
    const reduced = prefersReduced();
    let L: ReceiptLayout;
    let T: Timeline;
    let painter: ReceiptPainter;
    let t = 0;
    let playing = false;
    let finished = false;
    let drag: { id: number; y: number; len0: number } | null = null;

    const measure = () => {
      const W = paper.clientWidth;
      const H = lines.offsetHeight;
      const edges = [10];
      rowEls.forEach((el, i) => {
        const bottom = el.offsetTop + el.offsetHeight;
        const next = rowEls[i + 1];
        edges.push(next ? (bottom + next.offsetTop) / 2 : bottom + 8);
      });
      edges.push(H);
      const c = rowEls[couponIndex];
      L = {
        W,
        H,
        edges,
        coupon: couponIndex,
        // Lands in the room kept free under the amount (rc-row.is-coupon padding), so nothing printed is covered.
        stamp: c ? { x: W - 66, y: c.offsetTop + c.offsetHeight - 26 } : { x: 0, y: 0 },
      };
      T = timeline(L);
      painter = new ReceiptPainter(L, canvases, pageFont());
      const place = (canvas: HTMLCanvasElement, bleed: number, w: number, h: number) => {
        fitCanvas(canvas, w, h);
        canvas.style.left = `${-bleed}px`;
        canvas.style.top = `${-bleed}px`;
      };
      place(canvases.paper, BLEED, W + BLEED * 2, H + BLEED * 2 + 12);
      place(canvases.ink, INK_BLEED, W + INK_BLEED * 2, H + INK_BLEED * 2);
      fitCanvas(canvases.printer, W + PRINTER.side * 2, PRINTER.height);
      canvases.printer.style.left = `${-PRINTER.side}px`;
    };

    const render = () => {
      const P = pose(t, L, T, reduced);
      painter.draw(P);
      const hide = Math.max(0, L.H - P.len + 1);
      lines.style.clipPath = `inset(0 0 ${hide.toFixed(1)}px 0)`;
      rowEls.forEach((el, i) => {
        el.style.opacity = P.ink[i].toFixed(3);
      });
      paper.style.transform = `translate3d(0, ${(P.drop + P.jiggle).toFixed(2)}px, 0) rotate(${P.sway.toFixed(4)}rad)`;
      root.style.transform = P.shake.x || P.shake.y ? `translate3d(${P.shake.x.toFixed(2)}px, ${P.shake.y.toFixed(2)}px, 0)` : "";
      if (couponIndex >= 0) rowEls[couponIndex].toggleAttribute("data-stamped", Boolean(P.stamp?.ink));
    };

    /** Moves t forward and fires whatever it crossed (same sounds for auto and hand). */
    const advance = (next: number) => {
      const prev = t;
      if (next <= prev) return;
      t = Math.min(next, T.end);
      const crossed = (at: number) => prev < at && t >= at;
      if (crossed(0.02)) sfxPrinterOn();
      T.start.forEach((s, i) => {
        if (crossed(s + 0.02)) {
          sfxFeed(i);
          vibrate(8);
        }
      });
      if (T.stampHit !== null && crossed(T.stampHit)) {
        sfxStamp(1);
        vibrate([20, 30, 40]);
      }
      if (crossed(T.cut)) sfxCut();
      if (t >= T.end) finish();
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      playing = false;
      t = T.end;
      render();
      root.removeAttribute("data-printing");
      setPrinting(false);
    };

    const loop = new Loop((dt) => {
      if (playing && !drag) advance(t + dt);
      render();
      return !finished && (playing || Boolean(drag));
    });

    const play = () => {
      if (finished || playing) return;
      playing = true;
      loop.wake();
    };

    measure();
    if (reduced) finish();
    else {
      root.setAttribute("data-printing", "");
      render();
    }

    skipRef.current = () => {
      if (finished) return;
      t = T.end;
      finish();
    };

    // Starts printing once a third of it is on screen (it is, right after the last answer).
    const seen = new IntersectionObserver(([entry]) => entry.isIntersecting && play(), { threshold: 0.3 });
    seen.observe(root);

    const down = (event: PointerEvent) => {
      if (finished || !event.isPrimary) return;
      drag = { id: event.pointerId, y: event.clientY, len0: pose(t, L, T, reduced).len };
      try {
        paper.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic pointers can't be captured.
      }
      loop.wake();
    };
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dy = event.clientY - drag.y;
      if (dy <= 0) return;
      event.preventDefault();
      // The paper follows the finger: find the t whose paper length matches the pulled length.
      advance(timeForLength(drag.len0 + dy, L, T));
      loop.wake();
    };
    const up = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      play();
    };
    paper.addEventListener("pointerdown", down);
    paper.addEventListener("pointermove", move);
    paper.addEventListener("pointerup", up);
    paper.addEventListener("pointercancel", up);

    const resize = new ResizeObserver(() => {
      if (paper.clientWidth !== L.W || lines.offsetHeight !== L.H) {
        measure();
        render();
      }
    });
    resize.observe(paper);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __receipt?: unknown }).__receipt = {
        seek: (at: number) => {
          playing = false;
          loop.stop();
          t = at;
          render();
        },
        end: () => T.end,
        timeline: () => T,
      };
    }

    return () => {
      loop.stop();
      seen.disconnect();
      resize.disconnect();
      paper.removeEventListener("pointerdown", down);
      paper.removeEventListener("pointermove", move);
      paper.removeEventListener("pointerup", up);
      paper.removeEventListener("pointercancel", up);
    };
    // Rebuild only when the printed lines change (answers or coupon), not on every render.
  }, [shape]);

  return (
    <div className="qz-card go-rc-card">
      <div className="rc" ref={rootRef}>
        <canvas ref={printerCanvas} className="rc-printer" aria-hidden="true" />
        <div className="rc-paper" ref={paperRef}>
          <canvas ref={paperCanvas} className="rc-bg" aria-hidden="true" />
          <div className="rc-lines" ref={linesRef} role="group" aria-label="견적 영수증">
            <div className="rc-row rc-head" data-line="head">
              <p className="rc-title" data-step-title tabIndex={-1}>
                견적 영수증 <span>참고용</span>
              </p>
              <p className="rc-date">PLUCK · {today()}</p>
            </div>
            {rows.map((row) =>
              row.kind === "rule" ? (
                <div key={row.key} className="rc-rule" data-line="rule" aria-hidden="true" />
              ) : (
                <div key={row.key} className={`rc-row${row.kind ? ` is-${row.kind}` : ""}`} data-line={row.key}>
                  <span className="rc-label">
                    {row.label}
                    {row.sub && <small>{row.sub}</small>}
                  </span>
                  <span className="rc-value">{row.value}</span>
                </div>
              ),
            )}
            <p className="rc-row rc-note" data-line="note">
              참고 범위예요. 상담하고 범위를 정하면 확정돼요. VAT 별도.
            </p>
          </div>
          <canvas ref={inkCanvas} className="rc-ink" aria-hidden="true" />
        </div>
      </div>
      {printing && (
        <button type="button" className="cpn-skip rc-skip" onClick={() => skipRef.current()}>
          바로 보기
        </button>
      )}
      {result.tightTimeline && (
        <p className="rc-warn">원하시는 일정보다 길게 나왔어요. 꼭 필요한 기능만 먼저 여는 1차 오픈으로 나눌 수 있어요.</p>
      )}
      <button type="button" className="qz-restart rc-restart" onClick={onRestart}>
        <RotateCcw size={16} aria-hidden="true" /> 다시 계산하기
      </button>
    </div>
  );
}

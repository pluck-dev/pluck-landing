"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode, type Ref } from "react";
import { ArrowDown, Check, Copy } from "lucide-react";
import { COUPON, formatCouponDate } from "@/lib/coupon";
import { trackCouponOpened } from "@/lib/analytics";
import { pageFont, paperFontReady } from "../paper/runtime";
import { CouponEngine } from "./engine";
import type { Mode } from "./scene";
import { currentCoupon, isExpired, issueCoupon, useCoupon, type StoredCoupon } from "./store";
import "./coupon.css";

const PREVIEW_CODE = "PLK-7F3K9Q";

/*
 * Full-screen stage timeline, in pin heights (P = 100svh) scrolled into the track:
 *   track enters      0→1 entry: page dims, the sheet scales up to fill the screen
 *   PULL_FROM→PULL_TO scroll pulls the strip (engine.scrub), rip/reveal then plays on its own clock
 *   reveal + HOLD_MS  the track keeps growing below the fold, so the stage can't unpin mid-reveal
 *   SETTLE            the coupon flies into the compact card that scrolls up under the stage
 * Only sticky + scroll progress: nothing calls preventDefault on wheel/touch or locks the body.
 */
const BASE = 2.2;
const PULL_FROM = 0.04;
const PULL_TO = 0.6;
const SETTLE = 0.75;
const HOLD_MS = 1000;
/** Safety cap: never grow the track past this many screens (if the engine never opens). */
const MAX_GROW = 6;
const DIM = 0.85;

type View = "stage" | "card" | "done";

/*
 * Which view this page load gets, fixed at first client read: a coupon issued during the stage must
 * not swap the stage for the compact card mid-scroll. The server renders the stage (most visitors
 * are new) and React corrects it right after hydration.
 */
let loadView: View | undefined;
const readLoadView = (): View =>
  (loadView ??= currentCoupon()
    ? "done"
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "card"
      : "stage");
const noSubscribe = () => () => {};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (k: number) => k * k * (3 - 2 * k);

/**
 * /lp/go 할인권 봉투. The one rich moment on the page (reveal-craft).
 * First visit: a full-screen stage that pins while the visitor scrolls; scrolling pulls the strip,
 * then the coupon settles into a compact card in the flow. Drag, three taps, "자동으로 열기",
 * "바로 받기" and 7 s idle still work inside it. Everyone gets the same 10%.
 * Returning visitors see the compact coupon; reduced motion and 건너뛰기 get the in-page card.
 */
export function GoCoupon() {
  const coupon = useCoupon();
  const baseView = useSyncExternalStore(noSubscribe, readLoadView, () => "stage" as View);
  const [skipped, setSkipped] = useState(false);
  const view: View = skipped && baseView === "stage" ? "card" : baseView;
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const couponRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const doneCardRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CouponEngine | null>(null);
  const doneAtRef = useRef<number | null>(null);
  const kickRef = useRef<() => void>(() => {});

  // A coupon from an earlier visit means the envelope is already open.
  const open = phase === "open" || (phase === "closed" && Boolean(coupon));
  const code = coupon?.code ?? (preview ? PREVIEW_CODE : "PLK-······");
  const expired = coupon ? isExpired(coupon) : false;

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (view === "done" || !section || !stage) return;
    let engine: CouponEngine | null = null;
    let cancelled = false;
    const disposers: (() => void)[] = [];

    const start = async () => {
      await paperFontReady();
      if (cancelled || !backRef.current || !frontRef.current || !couponRef.current || !sweepRef.current || !veilRef.current) return;
      const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      engine = new CouponEngine(
        {
          stage,
          back: backRef.current,
          front: frontRef.current,
          coupon: couponRef.current,
          sweep: sweepRef.current,
          veil: veilRef.current,
        },
        {
          rip: (mode: Mode) => {
            setPhase("opening");
            const { isNew } = issueCoupon();
            if (isNew) trackCouponOpened(mode);
          },
          end: () => {
            setPhase("open");
            doneAtRef.current = performance.now();
            window.setTimeout(() => kickRef.current(), HOLD_MS + 30);
          },
        },
        pageFont(),
        Boolean(currentCoupon()),
        reducedQuery.matches,
        view === "stage" ? { maxEw: 700, present: 0.9 } : { idle: !skipped },
      );
      engineRef.current = engine;
      stage.dataset.ready = "";
      kickRef.current();

      const onReduced = () => engine?.setReduced(reducedQuery.matches);
      reducedQuery.addEventListener("change", onReduced);
      disposers.push(() => reducedQuery.removeEventListener("change", onReduced));

      let width = stage.clientWidth;
      let height = stage.clientHeight;
      const resize = new ResizeObserver(() => {
        if (stage.clientWidth !== width || stage.clientHeight !== height) {
          width = stage.clientWidth;
          height = stage.clientHeight;
          engine?.relayout();
        }
      });
      resize.observe(stage);
      disposers.push(() => resize.disconnect());

      const seen = new IntersectionObserver(([entry]) => engine?.setVisible(entry.isIntersecting), { threshold: 0.55 });
      seen.observe(stage);
      disposers.push(() => seen.disconnect());

      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __coupon?: unknown }).__coupon = {
          seek: (t: number, mode: Mode = "hand", nudge = 0) => {
            setPreview(true);
            engine?.seek(t, mode, nudge);
          },
          engine,
        };
      }
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        void start();
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(section);

    return () => {
      cancelled = true;
      near.disconnect();
      disposers.forEach((dispose) => dispose());
      engine?.destroy();
      engineRef.current = null;
    };
  }, [view, skipped]);

  // Full-screen stage: scroll progress → entry dim, pull, hold, settle. rAF-throttled, read-then-write.
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const pin = pinRef.current;
    if (view !== "stage" || !section || !track || !pin) return;
    let raf = 0;
    let P = pin.offsetHeight;
    let trackH = track.offsetHeight;
    /** Scroll offset (in P) where the settle starts; fixed once the coupon has been out for HOLD_MS. */
    let settleAt: number | null = null;

    const update = () => {
      raf = 0;
      if (!P) return;
      const top = track.getBoundingClientRect().top;
      const y = -top;
      const base = BASE * P;
      const engine = engineRef.current;
      const doneAt = doneAtRef.current;
      let nextH = trackH;

      if (settleAt === null && doneAt !== null && performance.now() >= doneAt + HOLD_MS) {
        // If the visitor already jumped past the stage (anchor link), the settle counts as done.
        const lo = base - P - SETTLE * P;
        const hi = trackH - P - SETTLE * P;
        settleAt = Math.min(hi, Math.max(lo, y)) / P;
      }
      if (settleAt !== null) {
        nextH = Math.max(base, (settleAt + SETTLE + 1) * P);
      } else if (y >= 0 && y <= trackH - P + 1 && y < MAX_GROW * P) {
        // Still pulling or revealing: keep the release point well below the fold (grow in steps).
        const need = y + (1 + SETTLE + 0.25) * P;
        if (need > trackH) nextH = need + 0.5 * P;
      }
      if (Math.abs(nextH - trackH) > 0.5) {
        trackH = nextH;
        track.style.height = `${nextH.toFixed(0)}px`;
      }

      const enter = clamp((P - top) / P);
      const s = settleAt === null ? 0 : clamp((y - settleAt * P) / (SETTLE * P));
      pin.style.setProperty("--sc", (0.94 + 0.06 * smooth(enter)).toFixed(4));
      pin.style.setProperty("--k", smooth(clamp(s / 0.22)).toFixed(3));
      section.toggleAttribute("data-settling", s > 0);
      section.toggleAttribute("data-settled", s >= 1);
      if (!engine) return;
      engine.setDim(DIM * Math.min(enter, 1 - s));
      if (y > 0) engine.scrub((y - PULL_FROM * P) / ((PULL_TO - PULL_FROM) * P));
      if (engine.done) engine.settle(s, s > 0 && doneCardRef.current ? doneCardRef.current.getBoundingClientRect() : null);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      const next = pin.offsetHeight;
      if (next) P = next;
      trackH = track.offsetHeight;
      schedule();
    };
    kickRef.current = schedule;
    const resize = new ResizeObserver(onResize);
    resize.observe(pin);
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      kickRef.current = () => {};
      section.removeAttribute("data-settling");
      section.removeAttribute("data-settled");
    };
  }, [view]);

  // 건너뛰기: the stage collapses into the in-page card; keep that card in view.
  useLayoutEffect(() => {
    if (!skipped || view !== "card") return;
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < 88) window.scrollTo({ top: window.scrollY + rect.top - 88, behavior: "instant" });
    section.querySelector<HTMLButtonElement>(".cpn-buttons .button")?.focus({ preventScroll: true });
  }, [skipped, view]);

  async function copyCode(event: MouseEvent<HTMLButtonElement>) {
    if (!coupon) return;
    const node = event.currentTarget.closest(".cp")?.querySelector(".cp-code-text");
    try {
      await navigator.clipboard.writeText(coupon.code);
    } catch {
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const face = (
    <CouponFace
      faceRef={couponRef}
      sweepRef={sweepRef}
      code={code}
      coupon={coupon}
      expired={expired}
      copied={copied}
      onCopy={copyCode}
      hidden={!open}
    />
  );

  const envelope = (
    <div className="cpn-stage" ref={stageRef}>
      <canvas ref={backRef} className="cpn-canvas" aria-hidden="true" />
      {face}
      <canvas ref={frontRef} className="cpn-canvas cpn-front" aria-hidden="true" />
      {!open && (
        <button
          type="button"
          className="cpn-handle"
          aria-label="파란 띠를 당겨서 봉투 열기. 오른쪽 화살표를 누를 때마다 조금씩 뜯어져요."
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              engineRef.current?.stepKey();
            }
          }}
          onClick={(event) => {
            // Mouse/touch clicks are handled by the stage (drag/tap); keyboard Enter/Space opens.
            if (event.detail === 0) engineRef.current?.auto();
          }}
        />
      )}
    </div>
  );

  const terms = (
    <p className="cpn-terms">
      <span className="go-sr">사용 조건: </span>
      {COUPON.terms.join(" · ")}
    </p>
  );

  const title = (
    <h2 id="go-coupon-title" className="cpn-title">
      {COUPON.percent}% 할인권,
      <br />
      뜯어 가세요
    </h2>
  );

  const lead = (
    <p className="cpn-lead">
      추첨 아니에요. 모두 똑같이 {COUPON.percent}%.
    </p>
  );

  const after = (
    <div className="cpn-after" role="status">
      <p>신청하면 자동 적용돼요.</p>
      <a className="button button-primary go-btn-sm" href="#quiz">
        견적 받기 <ArrowDown size={16} aria-hidden="true" />
      </a>
    </div>
  );

  const veil = <div ref={veilRef} className="cpn-veil" aria-hidden="true" />;

  if (view === "done") {
    return (
      <section ref={sectionRef} className="go-coupon shell" aria-labelledby="go-coupon-title" data-open="">
        <DonePanel
          heading
          cardRef={doneCardRef}
          coupon={coupon}
          code={code}
          expired={expired}
          copied={copied}
          onCopy={copyCode}
          terms={terms}
        />
      </section>
    );
  }

  if (view === "card") {
    return (
      <section ref={sectionRef} className="go-coupon shell" aria-labelledby="go-coupon-title" data-open={open ? "" : undefined}>
        <div className="cpn-panel">
          <div className="cpn-copy">
            {title}
            {lead}
          </div>
          {envelope}
          <div className="cpn-side">
            {open ? (
              after
            ) : (
              <div className="cpn-actions" aria-hidden={phase === "opening" ? true : undefined}>
                <p className="cpn-hint">띠를 당기거나 세 번 톡톡</p>
                <div className="cpn-buttons">
                  <button
                    type="button"
                    className="button button-ghost go-btn-sm"
                    onClick={() => engineRef.current?.auto()}
                    disabled={phase === "opening"}
                  >
                    {skipped ? "열기" : "자동으로 열기"}
                  </button>
                  <button
                    type="button"
                    className="cpn-skip"
                    onClick={() => engineRef.current?.skip()}
                    disabled={phase === "opening"}
                  >
                    바로 받기
                  </button>
                </div>
              </div>
            )}
            {terms}
          </div>
        </div>
        {veil}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="go-coupon is-stage"
      aria-labelledby="go-coupon-title"
      data-open={open ? "" : undefined}
    >
      <div className="cpn-track" ref={trackRef}>
        <div className="cpn-pin" ref={pinRef}>
          <div className="cpn-sheet">
            <div className="cpn-top">
              {title}
              {lead}
            </div>
            {phase === "closed" && (
              <button type="button" className="cpn-pass" onClick={() => setSkipped(true)}>
                건너뛰기
              </button>
            )}
            {envelope}
            <div className="cpn-foot">
              {open ? (
                after
              ) : (
                <div className="cpn-actions" aria-hidden={phase === "opening" ? true : undefined}>
                  <p className="cpn-hint">내리면 열려요</p>
                  <div className="cpn-buttons">
                    <button
                      type="button"
                      className="button button-ghost go-btn-sm"
                      onClick={() => engineRef.current?.auto()}
                      disabled={phase === "opening"}
                    >
                      자동으로 열기
                    </button>
                    <button
                      type="button"
                      className="cpn-skip"
                      onClick={() => engineRef.current?.skip()}
                      disabled={phase === "opening"}
                    >
                      바로 받기
                    </button>
                  </div>
                </div>
              )}
              {terms}
            </div>
          </div>
        </div>
      </div>
      <div className="shell cpn-done-wrap" aria-hidden={open ? undefined : true}>
        <DonePanel
          cardRef={doneCardRef}
          coupon={coupon}
          code={code}
          expired={expired}
          copied={copied}
          onCopy={copyCode}
          terms={terms}
        />
      </div>
      {veil}
    </section>
  );
}

type FaceProps = {
  code: string;
  coupon: StoredCoupon | null;
  expired: boolean;
  copied: boolean;
  onCopy: (event: MouseEvent<HTMLButtonElement>) => void;
};

/** The coupon itself. Engine-driven inside the envelope, or static in the compact card. */
function CouponFace({
  faceRef,
  sweepRef,
  hidden,
  code,
  coupon,
  expired,
  copied,
  onCopy,
  className = "",
}: FaceProps & { faceRef?: Ref<HTMLDivElement>; sweepRef?: Ref<HTMLElement>; hidden?: boolean; className?: string }) {
  return (
    <div
      ref={faceRef}
      className={`cp${expired ? " is-expired" : ""} ${className}`}
      role="group"
      aria-label={hidden ? undefined : `${COUPON.title}, 코드 ${code}`}
      aria-hidden={hidden ? true : undefined}
      inert={hidden}
    >
      <div className="cp-card">
        <div className="cp-stub" aria-hidden="true">
          <b>{COUPON.percent}%</b>
          <span>할인</span>
        </div>
        <div className="cp-body">
          <p className="cp-name">{COUPON.title}</p>
          <p className="cp-code">
            <span className="cp-code-text">{code}</span>
            <button type="button" className="cp-copy" onClick={onCopy} aria-label={copied ? "복사했어요" : "코드 복사"}>
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            </button>
          </p>
          <p className="cp-meta">
            <span>
              {coupon
                ? expired
                  ? `${formatCouponDate(coupon.expiresAt)}에 끝났어요`
                  : `${formatCouponDate(coupon.expiresAt)}까지`
                : `발급일부터 ${COUPON.validDays}일`}
            </span>
            <span>상담 신청하면 자동 적용</span>
          </p>
        </div>
        {sweepRef && <i ref={sweepRef} className="cp-sweep" aria-hidden="true" />}
      </div>
    </div>
  );
}

/** Compact issued coupon: returning visitors, and where the full-screen stage settles. */
function DonePanel({
  heading = false,
  cardRef,
  terms,
  ...face
}: FaceProps & { heading?: boolean; cardRef: Ref<HTMLDivElement>; terms: ReactNode }) {
  const Title = heading ? "h2" : "p";
  return (
    <div className="cpn-panel cpn-done">
      <Title id={heading ? "go-coupon-title" : undefined} className="cpn-title">
        {face.expired ? "지난 할인권이에요" : "할인권 받아 두셨어요"}
      </Title>
      <div className="cpn-done-card">
        <CouponFace {...face} faceRef={cardRef} className="cp-static" />
      </div>
      <div className="cpn-done-text">
        {face.expired ? (
          <p>기간이 지나 적용되지 않아요.</p>
        ) : (
          <>
            <p>신청하면 자동 적용돼요.</p>
            <a className="button button-primary go-btn-sm" href="#quiz">
              견적 받기 <ArrowDown size={16} aria-hidden="true" />
            </a>
          </>
        )}
        {terms}
      </div>
    </div>
  );
}

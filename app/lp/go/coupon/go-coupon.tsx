"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, Copy } from "lucide-react";
import { COUPON, formatCouponDate } from "@/lib/coupon";
import { trackCouponOpened } from "@/lib/analytics";
import { CouponEngine } from "./engine";
import type { Mode } from "./scene";
import { currentCoupon, isExpired, issueCoupon, useCoupon } from "./store";
import "./coupon.css";

const PREVIEW_CODE = "PLK-7F3K9Q";

/**
 * /lp/go 할인권 봉투. The one rich moment on the page (reveal-craft): pull the strip, tap three
 * times, "자동으로 열기", "바로 받기", or leave it on screen for 7 s. Everyone gets the same 10%.
 * The canvases are created only when the section comes near the viewport.
 */
export function GoCoupon() {
  const coupon = useCoupon();
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const couponRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CouponEngine | null>(null);

  // A coupon from an earlier visit means the envelope is already open.
  const open = phase === "open" || (phase === "closed" && Boolean(coupon));
  const code = coupon?.code ?? (preview ? PREVIEW_CODE : "PLK-······");
  const expired = coupon ? isExpired(coupon) : false;

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    let engine: CouponEngine | null = null;
    let cancelled = false;
    const disposers: (() => void)[] = [];

    const start = async () => {
      await document.fonts?.ready;
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
          end: () => setPhase("open"),
        },
        getComputedStyle(document.body).fontFamily,
        Boolean(currentCoupon()),
        reducedQuery.matches,
      );
      engineRef.current = engine;
      stage.dataset.ready = "";

      const onReduced = () => engine?.setReduced(reducedQuery.matches);
      reducedQuery.addEventListener("change", onReduced);
      disposers.push(() => reducedQuery.removeEventListener("change", onReduced));

      let width = stage.clientWidth;
      const resize = new ResizeObserver(() => {
        if (stage.clientWidth !== width) {
          width = stage.clientWidth;
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
  }, []);

  async function copyCode() {
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
    } catch {
      const range = document.createRange();
      const node = couponRef.current?.querySelector(".cp-code-text");
      if (!node) return;
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section ref={sectionRef} className="go-coupon shell" aria-labelledby="go-coupon-title" data-open={open ? "" : undefined}>
      <div className="cpn-panel">
        <div className="cpn-copy">
          <h2 id="go-coupon-title" className="cpn-title">
            광고 보고 오셨으면,
            <br />
            이거 하나 뜯어 가세요
          </h2>
          <p className="cpn-lead">
            첫 계약 금액에서 {COUPON.percent}% 빼 드리는 할인권이 들어 있어요. 추첨이 아니라 여시는 분 모두 똑같이{" "}
            {COUPON.percent}%예요.
          </p>
        </div>

        <div className="cpn-stage" ref={stageRef}>
          <canvas ref={backRef} className="cpn-canvas" aria-hidden="true" />
          <div
            ref={couponRef}
            className={`cp${expired ? " is-expired" : ""}`}
            role="group"
            aria-label={open ? `${COUPON.title}, 코드 ${code}` : undefined}
            aria-hidden={open ? undefined : true}
            inert={!open}
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
                  <button type="button" className="cp-copy" onClick={copyCode} aria-label={copied ? "복사했어요" : "코드 복사"}>
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
              <i ref={sweepRef} className="cp-sweep" aria-hidden="true" />
            </div>
          </div>
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

        <div className="cpn-side">
          {open ? (
            <div className="cpn-after" role="status">
              <p>
                받았어요. 아래에서 견적 계산하고 신청하시면 코드가 같이 접수돼요. 따로 말씀 안 하셔도 돼요.
              </p>
              <a className="button button-ink go-btn-sm" href="#quiz">
                견적 계산하고 신청하기 <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
          ) : (
            <div className="cpn-actions" aria-hidden={phase === "opening" ? true : undefined}>
              <p className="cpn-hint">파란 띠를 잡고 오른쪽으로 당기거나, 봉투를 세 번 톡톡 두드려 보세요.</p>
              <div className="cpn-buttons">
                <button
                  type="button"
                  className="button button-ink go-btn-sm"
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
          <p className="cpn-terms">
            <span className="go-sr">사용 조건: </span>
            {COUPON.terms.join(" · ")}
          </p>
        </div>
      </div>
      <div ref={veilRef} className="cpn-veil" aria-hidden="true" />
    </section>
  );
}

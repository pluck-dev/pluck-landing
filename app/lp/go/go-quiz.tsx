"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { submitGoInquiry } from "@/app/contact/actions";
import { GO_FORM_SOURCE } from "@/lib/crm/constants";
import {
  QUIZ_STEP_COUNT,
  QuizQuestions,
  QuoteLeadForm,
  useQuoteQuiz,
  useStepFocus,
} from "@/components/quote/quote-quiz";
import { ConsentNotice } from "../dev/dev-quiz";
import { REPLY_PROMISE } from "../dev/config";
import { CouponNote, useActiveCoupon } from "./coupon/coupon-note";
import { unlockSound } from "./paper/sfx";
import { estimate, FEATURES, formatPriceRange, PROJECT_KINDS, SCALES, type QuoteAnswers, type Range } from "@/lib/quote/pricing";
import { COUPON } from "@/lib/coupon";
import { GoSign } from "./sign/go-sign";
import { GoSuccess } from "./go-success";
import { GoReceipt } from "./receipt/go-receipt";
import { GoPunch } from "./punch/go-punch";

/** Punch card columns, one per question (same order as QuizQuestions). */
const PUNCH_LABELS = ["종류", "화면", "기능", "디자인", "일정"];

/**
 * The 작업 지시서 lines: the answers and the same 예상 금액 the receipt prints (estimate(), minus exactly
 * COUPON.percent when a coupon is open, as go-receipt.tsx does).
 */
function orderRows(answers: QuoteAnswers, coupon: boolean): [string, string][] {
  const result = estimate(answers);
  let total: Range = result.price;
  if (coupon) total = [total[0] - Math.round(total[0] * COUPON.percent) / 100, total[1] - Math.round(total[1] * COUPON.percent) / 100];
  return [
    ["만들 것", `${PROJECT_KINDS[answers.kind].label} · 화면 ${SCALES[answers.scale].label}`],
    ["기능", answers.features.length ? answers.features.map((key) => FEATURES[key].label).join(", ") : "없음"],
    ["예상 금액", formatPriceRange(total)],
    ["예상 기간", `${result.weeks[0]}~${result.weeks[1]}주`],
  ];
}

/** After signing (or the plain button): bring the form up and put the cursor in the name field. */
function toForm() {
  const card = document.getElementById("apply");
  if (!card) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  const field = card.querySelector<HTMLElement>("#go-name") ?? card.querySelector<HTMLElement>("a.button, button");
  window.setTimeout(() => field?.focus({ preventScroll: true }), reduced ? 0 : 650);
}

/** /lp/go quiz: questions → printed receipt (go-receipt.tsx) → name/contact form (form tag "lp-go"). */
export function GoQuiz({ formEnabled, email }: { formEnabled: boolean; email: string }) {
  const quiz = useQuoteQuiz(1);
  const coupon = useActiveCoupon();
  const rootRef = useRef<HTMLDivElement>(null);
  useStepFocus(quiz.step, rootRef);
  // What the visitor typed, for the sheet that folds into the envelope after a confirmed send.
  const [typed, setTyped] = useState({ name: "", contact: "", memo: "" });
  const onType = (event: FormEvent<HTMLDivElement>) => {
    const { name, value } = event.target as HTMLInputElement;
    if (name === "name" || name === "contact" || name === "memo") setTyped((current) => ({ ...current, [name]: value }));
  };

  return (
    // Any answer tap is a gesture: let the receipt printer make sound later (no AudioContext before that).
    <div className="qz go-quiz" ref={rootRef} onPointerDown={unlockSound}>
      {/* Progress as a punch card: reads the step, never changes it (punch/). A restart = a fresh card. */}
      <GoPunch
        answered={quiz.draft.kind ? Math.min(QUIZ_STEP_COUNT, quiz.step - 1) : 0}
        current={Math.min(QUIZ_STEP_COUNT, quiz.step - 1)}
        labels={PUNCH_LABELS}
      />
      {quiz.step >= 1 && quiz.step <= QUIZ_STEP_COUNT && (
        // Keyed by step so each question slides in (go.css .go-step; off under reduced motion).
        <div className="go-step" key={quiz.step}>
          <QuizQuestions quiz={quiz} firstStep={1} />
        </div>
      )}

      {quiz.step > QUIZ_STEP_COUNT && quiz.answers && (
        <div className="qz-result">
          <GoReceipt answers={quiz.answers} onRestart={quiz.restart} />
          {/* A playful commitment slip between the price and the form (sign/). Not a contract. */}
          <GoSign rows={orderRows(quiz.answers, Boolean(coupon))} onDone={toForm} />
          <div className="qz-card qz-lead go-lead" id="apply" onInput={onType}>
            <h2>무료 기획안·견적 받기</h2>
            <p className="go-promise">
              <Check size={16} aria-hidden="true" /> {REPLY_PROMISE}드립니다
            </p>
            <CouponNote className="is-form" />
            {formEnabled ? (
              <QuoteLeadForm
                answers={quiz.answers}
                action={submitGoInquiry}
                leadName={GO_FORM_SOURCE}
                extra={coupon ? { coupon: coupon.code, coupon_issued: coupon.issuedAt } : undefined}
                idPrefix="go"
                memoLabel="한두 줄 설명 (선택)"
                memoPlaceholder="예) 필라테스 예약 앱, 관리자 포함"
                submitLabel="무료로 기획안·견적 받기"
                consent={<ConsentNotice />}
                success={(focusRef) => (
                  <GoSuccess
                    focusRef={focusRef}
                    email={email}
                    sheet={{
                      ...typed,
                      kind: `${PROJECT_KINDS[quiz.answers!.kind].label} · 화면 ${SCALES[quiz.answers!.scale].label}`,
                      coupon: coupon?.code,
                    }}
                  />
                )}
              />
            ) : (
              <a
                className="button button-primary"
                href={`mailto:${email}?subject=${encodeURIComponent("PLUCK 기획안·견적 요청")}`}
              >
                메일로 요청하기 <ArrowRight size={18} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

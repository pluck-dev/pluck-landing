"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { submitGoInquiry } from "@/app/contact/actions";
import { GO_FORM_SOURCE } from "@/lib/crm/constants";
import {
  QUIZ_STEP_COUNT,
  QuizQuestions,
  QuoteLeadForm,
  QuoteResultCard,
  useQuoteQuiz,
  useStepFocus,
} from "@/components/quote/quote-quiz";
import { ConsentNotice } from "../dev/dev-quiz";
import { REPLY_PROMISE } from "../dev/config";

/** /lp/go quiz: questions → result → name/contact form (form tag "lp-go"). */
export function GoQuiz({ formEnabled, email }: { formEnabled: boolean; email: string }) {
  const quiz = useQuoteQuiz(1);
  const rootRef = useRef<HTMLDivElement>(null);
  useStepFocus(quiz.step, rootRef);

  return (
    <div className="qz go-quiz" ref={rootRef}>
      {quiz.step >= 1 && quiz.step <= QUIZ_STEP_COUNT && (
        // Keyed by step so each question slides in (go.css .go-step; off under reduced motion).
        <div className="go-step" key={quiz.step}>
          <QuizQuestions quiz={quiz} firstStep={1} />
        </div>
      )}

      {quiz.step > QUIZ_STEP_COUNT && quiz.answers && (
        <div className="qz-result">
          <QuoteResultCard answers={quiz.answers} onRestart={quiz.restart} />
          <div className="qz-card qz-lead go-lead" id="apply">
            <h2>이 조건으로 기획안·견적 받기</h2>
            <p>
              고르신 답을 보고 기획안 초안이랑 기능별 견적, 일정을 정리해서 보내드려요. 받아 보시고 할지 말지
              정하시면 돼요.
            </p>
            <p className="go-promise">
              <Check size={16} aria-hidden="true" /> {REPLY_PROMISE}드립니다
            </p>
            {formEnabled ? (
              <QuoteLeadForm
                answers={quiz.answers}
                action={submitGoInquiry}
                leadName={GO_FORM_SOURCE}
                idPrefix="go"
                memoLabel="한두 줄 설명 (선택)"
                memoPlaceholder="예) 필라테스 예약 앱, 관리자 포함"
                submitLabel="무료로 기획안·견적 받기"
                consent={<ConsentNotice />}
                success={(focusRef) => (
                  <div className="inquiry-success ld-thanks" role="status">
                    <h3 ref={focusRef} tabIndex={-1}>
                      신청이 접수됐어요
                    </h3>
                    <p>
                      {REPLY_PROMISE}드릴게요. 남겨주신 연락처로 몇 가지 더 여쭤보고 기획안 초안이랑 견적, 일정을
                      정리해서 보내드릴게요.
                    </p>
                    <div className="ld-thanks-actions">
                      <Link className="button button-ink" href="/#work">
                        포트폴리오 전체 보기 <ArrowRight size={18} aria-hidden="true" />
                      </Link>
                      <a className="contact-email" href={`mailto:${email}`}>
                        {email}
                      </a>
                    </div>
                  </div>
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

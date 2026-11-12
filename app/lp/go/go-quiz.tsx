"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
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
import { GO_QUIZ_EVENT, type GoQuizDetail } from "./go-chrome";

/** /lp/go quiz: questions → result → name/contact form (form tag "lp-go"). */
export function GoQuiz({ formEnabled, email }: { formEnabled: boolean; email: string }) {
  const quiz = useQuoteQuiz(1);
  const rootRef = useRef<HTMLDivElement>(null);
  useStepFocus(quiz.step, rootRef);

  // Feed the floating "견적 계산 n/5" chip in go-chrome.tsx.
  useEffect(() => {
    const detail: GoQuizDetail = {
      answered: Math.min(QUIZ_STEP_COUNT, Math.max(0, quiz.step - 1)),
      done: quiz.step > QUIZ_STEP_COUNT,
    };
    window.dispatchEvent(new CustomEvent(GO_QUIZ_EVENT, { detail }));
  }, [quiz.step]);

  return (
    <div className="qz go-quiz" ref={rootRef}>
      {quiz.step >= 1 && quiz.step <= QUIZ_STEP_COUNT && <QuizQuestions quiz={quiz} firstStep={1} />}

      {quiz.step > QUIZ_STEP_COUNT && quiz.answers && (
        <div className="qz-result">
          <QuoteResultCard answers={quiz.answers} onRestart={quiz.restart} />
          <div className="qz-card qz-lead go-lead" id="apply">
            <h2>이 조건으로 기획안·견적 받기</h2>
            <p>
              답변을 바탕으로 기획안 초안, 기능별 견적, 단계별 일정을 정리해 보내드립니다. 받아 보신 뒤 진행 여부를
              정하시면 됩니다.
            </p>
            <p className="ld-lead-promise">
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
                      {REPLY_PROMISE}드릴게요. 남겨주신 연락처로 내용을 한 번 더 여쭙고 기획안 초안·견적·일정을
                      정리해 보내드립니다.
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

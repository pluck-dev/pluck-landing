"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { submitQuoteInquiry } from "@/app/contact/actions";
import { INQUIRY_SUCCESS, QUOTE_FORM_SOURCE } from "@/lib/crm/constants";
import {
  QUIZ_STEP_COUNT,
  QuizQuestions,
  QuoteLeadForm,
  QuoteResultCard,
  useQuoteQuiz,
  useStepFocus,
} from "@/components/quote/quote-quiz";
import type { QuoteAnswers } from "@/lib/quote/pricing";

/** /lp/quote: intro card → 5 questions → result + lead form (shared pieces in components/quote). */
export function QuoteFunnel({ email, formEnabled }: { email: string; formEnabled: boolean }) {
  const quiz = useQuoteQuiz(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useStepFocus(quiz.step, rootRef);

  return (
    <div className="qz" ref={rootRef} id="calculator">
      {quiz.step === 0 && <Intro onStart={() => quiz.setStep(1)} />}

      {quiz.step >= 1 && quiz.step <= QUIZ_STEP_COUNT && <QuizQuestions quiz={quiz} />}

      {quiz.step > QUIZ_STEP_COUNT && quiz.answers && (
        <div className="qz-result">
          <QuoteResultCard answers={quiz.answers} onRestart={quiz.restart} />
          <div className="qz-card qz-lead" id="apply">
            <h2>상세 견적서·기획안 받기</h2>
            <p>
              이 답변을 바탕으로 기능별 견적서와 기획안 초안을 정리해 보내드립니다. 상담·견적 비용은
              없습니다.
            </p>
            {formEnabled ? (
              <QuoteForm answers={quiz.answers} email={email} />
            ) : (
              <a
                className="button button-primary"
                href={`mailto:${email}?subject=${encodeURIComponent("개발비 계산기 상세 견적 요청")}`}
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

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="qz-intro">
      <p className="qz-badge">개발비 30초 계산기</p>
      <h1>
        우리 서비스 개발비,
        <br />
        <em>30초면 나옵니다.</em>
      </h1>
      <p className="qz-sub">
        견적 3곳 받았는데 300만 원부터 3,000만 원까지?
        <br />
        기준부터 알려드릴게요.
      </p>
      <button type="button" className="button button-primary button-xl qz-start" onClick={onStart}>
        30초 계산 시작 <ArrowRight size={20} aria-hidden="true" />
      </button>
      <p className="qz-note">질문 5개 · 탭만 하면 끝 · 연락처 없이 결과 확인</p>
    </div>
  );
}

function QuoteForm({ answers, email }: { answers: QuoteAnswers; email: string }) {
  return (
    <QuoteLeadForm
      answers={answers}
      action={submitQuoteInquiry}
      leadName={QUOTE_FORM_SOURCE}
      consent={
        <p>
          견적 안내를 위해 이름, 연락처(전화번호 또는 이메일), 계산기 답변과 메모를 수집합니다.
          상담과 견적 안내에만 쓰고 1년 동안 보관한 뒤 파기합니다.{" "}
          <Link href="/privacy">개인정보처리방침 보기</Link>
        </p>
      }
      success={(focusRef) => (
        <div className="inquiry-success" role="status">
          <h3 ref={focusRef} tabIndex={-1}>
            요청이 접수됐어요
          </h3>
          <p>{INQUIRY_SUCCESS.body}</p>
          <a className="contact-email" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
      )}
    />
  );
}

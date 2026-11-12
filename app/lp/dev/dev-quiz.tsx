"use client";

import Link from "next/link";
import { createContext, useContext, useRef, type ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { submitDevInquiry } from "@/app/contact/actions";
import { DEV_FORM_SOURCE, type DevVariant } from "@/lib/crm/constants";
import {
  KindOptions,
  QUIZ_STEP_COUNT,
  QuizQuestions,
  QuoteLeadForm,
  QuoteResultCard,
  useQuoteQuiz,
  useStepFocus,
  type QuoteQuiz,
} from "@/components/quote/quote-quiz";
import type { KindKey } from "@/lib/quote/pricing";
import { REPLY_PROMISE } from "./config";

/**
 * One quiz state shared by the hero (question 1) and the full quiz in S10, so a tap in the
 * hero lands the visitor on question 2 further down the page.
 */
const QuizContext = createContext<QuoteQuiz | null>(null);

function useQuiz() {
  const quiz = useContext(QuizContext);
  if (!quiz) throw new Error("DevQuizProvider missing");
  return quiz;
}

export function DevQuizProvider({ children }: { children: ReactNode }) {
  const quiz = useQuoteQuiz(1);
  return <QuizContext.Provider value={quiz}>{children}</QuizContext.Provider>;
}

function scrollToQuiz() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  requestAnimationFrame(() =>
    document.getElementById("quiz")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }),
  );
}

/** Question 1 inside the hero. Picking a type jumps to question 2 in the quiz section. */
export function HeroQuiz() {
  const quiz = useQuiz();
  const onPick = (kind: KindKey) => {
    quiz.pickKind(kind);
    scrollToQuiz();
  };
  return (
    <div className="ld-hero-quiz">
      <div className="ld-hero-quiz-head">
        <p className="ld-hero-quiz-title">무엇을 만들고 싶으세요?</p>
        <p className="ld-hero-quiz-sub">고르면 바로 다음 질문으로 · 질문 5개 · 연락처 없이 결과 확인</p>
      </div>
      <KindOptions compact selected={quiz.draft.kind} onPick={onPick} />
    </div>
  );
}

/** S10: questions → result → form step 2. */
export function QuizSection({
  variant,
  formEnabled,
  email,
}: {
  variant: DevVariant;
  formEnabled: boolean;
  email: string;
}) {
  const quiz = useQuiz();
  const rootRef = useRef<HTMLDivElement>(null);
  useStepFocus(quiz.step, rootRef);

  return (
    <div className="qz ld-quiz" ref={rootRef}>
      {quiz.step >= 1 && quiz.step <= QUIZ_STEP_COUNT && <QuizQuestions quiz={quiz} firstStep={1} />}

      {quiz.step > QUIZ_STEP_COUNT && quiz.answers && (
        <div className="qz-result">
          <QuoteResultCard answers={quiz.answers} onRestart={quiz.restart} />
          <div className="qz-card qz-lead" id="apply">
            <h2>이 조건으로 기획안·견적서 받기</h2>
            <p>
              답변을 바탕으로 기획안 초안, 기능별 견적, 일정을 정리해 보내드립니다. 상담·견적은 무료이고,
              받아 보신 뒤 진행 여부를 정하시면 됩니다.
            </p>
            <p className="ld-lead-promise">
              <Check size={16} aria-hidden="true" /> {REPLY_PROMISE}드립니다
            </p>
            {formEnabled ? (
              <QuoteLeadForm
                answers={quiz.answers}
                action={submitDevInquiry}
                leadName={DEV_FORM_SOURCE}
                idPrefix="ld"
                extra={{ variant }}
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
                    <p>기다리시는 동안 지금까지 만든 서비스를 둘러보세요.</p>
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

/** 개인정보보호법 15조 고지: 목적·항목·보유기간·거부권. The checkbox itself is never pre-checked. */
export function ConsentNotice() {
  return (
    <div className="ld-consent">
      <p className="ld-consent-title">개인정보 수집·이용 안내</p>
      <dl>
        <div>
          <dt>목적</dt>
          <dd>상담 연락, 기획안·견적 안내</dd>
        </div>
        <div>
          <dt>항목</dt>
          <dd>이름, 연락처(전화번호 또는 이메일), 계산기 답변, 설명</dd>
        </div>
        <div>
          <dt>보유 기간</dt>
          <dd>접수일로부터 1년 뒤 파기</dd>
        </div>
      </dl>
      <p>
        동의를 거부할 수 있으며, 거부하시면 온라인 신청은 어렵습니다(메일 문의는 가능).{" "}
        <Link href="/privacy">개인정보처리방침</Link>
      </p>
    </div>
  );
}

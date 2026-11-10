"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import {
  submitQuoteInquiry,
  type QuoteField,
  type QuoteState,
} from "@/app/contact/actions";
import { INQUIRY_SUCCESS, QUOTE_FORM_SOURCE } from "@/lib/crm/constants";
import { trackLead, trackQuoteResult } from "@/lib/analytics";
import {
  DESIGNS,
  estimate,
  FEATURES,
  formatPriceRange,
  PROJECT_KINDS,
  SCALES,
  TIMELINES,
  type DesignKey,
  type FeatureKey,
  type KindKey,
  type QuoteAnswers,
  type ScaleKey,
  type TimelineKey,
} from "@/lib/quote/pricing";

type Draft = Partial<Omit<QuoteAnswers, "features">> & { features: FeatureKey[] };

const STEP_COUNT = 5;
const initialState: QuoteState = { status: "idle" };

const KIND_HINTS: Record<KindKey, string> = {
  homepage: "회사·가게 소개, 상담 신청",
  shop: "상품 판매·주문·결제",
  app: "iOS·Android 모바일 앱",
  admin: "엑셀·단톡방 업무를 시스템으로",
  platform: "예약·중개·매칭 서비스",
  automation: "반복 업무 자동화·연동",
};

export function QuoteFunnel({ email, formEnabled }: { email: string; formEnabled: boolean }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ features: [] });
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    if (root.getBoundingClientRect().top < 0) root.scrollIntoView({ block: "start" });
    root.querySelector<HTMLElement>("[data-step-title]")?.focus({ preventScroll: true });
  }, [step]);

  const answers: QuoteAnswers | null =
    draft.kind && draft.scale && draft.design && draft.timeline
      ? { kind: draft.kind, scale: draft.scale, design: draft.design, timeline: draft.timeline, features: draft.features }
      : null;

  const pick = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setStep((current) => current + 1);
  };

  const toggleFeature = (key: FeatureKey) =>
    setDraft((current) => ({
      ...current,
      features: current.features.includes(key)
        ? current.features.filter((f) => f !== key)
        : [...current.features, key],
    }));

  const restart = () => {
    setDraft({ features: [] });
    setStep(1);
  };

  return (
    <div className="qz" ref={rootRef} id="calculator">
      {step === 0 && <Intro onStart={() => setStep(1)} />}

      {step >= 1 && step <= STEP_COUNT && (
        <div className="qz-card">
          <div className="qz-top">
            <button
              type="button"
              className="qz-back"
              onClick={() => setStep((current) => current - 1)}
              aria-label="이전 질문"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div
              className="qz-progress"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={STEP_COUNT}
              aria-valuenow={step}
              aria-label="계산 진행"
            >
              <span style={{ width: `${(step / STEP_COUNT) * 100}%` }} />
            </div>
            <span className="qz-count">
              {step}/{STEP_COUNT}
            </span>
          </div>

          {step === 1 && (
            <Question title="무엇을 만들고 싶으세요?">
              <div className="qz-options">
                {(Object.keys(PROJECT_KINDS) as KindKey[]).map((key) => (
                  <Option
                    key={key}
                    label={PROJECT_KINDS[key].label}
                    hint={KIND_HINTS[key]}
                    selected={draft.kind === key}
                    onClick={() => pick("kind", key)}
                  />
                ))}
              </div>
            </Question>
          )}

          {step === 2 && (
            <Question title="화면은 대략 몇 개쯤일까요?" sub="페이지·탭 하나를 화면 하나로 세어 주세요.">
              <div className="qz-options">
                {(Object.keys(SCALES) as ScaleKey[]).map((key) => (
                  <Option
                    key={key}
                    label={SCALES[key].label}
                    hint={SCALES[key].hint}
                    selected={draft.scale === key}
                    onClick={() => pick("scale", key)}
                  />
                ))}
              </div>
            </Question>
          )}

          {step === 3 && (
            <Question title="꼭 필요한 기능을 모두 골라 주세요." sub="여러 개 고를 수 있어요. 없으면 바로 다음으로.">
              <div className="qz-chips" role="group" aria-label="필요한 기능">
                {(Object.keys(FEATURES) as FeatureKey[]).map((key) => {
                  const on = draft.features.includes(key);
                  return (
                    <button
                      type="button"
                      key={key}
                      className="qz-chip"
                      aria-pressed={on}
                      onClick={() => toggleFeature(key)}
                    >
                      {on && <Check size={16} aria-hidden="true" />}
                      {FEATURES[key].label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="button button-primary qz-next"
                onClick={() => setStep(4)}
              >
                {draft.features.length ? `${draft.features.length}개 선택 · 다음` : "필요한 기능 없음 · 다음"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </Question>
          )}

          {step === 4 && (
            <Question title="디자인은 어느 정도를 원하세요?">
              <div className="qz-options">
                {(Object.keys(DESIGNS) as DesignKey[]).map((key) => (
                  <Option
                    key={key}
                    label={DESIGNS[key].label}
                    hint={DESIGNS[key].hint}
                    selected={draft.design === key}
                    onClick={() => pick("design", key)}
                  />
                ))}
              </div>
            </Question>
          )}

          {step === 5 && (
            <Question title="언제까지 열고 싶으세요?">
              <div className="qz-options">
                {(Object.keys(TIMELINES) as TimelineKey[]).map((key) => (
                  <Option
                    key={key}
                    label={TIMELINES[key].label}
                    selected={draft.timeline === key}
                    onClick={() => pick("timeline", key)}
                  />
                ))}
              </div>
            </Question>
          )}
        </div>
      )}

      {step > STEP_COUNT && answers && (
        <Result answers={answers} email={email} formEnabled={formEnabled} onRestart={restart} />
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
        견적 3곳 받았는데 300만 원부터 3,000만 원까지?
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

function Question({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="qz-question">
      <h2 data-step-title tabIndex={-1}>
        {title}
      </h2>
      {sub && <p className="qz-qsub">{sub}</p>}
      {children}
    </div>
  );
}

function Option({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="qz-option" aria-pressed={selected} onClick={onClick}>
      <span className="qz-option-label">{label}</span>
      {hint && <span className="qz-option-hint">{hint}</span>}
      <ArrowRight className="qz-option-arrow" size={20} aria-hidden="true" />
    </button>
  );
}

function Result({
  answers,
  email,
  formEnabled,
  onRestart,
}: {
  answers: QuoteAnswers;
  email: string;
  formEnabled: boolean;
  onRestart: () => void;
}) {
  const result = estimate(answers);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackQuoteResult(answers.kind);
  }, [answers.kind]);

  return (
    <div className="qz-result">
      <div className="qz-card qz-result-card">
        <p className="qz-result-kind" data-step-title tabIndex={-1}>
          {PROJECT_KINDS[answers.kind].label} · 화면 {SCALES[answers.scale].label}
        </p>
        <p className="qz-result-label">예상 개발비 (참고 범위)</p>
        <p className="qz-price">
          {formatPriceRange(result.price)}
        </p>
        <p className="qz-weeks">
          예상 기간 <strong>{result.weeks[0]}~{result.weeks[1]}주</strong>
        </p>
        {result.tightTimeline && (
          <p className="qz-warn">
            원하시는 일정보다 길게 나왔어요. 꼭 필요한 기능만 먼저 여는 1차 오픈으로 나눌 수 있어요.
          </p>
        )}

        <div className="qz-block">
          <h3>필요한 기능</h3>
          <ul className="qz-tags">
            <li>{PROJECT_KINDS[answers.kind].label} 기본 화면</li>
            {answers.features.map((key) => (
              <li key={key}>{FEATURES[key].label}</li>
            ))}
            <li>{DESIGNS[answers.design].label}</li>
          </ul>
        </div>

        <div className="qz-block">
          <h3>비용을 정하는 것</h3>
          <ul className="qz-drivers">
            {result.drivers.map((driver) => (
              <li key={driver}>{driver}</li>
            ))}
          </ul>
        </div>

        <p className="qz-disclaimer">
          참고 범위이며, 상담 후 확정됩니다. PLUCK이 실제로 낸 외주 제안 금액을 기준으로 계산했어요.
        </p>
        <button type="button" className="qz-restart" onClick={onRestart}>
          <RotateCcw size={16} aria-hidden="true" /> 다시 계산하기
        </button>
      </div>

      <div className="qz-card qz-lead" id="apply">
        <h2>상세 견적서·기획안 받기</h2>
        <p>
          이 답변을 바탕으로 기능별 견적서와 기획안 초안을 정리해 보내드립니다. 상담·견적 비용은
          없습니다.
        </p>
        {formEnabled ? (
          <QuoteLeadForm answers={answers} email={email} />
        ) : (
          <a className="button button-primary" href={`mailto:${email}?subject=${encodeURIComponent("개발비 계산기 상세 견적 요청")}`}>
            메일로 요청하기 <ArrowRight size={18} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

function QuoteLeadForm({ answers, email }: { answers: QuoteAnswers; email: string }) {
  const [state, formAction, pending] = useActionState(submitQuoteInquiry, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const leadTracked = useRef(false);

  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const formError = state.status === "error" ? state.message : null;

  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
      if (state.lead && !leadTracked.current) {
        leadTracked.current = true;
        trackLead(QUOTE_FORM_SOURCE);
      }
      return;
    }
    if (state.status === "error" && state.fieldErrors) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="inquiry-success" role="status">
        <h3 ref={successRef} tabIndex={-1}>
          요청이 접수됐어요
        </h3>
        <p>{INQUIRY_SUCCESS.body}</p>
        <a className="contact-email" href={`mailto:${email}`}>
          {email}
        </a>
      </div>
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    formData.set("kind", answers.kind);
    formData.set("scale", answers.scale);
    formData.delete("features");
    for (const feature of answers.features) formData.append("features", feature);
    formData.set("design", answers.design);
    formData.set("timeline", answers.timeline);
    formData.set("page", window.location.pathname);
    formData.set("referrer", document.referrer);
    startTransition(() => formAction(formData));
  }

  const describe = (field: QuoteField) => (errors[field] ? `qz-${field}-error` : undefined);
  const fieldError = (field: QuoteField) =>
    errors[field] ? (
      <p className="field-error" id={`qz-${field}-error`}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <form ref={formRef} className="inquiry-form qz-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="qz-name">
          이름 <span className="req">(필수)</span>
        </label>
        <input
          id="qz-name"
          name="name"
          autoComplete="name"
          required
          maxLength={60}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describe("name")}
        />
        {fieldError("name")}
      </div>
      <div className="field">
        <label htmlFor="qz-contact">
          연락처 <span className="req">(필수)</span>
        </label>
        <input
          id="qz-contact"
          name="contact"
          autoComplete="tel"
          required
          maxLength={120}
          placeholder="전화번호 또는 이메일"
          aria-invalid={errors.contact ? true : undefined}
          aria-describedby={describe("contact")}
        />
        {fieldError("contact")}
      </div>
      <div className="field">
        <label htmlFor="qz-memo">한 줄 메모 (선택)</label>
        <input
          id="qz-memo"
          name="memo"
          maxLength={1000}
          placeholder="예) 필라테스 예약 앱"
          aria-invalid={errors.memo ? true : undefined}
          aria-describedby={describe("memo")}
        />
        {fieldError("memo")}
      </div>

      <div className="consent">
        <p>
          견적 안내를 위해 이름, 연락처(전화번호 또는 이메일), 계산기 답변과 메모를 수집합니다.
          상담과 견적 안내에만 쓰고 1년 동안 보관한 뒤 파기합니다.{" "}
          <Link href="/privacy">개인정보처리방침 보기</Link>
        </p>
        <label className="check">
          <input
            type="checkbox"
            name="consent_privacy"
            required
            aria-invalid={errors.consent_privacy ? true : undefined}
            aria-describedby={describe("consent_privacy")}
          />
          <span>
            개인정보 수집·이용에 동의합니다 <span className="req">(필수)</span>
          </span>
        </label>
        {fieldError("consent_privacy")}
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="qz-website">웹사이트</label>
        <input id="qz-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <button className="button button-primary inquiry-submit" type="submit" disabled={pending}>
        {pending ? "보내는 중…" : "상세 견적서·기획안 받기"}
        {!pending && <ArrowRight size={18} aria-hidden="true" />}
      </button>
    </form>
  );
}

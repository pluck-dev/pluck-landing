"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import {
  submitStartInquiry,
  type StartField,
  type StartState,
} from "@/app/contact/actions";
import { INQUIRY_SUCCESS, START_FORM_SOURCE, START_WANTS } from "@/lib/crm/constants";
import { trackLead } from "@/lib/analytics";

const initialState: StartState = { status: "idle" };

/** Short lead form for /lp/start. Server side: submitStartInquiry (same inquiries table as /contact). */
export function StartForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(submitStartInquiry, initialState);
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
        trackLead(START_FORM_SOURCE);
      }
      return;
    }
    if (state.status === "error" && state.fieldErrors) {
      const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="inquiry-success" role="status">
        <h2 ref={successRef} tabIndex={-1}>
          신청이 접수됐어요
        </h2>
        <p>{INQUIRY_SUCCESS.body}</p>
        <a className="contact-email" href={`mailto:${email}`}>
          {email}
        </a>
        <Link className="button button-ghost" href="/#work">
          포트폴리오 더 보기
        </Link>
      </div>
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    formData.set("page", window.location.pathname);
    formData.set("referrer", document.referrer);
    startTransition(() => formAction(formData));
  }

  const describe = (field: StartField) => (errors[field] ? `lp-${field}-error` : undefined);
  const fieldError = (field: StartField) =>
    errors[field] ? (
      <p className="field-error" id={`lp-${field}-error`}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      className="inquiry-form lp-form"
      onSubmit={onSubmit}
      aria-describedby={formError ? "lp-form-error" : undefined}
    >
      <div className="field-row">
        <div className="field">
          <label htmlFor="lp-name">
            이름 <span className="req">(필수)</span>
          </label>
          <input
            id="lp-name"
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
          <label htmlFor="lp-contact">
            연락처 <span className="req">(필수)</span>
          </label>
          <input
            id="lp-contact"
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
      </div>

      <fieldset
        className="field chip-group"
        aria-invalid={errors.want ? true : undefined}
        aria-describedby={describe("want")}
      >
        <legend>
          만들고 싶은 것 <span className="req">(필수)</span>
        </legend>
        <div className="chips">
          {Object.entries(START_WANTS).map(([value, want], index) => (
            <label className="chip" key={value}>
              <input type="radio" name="want" value={value} required={index === 0} />
              <span>{want.label}</span>
            </label>
          ))}
        </div>
        {fieldError("want")}
      </fieldset>

      <div className="field">
        <label htmlFor="lp-message">
          한두 줄 설명 <span className="req">(필수)</span>
        </label>
        <textarea
          id="lp-message"
          name="message"
          rows={4}
          required
          minLength={2}
          maxLength={1000}
          placeholder={"예) 매장 예약을 받는 홈페이지와, 직원이 예약을 확인하는 관리자 화면이 필요해요."}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe("message")}
        />
        {fieldError("message")}
      </div>

      <div className="consent">
        <p>
          답변을 위해 이름, 연락처(전화번호 또는 이메일), 문의 내용을 수집합니다. 상담과
          견적 안내에만 쓰고 1년 동안 보관한 뒤 파기합니다. 동의하지 않으셔도 메일(
          {email})로 문의하실 수 있어요. <Link href="/privacy">개인정보처리방침 보기</Link>
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
        <label htmlFor="lp-website">웹사이트</label>
        <input id="lp-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <p className="form-error" id="lp-form-error" role="alert">
          {formError}
        </p>
      )}

      <button className="button button-primary inquiry-submit" type="submit" disabled={pending}>
        {pending ? "보내는 중…" : "무료 기획안·견적 신청하기"}
        {!pending && <ArrowRight size={18} aria-hidden="true" />}
      </button>
    </form>
  );
}

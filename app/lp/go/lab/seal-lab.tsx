"use client";

import { useState, type FormEvent } from "react";
import type { QuoteState } from "@/app/contact/actions";
import { QuoteLeadForm } from "@/components/quote/quote-quiz";
import type { QuoteAnswers } from "@/lib/quote/pricing";
import { ConsentNotice } from "../../dev/dev-quiz";
import { GoSuccess } from "../go-success";

const ANSWERS: QuoteAnswers = { kind: "admin", scale: "l", features: ["payment", "admin"], design: "basic", timeline: "m2" };

/** Mock server action: never touches the network, just answers success (or an error with ?fail). */
async function mockAction(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (new URLSearchParams(window.location.search).has("fail")) return { status: "error", message: "테스트 실패 응답이에요." };
  void formData;
  return { status: "success", lead: false };
}

export function SealLab() {
  const [typed, setTyped] = useState({ name: "", contact: "", memo: "" });
  const onType = (event: FormEvent<HTMLDivElement>) => {
    const { name, value } = event.target as HTMLInputElement;
    if (name === "name" || name === "contact" || name === "memo") setTyped((current) => ({ ...current, [name]: value }));
  };
  return (
    <div className="qz go-quiz">
      <div className="qz-card qz-lead go-lead" onInput={onType}>
        <h2>이 조건으로 기획안·견적 받기 (dev lab, 전송 안 됨)</h2>
        <QuoteLeadForm
          answers={ANSWERS}
          action={mockAction}
          leadName="lab"
          idPrefix="go"
          submitLabel="무료로 기획안·견적 받기"
          consent={<ConsentNotice />}
          success={(focusRef) => (
            <GoSuccess focusRef={focusRef} email="admin@pluck.co.kr" sheet={{ ...typed, kind: "관리자·업무 시스템 · 화면 16~30개", coupon: "PLK-7F3K9Q" }} />
          )}
        />
      </div>
    </div>
  );
}

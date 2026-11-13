"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { ArrowRight } from "lucide-react";
import { REPLY_PROMISE } from "../dev/config";
import { GoSeal, type SealSheet } from "./seal/go-seal";

/**
 * What QuoteLeadForm shows once the server confirmed the inquiry: the sheet folds into an envelope and
 * leaves (seal/), then the same thank-you text and reply promise as before. Only ever rendered from the
 * form's success state, so the envelope never plays for an inquiry that wasn't saved.
 */
export function GoSuccess({ focusRef, email, sheet }: { focusRef: RefObject<HTMLHeadingElement | null>; email: string; sheet: SealSheet }) {
  return (
    <GoSeal sheet={sheet}>
      <div className="inquiry-success ld-thanks" role="status">
        <h3 ref={focusRef} tabIndex={-1}>
          신청이 접수됐어요
        </h3>
        <p>{REPLY_PROMISE}드릴게요.</p>
        <div className="ld-thanks-actions">
          <Link className="button button-primary" href="/#work">
            작업 더 보기 <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <a className="contact-email" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
      </div>
    </GoSeal>
  );
}

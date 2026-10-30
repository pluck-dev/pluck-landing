"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ArrowRight, Paperclip, Plus, X } from "lucide-react";
import {
  requestUploadTickets,
  submitInquiry,
  type InquiryField,
  type InquiryState,
} from "./actions";
import {
  ATTACHMENT_ACCEPT,
  attachmentMime,
  budgetLabels,
  formatBytes,
  INQUIRY_SUCCESS,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  MAX_REFERENCE_URLS,
  projectTypeLabels,
  timelineLabels,
} from "@/lib/crm/constants";
import { BUDGETS, PROJECT_TYPES, TIMELINES } from "@/lib/supabase/types";
import type { InquiryAttachment } from "@/lib/supabase/types";

const initialState: InquiryState = { status: "idle" };

export function ContactForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  const [uploading, setUploading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const fileInputId = useId();

  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const formError = clientError ?? (state.status === "error" ? state.message : null);
  const busy = pending || uploading;

  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
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
          {INQUIRY_SUCCESS.title}
        </h2>
        <p>{INQUIRY_SUCCESS.body}</p>
        <a className="contact-email" href={`mailto:${email}`}>
          {email}
        </a>
        <Link className="button button-ghost" href="/">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    setClientError(null);
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_ATTACHMENTS) {
        setClientError(`첨부파일은 ${MAX_ATTACHMENTS}개까지 올릴 수 있어요.`);
        break;
      }
      if (!attachmentMime(file.name)) {
        setClientError(`${file.name}: PDF, 이미지(PNG·JPG), ZIP, 오피스 문서만 올릴 수 있어요.`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setClientError(`${file.name}: 파일 하나는 10MB까지 올릴 수 있어요.`);
        continue;
      }
      next.push(file);
    }
    setFiles(next);
  }

  async function uploadFiles(): Promise<InquiryAttachment[] | null> {
    if (!files.length) return [];
    const result = await requestUploadTickets(
      files.map((file) => ({ name: file.name, size: file.size })),
    );
    if (!result.ok) {
      setClientError(result.message);
      return null;
    }
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const uploaded: InquiryAttachment[] = [];
    for (const [index, ticket] of result.tickets.entries()) {
      const file = files[index];
      const response = await fetch(ticket.signedUrl, {
        method: "PUT",
        headers: {
          "content-type": ticket.contentType,
          "x-upsert": "false",
          ...(anonKey ? { apikey: anonKey } : {}),
        },
        body: file,
      });
      if (!response.ok) {
        setClientError(
          `${file.name} 업로드에 실패했어요. 파일을 빼고 접수하거나 메일로 보내주세요.`,
        );
        return null;
      }
      uploaded.push({
        path: ticket.path,
        name: file.name,
        size: file.size,
        type: ticket.contentType,
      });
    }
    return uploaded;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setClientError(null);
    const formData = new FormData(event.currentTarget);
    formData.delete("files");
    setUploading(true);
    let attachments: InquiryAttachment[] | null;
    try {
      attachments = await uploadFiles();
    } catch {
      attachments = null;
      setClientError("파일을 올리지 못했어요. 파일을 빼고 접수하거나 메일로 보내주세요.");
    } finally {
      setUploading(false);
    }
    if (!attachments) return;
    formData.set("attachments", JSON.stringify(attachments));
    formData.set("page", window.location.pathname);
    formData.set("referrer", document.referrer);
    startTransition(() => formAction(formData));
  }

  const describe = (field: InquiryField) =>
    errors[field] ? `${field}-error` : undefined;
  const fieldError = (field: InquiryField) =>
    errors[field] ? (
      <p className="field-error" id={`${field}-error`}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      className="inquiry-form"
      onSubmit={onSubmit}
      aria-describedby={formError ? "form-error" : undefined}
    >
      <div className="field-row">
        <div className="field">
          <label htmlFor="name">
            이름 <span className="req">(필수)</span>
          </label>
          <input
            id="name"
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
          <label htmlFor="company">회사/브랜드</label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            maxLength={80}
            aria-invalid={errors.company ? true : undefined}
            aria-describedby={describe("company")}
          />
          {fieldError("company")}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="email">
            이메일 <span className="req">(필수)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={120}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describe("email")}
          />
          {fieldError("email")}
        </div>
        <div className="field">
          <label htmlFor="phone">연락처</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="010-0000-0000"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describe("phone")}
          />
          {fieldError("phone")}
        </div>
      </div>

      <fieldset
        className="field chip-group"
        aria-invalid={errors.project_type ? true : undefined}
        aria-describedby={describe("project_type")}
      >
        <legend>
          프로젝트 종류 <span className="req">(필수)</span>
        </legend>
        <div className="chips">
          {PROJECT_TYPES.map((value, index) => (
            <label className="chip" key={value}>
              <input
                type="radio"
                name="project_type"
                value={value}
                required={index === 0}
              />
              <span>{projectTypeLabels[value]}</span>
            </label>
          ))}
        </div>
        {fieldError("project_type")}
      </fieldset>

      <fieldset className="field chip-group">
        <legend>예산 범위</legend>
        <div className="chips">
          {BUDGETS.map((value) => (
            <label className="chip" key={value}>
              <input type="radio" name="budget" value={value} />
              <span>{budgetLabels[value]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field chip-group">
        <legend>희망 일정</legend>
        <div className="chips">
          {TIMELINES.map((value) => (
            <label className="chip" key={value}>
              <input type="radio" name="timeline" value={value} />
              <span>{timelineLabels[value]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="message">
          내용 <span className="req">(필수)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={8}
          required
          minLength={10}
          maxLength={5000}
          placeholder={
            "무엇을 만들고 싶은지, 누구를 위한 서비스인지, 꼭 필요한 기능을 적어 주세요.\n예) 학원 학부모용 출결·상담 예약 웹앱. 원장님이 쓰는 관리자 화면과 카카오 알림이 꼭 필요해요."
          }
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe("message")}
        />
        {fieldError("message")}
      </div>

      <div className="field">
        <span className="field-label" id="links-label">
          참고 링크
        </span>
        <p className="field-hint">비슷한 서비스, 지금 쓰는 사이트, 기획 문서 링크 등</p>
        <div className="link-list" role="group" aria-labelledby="links-label">
          {links.map((link, index) => (
            <div className="link-row" key={index}>
              <input
                name="reference_urls"
                type="url"
                inputMode="url"
                placeholder="https://"
                value={link}
                aria-label={`참고 링크 ${index + 1}`}
                aria-invalid={errors.reference_urls ? true : undefined}
                aria-describedby={describe("reference_urls")}
                onChange={(event) => {
                  const next = [...links];
                  next[index] = event.target.value;
                  setLinks(next);
                }}
              />
              {links.length > 1 && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`참고 링크 ${index + 1} 삭제`}
                  onClick={() => setLinks(links.filter((_, i) => i !== index))}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        {links.length < MAX_REFERENCE_URLS && (
          <button
            type="button"
            className="text-button"
            onClick={() => setLinks([...links, ""])}
          >
            <Plus size={16} aria-hidden="true" /> 링크 추가
          </button>
        )}
        {fieldError("reference_urls")}
      </div>

      <div className="field">
        <span className="field-label">첨부파일</span>
        <p className="field-hint">
          PDF·PNG·JPG·ZIP·DOCX·PPTX·XLSX, 파일당 10MB, 최대 {MAX_ATTACHMENTS}개
        </p>
        {files.length > 0 && (
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <Paperclip size={15} aria-hidden="true" />
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`${file.name} 빼기`}
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {files.length < MAX_ATTACHMENTS && (
          <label className="file-pick" htmlFor={fileInputId}>
            <Paperclip size={16} aria-hidden="true" /> 파일 선택
            <input
              id={fileInputId}
              name="files"
              type="file"
              multiple
              accept={ATTACHMENT_ACCEPT}
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        )}
        {fieldError("attachments")}
      </div>

      <div className="consent">
        <p>
          문의 답변을 위해 이름, 이메일, 연락처, 회사/브랜드, 문의 내용과 첨부파일을
          수집합니다. 수집한 정보는 상담과 견적 안내에만 쓰고 1년 동안 보관한 뒤
          파기합니다. 동의하지 않으셔도 메일({email})로 문의하실 수 있어요.{" "}
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
        <label htmlFor="website">웹사이트</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <p className="form-error" id="form-error" role="alert">
          {formError}
        </p>
      )}

      <button className="button button-primary inquiry-submit" type="submit" disabled={busy}>
        {uploading ? "파일 올리는 중…" : pending ? "보내는 중…" : "문의 보내기"}
        {!busy && <ArrowRight size={18} aria-hidden="true" />}
      </button>
    </form>
  );
}

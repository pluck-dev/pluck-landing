"use client";

import { useActionState } from "react";
import { sendMagicLink, signInWithPassword, verifyLoginCode, type LoginState } from "./actions";

const idle: LoginState = { status: "idle" };

export function LoginForm({ next }: { next: string }) {
  const [sent, sendAction, sending] = useActionState(sendMagicLink, idle);
  const [verified, verifyAction, verifying] = useActionState(verifyLoginCode, idle);
  const [pw, pwAction, pwPending] = useActionState(signInWithPassword, idle);
  const email = sent.status === "sent" ? sent.email : verified.status === "error" ? verified.email : undefined;
  const showCode = sent.status === "sent" || (verified.status === "error" && verified.email);

  if (showCode && email) {
    return (
      <div className="adm-stack">
        <p className="adm-note" role="status">
          {email} 이(가) 등록된 관리자라면 로그인 링크를 보냈어요. 메일의 링크를
          누르면 바로 로그인돼요. 휴대폰 메일 앱에서 눌러도 돼요. (메일에 숫자 코드가 있다면 아래에 입력해도 돼요)
        </p>
        <form action={verifyAction} className="adm-stack">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <label className="adm-label" htmlFor="token">
            로그인 코드
          </label>
          <input
            id="token"
            name="token"
            className="adm-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            required
          />
          {verified.status === "error" && (
            <p className="adm-error" role="alert">
              {verified.message}
            </p>
          )}
          <button className="adm-btn adm-btn-primary" disabled={verifying}>
            {verifying ? "확인 중…" : "코드로 로그인"}
          </button>
        </form>
        <form action={sendAction}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <button className="adm-btn adm-btn-ghost" disabled={sending}>
            {sending ? "보내는 중…" : "링크 다시 보내기"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="adm-stack">
      <form action={pwAction} className="adm-stack">
        <input type="hidden" name="next" value={next} />
        <label className="adm-label" htmlFor="pw-email">
          이메일
        </label>
        <input
          id="pw-email"
          name="email"
          type="email"
          className="adm-input"
          autoComplete="username"
          defaultValue={pw.status === "error" ? pw.email : undefined}
          required
        />
        <label className="adm-label" htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="adm-input"
          autoComplete="current-password"
          required
        />
        {pw.status === "error" && (
          <p className="adm-error" role="alert">
            {pw.message}
          </p>
        )}
        <button className="adm-btn adm-btn-primary" disabled={pwPending}>
          {pwPending ? "확인 중…" : "로그인"}
        </button>
      </form>
      <details className="adm-stack">
        <summary className="adm-muted">비밀번호 없이 메일 링크로 로그인</summary>
        <form action={sendAction} className="adm-stack">
          <input type="hidden" name="next" value={next} />
          <label className="adm-label" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="adm-input"
            autoComplete="email"
            defaultValue={sent.status === "error" ? sent.email : undefined}
            required
          />
          {sent.status === "error" && (
            <p className="adm-error" role="alert">
              {sent.message}
            </p>
          )}
          <button className="adm-btn adm-btn-ghost" disabled={sending}>
            {sending ? "보내는 중…" : "로그인 링크 받기"}
          </button>
        </form>
      </details>
    </div>
  );
}

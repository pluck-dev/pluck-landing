"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="adm-card adm-error-card" role="alert">
      <h1>처리하지 못했어요</h1>
      <p>{error.message || "알 수 없는 오류가 생겼어요."}</p>
      {error.digest && <p className="adm-muted">오류 코드 {error.digest}</p>}
      <button className="adm-btn" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}

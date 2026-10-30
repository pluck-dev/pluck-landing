import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/crm/auth";
import {
  budgetLabels,
  formatBytes,
  inquiryStatusLabels,
  projectTypeLabels,
  timelineLabels,
} from "@/lib/crm/constants";
import { getInquiry } from "@/lib/crm/queries";
import { INQUIRY_STATUSES } from "@/lib/supabase/types";
import {
  convertInquiryToProject,
  updateInquiryMemo,
  updateInquiryStatus,
} from "../../actions";
import { ActivityList, fmtDateTime, InquiryBadge, PageHead, ProjectBadge } from "../../ui";

export const metadata: Metadata = { title: "문의 상세" };

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const detail = await getInquiry(admin, id);
  if (!detail) notFound();
  const { inquiry: inq, projects, activity, attachmentLinks } = detail;
  const source = inq.source ?? {};

  const rows: [string, React.ReactNode][] = [
    ["이름", inq.name],
    ["회사/브랜드", inq.company || "-"],
    ["이메일", <a key="e" href={`mailto:${inq.email}`}>{inq.email}</a>],
    ["연락처", inq.phone ? <a key="p" href={`tel:${inq.phone}`}>{inq.phone}</a> : "-"],
    ["프로젝트 종류", projectTypeLabels[inq.project_type]],
    ["예산 범위", inq.budget ? budgetLabels[inq.budget] : "-"],
    ["희망 일정", inq.timeline ? timelineLabels[inq.timeline] : "-"],
    ["접수", fmtDateTime(inq.created_at)],
    ["개인정보 동의", inq.consent_privacy ? "동의" : "미동의"],
  ];

  return (
    <>
      <PageHead title={inq.company || inq.name}>
        <Link className="adm-btn adm-btn-ghost" href="/admin/inquiries">
          목록
        </Link>
      </PageHead>

      <div className="adm-detail">
        <div className="adm-stack-lg">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>문의 내용</h2>
              <InquiryBadge status={inq.status} />
            </div>
            <dl className="adm-dl">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <h3 className="adm-h3">내용</h3>
            <p className="adm-pre">{inq.message}</p>

            {inq.reference_urls.length > 0 && (
              <>
                <h3 className="adm-h3">참고 링크</h3>
                <ul className="adm-links">
                  {inq.reference_urls.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer nofollow">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {attachmentLinks.length > 0 && (
              <>
                <h3 className="adm-h3">첨부파일</h3>
                <ul className="adm-links">
                  {attachmentLinks.map((file) => (
                    <li key={file.name}>
                      {file.url ? (
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          {file.name}
                        </a>
                      ) : (
                        <span>{file.name} (링크를 만들지 못했어요)</span>
                      )}{" "}
                      <span className="adm-muted">{formatBytes(file.size)}</span>
                    </li>
                  ))}
                </ul>
                <p className="adm-footnote">다운로드 링크는 10분 동안 유효해요.</p>
              </>
            )}

            <h3 className="adm-h3">유입 경로</h3>
            <dl className="adm-dl adm-dl-compact">
              <div>
                <dt>UTM</dt>
                <dd>
                  {source.utm
                    ? Object.entries(source.utm)
                        .map(([k, v]) => `${k.replace("utm_", "")}=${v}`)
                        .join(" · ")
                    : "-"}
                </dd>
              </div>
              <div>
                <dt>이전 사이트</dt>
                <dd className="adm-break">{source.referrer || "-"}</dd>
              </div>
              <div>
                <dt>첫 방문 페이지</dt>
                <dd className="adm-break">{source.landing || "-"}</dd>
              </div>
              <div>
                <dt>접수 페이지</dt>
                <dd>{source.page || "-"}</dd>
              </div>
            </dl>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>기록</h2>
            </div>
            <ActivityList entries={activity} />
          </section>
        </div>

        <div className="adm-stack-lg">
          <section className="adm-card">
            <h2 className="adm-card-title">상태</h2>
            <form action={updateInquiryStatus} className="adm-inline-form">
              <input type="hidden" name="id" value={inq.id} />
              <label className="sr-only" htmlFor="status">
                상태
              </label>
              <select id="status" name="status" className="adm-input" defaultValue={inq.status}>
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {inquiryStatusLabels[s]}
                  </option>
                ))}
              </select>
              <button className="adm-btn">변경</button>
            </form>
          </section>

          <section className="adm-card">
            <h2 className="adm-card-title">메모</h2>
            <form action={updateInquiryMemo} className="adm-stack">
              <input type="hidden" name="id" value={inq.id} />
              <label className="sr-only" htmlFor="admin_memo">
                관리자 메모
              </label>
              <textarea
                id="admin_memo"
                name="admin_memo"
                className="adm-input"
                rows={6}
                defaultValue={inq.admin_memo ?? ""}
                placeholder="통화 내용, 견적 메모 등 (고객에게 보이지 않아요)"
              />
              <button className="adm-btn">메모 저장</button>
            </form>
          </section>

          <section className="adm-card">
            <h2 className="adm-card-title">프로젝트</h2>
            {projects.length ? (
              <ul className="adm-rows">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link className="adm-row-link" href={`/admin/projects/${p.id}`}>
                      <strong>{p.name}</strong>
                      <ProjectBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <form action={convertInquiryToProject} className="adm-stack">
                <input type="hidden" name="id" value={inq.id} />
                <p className="adm-muted">
                  고객(같은 이메일이 있으면 그 고객)과 기획 단계 프로젝트를 만들고, 문의 상태를
                  &lsquo;수주&rsquo;로 바꿔요.
                </p>
                <button className="adm-btn adm-btn-primary">프로젝트로 전환</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

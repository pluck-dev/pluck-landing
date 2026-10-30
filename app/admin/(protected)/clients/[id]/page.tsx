import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/crm/auth";
import { formatWon, projectStatusLabels, projectTypeLabels } from "@/lib/crm/constants";
import { getClient, progressOf } from "@/lib/crm/queries";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/supabase/types";
import { createProject, updateClient } from "../../actions";
import { Empty, fmtDate, PageHead, ProjectBadge, Progress } from "../../ui";

export const metadata: Metadata = { title: "고객 상세" };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const detail = await getClient(admin, id);
  if (!detail) notFound();
  const { client: c, projects } = detail;
  const contract = projects.reduce((sum, p) => sum + Number(p.contract_amount), 0);
  const paid = projects.reduce((sum, p) => sum + Number(p.paid_amount), 0);

  return (
    <>
      <PageHead title={c.company || c.name}>
        <Link className="adm-btn adm-btn-ghost" href="/admin/clients">
          목록
        </Link>
      </PageHead>

      <div className="adm-detail">
        <div className="adm-stack-lg">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>프로젝트</h2>
              <span className="adm-muted">
                계약 {formatWon(contract)} · 입금 {formatWon(paid)}
              </span>
            </div>
            {projects.length ? (
              <ul className="adm-rows">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link className="adm-row-link" href={`/admin/projects/${p.id}`}>
                      <span className="adm-row-main">
                        <strong>{p.name}</strong>
                        <span className="adm-muted">
                          {projectTypeLabels[p.type]} · 마감 {fmtDate(p.due_date)} · {formatWon(p.contract_amount)}
                        </span>
                      </span>
                      <Progress value={progressOf(p.taskDone, p.taskTotal)} />
                      <ProjectBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>아직 프로젝트가 없어요.</Empty>
            )}
            <details className="adm-collapse adm-collapse-inner">
              <summary>이 고객의 프로젝트 추가</summary>
              <form action={createProject} className="adm-form-grid">
                <input type="hidden" name="client_id" value={c.id} />
                <label>
                  프로젝트명
                  <input name="name" className="adm-input" required maxLength={120} />
                </label>
                <label>
                  종류
                  <select name="type" className="adm-input" defaultValue="website">
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {projectTypeLabels[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  상태
                  <select name="status" className="adm-input" defaultValue="planning">
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {projectStatusLabels[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  계약 금액(원)
                  <input name="contract_amount" inputMode="numeric" className="adm-input" defaultValue="0" />
                </label>
                <label>
                  시작일
                  <input name="start_date" type="date" className="adm-input" />
                </label>
                <label>
                  마감일
                  <input name="due_date" type="date" className="adm-input" />
                </label>
                <div className="adm-form-actions">
                  <button className="adm-btn adm-btn-primary">추가</button>
                </div>
              </form>
            </details>
          </section>
        </div>

        <div className="adm-stack-lg">
          <section className="adm-card">
            <h2 className="adm-card-title">고객 정보</h2>
            <form action={updateClient} className="adm-stack">
              <input type="hidden" name="id" value={c.id} />
              <label className="adm-label">
                이름
                <input name="name" className="adm-input" defaultValue={c.name} required maxLength={80} />
              </label>
              <label className="adm-label">
                회사/브랜드
                <input name="company" className="adm-input" defaultValue={c.company ?? ""} maxLength={80} />
              </label>
              <label className="adm-label">
                이메일
                <input name="email" type="email" className="adm-input" defaultValue={c.email ?? ""} maxLength={120} />
              </label>
              <label className="adm-label">
                연락처
                <input name="phone" type="tel" className="adm-input" defaultValue={c.phone ?? ""} maxLength={30} />
              </label>
              <label className="adm-label">
                메모
                <textarea name="memo" className="adm-input" rows={5} defaultValue={c.memo ?? ""} />
              </label>
              <button className="adm-btn adm-btn-primary">저장</button>
            </form>
            <p className="adm-footnote">등록 {fmtDate(c.created_at)}</p>
          </section>
        </div>
      </div>
    </>
  );
}

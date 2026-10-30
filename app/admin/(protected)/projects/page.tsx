import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/crm/auth";
import { formatWon, projectStatusLabels, projectTypeLabels } from "@/lib/crm/constants";
import { kstToday, listClientRefs, listProjects, progressOf } from "@/lib/crm/queries";
import { PROJECT_STATUSES, PROJECT_TYPES, type ProjectStatus } from "@/lib/supabase/types";
import { createProject } from "../actions";
import { Empty, FilterTabs, fmtDate, PageHead, ProjectBadge, Progress } from "../ui";

export const metadata: Metadata = { title: "프로젝트 관리" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const status = PROJECT_STATUSES.includes(params.status as ProjectStatus)
    ? (params.status as ProjectStatus)
    : undefined;
  const [projects, clients] = await Promise.all([
    listProjects(admin, { status }),
    listClientRefs(admin),
  ]);
  const today = kstToday();

  return (
    <>
      <PageHead title="프로젝트 관리" />
      <FilterTabs
        base="/admin/projects"
        current={status}
        options={PROJECT_STATUSES.map((s) => [s, projectStatusLabels[s]])}
      />

      {projects.length ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">프로젝트</th>
                <th scope="col">상태</th>
                <th scope="col">진행률</th>
                <th scope="col">마감</th>
                <th scope="col" className="adm-num">계약</th>
                <th scope="col" className="adm-num">미수금</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const overdue = p.due_date && p.due_date < today && !["done", "paused", "maintenance"].includes(p.status);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/projects/${p.id}`} className="adm-strong-link">
                        {p.name}
                      </Link>
                      <span className="adm-sub">
                        {p.client ? p.client.company || p.client.name : "-"} · {projectTypeLabels[p.type]}
                      </span>
                    </td>
                    <td>
                      <ProjectBadge status={p.status} />
                    </td>
                    <td>
                      <Progress value={progressOf(p.taskDone, p.taskTotal)} />
                    </td>
                    <td className={`adm-nowrap ${overdue ? "adm-overdue" : ""}`}>{fmtDate(p.due_date)}</td>
                    <td className="adm-num">{formatWon(p.contract_amount)}</td>
                    <td className="adm-num">
                      {formatWon(Math.max(0, Number(p.contract_amount) - Number(p.paid_amount)))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{status ? "이 상태의 프로젝트가 없어요." : "아직 프로젝트가 없어요. 문의에서 전환하거나 아래에서 추가하세요."}</Empty>
      )}

      <details className="adm-card adm-collapse">
        <summary>새 프로젝트 추가</summary>
        {clients.length ? (
          <form action={createProject} className="adm-form-grid">
            <label>
              고객
              <select name="client_id" className="adm-input" required>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </label>
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
              시작일
              <input name="start_date" type="date" className="adm-input" />
            </label>
            <label>
              마감일
              <input name="due_date" type="date" className="adm-input" />
            </label>
            <label>
              계약 금액(원)
              <input name="contract_amount" inputMode="numeric" className="adm-input" defaultValue="0" />
            </label>
            <div className="adm-form-actions">
              <button className="adm-btn adm-btn-primary">추가</button>
            </div>
          </form>
        ) : (
          <p className="adm-muted">
            먼저 <Link href="/admin/clients">고객</Link>을 추가하세요.
          </p>
        )}
      </details>
    </>
  );
}

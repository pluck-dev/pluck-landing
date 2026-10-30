"use client";

import { useMemo } from "react";
import { formatWon, projectTypeLabels } from "@/lib/crm/constants";
import { matches, progressOf } from "@/lib/crm/derive";
import { clientShape, parseForm } from "@/lib/crm/validation";
import { compare, useClientList, useListState, useProjectList } from "./hooks";
import { useCrm } from "./mutations";
import { NewProjectForm } from "./projects";
import { useActivity, useAdmin } from "./store";
import {
  ActivityList,
  AdminLink,
  Empty,
  fmtDate,
  PageHead,
  ProjectBadge,
  Progress,
  SkeletonRows,
  SortTh,
} from "./ui";

type SortKey = "created_at" | "customer" | "email" | "projectCount";
const NO_STATUS = [] as const;

export function ClientListView() {
  const { data: all, isPending } = useClientList();
  const crm = useCrm();
  const { toast } = useAdmin();
  const list = useListState(NO_STATUS, { key: "created_at" as SortKey, dir: -1 });

  const rows = useMemo(() => {
    const { key, dir } = list.sort;
    const value = (c: (typeof all)[number]) => (key === "customer" ? c.company || c.name : c[key]);
    return all
      .filter((c) => matches(list.deferredQ, c.name, c.company, c.email, c.phone, c.memo))
      .sort((a, b) => dir * compare(value(a), value(b)));
  }, [all, list.deferredQ, list.sort]);

  return (
    <>
      <PageHead title="고객 관리">
        <input
          className="adm-input adm-search-input"
          type="search"
          value={list.q}
          onChange={(e) => list.setQ(e.target.value)}
          placeholder="이름, 회사, 이메일, 연락처 검색  ( / )"
          aria-label="고객 검색"
          data-admin-search
        />
      </PageHead>

      {isPending ? (
        <SkeletonRows cols={4} />
      ) : rows.length ? (
        <div className="adm-table-wrap">
          <table className="adm-table adm-table-dense">
            <thead>
              <tr>
                <SortTh label="고객" k="customer" sort={list.sort} onSort={list.onSort} />
                <SortTh label="연락처" k="email" sort={list.sort} onSort={list.onSort} />
                <SortTh label="프로젝트" k="projectCount" sort={list.sort} onSort={list.onSort} className="adm-num" />
                <SortTh label="등록" k="created_at" sort={list.sort} onSort={list.onSort} />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <AdminLink href={`/admin/clients/${c.id}`} className="adm-strong-link">
                      {c.company || c.name}
                    </AdminLink>
                    {c.company && <span className="adm-sub">{c.name}</span>}
                  </td>
                  <td>
                    {c.email || "-"}
                    {c.phone && <span className="adm-sub">{c.phone}</span>}
                  </td>
                  <td className="adm-num">{c.projectCount}</td>
                  <td className="adm-nowrap adm-muted">{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>
          {list.deferredQ ? "검색 결과가 없어요." : "아직 고객이 없어요. 문의를 프로젝트로 전환하면 자동으로 추가돼요."}
        </Empty>
      )}
      {!isPending && <p className="adm-footnote">{rows.length}명 표시</p>}

      <details className="adm-card adm-collapse">
        <summary>고객 직접 추가</summary>
        <form
          className="adm-form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              crm.createClient(parseForm(clientShape, e.currentTarget));
            } catch (err) {
              toast((err as Error).message, "error");
            }
          }}
        >
          <label>
            이름
            <input name="name" className="adm-input" required maxLength={80} />
          </label>
          <label>
            회사/브랜드
            <input name="company" className="adm-input" maxLength={80} />
          </label>
          <label>
            이메일
            <input name="email" type="email" className="adm-input" maxLength={120} />
          </label>
          <label>
            연락처
            <input name="phone" type="tel" className="adm-input" maxLength={30} />
          </label>
          <label className="adm-span-2">
            메모
            <textarea name="memo" className="adm-input" rows={3} />
          </label>
          <div className="adm-form-actions">
            <button className="adm-btn adm-btn-primary">추가</button>
          </div>
        </form>
      </details>
    </>
  );
}

export function ClientDetailView({ id }: { id: string }) {
  const clients = useClientList();
  const projectList = useProjectList();
  const activity = useActivity("client", id);
  const crm = useCrm();
  const { toast } = useAdmin();
  const c = clients.data.find((x) => x.id === id);
  const projects = useMemo(
    () => projectList.data.filter((p) => p.client_id === id),
    [projectList.data, id],
  );

  if (clients.isPending) return <SkeletonRows rows={6} cols={2} />;
  if (!c) return <Empty>고객을 찾지 못했어요. 삭제됐거나 주소가 잘못됐어요.</Empty>;

  const contract = projects.reduce((sum, p) => sum + Number(p.contract_amount), 0);
  const paid = projects.reduce((sum, p) => sum + Number(p.paid_amount), 0);

  return (
    <>
      <PageHead title={c.company || c.name}>
        <AdminLink className="adm-btn adm-btn-ghost" href="/admin/clients">
          목록
        </AdminLink>
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
                    <AdminLink className="adm-row-link" href={`/admin/projects/${p.id}`}>
                      <span className="adm-row-main">
                        <strong>{p.name}</strong>
                        <span className="adm-muted">
                          {projectTypeLabels[p.type]} · 마감 {fmtDate(p.due_date)} · {formatWon(p.contract_amount)}
                        </span>
                      </span>
                      <Progress value={progressOf(p.taskDone, p.taskTotal)} />
                      <ProjectBadge status={p.status} />
                    </AdminLink>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>아직 프로젝트가 없어요.</Empty>
            )}
            <details className="adm-collapse adm-collapse-inner">
              <summary>이 고객의 프로젝트 추가</summary>
              <NewProjectForm clientId={c.id} />
            </details>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>기록</h2>
            </div>
            <ActivityList entries={activity.data} />
          </section>
        </div>

        <div className="adm-stack-lg">
          <section className="adm-card">
            <h2 className="adm-card-title">고객 정보</h2>
            <form
              key={`${c.id}:${c.name}:${c.company}:${c.email}:${c.phone}:${c.memo}`}
              className="adm-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (await crm.updateClient(c.id, parseForm(clientShape, e.currentTarget))) toast("저장했어요.");
                } catch (err) {
                  toast((err as Error).message, "error");
                }
              }}
            >
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

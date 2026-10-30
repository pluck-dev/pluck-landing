"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { formatWon, projectStatusLabels, projectTypeLabels } from "@/lib/crm/constants";
import { isClosedProject, kstToday, matches, progressOf } from "@/lib/crm/derive";
import {
  parseForm,
  paymentShape,
  projectEditShape,
  projectShape,
  taskShape,
} from "@/lib/crm/validation";
import {
  PAYMENT_LABELS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ProjectStatus,
} from "@/lib/supabase/types";
import { countBy } from "./dashboard";
import { compare, useListState, useProjectList } from "./hooks";
import { useCrm } from "./mutations";
import { useActivity, useAdmin, useTable } from "./store";
import {
  ActivityList,
  AdminLink,
  Empty,
  FilterTabs,
  fmtDate,
  PageHead,
  ProjectBadge,
  Progress,
  SkeletonRows,
  SortTh,
} from "./ui";

type SortKey = "created_at" | "name" | "status" | "progress" | "due_date" | "contract_amount" | "outstanding";

export function ProjectStatusSelect({
  value,
  label,
  onChange,
}: {
  value: ProjectStatus;
  label: string;
  onChange: (s: ProjectStatus) => void;
}) {
  return (
    <select
      className={`adm-status-select adm-ps-${value}`}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value as ProjectStatus)}
    >
      {PROJECT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {projectStatusLabels[s]}
        </option>
      ))}
    </select>
  );
}

/** Shared "new project" form (projects list + client detail). */
export function NewProjectForm({ clientId }: { clientId?: string }) {
  const clients = useTable("clients");
  const crm = useCrm();
  const { toast } = useAdmin();
  if (!clientId && !clients.data?.length) {
    return (
      <p className="adm-muted">
        먼저 <AdminLink href="/admin/clients">고객</AdminLink>을 추가하세요.
      </p>
    );
  }
  return (
    <form
      className="adm-form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        try {
          const values = parseForm(projectShape, form);
          const client = clientId ?? String(new FormData(form).get("client_id") ?? "");
          if (!client) throw new Error("고객을 선택해 주세요.");
          crm.createProject(client, values);
        } catch (err) {
          toast((err as Error).message, "error");
        }
      }}
    >
      {!clientId && (
        <label>
          고객
          <select name="client_id" className="adm-input" required>
            {clients.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company ? `${c.company} (${c.name})` : c.name}
              </option>
            ))}
          </select>
        </label>
      )}
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
  );
}

export function ProjectListView() {
  const { data: all, isPending } = useProjectList();
  const crm = useCrm();
  const list = useListState(PROJECT_STATUSES, { key: "created_at" as SortKey, dir: -1 });
  const counts = useMemo(() => countBy(all, (p) => p.status), [all]);
  const today = kstToday();

  const rows = useMemo(() => {
    const { key, dir } = list.sort;
    const value = (p: (typeof all)[number]) =>
      key === "progress"
        ? progressOf(p.taskDone, p.taskTotal)
        : key === "outstanding"
          ? Math.max(0, Number(p.contract_amount) - Number(p.paid_amount))
          : key === "contract_amount"
            ? Number(p.contract_amount)
            : key === "status"
              ? PROJECT_STATUSES.indexOf(p.status)
              : p[key];
    return all
      .filter(
        (p) =>
          (!list.status || p.status === list.status) &&
          matches(list.deferredQ, p.name, p.client?.name, p.client?.company, p.notes),
      )
      .sort((a, b) => dir * compare(value(a), value(b)));
  }, [all, list.status, list.deferredQ, list.sort]);

  return (
    <>
      <PageHead title="프로젝트 관리">
        <input
          className="adm-input adm-search-input"
          type="search"
          value={list.q}
          onChange={(e) => list.setQ(e.target.value)}
          placeholder="프로젝트, 고객, 노트 검색  ( / )"
          aria-label="프로젝트 검색"
          data-admin-search
        />
      </PageHead>
      <FilterTabs
        current={list.status}
        options={PROJECT_STATUSES.map((s) => [s, projectStatusLabels[s]] as const)}
        counts={counts}
        total={all.length}
        onChange={list.setStatus}
      />

      {isPending ? (
        <SkeletonRows cols={6} />
      ) : rows.length ? (
        <div className="adm-table-wrap">
          <table className="adm-table adm-table-dense">
            <thead>
              <tr>
                <SortTh label="프로젝트" k="name" sort={list.sort} onSort={list.onSort} />
                <SortTh label="상태" k="status" sort={list.sort} onSort={list.onSort} />
                <SortTh label="진행률" k="progress" sort={list.sort} onSort={list.onSort} />
                <SortTh label="마감" k="due_date" sort={list.sort} onSort={list.onSort} />
                <SortTh label="계약" k="contract_amount" sort={list.sort} onSort={list.onSort} className="adm-num" />
                <SortTh label="미수금" k="outstanding" sort={list.sort} onSort={list.onSort} className="adm-num" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const overdue = p.due_date && p.due_date < today && !isClosedProject(p.status);
                return (
                  <tr key={p.id}>
                    <td>
                      <AdminLink href={`/admin/projects/${p.id}`} className="adm-strong-link">
                        {p.name}
                      </AdminLink>
                      <span className="adm-sub">
                        {p.client ? p.client.company || p.client.name : "-"} · {projectTypeLabels[p.type]}
                      </span>
                    </td>
                    <td>
                      <ProjectStatusSelect
                        value={p.status}
                        label={`${p.name} 상태`}
                        onChange={(s) => crm.setProjectStatus(p.id, s)}
                      />
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
        <Empty>
          {list.status || list.deferredQ
            ? "조건에 맞는 프로젝트가 없어요."
            : "아직 프로젝트가 없어요. 문의에서 전환하거나 아래에서 추가하세요."}
        </Empty>
      )}
      {!isPending && <p className="adm-footnote">{rows.length}개 표시</p>}

      <details className="adm-card adm-collapse">
        <summary>새 프로젝트 추가</summary>
        <NewProjectForm />
      </details>
    </>
  );
}

export function ProjectDetailView({ id }: { id: string }) {
  const projects = useTable("projects");
  const clients = useTable("clients");
  const inquiries = useTable("inquiries");
  const tasksQ = useTable("tasks");
  const paymentsQ = useTable("payments");
  const activity = useActivity("project", id);
  const crm = useCrm();
  const { toast } = useAdmin();

  const p = projects.data?.find((x) => x.id === id);
  const tasks = useMemo(() => (tasksQ.data ?? []).filter((t) => t.project_id === id), [tasksQ.data, id]);
  const payments = useMemo(
    () => (paymentsQ.data ?? []).filter((x) => x.project_id === id),
    [paymentsQ.data, id],
  );

  if (projects.isPending) return <SkeletonRows rows={6} cols={2} />;
  if (!p) return <Empty>프로젝트를 찾지 못했어요. 삭제됐거나 주소가 잘못됐어요.</Empty>;

  const client = clients.data?.find((c) => c.id === p.client_id) ?? null;
  const inquiry = p.inquiry_id ? inquiries.data?.find((i) => i.id === p.inquiry_id) : undefined;
  const done = tasks.filter((t) => t.done).length;
  const today = kstToday();
  const contract = Number(p.contract_amount);
  const paid = Number(p.paid_amount);
  const scheduled = payments.reduce((sum, pay) => sum + Number(pay.amount), 0);

  return (
    <>
      <PageHead title={p.name}>
        <ProjectBadge status={p.status} />
        <AdminLink className="adm-btn adm-btn-ghost" href="/admin/projects">
          목록
        </AdminLink>
      </PageHead>

      <section className="adm-kpis adm-kpis-4" aria-label="프로젝트 요약">
        <div className="adm-kpi">
          <span className="adm-kpi-label">진행률</span>
          <strong className="adm-kpi-value">{progressOf(done, tasks.length)}%</strong>
          <span className="adm-muted">
            할 일 {done}/{tasks.length}
          </span>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-label">계약 금액</span>
          <strong className="adm-kpi-value">{formatWon(contract)}</strong>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-label">입금</span>
          <strong className="adm-kpi-value">{formatWon(paid)}</strong>
        </div>
        <div className={`adm-kpi ${contract - paid > 0 ? "adm-kpi-warn" : ""}`}>
          <span className="adm-kpi-label">미수금</span>
          <strong className="adm-kpi-value">{formatWon(Math.max(0, contract - paid))}</strong>
        </div>
      </section>

      <div className="adm-detail">
        <div className="adm-stack-lg">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>할 일</h2>
              <Progress value={progressOf(done, tasks.length)} />
            </div>
            {tasks.length ? (
              <ul className="adm-tasks">
                {tasks.map((task, index) => (
                  <li key={task.id} className={task.done ? "is-done" : undefined}>
                    <button
                      className="adm-check"
                      aria-pressed={task.done}
                      aria-label={`${task.title} ${task.done ? "완료 취소" : "완료"}`}
                      onClick={() => crm.toggleTask(task)}
                    />
                    <span className="adm-task-title">
                      {task.title}
                      {task.due_date && (
                        <span className={!task.done && task.due_date < today ? "adm-overdue" : "adm-muted"}>
                          {" "}
                          · {fmtDate(task.due_date)}
                        </span>
                      )}
                    </span>
                    <span className="adm-task-tools">
                      <button
                        className="adm-icon-btn"
                        disabled={index === 0}
                        aria-label={`${task.title} 위로`}
                        onClick={() => crm.moveTask(task, "up")}
                      >
                        <ArrowUp size={15} aria-hidden="true" />
                      </button>
                      <button
                        className="adm-icon-btn"
                        disabled={index === tasks.length - 1}
                        aria-label={`${task.title} 아래로`}
                        onClick={() => crm.moveTask(task, "down")}
                      >
                        <ArrowDown size={15} aria-hidden="true" />
                      </button>
                      <button
                        className="adm-icon-btn"
                        aria-label={`${task.title} 삭제`}
                        onClick={() => crm.deleteTask(task)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>할 일을 추가하면 진행률이 계산돼요.</Empty>
            )}
            <form
              className="adm-inline-form adm-add-row"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                try {
                  const { title, due_date } = parseForm(taskShape, form);
                  crm.addTask(p.id, title, due_date);
                  form.reset();
                  (form.elements.namedItem("title") as HTMLInputElement | null)?.focus();
                } catch (err) {
                  toast((err as Error).message, "error");
                }
              }}
            >
              <label className="sr-only" htmlFor="task-title">
                새 할 일
              </label>
              <input id="task-title" name="title" className="adm-input" placeholder="새 할 일" required maxLength={200} />
              <label className="sr-only" htmlFor="task-due">
                마감일
              </label>
              <input id="task-due" name="due_date" type="date" className="adm-input adm-input-date" />
              <button className="adm-btn">추가</button>
            </form>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>입금 일정</h2>
              <span className="adm-muted">
                등록 {formatWon(scheduled)} / 계약 {formatWon(contract)}
              </span>
            </div>
            {payments.length ? (
              <div className="adm-table-wrap">
                <table className="adm-table adm-table-tight">
                  <thead>
                    <tr>
                      <th scope="col">구분</th>
                      <th scope="col" className="adm-num">금액</th>
                      <th scope="col">예정일</th>
                      <th scope="col">입금</th>
                      <th scope="col">
                        <span className="sr-only">삭제</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => (
                      <tr key={pay.id}>
                        <td>{pay.label}</td>
                        <td className="adm-num">{formatWon(pay.amount)}</td>
                        <td className={`adm-nowrap ${!pay.paid_at && pay.due_date && pay.due_date < today ? "adm-overdue" : ""}`}>
                          {fmtDate(pay.due_date)}
                        </td>
                        <td>
                          <button
                            className={`adm-btn adm-btn-sm ${pay.paid_at ? "adm-btn-done" : ""}`}
                            onClick={() => crm.setPaymentPaid(pay, !pay.paid_at)}
                          >
                            {pay.paid_at ? `${fmtDate(pay.paid_at)} 입금` : "입금 확인"}
                          </button>
                        </td>
                        <td>
                          <button
                            className="adm-icon-btn"
                            aria-label={`${pay.label} 삭제`}
                            onClick={() => crm.deletePayment(pay)}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>계약금·중도금·잔금 일정을 등록하세요.</Empty>
            )}
            <form
              className="adm-inline-form adm-add-row"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                try {
                  crm.addPayment(p.id, parseForm(paymentShape, form));
                  form.reset();
                } catch (err) {
                  toast((err as Error).message, "error");
                }
              }}
            >
              <label className="sr-only" htmlFor="pay-label">
                구분
              </label>
              <select id="pay-label" name="label" className="adm-input">
                {PAYMENT_LABELS.map((label) => (
                  <option key={label}>{label}</option>
                ))}
              </select>
              <label className="sr-only" htmlFor="pay-amount">
                금액
              </label>
              <input id="pay-amount" name="amount" inputMode="numeric" className="adm-input" placeholder="금액(원)" required />
              <label className="sr-only" htmlFor="pay-due">
                예정일
              </label>
              <input id="pay-due" name="due_date" type="date" className="adm-input adm-input-date" />
              <button className="adm-btn">추가</button>
            </form>
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
            <h2 className="adm-card-title">정보</h2>
            <dl className="adm-dl adm-dl-compact">
              <div>
                <dt>고객</dt>
                <dd>
                  {client ? (
                    <AdminLink href={`/admin/clients/${client.id}`}>{client.company || client.name}</AdminLink>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt>원 문의</dt>
                <dd>
                  {inquiry ? (
                    <AdminLink href={`/admin/inquiries/${inquiry.id}`}>{fmtDate(inquiry.created_at)} 문의</AdminLink>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
            </dl>
            <form
              // Remount when the row changes remotely so defaultValues stay current.
              key={`${p.id}:${p.name}:${p.status}:${p.type}:${p.start_date}:${p.due_date}:${p.contract_amount}:${p.repo_url}:${p.live_url}:${p.notes}`}
              className="adm-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (await crm.updateProject(p.id, parseForm(projectEditShape, e.currentTarget))) {
                    toast("저장했어요.");
                  }
                } catch (err) {
                  toast((err as Error).message, "error");
                }
              }}
            >
              <label className="adm-label">
                프로젝트명
                <input name="name" className="adm-input" defaultValue={p.name} required maxLength={120} />
              </label>
              <div className="adm-pair">
                <label className="adm-label">
                  종류
                  <select name="type" className="adm-input" defaultValue={p.type}>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {projectTypeLabels[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="adm-label">
                  상태
                  <select name="status" className="adm-input" defaultValue={p.status}>
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {projectStatusLabels[s]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="adm-pair">
                <label className="adm-label">
                  시작일
                  <input name="start_date" type="date" className="adm-input" defaultValue={p.start_date ?? ""} />
                </label>
                <label className="adm-label">
                  마감일
                  <input name="due_date" type="date" className="adm-input" defaultValue={p.due_date ?? ""} />
                </label>
              </div>
              <label className="adm-label">
                계약 금액(원)
                <input name="contract_amount" inputMode="numeric" className="adm-input" defaultValue={String(contract)} />
              </label>
              <label className="adm-label">
                저장소 URL
                <input name="repo_url" type="url" className="adm-input" defaultValue={p.repo_url ?? ""} placeholder="https://github.com/…" />
              </label>
              <label className="adm-label">
                라이브 URL
                <input name="live_url" type="url" className="adm-input" defaultValue={p.live_url ?? ""} placeholder="https://" />
              </label>
              <label className="adm-label">
                노트
                <textarea name="notes" className="adm-input" rows={8} defaultValue={p.notes ?? ""} />
              </label>
              <button className="adm-btn adm-btn-primary">저장</button>
            </form>
            {(p.repo_url || p.live_url) && (
              <ul className="adm-links">
                {p.repo_url && (
                  <li>
                    <a href={p.repo_url} target="_blank" rel="noopener noreferrer">
                      저장소 열기
                    </a>
                  </li>
                )}
                {p.live_url && (
                  <li>
                    <a href={p.live_url} target="_blank" rel="noopener noreferrer">
                      라이브 사이트 열기
                    </a>
                  </li>
                )}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

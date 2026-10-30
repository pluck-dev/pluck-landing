import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/crm/auth";
import { formatWon, projectStatusLabels, projectTypeLabels } from "@/lib/crm/constants";
import { getProject, kstToday, progressOf } from "@/lib/crm/queries";
import { PAYMENT_LABELS, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/supabase/types";
import {
  addPayment,
  addTask,
  deletePayment,
  deleteTask,
  moveTask,
  setPaymentPaid,
  toggleTask,
  updateProject,
} from "../../actions";
import { ActivityList, Empty, fmtDate, PageHead, ProjectBadge, Progress } from "../../ui";

export const metadata: Metadata = { title: "프로젝트 상세" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const detail = await getProject(admin, id);
  if (!detail) notFound();
  const { project: p, client, inquiry, tasks, payments, activity } = detail;
  const done = tasks.filter((t) => t.done).length;
  const today = kstToday();
  const contract = Number(p.contract_amount);
  const paid = Number(p.paid_amount);
  const scheduled = payments.reduce((sum, pay) => sum + Number(pay.amount), 0);

  return (
    <>
      <PageHead title={p.name}>
        <ProjectBadge status={p.status} />
        <Link className="adm-btn adm-btn-ghost" href="/admin/projects">
          목록
        </Link>
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
                    <form action={toggleTask}>
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="project_id" value={p.id} />
                      <input type="hidden" name="done" value={task.done ? "false" : "true"} />
                      <button
                        className="adm-check"
                        aria-pressed={task.done}
                        aria-label={`${task.title} ${task.done ? "완료 취소" : "완료"}`}
                      />
                    </form>
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
                      <form action={moveTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="project_id" value={p.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button className="adm-icon-btn" disabled={index === 0} aria-label={`${task.title} 위로`}>
                          <ArrowUp size={15} aria-hidden="true" />
                        </button>
                      </form>
                      <form action={moveTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="project_id" value={p.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          className="adm-icon-btn"
                          disabled={index === tasks.length - 1}
                          aria-label={`${task.title} 아래로`}
                        >
                          <ArrowDown size={15} aria-hidden="true" />
                        </button>
                      </form>
                      <form action={deleteTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="project_id" value={p.id} />
                        <button className="adm-icon-btn" aria-label={`${task.title} 삭제`}>
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>할 일을 추가하면 진행률이 계산돼요.</Empty>
            )}
            <form action={addTask} className="adm-inline-form adm-add-row">
              <input type="hidden" name="project_id" value={p.id} />
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
                          <form action={setPaymentPaid}>
                            <input type="hidden" name="id" value={pay.id} />
                            <input type="hidden" name="project_id" value={p.id} />
                            <input type="hidden" name="paid" value={pay.paid_at ? "false" : "true"} />
                            <button className={`adm-btn adm-btn-sm ${pay.paid_at ? "adm-btn-done" : ""}`}>
                              {pay.paid_at ? `${fmtDate(pay.paid_at)} 입금` : "입금 확인"}
                            </button>
                          </form>
                        </td>
                        <td>
                          <form action={deletePayment}>
                            <input type="hidden" name="id" value={pay.id} />
                            <input type="hidden" name="project_id" value={p.id} />
                            <button className="adm-icon-btn" aria-label={`${pay.label} 삭제`}>
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>계약금·중도금·잔금 일정을 등록하세요.</Empty>
            )}
            <form action={addPayment} className="adm-inline-form adm-add-row">
              <input type="hidden" name="project_id" value={p.id} />
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
            <ActivityList entries={activity} />
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
                    <Link href={`/admin/clients/${client.id}`}>{client.company || client.name}</Link>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt>원 문의</dt>
                <dd>
                  {inquiry ? <Link href={`/admin/inquiries/${inquiry.id}`}>{fmtDate(inquiry.created_at)} 문의</Link> : "-"}
                </dd>
              </div>
            </dl>
            <form action={updateProject} className="adm-stack">
              <input type="hidden" name="id" value={p.id} />
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

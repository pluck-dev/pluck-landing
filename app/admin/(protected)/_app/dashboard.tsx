"use client";

import { useMemo } from "react";
import { formatWon, inquiryStatusLabels, projectStatusLabels, projectTypeLabels } from "@/lib/crm/constants";
import { buildDashboard, kstToday, progressOf } from "@/lib/crm/derive";
import { INQUIRY_STATUSES, PROJECT_STATUSES } from "@/lib/supabase/types";
import { useProjectList } from "./hooks";
import { useTable } from "./store";
import {
  AdminLink,
  Empty,
  fmtDate,
  fmtDateTime,
  InquiryBadge,
  PageHead,
  ProjectBadge,
  Progress,
} from "./ui";

export function DashboardView() {
  const inquiries = useTable("inquiries");
  const projects = useProjectList();
  const loading = inquiries.isPending || projects.isPending;
  const d = useMemo(
    () => buildDashboard(inquiries.data ?? [], projects.data),
    [inquiries.data, projects.data],
  );
  const today = kstToday();

  const kpis: { label: string; value: string; href?: string; tone?: string }[] = [
    { label: "이번 달 문의", value: `${d.monthInquiries}건`, href: "/admin/inquiries" },
    {
      label: "신규 문의 대기",
      value: `${d.newInquiries}건`,
      href: "/admin/inquiries?status=new",
      tone: d.newInquiries ? "alert" : undefined,
    },
    { label: "진행 중 프로젝트", value: `${d.activeProjects}개`, href: "/admin/projects" },
    { label: "수주 금액 합계", value: formatWon(d.booked) },
    { label: "입금 합계", value: formatWon(d.paid) },
    { label: "미수금", value: formatWon(d.outstanding), tone: d.outstanding ? "warn" : undefined },
  ];

  const inquiryCounts = countBy(inquiries.data ?? [], (i) => i.status);
  const projectCounts = countBy(projects.data, (p) => p.status);

  return (
    <>
      <PageHead title="대시보드" />
      <section className="adm-kpis" aria-label="주요 지표">
        {kpis.map((kpi) => {
          const body = (
            <>
              <span className="adm-kpi-label">{kpi.label}</span>
              {loading ? (
                <span className="adm-skel adm-skel-kpi" />
              ) : (
                <strong className="adm-kpi-value">{kpi.value}</strong>
              )}
            </>
          );
          const cls = `adm-kpi ${kpi.tone ? `adm-kpi-${kpi.tone}` : ""}`;
          return kpi.href ? (
            <AdminLink key={kpi.label} href={kpi.href} className={cls}>
              {body}
            </AdminLink>
          ) : (
            <div key={kpi.label} className={cls}>
              {body}
            </div>
          );
        })}
      </section>
      <p className="adm-footnote">
        수주 금액은 계약 단계 이후 프로젝트의 계약 금액 합계, 미수금은 그중 아직 입금 확인되지 않은 금액입니다.
      </p>

      <div className="adm-pipeline" aria-label="상태별 현황">
        <div>
          <span className="adm-muted">문의</span>
          {INQUIRY_STATUSES.map((s) => (
            <AdminLink key={s} href={`/admin/inquiries?status=${s}`} className="adm-pipe">
              {inquiryStatusLabels[s]} <b>{inquiryCounts[s] ?? 0}</b>
            </AdminLink>
          ))}
        </div>
        <div>
          <span className="adm-muted">프로젝트</span>
          {PROJECT_STATUSES.map((s) => (
            <AdminLink key={s} href={`/admin/projects?status=${s}`} className="adm-pipe">
              {projectStatusLabels[s]} <b>{projectCounts[s] ?? 0}</b>
            </AdminLink>
          ))}
        </div>
      </div>

      <div className="adm-grid-2">
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>최근 문의</h2>
            <AdminLink href="/admin/inquiries">전체 보기</AdminLink>
          </div>
          {loading ? (
            <span className="adm-skel adm-skel-block" />
          ) : d.recentInquiries.length ? (
            <ul className="adm-rows">
              {d.recentInquiries.map((inq) => (
                <li key={inq.id}>
                  <AdminLink href={`/admin/inquiries/${inq.id}`} className="adm-row-link">
                    <span className="adm-row-main">
                      <strong>{inq.company || inq.name}</strong>
                      <span className="adm-muted">
                        {projectTypeLabels[inq.project_type]} · {fmtDateTime(inq.created_at)}
                      </span>
                    </span>
                    <InquiryBadge status={inq.status} />
                  </AdminLink>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>아직 접수된 문의가 없어요.</Empty>
          )}
        </section>

        <section className="adm-card">
          <div className="adm-card-head">
            <h2>마감 임박 프로젝트</h2>
            <AdminLink href="/admin/projects">전체 보기</AdminLink>
          </div>
          {loading ? (
            <span className="adm-skel adm-skel-block" />
          ) : d.dueSoon.length ? (
            <ul className="adm-rows">
              {d.dueSoon.map((p) => (
                <li key={p.id}>
                  <AdminLink href={`/admin/projects/${p.id}`} className="adm-row-link">
                    <span className="adm-row-main">
                      <strong>{p.name}</strong>
                      <span className={p.due_date && p.due_date < today ? "adm-overdue" : "adm-muted"}>
                        마감 {fmtDate(p.due_date)}
                        {p.due_date && p.due_date < today ? " · 지남" : ""}
                      </span>
                    </span>
                    <Progress value={progressOf(p.taskDone, p.taskTotal)} />
                    <ProjectBadge status={p.status} />
                  </AdminLink>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>2주 안에 마감되는 프로젝트가 없어요.</Empty>
          )}
        </section>
      </div>
    </>
  );
}

export function countBy<T, K extends string>(rows: T[], key: (row: T) => K) {
  const out: Partial<Record<K, number>> = {};
  for (const row of rows) {
    const k = key(row);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

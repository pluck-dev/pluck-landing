import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/crm/auth";
import { formatWon, projectTypeLabels } from "@/lib/crm/constants";
import { getDashboard, kstToday, progressOf } from "@/lib/crm/queries";
import { Empty, fmtDate, fmtDateTime, InquiryBadge, PageHead, ProjectBadge, Progress } from "./ui";

export const metadata: Metadata = { title: "대시보드" };

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const d = await getDashboard(admin);
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

  return (
    <>
      <PageHead title="대시보드" />
      <section className="adm-kpis" aria-label="주요 지표">
        {kpis.map((kpi) => {
          const body = (
            <>
              <span className="adm-kpi-label">{kpi.label}</span>
              <strong className="adm-kpi-value">{kpi.value}</strong>
            </>
          );
          return kpi.href ? (
            <Link key={kpi.label} href={kpi.href} className={`adm-kpi ${kpi.tone ? `adm-kpi-${kpi.tone}` : ""}`}>
              {body}
            </Link>
          ) : (
            <div key={kpi.label} className={`adm-kpi ${kpi.tone ? `adm-kpi-${kpi.tone}` : ""}`}>
              {body}
            </div>
          );
        })}
      </section>
      <p className="adm-footnote">
        수주 금액은 계약 단계 이후 프로젝트의 계약 금액 합계, 미수금은 그중 아직 입금 확인되지 않은 금액입니다.
      </p>

      <div className="adm-grid-2">
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>최근 문의</h2>
            <Link href="/admin/inquiries">전체 보기</Link>
          </div>
          {d.recentInquiries.length ? (
            <ul className="adm-rows">
              {d.recentInquiries.map((inq) => (
                <li key={inq.id}>
                  <Link href={`/admin/inquiries/${inq.id}`} className="adm-row-link">
                    <span className="adm-row-main">
                      <strong>{inq.company || inq.name}</strong>
                      <span className="adm-muted">
                        {projectTypeLabels[inq.project_type]} · {fmtDateTime(inq.created_at)}
                      </span>
                    </span>
                    <InquiryBadge status={inq.status} />
                  </Link>
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
            <Link href="/admin/projects">전체 보기</Link>
          </div>
          {d.dueSoon.length ? (
            <ul className="adm-rows">
              {d.dueSoon.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/projects/${p.id}`} className="adm-row-link">
                    <span className="adm-row-main">
                      <strong>{p.name}</strong>
                      <span className={p.due_date && p.due_date < today ? "adm-overdue" : "adm-muted"}>
                        마감 {fmtDate(p.due_date)}
                        {p.due_date && p.due_date < today ? " · 지남" : ""}
                      </span>
                    </span>
                    <Progress value={progressOf(p.taskDone, p.taskTotal)} />
                    <ProjectBadge status={p.status} />
                  </Link>
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

import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/crm/auth";
import {
  budgetLabels,
  inquiryStatusLabels,
  projectTypeLabels,
} from "@/lib/crm/constants";
import { listInquiries } from "@/lib/crm/queries";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/supabase/types";
import { Empty, FilterTabs, fmtDateTime, InquiryBadge, PageHead } from "../ui";

export const metadata: Metadata = { title: "문의 관리" };

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const status = INQUIRY_STATUSES.includes(params.status as InquiryStatus)
    ? (params.status as InquiryStatus)
    : undefined;
  const q = typeof params.q === "string" ? params.q.slice(0, 80) : undefined;
  const inquiries = await listInquiries(admin, { status, q });

  return (
    <>
      <PageHead title="문의 관리">
        <form className="adm-search" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            className="adm-input"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="이름, 회사, 이메일, 내용 검색"
            aria-label="문의 검색"
          />
          <button className="adm-btn">검색</button>
        </form>
      </PageHead>
      <FilterTabs
        base="/admin/inquiries"
        current={status}
        options={INQUIRY_STATUSES.map((s) => [s, inquiryStatusLabels[s]])}
        extra={{ q }}
      />

      {inquiries.length ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">접수</th>
                <th scope="col">고객</th>
                <th scope="col">종류</th>
                <th scope="col">예산</th>
                <th scope="col">상태</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td className="adm-nowrap adm-muted">{fmtDateTime(inq.created_at)}</td>
                  <td>
                    <Link href={`/admin/inquiries/${inq.id}`} className="adm-strong-link">
                      {inq.company || inq.name}
                    </Link>
                    <span className="adm-sub">
                      {inq.company ? `${inq.name} · ` : ""}
                      {inq.email}
                    </span>
                  </td>
                  <td>{projectTypeLabels[inq.project_type]}</td>
                  <td className="adm-nowrap">{inq.budget ? budgetLabels[inq.budget] : "-"}</td>
                  <td>
                    <InquiryBadge status={inq.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{q || status ? "조건에 맞는 문의가 없어요." : "아직 접수된 문의가 없어요."}</Empty>
      )}
    </>
  );
}

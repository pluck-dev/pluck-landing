import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/crm/auth";
import { listClients } from "@/lib/crm/queries";
import { createClient } from "../actions";
import { Empty, fmtDate, PageHead } from "../ui";

export const metadata: Metadata = { title: "고객 관리" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 80) : undefined;
  const clients = await listClients(admin, q);

  return (
    <>
      <PageHead title="고객 관리">
        <form className="adm-search" role="search">
          <input
            className="adm-input"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="이름, 회사, 이메일 검색"
            aria-label="고객 검색"
          />
          <button className="adm-btn">검색</button>
        </form>
      </PageHead>

      {clients.length ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">고객</th>
                <th scope="col">연락처</th>
                <th scope="col" className="adm-num">프로젝트</th>
                <th scope="col">등록</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/clients/${c.id}`} className="adm-strong-link">
                      {c.company || c.name}
                    </Link>
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
        <Empty>{q ? "검색 결과가 없어요." : "아직 고객이 없어요. 문의를 프로젝트로 전환하면 자동으로 추가돼요."}</Empty>
      )}

      <details className="adm-card adm-collapse">
        <summary>고객 직접 추가</summary>
        <form action={createClient} className="adm-form-grid">
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

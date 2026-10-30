"use client";

import { useMemo } from "react";
import {
  budgetLabels,
  formatBytes,
  inquiryStatusLabels,
  projectTypeLabels,
  timelineLabels,
} from "@/lib/crm/constants";
import { matches } from "@/lib/crm/derive";
import { memoShape, parseForm } from "@/lib/crm/validation";
import { INQUIRY_STATUSES, type InquiryRow, type InquiryStatus } from "@/lib/supabase/types";
import { countBy } from "./dashboard";
import { compare, useListState } from "./hooks";
import { useCrm } from "./mutations";
import { useActivity, useAdmin, useFiles, useTable } from "./store";
import {
  ActivityList,
  AdminLink,
  Empty,
  FilterTabs,
  fmtDateTime,
  InquiryBadge,
  PageHead,
  ProjectBadge,
  SkeletonRows,
  SortTh,
} from "./ui";

type SortKey = "created_at" | "customer" | "project_type" | "budget" | "status";
const budgetRank = { under_3m: 1, "3m_10m": 2, "10m_30m": 3, over_30m: 4, undecided: 0 } as const;

export function InquiryListView() {
  const { data, isPending } = useTable("inquiries");
  const crm = useCrm();
  const list = useListState(INQUIRY_STATUSES, { key: "created_at" as SortKey, dir: -1 });
  const all = useMemo(() => data ?? [], [data]);
  const counts = useMemo(() => countBy(all, (i) => i.status), [all]);

  const rows = useMemo(() => {
    const { key, dir } = list.sort;
    const value = (i: InquiryRow) =>
      key === "customer"
        ? i.company || i.name
        : key === "budget"
          ? (i.budget ? budgetRank[i.budget] : null)
          : key === "status"
            ? INQUIRY_STATUSES.indexOf(i.status)
            : i[key];
    return all
      .filter(
        (i) =>
          (!list.status || i.status === list.status) &&
          matches(list.deferredQ, i.name, i.company, i.email, i.phone, i.message, i.admin_memo),
      )
      .sort((a, b) => dir * compare(value(a), value(b)));
  }, [all, list.status, list.deferredQ, list.sort]);

  return (
    <>
      <PageHead title="문의 관리">
        <input
          className="adm-input adm-search-input"
          type="search"
          value={list.q}
          onChange={(e) => list.setQ(e.target.value)}
          placeholder="이름, 회사, 이메일, 내용 검색  ( / )"
          aria-label="문의 검색"
          data-admin-search
        />
      </PageHead>
      <FilterTabs
        current={list.status}
        options={INQUIRY_STATUSES.map((s) => [s, inquiryStatusLabels[s]] as const)}
        counts={counts}
        total={all.length}
        onChange={list.setStatus}
      />

      {isPending ? (
        <SkeletonRows cols={5} />
      ) : rows.length ? (
        <div className="adm-table-wrap">
          <table className="adm-table adm-table-dense">
            <thead>
              <tr>
                <SortTh label="접수" k="created_at" sort={list.sort} onSort={list.onSort} />
                <SortTh label="고객" k="customer" sort={list.sort} onSort={list.onSort} />
                <SortTh label="종류" k="project_type" sort={list.sort} onSort={list.onSort} />
                <SortTh label="예산" k="budget" sort={list.sort} onSort={list.onSort} />
                <SortTh label="상태" k="status" sort={list.sort} onSort={list.onSort} />
              </tr>
            </thead>
            <tbody>
              {rows.map((inq) => (
                <tr key={inq.id} className={inq.status === "new" ? "is-new" : undefined}>
                  <td className="adm-nowrap adm-muted">{fmtDateTime(inq.created_at)}</td>
                  <td>
                    <AdminLink href={`/admin/inquiries/${inq.id}`} className="adm-strong-link">
                      {inq.company || inq.name}
                    </AdminLink>
                    <span className="adm-sub">
                      {inq.company ? `${inq.name} · ` : ""}
                      {inq.email}
                    </span>
                  </td>
                  <td>{projectTypeLabels[inq.project_type]}</td>
                  <td className="adm-nowrap">{inq.budget ? budgetLabels[inq.budget] : "-"}</td>
                  <td>
                    <StatusSelect
                      value={inq.status}
                      label={`${inq.company || inq.name} 상태`}
                      onChange={(s) => crm.setInquiryStatus(inq.id, s)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{list.deferredQ || list.status ? "조건에 맞는 문의가 없어요." : "아직 접수된 문의가 없어요."}</Empty>
      )}
      {!isPending && <p className="adm-footnote">{rows.length}건 표시</p>}
    </>
  );
}

function StatusSelect({
  value,
  label,
  onChange,
}: {
  value: InquiryStatus;
  label: string;
  onChange: (s: InquiryStatus) => void;
}) {
  return (
    <select
      className={`adm-status-select adm-st-${value}`}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value as InquiryStatus)}
    >
      {INQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {inquiryStatusLabels[s]}
        </option>
      ))}
    </select>
  );
}

export function InquiryDetailView({ id }: { id: string }) {
  const { data, isPending } = useTable("inquiries");
  const projectsQ = useTable("projects");
  const inq = data?.find((i) => i.id === id);
  const activity = useActivity("inquiry", id);
  const files = useFiles(inq);
  const crm = useCrm();
  const { toast } = useAdmin();

  if (isPending) return <SkeletonRows rows={6} cols={2} />;
  if (!inq) return <Empty>문의를 찾지 못했어요. 삭제됐거나 주소가 잘못됐어요.</Empty>;

  const projects = (projectsQ.data ?? []).filter((p) => p.inquiry_id === id);
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
        <AdminLink className="adm-btn adm-btn-ghost" href="/admin/inquiries">
          목록
        </AdminLink>
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

            {inq.attachments.length > 0 && (
              <>
                <h3 className="adm-h3">첨부파일</h3>
                <ul className="adm-links">
                  {(files.data ?? inq.attachments.map((a) => ({ name: a.name, size: a.size, url: undefined }))).map(
                    (file) => (
                      <li key={file.name}>
                        {file.url ? (
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            {file.name}
                          </a>
                        ) : (
                          <span>
                            {file.name}
                            {file.url === null ? " (링크를 만들지 못했어요)" : ""}
                          </span>
                        )}{" "}
                        <span className="adm-muted">{formatBytes(file.size)}</span>
                      </li>
                    ),
                  )}
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
            <ActivityList entries={activity.data} />
          </section>
        </div>

        <div className="adm-stack-lg">
          <section className="adm-card">
            <h2 className="adm-card-title">상태</h2>
            <StatusSelect
              value={inq.status}
              label="상태"
              onChange={(s) => crm.setInquiryStatus(inq.id, s)}
            />
          </section>

          <section className="adm-card">
            <h2 className="adm-card-title">메모</h2>
            <form
              key={inq.id}
              className="adm-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const { admin_memo } = parseForm(memoShape, e.currentTarget);
                  if (await crm.saveInquiryMemo(inq.id, admin_memo)) toast("메모를 저장했어요.");
                } catch (err) {
                  toast((err as Error).message, "error");
                }
              }}
            >
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
                    <AdminLink className="adm-row-link" href={`/admin/projects/${p.id}`}>
                      <strong>{p.name}</strong>
                      <ProjectBadge status={p.status} />
                    </AdminLink>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="adm-stack">
                <p className="adm-muted">
                  고객(같은 이메일이 있으면 그 고객)과 기획 단계 프로젝트를 만들고, 문의 상태를
                  &lsquo;수주&rsquo;로 바꿔요.
                </p>
                <button className="adm-btn adm-btn-primary" onClick={() => crm.convertInquiry(inq)}>
                  프로젝트로 전환
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

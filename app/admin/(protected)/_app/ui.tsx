"use client";

import { navigate, usePrefetch } from "./store";
import {
  inquiryStatusLabels,
  projectStatusLabels,
} from "@/lib/crm/constants";
import type {
  ActivityLogRow,
  InquiryStatus,
  ProjectStatus,
} from "@/lib/supabase/types";

const dateFmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dateTimeFmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function fmtDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = value.length === 10 ? new Date(`${value}T00:00:00+09:00`) : new Date(value);
  return dateFmt.format(d).replace(/\.\s?$/, "");
}

export function fmtDateTime(value: string) {
  return dateTimeFmt.format(new Date(value));
}

export function PageHead({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="adm-head">
      <h1>{title}</h1>
      {children && <div className="adm-head-actions">{children}</div>}
    </header>
  );
}

export function InquiryBadge({ status }: { status: InquiryStatus }) {
  return <span className={`adm-badge adm-st-${status}`}>{inquiryStatusLabels[status]}</span>;
}

export function ProjectBadge({ status }: { status: ProjectStatus }) {
  return <span className={`adm-badge adm-ps-${status}`}>{projectStatusLabels[status]}</span>;
}

export function Progress({ value }: { value: number }) {
  return (
    <span className="adm-progress" role="img" aria-label={`진행률 ${value}%`}>
      <span className="adm-progress-bar">
        <span style={{ width: `${value}%` }} />
      </span>
      <span className="adm-progress-num">{value}%</span>
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="adm-empty">{children}</p>;
}

/** Status filter chips with live counts; state lives in the URL (?status=). */
export function FilterTabs<T extends string>({
  current,
  options,
  counts,
  total,
  onChange,
}: {
  current?: T;
  options: readonly (readonly [T, string])[];
  counts: Partial<Record<T, number>>;
  total: number;
  onChange: (value?: T) => void;
}) {
  return (
    <nav className="adm-tabs" aria-label="상태 필터">
      <button type="button" aria-current={!current ? "page" : undefined} onClick={() => onChange()}>
        전체 <span className="adm-count">{total}</span>
      </button>
      {options.map(([value, label]) => (
        <button
          type="button"
          key={value}
          aria-current={current === value ? "page" : undefined}
          onClick={() => onChange(value)}
        >
          {label} <span className="adm-count">{counts[value] ?? 0}</span>
        </button>
      ))}
    </nav>
  );
}

/**
 * In-app link: plain <a> (cmd/ctrl-click and middle-click still open a tab), but a
 * normal click is a client-side history push — no server round trip. Hover
 * prefetches the detail's activity/attachments.
 */
export function AdminLink({
  href,
  children,
  className,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const prefetch = usePrefetch();
  return (
    <a
      {...rest}
      href={href}
      className={className}
      onMouseEnter={() => prefetch(href)}
      onFocus={() => prefetch(href)}
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

export function SortTh<K extends string>({
  label,
  k,
  sort,
  onSort,
  className,
}: {
  label: string;
  k: K;
  sort: { key: K; dir: 1 | -1 };
  onSort: (key: K) => void;
  className?: string;
}) {
  const active = sort.key === k;
  return (
    <th
      scope="col"
      className={className}
      aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
    >
      <button type="button" className="adm-sort" onClick={() => onSort(k)}>
        {label}
        <span aria-hidden="true">{active ? (sort.dir === 1 ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );
}

export function SkeletonRows({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="adm-table-wrap" aria-busy="true" aria-label="불러오는 중">
      <table className="adm-table">
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  <span className="adm-skel" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const actionLabels: Record<string, string> = {
  created: "생성",
  updated: "수정",
  deleted: "삭제",
  status_changed: "상태 변경",
  memo_updated: "메모 수정",
  converted: "프로젝트로 전환",
  completed: "완료 처리",
  reopened: "완료 취소",
  marked_paid: "입금 확인",
  marked_unpaid: "입금 취소",
};

const entityLabels: Record<string, string> = {
  inquiry: "문의",
  client: "고객",
  project: "프로젝트",
  task: "할 일",
  payment: "입금",
};

function describe(entry: ActivityLogRow) {
  const detail = (entry.detail ?? {}) as Record<string, unknown>;
  const parts: string[] = [];
  if (entry.action === "status_changed" || entry.action === "converted") {
    const from = detail.from as string | undefined;
    const to = detail.to as string | undefined;
    const label = (v?: string) =>
      v
        ? (inquiryStatusLabels as Record<string, string>)[v] ??
          (projectStatusLabels as Record<string, string>)[v] ??
          v
        : "-";
    if (to) parts.push(`${label(from)} → ${label(to)}`);
  }
  if (typeof detail.title === "string") parts.push(detail.title);
  if (typeof detail.label === "string") parts.push(detail.label);
  return parts.join(" · ");
}

export function ActivityList({ entries }: { entries?: ActivityLogRow[] }) {
  if (!entries) return <span className="adm-skel adm-skel-block" aria-label="불러오는 중" />;
  if (!entries.length) return <Empty>기록이 아직 없어요.</Empty>;
  return (
    <ol className="adm-activity">
      {entries.map((entry) => (
        <li key={entry.id}>
          <time dateTime={entry.created_at}>{fmtDateTime(entry.created_at)}</time>
          <span>
            {entityLabels[entry.entity] ?? entry.entity} {actionLabels[entry.action] ?? entry.action}
            {describe(entry) && <em> {describe(entry)}</em>}
          </span>
          <span className="adm-muted">{entry.actor.startsWith("public:") ? "문의 폼" : entry.actor}</span>
        </li>
      ))}
    </ol>
  );
}

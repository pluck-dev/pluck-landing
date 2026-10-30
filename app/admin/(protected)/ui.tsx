import Link from "next/link";
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

export function FilterTabs({
  base,
  current,
  options,
  extra,
}: {
  base: string;
  current?: string;
  options: [string, string][];
  extra?: Record<string, string | undefined>;
}) {
  const href = (value?: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    for (const [key, v] of Object.entries(extra ?? {})) if (v) params.set(key, v);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };
  return (
    <nav className="adm-tabs" aria-label="상태 필터">
      <Link href={href()} aria-current={!current ? "page" : undefined}>
        전체
      </Link>
      {options.map(([value, label]) => (
        <Link key={value} href={href(value)} aria-current={current === value ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
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

export function ActivityList({ entries }: { entries: ActivityLogRow[] }) {
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

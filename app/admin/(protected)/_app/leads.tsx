"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Globe, Mail, MessageSquare, Phone } from "lucide-react";
import { leadKindLabels, leadStatusLabels } from "@/lib/crm/constants";
import { matches } from "@/lib/crm/derive";
import { memoShape, parseForm } from "@/lib/crm/validation";
import {
  LEAD_KINDS,
  LEAD_STATUSES,
  type LeadKind,
  type LeadRow,
  type LeadStatus,
} from "@/lib/supabase/types";
import { countBy } from "./dashboard";
import { compare, useListState } from "./hooks";
import { useCrm } from "./mutations";
import { useAdmin, useTable } from "./store";
import { Empty, FilterTabs, PageHead, SkeletonRows, SortTh } from "./ui";

type SortKey = "quality" | "freshness" | "posted_at" | "created_at" | "status";
const QUALITIES = ["상", "중", "하"] as const;
const qualityRank: Record<string, number> = { 상: 3, 중: 2, 하: 1 };
const freshRank: Record<string, number> = { A: 3, B: 2, C: 1 };
const qualityClass: Record<string, string> = { 상: "hi", 중: "mid", 하: "lo" };

export function LeadListView() {
  const { data, isPending } = useTable("leads");
  const crm = useCrm();
  const { toast } = useAdmin();
  const list = useListState(LEAD_STATUSES, { key: "quality" as SortKey, dir: -1 });
  const [kind, setKind] = useState<LeadKind>("lead");
  const [campaign, setCampaign] = useState("");
  const [quality, setQuality] = useState("");
  const [contactOnly, setContactOnly] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const all = useMemo(() => data ?? [], [data]);
  const campaigns = useMemo(() => [...new Set(all.map((l) => l.campaign))].sort(), [all]);
  const kindCounts = useMemo(() => countBy(all, (l) => l.kind), [all]);
  // Status chips count within the other filters, so the numbers match what a click shows.
  const scoped = useMemo(
    () =>
      all.filter(
        (l) =>
          l.kind === kind &&
          (!campaign || l.campaign === campaign) &&
          (!quality || l.quality === quality) &&
          (!contactOnly || hasContact(l)) &&
          matches(
            list.deferredQ,
            l.company,
            l.title,
            l.summary,
            l.source,
            l.category,
            l.system_type,
            l.region,
            l.agency,
            l.phone,
            l.email,
            l.website,
            l.memo,
          ),
      ),
    [all, kind, campaign, quality, contactOnly, list.deferredQ],
  );
  const counts = useMemo(() => countBy(scoped, (l) => l.status), [scoped]);

  const rows = useMemo(() => {
    const { key, dir } = list.sort;
    const value = (l: LeadRow) =>
      key === "quality"
        ? (qualityRank[l.quality ?? ""] ?? null)
        : key === "freshness"
          ? (freshRank[l.freshness ?? ""] ?? null)
          : key === "status"
            ? LEAD_STATUSES.indexOf(l.status)
            : l[key];
    const tie = (a: LeadRow, b: LeadRow) =>
      (qualityRank[b.quality ?? ""] ?? 0) - (qualityRank[a.quality ?? ""] ?? 0) ||
      (freshRank[b.freshness ?? ""] ?? 0) - (freshRank[a.freshness ?? ""] ?? 0) ||
      compare(b.posted_at, a.posted_at);
    return scoped
      .filter((l) => !list.status || l.status === list.status)
      .sort((a, b) => {
        const va = value(a);
        const vb = value(b);
        // Empty values stay at the bottom in both directions.
        if (va == null || vb == null) return compare(va, vb) || tie(a, b);
        return dir * compare(va, vb) || tie(a, b);
      });
  }, [scoped, list.status, list.sort]);

  const cols = 10;
  return (
    <>
      <PageHead title="영업 리드">
        <input
          className="adm-input adm-search-input"
          type="search"
          value={list.q}
          onChange={(e) => list.setQ(e.target.value)}
          placeholder="회사, 내용, 제작사, 지역, 연락처, 메모 검색  ( / )"
          aria-label="리드 검색"
          data-admin-search
        />
        <select
          className="adm-input adm-input-auto"
          value={kind}
          aria-label="구분"
          onChange={(e) => setKind(e.target.value as LeadKind)}
        >
          {LEAD_KINDS.map((k) => (
            <option key={k} value={k}>
              {leadKindLabels[k]} {kindCounts[k] ?? 0}
            </option>
          ))}
        </select>
        <select
          className="adm-input adm-input-auto"
          value={campaign}
          aria-label="캠페인"
          onChange={(e) => setCampaign(e.target.value)}
        >
          <option value="">캠페인 전체</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="adm-input adm-input-auto"
          value={quality}
          aria-label="품질"
          onChange={(e) => setQuality(e.target.value)}
        >
          <option value="">품질 전체</option>
          {QUALITIES.map((q) => (
            <option key={q} value={q}>
              품질 {q}
            </option>
          ))}
        </select>
        <label className="adm-check-label">
          <input type="checkbox" checked={contactOnly} onChange={(e) => setContactOnly(e.target.checked)} />
          연락처 있음
        </label>
      </PageHead>
      <FilterTabs
        current={list.status}
        options={LEAD_STATUSES.map((s) => [s, leadStatusLabels[s]] as const)}
        counts={counts}
        total={scoped.length}
        onChange={list.setStatus}
      />

      {isPending ? (
        <SkeletonRows cols={6} />
      ) : rows.length ? (
        <div className="adm-table-wrap">
          <table className="adm-table adm-table-dense adm-leads">
            <thead>
              <tr>
                <SortTh label="품질" k="quality" sort={list.sort} onSort={list.onSort} />
                <SortTh label="최신도" k="freshness" sort={list.sort} onSort={list.onSort} />
                <th scope="col">내용</th>
                <th scope="col">연락처</th>
                <th scope="col">지역</th>
                <th scope="col">예산</th>
                <SortTh label="게시" k="posted_at" sort={list.sort} onSort={list.onSort} />
                <SortTh label="상태" k="status" sort={list.sort} onSort={list.onSort} />
                <th scope="col">메모</th>
                <th scope="col">
                  <span className="sr-only">원문</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <LeadRows
                  key={l.id}
                  lead={l}
                  cols={cols}
                  editing={editing === l.id}
                  onEdit={() => setEditing(editing === l.id ? null : l.id)}
                  onStatus={(s) => crm.setLeadStatus(l.id, s)}
                  onSaveMemo={async (form) => {
                    try {
                      const { admin_memo } = parseForm(memoShape, form);
                      if (await crm.saveLeadMemo(l.id, admin_memo)) {
                        toast("메모를 저장했어요.");
                        setEditing(null);
                      }
                    } catch (err) {
                      toast((err as Error).message, "error");
                    }
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>
          {list.deferredQ || list.status || campaign || quality || contactOnly
            ? "조건에 맞는 리드가 없어요."
            : "아직 가져온 리드가 없어요."}
        </Empty>
      )}
      {!isPending && <p className="adm-footnote">{rows.length}건 표시</p>}
    </>
  );
}

function LeadRows({
  lead: l,
  cols,
  editing,
  onEdit,
  onStatus,
  onSaveMemo,
}: {
  lead: LeadRow;
  cols: number;
  editing: boolean;
  onEdit: () => void;
  onStatus: (s: LeadStatus) => void;
  onSaveMemo: (form: HTMLFormElement) => void;
}) {
  const label = l.company || l.title || l.summary || "리드";
  const meta = [l.source, l.category, l.system_type, l.agency && `제작사 ${l.agency}`]
    .filter(Boolean)
    .join(" · ");
  return (
    <>
      <tr className={l.status === "new" && l.kind === "lead" ? "is-new" : undefined}>
        <td>
          {l.quality ? (
            <span className={`adm-badge adm-q-${qualityClass[l.quality] ?? "lo"}`}>{l.quality}</span>
          ) : (
            <span className="adm-muted">-</span>
          )}
        </td>
        <td className="adm-muted">{l.freshness ?? "-"}</td>
        <td className="adm-lead-body">
          {(l.company || l.title) && <strong>{l.company || l.title}</strong>}
          {l.company && l.title && l.title !== l.company && <span className="adm-sub">{l.title}</span>}
          {l.summary && <span className={l.company || l.title ? "adm-sub" : undefined}>{l.summary}</span>}
          {meta && <span className="adm-sub">{meta}</span>}
          {l.signals.length > 0 && <span className="adm-sub">징후 · {l.signals.join(", ")}</span>}
          {l.memo && !editing && <span className="adm-sub adm-lead-memo">메모 · {l.memo}</span>}
        </td>
        <td className="adm-lead-contact">
          {l.phone && (
            <a href={`tel:${l.phone.replace(/[^0-9+]/g, "")}`} title="전화 걸기">
              <Phone size={13} aria-hidden="true" />
              {l.phone}
            </a>
          )}
          {l.email && (
            <a href={`mailto:${l.email}`} title="메일 쓰기 (광고성 메일은 사전 동의 필요)">
              <Mail size={13} aria-hidden="true" />
              {l.email}
            </a>
          )}
          {l.website && (
            <a href={l.website} target="_blank" rel="noopener noreferrer nofollow" title={l.website}>
              <Globe size={13} aria-hidden="true" />
              {l.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
            </a>
          )}
          {l.contact_form_url && (
            <a href={l.contact_form_url} target="_blank" rel="noopener noreferrer nofollow" title={l.contact_form_url}>
              <MessageSquare size={13} aria-hidden="true" />
              문의 폼
            </a>
          )}
          {!hasContact(l) && <span className="adm-muted">-</span>}
        </td>
        <td className="adm-nowrap">{l.region ?? "-"}</td>
        <td className="adm-nowrap">{l.budget ?? "-"}</td>
        <td className="adm-nowrap">
          {l.posted_at ?? "-"}
          {l.recruit_status && (
            <span className={`adm-sub ${l.recruit_status === "모집 중" ? "adm-lead-open" : ""}`}>
              {l.recruit_status}
            </span>
          )}
        </td>
        <td>
          <select
            className={`adm-status-select adm-st-${l.status}`}
            value={l.status}
            aria-label={`${label} 상태`}
            onChange={(e) => onStatus(e.target.value as LeadStatus)}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {leadStatusLabels[s]}
              </option>
            ))}
          </select>
        </td>
        <td>
          <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" aria-expanded={editing} onClick={onEdit}>
            {l.memo ? "수정" : "메모"}
          </button>
        </td>
        <td>
          {l.url ? (
            <a
              className="adm-icon-btn"
              href={l.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`${label} 원문 열기`}
              title={l.url}
            >
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : null}
        </td>
      </tr>
      {editing && (
        <tr className="adm-lead-edit">
          <td colSpan={cols}>
            <form
              key={`${l.id}-${l.memo ?? ""}`}
              className="adm-inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                onSaveMemo(e.currentTarget);
              }}
            >
              <label className="sr-only" htmlFor={`memo-${l.id}`}>
                {label} 메모
              </label>
              <textarea
                id={`memo-${l.id}`}
                name="admin_memo"
                className="adm-input"
                rows={2}
                defaultValue={l.memo ?? ""}
                placeholder="연락 방법, 보낸 내용, 답장 여부"
                autoFocus
              />
              <button className="adm-btn adm-btn-sm adm-btn-primary">저장</button>
              <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={onEdit}>
                취소
              </button>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

function hasContact(l: LeadRow) {
  return Boolean(l.phone || l.email || l.contact_form_url);
}

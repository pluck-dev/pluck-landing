"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  buildClientList,
  buildProjectList,
  type ClientListItem,
  type ProjectListItem,
} from "@/lib/crm/derive";
import { navigate, useTable } from "./store";

/** Derived project list (client + task counts) from the cached tables. */
export function useProjectList(): { data: ProjectListItem[]; isPending: boolean } {
  const projects = useTable("projects");
  const clients = useTable("clients");
  const tasks = useTable("tasks");
  const data = useMemo(
    () => buildProjectList(projects.data ?? [], clients.data ?? [], tasks.data ?? []),
    [projects.data, clients.data, tasks.data],
  );
  return { data, isPending: projects.isPending || clients.isPending || tasks.isPending };
}

export function useClientList(): { data: ClientListItem[]; isPending: boolean } {
  const clients = useTable("clients");
  const projects = useTable("projects");
  const data = useMemo(
    () => buildClientList(clients.data ?? [], projects.data ?? []),
    [clients.data, projects.data],
  );
  return { data, isPending: clients.isPending || projects.isPending };
}

/**
 * List view state: status filter lives in the URL (?status=, so dashboard links
 * and back/forward work); search text and sort are local and instant. The URL
 * mirrors ?q= with replaceState so a reload keeps the search.
 */
export function useListState<S extends string, K extends string>(
  statuses: readonly S[],
  defaultSort: { key: K; dir: 1 | -1 },
) {
  const pathname = usePathname();
  const params = useSearchParams();
  const rawStatus = params.get("status");
  const status = statuses.includes(rawStatus as S) ? (rawStatus as S) : undefined;
  const [q, setQState] = useState(() => params.get("q") ?? "");
  const deferredQ = useDeferredValue(q.trim());
  const [sort, setSort] = useState(defaultSort);

  const write = (next: { status?: S; q?: string }) => {
    const p = new URLSearchParams();
    if (next.status) p.set("status", next.status);
    if (next.q) p.set("q", next.q);
    const qs = p.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname, true);
  };

  return {
    status,
    setStatus: (value?: S) => write({ status: value, q }),
    q,
    deferredQ,
    setQ: (value: string) => {
      setQState(value);
      write({ status, q: value });
    },
    sort,
    onSort: (key: K) =>
      setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 })),
  };
}

export function compare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "ko");
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
  type QueryClient as QC,
} from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ATTACHMENT_BUCKET } from "@/lib/crm/constants";
import { browserClient, type BrowserClient } from "@/lib/supabase/browser";
import type {
  ActivityEntity,
  ActivityLogRow,
  ClientRow,
  InquiryRow,
  Json,
  ProjectPaymentRow,
  ProjectRow,
  ProjectTaskRow,
} from "@/lib/supabase/types";

/**
 * Admin data layer (client-first).
 *
 * - Whole CRM tables are fetched straight from the browser with the cookie
 *   session (RLS = public.is_admin()) and kept in TanStack Query. Every view is
 *   derived from these caches, so tab switches never hit the network.
 * - Supabase Realtime (postgres_changes) patches the caches live.
 * - Writes are optimistic: patch caches → write → roll back on error, then
 *   append to activity_log.
 */

export type Tables = {
  inquiries: InquiryRow;
  clients: ClientRow;
  projects: ProjectRow;
  tasks: ProjectTaskRow;
  payments: ProjectPaymentRow;
};
export type TableName = keyof Tables;
export const TABLES: TableName[] = ["inquiries", "projects", "clients", "tasks", "payments"];

const dbName = {
  inquiries: "inquiries",
  clients: "clients",
  projects: "projects",
  tasks: "project_tasks",
  payments: "project_payments",
} as const satisfies Record<TableName, string>;

const desc = (a: { created_at: string }, b: { created_at: string }) =>
  b.created_at.localeCompare(a.created_at);

/** Same order the tables are fetched in, re-applied after live/optimistic edits. */
const order: { [K in TableName]: (a: Tables[K], b: Tables[K]) => number } = {
  inquiries: desc,
  clients: desc,
  projects: desc,
  tasks: (a, b) => a.sort - b.sort || a.created_at.localeCompare(b.created_at),
  payments: (a, b) =>
    (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999") ||
    a.created_at.localeCompare(b.created_at),
};

async function fetchTable<K extends TableName>(name: K): Promise<Tables[K][]> {
  const sb = browserClient();
  const query = sb.from(dbName[name]).select("*").limit(2000);
  const { data, error } = await (name === "tasks"
    ? query.order("sort").order("created_at")
    : name === "payments"
      ? query.order("due_date", { nullsFirst: false }).order("created_at")
      : query.order("created_at", { ascending: false }));
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Tables[K][];
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

type Row = { id: string };

export function upsertRow<K extends TableName>(qc: QC, name: K, row: Tables[K]) {
  qc.setQueryData<Tables[K][]>([name], (rows = []) => {
    const next = rows.some((r) => r.id === row.id)
      ? rows.map((r) => (r.id === row.id ? { ...r, ...row } : r))
      : [...rows, row];
    return next.sort(order[name] as (a: Tables[K], b: Tables[K]) => number);
  });
}

export function patchRow<K extends TableName>(
  qc: QC,
  name: K,
  id: string,
  patch: Partial<Tables[K]>,
) {
  qc.setQueryData<Tables[K][]>([name], (rows = []) =>
    rows
      .map((r) => (r.id === id ? { ...r, ...patch } : r))
      .sort(order[name] as (a: Tables[K], b: Tables[K]) => number),
  );
}

export function removeRow(qc: QC, name: TableName, id: string) {
  qc.setQueryData<Row[]>([name], (rows = []) => rows.filter((r) => r.id !== id));
}

// ---------------------------------------------------------------------------
// Context: session info, realtime status, toasts
// ---------------------------------------------------------------------------

export type Seed = { [K in TableName]: Tables[K][] } & { activity: ActivityLogRow[] };

type Toast = { id: number; text: string; tone: "info" | "error" | "new"; href?: string };

type AdminCtx = {
  email: string;
  fixture: Seed | null;
  live: "connecting" | "live" | "offline";
  liveRef: React.RefObject<boolean>;
  toasts: Toast[];
  toast: (text: string, tone?: Toast["tone"], href?: string) => void;
  dismiss: (id: number) => void;
  unseenInquiries: number;
  clearUnseen: () => void;
};

const Ctx = createContext<AdminCtx | null>(null);

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin outside AdminProvider");
  return ctx;
}

export function AdminProvider({
  email,
  fixture,
  children,
}: {
  email: string;
  fixture: Seed | null;
  children: React.ReactNode;
}) {
  const [qc] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // Realtime keeps caches fresh; refetch on focus/reconnect only as a safety net.
          staleTime: 60_000,
          gcTime: 30 * 60_000,
          refetchOnWindowFocus: true,
          retry: 1,
        },
      },
    });
    if (fixture) {
      for (const name of TABLES) client.setQueryData([name], fixture[name]);
    }
    return client;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (text: string, tone: Toast["tone"] = "info", href?: string) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-3), { id, text, tone, href }]);
      setTimeout(() => dismiss(id), tone === "new" ? 9000 : 4500);
    },
    [dismiss],
  );

  const [live, setLive] = useState<AdminCtx["live"]>(fixture ? "offline" : "connecting");
  const liveRef = useRef(false);
  const [unseenInquiries, setUnseen] = useState(0);
  const clearUnseen = useCallback(() => setUnseen(0), []);

  useEffect(() => {
    if (fixture) return;
    // Prefetch every tab's dataset right away (parallel) so the first tab
    // switch is already a cache hit.
    for (const name of TABLES) {
      qc.prefetchQuery({ queryKey: [name], queryFn: () => fetchTable(name) });
    }
    return subscribeRealtime(qc, {
      onStatus(status, catchUp) {
        liveRef.current = status === "live";
        setLive(status);
        // Rows written between the initial fetch (or a disconnect) and the moment
        // the change stream became ready were never streamed → resync once.
        if (catchUp) for (const name of TABLES) qc.invalidateQueries({ queryKey: [name] });
      },
      onNewInquiry(row) {
        setUnseen((n) => n + 1);
        toast(`새 문의 · ${row.company || row.name}`, "new", `/admin/inquiries/${row.id}`);
      },
    });
  }, [qc, fixture, toast]);

  const value = useMemo<AdminCtx>(
    () => ({ email, fixture, live, liveRef, toasts, toast, dismiss, unseenInquiries, clearUnseen }),
    [email, fixture, live, toasts, toast, dismiss, unseenInquiries, clearUnseen],
  );

  return (
    <QueryClientProvider client={qc}>
      <Ctx.Provider value={value}>{children}</Ctx.Provider>
    </QueryClientProvider>
  );
}

function subscribeRealtime(
  qc: QC,
  handlers: {
    onStatus: (status: AdminCtx["live"], catchUp: boolean) => void;
    onNewInquiry: (row: InquiryRow) => void;
  },
) {
  const sb = browserClient();
  let cancelled = false;
  let channel: ReturnType<BrowserClient["channel"]> | null = null;

  (async () => {
    // Make sure the socket joins with the user's JWT so RLS lets rows through.
    const { data } = await sb.auth.getSession();
    if (cancelled) return;
    if (data.session) sb.realtime.setAuth(data.session.access_token);

    channel = sb.channel("crm-admin");
    for (const name of TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: dbName[name] },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (payload.eventType === "DELETE") {
            const id = (payload.old as Row | undefined)?.id;
            if (id) removeRow(qc, name, id);
            return;
          }
          const row = payload.new as unknown as Tables[typeof name];
          const isNew =
            name === "inquiries" &&
            payload.eventType === "INSERT" &&
            !qc.getQueryData<Row[]>(["inquiries"])?.some((r) => r.id === row.id);
          upsertRow(qc, name, row);
          if (isNew) handlers.onNewInquiry(row as InquiryRow);
        },
      );
    }
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "activity_log" },
      () => qc.invalidateQueries({ queryKey: ["activity"] }),
    );
    // SUBSCRIBED only means the socket joined; postgres_changes is ready when the
    // server sends this system message. Events committed before it are not
    // delivered, so "live" (and a catch-up refetch) waits for it.
    channel.on("system", {}, (msg: { extension?: string; status?: string }) => {
      if (msg.extension === "postgres_changes" && msg.status === "ok") {
        handlers.onStatus("live", true);
      }
    });
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        handlers.onStatus("offline", false);
      }
    });
  })();

  return () => {
    cancelled = true;
    if (channel) sb.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useTable<K extends TableName>(name: K) {
  const { fixture } = useAdmin();
  return useQuery({
    queryKey: [name],
    queryFn: () => fetchTable(name),
    enabled: !fixture,
  }) as { data: Tables[K][] | undefined; isPending: boolean; error: Error | null };
}

type ActivityKind = "inquiry" | "project" | "client";

function activityOptions(kind: ActivityKind, id: string, fixture: Seed | null) {
  return {
    queryKey: ["activity", kind, id],
    queryFn: async (): Promise<ActivityLogRow[]> => {
      if (fixture) {
        return fixture.activity.filter(
          (a) => a.entity_id === id || (a.detail as Record<string, Json>)?.project_id === id,
        );
      }
      let query = browserClient()
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      query =
        kind === "project"
          ? // Task/payment entries carry detail.project_id (also survives task deletion).
            query.or(`entity_id.eq.${id},detail->>project_id.eq.${id}`)
          : query.eq("entity", kind as ActivityEntity).eq("entity_id", id);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  };
}

export function useActivity(kind: ActivityKind, id: string) {
  const { fixture } = useAdmin();
  return useQuery(activityOptions(kind, id, fixture));
}

export type FileLink = { name: string; size: number; url: string | null };

function filesOptions(inquiry: InquiryRow | undefined, fixture: Seed | null) {
  return {
    queryKey: ["files", inquiry?.id],
    enabled: Boolean(inquiry?.attachments?.length),
    // Signed URLs live 10 minutes; refresh before they expire.
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<FileLink[]> => {
      const files = inquiry?.attachments ?? [];
      if (fixture) return files.map((a) => ({ name: a.name, size: a.size, url: null }));
      const storage = browserClient().storage.from(ATTACHMENT_BUCKET);
      return Promise.all(
        files.map(async (a) => {
          const { data } = await storage.createSignedUrl(a.path, 60 * 10, { download: a.name });
          return { name: a.name, size: a.size, url: data?.signedUrl ?? null };
        }),
      );
    },
  };
}

export function useFiles(inquiry: InquiryRow | undefined) {
  const { fixture } = useAdmin();
  return useQuery(filesOptions(inquiry, fixture));
}

/** Hover prefetch for detail views (activity + signed attachment URLs). */
export function usePrefetch() {
  const qc = useQueryClient();
  const { fixture } = useAdmin();
  return useCallback(
    (href: string) => {
      const m = href.match(/^\/admin\/(inquiries|projects|clients)\/([0-9a-f-]{36})/i);
      if (!m) return;
      const [, section, id] = m;
      const kind = section === "inquiries" ? "inquiry" : section === "projects" ? "project" : "client";
      qc.prefetchQuery({ ...activityOptions(kind, id, fixture), staleTime: 30_000 });
      if (kind === "inquiry") {
        const inquiry = qc.getQueryData<InquiryRow[]>(["inquiries"])?.find((i) => i.id === id);
        if (inquiry?.attachments?.length) qc.prefetchQuery(filesOptions(inquiry, fixture));
      }
    },
    [qc, fixture],
  );
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export type LogEntry = {
  entity: ActivityEntity;
  entity_id: string;
  action: string;
  detail?: Json;
};

type Result = { error: { message: string } | null };

/** Throws on a PostgREST error so mutate() can roll back. */
export async function must(promise: PromiseLike<Result>, what: string) {
  const { error } = await promise;
  if (error) throw new Error(`${what}: ${error.message}`);
}

export function useMutate() {
  const qc = useQueryClient();
  const { email, fixture, liveRef, toast } = useAdmin();

  return useCallback(
    async (op: {
      /** Optimistic cache patch, applied synchronously before the write. */
      patch?: (qc: QC) => void;
      write: (sb: BrowserClient) => Promise<void>;
      logs?: LogEntry[] | (() => LogEntry[]);
      /** Tables the write touches (refetched only when realtime is down). */
      touches?: TableName[];
    }) => {
      if (fixture) {
        toast("데모 데이터 모드에서는 저장할 수 없어요.", "error");
        return false;
      }
      const snapshot = TABLES.map((name) => [name, qc.getQueryData([name])] as const);
      op.patch?.(qc);
      const sb = browserClient();
      try {
        await op.write(sb);
      } catch (error) {
        for (const [name, data] of snapshot) qc.setQueryData([name], data);
        toast(error instanceof Error ? error.message : "저장하지 못했어요.", "error");
        return false;
      }
      const logs = typeof op.logs === "function" ? op.logs() : op.logs;
      if (logs?.length) {
        sb.from("activity_log")
          .insert(logs.map((l) => ({ actor: email, detail: {}, ...l })))
          .then(({ error }) => {
            if (error) console.error("[crm] activity log failed", error.message);
            qc.invalidateQueries({ queryKey: ["activity"] });
          });
      }
      if (!liveRef.current) {
        for (const name of op.touches ?? []) qc.invalidateQueries({ queryKey: [name] });
      }
      return true;
    },
    [qc, email, fixture, liveRef, toast],
  );
}

// ---------------------------------------------------------------------------
// Client-side navigation (native history → Next syncs usePathname)
// ---------------------------------------------------------------------------

export function navigate(href: string, replace = false) {
  if (replace) window.history.replaceState(null, "", href);
  else {
    window.history.pushState(null, "", href);
    window.scrollTo(0, 0);
  }
}

export const nowIso = () => new Date().toISOString();
export const kstDate = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

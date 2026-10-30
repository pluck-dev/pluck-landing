import { ACTIVE_PROJECT_STATUSES, BOOKED_PROJECT_STATUSES } from "./constants";
import type {
  ClientRow,
  InquiryRow,
  ProjectPaymentRow,
  ProjectRow,
  ProjectStatus,
  ProjectTaskRow,
} from "@/lib/supabase/types";

/**
 * Pure, client-safe derivations over the cached admin tables. The admin loads
 * whole tables once (small CRM data) and computes every view from them, so tab
 * switches and filters never wait on the network.
 */

const KST_OFFSET = 9 * 60 * 60 * 1000;

export function kstToday() {
  return new Date(Date.now() + KST_OFFSET).toISOString().slice(0, 10);
}

export function kstMonthStartIso() {
  const now = new Date(Date.now() + KST_OFFSET);
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) - KST_OFFSET,
  ).toISOString();
}

export function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function progressOf(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

export type ClientRef = Pick<ClientRow, "id" | "name" | "company">;
export type ProjectListItem = ProjectRow & {
  client: ClientRef | null;
  taskTotal: number;
  taskDone: number;
};
export type ClientListItem = ClientRow & { projectCount: number };

const CLOSED: ProjectStatus[] = ["done", "paused", "maintenance"];
export const isClosedProject = (status: ProjectStatus) => CLOSED.includes(status);

export function buildProjectList(
  projects: ProjectRow[],
  clients: ClientRow[],
  tasks: ProjectTaskRow[],
): ProjectListItem[] {
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const counts = new Map<string, { total: number; done: number }>();
  for (const t of tasks) {
    const c = counts.get(t.project_id) ?? { total: 0, done: 0 };
    c.total += 1;
    if (t.done) c.done += 1;
    counts.set(t.project_id, c);
  }
  return projects.map((p) => {
    const client = clientById.get(p.client_id);
    const c = counts.get(p.id);
    return {
      ...p,
      client: client ? { id: client.id, name: client.name, company: client.company } : null,
      taskTotal: c?.total ?? 0,
      taskDone: c?.done ?? 0,
    };
  });
}

export function buildClientList(clients: ClientRow[], projects: ProjectRow[]): ClientListItem[] {
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.client_id, (counts.get(p.client_id) ?? 0) + 1);
  return clients.map((c) => ({ ...c, projectCount: counts.get(c.id) ?? 0 }));
}

export function buildDashboard(inquiries: InquiryRow[], projects: ProjectListItem[]) {
  const monthStart = kstMonthStartIso();
  const booked = projects.filter((p) => BOOKED_PROJECT_STATUSES.includes(p.status));
  const bookedSum = booked.reduce((sum, p) => sum + Number(p.contract_amount), 0);
  const paidSum = booked.reduce((sum, p) => sum + Number(p.paid_amount), 0);
  const horizon = addDays(kstToday(), 14);
  return {
    monthInquiries: inquiries.filter((i) => i.created_at >= monthStart).length,
    newInquiries: inquiries.filter((i) => i.status === "new").length,
    activeProjects: projects.filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status)).length,
    booked: bookedSum,
    paid: paidSum,
    outstanding: Math.max(0, bookedSum - paidSum),
    recentInquiries: inquiries.slice(0, 6),
    dueSoon: projects
      .filter((p) => p.due_date && p.due_date <= horizon && !isClosedProject(p.status))
      .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
      .slice(0, 8),
  };
}

/** Sum of paid payments — mirrors the DB trigger for optimistic paid_amount. */
export function paidAmountOf(payments: ProjectPaymentRow[], projectId: string) {
  return payments
    .filter((p) => p.project_id === projectId && p.paid_at)
    .reduce((sum, p) => sum + Number(p.amount), 0);
}

export function matches(q: string, ...values: (string | null | undefined)[]) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return values.some((v) => v?.toLowerCase().includes(needle));
}

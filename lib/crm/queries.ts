import "server-only";
import type { AdminSession } from "./auth";
import {
  ACTIVE_PROJECT_STATUSES,
  ATTACHMENT_BUCKET,
  BOOKED_PROJECT_STATUSES,
} from "./constants";
import type {
  ActivityEntity,
  ActivityLogRow,
  ClientRow,
  InquiryRow,
  InquiryStatus,
  ProjectPaymentRow,
  ProjectRow,
  ProjectStatus,
  ProjectTaskRow,
} from "@/lib/supabase/types";

/**
 * Admin read layer. Real sessions query as the signed-in admin (RLS applies);
 * the dev fixture session reads lib/crm/fixture.ts instead.
 */

const KST_OFFSET = 9 * 60 * 60 * 1000;

export function kstToday() {
  return new Date(Date.now() + KST_OFFSET).toISOString().slice(0, 10);
}

function kstMonthStartIso() {
  const now = new Date(Date.now() + KST_OFFSET);
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) - KST_OFFSET,
  ).toISOString();
}

function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const fixture = () => import("./fixture");

export type ClientRef = Pick<ClientRow, "id" | "name" | "company">;
export type ProjectListItem = ProjectRow & {
  client: ClientRef | null;
  taskTotal: number;
  taskDone: number;
};

export function progressOf(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type Dashboard = {
  monthInquiries: number;
  newInquiries: number;
  activeProjects: number;
  booked: number;
  paid: number;
  outstanding: number;
  recentInquiries: InquiryRow[];
  dueSoon: ProjectListItem[];
};

export async function getDashboard(admin: AdminSession): Promise<Dashboard> {
  const monthStart = kstMonthStartIso();
  let monthInquiries: number;
  let newInquiries: number;
  let recentInquiries: InquiryRow[];

  if (admin.fixture) {
    const f = await fixture();
    monthInquiries = f.fixtureInquiries.filter((i) => i.created_at >= monthStart).length;
    newInquiries = f.fixtureInquiries.filter((i) => i.status === "new").length;
    recentInquiries = [...f.fixtureInquiries]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5);
  } else {
    const db = admin.supabase;
    const [monthRes, newRes, recentRes] = await Promise.all([
      db
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart),
      db
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      db
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    throwIf(monthRes.error ?? newRes.error ?? recentRes.error);
    monthInquiries = monthRes.count ?? 0;
    newInquiries = newRes.count ?? 0;
    recentInquiries = recentRes.data ?? [];
  }
  const projects = await listProjects(admin);

  const booked = projects.filter((p) => BOOKED_PROJECT_STATUSES.includes(p.status));
  const bookedSum = booked.reduce((sum, p) => sum + Number(p.contract_amount), 0);
  const paidSum = booked.reduce((sum, p) => sum + Number(p.paid_amount), 0);
  const today = kstToday();
  const horizon = addDays(today, 14);

  return {
    monthInquiries,
    newInquiries,
    activeProjects: projects.filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status)).length,
    booked: bookedSum,
    paid: paidSum,
    outstanding: Math.max(0, bookedSum - paidSum),
    recentInquiries,
    dueSoon: projects
      .filter(
        (p) =>
          p.due_date &&
          p.due_date <= horizon &&
          !["done", "paused", "maintenance"].includes(p.status),
      )
      .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
      .slice(0, 8),
  };
}

// ---------------------------------------------------------------------------
// Inquiries
// ---------------------------------------------------------------------------

export async function listInquiries(
  admin: AdminSession,
  filter: { status?: InquiryStatus; q?: string } = {},
): Promise<InquiryRow[]> {
  const q = filter.q?.trim();
  if (admin.fixture) {
    const { fixtureInquiries } = await fixture();
    return fixtureInquiries.filter(
      (i) =>
        (!filter.status || i.status === filter.status) &&
        (!q ||
          [i.name, i.company, i.email, i.message].some((v) =>
            v?.toLowerCase().includes(q.toLowerCase()),
          )),
    );
  }
  let query = admin.supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filter.status) query = query.eq("status", filter.status);
  if (q) {
    const term = `%${q.replace(/[%_,()*]/g, " ")}%`;
    query = query.or(
      `name.ilike.${term},company.ilike.${term},email.ilike.${term},message.ilike.${term}`,
    );
  }
  const { data, error } = await query;
  throwIf(error);
  return data ?? [];
}

export type InquiryDetail = {
  inquiry: InquiryRow;
  projects: Pick<ProjectRow, "id" | "name" | "status">[];
  activity: ActivityLogRow[];
  attachmentLinks: { name: string; size: number; url: string | null }[];
};

export async function getInquiry(
  admin: AdminSession,
  id: string,
): Promise<InquiryDetail | null> {
  if (admin.fixture) {
    const f = await fixture();
    const inquiry = f.fixtureInquiries.find((i) => i.id === id);
    if (!inquiry) return null;
    return {
      inquiry,
      projects: f.fixtureProjects.filter((p) => p.inquiry_id === id),
      activity: f.fixtureActivity.filter((a) => a.entity_id === id),
      attachmentLinks: inquiry.attachments.map((a) => ({ name: a.name, size: a.size, url: null })),
    };
  }
  const db = admin.supabase;
  const { data: inquiry, error } = await db
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIf(error);
  if (!inquiry) return null;
  const [projectsRes, activity, attachmentLinks] = await Promise.all([
    db.from("projects").select("id, name, status").eq("inquiry_id", id),
    getActivity(admin, "inquiry", [id]),
    Promise.all(
      (inquiry.attachments ?? []).map(async (a) => {
        const { data } = await db.storage
          .from(ATTACHMENT_BUCKET)
          .createSignedUrl(a.path, 60 * 10, { download: a.name });
        return { name: a.name, size: a.size, url: data?.signedUrl ?? null };
      }),
    ),
  ]);
  throwIf(projectsRes.error);
  return { inquiry, projects: projectsRes.data ?? [], activity, attachmentLinks };
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function listProjects(
  admin: AdminSession,
  filter: { status?: ProjectStatus; clientId?: string } = {},
): Promise<ProjectListItem[]> {
  if (admin.fixture) {
    const f = await fixture();
    return f.fixtureProjects
      .filter(
        (p) =>
          (!filter.status || p.status === filter.status) &&
          (!filter.clientId || p.client_id === filter.clientId),
      )
      .map((p) => {
        const tasks = f.fixtureTasks.filter((t) => t.project_id === p.id);
        const client = f.fixtureClients.find((c) => c.id === p.client_id);
        return {
          ...p,
          client: client ? { id: client.id, name: client.name, company: client.company } : null,
          taskTotal: tasks.length,
          taskDone: tasks.filter((t) => t.done).length,
        };
      });
  }
  let query = admin.supabase
    .from("projects")
    .select("*, clients(id, name, company), project_tasks(done)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.clientId) query = query.eq("client_id", filter.clientId);
  const { data, error } = await query;
  throwIf(error);
  return (data ?? []).map(({ clients, project_tasks, ...project }) => ({
    ...project,
    client: clients ?? null,
    taskTotal: project_tasks?.length ?? 0,
    taskDone: project_tasks?.filter((t) => t.done).length ?? 0,
  }));
}

export type ProjectDetail = {
  project: ProjectRow;
  client: ClientRow | null;
  inquiry: Pick<InquiryRow, "id" | "name" | "company" | "created_at"> | null;
  tasks: ProjectTaskRow[];
  payments: ProjectPaymentRow[];
  activity: ActivityLogRow[];
};

export async function getProject(
  admin: AdminSession,
  id: string,
): Promise<ProjectDetail | null> {
  if (admin.fixture) {
    const f = await fixture();
    const project = f.fixtureProjects.find((p) => p.id === id);
    if (!project) return null;
    const inquiry = f.fixtureInquiries.find((i) => i.id === project.inquiry_id);
    return {
      project,
      client: f.fixtureClients.find((c) => c.id === project.client_id) ?? null,
      inquiry: inquiry ?? null,
      tasks: f.fixtureTasks.filter((t) => t.project_id === id),
      payments: f.fixturePayments.filter((p) => p.project_id === id),
      activity: f.fixtureActivity.filter((a) => a.entity_id === id),
    };
  }
  const db = admin.supabase;
  const { data: project, error } = await db
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIf(error);
  if (!project) return null;
  const [clientRes, inquiryRes, tasksRes, paymentsRes] = await Promise.all([
    db.from("clients").select("*").eq("id", project.client_id).maybeSingle(),
    project.inquiry_id
      ? db
          .from("inquiries")
          .select("id, name, company, created_at")
          .eq("id", project.inquiry_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    db
      .from("project_tasks")
      .select("*")
      .eq("project_id", id)
      .order("sort")
      .order("created_at"),
    db
      .from("project_payments")
      .select("*")
      .eq("project_id", id)
      .order("due_date", { nullsFirst: false })
      .order("created_at"),
  ]);
  throwIf(clientRes.error ?? inquiryRes.error ?? tasksRes.error ?? paymentsRes.error);
  const tasks = tasksRes.data ?? [];
  const payments = paymentsRes.data ?? [];
  const activity = await getActivity(admin, null, [
    id,
    ...tasks.map((t) => t.id),
    ...payments.map((p) => p.id),
  ]);
  return {
    project,
    client: clientRes.data ?? null,
    inquiry: inquiryRes.data ?? null,
    tasks,
    payments,
    activity,
  };
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export type ClientListItem = ClientRow & { projectCount: number };

export async function listClients(
  admin: AdminSession,
  q?: string,
): Promise<ClientListItem[]> {
  const term = q?.trim();
  if (admin.fixture) {
    const f = await fixture();
    return f.fixtureClients
      .filter(
        (c) =>
          !term ||
          [c.name, c.company, c.email].some((v) =>
            v?.toLowerCase().includes(term.toLowerCase()),
          ),
      )
      .map((c) => ({
        ...c,
        projectCount: f.fixtureProjects.filter((p) => p.client_id === c.id).length,
      }));
  }
  let query = admin.supabase
    .from("clients")
    .select("*, projects(id)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (term) {
    const like = `%${term.replace(/[%_,()*]/g, " ")}%`;
    query = query.or(`name.ilike.${like},company.ilike.${like},email.ilike.${like}`);
  }
  const { data, error } = await query;
  throwIf(error);
  return (data ?? []).map(({ projects, ...client }) => ({
    ...client,
    projectCount: projects?.length ?? 0,
  }));
}

export async function getClient(admin: AdminSession, id: string) {
  if (admin.fixture) {
    const f = await fixture();
    const client = f.fixtureClients.find((c) => c.id === id);
    if (!client) return null;
    return { client, projects: await listProjects(admin, { clientId: id }) };
  }
  const { data: client, error } = await admin.supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIf(error);
  if (!client) return null;
  return { client, projects: await listProjects(admin, { clientId: id }) };
}

/** Clients for the "new project" picker. */
export async function listClientRefs(admin: AdminSession): Promise<ClientRef[]> {
  const clients = await listClients(admin);
  return clients.map(({ id, name, company }) => ({ id, name, company }));
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export async function getActivity(
  admin: AdminSession,
  entity: ActivityEntity | null,
  ids: string[],
): Promise<ActivityLogRow[]> {
  if (!ids.length) return [];
  if (admin.fixture) {
    const { fixtureActivity } = await fixture();
    return fixtureActivity.filter(
      (a) => ids.includes(a.entity_id) && (!entity || a.entity === entity),
    );
  }
  let query = admin.supabase
    .from("activity_log")
    .select("*")
    .in("entity_id", ids)
    .order("created_at", { ascending: false })
    .limit(100);
  if (entity) query = query.eq("entity", entity);
  const { data, error } = await query;
  throwIf(error);
  return data ?? [];
}

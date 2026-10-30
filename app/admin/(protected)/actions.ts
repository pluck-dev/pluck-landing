"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/crm/auth";
import { projectTypeLabels } from "@/lib/crm/constants";
import type { SessionClient } from "@/lib/supabase/server";
import {
  INQUIRY_STATUSES,
  PAYMENT_LABELS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ActivityEntity,
  type Json,
} from "@/lib/supabase/types";

/**
 * Every admin write: re-check the admin (never trust proxy.ts alone), write
 * through the RLS-scoped session client, then append to activity_log.
 */

async function writer() {
  const admin = await requireAdmin();
  if (admin.fixture) {
    throw new Error("데모 데이터 모드에서는 저장할 수 없어요. Supabase 를 연결해 주세요.");
  }
  return admin;
}

async function log(
  db: SessionClient,
  actor: string,
  entity: ActivityEntity,
  entityId: string,
  action: string,
  detail: Json = {},
) {
  const { error } = await db.from("activity_log").insert({
    actor,
    entity,
    entity_id: entityId,
    action,
    detail,
  });
  if (error) console.error("[crm] activity log failed", error.message);
}

function fail(error: { message: string } | null, what: string): asserts error is null {
  if (error) throw new Error(`${what}: ${error.message}`);
}

const uuid = z.uuid();
const text = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);
const isoDate = z
  .string()
  .trim()
  .transform((v) => v || null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "날짜 형식이 아니에요.");
const amount = z
  .string()
  .trim()
  .transform((v) => Number(v.replace(/[^\d]/g, "") || 0))
  .pipe(z.number().int().min(0).max(99_999_999_999));
const url = z
  .string()
  .trim()
  .transform((v) => v || null)
  .refine((v) => v === null || /^https?:\/\//.test(v), "http(s) 주소를 입력해 주세요.");

function form<T extends z.ZodRawShape>(shape: T, formData: FormData) {
  const raw: Record<string, unknown> = {};
  for (const key of Object.keys(shape)) {
    const value = formData.get(key);
    raw[key] = value === null ? "" : value;
  }
  const parsed = z.object(shape).safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  return parsed.data;
}

// ---------------------------------------------------------------------------
// Inquiries
// ---------------------------------------------------------------------------

export async function updateInquiryStatus(formData: FormData) {
  const admin = await writer();
  const { id, status } = form({ id: uuid, status: z.enum(INQUIRY_STATUSES) }, formData);
  const db = admin.supabase;
  const { data: before } = await db.from("inquiries").select("status").eq("id", id).maybeSingle();
  const { error } = await db.from("inquiries").update({ status }).eq("id", id);
  fail(error, "상태 변경 실패");
  await log(db, admin.email, "inquiry", id, "status_changed", {
    from: before?.status ?? null,
    to: status,
  });
  revalidatePath("/admin", "layout");
}

export async function updateInquiryMemo(formData: FormData) {
  const admin = await writer();
  const { id, admin_memo } = form({ id: uuid, admin_memo: text(5000) }, formData);
  const db = admin.supabase;
  const { error } = await db.from("inquiries").update({ admin_memo }).eq("id", id);
  fail(error, "메모 저장 실패");
  await log(db, admin.email, "inquiry", id, "memo_updated");
  revalidatePath(`/admin/inquiries/${id}`);
}

/** Creates (or reuses by email) a client and a planning project prefilled from the inquiry. */
export async function convertInquiryToProject(formData: FormData) {
  const admin = await writer();
  const { id } = form({ id: uuid }, formData);
  const db = admin.supabase;
  const { data: inquiry, error } = await db.from("inquiries").select("*").eq("id", id).single();
  fail(error, "문의를 찾지 못했어요");

  const { data: existingProject } = await db
    .from("projects")
    .select("id")
    .eq("inquiry_id", id)
    .limit(1)
    .maybeSingle();
  if (existingProject) redirect(`/admin/projects/${existingProject.id}`);

  const { data: existingClient } = await db
    .from("clients")
    .select("id")
    .eq("email", inquiry.email.toLowerCase())
    .limit(1)
    .maybeSingle();

  let clientId = existingClient?.id;
  if (!clientId) {
    const { data: client, error: clientError } = await db
      .from("clients")
      .insert({
        name: inquiry.name,
        company: inquiry.company,
        email: inquiry.email.toLowerCase(),
        phone: inquiry.phone,
      })
      .select("id")
      .single();
    fail(clientError, "고객 생성 실패");
    clientId = client.id;
    await log(db, admin.email, "client", clientId, "created", { from_inquiry: id });
  }

  const notes = [
    inquiry.message,
    inquiry.reference_urls.length ? `\n참고 링크\n${inquiry.reference_urls.join("\n")}` : "",
  ].join("");

  const { data: project, error: projectError } = await db
    .from("projects")
    .insert({
      client_id: clientId,
      inquiry_id: id,
      name: `${inquiry.company || inquiry.name} ${projectTypeLabels[inquiry.project_type]}`,
      type: inquiry.project_type,
      status: "planning",
      notes,
    })
    .select("id")
    .single();
  fail(projectError, "프로젝트 생성 실패");

  await db.from("inquiries").update({ status: "won" }).eq("id", id);
  await log(db, admin.email, "project", project.id, "created", { from_inquiry: id });
  await log(db, admin.email, "inquiry", id, "converted", {
    project_id: project.id,
    client_id: clientId,
    from: inquiry.status,
    to: "won",
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/projects/${project.id}`);
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

const clientShape = {
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(80),
  company: text(80),
  email: text(120).transform((v) => v?.toLowerCase() ?? null),
  phone: text(30),
  memo: text(5000),
};

export async function createClient(formData: FormData) {
  const admin = await writer();
  const values = form(clientShape, formData);
  const db = admin.supabase;
  const { data, error } = await db.from("clients").insert(values).select("id").single();
  fail(error, "고객 생성 실패");
  await log(db, admin.email, "client", data.id, "created");
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${data.id}`);
}

export async function updateClient(formData: FormData) {
  const admin = await writer();
  const { id, ...values } = form({ id: uuid, ...clientShape }, formData);
  const db = admin.supabase;
  const { error } = await db.from("clients").update(values).eq("id", id);
  fail(error, "고객 저장 실패");
  await log(db, admin.email, "client", id, "updated");
  revalidatePath("/admin", "layout");
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const projectShape = {
  name: z.string().trim().min(1, "프로젝트명을 입력해 주세요.").max(120),
  type: z.enum(PROJECT_TYPES),
  status: z.enum(PROJECT_STATUSES),
  start_date: isoDate,
  due_date: isoDate,
  contract_amount: amount,
};

export async function createProject(formData: FormData) {
  const admin = await writer();
  const values = form({ client_id: uuid, ...projectShape }, formData);
  const db = admin.supabase;
  const { data, error } = await db.from("projects").insert(values).select("id").single();
  fail(error, "프로젝트 생성 실패");
  await log(db, admin.email, "project", data.id, "created");
  revalidatePath("/admin", "layout");
  redirect(`/admin/projects/${data.id}`);
}

export async function updateProject(formData: FormData) {
  const admin = await writer();
  const { id, ...values } = form(
    { id: uuid, ...projectShape, repo_url: url, live_url: url, notes: text(10000) },
    formData,
  );
  const db = admin.supabase;
  const { data: before } = await db.from("projects").select("status").eq("id", id).maybeSingle();
  const { error } = await db.from("projects").update(values).eq("id", id);
  fail(error, "프로젝트 저장 실패");
  await log(
    db,
    admin.email,
    "project",
    id,
    before && before.status !== values.status ? "status_changed" : "updated",
    before && before.status !== values.status ? { from: before.status, to: values.status } : {},
  );
  revalidatePath("/admin", "layout");
}

export async function updateProjectStatus(formData: FormData) {
  const admin = await writer();
  const { id, status } = form({ id: uuid, status: z.enum(PROJECT_STATUSES) }, formData);
  const db = admin.supabase;
  const { data: before } = await db.from("projects").select("status").eq("id", id).maybeSingle();
  const { error } = await db.from("projects").update({ status }).eq("id", id);
  fail(error, "상태 변경 실패");
  await log(db, admin.email, "project", id, "status_changed", {
    from: before?.status ?? null,
    to: status,
  });
  revalidatePath("/admin", "layout");
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function addTask(formData: FormData) {
  const admin = await writer();
  const { project_id, title, due_date } = form(
    { project_id: uuid, title: z.string().trim().min(1, "할 일을 입력해 주세요.").max(200), due_date: isoDate },
    formData,
  );
  const db = admin.supabase;
  const { data: last } = await db
    .from("project_tasks")
    .select("sort")
    .eq("project_id", project_id)
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data, error } = await db
    .from("project_tasks")
    .insert({ project_id, title, due_date, sort: (last?.sort ?? -1) + 1 })
    .select("id")
    .single();
  fail(error, "할 일 추가 실패");
  await log(db, admin.email, "task", data.id, "created", { project_id, title });
  revalidatePath(`/admin/projects/${project_id}`);
}

export async function toggleTask(formData: FormData) {
  const admin = await writer();
  const { id, project_id, done } = form(
    { id: uuid, project_id: uuid, done: z.enum(["true", "false"]) },
    formData,
  );
  const db = admin.supabase;
  const { error } = await db.from("project_tasks").update({ done: done === "true" }).eq("id", id);
  fail(error, "할 일 변경 실패");
  await log(db, admin.email, "task", id, done === "true" ? "completed" : "reopened", { project_id });
  revalidatePath("/admin", "layout");
}

export async function moveTask(formData: FormData) {
  const admin = await writer();
  const { id, project_id, direction } = form(
    { id: uuid, project_id: uuid, direction: z.enum(["up", "down"]) },
    formData,
  );
  const db = admin.supabase;
  const { data: tasks, error } = await db
    .from("project_tasks")
    .select("id, sort")
    .eq("project_id", project_id)
    .order("sort")
    .order("created_at");
  fail(error, "할 일 정렬 실패");
  const index = tasks.findIndex((t) => t.id === id);
  const swap = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swap < 0 || swap >= tasks.length) return;
  const ordered = [...tasks];
  [ordered[index], ordered[swap]] = [ordered[swap], ordered[index]];
  // Renumber so duplicate/legacy sort values can't make a swap a no-op.
  const results = await Promise.all(
    ordered.map((task, sort) =>
      task.sort === sort
        ? Promise.resolve({ error: null })
        : db.from("project_tasks").update({ sort }).eq("id", task.id),
    ),
  );
  fail(results.find((r) => r.error)?.error ?? null, "할 일 정렬 실패");
  revalidatePath(`/admin/projects/${project_id}`);
}

export async function deleteTask(formData: FormData) {
  const admin = await writer();
  const { id, project_id } = form({ id: uuid, project_id: uuid }, formData);
  const db = admin.supabase;
  const { data: task } = await db.from("project_tasks").select("title").eq("id", id).maybeSingle();
  const { error } = await db.from("project_tasks").delete().eq("id", id);
  fail(error, "할 일 삭제 실패");
  await log(db, admin.email, "task", id, "deleted", { project_id, title: task?.title ?? null });
  revalidatePath("/admin", "layout");
}

// ---------------------------------------------------------------------------
// Payments (projects.paid_amount is recomputed by a DB trigger)
// ---------------------------------------------------------------------------

export async function addPayment(formData: FormData) {
  const admin = await writer();
  const values = form(
    { project_id: uuid, label: z.enum(PAYMENT_LABELS), amount, due_date: isoDate },
    formData,
  );
  const db = admin.supabase;
  const { data, error } = await db.from("project_payments").insert(values).select("id").single();
  fail(error, "입금 일정 추가 실패");
  await log(db, admin.email, "payment", data.id, "created", {
    project_id: values.project_id,
    label: values.label,
    amount: values.amount,
  });
  revalidatePath("/admin", "layout");
}

export async function setPaymentPaid(formData: FormData) {
  const admin = await writer();
  const { id, project_id, paid } = form(
    { id: uuid, project_id: uuid, paid: z.enum(["true", "false"]) },
    formData,
  );
  const db = admin.supabase;
  const paidAt = paid === "true" ? new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10) : null;
  const { error } = await db.from("project_payments").update({ paid_at: paidAt }).eq("id", id);
  fail(error, "입금 처리 실패");
  await log(db, admin.email, "payment", id, paidAt ? "marked_paid" : "marked_unpaid", {
    project_id,
    paid_at: paidAt,
  });
  revalidatePath("/admin", "layout");
}

export async function deletePayment(formData: FormData) {
  const admin = await writer();
  const { id, project_id } = form({ id: uuid, project_id: uuid }, formData);
  const db = admin.supabase;
  const { data: payment } = await db
    .from("project_payments")
    .select("label, amount")
    .eq("id", id)
    .maybeSingle();
  const { error } = await db.from("project_payments").delete().eq("id", id);
  fail(error, "입금 일정 삭제 실패");
  await log(db, admin.email, "payment", id, "deleted", {
    project_id,
    label: payment?.label ?? null,
    amount: payment?.amount ?? null,
  });
  revalidatePath("/admin", "layout");
}

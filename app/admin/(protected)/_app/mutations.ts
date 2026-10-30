"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { projectTypeLabels } from "@/lib/crm/constants";
import { paidAmountOf } from "@/lib/crm/derive";
import type {
  ClientRow,
  InquiryRow,
  InquiryStatus,
  PaymentLabel,
  ProjectPaymentRow,
  ProjectRow,
  ProjectStatus,
  ProjectTaskRow,
} from "@/lib/supabase/types";
import {
  kstDate,
  must,
  navigate,
  nowIso,
  patchRow,
  removeRow,
  upsertRow,
  useMutate,
  type LogEntry,
} from "./store";

type ClientInput = Pick<ClientRow, "name" | "company" | "email" | "phone" | "memo">;
type ProjectInput = Pick<
  ProjectRow,
  "name" | "type" | "status" | "start_date" | "due_date" | "contract_amount"
>;
type ProjectEdit = ProjectInput & Pick<ProjectRow, "repo_url" | "live_url" | "notes">;

/**
 * Every admin write. IDs are generated in the browser so inserts can be shown
 * (and navigated to) before the server answers. Writes go through the RLS-scoped
 * browser session; activity_log entries are appended after a successful write.
 * projects.paid_amount is recomputed by a DB trigger — only mirrored optimistically.
 */
export function useCrm() {
  const qc = useQueryClient();
  const mutate = useMutate();

  return useMemo(() => {
    const rows = <T,>(key: string) => qc.getQueryData<T[]>([key]) ?? [];
    const find = <T extends { id: string }>(key: string, id: string) =>
      rows<T>(key).find((r) => r.id === id);

    const syncPaid = (projectId: string) =>
      patchRow(qc, "projects", projectId, {
        paid_amount: paidAmountOf(rows<ProjectPaymentRow>("payments"), projectId),
      });

    return {
      setInquiryStatus(id: string, status: InquiryStatus) {
        const from = find<InquiryRow>("inquiries", id)?.status ?? null;
        if (from === status) return;
        return mutate({
          patch: (qc) => patchRow(qc, "inquiries", id, { status }),
          write: (sb) => must(sb.from("inquiries").update({ status }).eq("id", id), "상태 변경 실패"),
          logs: [{ entity: "inquiry", entity_id: id, action: "status_changed", detail: { from, to: status } }],
          touches: ["inquiries"],
        });
      },

      saveInquiryMemo(id: string, admin_memo: string | null) {
        return mutate({
          patch: (qc) => patchRow(qc, "inquiries", id, { admin_memo }),
          write: (sb) => must(sb.from("inquiries").update({ admin_memo }).eq("id", id), "메모 저장 실패"),
          logs: [{ entity: "inquiry", entity_id: id, action: "memo_updated" }],
          touches: ["inquiries"],
        });
      },

      /** Creates (or reuses by email) a client and a planning project prefilled from the inquiry. */
      async convertInquiry(inquiry: InquiryRow) {
        const existing = rows<ProjectRow>("projects").find((p) => p.inquiry_id === inquiry.id);
        if (existing) {
          navigate(`/admin/projects/${existing.id}`);
          return true;
        }
        const email = inquiry.email.toLowerCase();
        const existingClient = rows<ClientRow>("clients").find((c) => c.email?.toLowerCase() === email);
        const clientId = existingClient?.id ?? crypto.randomUUID();
        const projectId = crypto.randomUUID();
        const created = nowIso();
        const client: ClientRow | null = existingClient
          ? null
          : {
              id: clientId,
              created_at: created,
              name: inquiry.name,
              company: inquiry.company,
              email,
              phone: inquiry.phone,
              memo: null,
            };
        const notes = [
          inquiry.message,
          inquiry.reference_urls.length ? `\n참고 링크\n${inquiry.reference_urls.join("\n")}` : "",
        ].join("");
        const project: ProjectRow = {
          id: projectId,
          created_at: created,
          client_id: clientId,
          inquiry_id: inquiry.id,
          name: `${inquiry.company || inquiry.name} ${projectTypeLabels[inquiry.project_type]}`,
          type: inquiry.project_type,
          status: "planning",
          start_date: null,
          due_date: null,
          contract_amount: 0,
          paid_amount: 0,
          repo_url: null,
          live_url: null,
          notes,
        };
        const logs: LogEntry[] = [
          ...(client ? [{ entity: "client" as const, entity_id: clientId, action: "created", detail: { from_inquiry: inquiry.id } }] : []),
          { entity: "project", entity_id: projectId, action: "created", detail: { from_inquiry: inquiry.id } },
          {
            entity: "inquiry",
            entity_id: inquiry.id,
            action: "converted",
            detail: { project_id: projectId, client_id: clientId, from: inquiry.status, to: "won" },
          },
        ];
        navigate(`/admin/projects/${projectId}`);
        const ok = await mutate({
          patch: (qc) => {
            if (client) upsertRow(qc, "clients", client);
            upsertRow(qc, "projects", project);
            patchRow(qc, "inquiries", inquiry.id, { status: "won" });
          },
          write: async (sb) => {
            if (client) {
              const { id, name, company, email, phone } = client;
              await must(sb.from("clients").insert({ id, name, company, email, phone }), "고객 생성 실패");
            }
            const { id, client_id, inquiry_id, name, type, status, notes } = project;
            await must(
              sb.from("projects").insert({ id, client_id, inquiry_id, name, type, status, notes }),
              "프로젝트 생성 실패",
            );
            await must(sb.from("inquiries").update({ status: "won" }).eq("id", inquiry.id), "문의 상태 변경 실패");
          },
          logs,
          touches: ["clients", "projects", "inquiries"],
        });
        if (!ok) navigate(`/admin/inquiries/${inquiry.id}`, true);
        return ok;
      },

      async createClient(values: ClientInput) {
        const id = crypto.randomUUID();
        navigate(`/admin/clients/${id}`);
        const ok = await mutate({
          patch: (qc) => upsertRow(qc, "clients", { id, created_at: nowIso(), ...values }),
          write: (sb) => must(sb.from("clients").insert({ id, ...values }), "고객 생성 실패"),
          logs: [{ entity: "client", entity_id: id, action: "created" }],
          touches: ["clients"],
        });
        if (!ok) navigate("/admin/clients", true);
        return ok;
      },

      updateClient(id: string, values: ClientInput) {
        return mutate({
          patch: (qc) => patchRow(qc, "clients", id, values),
          write: (sb) => must(sb.from("clients").update(values).eq("id", id), "고객 저장 실패"),
          logs: [{ entity: "client", entity_id: id, action: "updated" }],
          touches: ["clients"],
        });
      },

      async createProject(client_id: string, values: ProjectInput) {
        const id = crypto.randomUUID();
        navigate(`/admin/projects/${id}`);
        const ok = await mutate({
          patch: (qc) =>
            upsertRow(qc, "projects", {
              id,
              created_at: nowIso(),
              client_id,
              inquiry_id: null,
              paid_amount: 0,
              repo_url: null,
              live_url: null,
              notes: null,
              ...values,
            }),
          write: (sb) => must(sb.from("projects").insert({ id, client_id, ...values }), "프로젝트 생성 실패"),
          logs: [{ entity: "project", entity_id: id, action: "created" }],
          touches: ["projects"],
        });
        if (!ok) history.back();
        return ok;
      },

      updateProject(id: string, values: Partial<ProjectEdit>) {
        const before = find<ProjectRow>("projects", id);
        const statusChanged = values.status && before && before.status !== values.status;
        return mutate({
          patch: (qc) => patchRow(qc, "projects", id, values),
          write: (sb) => must(sb.from("projects").update(values).eq("id", id), "프로젝트 저장 실패"),
          logs: [
            statusChanged
              ? { entity: "project", entity_id: id, action: "status_changed", detail: { from: before.status, to: values.status! } }
              : { entity: "project", entity_id: id, action: "updated" },
          ],
          touches: ["projects"],
        });
      },

      setProjectStatus(id: string, status: ProjectStatus) {
        const before = find<ProjectRow>("projects", id);
        if (before?.status === status) return;
        return mutate({
          patch: (qc) => patchRow(qc, "projects", id, { status }),
          write: (sb) => must(sb.from("projects").update({ status }).eq("id", id), "상태 변경 실패"),
          logs: [{ entity: "project", entity_id: id, action: "status_changed", detail: { from: before?.status ?? null, to: status } }],
          touches: ["projects"],
        });
      },

      addTask(project_id: string, title: string, due_date: string | null) {
        const id = crypto.randomUUID();
        const sort =
          rows<ProjectTaskRow>("tasks")
            .filter((t) => t.project_id === project_id)
            .reduce((max, t) => Math.max(max, t.sort), -1) + 1;
        return mutate({
          patch: (qc) =>
            upsertRow(qc, "tasks", { id, created_at: nowIso(), project_id, title, due_date, sort, done: false }),
          write: (sb) =>
            must(sb.from("project_tasks").insert({ id, project_id, title, due_date, sort }), "할 일 추가 실패"),
          logs: [{ entity: "task", entity_id: id, action: "created", detail: { project_id, title } }],
          touches: ["tasks"],
        });
      },

      toggleTask(task: ProjectTaskRow) {
        const done = !task.done;
        return mutate({
          patch: (qc) => patchRow(qc, "tasks", task.id, { done }),
          write: (sb) => must(sb.from("project_tasks").update({ done }).eq("id", task.id), "할 일 변경 실패"),
          logs: [
            { entity: "task", entity_id: task.id, action: done ? "completed" : "reopened", detail: { project_id: task.project_id } },
          ],
          touches: ["tasks"],
        });
      },

      moveTask(task: ProjectTaskRow, direction: "up" | "down") {
        const list = rows<ProjectTaskRow>("tasks").filter((t) => t.project_id === task.project_id);
        const index = list.findIndex((t) => t.id === task.id);
        const swap = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || swap < 0 || swap >= list.length) return;
        const ordered = [...list];
        [ordered[index], ordered[swap]] = [ordered[swap], ordered[index]];
        // Renumber so duplicate/legacy sort values can't make a swap a no-op.
        const changes = ordered
          .map((t, sort) => ({ id: t.id, sort, prev: t.sort }))
          .filter((c) => c.sort !== c.prev);
        return mutate({
          patch: (qc) => changes.forEach((c) => patchRow(qc, "tasks", c.id, { sort: c.sort })),
          write: async (sb) => {
            await Promise.all(
              changes.map((c) => must(sb.from("project_tasks").update({ sort: c.sort }).eq("id", c.id), "할 일 정렬 실패")),
            );
          },
          touches: ["tasks"],
        });
      },

      deleteTask(task: ProjectTaskRow) {
        return mutate({
          patch: (qc) => removeRow(qc, "tasks", task.id),
          write: (sb) => must(sb.from("project_tasks").delete().eq("id", task.id), "할 일 삭제 실패"),
          logs: [
            { entity: "task", entity_id: task.id, action: "deleted", detail: { project_id: task.project_id, title: task.title } },
          ],
          touches: ["tasks"],
        });
      },

      addPayment(project_id: string, values: { label: PaymentLabel; amount: number; due_date: string | null }) {
        const id = crypto.randomUUID();
        return mutate({
          patch: (qc) =>
            upsertRow(qc, "payments", { id, created_at: nowIso(), project_id, paid_at: null, ...values }),
          write: (sb) =>
            must(sb.from("project_payments").insert({ id, project_id, ...values }), "입금 일정 추가 실패"),
          logs: [
            { entity: "payment", entity_id: id, action: "created", detail: { project_id, label: values.label, amount: values.amount } },
          ],
          touches: ["payments"],
        });
      },

      setPaymentPaid(payment: ProjectPaymentRow, paid: boolean) {
        const paid_at = paid ? kstDate() : null;
        return mutate({
          patch: (qc) => {
            patchRow(qc, "payments", payment.id, { paid_at });
            syncPaid(payment.project_id);
          },
          write: (sb) =>
            must(sb.from("project_payments").update({ paid_at }).eq("id", payment.id), "입금 처리 실패"),
          logs: [
            {
              entity: "payment",
              entity_id: payment.id,
              action: paid_at ? "marked_paid" : "marked_unpaid",
              detail: { project_id: payment.project_id, paid_at },
            },
          ],
          touches: ["payments", "projects"],
        });
      },

      deletePayment(payment: ProjectPaymentRow) {
        return mutate({
          patch: (qc) => {
            removeRow(qc, "payments", payment.id);
            syncPaid(payment.project_id);
          },
          write: (sb) => must(sb.from("project_payments").delete().eq("id", payment.id), "입금 일정 삭제 실패"),
          logs: [
            {
              entity: "payment",
              entity_id: payment.id,
              action: "deleted",
              detail: { project_id: payment.project_id, label: payment.label, amount: payment.amount },
            },
          ],
          touches: ["payments", "projects"],
        });
      },
    };
  }, [qc, mutate]);
}

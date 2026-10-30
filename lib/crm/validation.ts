import { z } from "zod";
import { PAYMENT_LABELS, PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/supabase/types";

/**
 * Admin form schemas, parsed in the browser before a write. RLS + table check
 * constraints are the real guard; this keeps bad input from reaching them.
 */

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

export const clientShape = {
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(80),
  company: text(80),
  email: text(120).transform((v) => v?.toLowerCase() ?? null),
  phone: text(30),
  memo: text(5000),
};

export const projectShape = {
  name: z.string().trim().min(1, "프로젝트명을 입력해 주세요.").max(120),
  type: z.enum(PROJECT_TYPES),
  status: z.enum(PROJECT_STATUSES),
  start_date: isoDate,
  due_date: isoDate,
  contract_amount: amount,
};

export const projectEditShape = {
  ...projectShape,
  repo_url: url,
  live_url: url,
  notes: text(10000),
};

export const taskShape = {
  title: z.string().trim().min(1, "할 일을 입력해 주세요.").max(200),
  due_date: isoDate,
};

export const paymentShape = {
  label: z.enum(PAYMENT_LABELS),
  amount,
  due_date: isoDate,
};

export const memoShape = { admin_memo: text(5000) };

export function parseForm<T extends z.ZodRawShape>(shape: T, form: HTMLFormElement | FormData) {
  const data = form instanceof FormData ? form : new FormData(form);
  const raw: Record<string, unknown> = {};
  for (const key of Object.keys(shape)) {
    const value = data.get(key);
    raw[key] = value === null ? "" : value;
  }
  const parsed = z.object(shape).safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  return parsed.data;
}

"use server";

import { createHash, randomUUID } from "node:crypto";
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  BUDGETS,
  PROJECT_TYPES,
  TIMELINES,
  type InquiryAttachment,
  type InquirySource,
} from "@/lib/supabase/types";
import {
  ATTACHMENT_BUCKET,
  attachmentMime,
  budgetLabels,
  INQUIRY_RATE_LIMIT_PER_HOUR,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  MAX_REFERENCE_URLS,
  projectTypeLabels,
  SOURCE_COOKIE,
  timelineLabels,
} from "@/lib/crm/constants";
import { SITE_URL } from "@/lib/site";

export type InquiryField =
  | "name"
  | "company"
  | "email"
  | "phone"
  | "project_type"
  | "budget"
  | "timeline"
  | "message"
  | "reference_urls"
  | "attachments"
  | "consent_privacy";

export type InquiryState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<InquiryField, string>>;
    };

const NOT_CONFIGURED =
  "지금은 온라인 접수를 받을 수 없어요. admin@pluck.co.kr 로 메일을 보내주세요.";
const RATE_LIMITED =
  "짧은 시간에 문의가 여러 번 접수됐어요. 잠시 후 다시 시도하시거나 admin@pluck.co.kr 로 메일을 보내주세요.";

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null);

const httpUrl = z
  .string()
  .trim()
  .max(500, "링크가 너무 길어요.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.");

const attachmentSchema = z.object({
  path: z
    .string()
    .regex(/^pending\/\d{4}-\d{2}\/[0-9a-f-]{36}\/[\w.-]{1,120}$/),
  name: z.string().min(1).max(200),
  size: z.number().int().positive().max(MAX_ATTACHMENT_BYTES),
  type: z.string().max(120),
});

const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(60, "이름은 60자 안으로 입력해 주세요."),
  company: optionalText(80, "회사/브랜드는 80자 안으로 입력해 주세요."),
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해 주세요.")
    .max(120, "이메일이 너무 길어요.")
    .pipe(z.email("이메일 주소를 확인해 주세요.")),
  phone: optionalText(30, "연락처가 너무 길어요.").refine(
    (value) => value === null || /^[0-9+\-() ]{7,30}$/.test(value),
    "연락처는 숫자와 - 만 입력해 주세요.",
  ),
  project_type: z.enum(PROJECT_TYPES, "프로젝트 종류를 골라 주세요."),
  budget: z.enum(BUDGETS).nullable(),
  timeline: z.enum(TIMELINES).nullable(),
  message: z
    .string()
    .trim()
    .min(10, "내용을 10자 이상 적어 주세요.")
    .max(5000, "내용은 5000자 안으로 적어 주세요."),
  reference_urls: z
    .array(httpUrl)
    .max(MAX_REFERENCE_URLS, `참고 링크는 ${MAX_REFERENCE_URLS}개까지 넣을 수 있어요.`),
  attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS),
  consent_privacy: z.literal(true, "개인정보 수집·이용에 동의해 주세요."),
});

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // Honeypot: real visitors never see or fill this field. Pretend success.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success" };
  }

  const supabase = createServiceClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const parsed = inquirySchema.safeParse({
    name: formData.get("name") ?? "",
    company: formData.get("company") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    project_type: formData.get("project_type") ?? undefined,
    budget: formData.get("budget") || null,
    timeline: formData.get("timeline") || null,
    message: formData.get("message") ?? "",
    reference_urls: formData
      .getAll("reference_urls")
      .map(String)
      .filter((value) => value.trim()),
    attachments: parseJson(formData.get("attachments"), []),
    consent_privacy: formData.get("consent_privacy") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<InquiryField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as InquiryField;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "입력한 내용을 한 번 더 확인해 주세요.",
      fieldErrors,
    };
  }

  const requestHeaders = await headers();
  const ipHash = hashIp(clientIp(requestHeaders));

  if (await isRateLimited(supabase, ipHash)) {
    return { status: "error", message: RATE_LIMITED };
  }

  const data = parsed.data;
  const attachments = await keepUploaded(supabase, data.attachments);
  const source = await readSource(formData);

  const { data: inserted, error } = await supabase
    .from("inquiries")
    .insert({
      name: data.name,
      company: data.company,
      email: data.email.toLowerCase(),
      phone: data.phone,
      project_type: data.project_type,
      budget: data.budget,
      timeline: data.timeline,
      message: data.message,
      reference_urls: data.reference_urls,
      attachments,
      source,
      consent_privacy: true,
      ip_hash: ipHash,
      user_agent: requestHeaders.get("user-agent")?.slice(0, 300) ?? null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[inquiry] insert failed", error?.message);
    return {
      status: "error",
      message:
        "접수 중 문제가 생겼어요. 잠시 후 다시 시도하시거나 admin@pluck.co.kr 로 메일을 보내주세요.",
    };
  }

  after(async () => {
    await supabase.from("activity_log").insert({
      actor: "public:contact-form",
      entity: "inquiry",
      entity_id: inserted.id,
      action: "created",
      detail: { project_type: data.project_type, attachments: attachments.length },
    });
    await notifyDiscord(inserted.id, data);
  });

  return { status: "success" };
}

export type UploadTicket = {
  path: string;
  signedUrl: string;
  contentType: string;
};

export type UploadTicketResult =
  | { ok: true; tickets: UploadTicket[] }
  | { ok: false; message: string };

/**
 * Hands out signed upload URLs for the private inquiry-files bucket so the
 * browser can upload straight to Storage (files never pass through this server).
 */
export async function requestUploadTickets(
  files: { name: string; size: number }[],
): Promise<UploadTicketResult> {
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  if (!Array.isArray(files) || files.length === 0) return { ok: true, tickets: [] };
  if (files.length > MAX_ATTACHMENTS) {
    return { ok: false, message: `첨부파일은 ${MAX_ATTACHMENTS}개까지 올릴 수 있어요.` };
  }

  const requestHeaders = await headers();
  if (await isRateLimited(supabase, hashIp(clientIp(requestHeaders)))) {
    return { ok: false, message: RATE_LIMITED };
  }

  const month = new Date().toISOString().slice(0, 7);
  const tickets: UploadTicket[] = [];
  for (const file of files) {
    const name = String(file?.name ?? "");
    const size = Number(file?.size ?? 0);
    const contentType = attachmentMime(name);
    if (!contentType) {
      return { ok: false, message: `${name}: PDF, 이미지(PNG·JPG), ZIP, 오피스 문서만 올릴 수 있어요.` };
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_ATTACHMENT_BYTES) {
      return { ok: false, message: `${name}: 파일 하나는 10MB까지 올릴 수 있어요.` };
    }
    const path = `pending/${month}/${randomUUID()}/${safeFileName(name)}`;
    const { data, error } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[inquiry] signed upload url failed", error?.message);
      return { ok: false, message: "파일 업로드를 준비하지 못했어요. 파일 없이 접수하거나 메일로 보내주세요." };
    }
    tickets.push({ path: data.path, signedUrl: data.signedUrl, contentType });
  }
  return { ok: true, tickets };
}

type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>;

async function isRateLimited(supabase: ServiceClient, ipHash: string | null) {
  if (!ipHash) return false;
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (error) return false;
  return (count ?? 0) >= INQUIRY_RATE_LIMIT_PER_HOUR;
}

/** Drop attachment entries whose file never made it into Storage. */
async function keepUploaded(
  supabase: ServiceClient,
  attachments: InquiryAttachment[],
): Promise<InquiryAttachment[]> {
  const kept: InquiryAttachment[] = [];
  for (const attachment of attachments) {
    const folder = attachment.path.slice(0, attachment.path.lastIndexOf("/"));
    const file = attachment.path.slice(folder.length + 1);
    const { data } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .list(folder, { limit: 2, search: file });
    if (data?.some((entry) => entry.name === file)) {
      kept.push({ ...attachment, type: attachmentMime(file) ?? attachment.type });
    }
  }
  return kept;
}

async function readSource(formData: FormData): Promise<InquirySource> {
  const store = await cookies();
  const raw = parseJson<Record<string, unknown>>(
    safeDecode(store.get(SOURCE_COOKIE)?.value),
    {},
  );
  const source: InquirySource = {};
  const utmRaw = raw.utm;
  if (utmRaw && typeof utmRaw === "object") {
    const utm: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      const value = (utmRaw as Record<string, unknown>)[key];
      if (typeof value === "string" && value) utm[key] = value.slice(0, 120);
    }
    if (Object.keys(utm).length) source.utm = utm;
  }
  const referrer = clip(raw.referrer) ?? clip(formData.get("referrer"));
  if (referrer) source.referrer = referrer;
  const landing = clip(raw.landing);
  if (landing) source.landing = landing;
  const page = clip(formData.get("page"));
  if (page) source.page = page;
  const firstSeen = clip(raw.first_seen, 40);
  if (firstSeen) source.first_seen = firstSeen;
  return source;
}

async function notifyDiscord(id: string, data: z.infer<typeof inquirySchema>) {
  const webhook = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhook) return;
  const field = (name: string, value: string | null | undefined, inline = true) => ({
    name,
    value: (value || "-").slice(0, 1000),
    inline,
  });
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: `새 문의 — ${data.company || data.name}`,
            url: `${SITE_URL}/admin/inquiries/${id}`,
            color: 0x335aeb,
            fields: [
              field("이름", data.name),
              field("회사/브랜드", data.company),
              field("이메일", data.email),
              field("연락처", data.phone),
              field("종류", projectTypeLabels[data.project_type]),
              field("예산", data.budget ? budgetLabels[data.budget] : null),
              field("일정", data.timeline ? timelineLabels[data.timeline] : null),
              field("첨부", data.attachments.length ? `${data.attachments.length}개` : null),
              field("내용", data.message.slice(0, 500), false),
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (error) {
    console.error("[inquiry] discord webhook failed", error);
  }
}

function clientIp(requestHeaders: Headers) {
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return requestHeaders.get("x-real-ip")?.trim() || null;
}

/** Store a salted hash, never the raw IP. */
function hashIp(ip: string | null) {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || "pluck-inquiry";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function safeFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_.-]+|[_.-]+$/g, "")
    .slice(0, 80);
  return `${base || "file"}${ext ? `.${ext}` : ""}`;
}

function clip(value: unknown, max = 300) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function safeDecode(value: string | undefined) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

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
  DEV_FORM_SOURCE,
  GO_FORM_SOURCE,
  devVariantOf,
  formLabel,
  QUOTE_FORM_SOURCE,
  START_FORM_SOURCE,
  START_WANTS,
  timelineLabels,
  type StartWant,
} from "@/lib/crm/constants";
import { SITE_URL } from "@/lib/site";
import { lastTouchSummary, sanitizeTouch } from "@/lib/crm/attribution";
import {
  DESIGNS,
  describeAnswers,
  estimate,
  FEATURES,
  formatPrice,
  PROJECT_KINDS,
  SCALES,
  TIMELINES as QUOTE_TIMELINES,
  type QuoteAnswers,
} from "@/lib/quote/pricing";

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
  /** `lead` is true only for a real insert (not the honeypot), so the client fires conversion events once per inquiry. */
  | { status: "success"; lead?: boolean }
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

  const data = parsed.data;
  const attachments = await keepUploaded(supabase, data.attachments);
  return saveInquiry(supabase, formData, {
    ...data,
    email: data.email.toLowerCase(),
    attachments,
  });
}

const START_WANT_KEYS = Object.keys(START_WANTS) as [StartWant, ...StartWant[]];

const startSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(60, "이름은 60자 안으로 입력해 주세요."),
  contact: z
    .string()
    .trim()
    .min(1, "전화번호나 이메일을 입력해 주세요.")
    .max(120, "연락처가 너무 길어요."),
  want: z.enum(START_WANT_KEYS, "만들고 싶은 것을 골라 주세요."),
  message: z
    .string()
    .trim()
    .min(2, "한두 줄만 적어 주세요.")
    .max(1000, "설명은 1000자 안으로 적어 주세요."),
  consent_privacy: z.literal(true, "개인정보 수집·이용에 동의해 주세요."),
});

export type StartField = "name" | "contact" | "want" | "message" | "consent_privacy";
export type StartState =
  | { status: "idle" }
  | { status: "success"; lead?: boolean }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<StartField, string>> };

/**
 * Short lead form on /lp/start (Meta ads). Same table, rate limit, Discord alert and
 * attribution as /contact; one contact field takes either a phone number or an email.
 */
export async function submitStartInquiry(
  _prev: StartState,
  formData: FormData,
): Promise<StartState> {
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success" };
  }

  const supabase = createServiceClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const parsed = startSchema.safeParse({
    name: formData.get("name") ?? "",
    contact: formData.get("contact") ?? "",
    want: formData.get("want") ?? undefined,
    message: formData.get("message") ?? "",
    consent_privacy: formData.get("consent_privacy") === "on",
  });

  const fieldErrors: Partial<Record<StartField, string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as StartField;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
  }
  const contact = parsed.success ? splitContact(parsed.data.contact) : null;
  if (parsed.success && !contact) {
    fieldErrors.contact = "전화번호(숫자와 -) 또는 이메일 주소를 확인해 주세요.";
  }
  if (!parsed.success || !contact) {
    return {
      status: "error",
      message: "입력한 내용을 한 번 더 확인해 주세요.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const want = START_WANTS[data.want];
  return saveInquiry(
    supabase,
    formData,
    {
      name: data.name,
      company: null,
      // email is NOT NULL in the schema; phone-only leads store an empty string.
      email: contact.email ?? "",
      phone: contact.phone,
      project_type: want.type,
      budget: null,
      timeline: null,
      message: `만들고 싶은 것: ${want.label}\n\n${data.message}`,
      reference_urls: [],
      attachments: [],
    },
    START_FORM_SOURCE,
  );
}

const keysOf = <T extends object>(obj: T) => Object.keys(obj) as [keyof T & string, ...(keyof T & string)[]];

const quoteSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(60, "이름은 60자 안으로 입력해 주세요."),
  contact: z.string().trim().min(1, "전화번호나 이메일을 입력해 주세요.").max(120, "연락처가 너무 길어요."),
  memo: z.string().trim().max(1000, "메모는 1000자 안으로 적어 주세요."),
  kind: z.enum(keysOf(PROJECT_KINDS)),
  scale: z.enum(keysOf(SCALES)),
  features: z.array(z.enum(keysOf(FEATURES))).max(Object.keys(FEATURES).length),
  design: z.enum(keysOf(DESIGNS)),
  timeline: z.enum(keysOf(QUOTE_TIMELINES)),
  consent_privacy: z.literal(true, "개인정보 수집·이용에 동의해 주세요."),
});

export type QuoteField = "name" | "contact" | "memo" | "consent_privacy";
export type QuoteState =
  | { status: "idle" }
  | { status: "success"; lead?: boolean }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<QuoteField, string>> };

/**
 * 개발비 계산기(/lp/quote) 결과 화면의 "상세 견적서·기획안 받기" 폼. 답변으로 서버에서 다시 계산한
 * 참고 범위를 문의 본문에 붙여 오너가 바로 보게 한다.
 */
export async function submitQuoteInquiry(
  _prev: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  return quoteInquiry(formData, QUOTE_FORM_SOURCE);
}

/**
 * Main paid-ad landing page /lp/dev: same calculator answers + name/contact/설명, tagged
 * source.form = "lp-dev" and source.variant = the headline variant (?v=price|work|solo).
 */
export async function submitDevInquiry(
  _prev: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  const variant = devVariantOf(formData.get("variant"));
  return quoteInquiry(formData, DEV_FORM_SOURCE, { variant }, `[광고 LP v=${variant}]`);
}

/** 상세페이지형 ad landing page /lp/go: same calculator answers, tagged source.form = "lp-go". */
export async function submitGoInquiry(
  _prev: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  return quoteInquiry(formData, GO_FORM_SOURCE, undefined, "[광고 LP · 상세페이지형]");
}

async function quoteInquiry(
  formData: FormData,
  form: string,
  sourceExtra?: Partial<InquirySource>,
  header = "[개발비 계산기 답변]",
): Promise<QuoteState> {
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success" };
  }

  const supabase = createServiceClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const parsed = quoteSchema.safeParse({
    name: formData.get("name") ?? "",
    contact: formData.get("contact") ?? "",
    memo: formData.get("memo") ?? "",
    kind: formData.get("kind") ?? undefined,
    scale: formData.get("scale") ?? undefined,
    features: [...new Set(formData.getAll("features").map(String))],
    design: formData.get("design") ?? undefined,
    timeline: formData.get("timeline") ?? undefined,
    consent_privacy: formData.get("consent_privacy") === "on",
  });

  const fieldErrors: Partial<Record<QuoteField, string>> = {};
  let answersBroken = false;
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (key === "name" || key === "contact" || key === "memo" || key === "consent_privacy") {
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      } else answersBroken = true;
    }
  }
  if (answersBroken) {
    return { status: "error", message: "계산기 답변이 비어 있어요. 처음부터 다시 골라 주세요." };
  }
  const contact = parsed.success ? splitContact(parsed.data.contact) : null;
  if (parsed.success && !contact) {
    fieldErrors.contact = "전화번호(숫자와 -) 또는 이메일 주소를 확인해 주세요.";
  }
  if (!parsed.success || !contact) {
    return { status: "error", message: "입력한 내용을 한 번 더 확인해 주세요.", fieldErrors };
  }

  const data = parsed.data;
  const answers: QuoteAnswers = {
    kind: data.kind as QuoteAnswers["kind"],
    scale: data.scale as QuoteAnswers["scale"],
    features: data.features as QuoteAnswers["features"],
    design: data.design as QuoteAnswers["design"],
    timeline: data.timeline as QuoteAnswers["timeline"],
  };
  const result = estimate(answers);
  const message = [
    header,
    ...describeAnswers(answers),
    `계산기 참고 범위: ${formatPrice(result.price[0])} ~ ${formatPrice(result.price[1])}, ${result.weeks[0]}~${result.weeks[1]}주`,
    data.memo ? `\n메모: ${data.memo}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return saveInquiry(
    supabase,
    formData,
    {
      name: data.name,
      company: null,
      email: contact.email ?? "",
      phone: contact.phone,
      project_type: PROJECT_KINDS[answers.kind].type,
      budget: null,
      timeline: null,
      message,
      reference_urls: [],
      attachments: [],
    },
    form,
    sourceExtra,
  );
}

/** Phone number or email from one field. */
function splitContact(value: string): { email: string | null; phone: string | null } | null {
  if (value.includes("@")) {
    const email = z.email().safeParse(value);
    return email.success ? { email: email.data.toLowerCase(), phone: null } : null;
  }
  const digits = value.replace(/\D/g, "");
  if (!/^[0-9+\-() ]{7,30}$/.test(value) || digits.length < 8) return null;
  return { email: null, phone: value };
}

type InquiryInsert = {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  project_type: (typeof PROJECT_TYPES)[number];
  budget: (typeof BUDGETS)[number] | null;
  timeline: (typeof TIMELINES)[number] | null;
  message: string;
  reference_urls: string[];
  attachments: InquiryAttachment[];
};

/** Rate limit → insert → (after response) activity log + Discord. Shared by both public forms. */
async function saveInquiry(
  supabase: ServiceClient,
  formData: FormData,
  data: InquiryInsert,
  form?: string,
  sourceExtra?: Partial<InquirySource>,
): Promise<{ status: "success"; lead: true } | { status: "error"; message: string }> {
  const requestHeaders = await headers();
  const ipHash = hashIp(clientIp(requestHeaders));

  if (await isRateLimited(supabase, ipHash)) {
    return { status: "error", message: RATE_LIMITED };
  }

  const source = await readSource(formData);
  if (form) source.form = form;
  if (sourceExtra) Object.assign(source, sourceExtra);

  const { data: inserted, error } = await supabase
    .from("inquiries")
    .insert({
      ...data,
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
      actor: form ? `public:${form}` : "public:contact-form",
      entity: "inquiry",
      entity_id: inserted.id,
      action: "created",
      detail: {
        project_type: data.project_type,
        attachments: data.attachments.length,
        ...(form ? { form } : {}),
        ...(source.variant ? { variant: source.variant } : {}),
      },
    });
    await notifyDiscord(inserted.id, data, source);
  });

  return { status: "success", lead: true };
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
  // First/last touch live inside the existing source jsonb column, so no migration is needed.
  const firstTouch = sanitizeTouch(raw.first_touch);
  if (firstTouch) source.first_touch = firstTouch;
  const lastTouch = sanitizeTouch(raw.last_touch);
  if (lastTouch) source.last_touch = lastTouch;
  return source;
}

async function notifyDiscord(
  id: string,
  data: InquiryInsert,
  source: InquirySource,
) {
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
            title: `${formLabel(source) ? `[${formLabel(source)}] ` : ""}새 문의 — ${data.company || data.name}`,
            url: `${SITE_URL}/admin/inquiries/${id}`,
            color: 0x335aeb,
            fields: [
              field("이름", data.name),
              field("회사/브랜드", data.company),
              field("이메일", data.email || null),
              field("연락처", data.phone),
              field("종류", projectTypeLabels[data.project_type]),
              field("예산", data.budget ? budgetLabels[data.budget] : null),
              field("일정", data.timeline ? timelineLabels[data.timeline] : null),
              field("첨부", data.attachments.length ? `${data.attachments.length}개` : null),
              field("유입", lastTouchSummary(source)),
              field("접수 페이지", source.page),
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

import type {
  Budget,
  InquiryStatus,
  ProjectStatus,
  ProjectType,
  Timeline,
} from "@/lib/supabase/types";

/**
 * Copy shown after a successful inquiry. Only promise what the team can keep —
 * edit here if the response window changes.
 */
export const INQUIRY_SUCCESS = {
  title: "문의가 접수됐어요",
  body: "영업일 기준 1일 안에 남겨주신 이메일이나 연락처로 답장드릴게요. 급한 일이라면 아래 메일로 한 번 더 알려주세요.",
};

export const projectTypeLabels: Record<ProjectType, string> = {
  website: "웹사이트·홈페이지",
  webapp: "웹 서비스·플랫폼",
  app: "모바일 앱",
  ai_automation: "AI·업무 자동화",
  maintenance: "유지보수·개선",
  other: "기타",
};

export const budgetLabels: Record<Budget, string> = {
  under_3m: "300만원 미만",
  "3m_10m": "300~1000만원",
  "10m_30m": "1000~3000만원",
  over_30m: "3000만원 이상",
  undecided: "미정",
};

export const timelineLabels: Record<Timeline, string> = {
  asap: "최대한 빨리",
  within_1m: "1개월 안",
  "1m_3m": "1~3개월",
  after_3m: "3개월 이후",
  flexible: "일정 협의",
};

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  new: "신규",
  contacted: "연락함",
  quoted: "견적 전달",
  won: "수주",
  lost: "무산",
  on_hold: "보류",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "기획",
  contract: "계약",
  in_progress: "진행 중",
  review: "검수",
  done: "완료",
  maintenance: "유지보수",
  paused: "중단",
};

/** Statuses counted as "진행 중" on the dashboard. */
export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  "contract",
  "in_progress",
  "review",
];

/** Statuses whose contract amount counts toward 수주 금액 (planning = not signed yet). */
export const BOOKED_PROJECT_STATUSES: ProjectStatus[] = [
  "contract",
  "in_progress",
  "review",
  "done",
  "maintenance",
  "paused",
];

export const ATTACHMENT_BUCKET = "inquiry-files";
export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_REFERENCE_URLS = 5;
export const INQUIRY_RATE_LIMIT_PER_HOUR = 5;

/** Extension → MIME. The bucket's allowed_mime_types list must match. */
export const ATTACHMENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  zip: "application/zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_TYPES)
  .map((ext) => `.${ext}`)
  .join(",");

export function attachmentMime(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ATTACHMENT_TYPES[ext] ?? null;
}

export const SOURCE_COOKIE = "pluck_src";

const won = new Intl.NumberFormat("ko-KR");
export function formatWon(value: number | null | undefined) {
  return `${won.format(Math.round(value ?? 0))}원`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

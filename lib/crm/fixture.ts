import "server-only";
import type {
  ActivityLogRow,
  ClientRow,
  InquiryRow,
  ProjectPaymentRow,
  ProjectRow,
  ProjectTaskRow,
} from "@/lib/supabase/types";

/**
 * Development-only demo data for previewing the admin UI (CRM_FIXTURE=1 with
 * `next dev`). Every name here is fictional sample data.
 */
const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();
const date = (offsetDays: number) => iso(offsetDays).slice(0, 10);

export const fixtureInquiries: InquiryRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    created_at: iso(-0.2),
    name: "김샘플",
    company: "샘플 베이커리",
    email: "sample@example.com",
    phone: "010-0000-0000",
    project_type: "website",
    budget: "3m_10m",
    timeline: "within_1m",
    message: "매장 소개와 예약 문의를 받을 수 있는 홈페이지가 필요해요. 메뉴판과 지도, 인스타그램 연동이 꼭 있었으면 합니다.",
    reference_urls: ["https://example.com"],
    attachments: [],
    source: { utm: { utm_source: "naver", utm_medium: "cpc" }, landing: "/", page: "/contact" },
    status: "new",
    admin_memo: null,
    consent_privacy: true,
    ip_hash: null,
    user_agent: null,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    created_at: iso(-2),
    name: "이데모",
    company: "데모 러닝",
    email: "demo@example.com",
    phone: null,
    project_type: "webapp",
    budget: "10m_30m",
    timeline: "1m_3m",
    message: "학원 학부모용 출결·상담 예약 웹앱. 원장님이 쓰는 관리자 화면과 알림톡이 필요합니다.",
    reference_urls: [],
    attachments: [{ path: "pending/demo/brief.pdf", name: "기획서.pdf", size: 820000, type: "application/pdf" }],
    source: { referrer: "https://www.google.com/", landing: "/work/category/client", page: "/contact" },
    status: "quoted",
    admin_memo: "화요일 통화. 견적서 v1 전달.",
    consent_privacy: true,
    ip_hash: null,
    user_agent: null,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    created_at: iso(-9),
    name: "박예시",
    company: null,
    email: "example@example.com",
    phone: null,
    project_type: "ai_automation",
    budget: "undecided",
    timeline: "flexible",
    message: "매주 반복되는 엑셀 정리와 보고서 작성을 자동화하고 싶어요.",
    reference_urls: [],
    attachments: [],
    source: { landing: "/" },
    status: "won",
    admin_memo: null,
    consent_privacy: true,
    ip_hash: null,
    user_agent: null,
  },
];

export const fixtureClients: ClientRow[] = [
  {
    id: "00000000-0000-4000-9000-000000000001",
    created_at: iso(-40),
    name: "최가상",
    company: "가상 커머스",
    email: "virtual@example.com",
    phone: null,
    memo: "유지보수 월 계약",
  },
  {
    id: "00000000-0000-4000-9000-000000000002",
    created_at: iso(-9),
    name: "박예시",
    company: null,
    email: "example@example.com",
    phone: null,
    memo: null,
  },
];

export const fixtureProjects: ProjectRow[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    created_at: iso(-38),
    client_id: fixtureClients[0].id,
    inquiry_id: null,
    name: "가상 커머스 리뉴얼",
    type: "webapp",
    status: "in_progress",
    start_date: date(-30),
    due_date: date(6),
    contract_amount: 18000000,
    paid_amount: 9000000,
    repo_url: "https://github.com/example/demo",
    live_url: null,
    notes: "2차 디자인 검수 대기",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    created_at: iso(-8),
    client_id: fixtureClients[1].id,
    inquiry_id: fixtureInquiries[2].id,
    name: "보고서 자동화",
    type: "ai_automation",
    status: "contract",
    start_date: date(2),
    due_date: date(24),
    contract_amount: 4500000,
    paid_amount: 0,
    repo_url: null,
    live_url: null,
    notes: null,
  },
];

export const fixtureTasks: ProjectTaskRow[] = [
  ["요구사항 정리", true],
  ["디자인 시안", true],
  ["상품·주문 화면 개발", false],
  ["결제 연동", false],
].map(([title, done], index) => ({
  id: `00000000-0000-4000-b000-00000000000${index + 1}`,
  created_at: iso(-30 + index),
  project_id: fixtureProjects[0].id,
  title: String(title),
  done: Boolean(done),
  due_date: null,
  sort: index,
}));

export const fixturePayments: ProjectPaymentRow[] = [
  {
    id: "00000000-0000-4000-c000-000000000001",
    created_at: iso(-30),
    project_id: fixtureProjects[0].id,
    label: "계약금",
    amount: 9000000,
    due_date: date(-30),
    paid_at: date(-29),
  },
  {
    id: "00000000-0000-4000-c000-000000000002",
    created_at: iso(-30),
    project_id: fixtureProjects[0].id,
    label: "잔금",
    amount: 9000000,
    due_date: date(6),
    paid_at: null,
  },
  {
    id: "00000000-0000-4000-c000-000000000003",
    created_at: iso(-8),
    project_id: fixtureProjects[1].id,
    label: "계약금",
    amount: 2250000,
    due_date: date(2),
    paid_at: null,
  },
];

export const fixtureActivity: ActivityLogRow[] = [
  {
    id: "00000000-0000-4000-d000-000000000001",
    created_at: iso(-2),
    actor: "public:contact-form",
    entity: "inquiry",
    entity_id: fixtureInquiries[1].id,
    action: "created",
    detail: {},
  },
  {
    id: "00000000-0000-4000-d000-000000000002",
    created_at: iso(-1),
    actor: "dev@fixture.local",
    entity: "inquiry",
    entity_id: fixtureInquiries[1].id,
    action: "status_changed",
    detail: { from: "new", to: "quoted" },
  },
];

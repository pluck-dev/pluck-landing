/**
 * Hand-written to match supabase/migrations/0001_crm.sql.
 * Change both together (or regenerate with `supabase gen types typescript`).
 */

export const PROJECT_TYPES = [
  "website",
  "webapp",
  "app",
  "ai_automation",
  "maintenance",
  "other",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const BUDGETS = [
  "under_3m",
  "3m_10m",
  "10m_30m",
  "over_30m",
  "undecided",
] as const;
export type Budget = (typeof BUDGETS)[number];

export const TIMELINES = [
  "asap",
  "within_1m",
  "1m_3m",
  "after_3m",
  "flexible",
] as const;
export type Timeline = (typeof TIMELINES)[number];

export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
  "on_hold",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const PROJECT_STATUSES = [
  "planning",
  "contract",
  "in_progress",
  "review",
  "done",
  "maintenance",
  "paused",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PAYMENT_LABELS = ["계약금", "중도금", "잔금", "유지보수", "기타"] as const;
export type PaymentLabel = (typeof PAYMENT_LABELS)[number];

export const ACTIVITY_ENTITIES = [
  "inquiry",
  "client",
  "project",
  "task",
  "payment",
] as const;
export type ActivityEntity = (typeof ACTIVITY_ENTITIES)[number];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InquiryAttachment = {
  path: string;
  name: string;
  size: number;
  type: string;
};

export type InquirySource = {
  utm?: Record<string, string>;
  referrer?: string;
  landing?: string;
  page?: string;
  first_seen?: string;
};

export type AdminRow = { email: string; created_at: string };

export type InquiryRow = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  project_type: ProjectType;
  budget: Budget | null;
  timeline: Timeline | null;
  message: string;
  reference_urls: string[];
  attachments: InquiryAttachment[];
  source: InquirySource;
  status: InquiryStatus;
  admin_memo: string | null;
  consent_privacy: boolean;
  ip_hash: string | null;
  user_agent: string | null;
};

export type ClientRow = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  memo: string | null;
};

export type ProjectRow = {
  id: string;
  created_at: string;
  client_id: string;
  inquiry_id: string | null;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  contract_amount: number;
  paid_amount: number;
  repo_url: string | null;
  live_url: string | null;
  notes: string | null;
};

export type ProjectTaskRow = {
  id: string;
  created_at: string;
  project_id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  sort: number;
};

export type ProjectPaymentRow = {
  id: string;
  created_at: string;
  project_id: string;
  label: PaymentLabel;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
};

export type ActivityLogRow = {
  id: string;
  created_at: string;
  actor: string;
  entity: ActivityEntity;
  entity_id: string;
  action: string;
  detail: Json;
};

/** Insert = Row with server defaults optional. */
type Insertable<Row, Required extends keyof Row> = Pick<Row, Required> &
  Partial<Omit<Row, Required>>;

type Table<Row, Required extends keyof Row, Relationships = []> = {
  Row: Row;
  Insert: Insertable<Row, Required>;
  Update: Partial<Row>;
  Relationships: Relationships;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      admins: Table<AdminRow, "email">;
      inquiries: Table<
        InquiryRow,
        "name" | "email" | "project_type" | "message"
      >;
      clients: Table<ClientRow, "name">;
      projects: Table<
        ProjectRow,
        "client_id" | "name",
        [
          {
            foreignKeyName: "projects_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_inquiry_id_fkey";
            columns: ["inquiry_id"];
            isOneToOne: false;
            referencedRelation: "inquiries";
            referencedColumns: ["id"];
          },
        ]
      >;
      project_tasks: Table<
        ProjectTaskRow,
        "project_id" | "title",
        [
          {
            foreignKeyName: "project_tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ]
      >;
      project_payments: Table<
        ProjectPaymentRow,
        "project_id" | "label" | "amount",
        [
          {
            foreignKeyName: "project_payments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ]
      >;
      activity_log: Table<
        ActivityLogRow,
        "actor" | "entity" | "entity_id" | "action"
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      purge_expired_inquiries: { Args: Record<string, never>; Returns: number };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

/**
 * Supabase env is optional: every caller must handle "not configured" so the
 * public site builds and runs before keys exist (contact form → mailto fallback).
 */

export const DEFAULT_ADMIN_EMAILS = "admin@pluck.co.kr";

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

export function supabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

export function serviceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
}

/** Public inquiry form: URL + service role (server action writes with it). */
export function isInquiryConfigured() {
  return Boolean(supabaseUrl() && serviceRoleKey());
}

/** Admin auth: URL + anon key (cookie session, RLS-scoped). */
export function isAuthConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/** ADMIN_EMAILS (comma separated). Access also requires a row in public.admins. */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Dev-only fixture mode for previewing the admin UI without Supabase.
 * `NODE_ENV === "development"` is false in every production build, so this
 * can never switch on in a deployed site.
 */
export function isCrmFixture() {
  return (
    process.env.NODE_ENV === "development" && process.env.CRM_FIXTURE === "1"
  );
}

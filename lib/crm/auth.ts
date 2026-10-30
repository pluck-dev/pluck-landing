import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { adminEmails, isCrmFixture } from "@/lib/supabase/env";
import { createSessionClient, type SessionClient } from "@/lib/supabase/server";

export type AdminSession =
  | { email: string; fixture: false; supabase: SessionClient }
  | { email: string; fixture: true; supabase: null };

/**
 * Real authorization check (proxy.ts is only optimistic). An admin must be
 * signed in, listed in ADMIN_EMAILS, and present in public.admins — the last
 * one is what RLS enforces, so the UI never shows a session that can't read data.
 */
export async function getAdmin(
  client?: SessionClient,
): Promise<AdminSession | null> {
  // Always per-request: never prerender an admin decision at build time.
  await connection();
  if (isCrmFixture()) {
    return { email: "dev@fixture.local", fixture: true, supabase: null };
  }
  const supabase = client ?? (await createSessionClient());
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) return null;
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) return null;
  return { email, fixture: false, supabase };
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login?error=forbidden");
  return admin;
}

/** Pre-login allowlist check, so magic links only go to admin addresses. */
export async function isAllowedAdminEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!adminEmails().includes(normalized)) return false;
  const service = createServiceClient();
  // Without the service key we can't read public.admins; RLS still blocks
  // non-members after sign-in, so the env list alone is an acceptable gate.
  if (!service) return true;
  const { data, error } = await service
    .from("admins")
    .select("email")
    .eq("email", normalized)
    .maybeSingle();
  return !error && Boolean(data);
}

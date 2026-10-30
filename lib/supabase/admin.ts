import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serviceRoleKey, supabaseUrl } from "./env";
import type { Database } from "./types";

/**
 * Service-role client: bypasses RLS. Only for the public inquiry server action,
 * the login allowlist check and other server-side code that has already
 * validated its input. Returns null when env is missing.
 */
export function createServiceClient() {
  const url = supabaseUrl();
  const key = serviceRoleKey();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

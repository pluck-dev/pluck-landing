import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";
import type { Database } from "./types";

/**
 * Cookie-session client for Server Components, Server Functions and Route
 * Handlers. Queries run as the signed-in user, so RLS (public.is_admin()) applies.
 * Create one per request. Returns null when env is missing.
 */
export async function createSessionClient() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component: cookies are read-only there.
          // proxy.ts refreshes the session on every /admin request instead.
        }
      },
    },
  });
}

export type SessionClient = NonNullable<
  Awaited<ReturnType<typeof createSessionClient>>
>;

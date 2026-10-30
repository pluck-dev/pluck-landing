"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Browser cookie-session client (same session the proxy and server pages read).
 * One instance per tab so auth refresh and the realtime socket are shared.
 * Every query runs as the signed-in user — RLS (public.is_admin()) applies.
 */
export function browserClient() {
  client ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
}

export type BrowserClient = ReturnType<typeof browserClient>;

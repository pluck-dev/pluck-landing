"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Magic-link landing for the implicit flow. The session arrives in the URL hash
 * (#access_token=…&refresh_token=…), which only the browser can read; we hand it to
 * the @supabase/ssr browser client so it is stored as the same cookie session the
 * server-side admin pages use, then move on to /admin.
 */
export default function AdminAuthConfirmPage() {
  const [message, setMessage] = useState("로그인 중이에요…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const search = new URLSearchParams(window.location.search);
    const nextParam = search.get("next") ?? "/admin";
    const next = nextParam.startsWith("/admin") && !nextParam.startsWith("//") ? nextParam : "/admin";

    const errorDescription = hash.get("error_description") || search.get("error_description");
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (errorDescription || !accessToken || !refreshToken) {
      window.location.replace("/admin/login?error=link");
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setMessage("로그인에 실패했어요. 다시 시도해 주세요.");
          window.location.replace("/admin/login?error=link");
          return;
        }
        // Admin membership is re-checked server-side on /admin.
        window.location.replace(next);
      });
  }, []);

  return (
    <main className="adm-login">
      <div className="adm-login-card">
        <p className="adm-login-brand">
          pluck<span>®</span>
        </p>
        <p className="adm-muted" role="status">
          {message}
        </p>
      </div>
    </main>
  );
}

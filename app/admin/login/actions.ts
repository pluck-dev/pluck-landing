"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdmin, isAllowedAdminEmail } from "@/lib/crm/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email?: string };

const NOT_CONFIGURED = "Supabase 환경 변수가 설정되지 않아 로그인할 수 없어요.";

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { status: "error", message: "이메일 주소를 확인해 주세요." };
  const email = parsed.data;

  const supabase = await createSessionClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED, email };

  // Same response either way so the form can't be used to probe admin addresses.
  if (await isAllowedAdminEmail(email)) {
    const origin = (await headers()).get("origin") || SITE_URL;
    const next = safeNext(formData.get("next"));
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/admin/auth/callback?next=${encodeURIComponent(next)}`,
        shouldCreateUser: true,
      },
    });
    if (error) {
      console.error("[admin] magic link failed", error.message);
      return {
        status: "error",
        message: "메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
        email,
      };
    }
  }
  return { status: "sent", email };
}

export async function verifyLoginCode(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "").replace(/\s/g, "");
  if (!/^\d{6,10}$/.test(token)) {
    return { status: "error", message: "메일로 받은 숫자 코드를 입력해 주세요.", email };
  }
  const supabase = await createSessionClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED, email };
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) {
    return { status: "error", message: "코드가 맞지 않거나 만료됐어요.", email };
  }
  if (!(await getAdmin(supabase))) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=forbidden");
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

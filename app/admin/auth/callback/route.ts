import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getAdmin } from "@/lib/crm/auth";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Magic-link landing. Handles both the default PKCE link (?code=) and the
 * token-hash template variant (?token_hash=&type=), then re-checks admin access.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const nextParam = searchParams.get("next") ?? "/admin";
  const next = nextParam.startsWith("/admin") && !nextParam.startsWith("//") ? nextParam : "/admin";
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const supabase = await createSessionClient();
  if (!supabase) return to("/admin/login?error=config");

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let error: { message: string } | null = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else {
    return to("/admin/login?error=link");
  }
  if (error) return to("/admin/login?error=link");

  if (!(await getAdmin(supabase))) {
    await supabase.auth.signOut();
    return to("/admin/login?error=forbidden");
  }
  return to(next);
}

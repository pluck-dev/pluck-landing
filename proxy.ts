import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  isCrmFixture,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/env";

/**
 * /admin gate: refreshes the Supabase session cookie and sends signed-out
 * visitors to /admin/login. This is only the optimistic check — the admin
 * layout and every admin Server Function re-verify with requireAdmin().
 */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    if (isPublic || isCrmFixture()) return NextResponse.next();
    return redirectToLogin(request);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([header, value]) =>
          response.headers.set(header, value),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    const redirect = redirectToLogin(request);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function redirectToLogin(request: NextRequest) {
  const login = request.nextUrl.clone();
  login.pathname = "/admin/login";
  login.search = "";
  if (request.nextUrl.pathname !== "/admin") {
    login.searchParams.set("next", request.nextUrl.pathname);
  }
  const res = NextResponse.redirect(login);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/crm/auth";
import { isAuthConfigured, isCrmFixture } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "로그인" };

const ERRORS: Record<string, string> = {
  forbidden: "관리자로 등록된 계정이 아니에요. 등록된 이메일로 다시 로그인해 주세요.",
  link: "로그인 링크가 만료됐거나 이미 사용됐어요. 새 링크를 받아 주세요.",
  config: "Supabase 환경 변수가 설정되지 않았어요.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  const next = typeof params.next === "string" ? params.next : "/admin";
  const configured = isAuthConfigured();

  if ((configured || isCrmFixture()) && !error && (await getAdmin())) redirect("/admin");

  return (
    <main className="adm-login">
      <div className="adm-login-card">
        <p className="adm-login-brand">
          pluck<span>®</span>
        </p>
        <h1>관리자 로그인</h1>
        <p className="adm-muted">
          등록된 관리자 이메일로 로그인 링크를 보내드려요. 비밀번호는 없어요.
        </p>
        {error && (
          <p className="adm-alert" role="alert">
            {error}
          </p>
        )}
        {configured ? (
          <LoginForm next={next} />
        ) : (
          <p className="adm-alert adm-alert-muted">
            NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않아
            로그인을 사용할 수 없어요. supabase/README.md 를 참고해 환경 변수를
            추가한 뒤 다시 배포해 주세요.
          </p>
        )}
      </div>
    </main>
  );
}

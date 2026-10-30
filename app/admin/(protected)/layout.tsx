import { requireAdmin } from "@/lib/crm/auth";
import { signOut } from "../login/actions";
import { AdminNav } from "./nav";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="adm-app">
      <aside className="adm-side">
        <a className="adm-brand" href="/admin">
          pluck<span>®</span>
          <small>관리자</small>
        </a>
        <AdminNav />
        <div className="adm-side-foot">
          <span className="adm-user" title={admin.email}>
            {admin.email}
          </span>
          {admin.fixture ? (
            <span className="adm-badge adm-badge-warn">데모 데이터</span>
          ) : (
            <form action={signOut}>
              <button className="adm-link-btn">로그아웃</button>
            </form>
          )}
        </div>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Briefcase, Inbox, LayoutDashboard, Users, X } from "lucide-react";
import { signOut } from "../../login/actions";
import { ClientDetailView, ClientListView } from "./clients";
import { DashboardView } from "./dashboard";
import { InquiryDetailView, InquiryListView } from "./inquiries";
import { ProjectDetailView, ProjectListView } from "./projects";
import { AdminProvider, navigate, useAdmin, useTable, type Seed } from "./store";
import { AdminLink, Empty } from "./ui";

const items = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, key: "d" },
  { href: "/admin/inquiries", label: "문의", icon: Inbox, key: "i" },
  { href: "/admin/projects", label: "프로젝트", icon: Briefcase, key: "p" },
  { href: "/admin/clients", label: "고객", icon: Users, key: "c" },
] as const;

export function AdminShell({
  email,
  fixture,
  children,
}: {
  email: string;
  fixture: Seed | null;
  children: React.ReactNode;
}) {
  return (
    <AdminProvider email={email} fixture={fixture}>
      <div className="adm-app">
        <aside className="adm-side">
          <AdminLink className="adm-brand" href="/admin">
            pluck<span>®</span>
            <small>관리자</small>
          </AdminLink>
          <Nav />
          <SideFoot />
        </aside>
        <div className="adm-main">{children}</div>
      </div>
      <Toasts />
      <Shortcuts />
    </AdminProvider>
  );
}

function Nav() {
  const pathname = usePathname();
  const inquiries = useTable("inquiries");
  const { unseenInquiries, clearUnseen } = useAdmin();
  const newCount = useMemo(
    () => inquiries.data?.filter((i) => i.status === "new").length ?? 0,
    [inquiries.data],
  );
  useEffect(() => {
    if (pathname.startsWith("/admin/inquiries")) clearUnseen();
  }, [pathname, clearUnseen]);

  return (
    <nav className="adm-nav" aria-label="관리자 메뉴">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <AdminLink key={href} href={href} aria-current={active ? "page" : undefined}>
            <Icon size={17} aria-hidden="true" />
            {label}
            {href === "/admin/inquiries" && newCount > 0 && (
              <span
                className={`adm-nav-count ${unseenInquiries ? "is-pulse" : ""}`}
                aria-label={`신규 ${newCount}건`}
              >
                {newCount}
              </span>
            )}
          </AdminLink>
        );
      })}
    </nav>
  );
}

function SideFoot() {
  const { email, fixture, live } = useAdmin();
  return (
    <div className="adm-side-foot">
      <span className={`adm-live is-${live}`} role="status" title="Supabase Realtime 연결 상태">
        <i aria-hidden="true" />
        {live === "live" ? "실시간" : live === "connecting" ? "연결 중" : fixture ? "데모" : "오프라인"}
      </span>
      <p className="adm-keys" aria-label="키보드 단축키">
        <kbd>g</kbd> <kbd>d</kbd> 대시보드 · <kbd>g</kbd> <kbd>i</kbd> 문의
        <br />
        <kbd>g</kbd> <kbd>p</kbd> 프로젝트 · <kbd>g</kbd> <kbd>c</kbd> 고객
        <br />
        <kbd>/</kbd> 검색 · <kbd>Esc</kbd> 입력 해제
      </p>
      <span className="adm-user" title={email}>
        {email}
      </span>
      {fixture ? (
        <span className="adm-badge adm-badge-warn">데모 데이터</span>
      ) : (
        <form action={signOut}>
          <button className="adm-link-btn">로그아웃</button>
        </form>
      )}
    </div>
  );
}

function Toasts() {
  const { toasts, dismiss } = useAdmin();
  return (
    <div className="adm-toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`adm-toast is-${t.tone}`} role={t.tone === "error" ? "alert" : "status"}>
          {t.href ? (
            <AdminLink href={t.href} onClick={() => dismiss(t.id)}>
              {t.text}
            </AdminLink>
          ) : (
            <span>{t.text}</span>
          )}
          <button type="button" className="adm-icon-btn" aria-label="닫기" onClick={() => dismiss(t.id)}>
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

/** g d / g i / g p / g c switch tabs, / focuses the page search. */
function Shortcuts() {
  useEffect(() => {
    let pendingG = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) {
        if (e.key === "Escape") el.blur();
        return;
      }
      if (e.key === "/") {
        const search = document.querySelector<HTMLInputElement>("[data-admin-search]");
        if (search) {
          e.preventDefault();
          search.focus();
          search.select();
        }
        return;
      }
      if (e.key === "g") {
        pendingG = Date.now();
        return;
      }
      if (pendingG && Date.now() - pendingG < 1200) {
        const item = items.find((i) => i.key === e.key);
        pendingG = 0;
        if (item) {
          e.preventDefault();
          navigate(item.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

const UUID = /^[0-9a-f-]{36}$/i;

/** Client-side router for every /admin/* path (one shell, no server round trips). */
export function AdminRoutes() {
  const pathname = usePathname();
  const [, section, id, ...rest] = pathname.replace(/\/+$/, "").split("/").slice(1);
  useEffect(() => {
    const titles: Record<string, string> = {
      inquiries: "문의",
      projects: "프로젝트",
      clients: "고객",
    };
    document.title = `${section ? titles[section] ?? "관리자" : "대시보드"} | PLUCK 관리자`;
  }, [section]);

  if (rest.length || (id && !UUID.test(id))) return <NotFound />;
  switch (section) {
    case undefined:
      return <DashboardView />;
    case "inquiries":
      return id ? <InquiryDetailView key={id} id={id} /> : <InquiryListView />;
    case "projects":
      return id ? <ProjectDetailView key={id} id={id} /> : <ProjectListView />;
    case "clients":
      return id ? <ClientDetailView key={id} id={id} /> : <ClientListView />;
    default:
      return <NotFound />;
  }
}

function NotFound() {
  return (
    <Empty>
      없는 페이지예요. <AdminLink href="/admin">대시보드로</AdminLink>
    </Empty>
  );
}

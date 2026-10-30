"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Inbox, LayoutDashboard, Users } from "lucide-react";

const items = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "문의", icon: Inbox },
  { href: "/admin/projects", label: "프로젝트", icon: Briefcase },
  { href: "/admin/clients", label: "고객", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="adm-nav" aria-label="관리자 메뉴">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            <Icon size={17} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

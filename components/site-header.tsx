"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Work", href: "#showreel" },
  { label: "Capabilities", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#stats" },
  { label: "Engagement", href: "#pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full glass px-3.5 py-2 sm:mt-4 sm:px-5">
        <Link
          href="#top"
          className="flex items-center gap-2 font-heading text-[15px] font-semibold tracking-tight sm:text-base"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 shadow-[0_0_18px_oklch(0.78_0.22_305_/_0.6)]">
            <span className="absolute inset-[2px] rounded-full bg-background/90" />
            <span className="relative font-mono text-[10px] font-bold gradient-text">
              P
            </span>
          </span>
          <span>PLUCK</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            asChild
            size="sm"
            className="hidden h-9 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-4 text-[13px] font-semibold text-black shadow-[0_0_22px_oklch(0.78_0.22_305_/_0.45)] hover:opacity-90 sm:inline-flex"
          >
            <Link href="#contact">프로젝트 문의 →</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="메뉴 열기"
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground transition hover:bg-white/[0.1] lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "mx-auto mt-2 max-w-6xl rounded-3xl glass p-4 lg:hidden"
            )}
          >
            <ul className="grid gap-1">
              {NAV.map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-base text-foreground/90 transition hover:bg-white/[0.06] hover:text-foreground"
                  >
                    <span>{n.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      0{i + 1}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-3 px-1">
              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-[15px] font-semibold text-black shadow-[0_0_28px_oklch(0.78_0.22_305_/_0.5)]"
              >
                <Link href="#contact" onClick={() => setOpen(false)}>
                  프로젝트 문의 →
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const PRODUCT = [
  { l: "Work", h: "#showreel" },
  { l: "Capabilities", h: "#services" },
  { l: "Process", h: "#process" },
  { l: "Engagement", h: "#pricing" },
];
const COMPANY = [
  { l: "About", h: "#stats" },
  { l: "FAQ", h: "#faq" },
  { l: "Privacy", h: "#" },
];

export function Footer() {
  return (
    <footer className="relative pb-10 pt-24">
      <div className="pointer-events-none overflow-hidden">
        <div
          aria-hidden
          className="flex shrink-0 whitespace-nowrap animate-[marquee_28s_linear_infinite] gap-12 pb-12"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="font-heading text-[4rem] font-black leading-none tracking-tighter gradient-text opacity-60 sm:text-[8rem] md:text-[12rem]"
            >
              PLUCK · CRAFT · SHIP ·
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link
            href="#top"
            className="inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
          >
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400">
              <span className="absolute inset-[2px] rounded-full bg-background/90" />
              <span className="relative font-mono text-[10px] font-bold gradient-text">
                P
              </span>
            </span>
            PLUCK
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            본질을 뽑아 제품으로 만드는 디지털 프로덕트 스튜디오.
            8년간 120개 제품, 평균 만족도 4.9.
          </p>
        </div>

        <div>
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Product
          </div>
          <ul className="space-y-2">
            {PRODUCT.map((c) => (
              <li key={c.l}>
                <Link
                  href={c.h}
                  className="text-sm text-foreground/80 transition hover:text-fuchsia-300"
                >
                  {c.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Company
          </div>
          <ul className="space-y-2">
            {COMPANY.map((c) => (
              <li key={c.l}>
                <Link
                  href={c.h}
                  className="text-sm text-foreground/80 transition hover:text-fuchsia-300"
                >
                  {c.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Contact
          </div>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li>hello@pluck.studio</li>
            <li>+82 02-0000-0000</li>
            <li>Seoul, KR</li>
          </ul>
        </div>
      </div>

      <Separator className="mx-auto mt-12 max-w-6xl bg-white/[0.06]" />

      <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          © {new Date().getFullYear()} PLUCK STUDIO — CRAFT · SHIP · REPEAT
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Built with Next.js · shadcn · motion
        </div>
      </div>
    </footer>
  );
}

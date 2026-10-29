import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CONTACT_EMAIL, GITHUB_URL } from "@/lib/site";

/**
 * Header, contact block and footer shared by the home page and /work/[slug].
 * `home` keeps in-page anchors; sub-pages link back to the same anchors on "/".
 */
function anchor(home: boolean, id: string) {
  return home ? `#${id}` : `/#${id}`;
}

export { CONTACT_EMAIL };

export function contactMail(subject = "PLUCK 프로젝트 문의") {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export const CONTACT_MAIL = contactMail();

const navItems = [
  ["work", "포트폴리오"],
  ["services", "서비스"],
  ["process", "진행 방식"],
  ["faq", "FAQ"],
] as const;

export function StudioHeader({ home = false }: { home?: boolean }) {
  const href = (id: string) => anchor(home, id);
  return (
    <>
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link
            className="wordmark"
            href={home ? "#top" : "/"}
            aria-label="PLUCK 홈"
          >
            pluck<span>®</span>
          </Link>
          <nav className="desktop-nav" aria-label="주요 메뉴">
            {navItems.map(([id, label]) => (
              <Link key={id} href={href(id)}>
                {label}
              </Link>
            ))}
          </nav>
          <a className="header-contact" href={CONTACT_MAIL}>
            상담하기
          </a>
        </div>
        <nav className="mobile-nav shell" aria-label="모바일 메뉴">
          {navItems.map(([id, label]) => (
            <Link key={id} href={href(id)}>
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}

export function ContactSection({
  subject = "PLUCK 프로젝트 문의",
}: {
  subject?: string;
}) {
  return (
    <section
      className="contact-section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="shell contact-inner">
        <h2 id="contact-title">
          아이디어가 있다면,
          <br />
          지금 이야기해 주세요.
        </h2>
        <div className="contact-side">
          <p>
            아직 정리되지 않은 생각이어도 괜찮습니다. 해결하고 싶은 문제만
            알려주시면, 무엇부터 만들지 함께 정리해 드립니다.
          </p>
          <a className="button button-ink" href={contactMail(subject)}>
            프로젝트 상담하기 <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </section>
  );
}

export function StudioFooter() {
  return (
    <footer className="shell footer">
      <Link className="wordmark" href="/" aria-label="PLUCK 홈">
        pluck<span>®</span>
      </Link>
      <span>© {new Date().getFullYear()} PLUCK</span>
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
      <a href="#top">맨 위로 ↑</a>
    </footer>
  );
}

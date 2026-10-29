import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Header, contact block and footer shared by the home page and /work/[slug].
 * `home` keeps in-page anchors; sub-pages link back to the same anchors on "/".
 */
function anchor(home: boolean, id: string) {
  return home ? `#${id}` : `/#${id}`;
}

export function StudioHeader({ home = false }: { home?: boolean }) {
  const href = (id: string) => anchor(home, id);
  return (
    <>
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="wordmark" href={home ? "#top" : "/"} aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <nav className="desktop-nav" aria-label="주요 메뉴">
            <Link href={href("showreel")}>Work</Link>
            <Link href={href("index")}>Index</Link>
            <Link href={href("services")}>Expertise</Link>
            <Link href={href("process")}>Approach</Link>
          </nav>
          <Link className="header-contact" href={href("contact")}>
            Let’s talk <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <nav className="mobile-nav shell" aria-label="모바일 메뉴">
          <Link href={href("showreel")}>프로젝트</Link>
          <Link href={href("index")}>인덱스</Link>
          <Link href={href("services")}>서비스</Link>
          <Link href={href("process")}>진행 방식</Link>
          <Link href={href("faq")}>FAQ</Link>
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
    <section className="contact-section" id="contact" data-scene="contact">
      <div className="shell">
        <p className="eyebrow">HAVE SOMETHING IN MIND?</p>
        <a
          className="contact-title"
          href={`mailto:hello@pluck.co.kr?subject=${encodeURIComponent(subject)}`}
        >
          Let’s make
          <br />
          <span>it happen.</span>
          <ArrowUpRight aria-hidden="true" />
        </a>
        <div className="contact-bottom">
          <p>
            아직 정리되지 않은 생각도 좋습니다.
            <br />
            이야기에서부터 시작해요.
          </p>
          <div>
            <a href="mailto:hello@pluck.co.kr">hello@pluck.co.kr</a>
            <small>이메일 앱으로 연결됩니다.</small>
          </div>
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
      <span>Independent in Seoul. Open to everywhere.</span>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}

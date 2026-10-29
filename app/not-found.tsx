import type { Metadata } from "next";
import Link from "next/link";
import { StudioFooter, StudioHeader } from "@/components/site-chrome";
import { categoryOrder } from "@/lib/portfolio";
import { categoryPages } from "@/lib/site";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <StudioHeader />
      <main id="main" className="shell not-found">
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>
          주소가 바뀌었거나 없는 페이지입니다. 아래에서 PLUCK의 작업과 서비스를
          둘러보세요.
        </p>
        <div className="not-found-actions">
          <Link className="button button-primary" href="/">
            홈으로 가기
          </Link>
          <Link className="button button-ghost" href="/#work">
            전체 포트폴리오 보기
          </Link>
        </div>
        <nav className="hub-nav" aria-label="포트폴리오 분야">
          {categoryOrder.map((id) => (
            <Link key={id} href={`/work/category/${id}`}>
              {categoryPages[id].label} 포트폴리오
            </Link>
          ))}
          <Link href="/#services">서비스 소개</Link>
          <Link href="/#faq">자주 묻는 질문</Link>
        </nav>
      </main>
      <StudioFooter />
    </>
  );
}

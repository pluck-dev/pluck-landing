import type { Metadata } from "next";
import Link from "next/link";
import { StudioFooter, StudioHeader } from "@/components/site-chrome";
import { baseOpenGraph, CONTACT_EMAIL, defaultOgImage } from "@/lib/site";

/**
 * 사업자 정보. 빈 문자열은 화면에 표시하지 않으니, 확정되면 채워 넣으세요.
 * EFFECTIVE_DATE 는 방침을 바꿀 때마다 갱신합니다.
 */
const COMPANY = {
  name: "PLUCK",
  representative: "",
  businessNumber: "",
  address: "",
};
const PRIVACY_OFFICER = { name: "PLUCK 운영 담당", email: CONTACT_EMAIL };
const EFFECTIVE_DATE = "2026년 10월 30일";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${COMPANY.name}이 프로젝트 문의를 받으며 수집하는 개인정보의 항목, 이용 목적, 보유 기간과 파기 방법을 안내합니다.`,
  alternates: { canonical: "/privacy" },
  openGraph: {
    ...baseOpenGraph,
    type: "website",
    url: "/privacy",
    title: "개인정보처리방침 | PLUCK 플럭",
    images: [defaultOgImage],
  },
};

export default function PrivacyPage() {
  const companyRows = [
    ["상호", COMPANY.name],
    ["대표자", COMPANY.representative],
    ["사업자등록번호", COMPANY.businessNumber],
    ["주소", COMPANY.address],
  ].filter(([, value]) => value);

  return (
    <>
      <StudioHeader />
      <main id="main" className="legal shell">
        <h1>개인정보처리방침</h1>
        <p className="legal-lead">
          {COMPANY.name}(이하 &lsquo;회사&rsquo;)는 프로젝트 문의를 받고 답변하는 데
          필요한 최소한의 개인정보만 수집하며, 「개인정보 보호법」에 따라 안전하게
          처리합니다.
        </p>

        <section>
          <h2>수집하는 항목</h2>
          <ul>
            <li>필수: 이름, 이메일, 문의 내용, 프로젝트 종류</li>
            <li>선택: 회사/브랜드명, 연락처, 예산 범위, 희망 일정, 참고 링크, 첨부파일</li>
            <li>
              자동 수집: 접속 기기 정보(브라우저 종류), 유입 경로(광고 파라미터·이전 페이지),
              부정 이용 방지를 위한 IP 주소의 일방향 암호화 값
            </li>
          </ul>
        </section>

        <section>
          <h2>이용 목적</h2>
          <ul>
            <li>문의 확인과 답변, 상담 일정 조율</li>
            <li>견적과 제안 안내, 계약 진행 시 프로젝트 관리</li>
            <li>스팸·반복 접수 등 부정 이용 방지</li>
          </ul>
        </section>

        <section>
          <h2>보유 기간</h2>
          <p>
            문의 정보는 접수일로부터 <strong>1년</strong> 동안 보관한 뒤 파기합니다.
            문의가 계약으로 이어진 경우에는 계약 이행과 관련 법령(전자상거래 등에서의
            소비자보호에 관한 법률 등)이 정한 기간 동안 보관합니다. 삭제를 원하시면
            언제든지 아래 문의처로 요청해 주세요.
          </p>
        </section>

        <section>
          <h2>파기 절차와 방법</h2>
          <p>
            보유 기간이 지나거나 처리 목적이 달성된 정보는 지체 없이 파기합니다.
            전자 파일은 복구할 수 없는 방법으로 삭제하고, 출력물은 분쇄하거나
            소각합니다.
          </p>
        </section>

        <section>
          <h2>처리 위탁과 국외 이전</h2>
          <p>회사는 서비스 운영을 위해 아래 업체에 개인정보 처리를 맡깁니다.</p>
          <ul>
            <li>Supabase Inc.(미국): 문의 정보와 첨부파일 저장</li>
            <li>Vercel Inc.(미국): 웹사이트 호스팅과 문의 접수 처리</li>
            <li>Discord Inc.(미국): 신규 문의 내부 알림(이름·연락처·문의 요약)</li>
          </ul>
          <p>
            정보는 문의 접수 시 네트워크를 통해 전송되며, 위 보유 기간 동안 각
            업체의 서버에 보관됩니다. 국외 이전을 원하지 않으시면 문의 양식 대신
            메일로 문의하실 수 있습니다.
          </p>
        </section>

        <section>
          <h2>정보주체의 권리</h2>
          <p>
            언제든지 본인 정보의 열람, 정정, 삭제, 처리 정지를 요청하실 수 있습니다.
            아래 문의처로 연락 주시면 지체 없이 조치합니다. 동의를 거부하실 수
            있으며, 이 경우 온라인 양식 대신 메일로 문의하실 수 있습니다.
          </p>
        </section>

        <section>
          <h2>개인정보 보호책임자와 문의처</h2>
          <dl className="legal-table">
            <div>
              <dt>담당</dt>
              <dd>{PRIVACY_OFFICER.name}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>
                <a href={`mailto:${PRIVACY_OFFICER.email}`}>{PRIVACY_OFFICER.email}</a>
              </dd>
            </div>
            {companyRows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p>
            개인정보 침해에 관한 상담은 개인정보침해신고센터(privacy.kisa.or.kr,
            국번 없이 118)에도 문의하실 수 있습니다.
          </p>
        </section>

        <p className="legal-date">시행일: {EFFECTIVE_DATE}</p>
        <Link className="button button-ghost" href="/contact">
          문의하기로 돌아가기
        </Link>
      </main>
      <StudioFooter />
    </>
  );
}

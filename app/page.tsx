import { ArrowRight, ArrowUpRight, Blocks, Code2, Cpu, Layers3, Plus } from "lucide-react";

const projects = [
  { name: "NDrop", category: "DIGITAL BUSINESS CARD", description: "첫 만남을 다음 기회로 연결하는 디지털 명함 플랫폼.", href: "https://www.ndrop.kr/", style: "ndrop", mark: "N", detail: "A better way to connect." },
  { name: "DVIA", category: "GLOBAL CORPORATE WEBSITE", description: "정밀 기술의 가치를 세계에 전하는 글로벌 기업 웹사이트.", href: "https://web-daeilsys-v2.vercel.app/", style: "dvia", mark: "DVIA", detail: "Precision. In every dimension." },
  { name: "몇기야", category: "COMMUNITY PLATFORM", description: "같은 경험을 가진 사람들이 다시 연결되는 커뮤니티.", href: "https://www.myotgiya.com/", style: "community", mark: "몇기야", detail: "Shared history. New connections." },
];
const services = [
  { icon: Layers3, title: "제품 전략과 디자인", english: "Strategy & Design", description: "아이디어를 구체적인 제품으로 정의합니다. 사용자 흐름부터 브랜드에 맞는 인터페이스까지 설계합니다.", tags: "제품 기획 · UX/UI · 디자인 시스템" },
  { icon: Code2, title: "웹과 모바일 개발", english: "Web & Mobile", description: "사용하기 쉽고 확장하기 좋은 서비스를 만듭니다. 화면 뒤의 데이터와 운영 환경까지 함께 연결합니다.", tags: "웹 서비스 · 모바일 앱 · 백엔드" },
  { icon: Cpu, title: "AI와 업무 자동화", english: "AI & Automation", description: "반복되는 업무를 줄이고 제품의 가능성을 넓힙니다. 실제 업무 흐름에 맞춰 AI 기능을 구현합니다.", tags: "AI 에이전트 · 서비스 연동 · 자동화" },
];
const faqs = [
  ["아이디어만 있어도 시작할 수 있나요?", "네. 해결하려는 문제와 원하는 결과를 알려주세요. 필요한 기능과 우선순위를 함께 정리하고, 디자인과 개발 범위를 구체화합니다."],
  ["진행 과정은 어떻게 공유하나요?", "프로젝트에 맞는 소통 채널을 정하고, 진행 상황과 실제 동작하는 결과물을 공유합니다. 단계별로 피드백을 반영하며 다음 작업을 결정합니다."],
  ["기존 서비스 개선이나 AI 기능 추가도 가능한가요?", "가능합니다. 현재 서비스의 구조와 요구사항을 살펴본 뒤 리디자인, 기능 개선, AI 연동 등 필요한 범위를 제안합니다."],
  ["출시 이후 운영도 함께할 수 있나요?", "출시 후 안정화와 유지보수, 추가 기능 개발을 협의할 수 있습니다. 일정과 비용, 지원 범위는 프로젝트 상담에서 안내합니다."],
];

function Arrow({ external = false }: { external?: boolean }) {
  return external ? <ArrowUpRight size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />;
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="wordmark" href="#top" aria-label="PLUCK 홈">pluck<span>®</span></a>
          <nav className="desktop-nav" aria-label="주요 메뉴"><a href="#services">서비스</a><a href="#showreel">프로젝트</a><a href="#process">진행 방식</a><a href="#faq">자주 묻는 질문</a></nav>
          <a className="button button-small" href="#contact">프로젝트 문의 <Arrow /></a>
        </div>
        <nav className="mobile-nav shell" aria-label="모바일 메뉴"><a href="#services">서비스</a><a href="#showreel">프로젝트</a><a href="#process">진행 방식</a><a href="#faq">FAQ</a></nav>
      </header>
      <main id="main">
        <section className="hero shell" id="top" aria-labelledby="hero-title">
          <p className="eyebrow"><span className="blue-dot" /> DIGITAL PRODUCT STUDIO</p>
          <h1 id="hero-title">좋은 아이디어를,<br /><span>더 나은 제품으로.</span></h1>
          <p className="hero-description">기획부터 디자인, 개발, AI까지.<br />비즈니스의 다음 단계를 PLUCK과 함께 만드세요.</p>
          <div className="hero-actions"><a className="button" href="#contact">프로젝트 이야기하기 <Arrow /></a><a className="text-link" href="#showreel">만든 제품 살펴보기 <Arrow /></a></div>
          <div className="product-canvas" role="img" aria-label="제품 전략, 디자인, 개발, AI를 하나의 제품으로 연결하는 PLUCK의 작업 방식">
            <div className="canvas-top"><span><span className="blue-dot" /> THE PLUCK APPROACH</span><span>From idea to impact</span></div>
            <div className="canvas-grid" aria-hidden="true">
              <div className="idea-node"><span className="node-symbol">✳</span><small>THE STARTING POINT</small><strong>Your next idea.</strong></div>
              <div className="connector"><span /></div>
              <div className="platform-node"><div className="platform-title"><span className="wordmark">pluck<span>®</span></span><span className="node-label">ONE CONNECTED PROCESS</span></div><div className="platform-services"><span><Layers3 />Strategy</span><span><Blocks />Design</span><span><Code2 />Build</span><span><Cpu />Intelligence</span></div><div className="platform-bottom"><span className="blue-dot" /> Built together. Built to last.</div></div>
              <div className="connector"><span /></div>
              <div className="launch-node"><span className="launch-icon"><ArrowUpRight /></span><small>WHAT COMES NEXT</small><strong>A better product.</strong></div>
            </div>
            <div className="canvas-bottom"><span>Clarity at every step.</span><span>01 — 04</span></div>
          </div>
          <div className="capability-strip"><span>아이디어에서 운영까지</span><p>Product strategy <i /> Design systems <i /> Engineering <i /> AI integration</p></div>
        </section>
        <section className="section section-muted" id="services"><div className="shell">
          <div className="section-heading"><div><p className="eyebrow">WHAT WE DO</p><h2>제품에 필요한 역량을,<br />하나의 흐름으로.</h2></div><p className="section-description">각 단계를 따로 고민하지 않아도 됩니다.<br />비즈니스의 목표에서 출발해 실제 작동하는<br /> 서비스까지 이어갑니다.</p></div>
          <div className="service-grid">{services.map(({ icon: Icon, ...service }) => <article className="service-card" key={service.english}><Icon className="service-icon" size={27} strokeWidth={1.5} aria-hidden="true" /><p className="card-eyebrow">{service.english}</p><h3>{service.title}</h3><p>{service.description}</p><div className="service-tags">{service.tags}</div></article>)}</div>
        </div></section>
        <section className="section shell" id="showreel">
          <div className="section-heading"><div><p className="eyebrow">SELECTED WORK</p><h2>아이디어가 제품이 된 순간.</h2></div><a className="text-link" href="https://github.com/pluck-dev" target="_blank" rel="noopener noreferrer">GitHub에서 더 보기 <Arrow external /></a></div>
          <div className="work-grid">{projects.map((project) => <a className="work-card" key={project.name} href={project.href} target="_blank" rel="noopener noreferrer"><div className={`work-art ${project.style}`} aria-hidden="true"><span className="work-art-label">PLUCK / SELECTED PROJECT</span><strong>{project.mark}</strong><span>{project.detail}</span><span className="work-open"><Arrow external /></span></div><p className="card-eyebrow">{project.category}</p><h3>{project.name} <Arrow external /></h3><p>{project.description}</p></a>)}</div>
          <div className="more-work"><span>그 밖의 프로젝트</span><a href="https://admin-pando.vercel.app/" target="_blank" rel="noopener noreferrer">FitGenie · 피트니스 CRM <Arrow external /></a><a href="https://draw.pluck.co.kr/" target="_blank" rel="noopener noreferrer">플럭 드로우 · 이벤트 추첨 <Arrow external /></a></div>
        </section>
        <section className="section process-section" id="process"><div className="shell"><div className="section-heading"><div><p className="eyebrow">HOW WE WORK</p><h2>복잡한 과정은 단순하게.<br />중요한 결정은 함께.</h2></div><p className="section-description">무엇을 만들고 있는지, 어디까지 왔는지.<br />같은 목표를 바라보며 단계마다 확인합니다.</p></div><div className="process-grid">{[
          ["01", "Discover", "문제와 목표를 정의합니다", "사용자와 비즈니스를 이해하고, 지금 가장 필요한 제품의 범위를 정합니다."],
          ["02", "Design", "경험을 구체화합니다", "사용자 흐름과 화면을 설계하고, 프로토타입으로 방향을 확인합니다."],
          ["03", "Build", "작동하는 제품을 만듭니다", "핵심 기능부터 구현하고, 실제 결과물을 보며 완성도를 높입니다."],
          ["04", "Launch", "다음 단계로 이어갑니다", "배포와 안정화를 거쳐, 운영 중 필요한 개선을 함께 검토합니다."],
        ].map(([number, title, subtitle, description]) => <article className="process-step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><h4>{subtitle}</h4><p>{description}</p></article>)}</div></div></section>
        <section className="section shell faq-section" id="faq"><div><p className="eyebrow">GOOD TO KNOW</p><h2>시작하기 전에<br />궁금한 것들.</h2><a className="text-link" href="mailto:hello@pluck.co.kr">직접 물어보기 <Arrow /></a></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={20} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>
        <section className="contact-section" id="contact"><div className="shell contact-inner"><div><p className="eyebrow">LET’S BUILD WHAT’S NEXT</p><h2>다음 아이디어를<br />들려주세요.</h2><p>작은 질문부터 구체적인 프로젝트까지.<br />어디서 시작하면 좋을지 함께 이야기해요.</p></div><div className="contact-actions"><a className="button button-light" href="mailto:hello@pluck.co.kr?subject=PLUCK%20프로젝트%20문의">이메일로 프로젝트 문의 <Arrow /></a><a className="contact-email" href="mailto:hello@pluck.co.kr">hello@pluck.co.kr <Arrow external /></a><span>버튼을 누르면 이메일 앱이 열립니다.</span></div></div></section>
      </main>
      <footer className="shell footer"><div className="footer-main"><a className="wordmark" href="#top" aria-label="PLUCK 홈">pluck<span>®</span></a><p>Independent thinking. Connected execution.</p><a className="text-link" href="https://github.com/pluck-dev" target="_blank" rel="noopener noreferrer">GitHub <Arrow external /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} PLUCK. All rights reserved.</span><span>Based in Seoul. Building beyond.</span></div></footer>
    </>
  );
}

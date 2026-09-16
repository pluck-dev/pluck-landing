import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import {
  PluckSculpture,
  ScrollExperience,
} from "@/components/scroll-experience";

const services = [
  {
    number: "01",
    title: "Find the essential.",
    name: "제품 전략 & 디자인",
    description:
      "무엇을 더할지보다, 무엇이 중요한지 먼저 묻습니다. 아이디어의 본질을 찾고 사용자가 이해하는 경험으로 설계합니다.",
    tags: "Product strategy / UX·UI / Design systems",
  },
  {
    number: "02",
    title: "Make it work.",
    name: "웹 & 모바일 개발",
    description:
      "보이는 화면부터 보이지 않는 구조까지. 빠르게 만들고, 오래 사용할 수 있도록 제품의 기반을 단단하게 연결합니다.",
    tags: "Web / Mobile / Backend engineering",
  },
  {
    number: "03",
    title: "Go a little further.",
    name: "AI & 업무 자동화",
    description:
      "사람이 집중해야 할 일에 더 많은 시간을. 실제 업무의 흐름을 이해하고 필요한 곳에 AI와 자동화를 더합니다.",
    tags: "AI integration / Agents / Automation",
  },
];
const faqs = [
  [
    "아이디어만 있어도 시작할 수 있나요?",
    "네. 해결하려는 문제와 원하는 결과를 알려주세요. 필요한 기능과 우선순위를 함께 정리하고, 디자인과 개발 범위를 구체화합니다.",
  ],
  [
    "진행 과정은 어떻게 공유하나요?",
    "진행 상황과 실제 동작하는 결과물을 공유합니다. 단계별로 피드백을 반영하며 다음 작업을 결정합니다.",
  ],
  [
    "기존 서비스 개선이나 AI 기능 추가도 가능한가요?",
    "현재 서비스의 구조와 요구사항을 살펴본 뒤 리디자인, 기능 개선, AI 연동 등 필요한 범위를 제안합니다.",
  ],
  [
    "출시 이후 운영도 함께할 수 있나요?",
    "출시 후 안정화와 유지보수, 추가 기능 개발을 협의할 수 있습니다. 일정과 비용, 지원 범위는 프로젝트 상담에서 안내합니다.",
  ],
];

function ExternalArrow() {
  return <ArrowUpRight size={22} aria-hidden="true" />;
}

export default function Home() {
  return (
    <ScrollExperience>
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <a className="wordmark" href="#top" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </a>
          <nav className="desktop-nav" aria-label="주요 메뉴">
            <a href="#showreel">Work</a>
            <a href="#services">Expertise</a>
            <a href="#process">Approach</a>
          </nav>
          <a className="header-contact" href="#contact">
            Let’s talk <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <nav className="mobile-nav shell" aria-label="모바일 메뉴">
          <a href="#showreel">프로젝트</a>
          <a href="#services">서비스</a>
          <a href="#process">진행 방식</a>
          <a href="#faq">FAQ</a>
        </nav>
      </header>
      <main id="main">
        <section
          className="hero-scene"
          id="top"
          data-scene="hero"
          aria-labelledby="hero-title"
        >
          <div className="hero-pin">
            <div className="hero-grid shell">
              <div className="hero-copy">
                <p className="eyebrow">INDEPENDENT DIGITAL STUDIO · SEOUL</p>
                <h1 id="hero-title">
                  Ideas.
                  <br />
                  <span>Made real.</span>
                </h1>
                <div className="hero-description">
                  <span className="little-line" />
                  <p>
                    가능성에 머무르지 않도록.
                    <br />
                    생각을 꺼내, 쓰이는 제품으로 만듭니다.
                  </p>
                </div>
                <a className="text-link hero-link" href="#showreel">
                  우리가 만든 것들 <ArrowDown size={18} aria-hidden="true" />
                </a>
              </div>
              <PluckSculpture />
            </div>
            <div className="hero-bottom shell">
              <span>STRATEGY. DESIGN. ENGINEERING.</span>
              <a href="#studio-note">
                SCROLL TO EXPLORE <ArrowDown size={15} aria-hidden="true" />
              </a>
              <span className="hero-progress" aria-hidden="true">
                <i />
              </span>
            </div>
            <span className="hero-watermark" aria-hidden="true">
              From thought to thing.
            </span>
          </div>
        </section>

        <section
          className="studio-note shell"
          id="studio-note"
          data-scene="statement"
        >
          <p className="eyebrow">01 / THE WAY WE THINK</p>
          <div>
            <h2>
              좋은 제품은
              <br />
              덜어낸 자리에서
              <br />
              <span>선명해집니다.</span>
            </h2>
            <p className="note-description">
              복잡한 아이디어에서 중요한 것을 뽑아내는 일.
              <br />
              PLUCK은 기획, 디자인, 개발의 경계를 넘나들며
              <br />
              비즈니스에 필요한 다음 장면을 만듭니다.
            </p>
          </div>
          <span className="note-index" aria-hidden="true">
            Less noise.
            <br />
            More purpose.
          </span>
        </section>

        <section className="work-section" id="showreel">
          <div className="shell section-heading">
            <p className="eyebrow">02 / SELECTED WORK</p>
            <h2>
              Proof, not promises<span className="blue-period">.</span>
            </h2>
            <p>생각이 실제 서비스가 된 기록.</p>
          </div>
          <div className="shell project-list">
            <article className="project project-ndrop" data-scene="project">
              <a
                className="project-image ndrop-art"
                href="https://www.ndrop.kr/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NDrop 사이트 방문 (새 탭)"
              >
                <span className="art-caption">NDrop / DIGITAL CONNECTIONS</span>
                <div
                  className="project-parallax ndrop-composition"
                  aria-hidden="true"
                >
                  <div className="ndrop-word">
                    Hello,
                    <br />
                    again.
                  </div>
                  <div className="business-card card-back">
                    <span>NDrop</span>
                    <div className="card-lines">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                  <div className="business-card card-front">
                    <span className="card-logo">
                      N<span>↗</span>
                    </span>
                    <div>
                      <small>A new connection starts here.</small>
                      <strong>
                        Make your
                        <br />
                        first impression last.
                      </strong>
                    </div>
                    <span className="card-footer">
                      YOUR DIGITAL BUSINESS CARD <span>↗</span>
                    </span>
                  </div>
                </div>
                <span className="project-circle">
                  <ExternalArrow />
                </span>
              </a>
              <div className="project-caption">
                <span className="project-number">01</span>
                <div>
                  <h3>NDrop</h3>
                  <p>명함을 넘어, 연결의 시작으로.</p>
                </div>
                <span className="project-discipline">
                  Brand experience / Web platform
                </span>
              </div>
            </article>
            <article className="project project-dvia" data-scene="project">
              <a
                className="project-image dvia-art"
                href="https://web-daeilsys-v2.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DVIA 사이트 방문 (새 탭)"
              >
                <span className="art-caption">
                  DVIA / PRECISION ENGINEERING
                </span>
                <div
                  className="project-parallax dvia-composition"
                  aria-hidden="true"
                >
                  <div className="precision-rings">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <strong>
                    Beyond
                    <br />
                    <em>the surface.</em>
                  </strong>
                  <span className="precision-mark">DVIA</span>
                </div>
                <span className="project-circle">
                  <ExternalArrow />
                </span>
              </a>
              <div className="project-caption">
                <span className="project-number">02</span>
                <div>
                  <h3>DVIA</h3>
                  <p>정밀 기술을 전달하는 새로운 시선.</p>
                </div>
                <span className="project-discipline">
                  Global website / 3D experience
                </span>
              </div>
            </article>
            <article className="project project-community" data-scene="project">
              <a
                className="project-image community-art"
                href="https://www.myotgiya.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="몇기야 사이트 방문 (새 탭)"
              >
                <span className="art-caption">몇기야 / SHARED CONNECTIONS</span>
                <div
                  className="project-parallax community-composition"
                  aria-hidden="true"
                >
                  <span className="community-orbit orbit-one" />
                  <span className="community-orbit orbit-two" />
                  <span className="community-orbit orbit-three" />
                  <span className="community-label label-one">같은 시작</span>
                  <strong>
                    우리,
                    <br />
                    몇기야?
                  </strong>
                  <span className="community-label label-two">
                    새로운 연결 ↗
                  </span>
                </div>
                <span className="project-circle">
                  <ExternalArrow />
                </span>
              </a>
              <div className="project-caption">
                <span className="project-number">03</span>
                <div>
                  <h3>몇기야</h3>
                  <p>함께한 시간을, 새로운 관계로.</p>
                </div>
                <span className="project-discipline">
                  Community / Product development
                </span>
              </div>
            </article>
          </div>
          <div className="shell more-work">
            <span>MORE TO EXPLORE</span>
            <a
              href="https://admin-pando.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              FitGenie <ExternalArrow />
            </a>
            <a
              href="https://draw.pluck.co.kr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              플럭 드로우 <ExternalArrow />
            </a>
            <a
              href="https://github.com/pluck-dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <ExternalArrow />
            </a>
          </div>
        </section>

        <section className="expertise-section" id="services">
          <div className="shell expertise-grid">
            <div className="expertise-heading">
              <p className="eyebrow">03 / OUR EXPERTISE</p>
              <h2>
                Different skills.
                <br />
                <span>One direction.</span>
              </h2>
              <p>
                한 번의 대화에서 시작해
                <br />
                하나의 완성된 경험으로.
              </p>
              <a className="text-link" href="#contact">
                함께할 프로젝트 이야기하기{" "}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className="service-list">
              {services.map((service) => (
                <article className="service-row" key={service.number}>
                  <span className="service-number">/{service.number}</span>
                  <h3>{service.title}</h3>
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                  <small>{service.tags}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section shell" id="process">
          <div className="section-heading">
            <p className="eyebrow">04 / IN GOOD COMPANY</p>
            <h2>과정도, 좋은 경험이 되도록.</h2>
            <p>함께 보고, 이야기하고, 다음으로 나아갑니다.</p>
          </div>
          <div className="process-grid">
            {[
              [
                "01",
                "Discover",
                "먼저, 깊이 이해합니다.",
                "사용자와 비즈니스를 이해하고 지금 필요한 제품의 범위를 정합니다.",
              ],
              [
                "02",
                "Design",
                "같은 그림을 그립니다.",
                "사용자 흐름과 화면을 설계하고 프로토타입으로 방향을 확인합니다.",
              ],
              [
                "03",
                "Build",
                "직접 써보며 완성합니다.",
                "핵심 기능부터 구현하고 실제 결과물을 보며 완성도를 높입니다.",
              ],
              [
                "04",
                "Beyond",
                "출시 다음도 생각합니다.",
                "배포와 안정화를 거쳐 운영 중 필요한 개선을 함께 검토합니다.",
              ],
            ].map(([number, title, subtitle, description]) => (
              <article className="process-step" key={number}>
                <span>{number} /</span>
                <h3>{title}</h3>
                <h4>{subtitle}</h4>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="shell faq-section" id="faq">
          <div>
            <p className="eyebrow">A FEW THINGS TO KNOW</p>
            <h2>궁금한 것들.</h2>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={20} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="contact-section" id="contact" data-scene="contact">
          <div className="shell">
            <p className="eyebrow">HAVE SOMETHING IN MIND?</p>
            <a
              className="contact-title"
              href="mailto:hello@pluck.co.kr?subject=PLUCK%20프로젝트%20문의"
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
      </main>
      <footer className="shell footer">
        <a className="wordmark" href="#top" aria-label="PLUCK 홈">
          pluck<span>®</span>
        </a>
        <span>© {new Date().getFullYear()} PLUCK</span>
        <span>Independent in Seoul. Open to everywhere.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </ScrollExperience>
  );
}

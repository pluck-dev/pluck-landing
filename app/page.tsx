import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Hero3D } from "@/components/hero-3d";
import { ProjectIndex } from "@/components/project-index";
import { ScrollExperience } from "@/components/scroll-experience";
import {
  CONTACT_MAIL,
  ContactSection,
  StudioFooter,
  StudioHeader,
} from "@/components/site-chrome";
import { getPortfolioStats, getProject, projects } from "@/lib/portfolio";

const worries = [
  "기획, 디자인, 개발을 각각 다른 곳에 맡겼더니 서로 조율하다 일정이 다 지나갔어요.",
  "시안은 예쁘게 나왔는데, 실제로 돌아가는 서비스는 끝내 나오지 않았어요.",
  "엑셀과 단톡방으로 돌리던 업무를 시스템으로 옮기고 싶은데, 어디서부터 시작할지 모르겠어요.",
  "AI를 쓰면 좋다는데, 우리 업무 어디에 붙여야 효과가 있는지 감이 안 와요.",
];

const services = [
  {
    title: "기획",
    lead: "무엇을 먼저 만들지부터 정합니다.",
    description:
      "해결하려는 문제와 사용자를 정리하고, 꼭 필요한 기능과 우선순위를 나눠 개발 범위를 구체화합니다.",
    deliverables: ["기능 우선순위", "화면 흐름", "개발 범위"],
    example: "rba",
  },
  {
    title: "디자인",
    lead: "처음 써도 헤매지 않는 화면.",
    description:
      "브랜드의 인상과 사용 흐름을 함께 설계합니다. 고객용 화면부터 운영자가 쓰는 어드민까지 한 톤으로 만듭니다.",
    deliverables: ["UI 디자인", "디자인 시스템", "모바일 대응"],
    example: "thousand",
  },
  {
    title: "개발",
    lead: "시안이 아니라 운영되는 서비스.",
    description:
      "웹, 앱, 어드민, 정산 같은 실제 업무 기능까지 구현하고 배포합니다. 출시 후 운영에 필요한 구조를 처음부터 고려합니다.",
    deliverables: ["웹·앱", "운영 어드민", "배포"],
    example: "dealer-settlement",
  },
  {
    title: "AI 자동화",
    lead: "반복 업무는 맡기고, 사람은 중요한 일에.",
    description:
      "업무 흐름을 먼저 이해한 뒤 효과가 나는 지점에만 AI와 자동화를 더합니다. 콘텐츠 작성 보조, 데이터 정리, 알림까지.",
    deliverables: ["AI 기능 연동", "업무 자동화", "콘텐츠 생성"],
    example: "boryoung",
  },
] as const;

/** Live client work shown large. `detail` = gallery index for the inset frame. */
const featured = [
  { slug: "boryoung", detail: 3 },
  { slug: "rba", detail: 3 },
  { slug: "dealer-settlement", detail: 0 },
  { slug: "dvia", detail: 0 },
] as const;

const steps = [
  {
    title: "상담",
    description:
      "해결하고 싶은 문제와 원하는 결과를 듣습니다. 아직 정리되지 않은 생각이어도 괜찮습니다.",
    outcome: "필요한 기능과 우선순위 정리",
  },
  {
    title: "설계",
    description:
      "사용자 흐름과 화면을 설계하고, 프로토타입으로 방향을 먼저 확인합니다.",
    outcome: "화면 흐름과 프로토타입",
  },
  {
    title: "제작",
    description:
      "핵심 기능부터 구현하고, 실제로 동작하는 결과물을 보며 피드백을 반영합니다.",
    outcome: "직접 써볼 수 있는 결과물",
  },
  {
    title: "출시와 운영",
    description:
      "배포와 안정화를 거쳐, 운영하며 필요한 개선과 추가 기능을 함께 검토합니다.",
    outcome: "실제 운영되는 서비스",
  },
];

const faqs = [
  [
    "아이디어만 있어도 시작할 수 있나요?",
    "네. 해결하려는 문제와 원하는 결과를 알려주세요. 필요한 기능과 우선순위를 함께 정리하고, 디자인과 개발 범위를 구체화합니다.",
  ],
  [
    "기획, 디자인, 개발을 모두 맡길 수 있나요?",
    "네. PLUCK은 한 팀이 기획부터 디자인, 개발, 배포까지 이어서 진행합니다. 필요한 부분만 맡기셔도 됩니다.",
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
    "비용과 일정은 어떻게 정해지나요?",
    "만들 범위에 따라 달라집니다. 상담에서 필요한 기능을 함께 정리한 뒤 일정과 비용을 안내합니다.",
  ],
  [
    "출시 이후 운영도 함께할 수 있나요?",
    "출시 후 안정화와 유지보수, 추가 기능 개발을 협의할 수 있습니다. 지원 범위는 프로젝트 상담에서 안내합니다.",
  ],
] as const;

function requireProject(slug: string) {
  const project = getProject(slug);
  if (!project) throw new Error(`Unknown portfolio slug: ${slug}`);
  return project;
}

export default function Home() {
  const stats = getPortfolioStats(projects);
  return (
    <ScrollExperience>
      <StudioHeader home />
      <main id="main">
        <Hero3D contactHref={CONTACT_MAIL} />

        <section className="proof-band" aria-labelledby="proof-title">
          <div className="shell">
            <h2 id="proof-title" className="proof-title">
              말보다 결과물로 보여드립니다.
            </h2>
            <dl className="proof-grid">
              <div>
                <dt>지금 접속해 볼 수 있는 서비스</dt>
                <dd>
                  <CountUp value={stats.live} />
                  <small>개</small>
                </dd>
              </div>
              <div>
                <dt>클라이언트 프로젝트</dt>
                <dd>
                  <CountUp value={stats.client} />
                  <small>건</small>
                </dd>
              </div>
              <div>
                <dt>지금까지 만든 프로젝트</dt>
                <dd>
                  <CountUp value={stats.total} />
                  <small>개</small>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="worries" aria-labelledby="worries-title">
          <div className="shell">
            <h2 id="worries-title" className="section-title">
              이런 고민, 있으신가요?
            </h2>
            <ul className="worry-list">
              {worries.map((worry) => (
                <li key={worry}>
                  <p>“{worry}”</p>
                </li>
              ))}
            </ul>
            <p className="worries-answer">
              PLUCK은 이 고민을 <strong>한 팀</strong>으로 해결합니다.
            </p>
          </div>
        </section>

        <section
          className="services shell"
          id="services"
          aria-labelledby="services-title"
        >
          <div className="section-head">
            <h2 id="services-title" className="section-title">
              기획·디자인·개발·AI,
              <br />
              따로 찾지 마세요.
            </h2>
            <p>
              한 팀이 처음부터 끝까지 맡기 때문에, 업체 사이에서 같은 설명을
              반복할 일이 없습니다. 아래는 각 분야를 실제로 적용한 프로젝트입니다.
            </p>
          </div>
          <ul className="service-grid">
            {services.map((service) => {
              const example = requireProject(service.example);
              return (
                <li className="service-card" key={service.title}>
                  <h3>{service.title}</h3>
                  <p className="service-lead">{service.lead}</p>
                  <p>{service.description}</p>
                  <ul className="chip-list" aria-label={`${service.title} 결과물`}>
                    {service.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Link
                    className="service-example"
                    href={`/work/${example.slug}`}
                  >
                    <span className="service-example-thumb">
                      <Image
                        src={example.cover.src}
                        alt=""
                        fill
                        sizes="96px"
                      />
                    </span>
                    <span>
                      적용 사례
                      <strong>{example.name}</strong>
                    </span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className="featured"
          id="featured"
          aria-labelledby="featured-title"
        >
          <div className="shell">
            <div className="section-head">
              <h2 id="featured-title" className="section-title">
                시안에서 멈추지 않았습니다.
              </h2>
              <p>
                지금 바로 접속해 볼 수 있는 클라이언트 서비스입니다. 기획부터
                디자인, 개발, 운영 어드민까지 PLUCK이 맡았습니다.
              </p>
            </div>
            <div className="featured-list">
              {featured.map(({ slug, detail }) => {
                const project = requireProject(slug);
                const inset = project.gallery[detail];
                return (
                  <article
                    className="featured-item"
                    key={slug}
                    data-scene="feature"
                  >
                    <Link
                      href={`/work/${slug}`}
                      className="featured-media"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <span className="featured-cover">
                        <Image
                          src={project.cover.src}
                          alt=""
                          fill
                          sizes="(max-width: 900px) calc(100vw - 40px), 760px"
                        />
                      </span>
                      {inset ? (
                        <span className="featured-inset">
                          <Image
                            src={inset.src}
                            alt=""
                            fill
                            sizes="(max-width: 900px) 50vw, 340px"
                          />
                        </span>
                      ) : null}
                    </Link>
                    <div className="featured-copy">
                      <h3>{project.name}</h3>
                      <p className="featured-one-liner">
                        {project.detail.oneLiner}
                      </p>
                      <p>{project.detail.solution}</p>
                      <p className="featured-role">
                        <span>맡은 일</span>
                        {project.detail.role.join(" · ")}
                      </p>
                      <div className="featured-actions">
                        <Link
                          className="button button-primary"
                          href={`/work/${slug}`}
                        >
                          프로젝트 자세히 보기
                          <span className="sr-only"> — {project.name}</span>
                        </Link>
                        {project.url ? (
                          <a
                            className="button button-ghost"
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            사이트 방문{" "}
                            <ArrowUpRight size={17} aria-hidden="true" />
                            <span className="sr-only">
                              {" "}
                              — {project.name} (새 탭)
                            </span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="index-section" id="work" aria-labelledby="work-title">
          <div className="shell">
            <div className="section-head index-head">
              <h2 id="work-title" className="section-title">
                지금까지 만든 {stats.total}개의 프로젝트
              </h2>
              <p>
                클라이언트 작업부터 자체 서비스, 앱, AI 자동화 도구까지.
                카드를 누르면 문제와 해결 과정을 볼 수 있습니다.
              </p>
            </div>
            <ProjectIndex />
            <a
              className="github-link"
              href="https://github.com/pluck-dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              코드와 오픈소스 작업은 GitHub에서
              <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only"> (새 탭)</span>
            </a>
          </div>
        </section>

        <section
          className="process shell"
          id="process"
          aria-labelledby="process-title"
        >
          <div className="section-head">
            <h2 id="process-title" className="section-title">
              진행은 이렇게 합니다.
            </h2>
            <p>
              단계마다 실제 결과물을 함께 보며 결정합니다. 보고서만 쌓이는
              진행은 하지 않습니다.
            </p>
          </div>
          <ol className="process-flow">
            {steps.map((step) => (
              <li className="process-step" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <p className="process-outcome">{step.outcome}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="faq shell" id="faq" aria-labelledby="faq-title">
          <div className="faq-head">
            <h2 id="faq-title" className="section-title">
              자주 묻는 질문
            </h2>
            <p>
              더 궁금한 점은{" "}
              <a href="mailto:hello@pluck.co.kr">hello@pluck.co.kr</a>로 편하게
              물어보세요.
            </p>
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
        <ContactSection />
      </main>
      <StudioFooter />
    </ScrollExperience>
  );
}

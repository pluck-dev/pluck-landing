import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import {
  ContactSection,
  StudioFooter,
  StudioHeader,
} from "@/components/site-chrome";
import { StatusPill } from "@/components/status-pill";
import {
  categoryLabels,
  formatYears,
  getAdjacentProjects,
  getProject,
  projects,
} from "@/lib/portfolio";

type Props = { params: Promise<{ slug: string }> };

/** Only slugs from lib/portfolio.ts exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const title = `${project.name} — PLUCK`;
  return {
    title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title,
      description: project.detail.oneLiner,
      type: "article",
      url: `/work/${project.slug}`,
      images: [
        {
          url: project.cover.src,
          width: 1600,
          height: 1000,
          alt: project.cover.alt,
        },
      ],
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const { detail } = project;
  const { previous, next } = getAdjacentProjects(project.slug);
  const sections = [
    ["개요", detail.overview],
    ["문제", detail.problem],
    ["해결", detail.solution],
  ] as const;

  return (
    <>
      <StudioHeader />
      <main id="main" className="work-page">
        <section className="shell work-hero" id="top" aria-labelledby="work-title">
          <nav className="work-crumbs" aria-label="이동 경로">
            <Link href="/#work">
              <ArrowLeft size={16} aria-hidden="true" /> 전체 프로젝트
            </Link>
            <span aria-hidden="true">/</span>
            <span>{categoryLabels[project.category]}</span>
          </nav>
          <div className="work-hero-grid">
            <div className="work-hero-copy">
              <h1 id="work-title">
                {project.name}
              </h1>
              <p>{detail.oneLiner}</p>
            </div>
            <dl className="work-meta">
              <div>
                <dt>기간</dt>
                <dd>{formatYears(project.years)}</dd>
              </div>
              <div>
                <dt>분야</dt>
                <dd>{categoryLabels[project.category]}</dd>
              </div>
              <div>
                <dt>맡은 일</dt>
                <dd>{detail.role.join(" / ")}</dd>
              </div>
              <div>
                <dt>기술</dt>
                <dd>{detail.stack.join(" / ")}</dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>
                  <StatusPill status={project.status} />
                </dd>
              </div>
              {project.url ? (
                <div className="work-meta-link">
                  <dt className="sr-only">사이트</dt>
                  <dd>
                    <a
                      className="work-live"
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      사이트 방문 <ArrowUpRight size={18} aria-hidden="true" />
                      <span className="sr-only"> (새 탭에서 열림)</span>
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>

        <div className="shell work-cover">
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={1600}
            height={1000}
            preload
            sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 64px), 1320px"
          />
        </div>

        <section className="shell work-body" aria-label="프로젝트 설명">
          {sections.map(([label, text]) => (
            <div className="work-block" key={label}>
              <h2>{label}</h2>
              <p>{text}</p>
            </div>
          ))}
          <div className="work-block">
            <h2>주요 기능</h2>
            <ul className="work-features">
              {detail.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {project.gallery.length > 0 ? (
          <section
            className="shell work-gallery"
            aria-labelledby="gallery-title"
          >
            <h2 id="gallery-title" className="work-gallery-title">
              화면 둘러보기
            </h2>
            <ul data-count={project.gallery.length}>
              {project.gallery.map((image) => (
                <li key={image.src}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1600}
                    height={1000}
                    sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 64px), 1320px"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav className="shell work-pager" aria-label="다른 프로젝트">
          {[
            { project: previous, label: "이전 프로젝트", dir: "prev" },
            { project: next, label: "다음 프로젝트", dir: "next" },
          ].map(({ project: item, label, dir }) => (
            <Link
              key={dir}
              href={`/work/${item.slug}`}
              className="work-pager-link"
              data-dir={dir}
            >
              <span className="work-pager-thumb">
                <Image
                  src={item.cover.src}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 96px, 180px"
                />
              </span>
              <span className="work-pager-text">
                <small>
                  {dir === "prev" ? (
                    <ArrowLeft size={14} aria-hidden="true" />
                  ) : null}
                  {label}
                  {dir === "next" ? (
                    <ArrowRight size={14} aria-hidden="true" />
                  ) : null}
                </small>
                <strong>{item.name}</strong>
                <span>{categoryLabels[item.category]}</span>
              </span>
            </Link>
          ))}
        </nav>

        <ContactSection subject={`PLUCK 프로젝트 문의 — ${project.name} 관련`} />
      </main>
      <StudioFooter />
    </>
  );
}

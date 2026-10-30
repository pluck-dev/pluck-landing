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
import { JsonLd } from "@/components/json-ld";
import { ProjectCard } from "@/components/project-index";
import { WorkVideo } from "@/components/work-video";
import {
  categoryLabels,
  formatYears,
  getAdjacentProjects,
  getProject,
  mediaStill,
  projects,
  type PortfolioProject,
  type ProjectCategory,
} from "@/lib/portfolio";
import {
  absoluteUrl,
  baseOpenGraph,
  categoryPages,
  organizationRef,
  projectDescription,
  projectTitle,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
} from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

const FRAME_SIZES =
  "(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 64px), 1320px";

/** Only slugs from lib/portfolio.ts exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const title = projectTitle(project);
  const description = projectDescription(project);
  const path = `/work/${project.slug}`;
  // og:image/twitter:image come from ./opengraph-image.tsx (cover-based, 1200x630).
  return {
    title,
    description,
    keywords: [...project.detail.stack.slice(0, 5), categoryPages[project.category].label],
    alternates: { canonical: path },
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      url: path,
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

/** Same category first (display order keeps live work on top), then fill from the rest. */
function relatedProjects(slug: string, category: ProjectCategory, count = 3) {
  const others = projects.filter((item) => item.slug !== slug);
  return [
    ...others.filter((item) => item.category === category),
    ...others.filter((item) => item.category !== category),
  ].slice(0, count);
}

function projectJsonLd(project: PortfolioProject) {
  const url = absoluteUrl(`/work/${project.slug}`);
  const hub = categoryPages[project.category];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: project.name,
        headline: project.detail.oneLiner,
        description: project.description,
        abstract: project.detail.overview,
        url,
        image: absoluteUrl(project.cover.src),
        dateCreated: String(project.years[0]),
        ...(project.years[1] !== project.years[0]
          ? { dateModified: String(project.years[1]) }
          : {}),
        inLanguage: "ko-KR",
        genre: hub.label,
        keywords: [...project.detail.stack, ...project.disciplines].join(", "),
        creator: organizationRef,
        publisher: organizationRef,
        isPartOf: { "@id": WEBSITE_ID },
        ...(project.url ? { sameAs: project.url } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: `${hub.label} 포트폴리오`,
            item: absoluteUrl(`/work/category/${project.category}`),
          },
          { "@type": "ListItem", position: 3, name: project.name, item: url },
        ],
      },
    ],
  };
}

export default async function WorkPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const { detail } = project;
  const { previous, next } = getAdjacentProjects(project.slug);
  const related = relatedProjects(project.slug, project.category);
  const hub = categoryPages[project.category];
  const sections = [
    ["개요", detail.overview],
    ["문제", detail.problem],
    ["해결", detail.solution],
  ] as const;

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      <StudioHeader />
      <main id="main" className="work-page">
        <section className="shell work-hero" id="top" aria-labelledby="work-title">
          <nav className="work-crumbs" aria-label="이동 경로">
            <Link href="/#work">
              <ArrowLeft size={16} aria-hidden="true" /> 전체 프로젝트
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={`/work/category/${project.category}`}>
              {hub.label} 포트폴리오
            </Link>
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

        <figure className="shell work-cover">
          {project.demo ? (
            <WorkVideo video={project.demo}>
              <Image
                src={project.demo.poster}
                alt={project.demo.alt}
                width={1600}
                height={1000}
                preload
                sizes={FRAME_SIZES}
              />
            </WorkVideo>
          ) : (
            <Image
              src={project.cover.src}
              alt={project.cover.alt}
              width={1600}
              height={1000}
              preload
              sizes={FRAME_SIZES}
            />
          )}
          {project.demo?.caption ? (
            <figcaption>{project.demo.caption}</figcaption>
          ) : null}
        </figure>

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
              {project.gallery.map((media) => {
                const still = (
                  <Image
                    src={mediaStill(media)}
                    alt={media.alt}
                    width={1600}
                    height={1000}
                    sizes={FRAME_SIZES}
                  />
                );
                return (
                  <li key={media.src} data-type={media.type ?? "image"}>
                    <figure>
                      {media.type === "video" ? (
                        <WorkVideo video={media}>{still}</WorkVideo>
                      ) : (
                        still
                      )}
                      {media.caption ? (
                        <figcaption>{media.caption}</figcaption>
                      ) : null}
                    </figure>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="shell work-related" aria-labelledby="related-title">
          <div className="work-related-head">
            <h2 id="related-title" className="work-gallery-title">
              함께 보면 좋은 프로젝트
            </h2>
            <Link
              className="button button-ghost"
              href={`/work/category/${project.category}`}
            >
              {hub.label} 포트폴리오 전체 보기
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <ul className="work-grid">
            {related.map((item) => (
              <ProjectCard key={item.slug} project={item} index={0} />
            ))}
          </ul>
        </section>

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

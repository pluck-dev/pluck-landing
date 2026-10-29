import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ProjectCard } from "@/components/project-index";
import {
  ContactSection,
  StudioFooter,
  StudioHeader,
} from "@/components/site-chrome";
import {
  categoryOrder,
  projects,
  type ProjectCategory,
} from "@/lib/portfolio";
import {
  absoluteUrl,
  baseOpenGraph,
  categoryPages,
  defaultOgImage,
  organizationRef,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
} from "@/lib/site";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return categoryOrder.map((category) => ({ category }));
}

function resolve(category: string) {
  if (!(categoryOrder as readonly string[]).includes(category)) return null;
  const id = category as ProjectCategory;
  return {
    id,
    page: categoryPages[id],
    list: projects.filter((project) => project.category === id),
  };
}

function hubDescription(page: (typeof categoryPages)[ProjectCategory], count: number) {
  return `${page.summary} ${count}건. 프로젝트마다 문제와 해결 과정, 맡은 역할, 사용 기술을 정리했습니다.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = resolve((await params).category);
  if (!hub) return {};
  const path = `/work/category/${hub.id}`;
  const description = hubDescription(hub.page, hub.list.length);
  return {
    title: hub.page.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...baseOpenGraph,
      type: "website",
      url: path,
      title: `${hub.page.title} | ${SITE_NAME}`,
      description,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${hub.page.title} | ${SITE_NAME}`,
      description,
      images: [defaultOgImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const hub = resolve((await params).category);
  if (!hub) notFound();
  const url = absoluteUrl(`/work/category/${hub.id}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: hub.page.title,
        description: hubDescription(hub.page, hub.list.length),
        inLanguage: "ko-KR",
        isPartOf: { "@id": WEBSITE_ID },
        publisher: organizationRef,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: hub.list.length,
          itemListElement: hub.list.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/work/${project.slug}`),
            name: project.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: `${hub.page.label} 포트폴리오`, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <StudioHeader />
      <main id="main" className="work-page">
        <section className="shell work-hero hub-hero" id="top" aria-labelledby="hub-title">
          <nav className="work-crumbs" aria-label="이동 경로">
            <Link href="/#work">
              <ArrowLeft size={16} aria-hidden="true" /> 전체 프로젝트
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{hub.page.label} 포트폴리오</span>
          </nav>
          <div className="work-hero-copy hub-copy">
            <h1 id="hub-title">{hub.page.heading}</h1>
            <p>
              {hub.page.intro} 지금 {hub.list.length}개 프로젝트를 볼 수 있습니다.
            </p>
          </div>
          <nav className="hub-nav" aria-label="포트폴리오 분야">
            {categoryOrder.map((id) => (
              <Link
                key={id}
                href={`/work/category/${id}`}
                aria-current={id === hub.id ? "page" : undefined}
              >
                {categoryPages[id].label}
                <span className="filter-count">
                  {projects.filter((project) => project.category === id).length}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="shell hub-list" aria-label={`${hub.page.label} 프로젝트 목록`}>
          <ul className="work-grid">
            {hub.list.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                eager={index < 3}
              />
            ))}
          </ul>
        </section>

        <ContactSection subject={`PLUCK 프로젝트 문의 — ${hub.page.label}`} />
      </main>
      <StudioFooter />
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState, type CSSProperties } from "react";
import {
  categoryLabels,
  categoryOrder,
  formatYears,
  projects,
  type PortfolioProject,
  type ProjectCategory,
} from "@/lib/portfolio";
import { StatusPill } from "@/components/status-pill";
import { CardPreview } from "@/components/work-video";

type Filter = ProjectCategory | "all";

const filters: { id: Filter; label: string; count: number }[] = [
  { id: "all", label: "전체", count: projects.length },
  ...categoryOrder.map((id) => ({
    id,
    label: categoryLabels[id],
    count: projects.filter((project) => project.category === id).length,
  })),
];

/**
 * `eager` only for a first row that sits near the fold (category hubs). On the home
 * page the grid is far below the hero, so eager cards would emit image preloads
 * that compete with the LCP headline.
 */
export function ProjectCard({
  project,
  index,
  eager = false,
}: {
  project: PortfolioProject;
  index: number;
  eager?: boolean;
}) {
  return (
    <li
      className="work-card"
      style={{ "--i": Math.min(index, 12) } as CSSProperties}
    >
      <Link className="work-card-link" href={`/work/${project.slug}`}>
        <span className="work-card-media">
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) calc(50vw - 46px), 420px"
            loading={eager ? "eager" : "lazy"}
            className="work-card-image"
          />
          {project.demo ? <CardPreview video={project.demo} /> : null}
          <span className="work-card-circle" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        </span>
        <span className="work-card-meta">
          <span>
            {categoryLabels[project.category]} · {formatYears(project.years)}
          </span>
          <StatusPill status={project.status} />
        </span>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <span className="work-card-tags">
          {project.disciplines.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
      </Link>
    </li>
  );
}

export function ProjectIndex() {
  const [filter, setFilter] = useState<Filter>("all");
  const [filtered, setFiltered] = useState(false);

  const visible =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);

  return (
    <div className="project-index">
      <div
        className="index-filters"
        role="group"
        aria-label="프로젝트 카테고리 필터"
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => {
              setFilter(item.id);
              setFiltered(true);
            }}
          >
            {item.label}
            <span className="filter-count">{item.count}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length}개 프로젝트 표시 중
      </p>

      <ul
        className="work-grid"
        key={filter}
        data-animate={filtered || undefined}
      >
        {visible.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </ul>
    </div>
  );
}

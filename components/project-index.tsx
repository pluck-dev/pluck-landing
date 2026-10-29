"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  categoryLabels,
  categoryOrder,
  formatYears,
  projects,
  statusLabels,
  type PortfolioProject,
  type ProjectCategory,
} from "@/lib/portfolio";

type Filter = ProjectCategory | "all";

const PREVIEW_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 901px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribePreview(onChange: () => void) {
  const query = window.matchMedia(PREVIEW_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const filters: { id: Filter; label: string; count: number }[] = [
  { id: "all", label: "전체", count: projects.length },
  ...categoryOrder.map((id) => ({
    id,
    label: categoryLabels[id],
    count: projects.filter((project) => project.category === id).length,
  })),
];

function ProjectTile({ project }: { project: PortfolioProject }) {
  return (
    <span className="index-tile" data-tone={project.tile.tone}>
      <span className="index-tile-caption">
        {project.name} / {categoryLabels[project.category].toUpperCase()}
      </span>
      <span className="index-tile-mark">{project.tile.mark}</span>
      <span className="index-tile-rings" />
    </span>
  );
}

function RowBody({ project }: { project: PortfolioProject }) {
  return (
    <>
      <span className="index-year">{formatYears(project.years)}</span>
      <span className="index-name">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
      </span>
      <span className="index-tags">{project.disciplines.join(" / ")}</span>
      <span className="index-status" data-status={project.status}>
        <i aria-hidden="true" />
        {statusLabels[project.status]}
      </span>
      <span className="index-arrow" aria-hidden="true">
        {project.url ? <ArrowUpRight size={18} /> : null}
      </span>
    </>
  );
}

export function ProjectIndex() {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const [filtered, setFiltered] = useState(false);
  const canPreview = useSyncExternalStore(
    subscribePreview,
    () => window.matchMedia(PREVIEW_QUERY).matches,
    () => false,
  );
  const preview = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, cx: 0, cy: 0, frame: 0 });

  const visible =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);

  useEffect(() => {
    const state = pointer.current;
    return () => cancelAnimationFrame(state.frame);
  }, []);

  const render = () => {
    const state = pointer.current;
    const ease = window.matchMedia(REDUCED_QUERY).matches ? 1 : 0.16;
    state.cx += (state.x - state.cx) * ease;
    state.cy += (state.y - state.cy) * ease;
    preview.current?.style.setProperty(
      "transform",
      `translate3d(${state.cx.toFixed(1)}px, ${state.cy.toFixed(1)}px, 0)`,
    );
    const settled =
      Math.abs(state.x - state.cx) < 0.2 && Math.abs(state.y - state.cy) < 0.2;
    state.frame = settled ? 0 : requestAnimationFrame(render);
  };

  const track = (event: PointerEvent<HTMLElement>, snap = false) => {
    if (!canPreview || event.pointerType !== "mouse") return;
    const state = pointer.current;
    // Keep the card beside the cursor and inside the viewport.
    const width = 360;
    const height = 225;
    const x = Math.min(event.clientX + 28, innerWidth - width - 16);
    const y = Math.max(
      16,
      Math.min(event.clientY - height / 2, innerHeight - height - 16),
    );
    state.x = x;
    state.y = y;
    if (snap) {
      state.cx = x;
      state.cy = y;
    }
    if (!state.frame) state.frame = requestAnimationFrame(render);
  };

  const enter = (event: PointerEvent<HTMLElement>, slug: string) => {
    if (!canPreview || event.pointerType !== "mouse") return;
    track(event, active === null);
    setActive(slug);
  };

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
            <sup>{String(item.count).padStart(2, "0")}</sup>
          </button>
        ))}
      </div>

      <div className="index-head" aria-hidden="true">
        <span>Year</span>
        <span>Project</span>
        <span>Discipline</span>
        <span>Status</span>
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.length}개 프로젝트 표시 중
      </p>

      <ul
        className="index-list"
        key={filter}
        data-animate={filtered || undefined}
        onPointerEnter={() => canPreview && setArmed(true)}
        onPointerLeave={() => setActive(null)}
      >
        {visible.map((project, index) => (
          <li
            key={project.slug}
            className="index-row"
            data-active={active === project.slug || undefined}
            style={{ "--i": Math.min(index, 12) } as CSSProperties}
            onPointerEnter={(event) => enter(event, project.slug)}
            onPointerMove={(event) => track(event)}
          >
            {project.url ? (
              <a
                className="index-row-inner"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <RowBody project={project} />
                <span className="sr-only"> (새 탭에서 열림)</span>
              </a>
            ) : (
              <div className="index-row-inner">
                <RowBody project={project} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {canPreview && armed ? (
        <div
          ref={preview}
          className="index-preview"
          data-visible={active !== null || undefined}
          aria-hidden="true"
        >
          {projects.map((project) => (
            <div
              key={project.slug}
              className="index-preview-frame"
              data-active={active === project.slug || undefined}
            >
              {project.preview ? (
                <Image
                  src={project.preview}
                  alt=""
                  fill
                  sizes="360px"
                  className="index-preview-image"
                />
              ) : (
                <ProjectTile project={project} />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

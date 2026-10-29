import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getProject } from "@/lib/portfolio";

/**
 * Hero proof: a loose stack of real, live client screens.
 * Order = paint order (last on top). Each frame links to its case page.
 */
const frames = [
  { slug: "dvia", className: "frame-back" },
  { slug: "rba", className: "frame-left" },
  { slug: "thousand", className: "frame-low" },
  { slug: "boryoung", className: "frame-main" },
] as const;

export function HeroCollage() {
  return (
    <div className="hero-collage">
      {frames.map(({ slug, className }, index) => {
        const project = getProject(slug);
        if (!project) return null;
        return (
          <div
            key={slug}
            className={`collage-layer ${className}`}
            style={{ "--i": index } as CSSProperties}
          >
            <Link
              href={`/work/${slug}`}
              className="collage-frame"
              aria-label={`${project.name} 프로젝트 보기`}
            >
              <span className="collage-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{project.name}</span>
              </span>
              <span className="collage-shot">
                <Image
                  src={project.cover.src}
                  alt={project.cover.alt}
                  fill
                  sizes="(max-width: 900px) 70vw, 440px"
                  loading="eager"
                  fetchPriority={className === "frame-main" ? "high" : "auto"}
                />
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

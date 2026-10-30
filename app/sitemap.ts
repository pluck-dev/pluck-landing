import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { categoryOrder, projects } from "@/lib/portfolio";
import { absoluteUrl } from "@/lib/site";

/**
 * lastModified = last git commit that touched the page's own content
 * (project images dir or portfolio data). Falls back to build time when git
 * history isn't available (e.g. a shallow clone without the path).
 */
function lastCommit(...paths: string[]) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out ? new Date(out) : new Date();
  } catch {
    return new Date();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const dataDate = lastCommit("lib/portfolio.ts");
  const siteDate = lastCommit("app", "components", "lib");

  return [
    {
      url: absoluteUrl("/"),
      lastModified: siteDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: lastCommit("app/contact"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: lastCommit("app/privacy"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...categoryOrder.map((category) => ({
      url: absoluteUrl(`/work/category/${category}`),
      lastModified: dataDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...projects.map((project) => {
      const imageDate = lastCommit(`public/work/${project.slug}`);
      return {
        url: absoluteUrl(`/work/${project.slug}`),
        lastModified: imageDate > dataDate ? imageDate : dataDate,
        changeFrequency: "monthly" as const,
        priority: project.category === "client" ? 0.8 : 0.6,
        images: [absoluteUrl(project.cover.src)],
      };
    }),
  ];
}

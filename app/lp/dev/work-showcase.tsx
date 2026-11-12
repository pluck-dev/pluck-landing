"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type ShowcaseType = "web" | "app" | "system";

export type ShowcaseItem = {
  slug: string;
  name: string;
  oneLiner: string;
  url: string;
  linkLabel: string;
  cover: { src: string; alt: string };
  types: ShowcaseType[];
};

/** Desktop grid shows this many before "더 보기"; the mobile swipe row always has all of them. */
const DESKTOP_LIMIT = 9;

const TABS: { key: ShowcaseType | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "web", label: "웹사이트" },
  { key: "app", label: "앱·모바일" },
  { key: "system", label: "관리자·플랫폼" },
];

/** S3: live, clickable work only. Tabs filter by type; on mobile the list is a horizontal swipe row. */
export function WorkShowcase({ items }: { items: ShowcaseItem[] }) {
  const [tab, setTab] = useState<ShowcaseType | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const shown = tab === "all" ? items : items.filter((item) => item.types.includes(tab));
  const hiddenCount = expanded ? 0 : Math.max(0, shown.length - DESKTOP_LIMIT);

  const select = (key: ShowcaseType | "all") => {
    setTab(key);
    listRef.current?.scrollTo({ left: 0 });
  };

  return (
    <>
      <div className="ld-tabs" role="group" aria-label="유형별로 보기">
        {TABS.map(({ key, label }) => {
          const count = key === "all" ? items.length : items.filter((item) => item.types.includes(key)).length;
          return (
            <button key={key} type="button" aria-pressed={tab === key} onClick={() => select(key)}>
              {label} <span>{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="ld-work-list" ref={listRef} aria-label="지금 접속해 볼 수 있는 서비스">
        {shown.map((item, index) => (
          <li
            key={item.slug}
            className="ld-work-card"
            data-extra={!expanded && index >= DESKTOP_LIMIT ? "" : undefined}
          >
            <a
              className="ld-work-shot"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image
                src={item.cover.src}
                alt=""
                width={1600}
                height={1000}
                sizes="(max-width: 760px) 80vw, (max-width: 1100px) 46vw, 400px"
              />
            </a>
            <div className="ld-work-body">
              <span className="ld-live">
                <span aria-hidden="true" />
                라이브
              </span>
              <h3>{item.name}</h3>
              <p>{item.oneLiner}</p>
              <div className="ld-work-links">
                <a
                  className="ld-work-open"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.name} ${item.linkLabel} (새 창)`}
                >
                  {item.linkLabel} <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <Link className="ld-work-more" href={`/work/${item.slug}`}>
                  만든 범위
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button type="button" className="button button-ghost ld-work-more-btn" onClick={() => setExpanded(true)}>
          {hiddenCount}개 더 보기
        </button>
      )}
    </>
  );
}

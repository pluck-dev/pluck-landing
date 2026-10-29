import type { PortfolioProject, ProjectCategory } from "@/lib/portfolio";

/**
 * Site-wide SEO constants. Canonical host is www (apex redirects to it).
 * Copy rules: real data only — no invented metrics, reviews, address or phone.
 */
export const SITE_URL = "https://www.pluck.co.kr";
export const SITE_NAME = "PLUCK 플럭";
export const BRAND = "PLUCK";
export const CONTACT_EMAIL = "admin@pluck.co.kr";
export const GITHUB_URL = "https://github.com/pluck-dev";
export const THEME_COLOR = "#335aeb";

export const HOME_TITLE =
  "PLUCK 플럭 | 홈페이지 제작·앱 개발·AI 자동화 외주 스튜디오";
export const HOME_DESCRIPTION =
  "서울의 디지털 스튜디오 PLUCK은 기획·디자인·개발을 한 팀이 맡습니다. 웹사이트·홈페이지 제작, 앱 개발 외주, 스타트업 MVP 개발, AI 업무 자동화까지 실제로 운영되는 서비스로 만듭니다.";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

/** Category hub copy for /work/category/[category]. Counts are computed, never typed. */
export const categoryPages: Record<
  ProjectCategory,
  { label: string; title: string; heading: string; intro: string; summary: string }
> = {
  client: {
    summary: "홈페이지·웹사이트 제작부터 회원 플랫폼, 운영 어드민, 정산 시스템까지 기업과 단체의 의뢰로 만든 클라이언트 작업",
    label: "클라이언트 작업",
    title: "클라이언트 웹사이트·플랫폼 개발 포트폴리오",
    heading: "클라이언트 웹사이트·플랫폼 개발 사례",
    intro:
      "기업과 단체의 의뢰로 만든 웹사이트, 회원 플랫폼, 운영 어드민입니다. 기획과 UI 디자인부터 개발과 배포까지 맡았고, 일부는 지금 바로 접속해 볼 수 있습니다.",
  },
  product: {
    summary: "아이디어를 MVP로 만들어 다듬어 온, PLUCK이 직접 기획·디자인·개발한 자체 웹 서비스",
    label: "자체 서비스",
    title: "자체 서비스 기획·개발 포트폴리오",
    heading: "직접 기획하고 개발한 자체 서비스",
    intro:
      "PLUCK이 문제를 정하고 기획·디자인·개발까지 직접 진행한 웹 서비스입니다. 아이디어를 MVP로 만들고 기능을 다듬어 온 과정을 프로젝트마다 정리했습니다.",
  },
  app: {
    summary: "모바일 앱, 웹앱, 웹뷰 기반 앱까지 화면 설계부터 기능 구현과 앱·웹 연동을 맡은 앱 개발 작업",
    label: "앱",
    title: "앱 개발 포트폴리오",
    heading: "모바일·웹 앱 개발 사례",
    intro:
      "모바일 앱과 웹앱, 웹뷰 기반 앱 작업입니다. 화면 설계부터 기능 구현, 앱과 웹 사이의 연동까지 맡은 범위를 프로젝트마다 그대로 적었습니다.",
  },
  ai: {
    summary: "콘텐츠 생성, 데이터 수집·정리, 알림과 브리지처럼 실제 업무 흐름에 붙여 쓰는 AI 자동화·개발 도구",
    label: "AI 자동화",
    title: "AI 자동화·업무 자동화 개발 포트폴리오",
    heading: "AI 자동화와 개발 도구",
    intro:
      "반복 업무를 줄이기 위해 만든 AI 연동, 업무 자동화, 개발 도구입니다. 콘텐츠 생성, 데이터 수집·정리, 알림과 브리지 같은 실제 업무 흐름에 붙여 쓰고 있습니다.",
  },
};

/** "<name> — <category> 포트폴리오", the template appends "| PLUCK 플럭". */
export function projectTitle(project: PortfolioProject) {
  return `${project.name} — ${categoryPages[project.category].label} 포트폴리오`;
}

/** Card summary + role/stack, trimmed to a search-snippet length. */
export function projectDescription(project: PortfolioProject, max = 155) {
  const { detail } = project;
  const extra = ` 맡은 일: ${detail.role.join("·")}. 기술: ${detail.stack.slice(0, 4).join(", ")}.`;
  return clip(project.description + extra, max);
}

/** Cover alt prefixed with the project name unless the alt already says it. */
export function projectImageAlt(project: PortfolioProject) {
  const { alt } = project.cover;
  return alt.includes(project.name) ? alt : `${project.name} — ${alt}`;
}

/** Default branded OG card (app/opengraph-image.tsx) for pages without their own image. */
export const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "PLUCK 플럭 — 홈페이지 제작·앱 개발·AI 자동화를 한 팀이 처음부터 끝까지",
};

function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.:·]+$/, "")}…`;
}

/** Safe for <script type="application/ld+json">: no "</script>" breakout. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const organizationRef = { "@id": ORGANIZATION_ID };

/** Spread into every page's openGraph — nested metadata objects replace, not merge. */
export const baseOpenGraph = {
  locale: "ko_KR",
  siteName: SITE_NAME,
} as const;

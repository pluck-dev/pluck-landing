/**
 * Project index source of truth.
 * Years come from each repository's first/last commit. Only links verified as
 * deployed from our own code are listed; everything else stays unlinked.
 */

export type ProjectCategory = "client" | "product" | "app" | "ai";
export type ProjectStatus = "live" | "development" | "case" | "concept";
export type TileTone = "blue" | "forest" | "lime" | "ink" | "stone";

export type PortfolioProject = {
  slug: string;
  name: string;
  category: ProjectCategory;
  /** First and last active year. Same value when the work fits in one year. */
  years: readonly [number, number];
  description: string;
  disciplines: readonly string[];
  status: ProjectStatus;
  url?: string;
  /** Above-the-fold capture of the live site in /public/work. */
  preview?: string;
  /** Typographic tile shown when there is no public screenshot. */
  tile: { tone: TileTone; mark: string };
};

export const categoryLabels: Record<ProjectCategory, string> = {
  client: "Client work",
  product: "Product",
  app: "App",
  ai: "AI & Automation",
};

export const statusLabels: Record<ProjectStatus, string> = {
  live: "Live",
  development: "In development",
  case: "Case study",
  concept: "Concept",
};

export const projects: readonly PortfolioProject[] = [
  // Client work
  {
    slug: "rba",
    name: "알비연 통합 플랫폼",
    category: "client",
    years: [2026, 2026],
    description:
      "ROTC 출신 사업가 네트워크를 위한 회원 웹과 집행부 어드민을 하나로 묶은 플랫폼.",
    disciplines: ["Web platform", "Admin", "Supabase"],
    status: "live",
    url: "https://rba-client.vercel.app/",
    preview: "/work/rba.webp",
    tile: { tone: "ink", mark: "RBA" },
  },
  {
    slug: "boryoung",
    name: "보령항공여행사",
    category: "client",
    years: [2026, 2026],
    description:
      "해외 골프투어 상품 탐색부터 상담 문의까지, 여행사 웹사이트와 상품 관리 어드민.",
    disciplines: ["Website", "Commerce admin"],
    status: "live",
    url: "https://www.boryoung.co.kr/",
    preview: "/work/boryoung.webp",
    tile: { tone: "forest", mark: "Golf" },
  },
  {
    slug: "dvia",
    name: "DVIA · 대일시스템",
    category: "client",
    years: [2025, 2026],
    description: "정밀 제진 시스템 제조기업의 글로벌 웹사이트와 3D 제품 경험.",
    disciplines: ["Global website", "3D experience"],
    status: "live",
    url: "https://web-daeilsys-v2.vercel.app/",
    preview: "/work/dvia.webp",
    tile: { tone: "forest", mark: "DVIA" },
  },
  {
    slug: "jeongfood",
    name: "정푸드 관리 시스템",
    category: "client",
    years: [2025, 2026],
    description:
      "식자재 유통사의 재고, 거래처별 단가, 안내 문자 업무를 한곳에서 운영하는 관리 시스템.",
    disciplines: ["Operations", "Admin", "Messaging"],
    status: "live",
    url: "https://jeongfood.vercel.app/",
    tile: { tone: "lime", mark: "재고" },
  },
  {
    slug: "dealer-settlement",
    name: "자동차보험 딜러 정산 플랫폼",
    category: "client",
    years: [2026, 2026],
    description:
      "딜러의 계약·추천·수수료 정산을 다루는 딜러 웹과 운영 어드민. 비공개 운영 중.",
    disciplines: ["Dealer web", "Admin", "Settlement"],
    status: "case",
    tile: { tone: "stone", mark: "정산" },
  },
  {
    slug: "homecare-platform",
    name: "홈헬스케어 통합 플랫폼",
    category: "client",
    years: [2026, 2026],
    description:
      "방문간호·돌봄 기업을 위한 고객 웹사이트, 교육 플랫폼, 통합 관리자를 잇는 플랫폼.",
    disciplines: ["Website", "LMS", "Admin"],
    status: "development",
    tile: { tone: "blue", mark: "Care" },
  },
  {
    slug: "proposal-brochure",
    name: "AI 의사결정 시스템 제안서",
    category: "client",
    years: [2026, 2026],
    description:
      "AI 의사결정 시스템 도입을 설명하는 웹 슬라이드 제안서와 인쇄용 버전.",
    disciplines: ["Interactive deck", "Print"],
    status: "case",
    tile: { tone: "ink", mark: "Deck" },
  },

  // Product
  {
    slug: "myotgiya",
    name: "몇기야",
    category: "product",
    years: [2025, 2025],
    description:
      "ROTC 동문이 기수로 서로를 찾고 커뮤니티·모임·비즈니스로 이어지는 동문 네트워크.",
    disciplines: ["Community", "Web service"],
    status: "live",
    url: "https://www.myotgiya.com/",
    preview: "/work/myotgiya.webp",
    tile: { tone: "lime", mark: "몇기" },
  },
  {
    slug: "seo-engine",
    name: "SEO 엔진",
    category: "product",
    years: [2026, 2026],
    description:
      "수집, 키워드 발굴, AI 콘텐츠 생성, 멀티채널 발행, 성과 분석을 한 관리자에서 운영하는 콘텐츠 자동화 엔진.",
    disciplines: ["Content automation", "Admin", "AI"],
    status: "development",
    tile: { tone: "blue", mark: "SEO" },
  },
  {
    slug: "boxon",
    name: "boxon®",
    category: "product",
    years: [2026, 2026],
    description:
      "모든 개봉 결과를 Provably-Fair 알고리즘과 Kaia 블록체인으로 검증하는 랜덤박스 커머스.",
    disciplines: ["Commerce", "Blockchain", "Admin"],
    status: "development",
    tile: { tone: "ink", mark: "box" },
  },
  {
    slug: "webtoon-voice",
    name: "Webtoon Voice Studio",
    category: "product",
    years: [2026, 2026],
    description:
      "웹툰 에피소드 위에 배우가 대사를 직접 녹음해 자신만의 더빙 버전을 만드는 보이스 스튜디오.",
    disciplines: ["Web app", "Audio", "AI image"],
    status: "development",
    tile: { tone: "forest", mark: "Voice" },
  },
  {
    slug: "seoul-home",
    name: "서울 집 찾기",
    category: "product",
    years: [2026, 2026],
    description:
      "실거래·매물·공고·정책을 지도 위에 모아, 내 조건으로 갈 수 있는 집을 보여주는 주거 탐색 서비스.",
    disciplines: ["Map service", "Public data"],
    status: "development",
    tile: { tone: "stone", mark: "집" },
  },
  {
    slug: "car-store",
    name: "자동차용품 자사몰",
    category: "product",
    years: [2026, 2026],
    description:
      "스토어프론트, 자체 API, 관리자 화면을 하나의 코드베이스로 묶은 자동차용품 전문 D2C 쇼핑몰.",
    disciplines: ["Commerce", "API", "Admin"],
    status: "development",
    tile: { tone: "blue", mark: "D2C" },
  },
  {
    slug: "villa-parking",
    name: "빌라 주차 PWA",
    category: "product",
    years: [2026, 2026],
    description:
      "입주민 차량과 방문 차량 등록, 주차 알림을 다루는 공동주택 주차 관리 PWA.",
    disciplines: ["PWA", "Web push"],
    status: "development",
    tile: { tone: "lime", mark: "P" },
  },
  {
    slug: "farm-sales",
    name: "농수산물 위탁판매 관리",
    category: "product",
    years: [2026, 2026],
    description:
      "상품, 주문, 시즌, 정산까지 농수산물 위탁판매 운영을 관리하는 어드민.",
    disciplines: ["Admin", "Dashboard"],
    status: "development",
    tile: { tone: "stone", mark: "농" },
  },
  {
    slug: "thousand",
    name: "THOUSAND",
    category: "product",
    years: [2026, 2026],
    description:
      "서울의 파이 하우스를 상상한 브랜드 쇼핑몰 컨셉. 진열장 위 파이 하나하나가 반응하는 인터랙션.",
    disciplines: ["Brand site", "Interaction"],
    status: "concept",
    tile: { tone: "forest", mark: "Pie" },
  },

  // App
  {
    slug: "setflow",
    name: "Setflow",
    category: "app",
    years: [2026, 2026],
    description: "회원·트레이너·짐을 잇는 캘린더 중심의 운동 기록과 코칭 앱.",
    disciplines: ["Flutter", "Fitness"],
    status: "live",
    url: "https://setflow-app.vercel.app/",
    preview: "/work/setflow.webp",
    tile: { tone: "ink", mark: "Set" },
  },
  {
    slug: "naengkeep",
    name: "냉킵",
    category: "app",
    years: [2026, 2026],
    description:
      "재료와 소비기한을 기록하고 가족과 함께 쓰는 냉장고 관리 앱. 현재 테스터 배포 중.",
    disciplines: ["Flutter", "Firebase", "AI"],
    status: "development",
    url: "https://naengkeep-support.web.app/",
    preview: "/work/naengkeep.webp",
    tile: { tone: "lime", mark: "냉킵" },
  },
  {
    slug: "joseon",
    name: "Joseon App",
    category: "app",
    years: [2026, 2026],
    description:
      "조선의 신분·직업·관직을 카드로 수집하는 팩 오프닝 앱. Unity 이펙트를 Flutter에 연결.",
    disciplines: ["Flutter", "Unity"],
    status: "development",
    tile: { tone: "stone", mark: "朝" },
  },
  {
    slug: "voxcli",
    name: "VoxCLI",
    category: "app",
    years: [2026, 2026],
    description:
      "여러 PC의 Codex·Claude Code 세션을 모바일에서 음성으로 지시하고 결과를 확인하는 리모트.",
    disciplines: ["Mobile", "Voice", "Dev tools"],
    status: "development",
    tile: { tone: "blue", mark: "Vox" },
  },

  // AI & Automation
  {
    slug: "video-kit",
    name: "Claude Video Kit",
    category: "ai",
    years: [2026, 2026],
    description:
      "스크립트, 스토리보드, TTS, 렌더링까지 Claude Code와 Remotion으로 잇는 영상 제작 파이프라인.",
    disciplines: ["Remotion", "Agents"],
    status: "case",
    tile: { tone: "ink", mark: "Cut" },
  },
  {
    slug: "thumbnail",
    name: "YouTube 썸네일 생성기",
    category: "ai",
    years: [2026, 2026],
    description:
      "레퍼런스 검색부터 이미지 생성까지, 브랜드 가이드에 맞춘 썸네일을 만드는 Claude Code 스킬.",
    disciplines: ["Image generation", "Agents"],
    status: "case",
    tile: { tone: "blue", mark: "16:9" },
  },
  {
    slug: "contest-watch",
    name: "공모전 모니터",
    category: "ai",
    years: [2026, 2026],
    description:
      "매일 아침 공모전 공고를 조사해 새로운 후보와 변경점을 HTML 리포트로 정리하는 AI 모니터.",
    disciplines: ["Scheduled agent", "Reporting"],
    status: "case",
    tile: { tone: "lime", mark: "09:00" },
  },
  {
    slug: "discord-bridge",
    name: "Discord–Codex Bridge",
    category: "ai",
    years: [2026, 2026],
    description:
      "Discord 채널을 Codex CLI와 원격 PC 작업 공간으로 바꾸는 개발 운영 봇.",
    disciplines: ["Dev ops", "Agents", "Bot"],
    status: "case",
    tile: { tone: "forest", mark: "!" },
  },
  {
    slug: "figma-mcp",
    name: "Figma MCP Bridge 확장",
    category: "ai",
    years: [2026, 2026],
    description:
      "오픈소스 Figma MCP Bridge에 디자인→웹 구현을 위한 정밀 데이터 추출을 더한 포크.",
    disciplines: ["MCP", "Design to code"],
    status: "case",
    tile: { tone: "stone", mark: "MCP" },
  },
  {
    slug: "handstage",
    name: "HandStage",
    category: "ai",
    years: [2026, 2026],
    description:
      "두 손의 손가락 프레임 안에 실시간 필터나 AI로 변환한 영상을 여는 인터랙션 스튜디오.",
    disciplines: ["MediaPipe", "Generative video"],
    status: "case",
    tile: { tone: "blue", mark: "Hands" },
  },
];

export const categoryOrder: readonly ProjectCategory[] = [
  "client",
  "product",
  "app",
  "ai",
];

export function formatYears([start, end]: readonly [number, number]) {
  return start === end ? String(start) : `${start}—${String(end).slice(2)}`;
}

export function getPortfolioStats(list: readonly PortfolioProject[]) {
  const starts = list.map((project) => project.years[0]);
  const ends = list.map((project) => project.years[1]);
  return {
    total: list.length,
    categories: new Set(list.map((project) => project.category)).size,
    live: list.filter((project) => project.status === "live").length,
    client: list.filter((project) => project.category === "client").length,
    span: formatYears([Math.min(...starts), Math.max(...ends)]),
  };
}

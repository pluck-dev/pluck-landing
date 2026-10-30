/**
 * Project index source of truth.
 * Years come from each repository's first/last commit. Only links verified as
 * deployed from our own code are listed; everything else stays unlinked.
 */

export type ProjectCategory = "client" | "product" | "app" | "ai";
export type ProjectStatus = "live" | "development" | "case" | "concept";

export type ProjectImage = {
  /** 1600x1000 (16:10) webp under /public/work/<slug>/. */
  src: string;
  /** Korean alt text describing the screen. */
  alt: string;
};

export type ProjectDetail = {
  oneLiner: string;
  role: readonly string[];
  stack: readonly string[];
  overview: string;
  problem: string;
  solution: string;
  features: readonly string[];
};

export type PortfolioProject = {
  slug: string;
  name: string;
  category: ProjectCategory;
  /** First and last active year. Same value when the work fits in one year. */
  years: readonly [number, number];
  /** 1-2 line card description. */
  description: string;
  /** Card tags (first three are shown). */
  disciplines: readonly string[];
  status: ProjectStatus;
  url?: string;
  /** Real screenshot when one exists; otherwise a designed cover (see MEMORY). */
  cover: ProjectImage;
  gallery: readonly ProjectImage[];
  detail: ProjectDetail;
};

export const categoryLabels: Record<ProjectCategory, string> = {
  client: "클라이언트",
  product: "자체 서비스",
  app: "앱",
  ai: "AI·자동화",
};

export const statusLabels: Record<ProjectStatus, string> = {
  live: "라이브",
  development: "개발 중",
  case: "사례",
  concept: "콘셉트",
};

export const categoryOrder: readonly ProjectCategory[] = [
  "client",
  "product",
  "app",
  "ai",
];

const projectList: readonly PortfolioProject[] = [
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
    cover: { src: "/work/rba/cover.webp", alt: "ROTC 비즈니스 연합회 회원 웹 메인 히어로와 활동 지표" },
    gallery: [
      { src: "/work/rba/01.webp", alt: "회원 디렉토리·커뮤니티·행사 등 서비스를 모은 벤토 그리드" },
      { src: "/work/rba/02.webp", alt: "동문 제휴 혜택과 회원 비즈니스 홍보 카드 목록" },
      { src: "/work/rba/03.webp", alt: "다가오는 행사 카드와 공지사항·집행부 조직도 섹션" },
      { src: "/work/rba/04.webp", alt: "모바일 화면 3종: 메인 히어로, 서비스 카드, 행사 목록" },
    ],
    detail: {
      oneLiner: "ROTC 출신 사업가를 잇는 회원 웹과 집행부 어드민",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
      ],
      stack: [
        "Next.js 16",
        "React 19",
        "Supabase",
        "Tailwind CSS v4",
        "shadcn/ui",
        "pnpm 모노레포",
      ],
      overview:
        "ROTC 장교 출신 사업가 단체를 위한 플랫폼으로, 회원이 쓰는 웹(client)과 집행부가 운영하는 어드민(admin)을 하나의 pnpm 모노레포와 공유 Supabase 패키지로 구성했습니다.",
      problem:
        "회원 명단, 행사, 공지, 회비·모금, 경조사 같은 단체 운영 업무와 회원 간 네트워킹이 흩어져 있었고, 가입 회원의 신원 확인 절차도 필요했습니다.",
      solution:
        "업종·지역·기수로 찾는 회원 디렉토리와 커뮤니티·행사·비즈니스 매칭을 회원 웹에 모으고, 어드민에서 사전 명단 등록과 가입 승인, 콘텐츠·행사·결제·신고 관리까지 처리하도록 설계했습니다.",
      features: [
        "업종·지역·기수 기반 회원 디렉토리",
        "커뮤니티·투표·홍보 게시판",
        "행사 신청과 공지",
        "비즈니스 매칭·제휴 혜택",
        "사전 명단 연결 후 관리자 가입 승인",
        "집행부 조직도·모금·경조사 관리",
      ],
    },
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
    cover: { src: "/work/boryoung/cover.webp", alt: "보령항공여행사 메인 - 계절별 골프여행 히어로 캐러셀" },
    gallery: [
      { src: "/work/boryoung/01.webp", alt: "여행상품 목록 - 목적지 검색, 카테고리·가격 필터와 상품 카드 그리드" },
      { src: "/work/boryoung/02.webp", alt: "오키나와 골프투어 상품 상세 - 가격, 전화·카카오톡 상담 버튼" },
      { src: "/work/boryoung/03.webp", alt: "회사소개 페이지 - 2004년부터 이어온 골프여행 전문 여행사 히어로" },
      { src: "/work/boryoung/04.webp", alt: "모바일 화면 3종: 메인, 상품 목록 검색, 상품 상세와 하단 상담 바" },
    ],
    detail: {
      oneLiner: "해외 골프투어 여행사의 상품 사이트와 운영 어드민",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
      ],
      stack: [
        "Next.js 16",
        "React 19",
        "Supabase",
        "Prisma",
        "Tailwind CSS v4",
        "Tiptap",
        "Turborepo",
      ],
      overview:
        "23년 업력의 해외 골프투어 전문 여행사 웹사이트입니다. 고객용 웹과 상품·예약 문의를 관리하는 어드민을 Turborepo 모노레포로 함께 만들었습니다.",
      problem:
        "국가·골프장·일정이 다양한 상품을 고객이 쉽게 비교하고, 상담까지 바로 이어지는 구조가 필요했습니다.",
      solution:
        "목적지 검색과 카테고리·가격 필터, 일정표와 상담 문의를 갖춘 상품 상세를 만들고, 어드민에서 상품·배너·기획전·매거진·문의를 직접 운영하도록 했습니다.",
      features: [
        "목적지·골프장 검색과 카테고리·가격 필터",
        "일정표·가격 옵션을 담은 상품 상세",
        "전화·카카오톡 상담과 간편 문의",
        "골프여행 매거진",
        "엑셀 상품 일괄 등록",
        "AI 보조 매거진 글 작성",
      ],
    },
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
    cover: { src: "/work/dvia/cover.webp", alt: "대일시스템 메인 - 진동 파형 파티클 히어로" },
    gallery: [
      { src: "/work/dvia/01.webp", alt: "DVIA-MLP1000 제품 페이지 히어로 - 써모피셔 SEM 전용 액티브 제진 시스템" },
      { src: "/work/dvia/02.webp", alt: "DVIA-MLP1000 분해 구조를 보여주는 3D 제품 섹션" },
      { src: "/work/dvia/03.webp", alt: "지오폰 센서와 6축 제어를 설명하는 인터랙티브 기술 섹션" },
      { src: "/work/dvia/04.webp", alt: "도입사례 목록 - 시리즈·장비 유형 필터와 설치 보고서 카드" },
      { src: "/work/dvia/05.webp", alt: "모바일 화면 3종: 메인 새로운 소식, DVIA-ML 제품, 도입사례" },
    ],
    detail: {
      oneLiner: "정밀 제진 시스템 제조사의 글로벌 웹사이트와 3D 제품 경험",
      role: [
        "UI 디자인",
        "프론트엔드",
        "3D·모션",
        "콘텐츠 구조화",
      ],
      stack: [
        "Next.js",
        "React",
        "Three.js",
        "GSAP",
        "Framer Motion",
        "Tailwind CSS",
      ],
      overview:
        "전자현미경·반도체 장비용 액티브/패시브 제진대를 만드는 제조기업의 웹사이트입니다. 제품 라인업, 도입사례, 기술 노트, 자료실, 뉴스룸을 담은 글로벌 사이트로 구성했습니다.",
      problem:
        "수치와 원리로 설명해야 하는 정밀 장비를 연구자와 구매 담당자가 빠르게 이해하고 비교할 수 있어야 했습니다.",
      solution:
        "제품별 전용 페이지에 3D 분해 구조, 신호 처리 다이어그램, 스크롤 모션을 넣어 원리를 보여주고, 도입사례를 시리즈·장비 유형으로 색인해 근거를 찾기 쉽게 했습니다.",
      features: [
        "제품별 3D·스크롤 모션 상세 페이지",
        "시리즈·장비 유형별 도입사례 색인",
        "기술 노트와 제진대 가이드",
        "브로슈어·카탈로그·매뉴얼 자료실",
        "뉴스룸과 고객의 소리(VOC)",
        "제품별 기술 사양·견적 요청 동선",
      ],
    },
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
    cover: { src: "/work/jeongfood/cover.webp", alt: "분류별 재고 막대와 거래처 단가 배지, 안내 문자 발송 완료 카드를 표현한 디자인 커버" },
    gallery: [
      { src: "/work/jeongfood/01.webp", alt: "재고, 거래처 단가, 안내 문자, 권한·동의 업무가 하나의 어드민으로 모인 구조를 정리한 표" },
    ],
    detail: {
      oneLiner: "식자재 유통사의 재고·단가·안내 문자 운영 시스템",
      role: [
        "기획",
        "데이터 설계",
        "프론트엔드",
        "백엔드",
        "어드민",
      ],
      stack: [
        "Next.js 15",
        "React 19",
        "Supabase",
        "TanStack Query",
        "Tailwind CSS v4",
        "Recharts",
      ],
      overview:
        "많은 식자재 품목과 거래처를 다루는 유통사를 위한 관리자 시스템입니다. CSV로 관리하던 재고 데이터를 데이터베이스로 옮기고, 상품·재고·거래처·주문·문자 발송을 하나의 어드민에 모았습니다.",
      problem:
        "재고를 엑셀·CSV로 수동 관리해 실시간 파악이 어려웠고, 거래처마다 다른 단가로 안내 문자를 매일 손으로 작성해야 했습니다.",
      solution:
        "분류 체계를 갖춘 상품·재고 DB와 거래처별 단가 관리를 만들고, 단가표와 안내 문자를 시스템에서 발송·기록하도록 했습니다. 역할 기반 관리자 권한과 수신 동의 절차도 함께 설계했습니다.",
      features: [
        "대·중분류 기반 상품·재고 관리",
        "거래처별 차등 단가 관리",
        "안내 문자 발송과 발송 이력",
        "거래처 수신 동의 요청 관리",
        "주문·재고 대시보드",
        "역할 기반 관리자 권한(RBAC)",
      ],
    },
  },
  {
    slug: "dealer-settlement",
    name: "자동차보험 딜러 정산 플랫폼",
    category: "client",
    years: [2026, 2026],
    description:
      "딜러의 계약·추천·수수료 정산을 다루는 딜러 모바일 웹과 운영 어드민. 실서비스 운영 중.",
    disciplines: ["Dealer web", "Admin", "Settlement"],
    status: "live",
    url: "https://client-roan-six.vercel.app/",
    cover: { src: "/work/dealer-settlement/cover.webp", alt: "딜러 웹 데스크톱 화면 - 소개 수수료 등급표와 추천 코드 카드 옆에 샘플 데이터로 채운 모바일 대시보드 미리보기" },
    gallery: [
      { src: "/work/dealer-settlement/01.webp", alt: "딜러 모바일 웹 3장 - 추천 수수료 온보딩, 샘플 데이터 홈 대시보드, 딜러 등록 신청 양식" },
      { src: "/work/dealer-settlement/02.webp", alt: "딜러 모바일 웹의 내 계약 목록, 상태·정산 필터 바텀시트, 갱신 예정월 필터 화면 (테스트 데이터)" },
      { src: "/work/dealer-settlement/03.webp", alt: "정산대기, 월말정산, 지급보류·미지급, 정산완료로 이어지는 정산 상태 모델 다이어그램" },
    ],
    detail: {
      oneLiner: "딜러 계약·추천·수수료 정산을 한 곳에서",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
        "데이터 이관",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Prisma",
        "Supabase",
        "TanStack Query",
        "Tailwind CSS",
      ],
      overview:
        "자동차보험 딜러가 자신의 계약·추천 실적·수수료를 확인하는 모바일 딜러 웹과, 운영팀이 딜러·계약·정산을 관리하는 어드민, 소개 랜딩으로 구성된 정산 플랫폼입니다. 로그인 전에는 샘플 데이터로 화면을 미리 볼 수 있고, 운영 중인 서비스로 현업 수정요청을 반영하며 고도화하고 있습니다.",
      problem:
        "엑셀로 관리되던 대량의 계약과 딜러별 수수료·추천 수당을 사람이 대조해야 해 누락과 불일치가 생기기 쉬웠습니다.",
      solution:
        "계약·정산 상태(정산대기·미지급·정산완료·지급보류·월말정산)를 데이터 모델로 정의하고, 엑셀 가져오기/내보내기와 역할별 권한을 갖춘 어드민과 딜러용 모바일 웹을 하나의 DB 위에 구축했습니다.",
      features: [
        "딜러 등록 신청과 관리자 승인",
        "계약 목록·상태·정산상태 필터",
        "갱신 예정월 기반 계약 조회",
        "추천인 관리와 레퍼럴 트리",
        "엑셀 가져오기·내보내기",
        "역할별(매니저/관리자) 조회 권한 분리",
      ],
    },
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
    cover: { src: "/work/homecare-platform/cover.webp", alt: "상담·평가·플랜 흐름과 서비스 찾기 웹, 교육 과정 LMS, 상담 접수 어드민 카드를 표현한 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "방문간호·돌봄 기업의 웹·교육·관리를 하나로",
      role: [
        "기획",
        "IA 설계",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Turborepo",
        "Prisma",
        "PostgreSQL",
        "NextAuth",
      ],
      overview:
        "방문간호·요양·호스피스 등 홈헬스케어 서비스를 운영하는 기업을 위해 고객용 웹사이트, 요양보호사·간호 인력 교육 플랫폼, 통합 관리자를 하나의 모노레포로 설계·개발하고 있습니다.",
      problem:
        "서비스 안내, 상담 접수, 인력 교육, 멤버십이 서로 다른 채널에 흩어져 있어 이용자 여정과 운영 데이터가 끊겨 있었습니다.",
      solution:
        "웹·아카데미·어드민 3개 앱이 공통 DB·UI 패키지를 공유하는 Turborepo 구조로 묶고, 연령대별 서비스 탐색·상담 신청·멤버십·교육 과정을 한 흐름으로 연결했습니다.",
      features: [
        "연령대·유형별 홈헬스케어 서비스 탐색",
        "센터 찾기와 온라인 상담 신청",
        "이용자·제공자 멤버십 비교",
        "홈헬스케어 용품 쇼핑몰",
        "직군별 교육 과정·수료 관리(LMS)",
        "다국어(i18n) 라우팅",
      ],
    },
  },
  {
    slug: "thousand",
    name: "THOUSAND",
    category: "client",
    years: [2026, 2026],
    description:
      "서울의 파이 하우스 THOUSAND의 브랜드 쇼핑몰. 진열장 위 파이 하나하나가 반응하는 구매 경험.",
    disciplines: ["Brand site", "E-commerce", "Interaction"],
    status: "live",
    url: "https://web-lilac-rho-78.vercel.app/",
    cover: { src: "/work/thousand/cover.webp", alt: "따뜻한 조명의 유리 진열장 안에 파이 네 종이 놓이고 하단에 선택한 파이와 담기 버튼이 보이는 THOUSAND 메인 화면" },
    gallery: [
      { src: "/work/thousand/01.webp", alt: "진열장 배경을 흐리게 두고 치즈 블루베리 파이 정보와 한 조각 담기 버튼을 띄운 상품 미리보기 창" },
      { src: "/work/thousand/02.webp", alt: "In the mood for pie 헤드라인 아래 카테고리 필터와 파이 상품 카드가 4열로 놓인 쇼핑 목록 화면" },
      { src: "/work/thousand/03.webp", alt: "바나나 크림 파이 큰 이미지 옆에 가격, 수량, 장바구니 담기, 픽업 안내가 있는 상품 상세 화면" },
      { src: "/work/thousand/04.webp", alt: "모바일 진열장 메인, 쇼핑 목록, 상품 상세를 나란히 배치한 모바일 화면 3장" },
    ],
    detail: {
      oneLiner: "진열장 위 파이 하나하나가 반응하는 브랜드 쇼핑몰",
      role: [
        "UI 디자인",
        "인터랙션",
        "프론트엔드",
        "AI 이미지",
        "배포",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Supabase",
        "CSS 모션",
        "Playwright",
      ],
      overview:
        "서울의 파이 하우스 THOUSAND를 위한 브랜드 쇼핑몰입니다. 매장의 실제 파이 사진을 참고해 만든 투명 파이 이미지 8종과 빈 진열장 이미지를 HTML 요소로 조합해, 진열장 자체를 상품 탐색 화면으로 만들었습니다. 현재 배포본은 결제 없이 구매 흐름을 시연하는 버전입니다.",
      problem:
        "사진 한 장에 핫스폿을 얹는 방식으로는 파이마다 독립된 반응을 주기 어렵고, 모바일·키보드 사용성도 떨어졌습니다.",
      solution:
        "파이를 개별 요소로 분리해 호버·포커스 시 해당 파이만 확대되고 주변이 물러나도록 설계했습니다. 상품 목록, 상세, 장바구니, 픽업 주문까지 구매 흐름 전체를 구현하고 데스크톱·모바일 Playwright 테스트로 검증했습니다.",
      features: [
        "진열장 파이별 호버·포커스 집중 모션",
        "방향키 탐색과 터치 선택 지원",
        "카테고리 필터·가격 정렬 쇼핑 목록",
        "장바구니와 픽업 주문 흐름",
        "한글·영문 이름과 재료 통합 검색",
        "reduced-motion 대응 반응형 화면",
      ],
    },
  },
  {
    slug: "abroadnbroad",
    name: "ABROAD&BROAD",
    category: "client",
    years: [2026, 2026],
    description:
      "해외 거주 한인을 위한 글로벌 지역 커뮤니티. 국가·도시별 게시판, 토론, 모임, 지역 정보를 한 웹에.",
    disciplines: ["Community", "Web app", "Supabase"],
    status: "live",
    url: "https://abroadnbroad.vercel.app/",
    cover: { src: "/work/abroadnbroad/cover.webp", alt: "ABROAD&BROAD 메인 - 지역 선택 헤더와 자유토론장·커뮤니티·구인구직·부동산 탭, 뜨거운 토론과 행사 캘린더 섹션" },
    gallery: [
      { src: "/work/abroadnbroad/01.webp", alt: "글로벌 커뮤니티 게시글 카드 목록과 지역 기반 만남 모임 카드 섹션" },
      { src: "/work/abroadnbroad/02.webp", alt: "지역 명소 카드와 로컬 업체 카드 목록, 하단 운영 정책 링크가 있는 푸터" },
    ],
    detail: {
      oneLiner: "국가·도시 단위로 이어지는 해외 한인 커뮤니티",
      role: [
        "프론트엔드",
        "백엔드 협업",
        "DB 설계",
        "어드민",
        "E2E 테스트",
      ],
      stack: [
        "React",
        "Vite",
        "TypeScript",
        "Supabase",
        "PostgreSQL",
        "Playwright",
      ],
      overview:
        "해외에 사는 사람들이 국가·도시 단위로 정보를 나누는 글로벌 지역 커뮤니티입니다. 자유토론장, 커뮤니티, 구인구직, 벼룩시장, 부동산, 모임, 로컬 업체, 관광 명소, 행사 게시판을 지역 필터 하나로 묶었습니다.",
      problem:
        "해외 생활 정보는 나라·도시마다 흩어진 단톡방과 카페에 나뉘어 있어, 내 지역의 글만 골라 보거나 모임·행사를 찾기 어려웠습니다.",
      solution:
        "지역 선택을 공통 레이아웃으로 끌어올려 모든 게시판이 같은 지역 기준으로 필터링되게 했고, 게시판 탭·토론방·모임·행사를 각각의 데이터 모델과 어드민(신고·격리·번역·지역 관리)으로 운영할 수 있게 만들었습니다. 자동 번역은 Qwen 또는 Google Cloud Translation 중 선택해 쓸 수 있습니다.",
      features: [
        "국가·도시 지역 필터와 지도 모달",
        "게시판 탭·글쓰기·댓글·추천",
        "토론방과 자유토론 게시판",
        "모임·행사 등록과 캘린더",
        "자동 번역과 언어 선택",
        "신고·격리·공지 관리 어드민",
      ],
    },
  },
  {
    slug: "v8-cal-lab",
    name: "V8 Cal Lab",
    category: "client",
    years: [2026, 2026],
    description:
      "카마로 ECU·TCU 맵핑 튜닝 숍의 브랜드 사이트와 예약·작업이력 관리 서비스.",
    disciplines: ["Brand site", "Reservation", "Admin"],
    status: "live",
    url: "https://hptunermap.vercel.app/",
    cover: { src: "/work/v8-cal-lab/cover.webp", alt: "어두운 엔진룸 사진 위에 'V8, 그대로.' 붉은 헤드라인과 예약 버튼이 있는 V8 Cal Lab 메인 히어로" },
    gallery: [
      { src: "/work/v8-cal-lab/01.webp", alt: "엔진 사진 배경의 '흐름을 다듬다' 캘리브레이션 섹션" },
      { src: "/work/v8-cal-lab/02.webp", alt: "카마로 4기통 삭제 맵, ECU 맵핑, TCU 맵핑, HP Tuners 기반 튜닝 서비스 카드 목록" },
      { src: "/work/v8-cal-lab/03.webp", alt: "주행 기록 앱 D2R 다운로드 페이지 - 버전 안내와 앱 화면 미리보기" },
      { src: "/work/v8-cal-lab/04.webp", alt: "모바일 화면 3장 - 메인 히어로, 튜닝 서비스 목록, D2R 다운로드" },
    ],
    detail: {
      oneLiner: "튜닝 숍의 예약부터 작업일지까지",
      role: [
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
        "보안",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Supabase",
        "Tailwind CSS",
        "Vercel Blob",
      ],
      overview:
        "HP Tuners로 카마로 ECU·TCU를 맵핑하는 튜닝 숍의 웹 서비스입니다. 브랜드 사이트와 서비스 소개, 회원·비회원 예약과 예약 조회, 커뮤니티, 주행 기록 앱(D2R) 다운로드, 관리자 예약·회원·작업일지 화면을 하나의 Next.js 앱으로 구성했습니다.",
      problem:
        "예약은 전화와 메신저로 받고 차량별 작업 이력은 따로 기록하다 보니, 예약 확인과 재방문 차량의 이전 작업을 찾는 데 시간이 걸렸습니다.",
      solution:
        "비회원도 휴대폰 인증으로 예약하고 예약번호로 조회하게 했고, 관리자 화면에서 예약별 작업일지를 남기도록 연결했습니다. 예약·인증 API에는 rate limit을 두고, 운영자 알림에는 이름·연락처·차량번호를 담지 않도록 설계했습니다.",
      features: [
        "회원·비회원 예약과 휴대폰 인증",
        "예약번호 기반 비회원 예약 조회",
        "튜닝 서비스 소개와 상세 페이지",
        "관리자 예약·회원·작업일지",
        "D2R 앱 최신 버전 다운로드 연결",
        "예약·인증 API rate limit",
      ],
    },
  },
  {
    slug: "lulla",
    name: "Lulla · AI 동화책",
    category: "client",
    years: [2026, 2026],
    description:
      "짧은 음성 녹음으로 부모의 목소리를 복제해 동화를 읽어주는 AI 동화책 앱.",
    disciplines: ["Mobile app", "Voice AI", "Backend"],
    status: "development",
    cover: { src: "/work/lulla/cover.webp", alt: "동화 재생 화면과 음성 녹음 카드를 표현한 Lulla 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "부모의 목소리로 읽어주는 AI 동화",
      role: [
        "아키텍처 설계",
        "모바일 앱",
        "백엔드",
        "음성 AI",
        "인프라",
      ],
      stack: [
        "Flutter",
        "Riverpod",
        "Rust FFI",
        "FastAPI",
        "Celery",
        "PostgreSQL",
        "Qwen3-TTS",
      ],
      overview:
        "부모가 짧게 녹음한 목소리로 음성을 합성해, 아이에게 동화를 부모 목소리로 읽어주는 모바일 서비스입니다. Flutter 앱과 인증·콘텐츠·구독·프로모션·TTS 서비스로 나눈 백엔드를 하나의 저장소에서 설계했습니다.",
      problem:
        "매일 밤 동화를 읽어주고 싶어도 시간이 부족한 부모가 많고, 일반 TTS 동화는 아이에게 낯선 목소리라는 한계가 있었습니다.",
      solution:
        "제로샷 음성 복제 모델(Qwen3-TTS)을 GPU 서버의 TTS 서비스로 분리하고, 앱에서는 녹음·라이브러리·플레이어 흐름에 집중했습니다. 오디오 처리와 암호화는 Rust FFI로 분리해 성능과 보안을 챙겼습니다.",
      features: [
        "부모 음성 녹음과 음성 복제",
        "연령·주제별 동화 라이브러리",
        "동화 플레이어와 스트리밍",
        "카메라로 실물 동화책 스캔(로드맵)",
        "구독·프로모션 서비스",
        "서비스별로 나눈 백엔드 구조",
      ],
    },
  },
  {
    slug: "d2c-store",
    name: "자동차용품 자사몰",
    category: "client",
    years: [2026, 2026],
    description:
      "자동차 튜닝 파츠 브랜드의 자사몰. 차종 적합성 기반 스토어프론트와 주문·재고 관리자를 한 코드베이스로.",
    disciplines: ["E-commerce", "Admin", "PostgreSQL"],
    status: "development",
    cover: { src: "/work/d2c-store/cover.webp", alt: "차종 필터가 있는 파츠 상품 그리드와 주문·재고 관리자 패널을 표현한 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "차종에 맞는 파츠를 파는 자체 개발 쇼핑몰",
      role: [
        "기획",
        "프론트엔드",
        "백엔드",
        "어드민",
        "DB 설계",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "PostgreSQL",
        "Redis",
        "Stripe",
        "Docker Compose",
      ],
      overview:
        "바디킷·윙·립 같은 자동차 튜닝 파츠를 판매하는 자사몰입니다. 고객용 스토어프론트, 자체 API, 관리자 화면을 하나의 Next.js 프로젝트에서 시작하고, PostgreSQL과 Redis를 포함한 로컬 환경을 Docker Compose 한 줄로 띄울 수 있게 구성했습니다.",
      problem:
        "오픈마켓에서는 차종·연식별 장착 가능 여부를 정확히 보여주기 어렵고, 수수료와 고객 데이터를 플랫폼에 의존해야 했습니다.",
      solution:
        "상품마다 장착 가능 차종(fitment)을 데이터로 관리해 스토어에서 걸러 보여주고, 주문·재고·반품·쿠폰·정산·고객 문의를 관리자 메뉴로 나눠 직접 운영할 수 있게 설계했습니다.",
      features: [
        "차종 적합성(fitment) 기반 상품 탐색",
        "장바구니·위시리스트·주문 조회",
        "결제와 주문 상태 관리",
        "재고·반품·쿠폰 관리",
        "매출·정산과 분석 대시보드",
        "Docker Compose 원클릭 로컬 실행",
      ],
    },
  },
  {
    slug: "knife-sharpening",
    name: "칼갈이 수거·배송 서비스",
    category: "client",
    years: [2025, 2025],
    description:
      "칼갈이 신청부터 수거·배송, 구독, 쿠폰까지 담은 모바일 웹 서비스.",
    disciplines: ["Mobile web", "Supabase", "Subscription"],
    status: "case",
    cover: { src: "/work/knife-sharpening/cover.webp", alt: "Figma 시안 화면 3장 - 내 정보 메인과 칼갈이 신청 배너, 보유 쿠폰 목록, 약관 동의 시트" },
    gallery: [],
    detail: {
      oneLiner: "칼갈이를 앱으로 신청하고 문 앞에서 받는다",
      role: [
        "프론트엔드",
        "백엔드",
        "인증",
        "어드민",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Supabase",
        "TanStack Query",
        "Zustand",
        "Tailwind CSS",
      ],
      overview:
        "칼을 맡기면 수거해 연마한 뒤 다시 배송해 주는 칼갈이 서비스의 모바일 웹입니다. Figma 시안을 바탕으로 신청, 가격표, 이용 가이드, 이용내역, 알림, 구독, 쿠폰, 주소 설정, 고객센터 화면을 구현했습니다.",
      problem:
        "칼갈이는 매장에 직접 가야 하는 경우가 많아 번거롭고, 정기적으로 맡기는 고객을 관리할 방법도 마땅치 않았습니다.",
      solution:
        "휴대폰 문자 인증 가입과 주소 설정을 거쳐 몇 단계 만에 수거를 신청하게 하고, 정기 구독과 쿠폰으로 재이용을 유도하도록 화면과 데이터 흐름을 설계했습니다.",
      features: [
        "칼갈이 신청과 수거·배송 주소 관리",
        "휴대폰 문자 인증 회원가입",
        "가격표와 이용 가이드",
        "이용내역과 알림",
        "정기 구독과 쿠폰함",
        "공지사항·고객센터",
      ],
    },
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
    cover: { src: "/work/proposal-brochure/cover.webp", alt: "웹 슬라이드 제안서 표지 - PLUCK 블록 로고와 'AI 의사결정 지원 시스템 구축 제안서' 타이틀" },
    gallery: [
      { src: "/work/proposal-brochure/01.webp", alt: "제안 개요 슬라이드 - 결정 속도 개선, 자료 정리·비교 기준·쉬운 설명, 최종 판단은 사람 세 가지 핵심 카드" },
      { src: "/work/proposal-brochure/02.webp", alt: "'플럭은 이렇게 일합니다' 슬라이드 - 단계별 확인, 실제로 쓰는 화면, 최종 결정은 고객사, 벤더 종속 방지 4가지 원칙" },
      { src: "/work/proposal-brochure/03.webp", alt: "제안 범위 슬라이드 - 내부 의사결정 지원과 의사결정 회의 보조 화면 범위 카드" },
      { src: "/work/proposal-brochure/04.webp", alt: "제안서 마지막 슬라이드 - 블루 배경의 '감사합니다' 클로징 카드" },
    ],
    detail: {
      oneLiner: "AI 도입 제안을 웹 슬라이드로 설계하다",
      role: [
        "제안 기획",
        "카피라이팅",
        "UI 디자인",
        "프론트엔드",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
      ],
      overview:
        "ERP 데이터와 외부 시황 정보를 함께 보고 판매·구매·생산 판단을 돕는 AI 의사결정 지원 시스템을 제안하기 위해, 12장 분량의 웹 슬라이드 제안서와 인쇄용 레이아웃을 함께 제작했습니다.",
      problem:
        "부서마다 우선순위가 다른 상황에서 AI 도입의 범위·단계·비용을 의사결정자가 한 번에 이해하고 비교하기 어려웠습니다.",
      solution:
        "제안 개요부터 범위, 단계별 일정·산출물, 진행안 비교, 후속 과제까지를 키보드로 넘기는 웹 슬라이드로 구성하고, 같은 콘텐츠를 A4 인쇄 레이아웃(/print)으로도 출력되게 만들었습니다.",
      features: [
        "키보드·URL 해시 기반 슬라이드 내비게이션",
        "진행 바와 페이지 인디케이터",
        "단계별 일정·산출물 비교표",
        "협업 방식별 3가지 진행안 비교",
        "인쇄 전용 레이아웃(/print)",
      ],
    },
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
    cover: { src: "/work/myotgiya/cover.webp", alt: "몇기야 메인 - 기수별 커뮤니티 히어로 배너와 동문찾기·커뮤니티·모임·비즈니스 바로가기" },
    gallery: [
      { src: "/work/myotgiya/02.webp", alt: "동문 비즈니스 페이지 - 업종·지역 필터와 로그인 안내" },
      { src: "/work/myotgiya/03.webp", alt: "모바일 화면 3종: 메인, 모임 목록, 동문 비즈니스와 하단 탭 바" },
    ],
    detail: {
      oneLiner: "기수로 서로를 찾는 ROTC 동문 네트워크",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
      ],
      stack: [
        "Next.js 16",
        "React 19",
        "Supabase",
        "TanStack Query",
        "Tiptap",
        "Tailwind CSS v4",
      ],
      overview:
        "전국 ROTC 출신을 하나로 잇는 폐쇄형 동문 커뮤니티 서비스입니다. 기수별 공간과 전체 동문 검색, 모임, 동문 비즈니스, 1:1 채팅을 한 서비스에 담았습니다.",
      problem:
        "기수별 단톡방·밴드로 흩어진 소통은 검색과 기록이 어렵고, 기수를 넘어선 연결이나 신원 확인이 되지 않았습니다.",
      solution:
        "ROTC 인증 신청과 관리자 검토로 신뢰를 확보하고, 기수·학교·지역·업종으로 동문을 찾으며 커뮤니티·모임·비즈니스로 이어지도록 구성했습니다.",
      features: [
        "기수·학교·지역·업종 동문 검색",
        "증빙 기반 ROTC 인증과 관리자 검토",
        "카테고리별 커뮤니티 게시판",
        "세미나·소모임 등 모임 개설과 참여",
        "동문 비즈니스 디렉토리",
        "동문 간 1:1 채팅",
      ],
    },
  },
  {
    slug: "seo-engine",
    name: "SEO 엔진",
    category: "product",
    years: [2026, 2026],
    description:
      "수집, 키워드 발굴, AI 콘텐츠 생성, 멀티채널 발행, 성과 분석을 한 관리자에서 운영하는 콘텐츠 자동화 엔진.",
    disciplines: ["Content automation", "Admin", "AI"],
    status: "live",
    url: "https://seo-engine-web-two.vercel.app/",
    cover: { src: "/work/seo-engine/cover.webp", alt: "SEO 엔진 관리자 블로그 대시보드 - 수집 소스·신규 키워드·검토대기·발행완료·추정 수익 KPI와 인기 글 TOP 5" },
    gallery: [
      { src: "/work/seo-engine/01.webp", alt: "주제 큐 화면 - 트렌드·정보·제휴 탭과 주제별 콘텐츠 생성·카드뉴스 생성 버튼 카드" },
      { src: "/work/seo-engine/02.webp", alt: "콘텐츠 관리 목록 - 카테고리, 발행 상태, 품질 점수, 채널 변환본 수, 조회수 테이블" },
      { src: "/work/seo-engine/03.webp", alt: "AI로 자동 생성된 카드뉴스 샘플 3장 - 표지, 요약 표, 계산 예시" },
      { src: "/work/seo-engine/04.webp", alt: "공개 정보 블로그 '플럭로그' 메인 - 금융·정책·복지·생활·청약 카테고리와 오늘의 픽 공고 카드" },
      { src: "/work/seo-engine/05.webp", alt: "플럭로그 모바일 화면 3장 - 메인 히어로, 카테고리와 지금 주목 카드, 최신 공고 글 목록" },
    ],
    detail: {
      oneLiner: "수집부터 발행·수익까지 자동화한 SEO 엔진",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
        "AI 파이프라인",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Prisma",
        "Supabase",
        "Claude API",
        "Turborepo",
      ],
      overview:
        "정부 공고·트렌드 등 정보 소스를 수집해 키워드를 분류하고, AI로 글과 카드뉴스를 생성해 여러 채널에 발행한 뒤 성과와 수익을 추적하는 사내 콘텐츠 자동화 시스템입니다.",
      problem:
        "정보형 콘텐츠를 꾸준히 만들려면 수집·선별·작성·채널별 변환·발행·성과 확인을 사람이 반복해야 했고, AI 생성물은 사실 오류 위험이 있었습니다.",
      solution:
        "수집→키워드→주제→생성→변환본→발행→성과를 하나의 데이터 파이프라인과 관리자로 묶고, 공고형 콘텐츠는 입력된 금액·날짜·대상·출처만 쓰도록 제한해 검증 가능한 자동화를 만들었습니다.",
      features: [
        "소스 수집과 스케줄러 자동 실행",
        "돈 되는 키워드 자동 분류·스코어링",
        "주제 큐에서 글·카드뉴스 원클릭 생성",
        "채널별 변환본과 멀티채널 발행",
        "품질 점수·검토 워크플로우",
        "성과·수익 대시보드",
        "발행 채널인 공개 블로그 '플럭로그'",
      ],
    },
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
    cover: { src: "/work/boxon/cover.webp", alt: "boxon 웹 홈 - 옐로 히어로 'OPEN YOUR NEXT.'와 유리 선물상자 오브젝트, 카테고리 탭과 오늘의 발견 박스 카드" },
    gallery: [
      { src: "/work/boxon/01.webp", alt: "박스 상세 화면 - 스타터 컬렉션 박스 이미지, 가격 19,900원, 구성·확률 안내 버튼" },
      { src: "/work/boxon/02.webp", alt: "개봉 연출 라이브러리 - 해시 디코딩·홀로그램·릴/룰렛 계열 리빌 애니메이션 변형 프레임" },
      { src: "/work/boxon/03.webp", alt: "보관함 화면 - 블루 히어로 'YOUR FINDS.'와 보유·미개봉 박스 카드" },
      { src: "/work/boxon/04.webp", alt: "V4 반응형 설계 - 데스크톱 1440, 모바일 430·360 화면 비교와 디자인 규격" },
    ],
    detail: {
      oneLiner: "블록체인으로 검증하는 랜덤박스 커머스",
      role: [
        "기획",
        "브랜딩",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
        "스마트컨트랙트",
        "앱",
      ],
      stack: [
        "Next.js",
        "NestJS",
        "Prisma",
        "PostgreSQL",
        "Kaia",
        "Solidity",
        "Flutter",
      ],
      overview:
        "테크·라이프·오브제 카테고리와 가격대별 랜덤박스를 열어 실물 상품을 받는 커머스 서비스입니다. 서비스 웹, 관리자, NestJS 백엔드, Flutter 웹뷰 앱, Kaia 스마트컨트랙트까지 하나의 모노레포로 만들고 있습니다.",
      problem:
        "랜덤박스는 확률과 결과를 이용자가 믿기 어렵다는 근본적인 신뢰 문제가 있습니다.",
      solution:
        "개봉 전 서버 시드 해시와 확률표를 Kaia에 커밋하고, HMAC 기반으로 결과를 정한 뒤 5분마다 Merkle root를 앵커링해 누구나 브라우저에서 결과를 재계산·검증할 수 있게 했습니다.",
      features: [
        "카테고리×가격대 랜덤박스 카탈로그",
        "Provably-Fair 개봉과 검증 페이지",
        "Kaia 블록체인 Merkle 앵커링",
        "다양한 개봉 연출(리빌) 애니메이션",
        "보관함·배송 신청과 결제",
        "확률·재고·주문 관리 어드민",
      ],
    },
  },
  {
    slug: "webtoon-voice",
    name: "더빙고 · Voice Webtoon",
    category: "product",
    years: [2026, 2026],
    description:
      "웹툰 에피소드 위에 배우가 대사를 직접 녹음해 자신만의 더빙 버전을 만드는 보이스 스튜디오.",
    disciplines: ["Web app", "Audio", "AI image"],
    status: "development",
    cover: { src: "/work/webtoon-voice/cover.webp", alt: "AI 웹툰을 내 목소리로라는 헤드라인과 AI 생성 컷, 음성 파형이 담긴 앱 화면 목업이 있는 더빙고 웹 메인" },
    gallery: [
      { src: "/work/webtoon-voice/01.webp", alt: "웹툰 컷 이미지와 대사 플레이어 옆에 컷별 녹음 진행, 전체 영상 미리보기, 영상 생성 패널이 있는 에피소드 녹음 스튜디오" },
      { src: "/work/webtoon-voice/02.webp", alt: "AI로 만든 웹툰 에피소드 세 편을 썸네일 카드로 보여주는 작품 갤러리 섹션" },
      { src: "/work/webtoon-voice/03.webp", alt: "글만 쓰면 장면 생성, 내 목소리 연기, 친구와 함께 만들기 등 핵심 가치와 4단계 사용 흐름 섹션" },
      { src: "/work/webtoon-voice/04.webp", alt: "모바일 메인, 갤러리, 에피소드 녹음 화면을 나란히 배치한 모바일 화면 3장" },
    ],
    detail: {
      oneLiner: "AI 웹툰 위에 내 목소리를 입히는 더빙 스튜디오",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "AI 이미지",
        "모바일 앱",
      ],
      stack: [
        "Next.js",
        "Prisma",
        "PostgreSQL",
        "Clerk",
        "Remotion",
        "Flutter",
        "MediaRecorder",
      ],
      overview:
        "관리자가 AI로 9:16 웹툰 컷과 대사를 만들어 에피소드로 공개하면, 사용자가 컷마다 대사를 녹음해 자신만의 더빙 버전을 만드는 서비스입니다. 웹은 소개·갤러리·체험 녹음을, Flutter 앱은 제작과 반복 녹음을 맡도록 역할을 나눴습니다.",
      problem:
        "웹툰 더빙을 해보려면 장면 그림, 대본, 녹음, 영상 편집을 각각 다른 도구로 해야 해서 처음 연기해 보는 사람에게 진입 장벽이 높습니다.",
      solution:
        "상황을 한 줄 적으면 AI가 컷과 대사를 만들고, 브라우저에서 컷별로 바로 녹음한 뒤 타임라인을 기반으로 숏폼 영상을 렌더링하는 흐름으로 묶었습니다. 같은 에피소드를 여러 사람이 각자 연기하거나 배역을 나눠 함께 만들 수 있습니다.",
      features: [
        "AI 웹툰 컷·대사 자동 생성",
        "브라우저 컷별 대사 녹음",
        "녹음 타임라인 기반 영상 렌더링",
        "같은 에피소드의 배우별 버전",
        "친구와 배역 나눠 함께 더빙",
        "공개 작품 갤러리",
      ],
    },
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
    cover: { src: "/work/seoul-home/cover.webp", alt: "서울·수도권 지도 위에 공고와 매물 건수가 표시되고 왼쪽에 마감 임박 공고 목록이 놓인 집 찾기 작업 화면" },
    gallery: [
      { src: "/work/seoul-home/01.webp", alt: "정비구역을 진행 단계별 빗금으로 표시하고 구역 정보 팝업과 레이어 패널을 연 지도 화면" },
      { src: "/work/seoul-home/02.webp", alt: "단지명 검색 자동완성과 전세 매물 목록, 동네별 매물 묶음이 보이는 검색 화면" },
      { src: "/work/seoul-home/03.webp", alt: "부부 지역 추천 입력, 조건 비교 결과 카드, 시도 선택 패널을 담은 모바일 화면 3장" },
    ],
    detail: {
      oneLiner: "내 조건으로 갈 수 있는 집을 지도 위에서 찾는 서비스",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "데이터 수집",
      ],
      stack: [
        "Next.js",
        "FastAPI",
        "PostgreSQL",
        "Naver Maps",
        "APScheduler",
        "Docker",
      ],
      overview:
        "실거래가, 매물, 임대 공고, 주거 정책, 뉴스를 수집해 하나의 지도 작업공간에 모은 주거 탐색 서비스입니다. 서울은 2021년부터의 실거래를, 경기·인천 등은 시도별로 켜고 끄며 볼 수 있습니다.",
      problem:
        "집을 구할 때 시세, 매물, 공고, 대출·정책 자격이 각기 다른 사이트에 흩어져 있어 '내 조건으로 실제로 갈 수 있는 집'을 판단하기 어렵습니다.",
      solution:
        "여러 공공·민간 소스를 스케줄러로 정기 수집하고, 지도 위 오버레이 패널에서 통근 시간, 시세 대비, 감당 가능 여부, 자격을 한 화면에 보여주도록 설계했습니다. 소득·직장 위치 같은 민감 조건은 서버에 저장하지 않고 브라우저에서 계산합니다.",
      features: [
        "실거래·매물·공고·정책 통합 지도",
        "정비구역·역세권·동별 지표 레이어",
        "통근 시간·감당 가능 여부 판정",
        "부부 두 사람 기준 지역 추천 TOP 5",
        "보유 기간별 자산 시뮬레이션",
        "좁은 화면용 하단 시트 레이아웃",
      ],
    },
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
    cover: { src: "/work/car-store/cover.webp", alt: "튜닝 차량 사진 위에 MOVE DIFFERENT 헤드라인과 전체 컬렉션, 차량 맞춤 찾기 버튼이 놓인 ONTHEWAY 쇼핑몰 메인" },
    gallery: [
      { src: "/work/car-store/01.webp", alt: "Every line has a purpose 헤드라인 아래 바디킷, 범퍼, 스포일러, 디퓨저 카테고리 카드가 이어지는 섹션" },
      { src: "/work/car-store/02.webp", alt: "제조사, 모델, 연식을 골라 호환 상품을 찾는 내 차량 등록(My garage) 섹션" },
      { src: "/work/car-store/03.webp", alt: "350Z 와이드 바디킷 상품 이미지 옆에 가격, 차량 호환성 확인, 옵션, 장바구니 버튼이 있는 상품 상세" },
      { src: "/work/car-store/04.webp", alt: "검은 사이드바와 상품 검색, SKU, 카테고리, 가격, 재고 상태 표가 있는 관리자 상품 관리 화면(데모 데이터)" },
      { src: "/work/car-store/05.webp", alt: "모바일 메인, 상품 목록, 상품 상세를 나란히 배치한 모바일 화면 3장" },
    ],
    detail: {
      oneLiner: "차량 호환성부터 확인하는 자동차용품 자사몰",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "어드민",
      ],
      stack: [
        "Next.js",
        "PostgreSQL",
        "Redis",
        "Stripe",
        "Tailwind CSS",
        "Docker",
      ],
      overview:
        "바디킷, 카본 파츠, 스포일러 같은 자동차 튜닝용품을 판매하는 자사몰입니다. 고객용 스토어프론트와 자체 API, 운영 관리자 화면을 하나의 Next.js 코드베이스로 구성하고 Docker Compose로 로컬 실행 환경을 제공합니다.",
      problem:
        "튜닝 파츠는 차종·연식·트림에 따라 장착 여부가 달라, 일반 쇼핑몰 구조로는 구매 전 호환성 확인이 어렵습니다.",
      solution:
        "상품마다 제조사·모델·연식·트림 범위를 관리하는 차량 호환성 데이터를 두고, 고객이 내 차량을 먼저 등록하면 장착 가능한 상품부터 보여주도록 설계했습니다. 관리자에서 상품, 재고, 호환 정보, 주문, 쿠폰, 정산을 함께 다룹니다.",
      features: [
        "내 차량 등록 기반 호환 상품 탐색",
        "카테고리 필터와 상품 상세·옵션",
        "장바구니·위시리스트·주문 내역",
        "Stripe 연동 결제와 모의 결제 모드",
        "상품·재고·차량 호환성 관리자",
        "쿠폰·반품·정산·통계 관리 메뉴",
      ],
    },
  },
  {
    slug: "villa-parking",
    name: "빌라 주차 PWA",
    category: "product",
    years: [2026, 2026],
    description:
      "입주민 차량과 방문 차량 등록, 주차 알림을 다루는 공동주택 주차 관리 PWA.",
    disciplines: ["PWA", "Web push"],
    status: "live",
    url: "https://house-parking.vercel.app/",
    cover: { src: "/work/villa-parking/cover.webp", alt: "빌라 3D 일러스트와 출차하기 버튼이 있는 홈, 차량 위치가 표시된 주차장 평면, 자리 상세 시트를 담은 모바일 화면 3장" },
    gallery: [
      { src: "/work/villa-parking/01.webp", alt: "왼쪽 주차 구역의 빈자리 표시, 내 차량 등록·차종 선택, 방문 차량 등록 화면을 나란히 놓은 모바일 화면 3장" },
      { src: "/work/villa-parking/02.webp", alt: "출차 완료 알림과 되돌리기, 주차장 확대 보기, 외부차량 신고 양식을 담은 모바일 화면 3장" },
      { src: "/work/villa-parking/03.webp", alt: "라이브 배포 화면 3장 - 빌라 3D 일러스트 홈, 지상 1층 주차장 평면과 구역 목록, 입주민 로그인 시트" },
    ],
    detail: {
      oneLiner: "빌라 주차장을 한눈에 보는 입주민 주차 앱",
      role: [
        "기획",
        "UI 디자인",
        "3D 에셋",
        "프론트엔드",
        "백엔드",
      ],
      stack: [
        "Next.js",
        "React",
        "Supabase",
        "PostgreSQL",
        "Web Push",
        "PWA",
      ],
      overview:
        "주차 공간이 좁고 이중주차가 잦은 빌라 입주민을 위한 주차 관리 PWA입니다. 실제 주차장 구도를 렌더링한 평면 위에 자리별 차량과 빈자리를 표시하고, 입주민 계정과 관리자 승인 흐름을 갖추고 있습니다.",
      problem:
        "빌라 주차는 누가 어느 자리에 있는지, 앞차가 언제 나가는지 알기 어려워 매번 전화나 쪽지로 출차를 부탁해야 합니다.",
      solution:
        "주차장 평면에서 내 차 위치를 확정하고 출차 예정 시간을 남기게 했습니다. 이중주차로 막힌 차량에는 출차 요청을 보내면 차주에게 웹 푸시로 알림이 가고, 처리 내역까지 앱에서 확인합니다.",
      features: [
        "주차장 평면 위 자리별 차량·빈자리 표시",
        "이중주차 구역과 출차 예정 시간 관리",
        "출차 요청 웹 푸시 알림",
        "내 차량·방문 차량 분리 등록",
        "외부차량 신고와 공지사항",
        "입주 승인·관리자 화면",
      ],
    },
  },
  {
    slug: "gender-reveal",
    name: "젠더리빌 파티",
    category: "product",
    years: [2026, 2026],
    description:
      "의사가 성별을 봉인하고 공개일에 다 함께 여는 젠더리빌 이벤트 페이지. 카카오톡 공유와 RSVP까지.",
    disciplines: ["Event page", "Mobile web", "Supabase"],
    status: "live",
    url: "https://gender-reveal-eta-wheat.vercel.app/",
    cover: { src: "/work/gender-reveal/cover.webp", alt: "데모 모드 모바일 화면 3장 - 태명 입력, 의사 전용 성별 선택, 카운트다운이 있는 이벤트 페이지" },
    gallery: [
      { src: "/work/gender-reveal/01.webp", alt: "데모 모드 모바일 화면 3장 - 성별 확인 요청 완료, 봉인 완료, IT'S A GIRL 공개 화면" },
    ],
    detail: {
      oneLiner: "부모도 모르는 성별을, 파티에서 다 함께",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Supabase",
        "Supabase Auth",
        "Vercel",
      ],
      overview:
        "태명을 입력하면 의사 선생님이 성별을 비밀로 봉인하고, 공개일까지 잠가 두었다가 파티에서 함께 여는 젠더리빌 이벤트 페이지입니다. 카운트다운, 공개 버튼, 파티 정보, 참석 신청, 방명록, 카카오톡 공유 미리보기를 한 페이지에 담았습니다.",
      problem:
        "젠더리빌은 성별을 아는 사람이 따로 준비해야 하고, 부모가 결과를 미리 보지 않게 하면서 초대·참석 확인까지 챙기기 번거롭습니다.",
      solution:
        "의사 전용 봉인 화면을 QR 링크로 분리하고, 공개 시각 이전에는 서버 RPC가 결과를 돌려주지 않도록 했습니다. 이벤트마다 RLS로 데이터를 격리하고, 환경변수가 없으면 localStorage 데모 모드로 동작하게 만들었습니다.",
      features: [
        "의사 전용 성별 봉인 화면",
        "공개 시각 전 잠금과 카운트다운",
        "공개 연출과 다시 보기",
        "참석 신청(RSVP)과 방명록",
        "카카오톡·OG 공유 미리보기",
        "부모 공동 소유와 배우자 초대",
      ],
    },
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
    cover: { src: "/work/farm-sales/cover.webp", alt: "도매시장 경매 데이터와 검색 트렌드를 바탕으로 추천 품목을 원형 지표 카드로 보여주는 시장 분석 화면" },
    gallery: [
      { src: "/work/farm-sales/01.webp", alt: "품목별 검색 트렌드 선 그래프와 관심도 상승 TOP 10 막대 그래프, 카테고리별 분포 도넛 차트" },
      { src: "/work/farm-sales/02.webp", alt: "상태·카테고리 필터와 검색량, 변화율, 주산지 열이 있는 경매 품목 리스트" },
      { src: "/work/farm-sales/03.webp", alt: "지금 올라오는 품목, 한창 시즌인 품목, 피크 주의 품목을 세 열로 나눈 시즌 캘린더" },
      { src: "/work/farm-sales/04.webp", alt: "시즌 진입 알림, 트렌드 리포트, 자동 발주 등 자동화 파이프라인 목록 화면" },
    ],
    detail: {
      oneLiner: "경매 데이터로 다음 시즌 품목을 찾는 위탁판매 어드민",
      role: [
        "기획",
        "UI 디자인",
        "프론트엔드",
        "백엔드",
        "데이터 수집",
      ],
      stack: [
        "Next.js",
        "SQLite",
        "Recharts",
        "Tailwind CSS",
        "공공데이터 API",
        "네이버 데이터랩",
      ],
      overview:
        "온라인 마켓에서 농수산물을 위탁판매하는 1인 운영자를 위한 관리자 대시보드입니다. 전국 공영도매시장 경매 정보와 네이버 검색 트렌드를 수집해 지금 팔기 좋은 품목을 추천하고, 상품·주문·CS·정산 메뉴를 한곳에 모았습니다.",
      problem:
        "재고 없이 산지 직송으로 파는 위탁판매는 시즌 품목을 제때 고르는 것이 핵심인데, 경매 시세와 수요 흐름을 매번 따로 찾아봐야 했습니다.",
      solution:
        "최근 경매 거래 품목을 자동으로 찾아 검색량 추세와 결합하고, '지금이에요·관심도 상승·피크 주의' 같은 상태로 분류했습니다. 추천 품목은 클릭 한 번으로 상품 관리에 추가되고, 시즌 캘린더와 자동화 파이프라인으로 반복 업무를 줄이도록 설계했습니다.",
      features: [
        "도매시장 경매 데이터 자동 수집",
        "검색 트렌드 기반 품목 추천 상태",
        "품목 리스트 필터·정렬과 주산지",
        "시즌 진입·피크 품목 캘린더",
        "수익 시뮬레이터와 정산 화면",
        "자동화 파이프라인 관리",
      ],
    },
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
    cover: { src: "/work/setflow/cover.webp", alt: "Setflow 모바일 화면 3종: 오늘 운동 홈, 세트 기록, 함께 운동 레이스" },
    gallery: [
      { src: "/work/setflow/01.webp", alt: "루틴 편집, 휴식 타이머가 켜진 세트 기록, 내 루틴 목록" },
      { src: "/work/setflow/02.webp", alt: "전문가 루틴 마켓, 루틴 상세와 후기, 1:1 코칭 상담 화면" },
      { src: "/work/setflow/03.webp", alt: "트레이너 홈(수익·오늘 할 일), 짐 운영 홈, 짐 정산 화면 - 데모 데이터" },
      { src: "/work/setflow/04.webp", alt: "다크 모드: 홈, 운동 기록, 함께 운동 방" },
    ],
    detail: {
      oneLiner: "회원·트레이너·짐을 잇는 캘린더 중심 운동 기록 앱",
      role: [
        "기획",
        "UI 디자인",
        "Flutter 앱 개발",
        "백엔드",
      ],
      stack: [
        "Flutter",
        "Dart",
        "Supabase",
        "Hive",
        "Firebase Messaging",
        "Material 3",
      ],
      overview:
        "마찰 없는 운동 기록과 코칭을 목표로 한 Flutter 앱입니다. 회원, 트레이너, 짐 운영자, 서비스 운영자 역할별 화면을 하나의 앱에 담았습니다.",
      problem:
        "운동 기록은 입력이 번거로우면 지속되지 않고, 트레이너·짐과의 코칭과 정산은 기록과 따로 관리되곤 합니다.",
      solution:
        "캘린더 중심 홈에서 바로 세트를 기록하고 휴식 타이머로 이어지게 했으며, 전문가 루틴 마켓과 비동기 코칭 상담, 트레이너·짐 관리와 정산 화면을 같은 데이터 흐름 위에 연결했습니다.",
      features: [
        "캘린더 중심 주간 운동 기록",
        "세트 편집과 휴식 타이머",
        "루틴 편집과 전문가 루틴 마켓",
        "함께 운동 방과 진행 순위",
        "트레이너·짐 회원 관리와 정산",
        "라이트/다크 모드",
      ],
    },
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
    cover: { src: "/work/naengkeep/cover.webp", alt: "냉킵 모바일 화면 3종: 시작 화면, 나의 작은 냉장고, 재료 넣기 선택" },
    gallery: [
      { src: "/work/naengkeep/01.webp", alt: "재료 상세 시트(보관 칸·참고 기간)와 월간 장보기 가계부" },
      { src: "/work/naengkeep/02.webp", alt: "냉킵 고객지원 사이트 - 도움말·계정 삭제·개인정보처리방침·이용약관 안내" },
    ],
    detail: {
      oneLiner: "재료와 소비기한을 가족과 함께 챙기는 냉장고 앱",
      role: [
        "기획",
        "UI 디자인",
        "Flutter 앱 개발",
        "백엔드",
      ],
      stack: [
        "Flutter",
        "Firebase Auth",
        "Cloud Firestore",
        "Cloud Functions",
        "ML Kit 텍스트 인식",
        "인앱 결제",
      ],
      overview:
        "우리 집 냉장고에 무엇이 있고 언제까지 먹어야 하는지 기록하는 앱입니다. 냉장고 모양 그대로 칸을 나눠 재료를 넣고, 초대코드로 가족과 같은 냉장고를 함께 씁니다.",
      problem:
        "냉장고 속 재료와 소비기한은 쉽게 잊히고, 가족이 각자 장을 보면 중복 구매나 버리는 재료가 생깁니다.",
      solution:
        "칸별 냉장고 화면에서 재료를 빠르게 담고 구매일·소비기한·금액을 남기게 했습니다. 소비기한 알림, 장보기 메모와 가계부, 영수증 촬영 기반 품목 후보 추출로 기록 부담을 줄였습니다.",
      features: [
        "칸 구조를 바꿀 수 있는 냉장고 여러 대",
        "재료별 구매일·소비기한·금액 기록",
        "초대코드로 가족과 냉장고 공유",
        "소비기한 알림과 통합 검색",
        "장보기 메모와 주간·월간 가계부",
        "영수증 촬영으로 품목 후보 추출",
      ],
    },
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
    cover: { src: "/work/joseon/cover.webp", alt: "붉은 봉인팩이 열리며 조선풍 인물 카드들이 금빛 이펙트와 함께 쏟아지는 키 비주얼" },
    gallery: [
      { src: "/work/joseon/01.webp", alt: "모바일 4화면 — 왕실 봉인팩 민팅, 내 컬렉션, 카드 대결, 마켓 탭" },
      { src: "/work/joseon/02.webp", alt: "태블릿 민팅 화면 — 봉인팩과 왕·양반·추노꾼·무당 카드 등급별 출현율" },
    ],
    detail: {
      oneLiner: "조선의 신분과 직책을 카드로 모으는 팩 오프닝 앱",
      role: [
        "기획",
        "리서치",
        "UI 디자인",
        "Flutter 앱",
        "Unity 이펙트",
      ],
      stack: [
        "Flutter",
        "Dart",
        "Unity",
        "C#",
        "Android Platform Channel",
      ],
      overview:
        "조선 사회의 신분·직업·관직을 카드로 수집하는 카드 컬렉터블 앱이다. 민팅(봉인팩 개봉), 컬렉션, 카드 대결, 마켓 네 개의 탭으로 구성된다.",
      problem:
        "카드팩 앱의 재미는 '뜯는 순간'의 손맛에서 나오지만, 일반 앱 UI 프레임워크만으로는 게임 수준의 파티클·조명·카메라 연출을 만들기 어렵다.",
      solution:
        "도감·마켓·내비게이션 같은 서비스 화면은 Flutter가 맡고, 팩 개봉 연출은 Unity 씬이 맡도록 런타임을 나눴다. Flutter가 JSON 페이로드를 보내면 Unity가 개봉 시퀀스를 재생하고 결과 JSON을 돌려준다.",
      features: [
        "왕실 봉인팩 개봉과 등급별 출현율 표기",
        "봉인 파괴→희귀도 버스트→카드 공개 연출",
        "조선 직책·신분 카드 컬렉션 도감",
        "능력치 기반 카드 대결 화면",
        "카드·봉인팩 거래 마켓 화면",
        "역사 리서치 기반 카드 마스터 데이터",
      ],
    },
  },
  {
    slug: "ai-dj",
    name: "AI DJ Navigation",
    category: "app",
    years: [2026, 2026],
    description:
      "턴테이블·믹서·A/B 파형을 한 화면에 담은 Windows DJ 작업실. 규칙 기반 자동 믹싱과 외부 장비용 DJ 프롬프터를 실험 중.",
    disciplines: ["Desktop app", "Audio DSP", "AI"],
    status: "development",
    cover: { src: "/work/ai-dj/cover.webp", alt: "AI DJ Navigation 실행 화면 - 두 덱 턴테이블과 믹서, A/B 파형 위로 프롬프터가 '저음 자리 교체'를 안내하는 전환 구간" },
    gallery: [
      { src: "/work/ai-dj/01.webp", alt: "두 덱에 무료 라이선스 곡을 불러온 DJ 작업실 - 실제 오디오 파형과 BPM·키 분석 라이브러리" },
      { src: "/work/ai-dj/02.webp", alt: "믹싱 큐 - BPM·키·에너지 기준 로컬 선곡 순서 추천과 곡별 전환 방식" },
      { src: "/work/ai-dj/03.webp", alt: "온라인 음원 - ccMixter 앱 내 검색 결과와 라이선스 표기, 가져오기 버튼" },
      { src: "/work/ai-dj/04.webp", alt: "퍼포먼스 패널 - 4덱 로드, 키락·템포·EQ·필터·에코, 슬라이서·샘플러, 4스템 볼륨" },
    ],
    detail: {
      oneLiner: "턴테이블과 믹서, 전환 안내를 한 화면에 담은 Windows DJ 작업실",
      role: [
        "기획",
        "UI 디자인",
        "데스크톱 앱 개발",
        "오디오 엔진·DSP",
      ],
      stack: [
        "Python",
        "Tkinter",
        "NumPy",
        "SciPy",
        "sounddevice",
        "soundfile",
        "SQLite",
        "PyInstaller",
      ],
      overview:
        "Windows에서 실행하는 DJ 작업실 앱입니다. 좌우 턴테이블과 중앙 믹서, 상단의 A/B 파형을 한 화면에 두고, 별도 오디오 프로세스에서 두 덱을 믹싱합니다. 아직 개발 중이며 완성된 전문가용 제품은 아닙니다.",
      problem:
        "DJ 전환을 연습하려면 언제 어떤 노브와 페이더를 움직일지 박자 단위로 알아야 하지만, 일반 DJ 소프트웨어는 조작 화면만 보여 줄 뿐 다음 동작을 안내하지 않습니다.",
      solution:
        "곡의 BPM과 첫 박 CUE를 기준으로 8가지 전환 템플릿(롱 페이드, 저음 교체, EQ 블렌드, 비트 컷, 드롭 교체, 필터·에코 아웃, 루프 연결)의 타임라인을 만들고, 프롬프터가 남은 박자와 함께 다음 조작을 보여 줍니다. AI 자동 믹싱 모드는 같은 계획을 샘플 단위 자동화로 앱의 오디오 엔진에 직접 적용합니다. 학습된 모델이 아니라 규칙 기반 자동 시연입니다.",
      features: [
        "두 덱 턴테이블·믹서와 실제 오디오 파형",
        "8가지 전환 템플릿 기반 DJ 프롬프터",
        "규칙 기반 AI 자동 믹싱(샘플 단위 자동화)",
        "BPM·키·에너지 분석과 믹싱 큐 추천",
        "ccMixter·Wikimedia·Internet Archive 무료 음원 검색과 해시 검증 가져오기",
        "4덱·키락·스템·샘플러 퍼포먼스 패널",
      ],
    },
  },
  {
    slug: "adrock-driving",
    name: "운전면허 PLUS · 도로로",
    category: "app",
    years: [2024, 2025],
    description:
      "애드락의 운전면허 필기 학습 앱 운전면허 PLUS와, 면허 취득·연수 서비스 도로로의 앱 웹뷰 프론트엔드.",
    disciplines: ["Android", "Webview", "Next.js"],
    status: "live",
    url: "https://play.google.com/store/apps/details?id=com.adrock.driverlicense300",
    cover: { src: "/work/adrock-driving/cover.webp", alt: "Google Play 스토어 스크린샷 3장 - 모의고사, 유형별 학습하기, 속성암기 화면" },
    gallery: [
      { src: "/work/adrock-driving/01.webp", alt: "Google Play 스토어 스크린샷 2장 - 오답노트·즐겨찾기 복습하기, 운전면허 학원찾기 화면" },
    ],
    detail: {
      oneLiner: "운전면허 학습 앱과 연수 서비스 웹뷰",
      role: [
        "프론트엔드",
        "앱-웹뷰 연동",
        "보일러플레이트",
      ],
      stack: [
        "Android",
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "shadcn/ui",
      ],
      overview:
        "애드락(Adrock)에서 참여한 운전면허 서비스입니다. 운전면허 PLUS는 필기시험 모의고사·유형별 학습·오답노트·학원찾기를 제공하는 Android 앱으로 Google Play에 배포돼 있고, 도로로는 면허 취득부터 연수까지를 다루는 서비스의 앱 내 웹뷰 화면입니다.",
      problem:
        "네이티브 앱 안에서 자주 바뀌는 프로그램·분석 화면을 매번 앱 업데이트로 배포하기는 부담이 컸습니다.",
      solution:
        "Next.js 14·Tailwind·shadcn/ui·Pretendard로 사내 프론트엔드 보일러플레이트를 세우고, 앱과 웹뷰가 메시지를 주고받는 통신 훅을 만들어 웹 화면에서 선택한 항목이 앱으로 전달되게 했습니다.",
      features: [
        "필기시험 모의고사와 유형별 학습(앱)",
        "오답노트·즐겨찾기 복습(앱)",
        "운전면허 학원찾기(앱)",
        "도로로 프로그램·그룹 상세 웹뷰",
        "앱-웹뷰 양방향 통신 훅",
        "Next.js 사내 보일러플레이트",
      ],
    },
  },
  {
    slug: "omen",
    name: "OMEN",
    category: "app",
    years: [2026, 2026],
    description:
      "사주·타로·점성술·수비학·AI 손금과 관상을 한 앱에 담은 글로벌 영성 웰니스 앱.",
    disciplines: ["Mobile app", "LLM", "Vision AI"],
    status: "development",
    cover: { src: "/work/omen/cover.webp", alt: "사주 네 기둥과 사주·타로·점성술·손금 메뉴 타일, 타로 카드를 표현한 OMEN 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "한국의 사주를 글로벌 웰니스 앱으로",
      role: [
        "제품 기획",
        "모바일 앱",
        "백엔드",
        "LLM 파이프라인",
        "인프라",
      ],
      stack: [
        "Flutter",
        "Riverpod",
        "FastAPI",
        "PostgreSQL",
        "Claude API",
        "Firebase",
        "RevenueCat",
      ],
      overview:
        "한국의 사주 해석을 서양 점성술, 타로, 수비학, 자미두수, AI 관상·손금과 함께 제공하는 영어권 대상 영성 웰니스 앱입니다. 기존 사주 리포트용 LLM 파이프라인을 재활용해 Flutter 앱과 Python API 서버로 확장했습니다.",
      problem:
        "해외 점성술 앱은 대부분 생년월일 텍스트 입력에 머물러 있고, 사주처럼 계산이 복잡한 동양 명리 콘텐츠는 영어로 쉽게 접하기 어려웠습니다.",
      solution:
        "만세력·천문력 계산(음력 변환, kerykeion)으로 정확한 원국을 먼저 만들고 LLM이 해석을 쓰도록 단계를 나눴습니다. 카메라 기반 관상·손금은 얼굴 인식과 비전 모델로 처리하고, 구독·광고·푸시를 붙여 서비스 형태로 설계했습니다.",
      features: [
        "사주·자미두수 원국 계산과 해석",
        "서양 점성술·수비학·궁합",
        "타로와 오미쿠지",
        "카메라 AI 관상·손금",
        "오늘의 운세와 기록",
        "구독 결제와 푸시 알림",
      ],
    },
  },
  {
    slug: "care-helper",
    name: "케어헬퍼",
    category: "app",
    years: [2026, 2026],
    description:
      "요양보호사와 어르신의 대화를 음성 인식으로 받아 건강 기록과 리포트로 정리하는 앱.",
    disciplines: ["Mobile app", "Speech", "RAG"],
    status: "development",
    cover: { src: "/work/care-helper/cover.webp", alt: "음성 녹음 버튼과 대화 말풍선, 혈압·혈당·통증 기록 카드를 표현한 케어헬퍼 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "말로 하는 건강 체크를 기록으로",
      role: [
        "기획",
        "모바일 앱",
        "음성 인식",
        "AI 파이프라인",
      ],
      stack: [
        "Flutter",
        "speech_to_text",
        "Gemini API",
        "SQLite",
        "벡터 검색",
        "PDF",
      ],
      overview:
        "방문 요양 현장에서 요양보호사가 어르신과 나누는 건강 체크 대화를 음성으로 인식해, 혈압·혈당·통증·수면 같은 항목으로 정리하는 Flutter 앱입니다. 환자별 기록과 녹음, PDF 리포트를 앱 안에서 관리합니다.",
      problem:
        "현장 기록은 대화를 마친 뒤 손으로 다시 적어야 하고, '쑤셔', '결려'처럼 다양한 표현과 음성 인식 오류 때문에 정리가 일정하지 않았습니다.",
      solution:
        "의료 표현 보정 맵과 노이즈 필터로 인식 결과를 다듬고, Gemini가 대화를 항목별로 구조화하게 했습니다. 과거 기록을 임베딩해 검색하는 RAG로 '지난번 혈압' 같은 질문과 이전 대비 변화를 확인할 수 있게 했습니다.",
      features: [
        "대화 음성 인식과 녹음",
        "의료 표현 보정·노이즈 필터",
        "AI 건강 항목 구조화",
        "환자별 기록과 추세",
        "과거 기록 RAG 검색",
        "PDF 리포트 출력",
      ],
    },
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
    cover: { src: "/work/voxcli/cover.webp", alt: "마이크 버튼과 음성 파형, 완료 결과 카드가 있는 VoxCLI 모바일 화면과 Hub·Agent 노드를 표현한 디자인 커버" },
    gallery: [
      { src: "/work/voxcli/01.webp", alt: "Remote 앱에서 Hub, 각 PC의 Agent를 거쳐 결과 카드로 돌아오는 흐름 다이어그램" },
      { src: "/work/voxcli/02.webp", alt: "위험 명령 차단, 승인 후 실행, 운전 모드로 구성된 안전 정책 설명 카드" },
    ],
    detail: {
      oneLiner: "폰에서 말로 여러 PC의 Codex·Claude 세션을 지휘한다",
      role: [
        "기획",
        "UX 설계",
        "모바일 앱",
        "데스크톱 Hub",
        "백엔드",
      ],
      stack: [
        "Flutter",
        "TypeScript",
        "Node.js",
        "WebSocket (ws)",
        "tmux",
        "Tailscale",
        "Express",
      ],
      overview:
        "VoxCLI는 폰에서 개발 지시를 말하면 원하는 PC의 Codex·Claude Code CLI 세션에 그대로 전달하고, 진행 상태와 결과를 다시 모바일로 돌려주는 음성 우선 원격 개발 콕핏이다. 모바일 Remote, Hub 서비스, 각 PC의 Agent, 공용 프로토콜·정책 패키지로 구성된 모노레포다.",
      problem:
        "AI 코딩 에이전트에게 일을 시키려면 결국 책상 앞 터미널에 앉아야 하고, 여러 대의 PC를 오가며 세션을 관리하기도 번거롭다.",
      solution:
        "한 PC를 Hub로 두고 모든 PC에 Agent를 설치해 WebSocket으로 라우팅한다. 앱에서 PC와 세션을 고르고 말하면 tmux 세션에 프롬프트가 주입되고, 터미널 출력과 요약이 결과 카드로 돌아온다. 음성 오인식에 대비해 배포·DB 마이그레이션·강제 푸시 같은 위험 명령은 정책 패키지가 차단한다.",
      features: [
        "PC·CLI 세션 선택과 연결 상태 표시",
        "음성/텍스트 명령을 tmux 세션에 주입",
        "실시간 진행 상태와 결과 카드",
        "위험 명령 차단·승인 정책, 운전 모드",
        "Tailscale 기반 외부망 접속",
        "macOS·Windows Hub 데스크톱 앱",
      ],
    },
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
    cover: { src: "/work/video-kit/cover.webp", alt: "파이프라인으로 렌더링한 '차트해부학 Pattern Master' 시즌2 쇼츠 프레임 3컷 — W 패턴 비교, 가짜 돌파 판별, 리테스트 해부" },
    gallery: [
      { src: "/work/video-kit/01.webp", alt: "롱폼 차트 타이밍 에피소드 렌더 프레임 — 1단계 추세 파악, 상승 추세 캔들 차트와 이동평균선" },
      { src: "/work/video-kit/02.webp", alt: "비트코인 더블 바텀 에피소드 렌더 프레임 — 넥라인과 두 바닥을 표시한 W 패턴 설명" },
      { src: "/work/video-kit/03.webp", alt: "쇼츠 후반부 프레임 3컷 — 넥라인 돌파 체크포인트, 판단 순서 체크리스트, 결론 카드" },
    ],
    detail: {
      oneLiner: "대본부터 렌더링까지, 에이전트가 만드는 영상 공장",
      role: [
        "파이프라인 설계",
        "에이전트·스킬 작성",
        "모션그래픽",
        "TTS 연동",
        "영상 디자인",
      ],
      stack: [
        "Claude Code",
        "Remotion",
        "HyperFrames",
        "TypeScript",
        "React",
        "Qwen3-TTS",
        "FFmpeg",
      ],
      overview:
        "Claude Code의 스킬·커맨드·에이전트로 영상 제작 전 과정을 오케스트레이션하는 모노레포다. 영상마다 기획, 스크립트, 스토리보드, 씬 코드, 배포 메타데이터를 한 폴더에서 관리하며, 이 파이프라인으로 차트 분석 교육 채널용 롱폼과 쇼츠 시리즈를 렌더링했다.",
      problem:
        "교육용 모션그래픽 영상은 대본, 화면 구성, 내레이션, 편집, 업로드 메타데이터까지 반복 작업이 많아 시리즈로 꾸준히 만들기 어렵다.",
      solution:
        "/video init → 스크립트 → 스토리보드 → TTS → 씬 개발 → 렌더 → SEO로 이어지는 단계를 명령어와 전담 에이전트로 쪼갰다. 화면은 React/HTML 코드로 그려 프레임 단위로 렌더링하고, 리뷰 에이전트와 프레임 스냅샷으로 품질을 점검한다.",
      features: [
        "영상별 모노레포 폴더와 진행 상태 관리",
        "스크립트·스토리보드 생성 에이전트",
        "한국어 발음 정규화 후 TTS 내레이션",
        "코드로 그리는 캔들 차트 모션그래픽",
        "롱폼→쇼츠 변환과 자막 안전 영역 규칙",
        "프레임 스냅샷 QC와 YouTube SEO 메타",
      ],
    },
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
    cover: { src: "/work/thumbnail/cover.webp", alt: "A부터 D까지 네 가지 썸네일 시안을 2x2 그리드로 비교하는 모습을 표현한 디자인 커버" },
    gallery: [
      { src: "/work/thumbnail/01.webp", alt: "조사, 콘셉트, 레퍼런스, 생성, 2x2 비교로 이어지는 썸네일 제작 파이프라인 다이어그램" },
      { src: "/work/thumbnail/02.webp", alt: "search, download, generate, create-grid 네 개의 CLI 스크립트 역할 설명" },
    ],
    detail: {
      oneLiner: "주제 하나로 썸네일 시안 네 개를 뽑는 스킬",
      role: [
        "워크플로 설계",
        "Claude Code 스킬",
        "CLI 스크립트",
      ],
      stack: [
        "Claude Code",
        "Node.js",
        "OpenAI Image API",
        "YouTube Data API v3",
        "sharp",
      ],
      overview:
        "Claude Code에서 /thumbnail 한 번으로 YouTube 썸네일 시안을 만드는 스킬이다. 검색·다운로드·생성·그리드 합성을 각각 JSON 입출력 CLI 스크립트로 나누고, 에이전트가 이를 순서대로 호출한다.",
      problem:
        "썸네일은 클릭률을 좌우하지만, 경쟁 영상 분석과 여러 방향의 시안 제작을 매번 손으로 하기엔 시간이 많이 든다.",
      solution:
        "영상 주제를 받으면 비슷한 영상의 상위 썸네일을 조사하고, 호기심 간극·페인 포인트 관점에서 A~D 네 가지 콘셉트를 세운다. 콘셉트별 레퍼런스를 모아 병렬로 이미지를 생성한 뒤 2x2 비교 그리드로 보여주고, 고른 방향으로 변형을 이어간다.",
      features: [
        "유사 영상 상위 썸네일 조사",
        "A/B/C/D 네 가지 콘셉트 전략",
        "콘셉트별 레퍼런스 이미지 수집",
        "브랜드 가이드 기반 프롬프트",
        "4개 시안 병렬 생성과 2x2 그리드 비교",
        "선택한 방향으로 변형·리파인",
      ],
    },
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
    cover: { src: "/work/contest-watch/cover.webp", alt: "09:00 KST 스탬프와 D-day 배지, 신규·마감 변경 상태가 표시된 공모전 아침 리포트를 표현한 디자인 커버" },
    gallery: [
      { src: "/work/contest-watch/01.webp", alt: "2026-10-29 공모전 모니터 HTML 리포트 상단 — 오늘의 요약, 우선순위, 전일 대비 변화(신규·마감 변경·D-7/D-1) 표" },
      { src: "/work/contest-watch/02.webp", alt: "예약 실행, 후보 탐색, 원문 검증, 전일 비교, HTML 리포트로 이어지는 매일의 실행 흐름 다이어그램" },
    ],
    detail: {
      oneLiner: "매일 아침 9시, 공모전을 대신 찾아 정리하는 AI",
      role: [
        "기획",
        "프롬프트 설계",
        "자동화 스크립트",
      ],
      stack: [
        "Codex CLI",
        "Python",
        "Windows 작업 스케줄러",
        "PowerShell",
        "웹 검색",
      ],
      overview:
        "Windows 작업 스케줄러가 매일 09:00(KST)에 Codex CLI를 읽기 전용·웹 검색 모드로 실행해 국내 개발·AI 공모전을 조사하고, 날짜별 HTML 리포트와 최신본을 남기는 개인 운영 도구다.",
      problem:
        "공모전 공고는 여러 포털과 기관 사이트에 흩어져 있고, 마감·자격 조건이 바뀌어도 매일 확인하기 어렵다.",
      solution:
        "포털에서 후보를 찾되 주최 기관 원문으로 검증하게 하고, 전날 보고서와 비교해 신규·마감 변경·자격 변경·마감 임박(D-7/D-3/D-1)·종료를 구분한다. 보유 프로젝트 요약을 함께 넘겨 출품 가능한 작업도 짝지어 준다.",
      features: [
        "매일 09:00 예약 실행, 놓치면 다음 기회에 보충",
        "주최 기관 공식 원문으로 교차 검증",
        "전일 대비 신규·변경·임박·종료 구분",
        "신청·결과물 마감, 자격, 상금 정리",
        "보유 프로젝트와 출품 적합도 매칭",
        "읽기 전용 실행, 접수·결제·전송 금지",
      ],
    },
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
    cover: { src: "/work/discord-bridge/cover.webp", alt: "Discord 채널 대화 속 !git status 명령과 파란 진행 카드, 초록 완료 카드를 표현한 디자인 커버" },
    gallery: [
      { src: "/work/discord-bridge/01.webp", alt: "일반 대화, ! 셸 명령, 슬래시 명령의 세 가지 실행 경로를 설명하는 다이어그램" },
      { src: "/work/discord-bridge/02.webp", alt: "Discord 채널마다 서로 다른 작업 폴더와 Codex 세션이 연결되는 구조 다이어그램" },
    ],
    detail: {
      oneLiner: "Discord 채널을 원격 PC의 AI 작업실로 바꾸는 봇",
      role: [
        "기획",
        "봇 개발",
        "Windows 운영 스크립트",
        "보안 정책",
      ],
      stack: [
        "Node.js",
        "Discord Bot (Slash commands·Embeds)",
        "Codex CLI",
        "Claude Code",
        "PowerShell",
        "Windows Startup",
      ],
      overview:
        "PC에서 로컬로 돌아가는 Windows용 Discord 봇이다. 비공개 Discord 채널에 쓴 일반 메시지는 채널별로 선택한 AI(Codex 또는 Claude Code)에 프롬프트로, `!`로 시작하는 메시지는 PowerShell 명령으로 실행돼 원격 데스크톱 없이 휴대폰에서도 작업을 이어갈 수 있다.",
      problem:
        "자리를 비운 동안 PC의 Codex·Claude 세션에 일을 시키거나 간단한 터미널 명령을 실행하려면 원격 데스크톱이나 별도 터미널 앱이 필요했다.",
      solution:
        "채널마다 독립적인 작업 폴더와 AI 세션, 작업 큐를 두고, 진행 상황은 파란 진행 카드에서 초록 완료 카드와 결과 카드로 이어지는 임베드로 보여준다. 첨부 이미지·파일은 로컬에 저장해 AI에 넘기고, 긴 출력은 output.txt로 돌려준다. 사용자·채널 허용 목록으로 접근을 제한한다.",
      features: [
        "일반 메시지 → 채널별 Codex/Claude 프롬프트",
        "!명령 → PowerShell, !codex → 실제 CLI",
        "채널별 작업 폴더·세션 영구 유지",
        "채널별 작업 큐와 취소·상태 확인",
        "진행(파랑)·완료(초록)·실패(빨강) 카드",
        "첨부 저장, 긴 출력 output.txt, 웹 미리보기",
      ],
    },
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
    cover: { src: "/work/figma-mcp/cover.webp", alt: "Figma 프레임에서 선택한 카드 컴포넌트와 MCP로 추출된 정밀 디자인 데이터 JSON을 나란히 표현한 디자인 커버" },
    gallery: [
      { src: "/work/figma-mcp/01.webp", alt: "면별 테두리, 혼합 텍스트, 변수 바인딩, 레이아웃 제약을 보존하는 확장 내용을 정리한 표" },
      { src: "/work/figma-mcp/02.webp", alt: "get_design_context, PNG·SVG·PDF 내보내기, 안전장치 세 가지 추가 도구 설명 카드" },
    ],
    detail: {
      oneLiner: "Figma 디자인을 웹으로 옮길 때 숫자까지 정확하게",
      role: [
        "포크 설계",
        "플러그인 개발",
        "MCP 서버 개발",
        "회귀 테스트",
      ],
      stack: [
        "TypeScript",
        "Model Context Protocol",
        "Figma Plugin API",
        "WebSocket",
        "Zod",
        "Vite",
        "React",
      ],
      overview:
        "AI 에이전트가 Figma 데스크톱 앱의 문서를 읽고 조작하게 해 주는 오픈소스 Figma MCP Bridge를 포크해, 디자인을 웹으로 구현할 때 필요한 원본 수치를 손실 없이 넘기도록 확장한 로컬 정밀 빌드(0.0.24-precision.1)다.",
      problem:
        "기존 노드 데이터만으로는 면별 테두리, 한 텍스트 안의 혼합 스타일, 변수 바인딩, 레이아웃 최소·최대 제약 같은 값이 빠지거나 뭉개져, 에이전트가 화면을 '비슷하게'만 구현하게 된다.",
      solution:
        "get_node가 면별 테두리, 혼합 텍스트 범위, 정확한 RGB, 변수 바인딩, 변환, 사이징 제약을 그대로 보존하게 하고, 선택을 바꾸지 않고 특정 노드를 깊게 읽는 get_design_context를 추가했다. 에셋은 크기·해시와 함께 파일로 내보내며, 정밀 추출은 회귀 테스트로 고정했다.",
      features: [
        "면별 테두리·혼합 텍스트 범위 보존",
        "변수 바인딩·레이아웃 제약 추출",
        "get_design_context: CSS·변수·SVG 후보 반환",
        "PNG/SVG/PDF 내보내기와 SHA-256 기록",
        "원본 이미지 바이트 저장(save_image)",
        "내보내기 크기 제한·타임아웃 안전장치",
      ],
    },
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
    cover: { src: "/work/handstage/cover.webp", alt: "가상 프레임 데모 — 네 꼭짓점 손가락 프레임 안에 Aurora 필터가 열린 HandStage 라이브 화면" },
    gallery: [
      { src: "/work/handstage/02.webp", alt: "Prism 필터로 전환한 상태 — 기울어진 손가락 프레임 안에 붉은 그라데이션 효과" },
      { src: "/work/handstage/03.webp", alt: "AI Video 컴포저 — 영상 업로드 영역, 무료 로컬 미리보기, Gemini AI 스타일 생성 패널" },
      { src: "/work/handstage/04.webp", alt: "모바일 화면 3컷 — 첫 화면, 가상 프레임 데모, AI Video 컴포저" },
    ],
    detail: {
      oneLiner: "두 손가락 프레임 안에 다른 세계를 여는 스튜디오",
      role: [
        "기획",
        "인터랙션 디자인",
        "UI 디자인",
        "프론트엔드",
        "오픈소스 공개",
      ],
      stack: [
        "React",
        "TypeScript",
        "Vite",
        "MediaPipe Tasks Vision",
        "Gemini API",
        "Vitest",
      ],
      overview:
        "MediaPipe로 양손의 엄지와 검지 끝을 추적해 네 꼭짓점 창을 만들고, 그 안에만 효과를 보여주는 오픈소스(MIT) 웹 스튜디오다. 실시간 로컬 필터(Live Filter)와 영상을 올려 스타일을 바꾸는 AI Video 두 가지 모드가 있다.",
      problem:
        "손 제스처 인터랙션은 데모 수준에서 멈추기 쉽고, 카메라 영상을 서버나 AI로 보내는 방식은 사생활 부담이 크다.",
      solution:
        "손 추적과 렌더링을 모두 브라우저에서 처리해 라이브 모드의 카메라 프레임은 기기 밖으로 나가지 않는다. 위치 스무딩·제스처 히스테리시스·끊김 복구로 프레임을 안정화했고, AI 변환은 사용자가 자신의 키를 넣고 명시적으로 실행할 때만 Gemini로 전송한다.",
      features: [
        "양손 엄지·검지 네 점 프레임 추적",
        "Aurora·Prism·Cinema 실시간 로컬 필터",
        "카메라 없을 때 포인터 가상 프레임 데모",
        "AI Video: 로컬 미리보기·Gemini 스타일 변환",
        "브라우저 MP4/WebM 내보내기",
        "서버·계정·키 저장 없는 프라이버시 구조",
      ],
    },
  },
  {
    slug: "jarvis",
    name: "JARVIS 음성 비서",
    category: "ai",
    years: [2026, 2026],
    description:
      "말로 부르면 말로 답하고 PC 작업까지 수행하는 로컬 AI 음성 비서. API 키 대신 CLI 구독 인증을 사용.",
    disciplines: ["Voice agent", "Local STT", "HUD"],
    status: "case",
    cover: { src: "/work/jarvis/cover.webp", alt: "음성 입력부터 HUD 반응까지 4단계 흐름과 아크 리액터 형태의 원형 HUD를 표현한 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "API 키 없이 돌아가는 로컬 음성 비서",
      role: [
        "기획",
        "음성 파이프라인",
        "백엔드",
        "HUD 프론트엔드",
      ],
      stack: [
        "Python",
        "faster-whisper",
        "Claude Code CLI",
        "Codex CLI",
        "edge-tts",
        "React",
        "Three.js",
      ],
      overview:
        "웨이크워드로 부르면 음성을 로컬에서 받아쓰고, Claude Code나 Codex CLI가 두뇌가 되어 답하거나 PC 작업·웹 검색을 수행한 뒤 음성으로 응답하는 AI 비서입니다. 웹 풀스크린 HUD가 상태와 자막, 파형에 맞춰 실시간으로 반응합니다.",
      problem:
        "음성 비서를 직접 만들면 STT·LLM·TTS마다 API 과금이 쌓이고, 실제 파일·셸 작업까지 맡기려면 도구 연동을 따로 만들어야 했습니다.",
      solution:
        "STT는 로컬 faster-whisper, TTS는 키가 필요 없는 edge-tts로 두고, 두뇌는 이미 설치된 CLI의 구독 인증을 그대로 쓰도록 설계했습니다. 백엔드와 HUD는 로컬 WebSocket으로 연결하고, 원클릭 실행 스크립트와 마이크 진단 도구를 함께 만들었습니다.",
      features: [
        "웨이크워드와 로컬 음성 인식",
        "CLI 두뇌의 도구 실행",
        "한국어 음성 응답",
        "Three.js 아크 리액터 HUD",
        "텍스트 모드와 원클릭 실행",
        "macOS·Windows·Linux 지원",
      ],
    },
  },
  {
    slug: "programmatic-seo",
    name: "블로그 양산 엔진",
    category: "ai",
    years: [2026, 2026],
    description:
      "템플릿과 데이터로 정보형 글을 대량 생성·검수·발행하는 프로그래매틱 SEO 도구.",
    disciplines: ["Programmatic SEO", "Worker", "Admin"],
    status: "case",
    cover: { src: "/work/programmatic-seo/cover.webp", alt: "변수 템플릿이 워커와 검수 큐를 거쳐 여러 장의 글 페이지로 만들어지는 흐름을 표현한 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "템플릿 하나로 글 수백 편의 뼈대를",
      role: [
        "기획",
        "백엔드",
        "어드민",
        "콘텐츠 전략",
      ],
      stack: [
        "NestJS",
        "Next.js",
        "TypeScript",
        "SQLite",
        "Docker",
      ],
      overview:
        "지역·조건·주제 같은 데이터와 글 템플릿을 조합해 정보형 블로그 글을 대량으로 만들고, 관리자에서 검수한 뒤 공개 사이트로 내보내는 프로그래매틱 SEO 도구입니다. NestJS API와 워커, Next.js 관리자, 공개 사이트용 연동 키트로 구성했습니다.",
      problem:
        "검색 수요가 있는 정보형 글은 형식이 비슷한데도 한 편씩 손으로 써야 해 양을 늘리기 어려웠습니다.",
      solution:
        "글 생성을 API 워커로 분리해 백그라운드에서 돌리고, 관리자 JSON API와 검수 화면을 두어 사람이 확인한 글만 발행되게 했습니다. 공개 사이트는 Next.js 커뮤니티 키트로 /api/v1 콘텐츠를 받아 렌더링합니다.",
      features: [
        "템플릿×데이터 기반 대량 생성",
        "백그라운드 생성 워커",
        "관리자 검수와 발행",
        "공개 사이트 연동 키트",
        "SEO·프롬프트·이미지 전략 문서",
        "영상 렌더러 모듈",
      ],
    },
  },
  {
    slug: "seller-sourcing",
    name: "셀러 소싱 분석기",
    category: "ai",
    years: [2026, 2026],
    description:
      "쿠팡·테무·알리익스프레스·1688 상품을 수집해 마진을 계산하고 진입 여부를 추천하는 셀러 도구.",
    disciplines: ["Crawler", "Margin calc", "Automation"],
    status: "case",
    cover: { src: "/work/seller-sourcing/cover.webp", alt: "원가·배송비·관세·수수료 막대와 예상 마진, 플랫폼별 수집 상태를 표현한 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "팔 만한 상품인지 숫자로 먼저 본다",
      role: [
        "기획",
        "크롤러",
        "백엔드",
        "웹 UI",
      ],
      stack: [
        "Python",
        "Playwright",
        "Selenium",
        "Flask",
        "pandas",
      ],
      overview:
        "쿠팡 셀러가 중국 소싱 상품을 고를 때 쓰는 분석 도구입니다. 쿠팡 검색·트렌딩·특가 상품과 테무, 알리익스프레스, 1688 상품을 수집하고, 환율·배송비·관세·쿠팡 수수료를 반영한 마진을 계산합니다.",
      problem:
        "소싱 후보마다 판매가와 원가를 여러 사이트에서 찾아 수수료와 관세까지 손으로 계산하다 보니 비교할 수 있는 상품 수가 적었습니다.",
      solution:
        "플랫폼별 크롤러를 Playwright·Selenium으로 만들고 수집 결과를 한 형식으로 맞춘 뒤, 비용 항목을 자동 반영한 마진율로 진입 추천을 보여주는 웹 화면을 붙였습니다.",
      features: [
        "쿠팡 키워드·트렌딩·특가 수집",
        "테무·알리익스프레스·1688 수집",
        "환율·배송비·관세 반영 원가",
        "쿠팡 수수료 반영 마진 계산",
        "마진율 기반 진입 추천",
        "로컬 웹 대시보드",
      ],
    },
  },
  {
    slug: "browser-bridge",
    name: "Browser Bridge",
    category: "ai",
    years: [2026, 2026],
    description:
      "터미널과 LLM 에이전트가 실제 Chrome을 제어하도록 잇는 브라우저 브리지. DOM 분석과 데이터 추출용.",
    disciplines: ["Chrome extension", "WebSocket", "Dev tool"],
    status: "case",
    cover: { src: "/work/browser-bridge/cover.webp", alt: "터미널 명령이 브라우저 창의 DOM 요소를 선택해 데이터를 추출하는 흐름을 표현한 디자인 커버" },
    gallery: [],
    detail: {
      oneLiner: "CLI에서 실제 브라우저를 조종한다",
      role: [
        "설계",
        "Chrome 확장",
        "서버",
      ],
      stack: [
        "Node.js",
        "WebSocket",
        "Chrome Extension",
        "Docker",
      ],
      overview:
        "CLI와 LLM 에이전트가 사용자의 Chrome 브라우저를 실시간으로 제어하도록 만든 범용 개발 도구입니다. 로컬 서버와 Chrome 확장이 WebSocket으로 연결되어, 웹사이트의 DOM 구조 분석과 크롤링 구조 파악, 데이터 추출에 쓰입니다.",
      problem:
        "헤드리스 브라우저로는 로그인 상태나 실제 렌더링 결과를 그대로 다루기 어려워, 크롤링 구조를 파악할 때마다 수동으로 개발자 도구를 열어야 했습니다.",
      solution:
        "이미 열려 있는 Chrome에 확장을 설치해 서버와 WebSocket으로 잇고, CLI 명령으로 페이지 이동·DOM 조회·추출을 요청하게 했습니다. 서버는 Docker로도 띄울 수 있습니다.",
      features: [
        "CLI에서 실제 Chrome 제어",
        "DOM 구조 조회와 분석",
        "크롤링 구조 파악",
        "데이터 추출",
        "WebSocket 브리지 서버",
        "Docker 실행 지원",
      ],
    },
  },
];

const statusRank: Record<ProjectStatus, number> = {
  live: 0,
  development: 1,
  case: 2,
  concept: 3,
};

/**
 * Display order: category order first, then live work, then the authored order.
 * Array.prototype.sort is stable, so entries keep their written order within a status.
 */
export const projects: readonly PortfolioProject[] = [...projectList].sort(
  (a, b) =>
    categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) ||
    statusRank[a.status] - statusRank[b.status],
);


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

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

/** Wraps around so the first and last projects still get both links. */
export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  const count = projects.length;
  return {
    previous: projects[(index - 1 + count) % count],
    next: projects[(index + 1) % count],
  };
}

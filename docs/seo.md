# SEO — www.pluck.co.kr

Canonical host: `https://www.pluck.co.kr` (apex redirects to www). All metadata,
canonical URLs, OG images, JSON-LD and the sitemap use this host via `lib/site.ts`.

Copy rule (same as the rest of the site): real data only. No invented metrics,
reviews, ratings, client logos, address or phone number. Counts are computed from
`lib/portfolio.ts`.

## What is implemented

| Area | Where | Notes |
| --- | --- | --- |
| Root metadata | `app/layout.tsx` | `metadataBase`, title template `%s \| PLUCK 플럭`, description, OG (ko_KR, siteName), Twitter `summary_large_image`, robots (index/follow, `max-image-preview:large`), authors/creator/publisher, `formatDetection`, `applicationName`, `category`, `viewport.themeColor` |
| Verification codes | `app/layout.tsx` | read from env, see below. Empty env = no tag |
| Home metadata + JSON-LD | `app/page.tsx` | absolute title, canonical `/`, `@graph`: Organization, WebSite, ProfessionalService, 4× Service, FAQPage (same `faqs` array that renders the FAQ), ItemList of all projects |
| Project pages | `app/work/[slug]/page.tsx` | title `<프로젝트명> — <분야> 포트폴리오`, description = card summary + role + stack (≤155), canonical, OG `article`, CreativeWork + BreadcrumbList, related projects (same category first) + link to the category hub |
| Category hubs | `app/work/category/[category]/page.tsx` | `/work/category/{client,product,app,ai}` — own title/description/H1, CollectionPage + ItemList + BreadcrumbList |
| OG images | `app/opengraph-image.tsx`, `app/work/[slug]/opengraph-image.tsx` | 1200×630 PNG via `next/og`. Default = brand card. Project = cover + name + one-liner. Hubs reuse the default card |
| OG font | `assets/fonts/NotoSansKR-OG-*.ttf` | static Noto Sans KR subsets (OFL) — Satori has no Hangul fallback and can't read variable fonts. Rebuild: `python docs/seo/subset-og-font.py` (needs `fonttools`) when new copy adds rare glyphs |
| sitemap | `app/sitemap.ts` → `/sitemap.xml` | home, 4 hubs, 39 projects. `lastModified` from git (portfolio data / project image dir), cover in image sitemap |
| robots | `app/robots.ts` → `/robots.txt` | allow all, explicit allow for Yeti (Naver), Daumoa (Daum), Bingbot, Googlebot; sitemap + host |
| Icons | `app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png`, `public/brand/icon-*.png` | generated from `public/brand/pluck-symbol.svg` by `node docs/seo/icons.js` |
| Manifest | `app/manifest.ts` → `/manifest.webmanifest` | Korean name, theme `#335aeb` |
| Logo for Google | `public/brand/pluck-logo-512.png` | Organization `logo` (raster, ≥112px) |
| 404 | `app/not-found.tsx` | noindex, links to home, portfolio, hubs, services, FAQ |
| H1 | `components/hero-3d.tsx` | one `<h1>` = visual headline + service line (`홈페이지 제작·앱 개발·AI 자동화…`). No hidden text |

Per-project OG images render on demand (Node runtime) and read files from disk, so
`next.config.ts` adds them to `outputFileTracingIncludes`. `sharp` is a direct
dependency because Satori can't decode the webp covers.

## Verification codes (owner)

Set these in Vercel → Project → Settings → Environment Variables (Production), then
redeploy. No code change needed.

| Env var | Output tag |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `<meta name="google-site-verification">` |
| `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` | `<meta name="naver-site-verification">` |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | `<meta name="msvalidate.01">` |

Paste only the `content="…"` value, not the whole tag.

### Google Search Console

1. https://search.google.com/search-console → 속성 추가. 도메인 속성(`pluck.co.kr`, DNS TXT)
   이 가장 좋다. URL 접두어 속성(`https://www.pluck.co.kr/`)을 쓰면 "HTML 태그" 방식의
   content 값을 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` 에 넣고 재배포 후 확인.
2. Sitemaps → `https://www.pluck.co.kr/sitemap.xml` 제출.
3. URL 검사 → `https://www.pluck.co.kr/` 색인 생성 요청. 리치 결과 테스트로 FAQ/Breadcrumb 확인.

### 네이버 서치어드바이저

1. https://searchadvisor.naver.com → 웹마스터 도구 → 사이트 등록 `https://www.pluck.co.kr`.
2. 소유 확인 "HTML 태그" → content 값을 `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` 에 넣고 재배포 후 확인.
3. 요청 → 사이트맵 제출 `https://www.pluck.co.kr/sitemap.xml`, RSS 는 없음(블로그 추가 시 제출).
4. 검증 → robots.txt 확인(Yeti 허용), 웹 페이지 수집 요청으로 홈·허브 4개 제출.

### Bing / Daum

- Bing Webmaster Tools: Search Console 가져오기 또는 `NEXT_PUBLIC_BING_SITE_VERIFICATION`.
- Daum 웹마스터도구(https://webmaster.daum.net): 사이트 등록 후 robots.txt 에 표시되는 PIN 방식이면
  robots 에 추가가 필요함 → 코드에서 `app/robots.ts` 에 한 줄 추가.

## Keyword map

| Page | Primary | Secondary |
| --- | --- | --- |
| `/` | 홈페이지 제작 외주 / 웹사이트 제작 | 앱 개발 외주, MVP 개발, AI 자동화 개발, 스타트업 개발 에이전시, 서울 |
| `/work/category/client` | 홈페이지·웹사이트 제작 사례 | 회원 플랫폼 개발, 운영 어드민 개발, 정산 시스템 개발 |
| `/work/category/product` | 자체 서비스 개발 / MVP 개발 사례 | 웹 서비스 기획, 스타트업 MVP |
| `/work/category/app` | 앱 개발 포트폴리오 | 모바일 앱 개발 외주, 웹앱·PWA, 웹뷰 앱 |
| `/work/category/ai` | AI 자동화 개발 | 업무 자동화, AI 콘텐츠 생성, 데이터 수집 자동화 |
| `/work/<slug>` | `<프로젝트명>` + 분야 | 해당 프로젝트 stack (Next.js, Supabase…), 업종 키워드 (골프여행 사이트, 딜러 정산 등) |

## Next steps — case-study content plan

Each article should link the project page and the matching hub, use only facts from
the repo/`lib/portfolio.ts`, and avoid revenue/user numbers that aren't public.
A `/blog` (or `/insights`) route with `Article` JSON-LD and its own sitemap entries
is the natural next build.

1. 여행사 홈페이지 제작기: 골프투어 상품 목록·상담 문의 흐름 설계 (보령항공여행사)
2. 회원제 단체 플랫폼 만들기: 사전 명단 연결과 가입 승인 설계 (알비연 통합 플랫폼)
3. 보험 딜러 수수료 정산 플랫폼의 상태 흐름 설계 (자동차보험 딜러 정산 플랫폼)
4. 제조기업 글로벌 웹사이트에 3D 제품 경험 넣기 (DVIA · 대일시스템)
5. 엑셀·문자 업무를 관리 시스템으로: 식자재 유통사 재고·단가 관리 (정푸드 관리 시스템)
6. 결제 없는 브랜드 쇼핑몰 데모로 구매 흐름 검증하기 (THOUSAND)
7. 디스코드에서 Codex CLI 를 원격으로 쓰는 업무 자동화 봇 (Discord–Codex Bridge)
8. 블로그 양산 엔진: 프로그래매틱 SEO 파이프라인 설계 (블로그 양산 엔진 / SEO 엔진)
9. 실거래가·임대 공고를 한 지도에 모은 주거 탐색 서비스 설계 (서울 집 찾기)
10. 작은 불편을 MVP 로: 빌라 주차 PWA 를 기획부터 배포까지 (빌라 주차 PWA)

## Owner TODOs

- Add the three verification env vars in Vercel and register in Search Console / 서치어드바이저.
- Confirm "서울" in the home description is accurate (taken from the previous site footer
  "Seoul, KR"). If not, edit `HOME_DESCRIPTION` in `lib/site.ts`.
- `ndrop.kr` and `draw.pluck.co.kr` are NXDOMAIN (see `.fry/MEMORY.md`) — not linked from
  these pages, but fix or remove wherever they still appear.
- If a business address/phone becomes public, add `address`/`telephone` to the
  ProfessionalService node in `app/page.tsx` (never before).

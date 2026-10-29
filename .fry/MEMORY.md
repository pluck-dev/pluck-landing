# Portfolio index: lib/portfolio.ts 데이터 규칙, 링크 검증, 클라이언트 실명

## 링크/카피 규칙 (WHY)
- 링크는 "우리 레포에서 배포된 것"이 확인된 라이브 사이트만 건다 (상세 페이지의 "사이트 방문" 버튼도 url 있을 때만).
- 연도는 각 레포 git log 첫/마지막 커밋 연도. 지표·고객사·성과·사용자 수를 지어내지 않는다. stats 스트립은 데이터에서 계산.
  - 기획 문서의 목표 수치(정푸드 매출·거래처 수 등), 로컬 시드 값(더빙고 "만들어진 버전 0")은 카피에 쓰지 않는다. 클라이언트 자사 사이트에 공개된 문구(보령 "23년 업력")만 예외.
- 미공개/권한 불확실 클라이언트는 일반명으로 기재 (자동차보험 딜러 정산 플랫폼 = clients/caryoung, 홈헬스케어 통합 플랫폼 = clients/bayada, AI 의사결정 시스템 제안서 = clients/nousbo).
- caryoung 은 2026-10 오너 지시로 live + url(client-roan-six.vercel.app) 공개. 링크 타이틀에 브랜드 '카영'이 보이므로 브랜드 노출은 허용됐지만 카드 이름은 일반명 유지. 레포 루트의 dealer-lookup/dashboard-staff 캡처는 실명·전화번호 실데이터라 사용 금지 → 비로그인 '샘플 데이터' 프리뷰(홍길동/12가1234)만 캡처.
- THOUSAND 는 오너 확인 결과 실제 클라이언트 작업(develop-thousand/web) → category client, live. 단 라이브 푸터가 'Design concept·실제 주문/결제 없음'이라 카피에 '결제 없이 구매 흐름 시연' 명시, 주문·매출 실적처럼 쓰지 말 것.
- 노출 금지 링크: brochure-wine(타이틀에 '누보' 고객명), admin-farm-theta(타이틀에 개인명 '심재&오유마켓', 로그인만). 엔트리는 유지·무링크.
- adrock-driving: 운전면허 PLUS(Play, com.adrock.driverlicense300) 저장소 android.drive 에는 오너 커밋이 없음(leemj/이미지/jdk). 오너 커밋은 web.dororo(보일러플레이트·웹뷰 통신)뿐 → role 은 그 범위로만 기재. Play 스토어 스크린샷 중 '1000만이 선택', '1,601,032,242건' 등 수치 이미지는 사용 금지.
- Figma MCP 는 gethopp/figma-mcp-bridge 포크(우리 작업 = 정밀 추출 커밋) → "포크/확장"으로 표기.
- webtoon-voice 슬러그의 서비스명은 최신 코드(D:\dev\pluck\webtoon) 기준 "더빙고" → name "더빙고 · Voice Webtoon".

## 검증 결과 (2026-10-29)
- boryoung.co.kr: 라이브 HTML 메타/카피가 clients/boryoung/apps/web 과 일치 → 링크 OK.
- bayadakorea.com: WordPress/Elementor 사이트, 우리 코드 아님 → 링크 금지.
- boxon.vercel.app: 스페인어 다른 서비스(타 소유) → 우리 boxon 아님, 링크·캡처 금지.
- jeongfood.vercel.app: /admin/login 으로만 이동(공개 화면 없음). 로컬 실행은 운영 Supabase+실거래처 데이터에 붙으므로 금지 → 디자인 커버.
- ndrop.kr, draw.pluck.co.kr: DNS NXDOMAIN (피처드 카드/MORE TO EXPLORE 링크 죽어 있음, 오너 결정 대기).
- admin-pando.vercel.app (FitGenie): 404 → MORE TO EXPLORE 에서 제거.
- KakaoWork exporter(tools/kakaowork/upstream): 외부 작성자(kangjung) 레포라 제외.

## 제외 레포 판단 (2026-10-29, 재검토 방지)
- pluck-dev/ad = 개인 마케팅 학습 노트, securities-cs-knowledge-base = 개인 학습 문서, simjae-fn12/hirebest = Webflow 템플릿(heavn-one) 미러, pluck-dev/ordering = '발주모아 클론', exercises-dataset = 포크, info-admin = 하루짜리 스캐폴드, clients/marketting(ALPHA 랜딩) = 하루 작업·미배포·고객 불명, maengrov-landing = README 없음(레퍼런스 클론).
- 사주 앱: 소스는 이 PC/접근 가능 GitHub 에 없음. env-collection-20260630/app-manse(구 Mac 경로 personal/app-manse)에 env 이름만 존재. 사주 기능은 pluck-dev/omen(OMEN, 기존 사주 리포트 파이프라인 재활용)에 포함 → OMEN 엔트리로 대체.
- D2C(dev-gwedo) 배포는 Vercel 로그인 보호(해시 URL만) → 디자인 커버. d2c.vercel.app 등은 타인 사이트.

# Portfolio 이미지: public/work/<slug>/ 규격, 소싱 순서, 개인정보 규칙

## 규격 (WHY: 카드·상세·OG 를 한 비율로 통일)
- 모든 이미지 1600x1000(16:10) webp ≤250KB. cover.webp = 카드·상세 히어로·OG 이미지, 01..0N.webp = 갤러리(최대 6, 홀수면 첫 장 전폭).
- 모바일 화면은 390 캡처 2-3장을 #dfe3da 캔버스에 둥근 모서리+그림자로 합성 (docs/work-covers/compose.js phones()).
- 소싱 우선순위: 라이브 사이트 캡처 → 프로젝트 폴더 기존 QA/Playwright 스크린샷 → 로컬 실행(데모/모크 모드만) → 디자인 커버.

## 개인정보/식별 규칙 (하드)
- 실명·전화번호·회원 명단·실데이터 어드민·토큰·실제 Discord/카톡 화면 금지. 블러하거나 제외. 데모 데이터 어드민은 OK.
- caryoung/bayada/nousbo 는 브랜드명·로고·고유 통계(예: 50년/33,000+/22개국)·견적 금액이 보이면 안 됨. homecare 캡처는 로고 숨김+텍스트 치환으로 찍었고 빨간 브랜드 컬러는 남아 있음(더 강한 익명성 필요하면 디자인 커버로 교체).
- farm-sales 서비스명에 개인 실명이 들어 있어 전 이미지에서 블러. seoul-home 공고의 사업자 개인명 블러. webtoon 푸터(사업자 정보) 크롭.
- setflow 라이브 캡처는 실사용자 작성자명이 보여 미사용 → build/shots 데모 데이터 캡처 사용.
- v8-cal-lab(hptunermap) 데스크톱 헤더의 'CALL 010-…' 사업장 번호는 블러(1800px 캡처 기준 x1100,y12,205x54). 푸터·CTA 프레임은 번호가 보여 미사용.
- gender-reveal 라이브는 로그인 벽 → 레포 복사본을 env 없이 로컬 실행(localStorage 데모 모드)해 캡처.
- knife-sharpening(web-kal) 이미지는 레포 public/figma 의 Figma 시안 → alt 에 'Figma 시안' 명시.

## 디자인 커버 (실화면이 없거나 노출 불가한 프로젝트)
- 대상: discord-bridge, voxcli, thumbnail, figma-mcp, contest-watch(커버만), dealer-settlement(상태 다이어그램만, 커버는 실화면), jeongfood, lulla, d2c-store, omen, care-helper, jarvis, programmatic-seo, seller-sourcing, browser-bridge(모두 커버만).
- render.js 실행: docs/work-covers 에서 `NODE_PATH=C:/Users/SIMJAE/AppData/Local/Temp/pwtool/node_modules node render.js a.html out.webp ...` (compose.js 의 sharp 해석용).
- 소스: docs/work-covers/*.html (사이트 아트카드 톤 클래스 tone-blue/forest/lime/ink/stone) + panel.js(spec-*.json → 설명 패널) + render.js(Playwright→compose.js). 실행 시 playwright/sharp 가 설치된 위치에서 require 경로 맞춰 쓸 것.
- 디자인 커버 안의 UI 목업에 구체 수치(건수·사용자 수)를 넣지 않는다 — 실제 지표처럼 읽힘. 막대/스파크라인으로 대체.
- alt 텍스트에 "디자인 커버"/"다이어그램"이라고 명시해 실제 화면과 구분.

## 함정
- 그리드 순서: lib/portfolio.ts 의 projectList 작성 순서가 아니라 `projects` = 카테고리 순 → status(live>development>case>concept) 안정 정렬. 상세 이전/다음도 이 순서. categoryOrder 는 projects 계산 전에 선언돼야 함(TDZ).
- eslint-config-next 16 의 react-hooks/set-state-in-effect 규칙: matchMedia 는 useSyncExternalStore 로 구독할 것.
- 카드 진입 애니메이션은 필터 클릭 후에만(data-animate). 초기 로드에 걸면 풀페이지 캡처/스크롤 시 흐리게 보임.
- 상태 pill 은 이미지 위가 아니라 카드 메타 행에 둔다 — 디자인 커버 좌상단 캡션과 겹침.
- 헤더/푸터/CTA 는 components/site-chrome.tsx 공용. 상세 페이지에선 home=false 로 "/#work" 등 홈 앵커로 연결. 홈 앵커: #work(전체 그리드) #featured #services #process #faq #contact. 상담 메일 링크는 CONTACT_MAIL/contactMail(subject).
- docs/work-covers 는 Node CJS 스크립트라 eslint globalIgnores 에 추가돼 있음.

# Home 디자인 규칙: 상세페이지 흐름, AI 티 금지(eyebrow·장식 번호·밑줄), 한글 폰트

## 오너 피드백 (2026-10-29, WHY)
- "AI가 만든 티"를 싫어함: 작은 영문 eyebrow 라벨("03 / INDEX", "SCROLL TO EXPLORE"), 의미 없는 번호(01/02, /01, "02 /"), 장식 밑줄·little-line·행마다 hr, 거대 워터마크 텍스트, 헤드라인 끝 파란 마침표, 아무도 안 읽는 영문 태그라인 → 전부 금지. 숫자는 실제 개수일 때만.
- 구분은 선(rule) 대신 면(배경 --sage 카드, 둥근 모서리)과 여백으로. 링크는 밑줄+화살표 대신 pill 버튼(.button-primary/.button-ghost/.button-ink).
- 카피는 한국어 우선. categoryLabels/statusLabels 도 한글(클라이언트/자체 서비스/앱/AI·자동화, 라이브/개발 중/사례/콘셉트).

## 홈 흐름 = 한국 이커머스 상세페이지식 설득 구조
- 3D 히어로(PLUCK 심볼 필드 → 스크롤로 큰 심볼 하나로 수렴) → 숫자 밴드(블루 풀블리드, getPortfolioStats) → 이런 고민(다크) → 한 팀 4분야(각 분야에 실제 적용 사례 링크) → 라이브 클라이언트 작업 크게(featured) → 전체 그리드 → 진행 방식(번호 없음) → FAQ → 상담 CTA.
- 2026-10 오너 지시로 'THE WAY WE THINK' 스테이트먼트와 NDrop/DVIA/몇기야 아트카드 섹션 삭제(재추가 금지).
- 히어로 숫자는 getPortfolioStats 로만. live 는 "지금 접속해 볼 수 있는 서비스"로 표기(THOUSAND 처럼 실주문 없는 라이브가 있어 '운영 실적'처럼 쓰지 않기 위함). 지어낸 지표·후기·로고 금지.
- featured 는 실제 운영 클라이언트(boryoung, rba, dealer-settlement, dvia). 콜라주(hero-collage)는 2026-10 "히어로가 얌전하다(toss.im 참고)" 피드백으로 삭제 → components/hero-reel.tsx → 2026-10 feat/hero-3d 에서 Lusion 풍 3D 히어로로 교체(hero-reel 컴포넌트·CSS 삭제, public/reel 이미지는 남겨둠).

## 폰트/모션 함정
- Geist 는 한글이 없어 Windows 에서 맑은고딕으로 떨어져 헤드라인이 약해 보였음 → layout.tsx 에 Noto_Sans_KR(preload:false, --font-noto-kr)을 Geist 다음 폴백으로 추가.
- ScrollExperience 의 --progress 는 이제 모든 data-scene 에 같은 공식(뷰포트 통과율). 예전 hero 전용 핀 공식은 hero 가 고정 높이가 아니면 0→1로 튀어서 제거.
- next/image `priority` 는 Next 16 에서 deprecated → `preload` 또는 loading="eager"+fetchPriority.

# Hero 3D + PLUCK 심볼: lib/pluck-scene.ts, 스크롤 수렴 p, 폴백, 브랜드 에셋 재생성

## 구조와 WHY (2026-10-29, feat/hero-3d)
- 오너 요청: lusion.co 의 에너지(광택 3D 오브젝트 + 커서 물리)는 가져오되 형태는 우리 것으로. 그래서 오브젝트가 PLUCK 심볼 자체(p + 뽑혀 나온 점)이고 동반 오브젝트는 심볼에서 떼어낸 링/알약. Lusion 의 십자 파이프·다크 카드 프레임은 일부러 피했다(밝은 종이 바탕 풀블리드).
- 심볼 기하는 한 곳(lib/pluck-symbol-3d.ts, 120 그리드 좌표)에서만 정의. 평면 SVG 생성기 docs/brand/symbol-svg.js 와 좌표가 같아야 함 → 하나를 바꾸면 둘 다 바꾸고 docs/brand-symbol.md 표도 갱신.
- 진행도 p 하나만 외부 입력: hero-3d.tsx 가 p=(stickyTop - sectionRect.top)/(section 높이 - stage 높이) 를 scene.setProgress 와 CSS --p 에 같이 씀. 씬 내부 파생: gather=smooth(0.04,0.62) 소용돌이+스켈레톤 슬롯 수렴, merge=smooth(0.6,0.8) 작은 것 축소, 큰 심볼은 셰이더에서 uP 로 reveal=smooth(0.6,0.82) 노이즈 디졸브(라임 엣지). CSS: 카피 opacity 1-5p, 캡션 (p-0.76)*7. data-phase=logo(p>0.22)일 때 카피 visibility hidden(투명 버튼 클릭 방지).
- 오브젝트는 DOM 카피 박스(setCopyRect, h1/리드/버튼 union, fit-content 필수 — block 이면 박스가 전폭이 됨)를 피해 배치 + idle 동안 밖으로 밀어냄. 심볼은 거의 세운 방향(Euler 제한) + 진자 흔들림 — 자유 회전시키면 b/d/q 글자 수프로 읽혔음.
- 성능 실측(Playwright, ANGLE): 데스크톱 1440 60fps / 모바일 390 60fps. 삼각형 데스크톱 52.8k(수렴 중 피크 59.3k), 모바일 28.9k. 그림자맵은 데스크톱만. DPR 캡 1.75(모바일 1.5).
- three 는 boot 시 dynamic import + load 후 requestIdleCallback → 헤드라인이 LCP. 포스터 webp(public/brand/pluck-symbol-3d.webp)가 첫 프레임 전까지 보이고, reduced-motion/WebGL 실패/`?nofx` 면 data-state=fallback 으로 트랙 높이 auto + 포스터 정적 화면.

## 함정
- next start 실행 중에 next build 하면 옛 서버가 새 청크를 못 찾아 씬이 안 뜸(data-state 미설정). TaskStop 은 npx 래퍼만 죽이고 node 는 3311 을 계속 잡고 있음 → Get-NetTCPConnection -LocalPort 3311 로 PID 찾아 종료.
- 브랜드 에셋 재생성은 레포 밖 툴 폴더(esbuild, playwright, sharp, opentype.js, geist 설치)에서 NODE_PATH 로: `node docs/brand/symbol-svg.js public/brand`, `node docs/brand/render-3d.js`. docs/brand 는 eslint ignore.
- reduced-motion 정적 레이아웃에서 `translate: none`(또는 0 0)을 `transform: none` 옆에 두면 Next 16 CSS 미니파이어가 translate 를 날려버림 → 중앙정렬 translate 를 reduce 블록에서 리셋하지 말 것.
- 숫자 밴드의 CountUp 은 SSR 에 실제 값, 화면 밖에서 마운트될 때만 0부터 카운트(크롤러·캡처에 0 노출 방지).
- html 의 scroll-behavior:smooth 때문에 Playwright 캡처 시 scrollTo({behavior:"instant"}) 필수. 수렴 프레임은 p 위치로 스크롤 후 ~1.6s 대기(스크롤 p 를 씬이 smoothP 로 따라감).

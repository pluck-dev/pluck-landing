# Portfolio index: lib/portfolio.ts 데이터 규칙, 링크 검증, 클라이언트 실명

## 링크/카피 규칙 (WHY)
- 링크는 "우리 레포에서 배포된 것"이 확인된 라이브 사이트만 건다 (상세 페이지의 "사이트 방문" 버튼도 url 있을 때만).
- 연도는 각 레포 git log 첫/마지막 커밋 연도. 지표·고객사·성과·사용자 수를 지어내지 않는다. stats 스트립은 데이터에서 계산.
  - 기획 문서의 목표 수치(정푸드 매출·거래처 수 등), 로컬 시드 값(더빙고 "만들어진 버전 0")은 카피에 쓰지 않는다. 클라이언트 자사 사이트에 공개된 문구(보령 "23년 업력")만 예외.
- 미공개/권한 불확실 클라이언트는 일반명으로 기재 (자동차보험 딜러 정산 플랫폼 = clients/caryoung, 홈헬스케어 통합 플랫폼 = clients/bayada, AI 의사결정 시스템 제안서 = clients/nousbo).
- THOUSAND 는 실존 브랜드(thousandpie.com)를 소재로 한 비공식 컨셉 → status "concept", 클라이언트 작업처럼 쓰지 말 것.
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

## 디자인 커버 (실화면이 없거나 노출 불가한 프로젝트)
- 대상: discord-bridge, voxcli, thumbnail, figma-mcp, contest-watch(커버만), dealer-settlement(커버+상태 다이어그램), jeongfood.
- 소스: docs/work-covers/*.html (사이트 아트카드 톤 클래스 tone-blue/forest/lime/ink/stone) + panel.js(spec-*.json → 설명 패널) + render.js(Playwright→compose.js). 실행 시 playwright/sharp 가 설치된 위치에서 require 경로 맞춰 쓸 것.
- 디자인 커버 안의 UI 목업에 구체 수치(건수·사용자 수)를 넣지 않는다 — 실제 지표처럼 읽힘. 막대/스파크라인으로 대체.
- alt 텍스트에 "디자인 커버"/"다이어그램"이라고 명시해 실제 화면과 구분.

## 함정
- eslint-config-next 16 의 react-hooks/set-state-in-effect 규칙: matchMedia 는 useSyncExternalStore 로 구독할 것.
- 카드 진입 애니메이션은 필터 클릭 후에만(data-animate). 초기 로드에 걸면 풀페이지 캡처/스크롤 시 흐리게 보임.
- 상태 pill 은 이미지 위가 아니라 카드 메타 행에 둔다 — 디자인 커버 좌상단 캡션과 겹침.
- 헤더/푸터/CTA 는 components/site-chrome.tsx 공용. 상세 페이지에선 home=false 로 "/#showreel" 등 홈 앵커로 연결.
- docs/work-covers 는 Node CJS 스크립트라 eslint globalIgnores 에 추가돼 있음.

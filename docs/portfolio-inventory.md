# 포트폴리오 인벤토리 (2026-10-30)

`lib/portfolio.ts` 에 무엇을 넣고 무엇을 뺐는지, 그 근거를 남긴다. 새 프로젝트를 검토할 때 이 표부터 확인할 것.

조사 범위: `D:\dev\{clients,pluck,personal,tools,labs,_archive}` 와 `D:\dev` 루트, `D:\auto-browser`, `D:\ComfyUI`, `C:\Users\SIMJAE\OpenMontage`, `C:\Users\SIMJAE\Desktop\pluck\discord-codex-bridge`, GitHub(pluck-dev, simjae-fn12, develop-para, `user/repos` 로 보이는 조직 전체, spacePluck), Vercel(pluckai 계정의 팀 plucks-projects-f9386a6f, 프로젝트 46개). ibctgit(전 직장) 관련은 조사·게재하지 않는다.

## 포함 기준

- 넣는다: 오너/스튜디오가 직접 만든 코드가 있고 목적이 분명한 작업. 내부 도구와 실험도 역량을 보여주므로 넣는다.
- 뺀다: 자기 커밋이 없는 서드파티 OSS 포크, 다른 회사 사이트 클론·복제, 튜토리얼, 하루 미만이고 기능이 없는 스캐폴드, 트레이딩 봇, ibctgit 관련, 개인 문서·노트, 실데이터가 들어 있는 폴더.
- 상태: `live` 는 우리가 배포했고 지금 200 으로 열리는 URL 이 있을 때만 쓴다. 고객사 실명은 고객 라이브 사이트에 이미 공개된 경우에만 쓴다.

## 포함 (58)

### 기존 40개

| 이름 | 소스 | 이미지 |
|---|---|---|
| 알비연 통합 플랫폼 | develop-rba/rba (`D:\dev\pluck\rba`; `clients\rby` 는 같은 레포의 옛 클론) | 스크린샷 |
| 보령항공여행사 | `D:\dev\clients\boryoung` | 스크린샷 |
| DVIA · 대일시스템 | `D:\dev\clients\web-daeilsys` | 스크린샷 |
| 정푸드 관리 시스템 | jeongfood/admin (`clients\jeongfood`) | 브랜드 썸네일 + 설명 패널 |
| 카영 딜러 정산 플랫폼 | `clients\caryoung` 의 landing(웹)·admin(관리자)·client(딜러 웹) 3개 레포 (`_archive\cnc` 의 보험 CRM 은 같은 도메인의 이전 기획) | 스크린샷 (앱별 2장, 아래 '멀티 앱' 표) |
| BAYADA 홈헬스케어 플랫폼 | `clients\bayada\bayada` = pluck-dev/bayada 모노레포 apps/web·academy·admin | 스크린샷 (앱별 2장, 아래 '멀티 앱' 표) |
| THOUSAND | develop-thousand/web | 스크린샷 |
| ABROAD&BROAD | abroadnbroad/abroadnbroad | 스크린샷 |
| V8 Cal Lab | carfixproj-Hwang/hptunermap | 스크린샷 |
| Lulla · AI 동화책 | contentscoin/lulla | 브랜드 썸네일 |
| 자동차용품 자사몰 (d2c-store) | dev-gwedo/D2C (`pluck\online-store`) | 로컬 실행 캡처 + 영상 2 |
| 칼갈이 수거·배송 서비스 | Kalganunplace/web-kal (`_archive\web-kal`) | Figma 시안 (칼가는곳.com 은 2026-11-09 확인 결과 다른 빌드 → 아래 감사 표) |
| AI 의사결정 시스템 제안서 | pluck-dev/brochure (`clients\nousbo`) | 스크린샷 |
| 몇기야 | spacePluck/rotc (`personal\side\zm`) | 스크린샷 |
| SEO 엔진 | pluck-dev/seo-engine | 스크린샷 |
| boxon® | pluck-dev/boxon, boxon-admin | 스크린샷 |
| 더빙고 · Voice Webtoon | pluck-dev/webtoon (`pluck\webtoon`; `personal\voice\webtoon-voice-studio` 는 초기본) | 스크린샷 |
| 서울 집 찾기 | `personal\seoul-youth-home-finder` | 스크린샷 |
| 자동차용품 자사몰 (car-store) | 기존 엔트리 유지 | 스크린샷 |
| 빌라 주차 PWA | pluck-dev/house-parking (`pluck\parking`) | 스크린샷 |
| 젠더리빌 파티 | pluck-dev/gender-reveal | 스크린샷 |
| 농수산물 위탁판매 관리 | pluck-dev/admin-farm | 스크린샷(블러) |
| Setflow | develop-para/setflow-app (`pluck\setflow`) | 스크린샷 |
| 냉킵 | pluck-dev/fridge_ai_app (`personal\fridge-ai-app`) | 스크린샷 |
| Joseon App | `personal\joseon-app` | 스크린샷 |
| AI DJ Navigation | `D:\dev\ai-dj-navigation` | 데스크톱 캡처 |
| 운전면허 PLUS · 도로로 | adrock-dev/web.dororo | 스토어 스크린샷 |
| OMEN | pluck-dev/omen | 브랜드 썸네일 |
| 케어헬퍼 | pluck-dev/health-tts (care_helper) | Flutter 웹 빌드 캡처 + 영상 |
| VoxCLI | pluck-dev/voxcli | 브랜드 썸네일 + 설명 패널 |
| Claude Video Kit | pluck-dev/claude-video-kit | 스크린샷 |
| YouTube 썸네일 생성기 | `personal\video\claude-youtube-thumbnail` | 브랜드 썸네일 + 설명 패널 |
| 공모전 모니터 | `tools\pluck-tools\contest-watch` | 브랜드 썸네일 + 실제 리포트 + 설명 패널 |
| Discord–Codex Bridge | `Desktop\pluck\discord-codex-bridge` | 브랜드 썸네일 + 설명 패널 |
| Figma MCP Bridge 확장 | simjae-fn12/figma-mcp | 브랜드 썸네일 + 설명 패널 |
| HandStage | `pluck\handstage` | 스크린샷 |
| JARVIS 음성 비서 | pluck-dev/jarvis | HUD 로컬 실행 캡처 + 영상 |
| 블로그 양산 엔진 | pluck-dev/blog | 브랜드 썸네일 |
| 셀러 소싱 분석기 | pluck-dev/coupong | 브랜드 썸네일 |
| Browser Bridge | pluck-dev/browser-bridge | 브랜드 썸네일 |

### 이번에 추가한 14개

| 이름 (slug) | 소스 | 무엇인가 | 카테고리 · 상태 | 이미지 | 근거 |
|---|---|---|---|---|---|
| MODOOCAR · 법인차 구독 (modoocar) | spacePluck/modoo (비공개), Vercel `modoo` | 법인차 구독 서비스 사이트 | 클라이언트 · 라이브 | 라이브 캡처 | Vercel 배포 커밋 작성자가 오너(adrock_simjae), 2025-03~05. 브랜드명은 라이브 사이트에 공개 |
| ROTC 비즈니스연합회 행사 좌석 안내 (rotc-seating) | spacePluck/rotc.all, rotc-all.vercel.app | 이·취임식 기수별 좌석·일정·조직도 모바일 웹 | 클라이언트 · 라이브 | 라이브 모바일 캡처 | 오너 커밋, 2026-01-17. 단체명은 라이브 사이트에 공개 |
| 페어링 북 (pairing-book) | spacePluck/heart-paring (비공개), heart-paring.vercel.app | 글·그림으로 만드는 이야기책 서비스 | 자체 서비스 · 라이브 | 라이브 캡처(커버) | 오너 커밋, 2025-03. 코드 열람 불가라 라이브 화면 문구 범위로만 기술 |
| Claude Planning Kit (planning-kit) | pluck-dev/claude-planning-kit | 기획→명세→코드→테스트 Claude Code 키트 | AI·자동화 · 사례 | 브랜드 썸네일 + 설명 패널 | 오너 커밋, 2026-02. 68개 파일 |
| Oinzi · AI 에이전트 브라우저 (oinzi) | simjae-fn12/auto-browser (`D:\auto-browser`) | 사람·AI가 세션을 나눠 쓰는 Windows 브라우저 | AI·자동화 · 개발 중 | 현재 빌드(0.9.1) 캡처 + 영상 | 오너 커밋 17개, 2026-10. 설치 파일 0.9.1 |
| Threads 운영 에이전트 (threads-agent) | `D:\dev\tools\threads-scheduler` (커밋 없음) | PLUCK Threads 계정 자동 운영 | AI·자동화 · 사례 | 브랜드 썸네일 + 설명 패널 | 2026-10-30 가동. 캡처에 타인 핸들·아바타가 보여 미사용 |
| Threads 자동화 SaaS (threads-saas) | spacePluck/threads_auto (`personal\side\threads_auto`) | 웹 구독 + Electron 로컬 자동화 | 자체 서비스 · 사례 | 로컬 실행 캡처 + 영상 | 오너 커밋, 2025-10~11 |
| Lucky Draw · 송년회 뽑기 (lucky-draw) | pluck-ouou/draw (`personal\side\game\draw`) | 초대 코드 게임방 경품 뽑기 | 자체 서비스 · 사례 | 로컬 실행 캡처(가짜 Supabase 응답) + 영상 | 오너 커밋 27개, 2025-12. draw.pluck.co.kr 은 NXDOMAIN 이라 링크 없음 |
| VIP Care · 시니어 건강 관리 (vip-care) | spacePluck/senior, senior-hazel.vercel.app | 복약·건강 기록·AI 상담 다국어 웹앱 | 앱 · 라이브 | 라이브 모바일 캡처(샘플 데이터) | 오너 커밋, 2025-11. 케어헬퍼와는 다른 코드베이스 |
| 글로벌 드롭쉬핑 운영 시스템 (dropship-os) | `D:\dev\pluck\market` (next-dashboard 등) | 검증 게이트가 있는 드롭쉬핑 스토어·현황판 | 자체 서비스 · 개발 중 | 로컬 실행 캡처 + 영상 | 2026-07. 결제 잠김 상태 명시, 판매 실적 없음 |
| AI 카드뉴스 마케팅 스튜디오 (card-news-studio) | `pluck\market\marketing-studio` + ComfyUI `bayada_card` 노드 | ComfyUI 기반 6컷 카드뉴스 작업 공간 | AI·자동화 · 사례 | 브랜드 썸네일 | 오너 커밋, 2026-09. 화면에 고객사 브랜드가 있어 캡처 미사용, 카피는 일반명 |
| AI 가상 모델 카탈로그 (virtual-model-catalog) | `D:\ComfyUI\Workflows\shopping-model` | 의류 착용 컷 ComfyUI 파이프라인 | AI·자동화 · 사례 | 브랜드 썸네일 + 설명 패널 | 오너 커밋, 2026-09. ComfyUI 본체는 서드파티라 제외 |
| Vox Studio · 음성 복제 스튜디오 (vox-studio) | pluck-dev/vox (`personal\voice\vox-studio`) | Qwen3-TTS 복제·파인튜닝 데스크톱 앱 | AI·자동화 · 사례 | 렌더러 실행 캡처 + 영상 | 오너 커밋, 2026-06. VoxCLI 와 별개 앱 |
| 몰입형 웹 모션 스터디 (motion-study) | pluck-dev/design (`pluck\design` 의 pluck-motion, temper) | 몰입형 웹 제작 파이프라인과 WebGL 실험 | AI·자동화 · 사례 | 실제 실험 사이트 캡처 | 오너 작업. 레퍼런스 재현물(lusion·activetheory·NEXT 증권)과 shorttuber 클론은 제외 |

### 2026-11-09 오너 업로드 아카이브로 추가한 3개 (+1 확장)

출처: 오너가 올린 압축본 `Downloadslockpick-002.tar.gz`, `adrock-*.zip`, `pando-*.zip` (레포에는 넣지 않음). 연도·기여 범위는 압축본 안 `.git` 로그 기준.

| 이름 (slug) | 소스 | 무엇인가 | 카테고리 · 상태 | 이미지 | 근거 |
|---|---|---|---|---|---|
| BlockPick (blockpick) | adrock `blockpick/app-blockpick` (Flutter) | 그리드형 이벤트 판 참여 + 포인트·리퍼럴 플랫폼의 유저앱 | 앱 · 사례 | 브랜드 썸네일 + 설명 패널 | 오너(adrock_simjae) 커밋 141/145, 2025-10~2026-05. 오너 요청으로 기존 제외 판단을 뒤집음(아래 제외 표 참고) |
| 피트니스 센터 CRM · 회원앱 (fitness-crm) | dev-spogym/admin-pando, client-pando, docs-pando | 센터 관리자 CRM + 역할별 모바일 웹앱 + 기획 문서 사이트 | 클라이언트 · 사례 | 브랜드 썸네일 + 설명 패널 | 2026-03~06. Vercel 배포 3개 모두 404 → 링크 없음. 고객사명 미공개라 일반명 |
| 드라이빙존 웹 리뉴얼 · 캠페인 (drivingzone-campaign) | adrock-dev/web.drivingzone + adrock-dev/api.drivingzone | 지점 안내·상세·SEO(2025) + 캠페인 랜딩·관리자(2026) + 캠페인 이벤트 엔진 API | 클라이언트 · 라이브 | drivingzone.co.kr 라이브 캡처(상담 위젯·이용자 리뷰·강사 이름 블러) + 설명 패널 | web 오너 커밋 198개(2025-05~07, 2026-05~06, branch·SEO·campaign·admin), api 26개. 라이브 HTML 메타 문구가 레포 layout.tsx 와 일치 → 링크. 홈 화면은 팝업·수치 배지(8만명+/95.27%)라 캡처 미사용. 이력서의 '쿠폰 선물하기'는 커밋·코드에 없어 미기재 |
| PredixScore (predixscore) | ADROCK-SIMJAE/predixscore (`-003.zip`) | Polymarket 공개 데이터 기반 가상 예측 기록·평판 서비스 | 클라이언트 · 사례 | 브랜드 썸네일 + 설명 패널 | 오너 커밋 16/19, 2026-05. Ronin 컨트랙트 배포·commit-reveal·가스 대납은 송문천 커밋 → '팀원과 함께'로만 표기. predixscore.vercel.app 은 레포와 같은 문구지만 우리 Vercel 계정에 없어 링크 보류 |
| (확장) 운전면허 PLUS · 도로로 (adrock-driving) | adrock-dev/web.drivingplus | 운전면허 PLUS 앱 웹뷰 이벤트 화면 | 기존 유지 | 기존 유지 | 오너 커밋 251개, 2025-02~04(학과왕 응모·당첨·응모 이력·보상형 광고 브리지·Amplitude) |

두 번째 압축본(`adrock-*-003.zip`)에서 뺀 것: `scraw`(빈 폴더), `seo-app`(git 없음, academy.drivingplus.me 용 양산형 SEO 단일 테넌트 빌드 — 경쟁사 블로그 스크랩 리서치에서 이어진 것이고 기존 '블로그 양산 엔진'과 구성(관리자·워커·Next.js 커뮤니티 키트)이 겹침), `adrock-event`(세차 쿠폰 뽑기 이벤트 페이지, 오너 커밋 12개·실작업 2일(2026-04-20, 04-29), 배포·브랜드 확인 불가 → 보류).

같은 압축본에서 뺀 것: `coupang-scraper-ext`(빈 폴더), adrock `browser-bridge`(기존 Browser Bridge 엔트리와 같은 프로젝트), adrock `seo`(경쟁사 블로그 21,275건 스크랩 데이터 + 전략 문서·PoC — 타사 데이터 기반 리서치라 게재 안 함, 기존 '블로그 양산 엔진'과 주제 중복), `_root-files`(설정 파일뿐). 브리프의 'BlockPick 웹 미니게임·결제·어드민', '드라이빙존 웹 리뉴얼'은 첫 압축본에 없어 보류했다가 `-003.zip` 의 web.drivingzone 으로 반영.

## 실화면·영상 캡처 현황 (2026-10-30, feat/portfolio-media)

브랜드 썸네일 프로젝트와 갤러리 2장 이하 프로젝트를 로컬에서 띄워 보려고 한 결과다. 방법은 `.fry/MEMORY.md` "Portfolio 영상·실화면 캡처" 참고.

| 프로젝트 | 실행한 것 | 결과 |
|---|---|---|
| d2c-store | online-store 임시 복사 + 임시 Postgres(docker) + 샘플 주문 3건 | 브랜드→스크린샷, 스틸 3 + 영상 2(스토어·관리자). car-store 엔트리와 같은 코드베이스(ONTHEWAY) — 두 엔트리 정리 여부는 오너 확인 |
| lucky-draw | draw 빌드 + Playwright 가짜 Supabase 응답 | 브랜드→스크린샷, 모바일 3장 + 영상 |
| dropship-os | market/next-dashboard 로컬 실행(검증 모드) | 브랜드→스크린샷, 스틸 4 + 영상 |
| threads-saas | threads_auto/web Flask + 임시 sqlite | 브랜드→스크린샷, 스틸 3 + 영상. /pricing 은 'undefined' 버그로 미사용 |
| vox-studio | out/renderer 정적 서빙 + window.api 스텁 | 브랜드→스크린샷, 스틸 4 + 영상 |
| care-helper | care_helper Flutter 웹 빌드 | 브랜드→스크린샷, 모바일 3장 + 영상. 등록 저장은 웹에서 동작 안 함(입력까지만) |
| jarvis | HUD(Vite) + 상태 메시지 데모 스크립트 | 브랜드→스크린샷, 스틸 2 + 영상 |
| oinzi | publish/oinzi.exe 0.9.1, 임시 데이터 폴더 | 이전 테스트 빌드 캡처 교체, 스틸 2 + 영상 |
| modoocar, rotc-seating, vip-care | 라이브 사이트 녹화 | 영상 추가, rotc·vip 모바일 3장 추가(rotc 강사 이름 블러) |
| gender-reveal | 레포 임시 클론 dev(localStorage 데모) | 영상 추가 |
| OMEN, VoxCLI(모바일) | Flutter 웹 빌드 | 실패: dart:io Platform 사용으로 웹에서 즉시 크래시 → 브랜드 썸네일 유지 |
| Joseon App | Flutter 웹 빌드 | 첫 화면은 뜨지만 탭 입력에 반응 없음 → 기존 캡처 유지 |
| 냉킵 | 미실행 | Firebase 운영 프로젝트에 붙음(실데이터 위험) → 기존 캡처 유지 |
| abroadnbroad, 몇기야 | 라이브 확인 | 라이브 게시물이 테스트 글·빈 목록·광고 자리뿐이라 영상 가치 없음 → 기존 유지 |
| 페어링 북 | 라이브 확인 | 로그인 벽, 코드 비공개 → 브랜드 유지 |
| 블로그 양산 엔진 | 임시 클론 확인 | API+DB 가 비어 있고 글 생성에 LLM 호출 필요 → 브랜드 유지 |
| Lulla | 임시 클론 확인 | Flutter + Rust FFI(웹 빌드 불가), 백엔드 다수 → 브랜드 유지 |
| 셀러 소싱 분석기, Browser Bridge, Discord–Codex Bridge, Figma MCP, Planning Kit, 공모전 모니터, 썸네일 생성기 | — | 자체 화면이 없는 크롤러·확장·봇·CLI(실제 UI 는 Discord/Figma/터미널, 외부 API 필요) → 브랜드+설명 패널 유지 |
| AI 가상 모델 카탈로그 | — | ComfyUI 본체 기동 필요, 결과물이 의류 상품 이미지라 권리 확인 전 미사용 |
| 정푸드, 홈헬스케어, 카드뉴스 스튜디오, Threads 운영 에이전트, 운전면허 PLUS | — | 기존 규칙(운영 DB·고객 브랜드·타인 핸들·코드 없음)으로 제외 |

## 실화면 전환 감사 (2026-11-09, 오너 규칙: 실화면 우선·가려서 사용)

| 프로젝트 | 결과 | 소스 / 남은 이유 |
|---|---|---|
| fitness-crm | 실화면 | client-pando `tests/.shots`(회원·트레이너·FC), admin-pando `qa-results/scenarios`(매출 코크핏·캘린더). FitGenie 로고·지점·계정·이름 블러 |
| blockpick | 실화면 | web-sandy-three-85.vercel.app(초기 Flutter 빌드, 데모 데이터). 상품·호텔 사진·이름 블러. app-blockpick.vercel.app 은 API 실패 화면이라 미사용 |
| homecare-platform | 실화면 | git 5cb20bb 의 로고 없는 예전 캡처 복원 |
| threads-agent | 실화면 | threads-scheduler/shots 드라이런, 모달 밖 타 계정 피드·본문 수치·오너 계정 핸들/프로필 사진 블러 |
| voxcli | 실화면(커버) | apps/windows_desktop_py VoxCLI Hub 를 임시 APPDATA 로 띄워 창 캡처(서버 미기동, 기기 이름 demo-pc). 모바일 Remote 는 웹 빌드 크래시라 여전히 미캡처 |
| virtual-model-catalog | 실화면 | D:\ComfyUI 로컬 서버(Start-Catalog.ps1, 127.0.0.1:8189)에 CATALOG_ONE_QUEUE.workflow.json 을 불러온 노드 그래프. 생성 실행 안 함, 작업 대기열 패널(결과 썸네일)은 숨김 |
| contest-watch, pairing-book | 실화면 | 기존 갤러리의 실캡처를 커버로 |
| card-news-studio | 실화면 | marketing-studio/connections-test.png, 고객사 로고·브랜드·프로젝트명 블러 |
| predixscore | 브랜드 유지 | 라이브 배포의 Polymarket API 호출이 422, /api/leaderboard·/api/paper/* 502 (2026-11-09 재확인) → 모든 데이터 화면이 오류/빈 상태. 압축본에 캡처 없음, 압축본 코드 실행 금지. 필요: 정상 동작하는 배포 또는 오너가 가진 캡처 |
| jeongfood | 브랜드 유지 | 라이브는 로그인 화면뿐(2026-11-09 재확인, 로그인 폼 하나라 커버 가치 없음), 로컬 실행은 운영 Supabase·실거래처 데이터에 붙음. 필요: 테스트 계정+샘플 DB 또는 서버까지 가짜 Supabase 로 띄우는 하네스 |
| lulla, omen | 브랜드 유지 | Flutter+Rust FFI / dart:io 로 웹 빌드 불가, 스토어 배포 없음. 필요: 실기기·에뮬레이터 캡처 |
| discord-bridge, browser-bridge, figma-mcp, planning-kit | 브랜드 유지 | 자체 화면 없는 봇·확장·CLI·키트. 실화면은 실제 Discord/Chrome/Figma/터미널이라 개인 대화·계정이 섞임(discord-bridge data/attachments 는 카톡·메일 등 개인 캡처라 금지). browser-bridge 팝업은 280px 상태 표시뿐이고 output 은 쿠팡 상품 이미지(타사 데이터). figma-mcp 플러그인 UI 는 업스트림(hopp) 것이라 우리 작업으로 보이면 안 됨. 필요: 데모 Discord 서버·데모 Figma 파일로 녹화 |
| thumbnail | 브랜드 유지 | 로컬 산출물은 picsum 테스트 그리드뿐 |
| programmatic-seo, seller-sourcing | 브랜드 유지 | DB 비어 있고 생성·수집에 외부 LLM/크롤링 필요. 필요: 샘플 데이터 시드 후 로컬 실행 |

## 멀티 앱 엔트리 (2026-11-10, 오너 요청 "3개 다 보여줘")

| 엔트리 | 앱 | 배포 | 링크 | 캡처 출처 |
|---|---|---|---|---|
| homecare-platform | 웹(고객용) | EC2 https://54-116-157-4.sslip.io/ko | 검(2026-11-10 오너 승인, 메인 url) | git 5cb20bb 실캡처(cover, 01, 02) |
| homecare-platform | 아카데미 | EC2 https://academy.54-116-157-4.sslip.io/ko | 검(2026-11-10) | 라이브 비로그인 캡처 03·04, 블러 없음 |
| homecare-platform | 관리자 | EC2 https://admin.54-116-157-4.sslip.io/ (로그인) | 검(2026-11-10) | apps/admin/.screens/redesign QA 캡처 05·06, 계정명·테스트 문의자 이름만 블러 |
| dealer-settlement | 웹(소개) | https://www.caryoung.co.kr/ | 검(2026-11-10, 메인 url) | 라이브 캡처 03·04, 블러 없음 |
| dealer-settlement | 관리자 | https://admin.caryoung.co.kr/ (로그인) | 검(2026-11-10). 옛 Vercel admin-psi-amber-83·admin-psi-ashen 은 링크 금지 | 로컬 실행 + 가상 데이터 05·06, 로고 노출 |
| dealer-settlement | 클라이언트(딜러 웹) | https://dealer.caryoung.co.kr/ (client-roan-six.vercel.app 대체) | 검(2026-11-10) | 기존 cover, 01, 02 |

### 칼가는곳.com 검증 (2026-11-09, knife-sharpening)

- 오너가 알려준 도메인 https://칼가는곳.com (www.xn--o39a1r88koy7a.com) 은 200 이지만, 우리 레포 `_archive\web-kal`(마지막 커밋 2025-12-02, adrock_simjae 101 / Kalganunplace 5) 빌드가 아니다: AWS CloudFront 호스팅, 타이틀 '칼가는곳 | 믿고 맡기는 칼 연마' 의 마케팅 랜딩(/, /price, /daegu, /faq)이고 레포의 /client·/admin 라우트는 404. 랜딩이 소개하는 앱(Play com.edgecraft.kalganunplace, App Store id6761705397)의 '정밀 연마·견적·안심 보장·오로시 개조' 화면은 레포에 없는 기능.
- GitHub Kalganunplace/web-kal 은 접근 불가, 로컬·압축본에서 랜딩 소스 못 찾음. → url·live 미적용, 라이브 화면 캡처도 우리 작업 화면이 아니라 미사용. 오너 확인 필요: 랜딩/새 앱도 우리가 만들었는지(그렇다면 소스 위치), 아니면 고객사가 이후 다른 팀과 만든 것인지.

## 제외

| 대상 | 이유 |
|---|---|
| pluck-dev/bot, `D:\dev\bot`, `tools\bot-deploy`, `personal\trading\*`, crypto-signals-*, v0 트레이딩 체크리스트 | 트레이딩 봇·트레이딩 도구(금융 리스크) |
| `personal\simjae-dev\ibctgit` 등 ibctgit 관련 | 전 직장 자산 |
| `personal\simjae-dev\dataset`, `pluck\excl` | 고객·인사 실데이터 포함 |
| `_archive\parking-pwa-react-backups` | DB 덤프만 있음(실데이터 가능) |
| `_archive\cnc` | 딜러 정산 플랫폼의 이전 기획. crawled 폴더에 실데이터 가능 |
| `_archive\rotc` | 커밋 없는 초안. 알비연(rba)으로 이어짐 |
| `_archive\lara` | git 없음, 하루치 프로토타입과 강의 자료 |
| `pluck\landing`, simjae-fn12/next, simjae-fn12/issue | 다른 작성자(Heewon Lee) 커밋, 레퍼런스 클론 |
| `labs\koreaswim-clone`, `labs\momsitter-clone`, `pluck\design\apps\shorttuber-clone`, v0-youpilot-net-clone, `personal\trading\trading-workspace` | 타사 사이트·서비스 클론 |
| `pluck\design\apps\{lusion,activetheory}-recreation`, design-rho-ashy(NEXT 증권) | 레퍼런스 재현물, 증권 고객 관련 |
| `pluck\maengrov-landing`, exfair-love/Maegrove_Landing | 기존 제외(레퍼런스 클론, 오너 커밋 없음) |
| `C:\Users\SIMJAE\OpenMontage`, `personal\editor`, `personal\god-tibo-imagen`, `simjae-dev\self-hosted-ai-starter-kit`, `labs\voice`, `labs\soundtouch-233`, `pluck\design\_ref-motiscope`, agency-agents·palmier-pro·Stirling-PDF·claw-code·n8n·ccxt 포크 | 서드파티 OSS·포크, 자기 커밋 없음 |
| `tools\kakaowork\upstream` | 외부 작성자 |
| `tools\loggi`(= kakaowork\backup-own) | 외부 업스트림에서 파생, 사적 대화 백업 도구라 게재 보류 |
| `tools\task-api`, `simjae-dev\web\car`, pluck-dev/bayada-academy·bayada-landing, spacePluck/ou, `seoul-youth-home-finder`(D:\dev 루트) | 빈 스캐폴드·빈 레포 |
| `personal\side\mart\party-sharing-api` | 1커밋 NestJS 스텁 |
| `pluck\wedding-luxe-next`, pluck-dev/web-template(ALPHA, = clients/marketting) | 하루 작업 랜딩, 고객 불명 |
| BlockPick 웹(spacePluck/blockpick, web-sandy-three-85) | 웹 버전 코드는 접근 불가, 공개 화면은 스플래시뿐. 2026-11-09 오너 요청으로 Flutter 유저앱(blockpick)만 앱 엔트리로 게재 — 카피는 참여·포인트·리퍼럴 구조로만 쓰고 경매·사행 표현 금지 |
| v0-* Vercel 프로젝트(스냅온유, 하늘 정원, ezpz 등) | v0 생성 프로토타입, git 없음, 고객 관계 확인 불가 |
| `pluck\ad-agency-research`, `pluck\docs`, pluck-dev/ad, `personal\obsidian*`, obsidian-service-planning, securities-cs-knowledge-base | 개인 노트·문서 |
| spacePluck/pixel-art, `simjae-dev\project\beads` | 2024년 소규모 실험 |
| `simjae-dev\openai-api-kr-main`, `simjae-dev\private` | 튜토리얼 |
| `labs\aside-analysis`, `labs\ego-analysis` | 타사 브라우저 분석 노트(Oinzi 배경 자료) |
| `labs\blander`, `labs\stem-probe`, `labs\design-artifacts` | 산출물만 있는 소규모 실험, boxon 시안(boxon 엔트리에 포함) |
| pluck-dev/simjae, simjae-portfolio, v0-alsyfoportfolio, pluck-dev/pluck-landing | 개인·스튜디오 자체 사이트 |
| `D:\ComfyUI` 본체 | 서드파티 |

## 오너 확인이 필요한 것

- MODOOCAR: 고객 의뢰 작업인지 자체 사업인지. 지금은 클라이언트로 분류했고 라이브 링크를 걸었다.
- 페어링 북: 레포가 비공개(spacePluck)라 코드는 못 봤다. 라이브 화면 문구 범위로만 썼다.
- Figma MCP Bridge 확장: 로컬 레포 히스토리에 오너 작성 커밋이 보이지 않는다(메모리 기준 "정밀 추출 커밋"이 우리 작업). 근거 커밋 위치 확인 필요.
- Threads 운영 에이전트: README 의 하루 상한과 코드 값이 다르다(카피는 수치 없이 "하루 행동 상한"으로만 썼다).

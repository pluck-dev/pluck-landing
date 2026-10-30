# 포트폴리오 인벤토리 (2026-10-30)

`lib/portfolio.ts` 에 무엇을 넣고 무엇을 뺐는지, 그 근거를 남긴다. 새 프로젝트를 검토할 때 이 표부터 확인할 것.

조사 범위: `D:\dev\{clients,pluck,personal,tools,labs,_archive}` 와 `D:\dev` 루트, `D:\auto-browser`, `D:\ComfyUI`, `C:\Users\SIMJAE\OpenMontage`, `C:\Users\SIMJAE\Desktop\pluck\discord-codex-bridge`, GitHub(pluck-dev, simjae-fn12, develop-para, `user/repos` 로 보이는 조직 전체, spacePluck), Vercel(pluckai 계정의 팀 plucks-projects-f9386a6f, 프로젝트 46개). ibctgit(전 직장) 관련은 조사·게재하지 않는다.

## 포함 기준

- 넣는다: 오너/스튜디오가 직접 만든 코드가 있고 목적이 분명한 작업. 내부 도구와 실험도 역량을 보여주므로 넣는다.
- 뺀다: 자기 커밋이 없는 서드파티 OSS 포크, 다른 회사 사이트 클론·복제, 튜토리얼, 하루 미만이고 기능이 없는 스캐폴드, 트레이딩 봇, ibctgit 관련, 개인 문서·노트, 실데이터가 들어 있는 폴더.
- 상태: `live` 는 우리가 배포했고 지금 200 으로 열리는 URL 이 있을 때만 쓴다. 고객사 실명은 고객 라이브 사이트에 이미 공개된 경우에만 쓴다.

## 포함 (54)

### 기존 40개

| 이름 | 소스 | 이미지 |
|---|---|---|
| 알비연 통합 플랫폼 | develop-rba/rba (`D:\dev\pluck\rba`; `clients\rby` 는 같은 레포의 옛 클론) | 스크린샷 |
| 보령항공여행사 | `D:\dev\clients\boryoung` | 스크린샷 |
| DVIA · 대일시스템 | `D:\dev\clients\web-daeilsys` | 스크린샷 |
| 정푸드 관리 시스템 | jeongfood/admin (`clients\jeongfood`) | 브랜드 썸네일 + 설명 패널 |
| 자동차보험 딜러 정산 플랫폼 | `clients\caryoung` (`_archive\cnc` 의 보험 CRM 은 같은 도메인의 이전 기획) | 스크린샷 + 설명 패널 |
| 홈헬스케어 통합 플랫폼 | `clients\bayada`, pluck-dev/bayada | 브랜드 썸네일 |
| THOUSAND | develop-thousand/web | 스크린샷 |
| ABROAD&BROAD | abroadnbroad/abroadnbroad | 스크린샷 |
| V8 Cal Lab | carfixproj-Hwang/hptunermap | 스크린샷 |
| Lulla · AI 동화책 | contentscoin/lulla | 브랜드 썸네일 |
| 자동차용품 자사몰 (d2c-store) | dev-gwedo/D2C (`pluck\online-store`) | 로컬 실행 캡처 + 영상 2 |
| 칼갈이 수거·배송 서비스 | Kalganunplace/web-kal (`_archive\web-kal`) | Figma 시안 |
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
| 페어링 북 (pairing-book) | spacePluck/heart-paring (비공개), heart-paring.vercel.app | 글·그림으로 만드는 이야기책 서비스 | 자체 서비스 · 라이브 | 브랜드 썸네일 + 라이브 캡처 | 오너 커밋, 2025-03. 코드 열람 불가라 라이브 화면 문구 범위로만 기술 |
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
| BlockPick(spacePluck/blockpick, web-sandy-three-85) | 블록체인 경매형 게임: 사행성·금융 리스크, 공개 화면은 스플래시뿐 |
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

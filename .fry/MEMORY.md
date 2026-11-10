# Portfolio index: lib/portfolio.ts 데이터 규칙, 링크 검증, 클라이언트 실명

## 링크/카피 규칙 (WHY)
- 링크는 "우리 레포에서 배포된 것"이 확인된 라이브 사이트만 건다 (상세 페이지의 "사이트 방문" 버튼도 url 있을 때만).
- 연도는 각 레포 git log 첫/마지막 커밋 연도. 지표·고객사·성과·사용자 수를 지어내지 않는다. stats 스트립은 데이터에서 계산.
  - 기획 문서의 목표 수치(정푸드 매출·거래처 수 등), 로컬 시드 값(더빙고 "만들어진 버전 0")은 카피에 쓰지 않는다. 클라이언트 자사 사이트에 공개된 문구(보령 "23년 업력")만 예외.
- 미공개/권한 불확실 클라이언트는 일반명으로 기재 (AI 의사결정 시스템 제안서 = clients/nousbo 등).
- **카영(caryoung)·바야다(bayada) 브랜드 공개 승인 (2026-11-10 오너)**: 오너가 브랜드 도메인 링크를 공개하기로 해 두 고객은 실명·로고 노출 허용. 이름 '카영 딜러 정산 플랫폼'(dealer-settlement), 'BAYADA 홈헬스케어 플랫폼'(homecare-platform), 둘 다 live. 승인 URL 6개(이 외 배포 링크 금지): 카영 웹 https://www.caryoung.co.kr/ (메인 url) · 관리자 https://admin.caryoung.co.kr/ · 클라이언트 https://dealer.caryoung.co.kr/ / 바야다 홈페이지 https://54-116-157-4.sslip.io/ko (메인 url) · 아카데미 https://academy.54-116-157-4.sslip.io/ko · 관리자 https://admin.54-116-157-4.sslip.io/. 브랜드 공개 후에도 개인정보(실명·개인 전화/메일·관리자 계정명·테스트 문의자 이름·실고객/계약 데이터)는 계속 가리고, 검증 안 된 실적 수치는 우리 지표처럼 보이지 않게 크롭. 관리자 화면은 시드/QA 캡처만(운영 관리자 로그인 금지).
- caryoung 은 2026-10 오너 지시로 live + url(client-roan-six.vercel.app) 공개 → 2026-11-10 dealer.caryoung.co.kr 로 교체(client-roan-six 는 더 이상 링크 안 함). 레포 루트의 dealer-lookup/dashboard-staff 캡처는 실명·전화번호 실데이터라 사용 금지 → 비로그인 '샘플 데이터' 프리뷰(홍길동/12가1234)만 캡처.
- THOUSAND 는 오너 확인 결과 실제 클라이언트 작업(develop-thousand/web) → category client, live. 단 라이브 푸터가 'Design concept·실제 주문/결제 없음'이라 카피에 '결제 없이 구매 흐름 시연' 명시, 주문·매출 실적처럼 쓰지 말 것.
- 노출 금지 링크: brochure-wine(타이틀에 '누보' 고객명), admin-farm-theta(타이틀에 개인명 '심재&오유마켓', 로그인만). 엔트리는 유지·무링크.
- adrock-driving: 운전면허 PLUS(Play, com.adrock.driverlicense300) 저장소 android.drive 에는 오너 커밋이 없음(leemj/이미지/jdk). 오너 커밋은 web.dororo(보일러플레이트·웹뷰 통신)와 web.drivingplus(2026-11 오너 업로드 압축본, 2025-02~04 학과왕 응모·당첨 웹뷰·보상형 광고 브리지·Amplitude) → role/features 는 이 범위로만. app.drivingplus.me 는 같은 레포 계열이지만 이후 타인이 바꾼 학원찾기 사이트라 링크로 쓰지 않음. Play 스토어 스크린샷 중 '1000만이 선택', '1,601,032,242건' 등 수치 이미지는 사용 금지.
- Figma MCP 는 gethopp/figma-mcp-bridge 포크(우리 작업 = 정밀 추출 커밋) → "포크/확장"으로 표기.
- 애드락(전 직장, 2024.07~2026.07) 작업은 오너가 올린 압축본에서만 확인 가능(GitHub adrock-dev 접근 불가). 레포에 타 작성자 커밋이 섞여 있으니 `git log --author=simjae` 범위의 도메인만 카피에 쓴다(api.drivingzone = marketing/campaign-landing/admin-auth 뿐). 오너 브리프·이력서 문구(웹 31개 미니게임, 4개 언어, PortOne 결제 등)도 압축본 코드에 없으면 쓰지 않는다.
- 애드락 압축본은 여러 개(`adrock-*-001.zip`, `-003.zip` …)로 나뉘어 온다. 새 업로드 땐 Downloads 의 같은 접두어 zip 을 전부 확인할 것(첫 작업에서 -003 을 놓쳐 Predix·드라이빙존 웹이 누락됐음).
- drivingzone-campaign 슬러그는 웹 리뉴얼+캠페인 API 를 합친 엔트리(이름 '드라이빙존 웹 리뉴얼 · 캠페인'). 라이브 캡처 시 지점 상세의 이용자 리뷰 닉네임·강사 이름, 우측 상담 위젯(전화번호) 블러. 홈의 팝업·수치 배지(8만명+, 95.27%)는 쓰지 않는다.
- predixscore: Polymarket 은 데이터 소스일 뿐 실거래·자금 수탁 없음(제품 기획서 명시) → 카피에 '가상 예측·실제 주문 없음' 유지, 베팅·수익 표현 금지. 온체인 컨트랙트는 타 작성자 작업. 압축본 .env 에 지갑 키가 있으니 열지 말 것.
- fitness-crm(판도/pando, dev-spogym 레포, 제품명 FitGenie): 고객사 미공개·배포 404 → 일반명 + 브랜드 썸네일. admin-pando qa-results/client-deliverables 의 실화면 캡처는 테스트 데이터지만 'FitGenie CRM' 로고·지점명이 보여 미사용(쓰려면 오너 확인 후 로고 블러). 옛 showreel.tsx(미사용 섹션)의 'FitGenie + 스포짐' 표기를 근거로 실명 쓰지 말 것.
- blockpick: 2026-10 인벤토리에선 '사행성' 이유로 제외했으나 2026-11-09 오너 요청으로 Flutter 유저앱만 게재. 카피는 참여·포인트·리퍼럴 구조로만, 경매·베팅·수익 표현 금지. assets 의 상품 이미지(명품·브랜드 사진)는 썸네일에 쓰지 않는다.
- 브랜드 커버 이름에 ' · '(공백 포함)이 있으면 결합 처리가 안 돼 '·'가 줄 맨 앞에 올 수 있다(긴 영문+한글 이름). 렌더 후 반드시 눈으로 확인하고 이름을 줄이거나 바꾼다(BlockPick).
- webtoon-voice 슬러그의 서비스명은 최신 코드(D:\dev\pluck\webtoon) 기준 "더빙고" → name "더빙고 · Voice Webtoon".

## 검증 결과 (2026-10-29)
- boryoung.co.kr: 라이브 HTML 메타/카피가 clients/boryoung/apps/web 과 일치 → 링크 OK.
- bayadakorea.com: WordPress/Elementor 사이트, 우리 코드 아님 → 링크 금지.
- boxon.vercel.app: 스페인어 다른 서비스(타 소유) → 우리 boxon 아님, 링크·캡처 금지.
- jeongfood.vercel.app: /admin/login 으로만 이동(공개 화면 없음). 로컬 실행은 운영 Supabase+실거래처 데이터에 붙으므로 금지 → 브랜드 썸네일.
- ndrop.kr, draw.pluck.co.kr: DNS NXDOMAIN (피처드 카드/MORE TO EXPLORE 링크 죽어 있음, 오너 결정 대기).
- admin-pando.vercel.app (FitGenie): 404 → MORE TO EXPLORE 에서 제거.
- KakaoWork exporter(tools/kakaowork/upstream): 외부 작성자(kangjung) 레포라 제외.

## 제외 레포 판단 (2026-10-29, 재검토 방지)
- pluck-dev/ad = 개인 마케팅 학습 노트, securities-cs-knowledge-base = 개인 학습 문서, simjae-fn12/hirebest = Webflow 템플릿(heavn-one) 미러, pluck-dev/ordering = '발주모아 클론', exercises-dataset = 포크, info-admin = 하루짜리 스캐폴드, clients/marketting(ALPHA 랜딩) = 하루 작업·미배포·고객 불명, maengrov-landing = README 없음(레퍼런스 클론).
- 사주 앱: 소스는 이 PC/접근 가능 GitHub 에 없음. env-collection-20260630/app-manse(구 Mac 경로 personal/app-manse)에 env 이름만 존재. 사주 기능은 pluck-dev/omen(OMEN, 기존 사주 리포트 파이프라인 재활용)에 포함 → OMEN 엔트리로 대체.
- D2C(dev-gwedo) 배포는 Vercel 로그인 보호(해시 URL만) → 브랜드 썸네일. d2c.vercel.app 등은 타인 사이트.

# Portfolio 이미지: public/work/<slug>/ 규격, 소싱 순서, 개인정보 규칙

## 규격 (WHY: 카드·상세·OG 를 한 비율로 통일)
- 모든 이미지 1600x1000(16:10) webp ≤250KB. cover.webp = 카드·상세 히어로·OG 이미지, 01..0N.webp = 갤러리(최대 6, 홀수면 첫 장 전폭).
- 모바일 화면은 390 캡처 2-3장을 #dfe3da 캔버스에 둥근 모서리+그림자로 합성 (docs/work-covers/compose.js phones()).
- 소싱 우선순위: 라이브 사이트 캡처 → 프로젝트 폴더 기존 QA/Playwright 스크린샷 → 로컬 실행(데모/모크 모드만) → 브랜드 썸네일(coverKind "brand").

## 오너 규칙: 실화면 우선, 가리고 쓴다 (2026-11-09)
- "썸네일 실제로 할 수 있는 건 실제 걸로 해줘야 고객들이 좋아한다." → 커버·갤러리는 실제 화면이 원칙. 로고·고객사명·실명·전화·닉네임·브랜드 상품 사진·검증 안 된 수치 팝업이 문제면 **블러/크롭으로 가리고 쓴다**. 브랜드 썸네일은 실화면을 구할 방법이 정말 없을 때만.
- 소스 순서: 라이브 URL(Playwright 헤드리스 캡처, 링크 안 거는 배포도 캡처는 가능) → 압축본·레포 안 실제 캡처(QA/테스트 shots, 스토어, Figma 출력) → 안전한 로컬 실행(가짜 데이터) → git 히스토리의 예전 실캡처 → 브랜드 썸네일.
- 2026-11-09 전환: fitness-crm(client-pando tests/.shots + admin qa-results, FitGenie 로고·지점·계정·이름 블러), blockpick(web-sandy-three-85 = 초기 Flutter 빌드 데모 데이터, 상품·호텔 사진/이름 블러), homecare-platform(git 5cb20bb), threads-agent(threads-scheduler/shots, 모달 밖 배경·수치 블러), contest-watch·pairing-book(기존 갤러리 실캡처를 커버로), card-news-studio(marketing-studio/connections-test.png, 로고·브랜드·프로젝트명 블러).
- 추가 전환(같은 날): voxcli 커버(VoxCLI Hub Tkinter 창, APPDATA=임시 폴더로 띄워 저장 설정·토큰 안 읽음, 기기 이름 demo-pc로 바꿔 찍음 — 기본값은 PC 호스트명이라 그대로 찍지 말 것), virtual-model-catalog(D:\ComfyUI 의 Start-Catalog.ps1 로 127.0.0.1:8189 기동 → Playwright 로 app.loadGraphData(CATALOG_ONE_QUEUE.workflow.json), 실행 버튼 안 누름. 작업 대기열 팝오버에 결과 썸네일(의류·인물)이 떠서 DOM 에서 숨기고 캡처, 끝나면 8189 PID 종료).
- 블러 박스는 원본 캡처에서 다시 만든다: 합성본 위에 덧칠하다가 본문 첫 줄까지 덮은 적 있음(threads). 핸들 줄과 본문 줄 사이가 몇 px 라 박스를 행 단위로 나눌 것. threads 는 오너 본인 핸들(simjae____)·프로필 사진도 블러.
- 아직 브랜드인 것과 이유는 docs/portfolio-inventory.md 의 '실화면 전환 감사' 표 참고.
- 합성 도구: 레포 밖 PIL 스크립트(blur/desktop/panels — panels 는 비율이 다른 폰 캡처도 그대로 둥근 패널로 배치). compose.js 의 phones() 는 9:19.5 로 강제 크롭하므로 퍼블리싱 뷰(512x672 등)에는 부적합.

## 개인정보/식별 규칙 (하드)
- 실명·전화번호·회원 명단·실데이터 어드민·토큰·실제 Discord/카톡 화면 금지. 블러하거나 제외. 데모 데이터 어드민은 OK.
- nousbo 는 브랜드명·로고·견적 금액이 보이면 안 됨. caryoung/bayada 는 2026-11-10 부터 브랜드명·로고 허용(위 승인 참고), 단 고유 통계(예: 50년/33,000+/22개국, '3,000명 이상의 에이전트')는 여전히 캡처 제외.
- farm-sales 서비스명에 개인 실명이 들어 있어 전 이미지에서 블러. seoul-home 공고의 사업자 개인명 블러. webtoon 푸터(사업자 정보) 크롭.
- setflow 라이브 캡처는 실사용자 작성자명이 보여 미사용 → build/shots 데모 데이터 캡처 사용.
- v8-cal-lab(hptunermap) 데스크톱 헤더의 'CALL 010-…' 사업장 번호는 블러(1800px 캡처 기준 x1100,y12,205x54). 푸터·CTA 프레임은 번호가 보여 미사용.
- gender-reveal 라이브는 로그인 벽 → 레포 복사본을 env 없이 로컬 실행(localStorage 데모 모드)해 캡처.
- ai-dj(D:\dev\ai-dj-navigation, Tkinter): 레포 밖 하네스(C:\Temp\djcap\cap.py)로 App 을 library.sqlite3 **복사본** 데이터 폴더로 띄워 창 클라이언트 영역 1600x1000 을 PIL ImageGrab. .venv 는 _ctypes 없음 → .venv-package 사용, 하네스는 `if __name__=='__main__'` 필수(오디오 엔진 multiprocessing spawn 이 스크립트를 재실행). 재생 버튼은 누르지 않고 GUIDE 모드 transport 위치만 옮겨 전환 구간을 찍음(소리 없음). 덱 로드 후 PERFORM 패널을 열면 행이 걸려서 04 는 빈 덱 상태 캡처. 카피: 개발 중·규칙 기반(학습 모델 아님) 명시.
- knife-sharpening(web-kal) 이미지는 레포 public/figma 의 Figma 시안 → alt 에 'Figma 시안' 명시.
- knife-sharpening: 2026-11-09 오너 지시로 url https://칼가는곳.com + live. 라이브는 웹앱을 앱으로 감싼 버전(CloudFront 랜딩)이라 레포 경로와 달라도 오너 확인으로 연결함. 커버=라이브 랜딩 캡처, 03=예전 Figma 시안.

## 브랜드 썸네일 (실화면이 없거나 노출 불가한 프로젝트, 2026-10-30)
- 오너 피드백: 프로젝트마다 따로 디자인한 임시 커버(파란 배경 '룰라.' + 가짜 폰 목업 등)가 사이트와 따로 놀았다 → 한 템플릿으로 통일. 예전 docs/work-covers/*.html·panel.js·spec-*.json 은 삭제했다(재도입 금지).
- 데이터: PortfolioProject.coverKind = "brand" | "screenshot" (필수), coverMotif?(browser/phone/window/terminal/flow), 갤러리 이미지의 diagram?{title(
 허용), flow?, items[{title,text?}]}.
- 생성: `npm run covers:brand [-- slug ...]` = scripts/render-brand-covers.mjs (Playwright + sharp, lib/portfolio.ts 를 Node 24 type-stripping 으로 직접 import). coverKind brand 의 cover.webp 와, coverKind 와 상관없이 diagram 이 있는 갤러리 이미지를 다시 만든다. Google Fonts(Noto Sans KR 800/500, Geist)를 쓰므로 네트워크 필요.
- 템플릿: 이름(굵은 한글, 2–3줄 자동 축소) + detail.oneLiner 한 줄 + 좌하단 '카테고리 · 연도' + 우측 선 글리프(라임/블루 원 = 뽑힌 점 모티프) + 우하단 PLUCK p 심볼. 톤은 카테고리로 고정: client·product=paper(#f4f4ef), app=blue(#335aeb), ai=ink(#202523). 글리프 기본값도 카테고리(client·product=browser, app=phone, ai=flow).
- 설명 패널(diagram)도 같은 톤·심볼. eyebrow/번호/파란 마침표 없음. '·'는 한 줄 맨 앞에 오지 않게 이름·한 줄 소개에서만 단어 결합(⁠) 처리 — 패널 카드 안에서는 결합하면 카드 폭이 깨져서 안 한다.
- alt 는 "{이름} PLUCK 브랜드 썸네일 — {oneLiner}" / 패널은 "… 설명 패널". 썸네일 안에 지표·가짜 UI 를 넣지 않는다.
- docs/work-covers 에는 실스크린샷 합성용 compose.js(desktop/phones/blur)와 window.js(데스크톱 앱 캡처를 캔버스 중앙에)만 남김. 이 폴더에서 실행하면 sharp 가 레포 node_modules 로 해석된다.

## 함정
- 그리드 순서(2026-11-10 오너 지정): pinnedOrder(칼가는곳·바야다·박스온·setflow·냉킵·대일·카영·드라이빙존·THOUSAND·빌라주차·젠더리빌·더빙고) 먼저, boryoung 은 맨 아래(bottomOrder), featured 에서도 boryoung 마지막. lulla·proposal-brochure 는 오너 지시로 삭제. 나머지는 `projects` = 카테고리 순 → status(live>development>case>concept) 안정 정렬. 상세 이전/다음도 이 순서. categoryOrder 는 projects 계산 전에 선언돼야 함(TDZ).
- eslint-config-next 16 의 react-hooks/set-state-in-effect 규칙: matchMedia 는 useSyncExternalStore 로 구독할 것.
- 카드 진입 애니메이션은 필터 클릭 후에만(data-animate). 초기 로드에 걸면 풀페이지 캡처/스크롤 시 흐리게 보임.
- 상태 pill 은 이미지 위가 아니라 카드 메타 행에 둔다.
- 커버를 같은 파일명으로 교체하면 로컬 `next start` 는 .next/cache/images 의 옛 최적화본을 계속 준다 → 캡처 전 .next/cache/images 삭제.
- 헤더/푸터/CTA 는 components/site-chrome.tsx 공용. 상세 페이지에선 home=false 로 "/#work" 등 홈 앵커로 연결. 홈 앵커: #work(전체 그리드) #featured #services #process #faq #contact. 상담 메일 링크는 CONTACT_MAIL/contactMail(subject).
- docs/work-covers 는 Node CJS 스크립트라 eslint globalIgnores 에 추가돼 있음.

# Portfolio 멀티 앱 엔트리: apps 필드, 바야다(웹·아카데미·관리자)·카영(웹·관리자·클라이언트) 배포·캡처 출처

## 데이터·렌더 (2026-11-10, 오너: "3개 다 보여줘야 해")
- PortfolioProject.apps?: {name, summary, url?}[] → 상세 페이지 개요 다음 '구성' 블록(3열 sage 카드, ≤700px 1열). url 은 링크가 허용된 앱에만, 카드 안 '열어 보기' pill. 히어로 '사이트 방문'(project.url)은 그대로.
- 갤러리 alt/caption 은 앱 이름으로 시작('웹 ·', '아카데미 ·', '관리자 ·', '클라이언트 ·')해 어느 앱 화면인지 밝힌다. 갤러리 최대 6 → 앱당 2장.

## homecare-platform(바야다) 3개 앱 = pluck-dev/bayada 모노레포 apps/{web,academy,admin}
- 배포: AWS EC2(개발·시연용, 무료 플랜) Caddy + sslip 호스트 — 웹 https://54-116-157-4.sslip.io/ko, 아카데미 https://academy.54-116-157-4.sslip.io/ko, 관리자 https://admin.54-116-157-4.sslip.io(로그인). 우리 레포 deploy/ec2 로 배포한 빌드(bayada 레포 .fry/MEMORY.md 'AWS 운영').
- 2026-11-10 오너 승인으로 세 앱 모두 링크(project.url = 웹). 단 IP 기반 sslip 주소라 **서버 이전 시 깨진다** → 이전·정식 도메인 생기면 project.url·apps[].url 4곳을 함께 바꿀 것.
- Vercel bayada.vercel.app(spacePluck/bayada) 은 타이틀 'Create Next App' 의 옛 빌드 + 호스트명에 브랜드 → 사용 금지.
- 캡처: 웹 = 기존 git 5cb20bb 실캡처(01·02, cover — 로고가 프레임 밖일 뿐 가린 것 없음). 아카데미 = EC2 라이브 비로그인 화면(03 홈, 04 /ko/courses), 2026-11-10 블러 없이 재캡처. 관리자 = 레포 apps/admin/.screens/redesign 의 QA 캡처(05 = 01-academy-dashboard 상단 900px, 06 = 06-website-dashboard), 로고는 그대로, 'b-academy' 계정명·최근 활동 대상·테스트 문의자 이름('김바야다','이요양')만 픽셀 블러. 운영 관리자 로그인 금지(로컬 bayada_v2 도 WP 실회원 데이터).
- '숫자로 보는 아카데미'(수료자·발급 건수) 섹션은 실적 수치라 캡처 제외.

## dealer-settlement(카영) 3개 앱 = dev-caryoung/{landing, caryoung(admin), client}
- 웹(소개) = www.caryoung.co.kr (landing 레포, adrock_simjae 커밋, 타이틀 일치) → 2026-11-10 링크 + 메인 url. 캡처 03(히어로)·04(#dealer 딜러 앱 소개 섹션) 블러 없이 재캡처(04 폰 목업의 '김카영/010-0000-0000' 은 가상 placeholder). '3,000명 이상의 에이전트'·제휴 보험사 전화번호 섹션은 캡처 제외.
- 관리자 = 링크는 https://admin.caryoung.co.kr/ (로그인 화면, 2026-11-10 승인). 예전 Vercel 배포 admin-psi-amber-83 / admin-psi-ashen 은 링크 금지. 로그인 화면 왼쪽에 제휴 보험사 담당 번호·내부 공지 보드가 공개돼 있어 캡처 안 함. 캡처 05·06 = 레포 복사본(C:\Temp\pmrun\cy-admin, .env·실데이터 json 제거)을 임시 docker postgres(55433) + prisma seed.ts·scripts/seed-test-data.ts + 가상 계약 36건(DEMO-1000…, 가상 보험사 '가나손해보험' 등)으로 로컬 실행. NEXT_PUBLIC_DB_PROVIDER=prisma, Supabase 는 더미. admin/admin1234!(시드 계정). 끝나면 컨테이너 삭제.
- 클라이언트 = https://dealer.caryoung.co.kr/ (2026-11-10, client-roan-six.vercel.app 대체). 우리 팀 client 프로젝트(client-theta-gray)는 404.
- 함정: 레포의 admin 폴더 루트에 db_contracts_*.json·backup_contracts_* 등 **실계약 덤프**가 있다 → 복사 실행 시 반드시 지운다. 루트 docs/dealer-settlement-assets 캡처도 실데이터라 금지.
- 2026-11-10 통일: 05·06 은 블러 없는 원본 캡처(C:\Temp\pfx\raw\cya_*.png)의 좌상단 '카영' 로고 영역만 마스킹본에 합성(원본엔 Next dev 'N' 배지가 있어 전체를 쓰지 않음). 데이터는 가상 계약(DEMO-*, 강샘플·정데모 등).

# Home 디자인 규칙: 상세페이지 흐름, AI 티 금지(eyebrow·장식 번호·밑줄), 한글 폰트

## 오너 피드백 (2026-10-29, WHY)
- "AI가 만든 티"를 싫어함: 작은 영문 eyebrow 라벨("03 / INDEX", "SCROLL TO EXPLORE"), 의미 없는 번호(01/02, /01, "02 /"), 장식 밑줄·little-line·행마다 hr, 거대 워터마크 텍스트, 헤드라인 끝 파란 마침표, 아무도 안 읽는 영문 태그라인 → 전부 금지. 숫자는 실제 개수일 때만.
- 구분은 선(rule) 대신 면(배경 --sage 카드, 둥근 모서리)과 여백으로. 링크는 밑줄+화살표 대신 pill 버튼(.button-primary/.button-ghost/.button-ink).
- 카피는 한국어 우선. categoryLabels/statusLabels 도 한글(클라이언트/자체 서비스/앱/AI·자동화, 라이브/개발 중/사례/콘셉트).

## 홈 흐름 = 한국 이커머스 상세페이지식 설득 구조
- 3D 히어로(PLUCK 심볼 필드 → 스크롤로 큰 심볼 하나로 수렴) → 숫자 밴드(블루 풀블리드, getPortfolioStats) → 이런 고민(다크) → 한 팀 4분야(스크롤 연동 스텝 + 스티키 실화면, 아래 #services 섹션 참고) → 라이브 클라이언트 작업 크게(featured) → 전체 그리드 → 진행 방식(번호 없음) → FAQ → 상담 CTA.
- 2026-10 오너 지시로 'THE WAY WE THINK' 스테이트먼트와 NDrop/DVIA/몇기야 아트카드 섹션 삭제(재추가 금지).
- 히어로 숫자는 getPortfolioStats 로만. live 는 "지금 접속해 볼 수 있는 서비스"로 표기(THOUSAND 처럼 실주문 없는 라이브가 있어 '운영 실적'처럼 쓰지 않기 위함). 지어낸 지표·후기·로고 금지.
- featured 는 실제 운영 클라이언트(boryoung, rba, dealer-settlement, dvia). 콜라주(hero-collage)는 2026-10 "히어로가 얌전하다(toss.im 참고)" 피드백으로 삭제 → components/hero-reel.tsx → 2026-10 feat/hero-3d 에서 Lusion 풍 3D 히어로로 교체(hero-reel 컴포넌트·CSS 삭제, public/reel 이미지는 남겨둠).

## 폰트/모션 함정
- Geist 는 한글이 없어 Windows 에서 맑은고딕으로 떨어져 헤드라인이 약해 보였음 → layout.tsx 에 Noto_Sans_KR(preload:false, --font-noto-kr)을 Geist 다음 폴백으로 추가.
- ScrollExperience 의 --progress 는 이제 모든 data-scene 에 같은 공식(뷰포트 통과율). 예전 hero 전용 핀 공식은 hero 가 고정 높이가 아니면 0→1로 튀어서 제거.
- next/image `priority` 는 Next 16 에서 deprecated → `preload` 또는 loading="eager"+fetchPriority.

# Home 서비스 섹션(#services): 스크롤 연동 스텝 + 스티키 실화면, 적용 사례 선택 규칙

## 구조와 WHY (2026-11-10, 오너 피드백)
- 오너가 폰으로 보고 "지금 이 섹션 다르게 안되나? 칼가는곳 랜딩 보니까 잘했던데" → 칼가는곳 랜딩의 '이용 방법' 블록(왼쪽 스텝 하이라이트 + 오른쪽 실제 화면 교체 + '실제 … 화면입니다' 캡션) 패턴만 재현. 칼가는곳의 에셋·카피·브랜드는 가져오지 않음. 오너는 이 칼가는곳 랜딩 스타일(차분·큰 타이포·강한 대비)을 좋아함.
- components/services-showcase.tsx(client). 데이터는 app/page.tsx 의 services(example 슬러그 + point = 포트폴리오 데이터로 뒷받침되는 한 줄). 캡션은 status 로 생성(live="지금 접속해 볼 수 있는 실제 화면입니다." / 그 외 "개발 중인 실제 화면입니다." — THOUSAND 는 실주문 없는 라이브라 '운영 중'이라 쓰지 않음).
- 동작: 네이티브 스크롤만. JS 는 [data-on] 토글과 --svc-top(헤더 실측 높이)만 쓴다. 활성 = 읽기 선(데스크톱 55%vh, ≤960px 은 스티키 스테이지 아래 남은 영역의 30%)을 지난 마지막 스텝. 포커스가 스텝 안으로 들어오면 그 스텝 활성(키보드).
- 데스크톱: 왼쪽 스텝 카드(비활성 opacity .34, 활성 흰 카드) + 오른쪽 sticky 스테이지(4개 figure 를 한 그리드 셀에 겹쳐 크로스페이드). ≤960px: 스테이지가 헤더 바로 아래 sticky(페이퍼 배경·그림자), 스텝은 그 아래로 스크롤. 프레임 폭은 min(100%, 34svh×1.6) — 실제 폰 Safari 는 innerHeight 가 ~660 이라 844 기준으로만 맞추면 글 영역이 없어짐.
- 핀 고정+진행도 방식(칼가는곳처럼 리스트 전체 고정)은 버림: 폰 실가시 높이에서 프레임+전체 리스트가 안 들어가고, 접힌 스텝의 링크가 키보드로 닿지 않음.
- reduced-motion: 스테이지 display:none, 디밍 없음, 각 스텝 안의 .svc-shot(인라인 실화면)만 표시. 인라인/스테이지 이미지는 같은 sizes 문자열(SHOT_SIZES)이라 같은 최적화 URL 을 공유.
- 스테이지 링크는 tabIndex -1(마우스용 중복), 접근 가능한 링크는 각 스텝의 .svc-link. 비활성 figure 는 visibility hidden 이라 스크린리더에 하나만 읽힘.

## 적용 사례 선택 (오너 규칙)
- boryoung(보령항공여행사)은 서비스 섹션 적용 사례에 쓰지 않는다(오너: "아래에 배치해", AI 자동화→여행사도 불일치). 후보는 오너 우선순위 목록(칼가는곳·바야다·박스온·setflow·냉킵·대일·카영·드라이빙존·THOUSAND·빌라주차·젠더리빌·더빙고)에서 coverKind screenshot 우선.
- 현재: 기획→homecare-platform(역할 기획·IA 설계), 디자인→thousand, 개발→knife-sharpening(칼가는곳 라이브), AI 자동화→webtoon-voice(AI 컷·대사 생성). point 문구는 portfolio.ts 의 description/overview/solution 에 있는 사실만.

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

# SEO: lib/site.ts, metadata 병합 함정, OG 폰트/webp, JSON-LD 사실만, 허브 페이지

## 규칙 (2026-10-29, feat/seo, docs/seo.md 참고)
- 사이트 상수·카피(HOME_TITLE/DESCRIPTION, categoryPages 허브 카피, projectTitle/Description)는 lib/site.ts 한 곳. canonical 호스트는 www.
- JSON-LD 는 화면에 있는 사실만: 주소·전화·평점·후기 없음(공개 정보 아님). FAQPage 는 app/page.tsx 의 faqs 배열을 그대로 써서 화면과 항상 일치. 주소가 공개되면 그때 ProfessionalService 에 추가.
- "서울"은 예전 푸터(components/sections/footer.tsx 'Seoul, KR')를 근거로 홈 description 에만 사용 — 오너 확인 대기.
- 홈 h1 = 비주얼 헤드라인 + 서비스 줄(.hero3d-lead 가 h1 안의 span). 키워드용 숨김 텍스트(display:none, sr-only 키워드) 금지. .hero3d-copy > * 가 setCopyRect 대상이라 h1 하나가 헤드라인+리드 박스.
- 검증 코드는 env(NEXT_PUBLIC_GOOGLE/NAVER/BING_SITE_VERIFICATION)로만. 코드에 하드코딩 X.

## 함정
- Metadata 는 세그먼트 간 얕은 병합: 페이지가 openGraph/twitter 를 쓰면 layout 의 openGraph 전체가 교체됨 → baseOpenGraph(locale, siteName) 스프레드 필수. canonical 은 layout 에 두면 모든 하위 페이지로 상속되므로 페이지별로만 둔다.
- 루트 app/opengraph-image 는 openGraph 를 직접 쓴 하위 페이지(허브)엔 안 붙음 → 허브는 defaultOgImage(/opengraph-image)를 명시.
- Satori(next/og)는 webp 디코딩 불가 → 프로젝트 OG 는 sharp 로 cover.webp→jpeg 변환(sharp 를 dependencies 에 명시). 가변 폰트도 불가 → assets/fonts 의 Noto Sans KR 정적 서브셋(KS X 1001 2350자 + portfolio.ts 문자). 새 카피에 희귀 글자가 생기면 python docs/seo/subset-og-font.py 재실행. 한글 줄바꿈은 wordBreak:"keep-all".
- 프로젝트 OG 라우트(/work/[slug]/opengraph-image/cover)는 빌드 때 프리렌더되지 않고 요청 시 렌더 → next.config.ts outputFileTracingIncludes 로 폰트·cover·lockup 을 함수 번들에 포함.
- next/image loading="eager" 는 Next 16 에서 <link rel=preload> 를 만든다. 홈 그리드는 폴드 한참 아래라 전부 lazy(ProjectCard eager 기본 false, 허브 첫 줄만 eager).
- sitemap lastModified 는 git log(포트폴리오 데이터/이미지 폴더). Vercel 얕은 클론에서 실패하면 빌드 시각으로 폴백.

# CRM/문의: Supabase(gpxbvtiyxgfquaiowspz, 서울), RLS 모델, /contact 서버 액션, /admin 인증, env 목록

## 구조와 WHY (2026-10-30, feat/supabase-crm)
- 스키마는 supabase/migrations/0001_crm.sql 한 파일(idempotent, SQL Editor 에 붙여넣기). lib/supabase/types.ts 는 손으로 맞춘 타입 → SQL 바꾸면 둘 다 수정. 적용·Auth 설정·env 는 supabase/README.md.
- RLS: 모든 테이블 on, anon 은 테이블 권한 자체 revoke. 공개 폼은 서버 액션(app/contact/actions.ts)이 service role 로 insert(그래서 anon insert 정책 없음). authenticated 는 public.is_admin()(JWT email ∈ admins, SECURITY DEFINER) 일 때만 전체 접근.
- 관리자 = ADMIN_EMAILS(env, 기본 admin@pluck.co.kr) **와** public.admins 둘 다 있어야 함. admins 테이블은 RLS 가 실제로 강제하는 쪽이라, env 만 있고 테이블에 없으면 로그인돼도 데이터가 안 보이므로 UI 진입부터 막는다(lib/crm/auth.ts getAdmin). 로그인 폼은 허용 주소에만 매직링크를 보내지만 응답은 항상 같음(주소 탐지 방지).
- proxy.ts(Next 16 의 middleware 대체)는 /admin/* 세션 갱신+미로그인 리다이렉트만 하는 낙관적 체크(getClaims = ES256 JWKS 로컬 검증, Auth 왕복 없음). 화면 진입 검사는 (protected)/layout 의 requireAdmin(React cache 로 요청당 1회, is_admin() RPC 1회). **데이터의 진짜 보호는 RLS** — 쓰기도 브라우저에서 바로 하므로 서버 액션 검사는 더 이상 없다.
- 관리자 쓰기는 브라우저 세션 클라이언트(RLS 적용)로만, 매번 activity_log 기록(_app/mutations.ts). projects.paid_amount 는 project_payments 트리거가 재계산 → 코드에서 직접 쓰지 말 것(낙관적 표시만 paidAmountOf 로 흉내).
- 문의 폼: zod 검증, honeypot(name=website), ip 해시(IP_HASH_SALT) 기준 시간당 5건, 첨부는 서버가 signed upload URL 발급 → 브라우저가 Storage 직접 업로드(pending/YYYY-MM/uuid/파일) → 제출 시 실제 존재하는 파일만 저장. 유입 경로는 components/source-tracker.tsx 가 pluck_src 쿠키에 기록(아래 '광고 전환 추적' 섹션의 first/last touch 참고). Discord 웹훅·activity_log 는 after() 로 응답 후 실행.

## 함정
- env 없이도 빌드돼야 함. /contact 는 정적 페이지라 isInquiryConfigured() 가 **빌드 시점** 값 → Vercel 에 키 추가 후 재배포해야 폼이 켜짐(그 전엔 mailto 폴백 카드).
- 폼 화면 캡처는 더미 키(URL+아무 문자열 anon/service)로 빌드해서 찍었다. 제출하면 "Invalid API key" → 에러 문구 표시가 정상.
- `CRM_FIXTURE=1 npm run dev` = lib/crm/fixture.ts 가상 데이터로 /admin 미리보기(dev 전용, 프로덕션 빌드에선 꺼짐, 쓰기 불가). 가상 데이터를 사이트 카피·캡처 자료로 쓰지 말 것.
- .field > label 규칙(padding:0)이 라벨형 버튼(.file-pick)을 덮어써서 `.field > .file-pick` 셀렉터를 추가해 둠.
- 칩(chip)은 투명 radio 가 칩 위에 덮인 구조 → Playwright 에선 getByText 클릭 대신 check("input[name=project_type][value=…]").
- 개인정보처리방침(app/privacy) 회사 정보는 상단 상수로 채우는 자리. 보유기간 1년은 purge_expired_inquiries() 와 맞춰져 있음.
- 검증: `npm run verify:supabase`(.env.local 읽음) — 테이블 7개, admins seed, private 버킷, anon 차단, 테스트 문의 insert→delete.

# 광고 전환 추적: Meta Pixel·GA4·네이버 wcslog(env 선택), Lead/Contact 이벤트, first/last touch 유입 기록

## 구조와 WHY (2026-11-10, 네이버 검색광고+Meta 2주 테스트, 목표 = 상담 문의)
- components/analytics.tsx(client, layout 에 마운트) + lib/analytics.ts. 각 트래커는 env(NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_NAVER_WCS_ID)가 있고 정규식 검증을 통과할 때만 렌더 → env 없으면 스크립트·noscript 0개. 빌드 시점 인라인이라 Vercel 에 값 넣은 뒤 **재배포** 필요. /admin 은 추적 안 함.
- 페이지뷰: Meta 는 `fbq.disablePushState=true` 로 픽셀의 자동 history PV 를 끄고 RouteTracker(usePathname+useSearchParams, Suspense)가 라우트 변경 때 직접 PageView(첫 화면은 베이스 코드가 보냄). 네이버는 wcslog.js onLoad 에서 wa 설정 → wcs.inflow("pluck.co.kr") → wcs_do(), 이후 라우트 변경마다 wcs_do(). **GA4 는 수동 page_view 를 안 보낸다** — 향상된 측정의 history 변경 PV 와 중복되기 때문.
- 전환: 문의 서버 액션이 실제 insert 했을 때만 `{status:"success", lead:true}`(honeypot 은 lead 없음) → contact-form 이 1회 trackLead(): fbq Lead, gtag generate_lead, 네이버 `wcs.trans({type:"lead"})`(공식 신 스크립트 유형 '신청완료', naver.github.io/conversion-tracking 01_script_guide_wcstrans). 구 `wcs.cnv("4","1")` 은 trans 와 중복 필터링 대상이라 쓰지 않음.
- 클릭: document 위임 리스너가 /contact 링크(cta)·tel:·mailto:·kakao.com 링크 클릭 → fbq Contact + gtag contact_click{method}. 개별 컴포넌트 수정 불필요, 새 CTA 는 /contact 로 링크만 걸면 자동 집계(또는 data-track-contact 속성). 네이버에는 클릭 전환을 안 보냄(전환 = 폼 접수만, 수치 오염 방지).
- 유입 기록: pluck_src 쿠키(30일)에 레거시 필드 + first_touch(첫 방문, 고정) + last_touch(UTM·n_*·fbclid·gclid 가 있거나 외부 referrer 인 마지막 방문; 직접 재방문은 안 덮음). 서버(lib/crm/attribution.ts sanitizeTouch)가 화이트리스트로 정리해 **기존 inquiries.source jsonb 안에** 저장 → 마이그레이션 불필요. 관리자 문의 상세 '유입 경로'와 Discord 알림 '유입' 필드에 touchSummary 표시.

## 함정
- 쿠키 4KB: 한글 n_query/n_keyword 는 인코딩 시 9배 → 3600자 넘으면 first_touch 파라미터를 버린다.
- 검증은 Playwright 로 외부 트래커 요청을 가로채 스텁(wcslog.js 는 가짜 wcs 객체) 후 fbq.queue/dataLayer/스텁 로그 확인(스크립트 C:\Temp\pluck-track). 테스트 문의는 e2e-test@pluck.co.kr 로 넣고 activity_log 와 함께 삭제.
- 개인정보처리방침에 '광고 성과 측정과 쿠키' 섹션 있음 — 트래커를 추가/교체하면 같이 갱신.

# Admin 실시간 클라이언트 구조: 단일 셸 + pushState 라우터, TanStack Query 캐시, Realtime, icn1 리전

## 구조와 WHY (2026-10-30, perf/admin-realtime)
- 오너 요청: "어드민은 SEO 불필요, 최대한 빠르게·데이터 중심·실시간 느낌". 기존 서버 렌더는 Vercel iad1(미국)→Supabase 서울 왕복이 탭마다 여러 번이라 탭 전환 중앙값 ~2.3–2.9s 였다.
- vercel.json `regions: ["icn1"]` — 함수 전체(공개 사이트 서버 액션 포함)를 서울로. Hobby 는 리전 1개만.
- /admin/* 는 전부 `app/admin/(protected)/[[...slug]]/page.tsx` 한 페이지. `_app/shell.tsx` 의 AdminRoutes 가 usePathname 으로 뷰를 고르고, 앱 내 링크(AdminLink)는 `history.pushState` → Next 가 usePathname 만 동기화하고 **서버 요청 0**. next/link 를 쓰면 RSC 왕복이 생기니 admin 안에선 쓰지 말 것.
- 데이터: inquiries/projects/clients/project_tasks/project_payments **테이블 전체**(limit 2000)를 셸 마운트 직후 병렬 prefetch, 모든 화면(대시보드 집계·상태별 카운트·검색·정렬)은 lib/crm/derive.ts 로 클라이언트 계산. 상세의 activity_log·첨부 signed URL 만 개별 쿼리(호버 시 prefetch). 데이터가 수천 건을 넘으면 페이지네이션 재검토.
- Realtime: postgres_changes 로 위 5개 테이블 캐시 패치 + activity_log INSERT 시 activity 쿼리 무효화. RLS 가 구독자별로 적용돼 admin 만 수신. 실시간이 끊긴 동안의 쓰기는 touches 테이블을 invalidate.
- **함정: channel SUBSCRIBED ≠ 변경 스트림 준비.** postgres_changes 는 서버가 system 메시지("Subscribed to PostgreSQL", extension=postgres_changes)를 보낸 뒤부터만 이벤트를 준다. 그 전에 커밋된 행은 영영 안 온다(로그인 직후 들어온 문의 누락 원인이었음). 그래서 "실시간" 표시와 catch-up refetch 는 이 system 메시지 기준. publication(0002_realtime.sql) 누락 시에도 채널 join 은 성공하니 실시간이 안 되면 publication 부터 확인.
- 쓰기: 브라우저에서 crypto.randomUUID() 로 id 를 만들어 insert → 캐시에 즉시 반영/즉시 상세로 이동, 실패 시 스냅샷 롤백 + 에러 토스트. 문의→프로젝트 전환도 클라이언트(같은 이메일 고객 재사용 판단은 캐시 기준).
- CRM_FIXTURE=1 dev 모드: layout 이 fixture 데이터를 seed 로 넘겨 캐시에 심고 fetch/realtime/쓰기를 끈다. proxy 는 fixture 모드면 통과(env 가 있을 때 login↔/admin 무한 리다이렉트 방지).

## 함정
- Next dev(Turbopack) 는 라우트 파일을 지운 직후 HMR 패닉→무한 새로고침이 날 수 있음 → dev 서버 끄고 `.next/dev` 삭제 후 재시작.
- 폼은 defaultValue 를 쓰므로 원격 변경 시 반영되도록 form key 에 행 값들을 넣어 리마운트한다.
- 성능 측정/실시간 e2e 스크립트(Playwright)는 레포 밖 임시 폴더에서 돌렸다. 테스트 문의는 email `e2e-test@pluck.co.kr` 로 넣고 activity_log 와 함께 지운다.

# CRM 영업 리드(leads): 폐업 개발사 아웃바운드, inquiries 와 분리, url dedupe, 임포트 출처

## 구조와 WHY (2026-11-02, 0003_leads.sql)
- 오너 요청 "폐업 영업": 외주 개발사가 폐업/연락두절이라 사이트·앱·ERP 를 못 고치는 회사를 찾아 먼저 연락. 스크랩한 잠재고객이라 **inquiries 에 넣지 않는다** — inquiries 는 email·동의 필수이고 인바운드 통계·Discord 알림에 섞인다. 별도 테이블 public.leads(kind = lead | competitor, campaign 기본 '폐업 개발사').
- 경쟁업체(같은 시장에서 "폐업 업체 유지보수"를 파는 곳)도 같은 테이블에 kind='competitor', status='skip' 으로 둔다. 화면에서 구분 select 로 전환.
- posted_at·quality(상/중/하)·freshness(A/B/C)·recruit_status 는 **원문 문자열 그대로**(출처마다 "2026-10-27 (5일 전)", "확인 못 함", "2019" 처럼 제각각). 정렬은 leads.tsx 의 rank 맵으로.
- RLS/realtime/activity_log 는 다른 CRM 테이블과 동일(store.tsx TABLES 에 leads 포함 → 전체 prefetch + 실시간 패치). activity_log.entity check 에 'lead' 추가. 상세 화면 없음: 목록에서 상태 select·메모 인라인 편집.

## 임포트 (재실행 안전)
- url unique index 로 dedupe(NULL 은 충돌 안 함). 임포트는 `on conflict (url) do update set col = coalesce(leads.col, excluded.col)` — **빈 칸만 채우고 상태/메모는 절대 덮지 않는다.**
- 네이버 카페 링크는 검색마다 `?art=` 토큰이 달라 같은 글이 다른 url 이 됨 → origin+pathname 으로 정규화해서 넣는다. 지식iN 은 쿼리 유지(docId).
- 1차 출처(2026-11-01, Oinzi 수집): `Documents/Oinzi/AI 작업/2026-11-01 폐업개발사 고객 리드.csv`(45, 구분 "A-위시켓 공고" 등 → source), Oinzi run `leads_naver.csv`(25, freshness 보강, 9건 신규), `2026-11-01 경쟁업체 목록.txt`(25). 결과 리드 54 + 경쟁 25.
- 함정: 경쟁업체 이맥스솔루션의 출처 url 이 리드(MES 카페 글)와 같아 unique 충돌 → 회사 사이트 url 로 넣고 원래 글은 memo 에 남김. 임포트 스크립트는 레포 밖(C:\Temp\pluck-leads)에 두고 pg 풀러 접속, 비밀번호는 env 로만.

## 연락처 컬럼·역추적 캠페인 (2026-11-02, 0004_lead_contacts.sql)
- company/website/phone/email/contact_form_url/agency/signals 추가. 리스트에 tel:/mailto:/폼 링크와 "연락처 있음" 필터.
- 캠페인 '폐업 개발사 역추적' = 사이트 하단 "Designed by/제작" 제작사 → 제작사 도메인 상태 확인 + 방치 신호(SSL 만료, ©≤2020 등)로 등급. 실제 '제작사 폐업 확인'은 일부뿐이고 대부분은 방치 신호 기반이라 콜 전에 사이트 직접 확인.
- 연락처는 회사가 공개한 사업용만. 광고성 메일·문자 대량 발송 금지(정보통신망법 제50조) → 전화/문의 폼 1:1. 수집 스크립트는 레포 밖 C:\Temp\closed-agency-leads.

# Portfolio 인벤토리: 포함/제외 판단 기준, 소스 위치, 오너 확인 대기 (docs/portfolio-inventory.md)

## 규칙 (2026-10-30, feat/portfolio-complete, 40→54)
- 전체 목록과 제외 사유는 docs/portfolio-inventory.md 가 원본. 새 레포를 검토하면 그 표에 먼저 추가한다(재조사 방지).
- 포함: 자기 커밋이 있는 실제 작업(내부 도구·실험 포함). 제외: 자기 커밋 없는 포크, 타사 사이트 클론·레퍼런스 재현물, 튜토리얼, 하루 미만 무기능 스캐폴드, 트레이딩·크립토 시그널, ibctgit, 개인 노트, 실데이터 폴더.
- 별도 GitHub 계정 spacePluck(space.pluck@gmail.com) 도 오너 것. Vercel 프로젝트 대부분이 여기에 연결돼 있고 일부 레포는 pluck-dev 로 못 읽음 → `npx vercel api "/v6/deployments?app=<name>&target=production"` 의 meta.githubCommitAuthorName 으로 작성자·기간 확인(adrock_simjae = 오너).
- 오너 확인 대기: MODOOCAR 가 고객 작업인지 자체 사업인지, 페어링 북 코드(비공개), Figma MCP 확장의 오너 커밋 위치.
- Oinzi 는 2026-10-30 현재 빌드(publish/oinzi.exe 0.9.1)를 임시 프로필로 재캡처(영상 포함). 설정·환영 화면엔 계정 이메일·사용자 경로가 보여 사용 금지. threads-scheduler shots 는 타인 핸들·아바타가 보여 사용 금지. marketing-studio 화면은 고객사(바야다) 브랜드라 사용 금지.

# Portfolio 영상·실화면 캡처: ProjectVideo 스펙, WorkVideo/CardPreview, 프로젝트 타입별 캡처 레시피

## 데이터·렌더 (2026-10-30, feat/portfolio-media)
- 갤러리 항목은 ProjectMedia = 이미지 | { type:"video", src(mp4), webm?, poster, alt, caption? }. 프로젝트 `demo?` 는 상세 히어로(커버 자리)와 홈 카드 호버 미리보기에 쓰인다. 정적 이미지 자리(홈 featured inset 등)는 mediaStill() 로 poster 사용.
- components/work-video.tsx: WorkVideo 는 next/image 포스터(children) 위에 <video> 를 겹친다 — LCP·첫 페인트는 최적화된 포스터 이미지, 재생 시작(playing) 후에만 video opacity 1 → 레이아웃 시프트 0. video 에 poster 속성을 주지 않는 이유: 원본 webp 를 한 번 더 받게 됨. IntersectionObserver(0.35)로 화면 안에서만 재생, reduced-motion 이면 자동재생 안 하고 가운데 큰 재생 버튼. 자동재생 거부(play() reject)도 큰 버튼. 일시정지 토글은 항상 있음(WCAG 2.2.2).
- CardPreview: (hover:hover)+(pointer:fine) 에서만, 첫 pointerenter 때 src 를 붙인다(preload none) → 그리드가 영상을 미리 받지 않음.
- 영상 규격: 1440x900(16:10) H.264 mp4, 오디오 없음, fps 30, crf 30, -movflags +faststart, 8–24s, 목표 ≤2.5MB(실측 0.2–1.6MB). 포스터 = 0.5s 프레임을 1600x1000 webp(첫 프레임은 회색/빈 화면일 때가 많음). 모바일 녹화는 390x844 를 1600x1000 #dfe3da 캔버스에 둥근 마스크+그림자로 합성(ffmpeg alphamerge).
- 캡션은 '로컬 실행 화면 녹화 — A → B (샘플 데이터)'처럼 출처와 데이터 성격을 밝힌다.

## 캡처 레시피 (레포 밖 C:\Temp\pmcap 하네스, playwright/sharp 는 NODE_PATH=레포 node_modules)
- 공통: 프로젝트를 C:\Temp\pmrun 으로 robocopy(.env*/node_modules/.git 제외) 후 설치·실행 → 원본 폴더·실데이터 무변경. 끝나면 포트로 PID 찾아 종료.
- Playwright recordVideo 는 size 를 viewport 와 같게(DSF2 모바일에 size 2배를 주면 왼쪽 위 1/4만 찍힘). 시작 지점은 첫 의미 있는 프레임에서 mark() 로 트림.
- WebGL(three) 앱은 headless 에서 `--enable-unsafe-swiftshader --use-angle=swiftshader --ignore-gpu-blocklist` 없으면 캔버스가 비어 보인다(jarvis).
- Supabase 앱: NEXT_PUBLIC_SUPABASE_URL 을 가짜 로컬 주소로 빌드하고 Playwright context.route 로 PostgREST(/rest/v1/<table>, eq 필터, Accept vnd.pgrst.object = single, /rpc) 를 가짜 데이터로 응답(lucky-draw). 실 DB 접속 없음.
- Postgres 앱(online-store): docker 로 임시 postgres:17 컨테이너(55432) + db/migrate.mjs, 샘플 고객 가입→모의결제(ALLOW_MOCK_PAYMENTS)로 주문 3건 만든 뒤 어드민 녹화, 끝나면 컨테이너 삭제.
- Flask(threads_auto/web): 임시 venv + DATABASE_URL=sqlite 임시 파일, 샘플 사용자·구독을 모델로 직접 생성.
- Electron 렌더러(vox-studio): out/renderer 를 정적 서빙하고 addInitScript 로 window.api 를 재귀 Proxy 스텁(목록=[], on*=unsubscribe, 샘플 보이스 2개) → 파이썬 엔진 없이 실제 UI.
- WS 로 상태를 받는 HUD(jarvis): window.__pluckyNative=true 로 WebSocket 대신 브리지 모드 → page.evaluate(pluckyPush) 로 상태 스크립트 재생. 캡션에 '데모 스크립트' 명시.
- Flutter: 임시 클론에 `flutter create . --platforms web` → `flutter build web` → python http.server. 입력은 좌표 클릭+keyboard.type(캔버스 렌더). dart:io Platform 을 쓰는 앱(OMEN)은 웹에서 즉시 크래시.
- Windows 데스크톱(Oinzi): OINZI_DATA_DIR=임시 폴더로 실행(이 env 가 있으면 Rebrand 마이그레이션이 실 AppData 를 건드리지 않음). Python 3.10(anaconda 파이썬은 _ctypes 없음) + win32gui 로 클라이언트 1600x1000 배치·클릭, 영상은 ffmpeg gdigrab 영역 녹화. 첫 화면 환영 대화상자에 Claude/Codex 계정 이메일이 보이므로 녹화 전에 닫는다.
- 라이브 사이트 녹화 시 개인 이름은 addInitScript 로 해당 텍스트 요소에 blur(5px) (rotc-seating 행사 일정의 강사 이름).

## 함정
- Python 으로 portfolio.ts 를 고칠 때 text 모드 write 는 Windows 에서 CRLF 로 바꾼다 → newline="
" 필수.
- vip-care 라이브에서 '복용 완료'를 누르면 Supabase env 누락 에러로 화면이 하얗게 된다(라이브 버그) → 녹화에서 누르지 않음.
- threads_auto web 의 /pricing 은 플랜 필드 일부가 'undefined' 로 나온다(실버그) → 캡처 미사용.

# 광고 랜딩 /lp/start (Meta 이벤트 페이지): 짧은 폼, source.form=lp-start, noindex, 크리에이티브 위치

## 구조와 WHY (2026-11-11, 오너: "보통 이벤트페이지 같은 걸로 새로 만들어서 한다")
- app/lp/start: 오퍼(기획안 초안·예상 견적·일정, 상담·견적 무료) → 할 수 있는 것 4종(포트폴리오로 뒷받침되는 것만 — 키오스크 사례는 없어 섹션엔 안 넣고 폼 칩에만 '키오스크·자동화') → pinned 8개 실화면(보령 금지) → 진행 방식 → FAQ(비용·기간은 숫자 없이 '상담 후 범위로') → 폼. 메인 nav·sitemap 에 넣지 않고 robots noindex.
- 폼은 새 백엔드 없이 app/contact/actions.ts 의 submitStartInquiry → 공용 saveInquiry(레이트리밋·insert·activity_log·Discord). 연락처 한 칸에 전화 or 이메일 → email 컬럼이 NOT NULL 이라 전화만 남기면 email = ''(관리자 화면은 '-' 표시). 칩→project_type 매핑은 lib/crm/constants.ts START_WANTS, 원래 칩 이름은 message 첫 줄 '만들고 싶은 것: …'.
- 태깅: inquiries.source.form = "lp-start" (+ source.page "/lp/start", UTM 은 기존 pluck_src 쿠키 last_touch). Discord 제목 '[이벤트 페이지]', 관리자 '접수 페이지 … (광고 이벤트 페이지)', activity_log actor public:lp-start, Lead 이벤트 content_name/form = lp-start.
- "use server" 파일은 async 함수만 export 가능 → 상수(START_WANTS 등)는 constants.ts 에.
- 모바일 하단 고정 CTA(sticky-cta.tsx)는 히어로 버튼이 화면 밖 & 폼 섹션이 화면 밖일 때만 보임.
- 광고 크리에이티브 v3(4:5·9:16 × A 오퍼/B 증거/C 업무시스템)와 카피는 레포 밖 C:\Temp\meta\v3 (HTML 원본 _tools). 랜딩 URL utm_content=A|B|C.

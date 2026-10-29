# Portfolio index: lib/portfolio.ts 데이터 규칙, 링크 검증, 클라이언트 실명

## 링크/스크린샷 규칙 (WHY)
- 링크는 "우리 레포에서 배포된 것"이 확인된 라이브 사이트만 건다. 나머지는 url 없이 CSS 타일(tile.tone/mark)로 표시.
- 연도는 각 레포 git log 첫/마지막 커밋 연도. 지표·고객사·성과를 지어내지 않는다. stats 스트립은 데이터에서 계산.
- 미공개/권한 불확실 클라이언트는 일반명으로 기재 (예: 자동차보험 딜러 정산 플랫폼 = clients/caryoung, 홈헬스케어 통합 플랫폼 = clients/bayada, AI 의사결정 시스템 제안서 = clients/nousbo).

## 검증 결과 (2026-10-29)
- boryoung.co.kr: 라이브 HTML 메타/카피가 clients/boryoung/apps/web 과 일치 → 링크 OK.
- bayadakorea.com: WordPress/Elementor 사이트, 우리 코드 아님 → 링크 금지.
- boxon.vercel.app: 스페인어 다른 서비스(타 소유) → 우리 boxon 아님, 링크 금지.
- ndrop.kr, draw.pluck.co.kr: DNS NXDOMAIN (피처드 카드/MORE TO EXPLORE 링크 죽어 있음, 오너 결정 대기).
- admin-pando.vercel.app (FitGenie): 404 → MORE TO EXPLORE 에서 제거.
- KakaoWork exporter(tools/kakaowork/upstream): 외부 작성자(kangjung) 레포라 제외.

## 스크린샷 갱신
- public/work/*.webp 는 Playwright 1440x900 캡처 → sharp 1200px webp(q78). 앱(Setflow)은 390 모바일 캡처를 어두운 캔버스에 합성.
- 몇기야는 광고 모달이 떠서 닫기 클릭 후 캡처해야 함.

## 함정
- eslint-config-next 16 의 react-hooks/set-state-in-effect 규칙: matchMedia 는 useSyncExternalStore 로 구독할 것.
- index 행 진입 애니메이션은 필터 클릭 후에만(data-animate). 초기 로드에 걸면 풀페이지 캡처/스크롤 시 흐리게 보임.

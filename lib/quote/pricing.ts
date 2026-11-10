/**
 * 개발비 30초 계산기(/lp/quote) 가격표. 오너가 직접 숫자를 고치는 곳은 이 파일 하나뿐이다.
 *
 * 출처(2026-11-11 정리): 오너가 실제로 제출한 외주 제안 금액·기간
 *   - C:\Users\SIMJAE\Desktop\구인구직\위시켓\지원내역.md (외주 19건)
 *   - C:\Users\SIMJAE\Desktop\구인구직\크몽\지원내역.md (외주 2건)
 *   상주(월 단가) 건은 제외. 제안 금액이지 계약 금액이 아니다 → 화면에는 항상 "참고 범위, 상담 후 확정".
 *
 * 유형별 기준값(base)은 같은 유형 제안들의 최저~최고(기능 포함 건은 기능 가산을 빼고 역산):
 *   homepage  컨설팅 소개 홈페이지 100만/15일 · 아임웹 갤러리 반응형 200만/30일
 *   shop      발레 학원 예약·결제 홈페이지+관리자 400만/30일 · 고깃집 홈페이지+예약/포장 주문 1,000만/37일
 *   app       웰니스 MVP 200만/30일 · 스마트팜 Flutter 앱 UI 개선 700만/30일 · 무인매장 앱 MVP 750만/45일
 *   admin     사내관리시스템 FE 리뉴얼 600만/50일 · 숙박 예약 통합관리 1,000만/45일 · 발주→협력업체 포털(SRM) 1,800만/90일
 *   platform  농산물 직거래 중개 1,000만/60일 · 택시 QR 포인트 백엔드 1,000만/60일 · 청소 견적·인력매칭 1,800만/60일
 *   automation 더존·SAP·이카운트 연동 600만/30일 · 도매몰 최저가 비교·장바구니 자동 담기 750만/45일 (키오스크 단가 근거는 아직 없음)
 * 기능 가산(features)은 위 제안 간 차이에서 잡은 값:
 *   예약·결제·관리자: 소개 홈페이지 100~200만 → 예약·결제+관리자 홈페이지 400만 (세 기능 합 약 +200~300만)
 *   앱스토어 출시(+인앱 결제): 스토어 등록·인앱 구독 연동 제안 100만/10일
 *   AI 기능: 숙박 통합관리의 AI 메시지 구축 포함 1,000만 제안 중 AI 몫으로 추정
 *   다국어: 사내관리시스템 FE 리뉴얼(언어 전환 포함) 제안에서 추정
 *   지도·위치 / 알림톡 / 회원·로그인: 매칭·예약 플랫폼 제안 범위 안에서 추정한 값(직접 단가 근거 약함 → 오너 조정 권장)
 */

export type Range = readonly [number, number];

/** 금액 단위: 만원. 기간 단위: 일. */
export const PROJECT_KINDS = {
  homepage: { label: "홈페이지·랜딩", price: [100, 200], days: [15, 30], type: "website" },
  shop: { label: "쇼핑몰", price: [400, 1000], days: [30, 40], type: "website" },
  app: { label: "앱", price: [200, 750], days: [30, 45], type: "app" },
  admin: { label: "관리자·업무 시스템", price: [600, 1800], days: [45, 90], type: "webapp" },
  platform: { label: "예약·매칭 플랫폼", price: [1000, 1800], days: [45, 60], type: "webapp" },
  automation: { label: "키오스크·자동화", price: [600, 750], days: [30, 45], type: "ai_automation" },
} as const;

/** 화면 수(대략)에 따른 배수. "보통"이 1.0. */
export const SCALES = {
  s: { label: "5개 이하", hint: "소개·랜딩 정도", factor: [0.8, 0.8] },
  m: { label: "6~15개", hint: "목록·상세·마이페이지", factor: [1, 1] },
  l: { label: "16~30개", hint: "역할별 화면이 따로", factor: [1.3, 1.5] },
  xl: { label: "30개 이상", hint: "여러 서비스를 한 번에", factor: [1.6, 2] },
  unknown: { label: "잘 모르겠어요", hint: "상담에서 같이 정해요", factor: [1, 1.3] },
} as const;

/** 기능별 가산 금액(만원)과 기간(일). */
export const FEATURES = {
  auth: { label: "회원·로그인", price: [50, 100], days: [3, 5], why: "가입·로그인·권한 관리" },
  payment: { label: "결제", price: [100, 150], days: [5, 7], why: "PG 연동·결제 취소·정산 내역" },
  booking: { label: "예약", price: [100, 150], days: [5, 10], why: "일정·인원 관리, 중복 예약 방지" },
  admin: { label: "관리자 페이지", price: [100, 200], days: [5, 10], why: "운영자가 직접 관리하는 화면" },
  store: { label: "앱스토어 출시", price: [100, 150], days: [10, 14], why: "iOS·Android 심사 대응·배포" },
  map: { label: "지도·위치", price: [50, 100], days: [3, 5], why: "지도 API·위치 검색" },
  alimtalk: { label: "카카오 알림톡", price: [30, 50], days: [2, 3], why: "템플릿 심사·발송 연동" },
  ai: { label: "AI 기능", price: [150, 300], days: [7, 14], why: "AI 모델 연동·프롬프트·비용 관리" },
  i18n: { label: "다국어", price: [50, 150], days: [3, 7], why: "언어별 문구·레이아웃 대응" },
} as const;

/** 디자인 수준 배수. */
export const DESIGNS = {
  basic: { label: "깔끔한 기본형", hint: "검증된 레이아웃 활용", factor: [0.9, 0.9] },
  custom: { label: "브랜드 맞춤 디자인", hint: "화면을 새로 디자인", factor: [1, 1.1] },
  premium: { label: "인터랙션·모션까지", hint: "인상적인 첫 화면", factor: [1.2, 1.4] },
} as const;

/** 원하는 일정. 가격엔 곱하지 않고, 짧으면 1차 오픈 범위를 나누라고 안내한다. */
export const TIMELINES = {
  asap: { label: "한 달 안", days: 30 },
  m2: { label: "1~2개월", days: 60 },
  m3: { label: "2~3개월", days: 90 },
  flexible: { label: "일정은 협의", days: null },
} as const;

export type KindKey = keyof typeof PROJECT_KINDS;
export type ScaleKey = keyof typeof SCALES;
export type FeatureKey = keyof typeof FEATURES;
export type DesignKey = keyof typeof DESIGNS;
export type TimelineKey = keyof typeof TIMELINES;

export type QuoteAnswers = {
  kind: KindKey;
  scale: ScaleKey;
  features: FeatureKey[];
  design: DesignKey;
  timeline: TimelineKey;
};

export type QuoteResult = {
  price: Range;
  weeks: Range;
  drivers: string[];
  tightTimeline: boolean;
};

const roundPrice = (value: number) => (value >= 1000 ? Math.round(value / 50) * 50 : Math.round(value / 10) * 10);

export function estimate(answers: QuoteAnswers): QuoteResult {
  const kind = PROJECT_KINDS[answers.kind];
  const scale = SCALES[answers.scale].factor;
  const design = DESIGNS[answers.design].factor;
  const features = answers.features.map((key) => FEATURES[key]);
  const addPrice = features.reduce((sum, f) => [sum[0] + f.price[0], sum[1] + f.price[1]], [0, 0]);
  const addDays = features.reduce((sum, f) => [sum[0] + f.days[0], sum[1] + f.days[1]], [0, 0]);

  const low = roundPrice((kind.price[0] + addPrice[0]) * scale[0] * design[0]);
  const high = roundPrice((kind.price[1] + addPrice[1]) * scale[1] * design[1]);
  const daysLow = (kind.days[0] + addDays[0] * 0.6) * scale[0];
  const daysHigh = (kind.days[1] + addDays[1] * 0.6) * scale[1];
  const weeks: Range = [Math.max(2, Math.round(daysLow / 7)), Math.max(3, Math.round(daysHigh / 7))];

  const drivers: string[] = [];
  if (answers.scale === "l" || answers.scale === "xl") drivers.push(`화면 수 ${SCALES[answers.scale].label} — 화면이 많을수록 기획·개발량이 늘어요`);
  const priciest = [...features].sort((a, b) => b.price[1] - a.price[1]).slice(0, 3);
  for (const f of priciest) drivers.push(`${f.label} — ${f.why}`);
  if (answers.design === "premium") drivers.push("인터랙션·모션 디자인 — 시안과 구현 시간이 더 들어요");
  if (!drivers.length) drivers.push(`${kind.label} 기본 범위 — 기능을 더하면 범위가 올라가요`);

  const target = TIMELINES[answers.timeline].days;
  return { price: [low, Math.max(low, high)], weeks, drivers, tightTimeline: target !== null && target < weeks[0] * 7 };
}

export function formatPrice(manwon: number) {
  if (manwon >= 10000) return `${(manwon / 10000).toFixed(1).replace(/\.0$/, "")}억 원`;
  return `${manwon.toLocaleString("ko-KR")}만 원`;
}

/** "480만~1,300만 원" — one unit at the end so the range doesn't wrap mid-number. */
export function formatPriceRange([low, high]: Range) {
  const part = (v: number) => (v >= 10000 ? `${(v / 10000).toFixed(1).replace(/\.0$/, "")}억` : `${v.toLocaleString("ko-KR")}만`);
  return `${part(low)}~${part(high)} 원`;
}

export function describeAnswers(answers: QuoteAnswers) {
  return [
    `만들 것: ${PROJECT_KINDS[answers.kind].label}`,
    `규모: 화면 ${SCALES[answers.scale].label}`,
    `기능: ${answers.features.length ? answers.features.map((key) => FEATURES[key].label).join(", ") : "선택 안 함"}`,
    `디자인: ${DESIGNS[answers.design].label}`,
    `일정: ${TIMELINES[answers.timeline].label}`,
  ];
}

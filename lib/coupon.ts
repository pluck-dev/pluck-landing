/**
 * /lp/go 할인권. Owner-editable offer + the code format shared by the page and the server action.
 *
 * Honest by design: everyone who opens it gets the same coupon (no lottery, odds, other prizes or
 * countdown). The code is made in the browser once and kept in localStorage, so reopening shows the
 * same coupon. The server only checks the format; the owner applies the discount at contract time.
 */
export const COUPON = {
  percent: 10,
  title: "첫 계약 10% 할인권",
  /** Days the coupon stays valid after it is issued. Keep in sync with the "발급일로부터 N일" term. */
  validDays: 30,
  /** Shown as plain text next to the envelope and on the coupon page. Edit freely. */
  terms: [
    "첫 계약 금액의 10% 할인",
    "상담 신청할 때 자동 적용",
    "발급일로부터 30일",
    "1인 1회",
    "다른 할인과 중복 불가",
  ],
} as const;

/** No 0/O, 1/I/L: readable over the phone. */
export const COUPON_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const COUPON_CODE_RE = /^PLK-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

export function isCouponCode(value: unknown): value is string {
  return typeof value === "string" && COUPON_CODE_RE.test(value);
}

/** ISO timestamp the browser stored when it issued the coupon (format check only). */
export function isCouponIssuedAt(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 40) return false;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

/** "2026. 12. 13" in Korea time. */
export function formatCouponDate(iso: string) {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}. ${get("month")}. ${get("day")}`;
}

export function couponExpiry(issuedAt: string) {
  return new Date(Date.parse(issuedAt) + COUPON.validDays * 86_400_000).toISOString();
}

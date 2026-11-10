/**
 * Ad-conversion trackers (Meta Pixel, GA4, Naver 공통 스크립트).
 *
 * Every tracker is optional: its id comes from a NEXT_PUBLIC_* env var (inlined at
 * build time) and nothing is loaded when the var is unset or malformed. The ids are
 * validated against a strict pattern because they are interpolated into inline scripts.
 * The helpers below are safe to call anywhere on the client — they no-op when the
 * tracker isn't loaded.
 */

function pick(value: string | undefined, pattern: RegExp) {
  const trimmed = value?.trim();
  return trimmed && pattern.test(trimmed) ? trimmed : null;
}

/** Meta Pixel "PLUCK 웹사이트" (ad account 1213073564078217). Public pixel id; env overrides it. */
const DEFAULT_META_PIXEL_ID = "1838757720706025";
export const META_PIXEL_ID = pick(process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID, /^\d{6,20}$/);
/** GA4 "PLUCK 웹사이트" (admin@pluck.co.kr). Public measurement id; env overrides it. The live
 * site deploys from a Vercel account this PC's CLI cannot reach, so the default lives in code. */
const DEFAULT_GA_ID = "G-D8SQBHNF5Z";
export const GA_ID = pick(process.env.NEXT_PUBLIC_GA_ID || DEFAULT_GA_ID, /^G-[A-Z0-9]{4,20}$/);
/** 네이버 공통키 (na_account_id, e.g. "s_1a2b3c4d5e6f"). */
export const NAVER_WCS_ID = pick(process.env.NEXT_PUBLIC_NAVER_WCS_ID, /^[A-Za-z0-9_]{4,40}$/);

export const ANALYTICS_ENABLED = Boolean(META_PIXEL_ID || GA_ID || NAVER_WCS_ID);

/** Root domain for wcs.inflow — landing and conversion pages share it. */
export const NAVER_INFLOW_DOMAIN = "pluck.co.kr";

type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;
type Wcs = {
  inflow?: (domain?: string) => void;
  trans?: (conv: { type: string; value?: string }) => void;
};

declare global {
  interface Window {
    fbq?: Fbq;
    gtag?: Gtag;
    dataLayer?: unknown[];
    wcs?: Wcs;
    wcs_add?: Record<string, string>;
    wcs_do?: (nasa?: unknown) => void;
  }
}

/** Trackers stay off on the internal CRM. */
export function isTrackedPath(pathname: string) {
  return !pathname.startsWith("/admin");
}

function safely(run: () => void) {
  try {
    run();
  } catch {
    // A blocked or half-loaded tracker must never break the page.
  }
}

/**
 * Client-side route change. GA4 is not called here: its enhanced measurement
 * already records history-based page changes, so a manual page_view would double count.
 */
export function trackPageView() {
  if (typeof window === "undefined") return;
  safely(() => window.fbq?.("track", "PageView"));
  safely(() => {
    if (window.wcs && window.wcs_do) window.wcs_do();
  });
}

/** Successful inquiry submission (server action confirmed the insert). */
export function trackLead(form = "contact") {
  if (typeof window === "undefined") return;
  safely(() => window.fbq?.("track", "Lead", { content_name: form }));
  safely(() => window.gtag?.("event", "generate_lead", { form }));
  // 네이버 전환 스크립트(wcs.trans) — 전환 유형 "lead" = 신청완료.
  // https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/
  safely(() => window.wcs?.trans?.({ type: "lead" }));
}

/** /lp/quote 계산기 결과 화면 도달 (전환 아님, 퍼널 확인용 커스텀 이벤트). */
export function trackQuoteResult(kind: string) {
  if (typeof window === "undefined") return;
  safely(() => window.fbq?.("trackCustom", "QuoteCalculated", { kind }));
  safely(() => window.gtag?.("event", "quote_calculated", { kind }));
}

export type ContactMethod = "cta" | "phone" | "email" | "kakao";

/** Click on a 상담하기 CTA or a phone/email/kakao link. */
export function trackContact(method: ContactMethod, label: string) {
  if (typeof window === "undefined") return;
  safely(() => window.fbq?.("track", "Contact", { content_name: method }));
  safely(() =>
    window.gtag?.("event", "contact_click", { method, link_text: label.slice(0, 60) }),
  );
}

/** Maps a clicked link to a contact method, or null when it isn't a contact link. */
export function contactMethodOf(anchor: HTMLAnchorElement): ContactMethod | null {
  const explicit = anchor.dataset.trackContact;
  if (explicit === "cta" || explicit === "phone" || explicit === "email" || explicit === "kakao") {
    return explicit;
  }
  const href = anchor.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "email";
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (/(^|\.)kakao\.com$/.test(url.hostname) || url.hostname === "kko.to") return "kakao";
  if (url.origin === window.location.origin && url.pathname === "/contact") return "cta";
  return null;
}

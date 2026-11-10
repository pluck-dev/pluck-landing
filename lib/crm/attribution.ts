import type { InquirySource, InquiryTouch } from "@/lib/supabase/types";

/**
 * Query params worth keeping per visit: UTM, Naver 검색광고 URL params (n_media,
 * n_query, n_keyword, n_ad_group, …) and the Meta/Google click ids.
 */
const PARAM_PATTERN = /^(utm_(source|medium|campaign|term|content)|n_[a-z_]{1,30}|fbclid|gclid)$/;

export function isAttributionParam(key: string) {
  return PARAM_PATTERN.test(key);
}

function clip(value: unknown, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

/** Server-side sanitising of a touch read from the (client-writable) cookie. */
export function sanitizeTouch(raw: unknown): InquiryTouch | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const at = clip(input.at, 40);
  const landing = clip(input.landing, 300);
  if (!at || !landing) return null;
  const touch: InquiryTouch = { at, landing };
  const referrer = clip(input.referrer, 300);
  if (referrer) touch.referrer = referrer;
  if (input.params && typeof input.params === "object") {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(input.params as Record<string, unknown>).slice(0, 16)) {
      const text = clip(value, 150);
      if (text && isAttributionParam(key)) params[key] = text;
    }
    if (Object.keys(params).length) touch.params = params;
  }
  return touch;
}

/** One-line channel label, e.g. "naver · cpc · 브랜드 · 키워드 개발외주" or "fbclid". */
export function touchSummary(touch: InquiryTouch | undefined | null) {
  if (!touch) return null;
  const p = touch.params ?? {};
  const parts = [p.utm_source, p.utm_medium, p.utm_campaign].filter(Boolean);
  const keyword = p.n_keyword || p.n_query || p.utm_term;
  if (keyword) parts.push(`키워드 ${keyword}`);
  if (!parts.length && p.n_media) parts.push(`네이버 광고 ${p.n_media}`);
  if (p.fbclid) parts.push("Meta 광고 클릭");
  if (p.gclid) parts.push("Google 광고 클릭");
  if (!parts.length && touch.referrer) {
    try {
      parts.push(new URL(touch.referrer).hostname);
    } catch {
      parts.push(touch.referrer);
    }
  }
  return parts.length ? parts.join(" · ") : "직접 방문";
}

export function lastTouchSummary(source: InquirySource) {
  return touchSummary(source.last_touch ?? source.first_touch);
}

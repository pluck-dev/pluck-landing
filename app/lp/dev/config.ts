/**
 * /lp/dev owner settings. Change these here only; every section reads from this file.
 */

/**
 * 카카오톡 채널 상담 URL (e.g. "https://pf.kakao.com/_xxxx/chat"). Empty = no Kakao button.
 * When filled, a yellow "카카오톡 상담" button appears in the hero and in the mobile bottom bar
 * (clicks are tracked as Contact/kakao by components/analytics.tsx automatically).
 */
export const KAKAO_URL = "";

/** Reply-time promise shown in S4, the process, the form and the thank-you state. */
export const REPLY_PROMISE = "영업일 기준 하루 안에 답장";

/** How long the free 기획안 초안·견적·일정 takes after the first call (process step 2). */
export const PLAN_PROMISE = "상담 후 영업일 기준 2~3일";

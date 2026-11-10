"use client";

import { useEffect } from "react";
import { SOURCE_COOKIE } from "@/lib/crm/constants";
import { isAttributionParam } from "@/lib/crm/attribution";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const MAX_AGE = 60 * 60 * 24 * 30;
const MAX_PARAMS = 16;
const MAX_COOKIE = 3600;

type Touch = {
  at: string;
  landing: string;
  referrer?: string;
  params?: Record<string, string>;
};

/**
 * Remembers where a visitor came from in a first-party cookie so the inquiry
 * action can attach it (inquiries.source):
 * - legacy fields: first landing / referrer / first_seen, `utm` = latest UTM set
 * - first_touch: the very first visit (kept forever)
 * - last_touch: the latest visit that carried ad params (UTM, Naver n_*, fbclid,
 *   gclid) or came from an external site
 * Direct revisits don't overwrite anything.
 */
export function SourceTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    const search = new URLSearchParams(window.location.search);

    const params: Record<string, string> = {};
    for (const [key, value] of search) {
      if (Object.keys(params).length >= MAX_PARAMS) break;
      if (value && isAttributionParam(key)) params[key] = value.slice(0, 150);
    }
    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) if (params[key]) utm[key] = params[key];
    const hasParams = Object.keys(params).length > 0;
    const hasUtm = Object.keys(utm).length > 0;

    let referrer = "";
    try {
      if (document.referrer && new URL(document.referrer).host !== window.location.host) {
        referrer = document.referrer.slice(0, 300);
      }
    } catch {
      referrer = "";
    }

    const existing = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${SOURCE_COOKIE}=`));
    let previous: Record<string, unknown> = {};
    if (existing) {
      try {
        previous = JSON.parse(decodeURIComponent(existing.split("=").slice(1).join("=")));
      } catch {
        previous = {};
      }
    }

    const isTouch = hasParams || Boolean(referrer);
    if (existing && previous.first_touch && !isTouch) return;

    const now = new Date().toISOString();
    const landing = `${window.location.pathname}${window.location.search}`.slice(0, 300);
    const touch: Touch = {
      at: now,
      landing,
      ...(referrer ? { referrer } : {}),
      ...(hasParams ? { params } : {}),
    };

    // Cookies written before first/last touch existed: rebuild the first touch from legacy fields.
    const legacyFirst: Touch | null = existing
      ? {
          at: typeof previous.first_seen === "string" ? previous.first_seen : now,
          landing: typeof previous.landing === "string" ? previous.landing : landing,
          ...(typeof previous.referrer === "string" ? { referrer: previous.referrer } : {}),
          ...(previous.utm && typeof previous.utm === "object"
            ? { params: previous.utm as Record<string, string> }
            : {}),
        }
      : null;

    const firstTouch = (previous.first_touch as Touch | undefined) ?? legacyFirst ?? touch;
    const lastTouch = isTouch ? touch : (previous.last_touch as Touch | undefined);

    const value: Record<string, unknown> = {
      landing: previous.landing ?? landing,
      referrer: previous.referrer || referrer || undefined,
      first_seen: previous.first_seen ?? now,
      utm: hasUtm ? utm : previous.utm,
      first_touch: firstTouch,
      last_touch: lastTouch,
    };

    let encoded = encodeURIComponent(JSON.stringify(value));
    if (encoded.length > MAX_COOKIE) {
      // Long Korean n_query values can blow the 4KB cookie limit: keep the latest touch intact.
      value.first_touch = { at: firstTouch.at, landing: firstTouch.landing.slice(0, 120) };
      encoded = encodeURIComponent(JSON.stringify(value));
    }
    if (encoded.length > MAX_COOKIE) return;

    document.cookie = `${SOURCE_COOKIE}=${encoded}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${
      window.location.protocol === "https:" ? "; Secure" : ""
    }`;
  }, []);

  return null;
}

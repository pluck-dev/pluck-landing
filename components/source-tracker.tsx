"use client";

import { useEffect } from "react";
import { SOURCE_COOKIE } from "@/lib/crm/constants";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Remembers where a visitor first came from (landing page, external referrer,
 * UTM params) in a first-party cookie so the inquiry action can attach it.
 * New UTM params overwrite the stored ones (last campaign touch wins).
 */
export function SourceTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) utm[key] = value.slice(0, 120);
    }
    const hasUtm = Object.keys(utm).length > 0;
    const existing = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${SOURCE_COOKIE}=`));
    if (existing && !hasUtm) return;

    let previous: Record<string, unknown> = {};
    if (existing) {
      try {
        previous = JSON.parse(decodeURIComponent(existing.split("=").slice(1).join("=")));
      } catch {
        previous = {};
      }
    }

    let referrer = "";
    try {
      if (document.referrer && new URL(document.referrer).host !== window.location.host) {
        referrer = document.referrer.slice(0, 300);
      }
    } catch {
      referrer = "";
    }

    const value = {
      landing: previous.landing ?? `${window.location.pathname}${window.location.search}`.slice(0, 300),
      referrer: previous.referrer || referrer || undefined,
      first_seen: previous.first_seen ?? new Date().toISOString(),
      utm: hasUtm ? utm : previous.utm,
    };
    document.cookie = `${SOURCE_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${
      window.location.protocol === "https:" ? "; Secure" : ""
    }`;
  }, []);

  return null;
}

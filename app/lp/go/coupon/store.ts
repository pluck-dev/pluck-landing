"use client";

import { useSyncExternalStore } from "react";
import { COUPON_ALPHABET, couponExpiry, isCouponCode, isCouponIssuedAt } from "@/lib/coupon";

/** One coupon per browser. Reopening the envelope shows this same coupon (no farming by reloading). */
export type StoredCoupon = { code: string; issuedAt: string; expiresAt: string };

const KEY = "pluck_coupon_v1";
const EVENT = "pluck-coupon";

function read(): StoredCoupon | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredCoupon>;
    if (!isCouponCode(value.code) || !isCouponIssuedAt(value.issuedAt)) return null;
    return { code: value.code, issuedAt: value.issuedAt, expiresAt: couponExpiry(value.issuedAt) };
  } catch {
    return null;
  }
}

let cache: StoredCoupon | null | undefined;
let cacheRaw: string | null = null;

function snapshot(): StoredCoupon | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Storage blocked (private mode): fall back to the in-memory coupon below.
  }
  if (cache === undefined || raw !== cacheRaw) {
    cacheRaw = raw;
    cache = raw ? read() : (memory ?? null);
  }
  return cache;
}

/** Used when localStorage is unavailable so the page still works for this visit. */
let memory: StoredCoupon | null = null;

function makeCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = "PLK-";
  for (const byte of bytes) code += COUPON_ALPHABET[byte % COUPON_ALPHABET.length];
  return code;
}

/** Returns the existing coupon, or issues one and stores it. */
export function issueCoupon(): { coupon: StoredCoupon; isNew: boolean } {
  const existing = snapshot();
  if (existing) return { coupon: existing, isNew: false };
  const issuedAt = new Date().toISOString();
  const coupon = { code: makeCode(), issuedAt, expiresAt: couponExpiry(issuedAt) };
  memory = coupon;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ code: coupon.code, issuedAt }));
  } catch {
    // Kept in memory only.
  }
  cache = undefined;
  window.dispatchEvent(new Event(EVENT));
  return { coupon, isNew: true };
}

export function isExpired(coupon: StoredCoupon, now = Date.now()) {
  return Date.parse(coupon.expiresAt) < now;
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = undefined;
      onChange();
    }
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The stored coupon right now (client only). */
export const currentCoupon = () => snapshot();

/** null on the server and before a coupon exists. */
export function useCoupon() {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

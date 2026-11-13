"use client";

import { Ticket } from "lucide-react";
import { COUPON } from "@/lib/coupon";
import { isExpired, useCoupon, type StoredCoupon } from "./store";

/** The opened coupon if it can still be used, else null. */
export function useActiveCoupon(): StoredCoupon | null {
  const coupon = useCoupon();
  return coupon && !isExpired(coupon) ? coupon : null;
}

/** "할인권 적용됨 · PLK-…" next to the quiz and in the lead form, once the envelope is open. */
export function CouponNote({ className = "" }: { className?: string }) {
  const coupon = useActiveCoupon();
  if (!coupon) return null;
  return (
    <p className={`cpn-note ${className}`}>
      <Ticket size={16} aria-hidden="true" />
      <span>
        할인권 적용됨 · <b>{coupon.code}</b>
      </span>
      <span className="go-sr">, {COUPON.title}. 신청하면 같이 접수돼요.</span>
    </p>
  );
}

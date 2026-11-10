"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ANALYTICS_ENABLED,
  contactMethodOf,
  GA_ID,
  isTrackedPath,
  META_PIXEL_ID,
  NAVER_INFLOW_DOMAIN,
  NAVER_WCS_ID,
  trackContact,
  trackPageView,
} from "@/lib/analytics";

/**
 * Loads only the trackers whose env id is set (see lib/analytics.ts). With no ids
 * this renders nothing at all. /admin is never tracked.
 */
export function Analytics() {
  const pathname = usePathname();
  if (!ANALYTICS_ENABLED || !isTrackedPath(pathname)) return null;

  return (
    <>
      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq.disablePushState=true;
fbq('init','${META_PIXEL_ID}');
fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {GA_ID && (
        <>
          <Script
            id="ga4-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {NAVER_WCS_ID && (
        // 네이버 공통 스크립트: wcslog.js → wcs_add["wa"] → wcs.inflow → wcs_do() (PV).
        // https://naver.github.io/conversion-tracking/pages/01_script_guide_wcstrans/
        <Script
          id="naver-wcs"
          src="https://wcs.naver.net/wcslog.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (!window.wcs || !NAVER_WCS_ID) return;
            window.wcs_add = window.wcs_add || {};
            window.wcs_add.wa = NAVER_WCS_ID;
            window.wcs.inflow?.(NAVER_INFLOW_DOMAIN);
            window.wcs_do?.();
          }}
        />
      )}

      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
    </>
  );
}

/** Page views on client-side navigation + delegated contact-link click tracking. */
function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const first = useRef(true);

  useEffect(() => {
    // The base codes already record the landing page view.
    if (first.current) {
      first.current = false;
      return;
    }
    if (isTrackedPath(pathname)) trackPageView();
  }, [pathname, query]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isTrackedPath(window.location.pathname)) return;
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const method = contactMethodOf(anchor);
      if (method) trackContact(method, anchor.textContent?.trim() ?? "");
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

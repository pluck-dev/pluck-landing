import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/** Everything but /admin is public. Naver (Yeti) and Daum (Daumoa) are named so their crawlers get an explicit allow. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      {
        userAgent: ["Yeti", "Daumoa", "Bingbot", "Googlebot"],
        allow: "/",
        disallow: "/admin",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}

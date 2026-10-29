import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Per-project OG images render on demand and read the cover + font files from disk.
  outputFileTracingIncludes: {
    "/work/*/opengraph-image/*": [
      "./assets/fonts/**/*",
      "./public/brand/pluck-lockup.svg",
      "./public/work/*/cover.webp",
    ],
  },
};

export default nextConfig;

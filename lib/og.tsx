import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Shared pieces for app/opengraph-image.tsx and app/work/[slug]/opengraph-image.tsx. */
export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  paper: "#f7f7f2",
  ink: "#202523",
  blue: "#335aeb",
  sage: "#e9ece5",
  text2: "#4f5a4c",
  lime: "#dbeaab",
};

/**
 * Static Noto Sans KR subsets (OFL) — Satori has no Hangul fallback and can't read
 * variable fonts. Regenerate with docs/seo/subset-og-font.py when copy adds new glyphs.
 */
export async function loadOgFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [bold, medium] = await Promise.all([
    readFile(join(dir, "NotoSansKR-OG-ExtraBold.ttf")),
    readFile(join(dir, "NotoSansKR-OG-Medium.ttf")),
  ]);
  return [
    { name: "Noto Sans KR", data: bold, weight: 800 as const, style: "normal" as const },
    { name: "Noto Sans KR", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

export async function loadPublicDataUri(path: string, mime: string) {
  const file = await readFile(join(process.cwd(), "public", path));
  return `data:${mime};base64,${file.toString("base64")}`;
}

export function OgLockup({ src, height = 44 }: { src: string; height?: number }) {
  // lockup viewBox is 414.82 x 126
  // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>
  return <img src={src} alt="" height={height} width={Math.round((height * 414.82) / 126)} />;
}

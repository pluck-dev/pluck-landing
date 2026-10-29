import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { loadOgFonts, loadPublicDataUri, OG_COLORS, OG_SIZE, OgLockup } from "@/lib/og";
import { getProject } from "@/lib/portfolio";
import { categoryPages, projectImageAlt } from "@/lib/site";

type Params = { slug: string };

/** Per-project alt text; slugs come from the page's generateStaticParams. */
export async function generateImageMetadata({ params }: { params: Params | Promise<Params> }) {
  const project = getProject((await params).slug);
  return [
    {
      id: "cover",
      size: OG_SIZE,
      contentType: "image/png",
      alt: project ? projectImageAlt(project) : "PLUCK 포트폴리오",
    },
  ];
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const project = getProject((await params).slug);
  if (!project) return new Response("Not found", { status: 404 });

  // Satori can't decode webp, so the 1600x1000 cover is re-encoded as JPEG.
  const cover = await sharp(await readFile(join(process.cwd(), "public", project.cover.src)))
    .resize(1280, 800)
    .jpeg({ quality: 82 })
    .toBuffer();
  const [fonts, lockup] = await Promise.all([
    loadOgFonts(),
    loadPublicDataUri("brand/pluck-lockup.svg", "image/svg+xml"),
  ]);
  const nameSize = project.name.length > 18 ? 46 : project.name.length > 11 ? 52 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: OG_COLORS.paper,
          fontFamily: "Noto Sans KR",
          color: OG_COLORS.ink,
          wordBreak: "keep-all",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 500,
            padding: "56px 40px 52px 60px",
          }}
        >
          <OgLockup src={lockup} height={38} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 18px",
                borderRadius: 999,
                background: OG_COLORS.lime,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {categoryPages[project.category].label}
            </div>
            <div style={{ marginTop: 22, fontSize: nameSize, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.045em" }}>
              {project.name}
            </div>
            <div style={{ marginTop: 18, fontSize: 25, fontWeight: 500, lineHeight: 1.45, color: OG_COLORS.text2 }}>
              {project.detail.oneLiner}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 21, fontWeight: 500, color: OG_COLORS.text2 }}>
            www.pluck.co.kr
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", flex: 1, paddingRight: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
          <img
            src={`data:image/jpeg;base64,${cover.toString("base64")}`}
            alt=""
            width={656}
            height={410}
            style={{ borderRadius: 22, boxShadow: "0 20px 50px rgba(32,37,35,0.18)" }}
          />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}

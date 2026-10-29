import { ImageResponse } from "next/og";
import { defaultOgImage } from "@/lib/site";
import { loadOgFonts, loadPublicDataUri, OG_COLORS, OG_SIZE, OgLockup } from "@/lib/og";

export const alt = defaultOgImage.alt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [fonts, lockup, symbol] = await Promise.all([
    loadOgFonts(),
    loadPublicDataUri("brand/pluck-lockup.svg", "image/svg+xml"),
    loadPublicDataUri("brand/pluck-symbol-3d.png", "image/png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: OG_COLORS.paper,
          fontFamily: "Noto Sans KR",
          color: OG_COLORS.ink,
          padding: "64px 72px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
        <img
          src={symbol}
          alt=""
          width={560}
          height={560}
          style={{ position: "absolute", right: -30, top: 35 }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 760 }}>
          <OgLockup src={lockup} height={48} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.05em" }}>
              <span>아이디어를 뽑아,</span>
              <span style={{ color: OG_COLORS.blue }}>제품으로.</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 32, fontWeight: 500, lineHeight: 1.45, color: OG_COLORS.text2, letterSpacing: "-0.02em" }}>
              <span>홈페이지 제작 · 앱 개발 · AI 자동화</span>
              <span>기획부터 운영까지 한 팀이 맡습니다.</span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: OG_COLORS.text2 }}>
            www.pluck.co.kr
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

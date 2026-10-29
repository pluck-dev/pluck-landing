// Renders public/brand/pluck-symbol-3d.png (2000px, transparent) + the hero poster webp.
// Run from a folder that has esbuild, playwright and sharp installed:
//   NODE_PATH=<tooldir>/node_modules node docs/brand/render-3d.js
const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");
const { chromium } = require("playwright");
const sharp = require("sharp");

const repo = path.resolve(__dirname, "../..");
const out = path.join(repo, "public/brand");

(async () => {
  const bundle = await esbuild.build({
    entryPoints: [path.join(__dirname, "still.ts")],
    bundle: true,
    write: false,
    format: "iife",
    nodePaths: [path.join(repo, "node_modules")],
    logLevel: "error",
  });
  const js = bundle.outputFiles[0].text;
  const browser = await chromium.launch({
    args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 2000, height: 2000 } });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><canvas style="display:block;width:2000px;height:2000px"></canvas></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.evaluate(() => window.renderStill(2000));
  const png = await page.locator("canvas").screenshot({ omitBackground: true });
  await browser.close();
  // Trim to content + even padding so the symbol sits centred in a square.
  const trimmed = await sharp(png).trim().toBuffer({ resolveWithObject: true });
  const { width, height } = trimmed.info;
  const side = Math.round(Math.max(width, height) * 1.12);
  const square = await sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: trimmed.data, left: Math.round((side - width) / 2), top: Math.round((side - height) / 2) }])
    .png()
    .toBuffer();
  await sharp(square).resize(2000, 2000).png({ compressionLevel: 9 }).toFile(path.join(out, "pluck-symbol-3d.png"));
  await sharp(square).resize(1200, 1200).webp({ quality: 86, alphaQuality: 90 }).toFile(path.join(out, "pluck-symbol-3d.webp"));
  for (const f of ["pluck-symbol-3d.png", "pluck-symbol-3d.webp"])
    console.log(f, fs.statSync(path.join(out, f)).size);
})();

// Shared helpers for PLUCK portfolio images. All outputs: 1600x1000 (16:10) webp, <=250KB.
// Usage (run from this folder so sharp resolves from the repo): const c = require("./compose.js");
//   await c.desktop(pngBufferOrPath, 'D:/.../public/work/<slug>/cover.webp', { position: 'top' })
//   await c.phones([buf1, buf2, buf3], outPath, { bg: '#dfe3da' })   // 1-3 mobile shots side by side
//   await c.blur(input, [{left,top,width,height}], outPngPath)       // blur regions before composing
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const W = 1600;
const H = 1000;

async function save(pipeline, out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  for (const quality of [80, 74, 68, 62, 55]) {
    const buf = await pipeline.clone().webp({ quality, effort: 5 }).toBuffer();
    if (buf.length <= 250 * 1024 || quality === 55) {
      fs.writeFileSync(out, buf);
      return { out, bytes: buf.length, quality };
    }
  }
}

/** Desktop screenshot -> cover-cropped 1600x1000. position: 'top' | 'center' | 'attention' */
async function desktop(input, out, { position = 'top' } = {}) {
  const pipeline = sharp(input).resize(W, H, { fit: 'cover', position });
  return save(pipeline, out);
}

function roundedMask(w, h, r) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`,
  );
}

/** 1-3 mobile screenshots (any height, ~390 wide) centred on a 1600x1000 canvas. */
async function phones(inputs, out, { bg = '#dfe3da', phoneHeight = 820, gap = 64 } = {}) {
  const shots = [];
  for (const input of inputs) {
    const meta = await sharp(input).metadata();
    // Crop each shot to a 9:19.5 phone viewport from the top.
    const ratio = 19.5 / 9;
    const cropH = Math.min(meta.height, Math.round(meta.width * ratio));
    const ph = phoneHeight;
    const pw = Math.round(ph / ratio);
    const img = await sharp(input)
      .extract({ left: 0, top: 0, width: meta.width, height: cropH })
      .resize(pw, ph, { fit: 'cover', position: 'top' })
      .composite([{ input: roundedMask(pw, ph, 34), blend: 'dest-in' }])
      .png()
      .toBuffer();
    shots.push({ img, pw, ph });
  }
  const total = shots.reduce((s, x) => s + x.pw, 0) + gap * (shots.length - 1);
  let x = Math.round((W - total) / 2);
  const layers = [];
  for (const s of shots) {
    const top = Math.round((H - s.ph) / 2);
    // soft shadow
    const shadowSvg = await sharp(
      Buffer.from(
        `<svg width="${s.pw + 120}" height="${s.ph + 120}"><rect x="60" y="78" width="${s.pw}" height="${s.ph}" rx="34" fill="rgba(23,39,61,0.22)"/></svg>`,
      ),
    )
      .png()
      .toBuffer();
    const shadow = await sharp(shadowSvg).blur(24).png().toBuffer();
    layers.push({ input: shadow, left: x - 60, top: top - 60 });
    layers.push({ input: s.img, left: x, top });
    x += s.pw + gap;
  }
  const pipeline = sharp({ create: { width: W, height: H, channels: 3, background: bg } }).composite(layers);
  return save(sharp(await pipeline.png().toBuffer()), out);
}

/** Blur rectangular regions (in source pixel coords). Writes a PNG you can feed to desktop()/phones(). */
async function blur(input, regions, out) {
  const base = sharp(input);
  const layers = [];
  for (const r of regions) {
    const piece = await sharp(input).extract(r).blur(18).toBuffer();
    layers.push({ input: piece, left: r.left, top: r.top });
  }
  await base.composite(layers).png().toFile(out);
  return out;
}

module.exports = { desktop, phones, blur, W, H };

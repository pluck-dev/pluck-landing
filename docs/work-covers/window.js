// node window.js <in.png> <out.webp> [bg]  — desktop-app screenshot centred on a 1600x1000 canvas.
const sharp = require('sharp');
const c = require('./compose.js');
(async () => {
  const [input, out, bg = '#dfe3da'] = process.argv.slice(2);
  const meta = await sharp(input).metadata();
  const maxW = 1360, maxH = 840;
  const scale = Math.min(maxW / meta.width, maxH / meta.height);
  const w = Math.round(meta.width * scale), h = Math.round(meta.height * scale);
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="18"/></svg>`);
  const img = await sharp(input).resize(w, h).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const shadow = await sharp(Buffer.from(`<svg width="${w + 120}" height="${h + 120}"><rect x="60" y="78" width="${w}" height="${h}" rx="18" fill="rgba(23,39,61,0.2)"/></svg>`)).blur(24).png().toBuffer();
  const left = Math.round((1600 - w) / 2), top = Math.round((1000 - h) / 2);
  const canvas = await sharp({ create: { width: 1600, height: 1000, channels: 3, background: bg } })
    .composite([{ input: shadow, left: left - 60, top: top - 60 }, { input: img, left, top }]).png().toBuffer();
  console.log(await c.desktop(canvas, out, { position: 'centre' }));
})();

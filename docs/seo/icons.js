/**
 * Favicon / app icon / logo PNGs from public/brand/pluck-symbol.svg.
 * Run from the repo root: node docs/seo/icons.js   (uses the project's sharp)
 */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "../..");
const svg = fs.readFileSync(path.join(root, "public/brand/pluck-symbol.svg"));
const PAPER = { r: 247, g: 247, b: 242, alpha: 1 };

/** Symbol centred on a square canvas; `pad` = share of the edge left empty on each side. */
async function square(size, pad, background) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await sharp(svg, { density: 1200 }).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO with PNG-encoded entries (supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

(async () => {
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const write = (rel, buf) => {
    fs.writeFileSync(path.join(root, rel), buf);
    console.log(rel, buf.length);
  };
  const favs = [];
  for (const size of [16, 32, 48]) favs.push({ size, data: await square(size, 0.04, transparent) });
  write("app/favicon.ico", ico(favs));
  write("app/icon.svg", svg);
  write("app/apple-icon.png", await square(180, 0.16, PAPER));
  write("public/brand/icon-192.png", await square(192, 0.12, PAPER));
  write("public/brand/icon-512.png", await square(512, 0.12, PAPER));
  write("public/brand/icon-maskable-512.png", await square(512, 0.22, PAPER));
  write("public/brand/pluck-logo-512.png", await square(512, 0.1, PAPER));
})();

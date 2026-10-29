// Generates public/brand/pluck-symbol.svg, -mono.svg and pluck-lockup.svg.
// Needs opentype.js + the `geist` npm package (Geist-Bold.ttf outlines the wordmark):
//   NODE_PATH=<tooldir>/node_modules node docs/brand/symbol-svg.js public/brand
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");

const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });

const BLUE = "#335aeb";
const INK = "#202523";

// Construction grid (units): stroke 26 (r = 13). Stem centreline x=24, y 20..100.
// Bowl = ring centred (48,44), centreline radius 24 -> outer 37, counter 11.
// Seed = the counter's disc (r 11), plucked out along -35deg to (94,12).
const r = 13;
const stem = { x: 24 - r, y: 20 - r, w: 2 * r, h: 80 + 2 * r };
const ring = { cx: 48, cy: 44, outer: 24 + r, inner: 24 - r };
const seed = { cx: 94, cy: 12, r: 11 };
const OFFSET = { x: 2, y: 3 }; // centres bbox x[11,105] y[1,113] in a 120 box

const circle = (cx, cy, rad, sweep = 1) =>
  `M${cx - rad} ${cy}a${rad} ${rad} 0 1 ${sweep} ${rad * 2} 0a${rad} ${rad} 0 1 ${sweep} ${-rad * 2} 0Z`;
const stemPath = () => {
  const { x, y, w, h } = stem;
  return `M${x} ${y + r}a${r} ${r} 0 0 1 ${w} 0v${h - 2 * r}a${r} ${r} 0 0 1 ${-w} 0Z`;
};
const pPath = () =>
  `${stemPath()}${circle(ring.cx, ring.cy, ring.outer)}${circle(ring.cx, ring.cy, ring.inner, 0)}`;
const seedPath = () => circle(seed.cx, seed.cy, seed.r);

function symbolGroup(pColor, seedColor) {
  return `<g transform="translate(${OFFSET.x} ${OFFSET.y})">
    <path fill="${pColor}" fill-rule="evenodd" d="${stemPath()}"/>
    <path fill="${pColor}" fill-rule="evenodd" d="${circle(ring.cx, ring.cy, ring.outer)}${circle(ring.cx, ring.cy, ring.inner, 0)}"/>
    <path fill="${seedColor}" d="${seedPath()}"/>
  </g>`;
}

const svg = (vb, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}">\n  <title>${title}</title>\n  ${body}\n</svg>\n`;

fs.writeFileSync(
  path.join(out, "pluck-symbol.svg"),
  svg("0 0 120 120", symbolGroup(BLUE, INK), "PLUCK symbol"),
);
fs.writeFileSync(
  path.join(out, "pluck-symbol-mono.svg"),
  svg("0 0 120 120", symbolGroup("currentColor", "currentColor").replace("<g ", `<g style="color:${INK}" `), "PLUCK symbol (mono)"),
);

// Lockup: symbol + "pluck" in Geist Bold outlines, tracking -0.0757em like the site wordmark.
const fontFile =
  process.env.GEIST_BOLD ||
  path.join(
    path.dirname(require.resolve("opentype.js")),
    "../../geist/dist/fonts/geist-sans/Geist-Bold.ttf",
  );
const font = opentype.parse(fs.readFileSync(fontFile).buffer);
const size = 100;
const tracking = -0.0757 * size;
const scale = size / font.unitsPerEm;
let x = 0;
let d = "";
const glyphs = font.stringToGlyphs("pluck");
glyphs.forEach((g, i) => {
  d += g.getPath(x, 0, size).toPathData(2);
  x += g.advanceWidth * scale + (i < glyphs.length - 1 ? tracking : 0);
});
const bb = font.getPath("pluck", 0, 0, size).getBoundingBox();
// Real wordmark bounds after tracking.
const wordPath = new opentype.Path();
let ww = 0;
glyphs.forEach((g, i) => {
  const p = g.getPath(ww, 0, size);
  p.commands.forEach((c) => wordPath.commands.push(c));
  ww += g.advanceWidth * scale + (i < glyphs.length - 1 ? tracking : 0);
});
const wb = wordPath.getBoundingBox(); // y1 = ascender top (negative), y2 = descender bottom
const xHeight = (font.tables.os2.sxHeight || 0.53 * font.unitsPerEm) * scale;

// Symbol sized so its height (112 grid units) spans ascender top -> descender bottom of the word.
const wordH = wb.y2 - wb.y1;
const symScale = (wordH * 1.1) / 112;
const gap = 0.24 * size;
const symW = 94 * symScale; // bbox width 105-11
const pad = 0.2 * size;
const wordX = pad + symW + gap;
const reg = font.getPath("®", 0, 0, size * 0.27).toPathData(2);
const regX = wordX + (wb.x2 - wb.x1) + 0.06 * size;
const totalW = regX + size * 0.27 + pad;
const top = wb.y1 - pad;
const totalH = wordH + 2 * pad;
const lockup = `<g transform="translate(${pad - 11 * symScale} ${wb.y2 - 113 * symScale}) scale(${symScale.toFixed(5)})">
    <path fill="${BLUE}" d="${stemPath()}"/>
    <path fill="${BLUE}" fill-rule="evenodd" d="${circle(ring.cx, ring.cy, ring.outer)}${circle(ring.cx, ring.cy, ring.inner, 0)}"/>
    <path fill="${INK}" d="${seedPath()}"/>
  </g>
  <path fill="${INK}" transform="translate(${wordX - wb.x1} 0)" d="${d}"/>
  <path fill="${INK}" transform="translate(${regX} ${wb.y1 + size * 0.2})" d="${reg}"/>`;
fs.writeFileSync(
  path.join(out, "pluck-lockup.svg"),
  svg(`0 ${top.toFixed(2)} ${totalW.toFixed(2)} ${totalH.toFixed(2)}`, lockup, "PLUCK"),
);
console.log({ wb, xHeight, symScale, totalW, totalH, bb });

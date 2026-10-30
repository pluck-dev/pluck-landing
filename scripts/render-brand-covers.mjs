// Renders the unified PLUCK brand thumbnails from lib/portfolio.ts.
//
//   npm run covers:brand              # every project with coverKind "brand"
//   npm run covers:brand -- lulla omen # only these slugs
//
// Output: public/work/<slug>/cover.webp for brand-cover projects, plus any gallery
// image that carries a `diagram` spec (1600x1000 webp, <=250KB). Needs network for Google Fonts and a
// Playwright Chromium (`npx playwright install chromium`).
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { categoryLabels, projects } from "../lib/portfolio.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1600;
const H = 1000;
const MAX_BYTES = 250 * 1024;

const tones = {
  paper: { bg: "#f4f4ef", fg: "#202523", sub: "#5d655f", line: "#20252326", dot: "#202523", p: "#335aeb", fill: "#d9eba7", onFill: "#202523", onFillSub: "#3c4540" },
  ink: { bg: "#202523", fg: "#f4f4ef", sub: "#b5bbb4", line: "#f4f4ef33", dot: "#d9eba7", p: "#335aeb", fill: "#335aeb", onFill: "#ffffff", onFillSub: "#dbe3ff" },
  blue: { bg: "#335aeb", fg: "#ffffff", sub: "#dbe3ff", line: "#ffffff40", dot: "#d9eba7", p: "#ffffff", fill: "#d9eba7", onFill: "#202523", onFillSub: "#3c4540" },
};

/** Background tone per category, so the grid reads as one system. */
const categoryTone = { client: "paper", product: "paper", app: "blue", ai: "ink" };
/** Default glyph per category; a project can override with coverMotif. */
const categoryMotif = { client: "browser", product: "browser", app: "phone", ai: "flow" };

/** HTML-escapes and glues "·" to its neighbours so a line never starts with it. */
const esc = (s, glue = true) =>
  String(s)
    .replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
    .replace(/\s*·\s*/g, (m) => (glue && m.trim() === m ? "⁠·⁠" : m));

function symbol(t, size) {
  return `<svg class="symbol" width="${size}" height="${size}" viewBox="0 0 120 120"><g transform="translate(2 3)">
  <path fill="${t.p}" d="M11 20a13 13 0 0 1 26 0v80a13 13 0 0 1 -26 0Z"/>
  <path fill="${t.p}" fill-rule="evenodd" d="M11 44a37 37 0 1 1 74 0a37 37 0 1 1 -74 0ZM37 44a11 11 0 1 0 22 0a11 11 0 1 0 -22 0Z"/>
  <path fill="${t.dot}" d="M83 12a11 11 0 1 1 22 0a11 11 0 1 1 -22 0Z"/></g></svg>`;
}

/** Line-art glyphs in a 560x640 box. Shapes only, never fake UI content. */
function glyph(motif, t) {
  const s = `fill="none" stroke="${t.fg}" stroke-opacity="0.9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
  const faint = `fill="none" stroke="${t.line}" stroke-width="5" stroke-linecap="round"`;
  switch (motif) {
    case "phone":
      return `<rect x="150" y="40" width="300" height="560" rx="54" ${s}/>
        <rect x="250" y="70" width="100" height="22" rx="11" fill="${t.fg}" fill-opacity="0.9"/>
        <circle cx="300" cy="300" r="92" fill="${t.fill}"/>
        <path d="M210 470h180M240 520h120" ${faint}/>`;
    case "window":
      return `<rect x="30" y="110" width="500" height="400" rx="28" ${s}/>
        <path d="M30 180h500" ${s}/><circle cx="76" cy="145" r="9" fill="${t.fg}"/><circle cx="108" cy="145" r="9" fill="${t.fg}" fill-opacity="0.5"/>
        <path d="M170 180v330" ${faint}/>
        <circle cx="350" cy="345" r="80" fill="${t.fill}"/>`;
    case "terminal":
      return `<rect x="30" y="130" width="500" height="380" rx="28" ${s}/>
        <path d="M110 270l70 55l-70 55" ${s} stroke-width="9"/>
        <rect x="220" y="372" width="130" height="16" rx="8" fill="${t.fill}"/>
        <path d="M30 200h500" ${faint}/>`;
    case "browser":
      return `<rect x="20" y="120" width="520" height="400" rx="28" ${s}/>
        <path d="M20 190h520" ${s}/><circle cx="66" cy="155" r="9" fill="${t.fg}"/><circle cx="98" cy="155" r="9" fill="${t.fg}" fill-opacity="0.5"/><circle cx="130" cy="155" r="9" fill="${t.fg}" fill-opacity="0.25"/>
        <circle cx="280" cy="355" r="96" fill="${t.fill}"/>`;
    case "flow":
    default:
      return `<path d="M90 140C260 140 260 320 420 320M90 320H420M90 500C260 500 260 320 420 320" ${faint}/>
        <circle cx="90" cy="140" r="34" ${s}/><circle cx="90" cy="320" r="34" ${s}/><circle cx="90" cy="500" r="34" ${s}/>
        <circle cx="440" cy="320" r="84" fill="${t.fill}"/>`;
  }
}

const page = (t, body) => `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@500;600&family=Noto+Sans+KR:wght@500;700;800&display=block">
<style>
*{margin:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:${t.bg};color:${t.fg};font-family:Geist,"Noto Sans KR",sans-serif;position:relative;word-break:keep-all;-webkit-font-smoothing:antialiased}
.copy{position:absolute;left:104px;top:120px;width:780px}
.name{text-wrap:balance;font-family:"Noto Sans KR",sans-serif;font-weight:800;letter-spacing:-0.035em;line-height:1.08}
.line{text-wrap:balance;margin-top:34px;font-family:"Noto Sans KR",sans-serif;font-weight:500;font-size:40px;line-height:1.4;letter-spacing:-0.02em;color:${t.sub};max-width:740px}
.meta{position:absolute;left:104px;bottom:96px;font-family:Geist,"Noto Sans KR",sans-serif;font-weight:500;font-size:30px;letter-spacing:-0.01em;color:${t.sub}}
.glyph{position:absolute;right:96px;top:170px}
.symbol{position:absolute;right:96px;bottom:84px}
.diagram-title{white-space:pre-line;position:absolute;left:104px;top:120px;width:1100px;font-family:"Noto Sans KR",sans-serif;font-weight:800;font-size:76px;line-height:1.15;letter-spacing:-0.035em}
.steps{position:absolute;left:104px;right:104px;top:400px;display:flex;align-items:stretch;gap:20px}
.steps.flow{gap:0}
.step{flex:1 1 0;min-width:0;min-height:300px;padding:36px 32px;border-radius:28px;border:3px solid ${t.line};font-family:"Noto Sans KR",sans-serif;letter-spacing:-0.02em}
.step h3{font-weight:800;font-size:34px;line-height:1.3}
.step p{margin-top:16px;font-weight:500;font-size:24px;line-height:1.5;color:${t.sub}}
.step.last{background:${t.fill};border-color:${t.fill};color:${t.onFill}}
.step.last p{color:${t.onFillSub}}
.link{flex:0 0 40px;align-self:center;height:3px;background:${t.line}}
</style></head><body>${body}</body></html>`;

function coverHtml(project) {
  const t = tones[categoryTone[project.category]];
  const motif = project.coverMotif ?? categoryMotif[project.category];
  const year = project.years[0] === project.years[1] ? project.years[0] : `${project.years[0]}–${project.years[1]}`;
  return page(
    t,
    `<div class="copy"><h1 class="name">${esc(project.name)}</h1><p class="line">${esc(project.detail.oneLiner)}</p></div>
     <svg class="glyph" width="560" height="640" viewBox="0 0 560 640">${glyph(motif, t)}</svg>
     <p class="meta">${esc(categoryLabels[project.category])} · ${year}</p>
     ${symbol(t, 88)}`,
  );
}

function diagramHtml(project, diagram) {
  const t = tones[categoryTone[project.category]];
  const last = diagram.items.length - 1;
  const items = diagram.items
    .map(
      (item, i) =>
        `${diagram.flow && i ? '<span class="link"></span>' : ""}<div class="step${diagram.flow && i === last ? " last" : ""}"><h3>${esc(item.title, false)}</h3>${item.text ? `<p>${esc(item.text, false)}</p>` : ""}</div>`,
    )
    .join("");
  return page(
    t,
    `<h2 class="diagram-title">${esc(diagram.title)}</h2><div class="steps${diagram.flow ? " flow" : ""}">${items}</div>
     <p class="meta">${esc(project.name)}</p>${symbol(t, 88)}`,
  );
}

/** Shrinks the project name until it fits in at most three lines of the copy column. */
async function fitName(tab) {
  await tab.evaluate(() => {
    const el = document.querySelector(".name");
    if (!el) return;
    for (let size = 124; size >= 64; size -= 4) {
      el.style.fontSize = `${size}px`;
      const lines = Math.round(el.getBoundingClientRect().height / (size * 1.08));
      const overflow = el.scrollWidth > el.clientWidth;
      if (lines <= (size > 96 ? 2 : 3) && !overflow) break;
    }
  });
}

async function shoot(tab, html, out) {
  await tab.setContent(html, { waitUntil: "networkidle" });
  await tab.evaluate(() => document.fonts.ready);
  await fitName(tab);
  const png = await tab.screenshot({ type: "png" });
  let quality = 90;
  let webp;
  do {
    webp = await sharp(png).resize(W, H).webp({ quality, effort: 6 }).toBuffer();
    quality -= 6;
  } while (webp.length > MAX_BYTES && quality > 40);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, webp);
  console.log(`${out.slice(root.length + 1)}  ${(webp.length / 1024).toFixed(0)}KB`);
}

const only = new Set(process.argv.slice(2));
const targets = projects.filter(
  (p) => (p.coverKind === "brand" || p.gallery.some((image) => image.diagram)) && (!only.size || only.has(p.slug)),
);
if (!targets.length) {
  console.error("No brand-cover or diagram projects matched.");
  process.exit(1);
}

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
try {
  for (const project of targets) {
    if (project.coverKind === "brand") await shoot(tab, coverHtml(project), join(root, "public", project.cover.src));
    for (const image of project.gallery) {
      if (image.diagram) await shoot(tab, diagramHtml(project, image.diagram), join(root, "public", image.src));
    }
  }
} finally {
  await browser.close();
}

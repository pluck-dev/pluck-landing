/**
 * Draws the receipt's paper (behind the DOM text), the stamp tool + ink (over the text, multiply)
 * and the printer (in front of the paper's top edge). Everything is a function of the pose.
 */
import { DEG } from "../paper/ease";
import {
  begin,
  dprOf,
  drawInk,
  drawStampTool,
  fibers,
  makeStampTool,
  offscreen,
  PAPER,
  rubberStamp,
  type StampTool,
} from "../paper/draw";
import type { ReceiptLayout, ReceiptPose } from "./scene";

/** Canvas bleed around the paper (shadow, curl), around the ink layer (stamp tool) and the printer. */
export const BLEED = 18;
export const INK_BLEED = 96;
export const PRINTER = { side: 22, height: 64, slot: 40, body: 30 };

const STAMP_W = 80;
const STAMP_H = 46;

const tri = (x: number, period: number) => Math.abs(((x / period) % 1) * 2 - 1);

export class ReceiptPainter {
  private dpr = dprOf();
  private sheet: HTMLCanvasElement;
  private ink: ReturnType<typeof rubberStamp> | null = null;
  private tool: StampTool | null = null;
  private printerFace: HTMLCanvasElement;

  constructor(
    private L: ReceiptLayout,
    private canvases: { paper: HTMLCanvasElement; ink: HTMLCanvasElement; printer: HTMLCanvasElement },
    font: string,
  ) {
    const { W, H } = L;
    const { canvas, g } = offscreen(W, H + 12);
    g.fillStyle = PAPER;
    g.fillRect(0, 0, W, H + 12);
    fibers(g, 0, 0, W, H + 12, 31, 60);
    // Thermal paper: a faint warm cast along the long edges.
    g.fillStyle = "rgba(150,130,90,0.05)";
    g.fillRect(0, 0, 3, H + 12);
    g.fillRect(W - 3, 0, 3, H + 12);
    this.sheet = canvas;

    if (L.coupon >= 0) {
      const u = STAMP_W / 30;
      this.ink = rubberStamp({
        w: STAMP_W,
        h: STAMP_H,
        u,
        font,
        lines: [
          { text: "첫 계약", size: 2.9, weight: 700, y: 0.33 },
          { text: "−10%", size: 6.4, weight: 800, y: 0.68, spacing: 0.1 },
          { text: "PLUCK", size: 2.1, weight: 800, y: 0.87, spacing: 0.3 },
        ],
        seed: 17,
        specks: 220,
        stripeAt: 0.7,
      });
      this.tool = makeStampTool(STAMP_W, STAMP_H, 5);
    }
    this.printerFace = this.makePrinter(font);
  }

  private makePrinter(font: string) {
    const { W } = this.L;
    const PW = W + PRINTER.side * 2 - 4;
    const { canvas, g } = offscreen(PW, PRINTER.body + 2);
    const bh = PRINTER.body;
    // Body: matte ink-coloured plastic, a slightly lighter top face, darker front lip with the slot.
    g.fillStyle = "#2a2f2d";
    g.beginPath();
    g.roundRect(0, 0, PW, bh, [10, 10, 6, 6]);
    g.fill();
    g.fillStyle = "#323836";
    g.beginPath();
    g.roundRect(1, 1, PW - 2, bh * 0.52, [9, 9, 2, 2]);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.07)";
    g.fillRect(10, 1.5, PW - 20, 1);
    // Front lip + slot.
    g.fillStyle = "#1d2120";
    g.fillRect(4, bh - 9, PW - 8, 7);
    g.fillStyle = "#0e100f";
    g.fillRect((PW - W - 8) / 2, bh - 5, W + 8, 3);
    g.fillStyle = "rgba(255,255,255,0.13)";
    g.fillRect((PW - W - 8) / 2, bh - 2, W + 8, 1);
    // Screws, a printed name and a dim status lamp (not lit up: it's matte, like the rest).
    for (const x of [9, PW - 9]) {
      g.fillStyle = "#454b48";
      g.beginPath();
      g.arc(x, bh * 0.3, 2.2, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#1b1e1d";
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(x - 1.4, bh * 0.3);
      g.lineTo(x + 1.4, bh * 0.3);
      g.stroke();
    }
    g.fillStyle = "rgba(244,242,232,0.55)";
    g.font = `800 8px ${font}`;
    const spaced = g as CanvasRenderingContext2D & { letterSpacing?: string };
    if ("letterSpacing" in g) spaced.letterSpacing = "1.5px";
    g.fillText("PLUCK", 20, bh * 0.38);
    if ("letterSpacing" in g) spaced.letterSpacing = "0px";
    g.fillStyle = "#a8c08a";
    g.beginPath();
    g.arc(PW - 22, bh * 0.3, 2.4, 0, Math.PI * 2);
    g.fill();
    // Grille.
    g.strokeStyle = "rgba(0,0,0,0.35)";
    g.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(PW - 60 + i * 5, bh * 0.2);
      g.lineTo(PW - 60 + i * 5, bh * 0.44);
      g.stroke();
    }
    return canvas;
  }

  /** Paper outline: top (straight in the slot, serrated once cut), sides, serrated bottom that curls. */
  private paperPath(g: CanvasRenderingContext2D, P: ReceiptPose) {
    const { W } = this.L;
    const len = P.len;
    const curlAt = (x: number) => P.curl * (4 + 9 * ((x - W / 2) / (W / 2)) ** 2);
    g.beginPath();
    if (P.detached) {
      for (let x = 0; x <= W; x += 1) g.lineTo(x, -1.8 * tri(x, 6));
    } else {
      g.moveTo(0, -4);
      g.lineTo(W, -4);
    }
    for (let x = W; x >= 0; x -= 1) g.lineTo(x, len - curlAt(x) - 2 * tri(x + 3, 7));
    g.closePath();
  }

  drawPaper(P: ReceiptPose) {
    const { W, H } = this.L;
    const canvas = this.canvases.paper;
    const g = begin(canvas, W + BLEED * 2, H + BLEED * 2 + 12, this.dpr);
    g.translate(BLEED, BLEED);
    if (P.len <= 0.5) return;

    // Contact shadow; the curled bottom lifts off the table, so its shadow reaches further down.
    g.save();
    g.filter = `blur(${(4 + 4 * P.curl).toFixed(1)}px)`;
    g.fillStyle = "rgba(32,37,35,0.17)";
    g.translate(1.5, 3 + 8 * P.curl);
    this.paperPath(g, P);
    g.fill();
    g.restore();

    g.save();
    this.paperPath(g, P);
    g.clip();
    g.drawImage(this.sheet, 0, 0, W, H + 12);
    if (P.shade > 0) {
      const shade = g.createLinearGradient(0, 0, 0, 14);
      shade.addColorStop(0, `rgba(32,37,35,${(0.26 * P.shade).toFixed(3)})`);
      shade.addColorStop(1, "rgba(32,37,35,0)");
      g.fillStyle = shade;
      g.fillRect(0, -4, W, 18);
    }
    if (P.curl > 0) {
      // Curled-up end: catches light, then turns away at the very edge.
      const c = 40 * P.curl;
      const band = g.createLinearGradient(0, P.len - c - 6, 0, P.len);
      band.addColorStop(0, "rgba(255,255,252,0)");
      band.addColorStop(0.55, `rgba(255,255,252,${(0.6 * P.curl).toFixed(3)})`);
      band.addColorStop(0.85, `rgba(200,190,160,${(0.18 * P.curl).toFixed(3)})`);
      band.addColorStop(1, `rgba(120,108,80,${(0.3 * P.curl).toFixed(3)})`);
      g.fillStyle = band;
      g.fillRect(0, P.len - c - 6, W, c + 8);
    }
    g.restore();
    g.strokeStyle = "rgba(32,37,35,0.12)";
    g.lineWidth = 1;
    this.paperPath(g, P);
    g.stroke();
  }

  drawInkLayer(P: ReceiptPose) {
    const { W, H, stamp: at } = this.L;
    const g = begin(this.canvases.ink, W + INK_BLEED * 2, H + INK_BLEED * 2, this.dpr);
    const s = P.stamp;
    if (!s || !this.ink || !this.tool) return;
    g.translate(INK_BLEED, INK_BLEED);
    const rot = -12 * DEG;
    if (s.ink) drawInk(g, this.ink, STAMP_W, STAMP_H, { x: at.x, y: at.y, rot, k: s.spread });
    drawStampTool(g, this.tool, {
      x: at.x + s.dx,
      y: at.y + s.dy,
      height: s.h,
      rot: s.rot,
      sx: s.sx,
      sy: s.sy,
      alpha: s.alpha,
    });
  }

  drawPrinter(P: ReceiptPose) {
    const { W } = this.L;
    const cw = W + PRINTER.side * 2;
    const g = begin(this.canvases.printer, cw, PRINTER.height, this.dpr);
    if (P.printer.alpha <= 0) return;
    const PW = cw - 4;
    const bottom = PRINTER.slot + 2;
    g.globalAlpha = P.printer.alpha;
    g.translate(2, P.printer.y);
    // Shadow on the table under the printer.
    g.save();
    g.filter = "blur(5px)";
    g.fillStyle = "rgba(32,37,35,0.22)";
    g.beginPath();
    g.roundRect(4, bottom - PRINTER.body + 8, PW - 8, PRINTER.body - 2, 10);
    g.fill();
    g.restore();
    // Squash on landing, anchored at the bottom (where it meets the table).
    g.translate(0, bottom);
    g.scale(1 + (1 - P.printer.sy) * 0.6, P.printer.sy);
    g.drawImage(this.printerFace, 0, -PRINTER.body, PW, PRINTER.body + 2);
  }

  draw(P: ReceiptPose) {
    this.drawPaper(P);
    this.drawInkLayer(P);
    this.drawPrinter(P);
  }
}

/**
 * 엑셀 → 실제 화면: a printed spreadsheet (clearly stamped 예시) lies over the 카영 screenshot and is
 * crumpled and pushed away as the visitor scrolls. Pure function of p (scroll progress, 0→1):
 *
 *   0    → 0.1    the printout lies flat on the screenshot, a little askew
 *   0.08 → 0.58   crumple: creases bulge first (noise envelope sin π·c), then the sheet pulls into a
 *                 ball (inOutCubic), turning with the pull, each facet shaded by its own normal
 *   0.55 → 0.92   the ball rolls away to the left, off the screenshot (inCubic travel, roll = distance / R)
 *   0.42 → 0.8    the screenshot settles: rises out of the table (outBack) and gains a slight shadow
 *   0.72          landing beat (sound, vibration, small shake: time-based, see go-crumple.tsx)
 *
 * The paper is a mesh (NX×NY vertices) texture-mapped with affine triangles, so creases are real
 * folds of the printed sheet, not an overlay.
 */
import { clamp, DEG, inCubic, inOutCubic, lerp, outBack, outCubic, rng, seg } from "../paper/ease";

export const NX = 9;
export const NY = 6;
export const BEAT = 0.72;

export type Mesh = {
  /** Rest positions (sheet space, centred), texture coords (0..1), ball targets, crease noise, normals. */
  rest: Float32Array;
  uv: Float32Array;
  ball: Float32Array;
  noise: Float32Array;
  normal: Float32Array;
  depth: Float32Array;
  tris: Uint16Array;
};

export function makeMesh(w: number, h: number, seed = 13): Mesh {
  const n = NX * NY;
  const r = rng(seed);
  const rest = new Float32Array(n * 2);
  const uv = new Float32Array(n * 2);
  const ball = new Float32Array(n * 2);
  const noise = new Float32Array(n * 2);
  const normal = new Float32Array(n * 3);
  const depth = new Float32Array(n);
  const R = Math.min(w, h) * 0.3;
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const k = j * NX + i;
      // Slightly irregular grid so folds don't line up like a table.
      const ju = i === 0 || i === NX - 1 ? 0 : (r() - 0.5) * 0.06;
      const jv = j === 0 || j === NY - 1 ? 0 : (r() - 0.5) * 0.08;
      const u = i / (NX - 1) + ju;
      const v = j / (NY - 1) + jv;
      uv[k * 2] = u;
      uv[k * 2 + 1] = v;
      const x = (u - 0.5) * w;
      const y = (v - 0.5) * h;
      rest[k * 2] = x;
      rest[k * 2 + 1] = y;
      // Ball: edge vertices wrap around the outside, inner ones fold in.
      const a = Math.atan2(y / h, x / w) + (r() - 0.5) * 0.9;
      const edge = Math.max(Math.abs(u - 0.5), Math.abs(v - 0.5)) * 2;
      const rr = R * (0.45 + 0.5 * edge + r() * 0.25);
      ball[k * 2] = Math.cos(a) * rr;
      ball[k * 2 + 1] = Math.sin(a) * rr * 0.92;
      noise[k * 2] = (r() - 0.5) * 2;
      noise[k * 2 + 1] = (r() - 0.5) * 2;
      const nx = (r() - 0.5) * 2;
      const ny = (r() - 0.5) * 2;
      const nz = 0.35 + r() * 0.65;
      const len = Math.hypot(nx, ny, nz);
      normal[k * 3] = nx / len;
      normal[k * 3 + 1] = ny / len;
      normal[k * 3 + 2] = nz / len;
      depth[k] = r();
    }
  }
  const tris: number[] = [];
  for (let j = 0; j < NY - 1; j++) {
    for (let i = 0; i < NX - 1; i++) {
      const a = j * NX + i;
      const b = a + 1;
      const c = a + NX;
      const d = c + 1;
      // Alternate the diagonal so the facets don't all lean the same way.
      if ((i + j) % 2) tris.push(a, b, d, a, d, c);
      else tris.push(a, b, c, b, d, c);
    }
  }
  return { rest, uv, ball, noise, normal, depth, tris: new Uint16Array(tris) };
}

export type CrumplePose = ReturnType<typeof pose>;

/** w,h = sheet size; fw,fh = screenshot frame size (the ball rolls out past it). */
export function pose(p: number, M: Mesh, w: number, h: number, fw: number, fh: number) {
  const c = seg(p, 0.08, 0.58);
  const pull = inOutCubic(c);
  const creases = Math.sin(Math.PI * Math.min(1, c * 1.25)) * (1 - pull * 0.6);
  const amp = Math.min(w, h) * 0.13;
  const n = NX * NY;
  const pts = new Float32Array(n * 2);
  for (let k = 0; k < n; k++) {
    const x = lerp(M.rest[k * 2], M.ball[k * 2], pull);
    const y = lerp(M.rest[k * 2 + 1], M.ball[k * 2 + 1], pull);
    pts[k * 2] = x + M.noise[k * 2] * amp * creases;
    pts[k * 2 + 1] = y + M.noise[k * 2 + 1] * amp * creases;
  }

  // Facet shading: flat paper (normal = z) → each vertex's crumpled normal; light from top-left.
  const bend = Math.min(1, c * 1.6) ** 0.8;
  const L = [-0.42, -0.58, 0.7];
  const tris = M.tris;
  const shade = new Float32Array(tris.length / 3);
  const order: number[] = [];
  const z = new Float32Array(tris.length / 3);
  for (let t = 0; t < tris.length / 3; t++) {
    let nx = 0;
    let ny = 0;
    let nz = 0;
    let dz = 0;
    for (let q = 0; q < 3; q++) {
      const k = tris[t * 3 + q];
      nx += M.normal[k * 3] * bend;
      ny += M.normal[k * 3 + 1] * bend;
      nz += lerp(1, M.normal[k * 3 + 2], bend);
      dz += M.depth[k];
    }
    const len = Math.hypot(nx, ny, nz) || 1;
    shade[t] = (nx * L[0] + ny * L[1] + nz * L[2]) / len;
    z[t] = dz * c + t * 1e-4;
    order.push(t);
  }
  order.sort((a, b) => z[a] - z[b]);

  // Sheet transform: askew at rest, turns while crumpling, rolls away after.
  const travel = inCubic(seg(p, 0.55, 0.92));
  const R = Math.min(w, h) * 0.3;
  const dx = -(fw * 0.5 + R * 2.4) * travel;
  const dy = fh * 0.18 * travel;
  const roll = -Math.hypot(dx, dy) / Math.max(20, R);
  // Turning follows the pull (a wide sheet turned early would swing far out of the frame).
  const rot = -2.5 * DEG + 34 * DEG * inOutCubic(seg(c, 0.15, 1)) + roll;
  const alpha = 1 - seg(p, 0.86, 0.97);
  // Lifted off the table while it's a ball: shadow tightens under it.
  const lift = Math.sin(Math.PI * clamp(c * 1.1)) * 0.6 + pull * 0.4;

  // Screenshot settle (outBack) and its shadow.
  const settle = outBack(seg(p, 0.42, 0.78), 1.4);
  const shot = {
    y: lerp(8, 0, settle),
    scale: lerp(0.97, 1, settle),
    shadow: outCubic(seg(p, 0.5, 0.8)),
  };

  return { p, c, pts, shade, order, dx, dy, rot, alpha, lift, pull, shot, covered: p < 0.5 };
}

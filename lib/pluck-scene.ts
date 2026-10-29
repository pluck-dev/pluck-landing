/**
 * PLUCK hero scene (vanilla three, client-only — import dynamically).
 *
 * Dozens of PLUCK symbols + two companion primitives cut from the symbol (the
 * ring bowl and the pill stem) float on springs, repel each other and get
 * shoved by the pointer. Scroll progress `p` (0..1) swirls them onto the
 * skeleton of one big symbol, which then materialises (noise dissolve) as
 * the small ones shrink into it.
 *
 * Draw calls: 4 instanced meshes + big symbol (2) + shadow pass (desktop).
 */
import {
  CapsuleGeometry,
  Color,
  DirectionalLight,
  Euler,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Scene,
  ShadowMaterial,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  BLUE,
  INK,
  LIME,
  PAPER,
  SYMBOL,
  bodyGeometry,
  seedGeometry,
} from "@/lib/pluck-symbol-3d";

type Kind = 0 | 1 | 2; // 0 symbol, 1 ring, 2 pill

type Body = {
  kind: Kind;
  index: number; // index inside its instanced mesh
  pos: Vector3;
  vel: Vector3;
  anchor: Vector3;
  home: Vector3; // scattered resting anchor
  slot: Vector3; // position on the big symbol skeleton
  q: Quaternion;
  homeQ: Quaternion;
  spin: Vector3;
  base: number; // size before viewport scaling
  size: number;
  radius: number;
  phase: number;
};

export type PluckScene = {
  setProgress(p: number): void;
  setPointer(clientX: number, clientY: number, active: boolean): void;
  /** Viewport rect of the DOM copy; bodies keep out of it while idle. */
  setCopyRect(rect: { left: number; top: number; right: number; bottom: number } | null): void;
  resize(): void;
  start(): void;
  stop(): void;
  dispose(): void;
  /** Resolves after the first frame has been drawn. */
  ready: Promise<void>;
};

export type SceneOptions = { mobile: boolean };

/* deterministic rng so SSR poster and live scene feel related run-to-run */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createPluckScene(
  canvas: HTMLCanvasElement,
  { mobile }: SceneOptions,
): PluckScene {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  const shadows = !mobile;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.035);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.8;
  room.dispose?.();
  pmrem.dispose();

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  const CAM_Z = 18;
  camera.position.set(0, 0, CAM_Z);

  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-6, 9, 12);
  key.castShadow = shadows;
  if (shadows) {
    key.shadow.mapSize.set(1024, 1024);
    const c = key.shadow.camera;
    c.left = -14;
    c.right = 14;
    c.top = 10;
    c.bottom = -10;
    c.near = 1;
    c.far = 40;
    key.shadow.radius = 6;
    key.shadow.bias = -0.0008;
  }
  scene.add(key);
  const rim = new DirectionalLight(0xdfe8ff, 0.9);
  rim.position.set(8, -4, 6);
  scene.add(rim);

  const ground = new Mesh(
    new PlaneGeometry(80, 50),
    new ShadowMaterial({ color: 0x1c2a55, opacity: 0.11 }),
  );
  ground.position.z = -4.2;
  ground.receiveShadow = shadows;
  ground.visible = shadows;
  scene.add(ground);

  /* ---------- materials ---------- */
  const gloss = new MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.26,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });

  /* ---------- counts / geometry ---------- */
  const detail = 2;
  const counts = mobile
    ? { sym: 13, ring: 6, pill: 6 }
    : { sym: 24, ring: 10, pill: 12 };
  const bodyGeo = bodyGeometry(detail);
  const seedGeo = seedGeometry(detail);
  const ringGeo = new TorusGeometry(SYMBOL.ring.R, SYMBOL.tube, 6 * detail, 18 * detail);
  const pillGeo = new CapsuleGeometry(
    SYMBOL.tube,
    SYMBOL.stem.y1 - SYMBOL.stem.y0,
    3 * detail,
    8 * detail,
    1,
  );

  const mk = (geo: BufferGeometry, n: number) => {
    const m = new InstancedMesh(geo, gloss, n);
    m.instanceMatrix.setUsage(DynamicDrawUsage);
    m.castShadow = shadows;
    m.frustumCulled = false;
    scene.add(m);
    return m;
  };
  const symMesh = mk(bodyGeo, counts.sym);
  const seedMesh = mk(seedGeo, counts.sym);
  const ringMesh = mk(ringGeo, counts.ring);
  const pillMesh = mk(pillGeo, counts.pill);

  /* big symbol: hi-res, materialises with a noise dissolve driven by uP */
  const uniforms = { uP: { value: 0 }, uTime: { value: 0 } };
  const bigMat = (base: Color) => {
    const m = new MeshPhysicalMaterial({
      color: base,
      roughness: 0.22,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uP = uniforms.uP;
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vObj;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvObj = position;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
varying vec3 vObj;
uniform float uP;
uniform float uTime;
float h3(vec3 p){ p = fract(p*0.3183099+0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=0.5, s=0.0; for(int k=0;k<4;k++){ s+=a*vnoise(p); p*=2.03; a*=0.5; } return s; }`,
        )
        .replace(
          "#include <clipping_planes_fragment>",
          `#include <clipping_planes_fragment>
  // reveal derives from p: 0 before 0.6, 1 after 0.82
  float reveal = smoothstep(0.6, 0.82, uP);
  float n = fbm(vObj*1.6 + vec3(0.0, 0.0, uTime*0.05));
  float edge = reveal*1.12 - n;
  if (edge < 0.0) discard;`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
  totalEmissiveRadiance += vec3(0.85,0.92,0.66) * (1.0 - smoothstep(0.0, 0.06, edge)) * 2.2 * step(reveal, 0.995);`,
        );
    };
    return m;
  };
  const bigBodyGeo = bodyGeometry(4);
  const bigSeedGeo = seedGeometry(4);
  const bigBody = new Mesh(bigBodyGeo, bigMat(BLUE));
  const bigSeed = new Mesh(bigSeedGeo, bigMat(INK));
  const big = new Object3D();
  big.add(bigBody, bigSeed);
  bigBody.castShadow = bigSeed.castShadow = shadows;
  big.visible = false;
  scene.add(big);

  /* ---------- bodies ---------- */
  const rand = rng(7);
  const bodies: Body[] = [];
  const palette = [BLUE, BLUE, BLUE, INK, INK, PAPER, PAPER, BLUE];
  const seedFor = (c: Color) => (c === BLUE ? LIME : c === INK ? BLUE : BLUE);
  const addBody = (kind: Kind, index: number, mesh: InstancedMesh) => {
    const c = palette[Math.floor(rand() * palette.length)];
    mesh.setColorAt(index, c);
    if (kind === 0) seedMesh.setColorAt(index, seedFor(c));
    const size =
      kind === 0 ? 0.42 + rand() * 0.26 : kind === 1 ? 0.5 + rand() * 0.3 : 0.45 + rand() * 0.25;
    // Symbols stay roughly upright so they read as "p", not b/d/q soup;
    // the companion pieces tumble freely.
    const homeQ =
      kind === 0
        ? new Quaternion().setFromEuler(
            new Euler((rand() - 0.5) * 1.3, (rand() - 0.5) * 1.9, (rand() - 0.5) * 1.1),
          )
        : new Quaternion().setFromAxisAngle(
            new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
            rand() * Math.PI * 2,
          );
    bodies.push({
      kind,
      index,
      pos: new Vector3(),
      vel: new Vector3(),
      anchor: new Vector3(),
      home: new Vector3(),
      slot: new Vector3(),
      q: homeQ.clone(),
      homeQ,
      spin: new Vector3(),
      base: size,
      size,
      radius: size * (kind === 0 ? 1.75 : 1.25),
      phase: rand() * Math.PI * 2,
    });
  };
  for (let i = 0; i < counts.sym; i += 1) addBody(0, i, symMesh);
  for (let i = 0; i < counts.ring; i += 1) addBody(1, i, ringMesh);
  for (let i = 0; i < counts.pill; i += 1) addBody(2, i, pillMesh);
  [symMesh, seedMesh, ringMesh, pillMesh].forEach((m) => {
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  /* ---------- layout (depends on aspect) ---------- */
  let view = { hw: 8, hh: 4.8, w: 1, h: 1 };
  /** DOM copy block in world units at z=0 (set from the component). */
  let copy: { x0: number; x1: number; y0: number; y1: number } | null = null;
  const projX = (x: number, z: number) => (x * CAM_Z) / (CAM_Z - z);
  const inCopyBox = (x: number, y: number, z: number, pad: number) =>
    !!copy &&
    projX(x, z) > copy.x0 - pad &&
    projX(x, z) < copy.x1 + pad &&
    projX(y, z) > copy.y0 - pad &&
    projX(y, z) < copy.y1 + pad;
  let bigScale = 1.6;
  const bigCenter = new Vector3();

  const layout = () => {
    const hh = Math.tan((camera.fov * Math.PI) / 360) * CAM_Z;
    const hw = hh * camera.aspect;
    view = { ...view, hw, hh };
    const portrait = camera.aspect < 0.9;
    // Swarm field: right/upper on desktop (copy lives bottom-left), top on mobile.
    const cx = portrait ? 0 : hw * 0.2;
    const cy = portrait ? hh * 0.36 : hh * 0.04;
    const rx = portrait ? hw * 1.05 : hw * 0.86;
    const ry = portrait ? hh * 0.58 : hh * 0.98;
    const r2 = rng(11);
    // narrow viewports get smaller pieces so the field still reads as many
    const fit = Math.min(1, Math.max(0.58, hw / 7.5));
    bodies.forEach((b, i) => {
      b.size = b.base * fit;
      b.radius = b.size * (b.kind === 0 ? 1.75 : 1.25);
      let x = 0;
      let y = 0;
      let z = 0;
      for (let tries = 0; tries < 40; tries += 1) {
        const a = r2() * Math.PI * 2;
        const d = Math.sqrt(r2());
        x = cx + Math.cos(a) * d * rx;
        y = cy + Math.sin(a) * d * ry;
        z = -2.6 + r2() * 4;
        // keep the DOM copy block clear
        if (!inCopyBox(x, y, z, b.radius * 1.1)) break;
      }
      b.home.set(x, y, z);
      if (b.pos.lengthSq() === 0) {
        // enter from below, staggered
        b.pos.set(x * 0.6, y - hh * 2.2 - (i % 7) * 0.6, z);
      }
    });

    // Big symbol: ~70% of view height, centred.
    bigScale = Math.min((hh * 2 * 0.62) / SYMBOL.height, (hw * 2 * 0.62) / SYMBOL.width);
    bigCenter.set(0, portrait ? hh * 0.06 : 0, 0);
    assignSlots();
  };

  /** Points along the big symbol skeleton (stem line, ring circle, seed). */
  const assignSlots = () => {
    const { stem, ring, seed } = SYMBOL;
    const lenStem = stem.y1 - stem.y0;
    const lenRing = Math.PI * 2 * ring.R;
    const n = bodies.length;
    const nSeed = Math.max(1, Math.round(n * 0.05));
    const nRest = n - nSeed;
    const nStem = Math.round((nRest * lenStem) / (lenStem + lenRing));
    const pts: Vector3[] = [];
    for (let i = 0; i < nStem; i += 1) {
      const t = (i + 0.5) / nStem;
      pts.push(new Vector3(stem.x, stem.y0 + t * lenStem, 0));
    }
    const nRing = nRest - nStem;
    for (let i = 0; i < nRing; i += 1) {
      const a = (i / nRing) * Math.PI * 2 + 0.3;
      pts.push(new Vector3(ring.x + Math.cos(a) * ring.R, ring.y + Math.sin(a) * ring.R, 0));
    }
    for (let i = 0; i < nSeed; i += 1) pts.push(new Vector3(seed.x, seed.y, 0));
    pts.forEach((p) => p.multiplyScalar(bigScale).add(bigCenter));
    // pair bodies and slots by angle around centre -> coherent swirl, few crossings
    const ang = (v: Vector3) => Math.atan2(v.y - bigCenter.y, v.x - bigCenter.x);
    const bs = [...bodies].sort((a, b) => ang(a.home) - ang(b.home));
    const ps = [...pts].sort((a, b) => ang(a) - ang(b));
    bs.forEach((b, i) => b.slot.copy(ps[i]));
  };

  /* ---------- input ---------- */
  const pointer = { x: 0, y: 0, wx: 0, wy: 0, vx: 0, vy: 0, active: false, seen: false };
  let progress = 0;
  let smoothP = 0;

  const toWorld = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    // ray from camera onto z = 0 plane (camera looks down -z, no rotation)
    return { x: nx * view.hw, y: ny * view.hh };
  };

  /* ---------- simulation ---------- */
  const tmpQ = new Quaternion();
  const tmpV = new Vector3();
  const axisV = new Vector3();
  const identity = new Quaternion();
  const m4 = new Matrix4();
  const sVec = new Vector3();
  let wave = { t: -10, x: 0, y: 0 };
  let gatherNow = 0;
  let nextWave = 4;
  let time = 0;

  const step = (dt: number) => {
    time += dt;
    smoothP += (progress - smoothP) * Math.min(1, dt * 7);
    const p = smoothP;
    uniforms.uP.value = p;
    uniforms.uTime.value = time;

    // phases derived from p
    const gather = smooth(0.04, 0.62, p); // swirl onto skeleton
    const swirl = Math.sin(gather * Math.PI); // out-and-back swirl amount
    const merge = smooth(0.6, 0.8, p); // small shrink into big
    const idle = 1 - gather;

    // ambient: soft wave every ~7s from a random edge while idle
    if (time > nextWave && idle > 0.5) {
      const side = Math.random() < 0.5 ? -1 : 1;
      wave = { t: time, x: side * view.hw * 1.1, y: (Math.random() - 0.5) * view.hh };
      nextWave = time + 6 + Math.random() * 3;
    }
    const waveAge = time - wave.t;
    const waveR = waveAge * 9;

    const k = 9 + gather * 12; // spring, tighter in formation
    const damp = 3.4;
    for (const b of bodies) {
      // anchor = home (with idle drift) -> swirled -> slot
      const dx = Math.sin(time * 0.35 + b.phase) * 0.35 * idle;
      const dy = Math.cos(time * 0.29 + b.phase * 1.3) * 0.3 * idle;
      tmpV.copy(b.home).lerp(b.slot, gather);
      // swirl: rotate around big centre by an amount peaking mid-gather
      const ox = tmpV.x - bigCenter.x;
      const oy = tmpV.y - bigCenter.y;
      const a = swirl * (1.5 + (b.phase % 1) * 0.6);
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const spread = 1 + swirl * 0.18;
      b.anchor.set(
        bigCenter.x + (ox * ca - oy * sa) * spread + dx,
        bigCenter.y + (ox * sa + oy * ca) * spread + dy,
        tmpV.z * (1 - gather) + Math.sin(b.phase + time) * swirl * 1.4,
      );

      // spring + damping
      b.vel.x += ((b.anchor.x - b.pos.x) * k - b.vel.x * damp) * dt;
      b.vel.y += ((b.anchor.y - b.pos.y) * k - b.vel.y * damp) * dt;
      b.vel.z += ((b.anchor.z - b.pos.z) * k - b.vel.z * damp) * dt;

      // keep the copy readable: push out of its box (towards the nearest free edge)
      if (idle > 0.01 && inCopyBox(b.pos.x, b.pos.y, b.pos.z, b.radius) && copy) {
        const ex = copy.x1 + b.radius - projX(b.pos.x, b.pos.z);
        const ey = copy.y1 + b.radius - projX(b.pos.y, b.pos.z);
        if (ex < ey) b.vel.x += ex * 30 * idle * dt;
        else b.vel.y += ey * 30 * idle * dt;
      }

      // pointer shove (stronger when idle; still playful during converge)
      if (pointer.active) {
        const px = b.pos.x - pointer.wx;
        const py = b.pos.y - pointer.wy;
        const d2 = px * px + py * py;
        const R = 2.8 + b.radius;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) + 1e-4;
          const f = (1 - d / R) ** 2 * 70 * (1 - merge * 0.85);
          b.vel.x += (px / d) * f * dt + pointer.vx * 0.9 * f * dt * 0.06;
          b.vel.y += (py / d) * f * dt + pointer.vy * 0.9 * f * dt * 0.06;
          b.vel.z += f * dt * 0.35 * (b.pos.z > 0 ? 1 : -1);
          b.spin.x += -(py / d) * f * dt * 0.25;
          b.spin.y += (px / d) * f * dt * 0.25;
        }
      }

      // ambient wave front
      if (waveAge < 3) {
        const wx = b.pos.x - wave.x;
        const wy = b.pos.y - wave.y;
        const d = Math.sqrt(wx * wx + wy * wy) + 1e-4;
        const band = Math.exp(-((d - waveR) ** 2) / 1.2);
        if (band > 0.01) {
          b.vel.x += (wx / d) * band * 6 * dt;
          b.vel.y += (wy / d) * band * 6 * dt;
          b.spin.z += band * dt * 1.5;
        }
      }
    }

    // mutual repulsion (n^2, n <= 46). Softened as they pack onto the skeleton.
    const rep = 26 * (1 - gather) ** 2;
    for (let i = 0; i < bodies.length; i += 1) {
      const A = bodies[i];
      for (let j = i + 1; j < bodies.length; j += 1) {
        const B = bodies[j];
        const x = A.pos.x - B.pos.x;
        const y = A.pos.y - B.pos.y;
        const z = A.pos.z - B.pos.z;
        const min = A.radius + B.radius;
        const d2 = x * x + y * y + z * z;
        if (d2 < min * min && d2 > 1e-6) {
          const d = Math.sqrt(d2);
          const f = (1 - d / min) * rep * dt;
          A.vel.x += (x / d) * f;
          A.vel.y += (y / d) * f;
          A.vel.z += (z / d) * f;
          B.vel.x -= (x / d) * f;
          B.vel.y -= (y / d) * f;
          B.vel.z -= (z / d) * f;
        }
      }
    }

    for (const b of bodies) {
      b.pos.addScaledVector(b.vel, dt);
      // rotation: integrate spin, ease toward home orientation / camera-facing in formation
      const sp = b.spin.length();
      if (sp > 1e-5) {
        axisV.copy(b.spin).divideScalar(sp);
        tmpQ.setFromAxisAngle(axisV, sp * dt);
        b.q.premultiply(tmpQ);
      }
      b.spin.multiplyScalar(Math.max(0, 1 - dt * 1.6));
      // idle sway: symbols rock around their (upright-ish) home, companions tumble
      if (b.kind === 0) {
        axisV.set(0.25, 1, 0.1).normalize();
        tmpQ.setFromAxisAngle(axisV, Math.sin(time * 0.4 + b.phase) * 0.45 * idle);
        tmpQ.multiply(b.homeQ);
      } else {
        axisV.set(Math.sin(b.phase), Math.cos(b.phase), 0.4).normalize();
        tmpQ.setFromAxisAngle(axisV, dt * 0.3 * idle);
        b.homeQ.premultiply(tmpQ);
        tmpQ.copy(b.homeQ);
      }
      const targetQ = tmpQ.slerp(identity, gather);
      b.q.slerp(targetQ, Math.min(1, dt * (0.9 + gather * 4)));
    }
    gatherNow = gather;
    return { gather, merge };
  };

  const writeInstances = (merge: number) => {
    for (const b of bodies) {
      // in formation every piece becomes a bead of the big symbol's stroke
      const bead = (b.kind === 0 ? 0.3 : 0.36) * (bigScale / 1.6);
      const s = (b.size + (bead - b.size) * gatherNow) * (1 - merge);
      sVec.setScalar(Math.max(1e-4, s));
      m4.compose(b.pos, b.q, sVec);
      if (b.kind === 0) {
        symMesh.setMatrixAt(b.index, m4);
        seedMesh.setMatrixAt(b.index, m4);
      } else if (b.kind === 1) ringMesh.setMatrixAt(b.index, m4);
      else pillMesh.setMatrixAt(b.index, m4);
    }
    symMesh.instanceMatrix.needsUpdate = true;
    seedMesh.instanceMatrix.needsUpdate = true;
    ringMesh.instanceMatrix.needsUpdate = true;
    pillMesh.instanceMatrix.needsUpdate = true;
    const hide = merge > 0.999;
    symMesh.visible = seedMesh.visible = ringMesh.visible = pillMesh.visible = !hide;
  };

  const bigTilt = { x: 0, y: 0 };
  const updateBig = (merge: number) => {
    big.visible = smoothP > 0.6;
    if (!big.visible) return;
    const s = bigScale * (0.94 + 0.06 * merge);
    big.scale.setScalar(s);
    big.position.copy(bigCenter);
    // gentle life + lean toward pointer
    const tx = pointer.active ? (pointer.wy / view.hh) * -0.25 : 0;
    const ty = pointer.active ? (pointer.wx / view.hw) * 0.35 : 0;
    bigTilt.x += (tx - bigTilt.x) * 0.06;
    bigTilt.y += (ty - bigTilt.y) * 0.06;
    big.rotation.set(
      bigTilt.x + Math.sin(time * 0.6) * 0.04,
      bigTilt.y + Math.sin(time * 0.45) * 0.12 + (1 - merge) * 0.5,
      0,
    );
    const solid = merge > 0.97;
    bigBody.castShadow = bigSeed.castShadow = shadows && solid;
  };

  /* ---------- loop ---------- */
  let raf = 0;
  let last = 0;
  let running = false;
  let firstFrame: () => void = () => {};
  const ready = new Promise<void>((r) => (firstFrame = r));

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(1 / 30, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    pointer.vx *= 0.85;
    pointer.vy *= 0.85;
    const h = dt / 2;
    step(h);
    const { merge } = step(h);
    writeInstances(merge);
    updateBig(merge);
    renderer.render(scene, camera);
    firstFrame();
  };

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    view.w = w;
    view.h = h;
    layout();
  };
  resize();

  return {
    ready,
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
    },
    setPointer(clientX, clientY, active) {
      const w = toWorld(clientX, clientY);
      if (pointer.seen && active) {
        pointer.vx = (w.x - pointer.wx) * 60;
        pointer.vy = (w.y - pointer.wy) * 60;
      }
      pointer.wx = w.x;
      pointer.wy = w.y;
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.active = active;
      pointer.seen = active;
    },
    setCopyRect(rect) {
      const c = canvas.getBoundingClientRect();
      if (!rect || !c.width) {
        copy = null;
        return;
      }
      const wx = (px: number) => ((px - c.left) / c.width) * 2 * view.hw - view.hw;
      const wy = (py: number) => view.hh - ((py - c.top) / c.height) * 2 * view.hh;
      copy = { x0: wx(rect.left), x1: wx(rect.right), y0: wy(rect.bottom), y1: wy(rect.top) };
      layout();
    },
    resize,
    start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      cancelAnimationFrame(raf);
      running = false;
      [bodyGeo, seedGeo, ringGeo, pillGeo, bigBodyGeo, bigSeedGeo, ground.geometry].forEach((g) =>
        g.dispose(),
      );
      gloss.dispose();
      (bigBody.material as MeshPhysicalMaterial).dispose();
      (bigSeed.material as MeshPhysicalMaterial).dispose();
      (ground.material as ShadowMaterial).dispose();
      [symMesh, seedMesh, ringMesh, pillMesh].forEach((m) => m.dispose());
      envRT.dispose();
      renderer.dispose();
    },
  };
}

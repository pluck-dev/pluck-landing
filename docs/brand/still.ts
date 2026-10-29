/**
 * Offline still render of the 3D symbol -> public/brand/pluck-symbol-3d.png.
 * Bundled + run in Chromium by docs/brand/render-3d.js (same geometry and
 * lighting recipe as the hero scene).
 */
import {
  Color,
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BLUE, INK, bodyGeometry, seedGeometry } from "../../lib/pluck-symbol-3d";

declare global {
  interface Window {
    renderStill: (size: number) => void;
  }
}

window.renderStill = (size: number) => {
  const canvas = document.querySelector("canvas")!;
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(size, size, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environmentIntensity = 0.8;
  const camera = new PerspectiveCamera(22, 1, 0.1, 100);
  camera.position.set(0, 0, 15.5);
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-6, 9, 12);
  const rim = new DirectionalLight(0xdfe8ff, 0.9);
  rim.position.set(8, -4, 6);
  scene.add(key, rim);
  const mat = (c: Color) =>
    new MeshPhysicalMaterial({
      color: c,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
  const symbol = new Object3D();
  symbol.add(new Mesh(bodyGeometry(7), mat(BLUE)), new Mesh(seedGeometry(7), mat(INK)));
  symbol.rotation.set(0.1, -0.42, 0.03);
  scene.add(symbol);
  renderer.render(scene, camera);
};

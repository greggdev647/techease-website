// Hero 3D: the Tech Ease "TE" monogram built from the logo's blocks,
// in glossy red and chrome, with studio reflections and soft bloom.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const canvas = document.getElementById("scene");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

try { init(); } catch (e) { console.warn(e); canvas.remove(); }

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.Fog(0x050505, 12, 26);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  // Accent lights
  const keyRed = new THREE.PointLight(0xff3326, 90, 30); keyRed.position.set(-5, 3, 4); scene.add(keyRed);
  const rim = new THREE.PointLight(0xffffff, 60, 30); rim.position.set(5, -2, 3); scene.add(rim);
  const back = new THREE.PointLight(0xff2a1a, 120, 30); back.position.set(0, 0, -4); scene.add(back);

  // Materials
  const red = new THREE.MeshPhysicalMaterial({ color: 0xd71313, metalness: 0.25, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.4, sheenColor: 0xff6a5a });
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xf4f4f4, metalness: 1, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 });

  // Blocks measured from the logo artwork (1500px canvas), centred and scaled.
  const S = 1 / 170, CX = 727.5, CY = 763.5, D = 0.7;
  const blocks = [
    // T (red)
    { x0: 465, x1: 750, y0: 392, y1: 482, m: red },
    { x0: 558, x1: 656, y0: 482, y1: 1135, m: red },
    // E (chrome)
    { x0: 750, x1: 990, y0: 392, y1: 482, m: chrome },
    { x0: 750, x1: 848, y0: 482, y1: 1135, m: chrome },
    { x0: 848, x1: 975, y0: 707, y1: 797, m: chrome },
    { x0: 848, x1: 990, y0: 1045, y1: 1135, m: chrome }
  ];

  const logo = new THREE.Group();
  const parts = blocks.map((b, i) => {
    const w = (b.x1 - b.x0) * S, h = (b.y1 - b.y0) * S;
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, D, 4, 0.06), b.m);
    const home = new THREE.Vector3(((b.x0 + b.x1) / 2 - CX) * S, -((b.y0 + b.y1) / 2 - CY) * S, (i % 2 ? 0.02 : -0.02));
    mesh.position.copy(home);
    // exploded start position for the intro
    const from = new THREE.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10, -6 - Math.random() * 8);
    const rot = new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    logo.add(mesh);
    return { mesh, home, from, rot, delay: i * 0.08 };
  });
  const pivot = new THREE.Group();
  pivot.add(logo);
  scene.add(pivot);

  // Orbit ring and floating shards
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.008, 8, 200), new THREE.MeshBasicMaterial({ color: 0xff4a3d, transparent: true, opacity: 0.55 }));
  ring.rotation.set(1.25, 0.25, 0);
  pivot.add(ring);

  const shardGeo = new RoundedBoxGeometry(0.22, 0.22, 0.22, 2, 0.03);
  const shards = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(shardGeo, i % 3 ? chrome : red);
    const r = 4.2 + Math.random() * 3, a = Math.random() * Math.PI * 2;
    m.userData = { r, a, s: 0.05 + Math.random() * 0.1, y: (Math.random() - 0.5) * 5, sc: 0.4 + Math.random() * 1 };
    m.scale.setScalar(m.userData.sc);
    shards.push(m); scene.add(m);
  }

  // Dust
  const n = 900, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 30; pos[i * 3 + 1] = (Math.random() - 0.5) * 18; pos[i * 3 + 2] = -Math.random() * 14; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.5, depthWrite: false }));
  scene.add(dust);

  // Post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.6, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let wide = true;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    wide = w > 860;
    pivot.position.set(wide ? 2.9 : 0, wide ? 0.95 : 1.15, 0);
    pivot.scale.setScalar(wide ? 0.82 : 0.6);
  }
  resize();
  addEventListener("resize", resize);

  // Interaction
  let mx = 0, my = 0, sx = 0, sy = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);

  // Intro: blocks fly in and assemble when the loader finishes
  let introStart = null;
  const startIntro = () => { if (introStart === null) introStart = performance.now(); };
  addEventListener("te:intro", startIntro);
  setTimeout(startIntro, 3500);
  const ease = (t) => 1 - Math.pow(1 - t, 4);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime() * (reduce ? 0.3 : 1);
    const k = introStart === null ? 0 : Math.min((performance.now() - introStart) / 2200, 1);

    parts.forEach((p) => {
      const e = ease(Math.max(0, Math.min(1, (k * 2200 - p.delay * 1000) / 1800)));
      p.mesh.position.lerpVectors(p.from, p.home, e);
      p.mesh.rotation.set(p.rot.x * (1 - e), p.rot.y * (1 - e), p.rot.z * (1 - e));
    });

    sx += (mx - sx) * 0.05; sy += (my - sy) * 0.05;
    const scroll = Math.min(scrollY / innerHeight, 1.5);
    logo.rotation.y = Math.sin(t * 0.5) * 0.35 + sx * 0.9 + scroll * 1.4;
    logo.rotation.x = Math.sin(t * 0.37) * 0.12 + sy * 0.5;
    logo.position.y = Math.sin(t * 0.8) * 0.12;
    ring.rotation.z = t * 0.15;
    pivot.position.z = -scroll * 4;

    shards.forEach((s) => {
      const u = s.userData, a = u.a + t * u.s;
      s.position.set(Math.cos(a) * u.r + pivot.position.x, u.y + Math.sin(t + u.a) * 0.3, Math.sin(a) * u.r - 2);
      s.rotation.set(t * 0.6 + u.a, t * 0.4, 0);
    });
    dust.rotation.y = sx * 0.1; dust.position.y = scroll * 2;

    keyRed.position.x = -5 + Math.sin(t * 0.6) * 2;
    camera.position.x = sx * 0.6; camera.position.y = -sy * 0.4;
    camera.lookAt(0, 0, 0);
    composer.render();
  }
  frame();
}

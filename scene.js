// Hero 3D scene: a morphing faceted crystal, wire shell, orbit rings and a particle field.
import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById("scene");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

try { init(); } catch (e) { canvas.remove(); }

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const red = new THREE.PointLight(0xff2e3b, 220, 30); red.position.set(4, 3, 4); scene.add(red);
  const orange = new THREE.PointLight(0xff8a3d, 120, 30); orange.position.set(-3, -3, 3); scene.add(orange);
  const violet = new THREE.PointLight(0x7b5cff, 160, 30); violet.position.set(-4, 3, -2); scene.add(violet);
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2, 4, 5); scene.add(key);

  const group = new THREE.Group();
  scene.add(group);

  // Morphing crystal
  const uniforms = { uTime: { value: 0 } };
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x4a0d14, metalness: 0.55, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1,
    emissive: 0x3a0006, flatShading: true
  });
  crystalMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = "uniform float uTime;\n" + shader.vertexShader.replace(
      "#include <begin_vertex>",
      `vec3 p = position;
       float d = sin(p.x * 1.9 + uTime) * sin(p.y * 2.3 + uTime * 1.3) * sin(p.z * 1.7 + uTime * 0.8);
       d += 0.5 * sin(p.x * 4.1 - uTime * 1.6) * sin(p.z * 3.7 + uTime);
       vec3 transformed = p + normal * d * 0.28;`
    );
  };
  const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, 3), crystalMat);
  group.add(crystal);

  // Wire shell
  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.15, 1)),
    new THREE.LineBasicMaterial({ color: 0xff2e3b, transparent: true, opacity: 0.22 })
  );
  group.add(shell);

  // Orbit rings
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: 0xff2e3b }));
  ringA.rotation.set(1.2, 0.3, 0);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.008, 8, 160), new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0.6 }));
  ringB.rotation.set(-0.9, 0.6, 0.4);
  group.add(ringA, ringB);

  // Small orbiting cubes
  const cubes = [];
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xff2e3b, metalness: 0.5, roughness: 0.3, emissive: 0x550008 });
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), cubeMat);
    c.userData = { r: 2.7 + Math.random() * 0.6, s: 0.25 + Math.random() * 0.35, o: (i / 6) * Math.PI * 2, tilt: Math.random() - 0.5 };
    cubes.push(c); group.add(c);
  }

  // Particle field
  const count = window.innerWidth < 720 ? 900 : 1800;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 4 + Math.random() * 9, t = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(t);
    pos[i * 3 + 2] = r * Math.cos(ph) - 3;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xffb3a0, size: 0.03, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(particles);

  // Layout
  let mobile = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    mobile = w < 720;
    group.position.set(mobile ? 0.8 : 2.9, mobile ? 1.6 : 0, 0);
    group.scale.setScalar(mobile ? 0.55 : w < 960 ? 0.8 : 1);
  }
  resize();
  window.addEventListener("resize", resize);

  // Interaction
  let tx = 0, ty = 0, cx = 0, cy = 0, scrollY = 0;
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime() * (reduce ? 0.2 : 1);
    uniforms.uTime.value = t * 0.8;
    cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;

    crystal.rotation.y = t * 0.25; crystal.rotation.x = t * 0.12;
    shell.rotation.y = -t * 0.15; shell.rotation.z = t * 0.08;
    ringA.rotation.z = t * 0.3; ringB.rotation.z = -t * 0.22;
    cubes.forEach((c) => {
      const a = c.userData.o + t * c.userData.s;
      c.position.set(Math.cos(a) * c.userData.r, Math.sin(a) * c.userData.r * c.userData.tilt, Math.sin(a) * c.userData.r);
      c.rotation.x = c.rotation.y = t * 1.5;
    });
    particles.rotation.y = t * 0.02 + cx * 0.15;
    particles.rotation.x = cy * 0.1;

    const s = scrollY / window.innerHeight;
    group.rotation.y = cx * 0.5 + s * 1.2;
    group.rotation.x = cy * 0.35;
    camera.position.y = -s * 2;

    red.position.x = 4 + Math.sin(t * 0.7) * 2;
    renderer.render(scene, camera);
  }
  frame();
}

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import gsap from "gsap";
import { Send } from "lucide-react";

/* ============================================================================
   IGRIS — a particle hologram face, rebuilt in three.js + React.

   WHAT THIS FILE IS
   A self-contained React component. It procedurally builds a face made of a
   few thousand glowing points (no external model/textures), animates them
   together on mount, then keeps the face "alive" (breathing, blinking, a
   little parallax) and makes it "talk" whenever text is submitted through
   the input bar, using the browser's built-in speech synthesis.

   REQUIRED PACKAGES (install in your project — not bundled with this file):
     npm install three gsap lucide-react

   ASSUMPTION: Tailwind is already configured in your project (you mentioned
   an existing three.js build, so this just uses utility classes directly —
   no separate CSS file needed).

   IF YOUR BUNDLER BLOCKS DEEP "three/examples/jsm/..." IMPORTS:
   remove the 3 postprocessing imports above, delete the "Post-processing
   (bloom)" block inside the setup effect below, and change the line
   `composer.render();` to `renderer.render(scene, camera);` in animate().
   Everything else works identically without bloom, just slightly less glowy.

   HOW THE "TALKING" WORKS (read this before you file a bug about lip sync):
   The Web Speech API (SpeechSynthesis) does not expose the audio waveform,
   so there's no true amplitude to drive the mouth from. Instead, while an
   utterance is playing, the mouth opens toward a new random target every
   ~60-150ms (a "viseme scheduler"), smoothed frame to frame, plus a little
   extra movement in the jaw/cheek particles near the mouth so the whole
   lower face moves, not just a line. It reads as natural talking; it is not
   phoneme-accurate lip sync. If you swap in a real TTS audio file (e.g. from
   an API that returns audio), you can drive `runtime.mouthTarget` from a
   Web Audio AnalyserNode's volume instead — the rest of the rig doesn't
   need to change.
============================================================================ */

// ---------------------------------------------------------------------------
// Tunables — safe to tweak without touching the logic below
// ---------------------------------------------------------------------------
const COUNTS = {
  silhouette: 900,
  cheekFacet: 500,
  brow: 300,
  crownBlade: 460,
  noseBridge: 140,
  nostrils: 80,
  eyeSocket: 260,
  eyeGlow: 200,
  mouthUpper: 140,
  mouthLower: 140,
  philtrum: 40,
  dust: 2200,
  ambient: 450,
};

const COLOR_HSL = {
  line: { h: 0.55, s: 0.95, l: 0.58 },
  dust: { h: 0.56, s: 0.7, l: 0.28 },
  eye: { h: 0.52, s: 0.55, l: 0.92 },
  ambient: { h: 0.58, s: 0.5, l: 0.22 },
};

const CAMERA_Z = 4.4;
const FORM_DURATION = 2.6; // seconds — startup assembly animation
const BLOOM_STRENGTH = 0.85;
const BLOOM_RADIUS = 0.55;
const BLOOM_THRESHOLD = 0.12;

// ---------------------------------------------------------------------------
// Small math helpers
// ---------------------------------------------------------------------------
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const randRange = (a, b) => a + Math.random() * (b - a);

// Eased 0..1 -> 0..1 with a slight overshoot-and-settle ("magnetic snap")
function easeOutBack(t) {
  t = clamp(t, 0, 1);
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Uniform Catmull-Rom spline through 2D control points.
function catmullRomSpline(pts, segmentsPerSpan = 14, closed = false) {
  const n = pts.length;
  const get = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
  const spans = closed ? n : n - 1;
  const out = [];
  for (let i = 0; i < spans; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let s = 0; s < segmentsPerSpan; s++) {
      const t = s / segmentsPerSpan, t2 = t * t, t3 = t2 * t;
      const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, y]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

function polyBBox(poly) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
}

function ellipsePoly(cx, cy, rx, ry, rotationDeg = 0, segments = 20) {
  const rot = (rotationDeg * Math.PI) / 180;
  const pts = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const ex = rx * Math.cos(a), ey = ry * Math.sin(a);
    pts.push([cx + ex * Math.cos(rot) - ey * Math.sin(rot), cy + ex * Math.sin(rot) + ey * Math.cos(rot)]);
  }
  return pts;
}

// Shallow relief so the face reads as 3D from slight angles, not a flat decal.
function faceDepth(x, y) {
  const edgeFalloff = Math.max(0, 1 - Math.pow(Math.abs(x) / 0.75, 1.6));
  const vertical = Math.cos((Math.min(Math.abs(y), 1.3) / 1.3) * Math.PI * 0.5);
  let z = 0.32 * edgeFalloff * (0.4 + 0.6 * vertical);
  z += Math.exp(-((x * x) / 0.01 + Math.pow(y - 0.1, 2) / 0.5)) * 0.15; // nose ridge
  const sL = Math.exp(-(Math.pow(x - 0.3, 2) / 0.02 + Math.pow(y - 0.22, 2) / 0.01));
  const sR = Math.exp(-(Math.pow(x + 0.3, 2) / 0.02 + Math.pow(y - 0.22, 2) / 0.01));
  z -= (sL + sR) * 0.12; // eye socket recess
  return z;
}

// How much a point near the jaw/chin should drop when the mouth opens.
function jawInfluenceFor(x, y) {
  if (y > -0.15) return 0;
  const t = clamp((-0.15 - y) / 1.2, 0, 1);
  const centerFalloff = Math.exp(-(x * x) / 0.35);
  return t * centerFalloff;
}

// ---------------------------------------------------------------------------
// Landmark curves — normalized units, origin at face center, y-up, x-right.
// Right-side-only lists get mirrored automatically at emit time.
// ---------------------------------------------------------------------------
const SIL_RIGHT = [
  [0, 1.3], [0.3, 1.24], [0.55, 1.05], [0.64, 0.8], [0.6, 0.55],
  [0.66, 0.2], [0.62, -0.05], [0.5, -0.35], [0.34, -0.7], [0.16, -1.05], [0, -1.32],
];
const CHEEK_FACET_RIGHT = [[0.42, 0.62], [0.4, 0.25], [0.36, -0.1], [0.28, -0.45], [0.14, -0.85]];
const BROW_RIGHT = [[0.08, 0.42], [0.3, 0.52], [0.52, 0.42]];
const CROWN_BLADE_RIGHT = [[0.08, 0.45], [0.24, 0.75], [0.45, 1.15], [0.2, 1.35]];
const NOSE_BRIDGE = [[0, 0.38], [0, 0.15], [0, -0.02], [0, -0.12]];
const NOSTRIL_RIGHT = [[0.09, -0.14], [0.14, -0.2], [0.08, -0.24]];
const PHILTRUM = [[0, -0.45], [0, -0.56]];
const MOUTH_UPPER = [[-0.22, -0.6], [-0.08, -0.565], [0, -0.575], [0.08, -0.565], [0.22, -0.6]];
const MOUTH_LOWER = [[-0.2, -0.63], [0, -0.66], [0.2, -0.63]];

const EYE_CX = 0.3, EYE_CY = 0.24;
const EYE_SOCKET_RIGHT = ellipsePoly(EYE_CX, EYE_CY, 0.2, 0.085, -12, 22);
const EYE_GLOW_RIGHT = ellipsePoly(EYE_CX, EYE_CY, 0.125, 0.05, -12, 18);
const EYE_EXCLUDE_RIGHT = ellipsePoly(EYE_CX, EYE_CY, 0.26, 0.12, -12, 16);
const MOUTH_EXCLUDE = ellipsePoly(0, -0.62, 0.3, 0.15, 0, 16);
const mirrorPoly = (poly) => poly.map(([x, y]) => [-x, y]);

// ---------------------------------------------------------------------------
// Procedural particle builder — runs once, pure CPU math, no three.js objects.
// ---------------------------------------------------------------------------
function buildFace() {
  const positions = [], scatter = [], colors = [], sizes = [];
  const jaw = [], eyeMask = [], eyeCenter = [], lipSide = [], phase = [];
  const tmpColor = new THREE.Color();

  function colorFor(kind, brightness = 1) {
    const base = COLOR_HSL[kind];
    tmpColor.setHSL(
      base.h + randRange(-0.01, 0.01),
      clamp(base.s + randRange(-0.05, 0.05), 0, 1),
      clamp(base.l * brightness + randRange(-0.03, 0.03), 0, 1)
    );
    return { r: tmpColor.r, g: tmpColor.g, b: tmpColor.b };
  }

  function pushParticle(x, y, z, color, size, jawI = 0, eye = 0, ecx = 0, ecy = 0, lip = 0, fly = true) {
    positions.push(x, y, z);
    if (fly) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(randRange(-1, 1));
      const rad = randRange(4.5, 8.5);
      scatter.push(rad * Math.sin(phi) * Math.cos(theta), rad * Math.sin(phi) * Math.sin(theta) * 0.6 + y * 0.3, rad * Math.cos(phi) * 0.5);
    } else {
      scatter.push(x, y, z);
    }
    colors.push(color.r, color.g, color.b);
    sizes.push(size);
    jaw.push(jawI);
    eyeMask.push(eye);
    eyeCenter.push(ecx, ecy);
    lipSide.push(lip);
    phase.push(Math.random() * Math.PI * 2);
  }

  function emitContour(ctrlPts, count, opts = {}) {
    const { mirror = false, sizeRange = [1.3, 2.4], brightness = 1, kind = "line", taper = null, jitter = 0.008, closed = false } = opts;
    const dense = catmullRomSpline(ctrlPts, 14, closed);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const idx = Math.round(t * (dense.length - 1));
      let [x, y] = dense[idx];
      x += randRange(-jitter, jitter);
      y += randRange(-jitter, jitter);
      const tp = taper ? taper(t) : 1;
      const z = faceDepth(x, y) + randRange(-0.01, 0.01);
      const size = lerp(sizeRange[0], sizeRange[1], Math.random()) * tp;
      const col = colorFor(kind, brightness * tp);
      pushParticle(x, y, z, col, size, jawInfluenceFor(x, y));
      if (mirror && Math.abs(x) > 0.001) {
        const xm = -x;
        pushParticle(xm, y, z, col, size, jawInfluenceFor(xm, y));
      }
    }
  }

  function emitLip(ctrlPts, count, side) {
    const dense = catmullRomSpline(ctrlPts, 16, false);
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const idx = Math.round(t * (dense.length - 1));
      let [x, y] = dense[idx];
      x += randRange(-0.004, 0.004);
      y += randRange(-0.004, 0.004);
      const z = faceDepth(x, y) + 0.05 + randRange(-0.005, 0.005);
      const size = lerp(1.4, 2.2, Math.random());
      const col = colorFor("line", side === 1 ? 0.75 : 0.65);
      pushParticle(x, y, z, col, size, 0, 0, 0, 0, side);
    }
  }

  function emitEyeGlow(cx, cy, poly, count) {
    const { minX, maxX, minY, maxY } = polyBBox(poly);
    let placed = 0, attempts = 0;
    while (placed < count && attempts < count * 30) {
      attempts++;
      const x = randRange(minX, maxX), y = randRange(minY, maxY);
      if (!pointInPolygon(x, y, poly)) continue;
      const z = faceDepth(x, y) + 0.03 + randRange(-0.005, 0.01);
      const size = lerp(1.6, 3.0, Math.random());
      const col = colorFor("eye", randRange(0.9, 1.15));
      pushParticle(x, y, z, col, size, 0, 1, cx, cy);
      pushParticle(-x, y, z, col, size, 0, 1, -cx, cy);
      placed += 2;
    }
  }

  function emitFilledPolygon(poly, count, opts = {}) {
    const { exclude = [], sizeRange = [0.6, 1.4], brightness = 0.6, kind = "dust" } = opts;
    const { minX, maxX, minY, maxY } = polyBBox(poly);
    let placed = 0, attempts = 0;
    while (placed < count && attempts < count * 30) {
      attempts++;
      const x = randRange(minX, maxX), y = randRange(minY, maxY);
      if (!pointInPolygon(x, y, poly)) continue;
      if (exclude.some((p) => pointInPolygon(x, y, p))) continue;
      const z = faceDepth(x, y) + randRange(-0.015, 0.015);
      const size = lerp(sizeRange[0], sizeRange[1], Math.random());
      const col = colorFor(kind, brightness * randRange(0.75, 1.15));
      pushParticle(x, y, z, col, size, jawInfluenceFor(x, y));
      placed++;
    }
  }

  function emitAmbient(count) {
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = randRange(1.8, 4.5);
      const x = Math.cos(theta) * r * randRange(0.8, 1.3);
      const y = randRange(-2.2, 2.4);
      const z = randRange(-2.5, -0.4);
      const size = lerp(0.4, 1.0, Math.random());
      const col = colorFor("ambient", randRange(0.6, 1.2));
      pushParticle(x, y, z, col, size, 0, 0, 0, 0, 0, false);
    }
  }

  // Full closed silhouette outline (right side down + mirrored left side up).
  const leftSide = SIL_RIGHT.slice().reverse().map(([x, y]) => [-x, y]);
  const fullOutline = [...SIL_RIGHT, ...leftSide.slice(1)];

  emitContour(fullOutline, COUNTS.silhouette, { sizeRange: [1.6, 2.8], brightness: 1.05, kind: "line", jitter: 0.006, closed: true });
  emitContour(CHEEK_FACET_RIGHT, Math.round(COUNTS.cheekFacet / 2), { mirror: true, sizeRange: [1.2, 2.0], brightness: 0.85, kind: "line" });
  emitContour(BROW_RIGHT, Math.round(COUNTS.brow / 2), { mirror: true, sizeRange: [1.6, 2.6], brightness: 1.1, kind: "line" });
  emitContour(CROWN_BLADE_RIGHT, Math.round(COUNTS.crownBlade / 2), { mirror: true, sizeRange: [0.8, 2.4], brightness: 1.0, kind: "line", taper: (t) => lerp(1, 0.15, t), jitter: 0.01 });
  emitContour(NOSE_BRIDGE, COUNTS.noseBridge, { sizeRange: [1.2, 2.0], brightness: 0.9, kind: "line", jitter: 0.005 });
  emitContour(NOSTRIL_RIGHT, Math.round(COUNTS.nostrils / 2), { mirror: true, sizeRange: [1.0, 1.6], brightness: 0.8, kind: "line" });
  emitContour(PHILTRUM, COUNTS.philtrum, { sizeRange: [1.0, 1.6], brightness: 0.8, kind: "line" });
  emitContour(EYE_SOCKET_RIGHT, Math.round(COUNTS.eyeSocket / 2), { mirror: true, sizeRange: [1.0, 1.6], brightness: 0.5, kind: "dust", jitter: 0.004, closed: true });

  emitEyeGlow(EYE_CX, EYE_CY, EYE_GLOW_RIGHT, Math.round(COUNTS.eyeGlow / 2));
  emitLip(MOUTH_UPPER, COUNTS.mouthUpper, 1);
  emitLip(MOUTH_LOWER, COUNTS.mouthLower, 2);

  emitFilledPolygon(fullOutline, COUNTS.dust, {
    exclude: [EYE_EXCLUDE_RIGHT, mirrorPoly(EYE_EXCLUDE_RIGHT), MOUTH_EXCLUDE],
    sizeRange: [0.5, 1.3],
    brightness: 0.55,
    kind: "dust",
  });

  emitAmbient(COUNTS.ambient);

  const count = positions.length / 3;
  const delays = new Float32Array(count);
  for (let i = 0; i < count; i++) delays[i] = randRange(0, 0.5);

  return {
    count,
    basePositions: new Float32Array(positions),
    scatterPositions: new Float32Array(scatter),
    colors: new Float32Array(colors),
    sizes: new Float32Array(sizes),
    jawInfluence: new Float32Array(jaw),
    eyeMask: new Float32Array(eyeMask),
    eyeCenters: new Float32Array(eyeCenter),
    lipSide: new Float32Array(lipSide),
    phase: new Float32Array(phase),
    delays,
  };
}

// ---------------------------------------------------------------------------
// Particle shader — soft round glowing points, sized by camera distance.
// ---------------------------------------------------------------------------
const VERTEX_SHADER = `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uPixelRatio;
  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  uniform float uIntro;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.18, 0.0, d);
    vec3 col = vColor + core * 0.6;
    gl_FragColor = vec4(col, alpha * uIntro);
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function IgrisFace() {
  const mountRef = useRef(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [caption, setCaption] = useState("");

  const data = useMemo(() => buildFace(), []);
  const voiceRef = useRef(null);

  // Mutable animation state that must not trigger React re-renders.
  const runtime = useRef({
    mouthOpen: 0,
    mouthTarget: 0.04,
    nextViseme: 0,
    blink: 0,
    nextBlink: randRange(2, 5),
    formProgress: 0,
    pointerX: 0,
    pointerY: 0,
    groupRotX: 0,
    groupRotY: 0,
    talking: false,
  }).current;

  // ---- three.js lifecycle -------------------------------------------------
  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth, height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, CAMERA_Z + 1.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Post-processing (bloom) — remove this block if your bundler blocks
    // deep "three/examples/jsm" imports (see the note at the top of the file).
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD);
    composer.addPass(bloomPass);

    const faceGroup = new THREE.Group();
    scene.add(faceGroup);

    const geometry = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(data.basePositions.slice(), 3).setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", posAttr);
    geometry.setAttribute("aColor", new THREE.BufferAttribute(data.colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(data.sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uIntro: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    faceGroup.add(points);

    // ---- pointer parallax --------------------------------------------------
    function onPointerMove(e) {
      const rect = mount.getBoundingClientRect();
      runtime.pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      runtime.pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
    mount.addEventListener("pointermove", onPointerMove);

    // ---- resize --------------------------------------------------------------
    function onResize() {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      if (bloomPass.setSize) bloomPass.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // ---- startup convergence animation --------------------------------------
    gsap.to(runtime, { formProgress: 1, duration: FORM_DURATION, ease: "none" });
    gsap.to(camera.position, { z: CAMERA_Z, duration: FORM_DURATION, ease: "power2.out" });

    // ---- render loop ---------------------------------------------------------
    const clock = new THREE.Clock();
    let raf;

    function updatePositions(elapsed) {
      const pos = geometry.attributes.position.array;
      const { basePositions, scatterPositions, jawInfluence, eyeMask, eyeCenters, lipSide, phase, delays, count } = data;
      const fp = runtime.formProgress;

      for (let i = 0; i < count; i++) {
        const ix = i * 3, iy = ix + 1, iz = ix + 2;
        const delay = delays[i];
        const localT = clamp((fp - delay) / (1 - delay), 0, 1);
        const lp = easeOutBack(localT);

        const bx = basePositions[ix], by0 = basePositions[iy], bz = basePositions[iz];

        const ph = phase[i];
        const jitterAmt = 0.005 * lp;
        let dx = Math.sin(elapsed * 0.7 + ph) * jitterAmt;
        let dy = Math.cos(elapsed * 0.55 + ph * 1.4) * jitterAmt;
        let dz = 0;

        const ji = jawInfluence[i];
        if (ji > 0) {
          dy -= ji * runtime.mouthOpen * 0.1 * lp;
          dz += ji * runtime.mouthOpen * 0.03 * lp;
        }

        const ls = lipSide[i];
        if (ls === 1) dy += runtime.mouthOpen * 0.015 * lp;
        else if (ls === 2) dy -= runtime.mouthOpen * 0.12 * lp;

        let by = by0;
        if (eyeMask[i] > 0) {
          const ecy = eyeCenters[i * 2 + 1];
          const compress = runtime.blink * 0.85;
          by = ecy + (by0 - ecy) * (1 - compress);
        }

        const tx = bx + dx, ty = by + dy, tz = bz + dz;
        pos[ix] = lerp(scatterPositions[ix], tx, lp);
        pos[iy] = lerp(scatterPositions[iy], ty, lp);
        pos[iz] = lerp(scatterPositions[iz], tz, lp);
      }
      geometry.attributes.position.needsUpdate = true;
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      // Mouth viseme scheduler
      if (runtime.talking) {
        if (elapsed > runtime.nextViseme) {
          runtime.mouthTarget = randRange(0.18, 1.0);
          runtime.nextViseme = elapsed + randRange(0.06, 0.15);
        }
      } else {
        runtime.mouthTarget = 0.04;
      }
      runtime.mouthOpen += (runtime.mouthTarget - runtime.mouthOpen) * Math.min(1, dt * 10);

      // Blink scheduler
      if (elapsed > runtime.nextBlink) {
        runtime.nextBlink = elapsed + randRange(2.5, 6);
        gsap.timeline()
          .to(runtime, { blink: 1, duration: 0.09, ease: "power1.in" })
          .to(runtime, { blink: 0, duration: 0.13, ease: "power1.out" });
      }

      // Pointer parallax (damped)
      runtime.groupRotY = lerp(runtime.groupRotY, runtime.pointerX * 0.15, 0.04);
      runtime.groupRotX = lerp(runtime.groupRotX, -runtime.pointerY * 0.1, 0.04);
      faceGroup.rotation.y = runtime.groupRotY;
      faceGroup.rotation.x = runtime.groupRotX;

      // Idle breathing
      const breathe = 1 + Math.sin(elapsed * 0.9) * 0.008;
      faceGroup.scale.setScalar(breathe);

      // Fade particles in fast at the very start (motion begins immediately —
      // there is no static "scattered" frame shown before it starts moving).
      material.uniforms.uIntro.value = Math.min(1, runtime.formProgress * 6);

      updatePositions(elapsed);
      composer.render();
    }
    animate();

    // ---- cleanup ---------------------------------------------------------
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("pointermove", onPointerMove);
      gsap.killTweensOf(runtime);
      gsap.killTweensOf(camera.position);
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Entrance animation for the input bar, timed to land as the face finishes forming.
  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: FORM_DURATION * 0.55 }
    );
  }, []);

  // ---- speech ---------------------------------------------------------------
  const pickVoice = useCallback(() => {
    if (voiceRef.current) return voiceRef.current;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const voice = voices.find((v) => /en/i.test(v.lang) && /male/i.test(v.name)) || voices.find((v) => /en/i.test(v.lang)) || voices[0];
    voiceRef.current = voice;
    return voice;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.onvoiceschanged = () => pickVoice();
  }, [pickVoice]);

  const speak = useCallback(
    (text) => {
      if (!text.trim() || typeof window === "undefined" || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 1;
      utterance.pitch = 0.9;
      utterance.onstart = () => {
        setIsSpeaking(true);
        runtime.talking = true;
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        runtime.talking = false;
        setTimeout(() => setCaption((c) => (c === text ? "" : c)), 2500);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        runtime.talking = false;
      };
      setCaption(text);
      window.speechSynthesis.speak(utterance);
    },
    [pickVoice, runtime]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    speak(text);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Vignette — darkens the edges, no smoke/fog */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)" }}
      />

      {/* Status label */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-cyan-300/80 font-mono text-xs tracking-[0.3em]">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-cyan-300 animate-pulse" : "bg-cyan-500/50"}`} />
        IGRIS {isSpeaking ? "— SPEAKING" : "— ONLINE"}
      </div>

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-xl px-4 text-center text-cyan-100/90 text-sm font-light tracking-wide">
          {caption}
        </div>
      )}

      {/* Input bar */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[min(560px,92vw)] flex items-center gap-2 bg-white/5 backdrop-blur-md border border-cyan-400/20 rounded-full px-4 py-2.5 shadow-[0_0_30px_rgba(56,189,248,0.12)] focus-within:border-cyan-400/50 transition-colors"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something to Igris..."
          className="flex-1 bg-transparent outline-none text-cyan-50 placeholder:text-cyan-100/30 text-sm"
        />
        <button
          type="submit"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-cyan-400/10 hover:bg-cyan-400/20 active:scale-90 text-cyan-200 transition-all"
          aria-label="Send"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
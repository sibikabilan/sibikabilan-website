"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { atmosphereStore, sceneStore } from "@/lib/stores";
import { ATMOSPHERES } from "@/lib/atmosphere";

/**
 * A web of light: drifting nodes that link when they come close, with pulses
 * travelling node to node along whatever links exist at that moment. In the
 * prologue the nodes are choreographed through six formations, one per beat.
 */

const MAX_LINKS = 1600;
const PULSES = 0;

type Layout = { pos: Float32Array; link: number; wander: number };

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function layouts(n: number): { drift: Layout; beats: Layout[] } {
  const make = (fn: (i: number, r: () => number) => [number, number, number], seed: number, link: number, wander: number) => {
    const r = rng(seed);
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const [x, y, z] = fn(i, r);
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return { pos, link, wander };
  };
  const center = (i: number): [number, number, number] | null => (i === 0 ? [0, 0, 0.6] : null);

  const drift = make((_, r) => [(r() - 0.5) * 15, (r() - 0.5) * 8.5, -4.5 + r() * 5], 1, 1.75, 0.55);

  // 0 · someone on the other end: a wide scatter with one figure at the center
  const b0 = make((i, r) => center(i) ?? [(r() - 0.5) * 13, (r() - 0.5) * 7.5, -3 + r() * 3.2], 2, 1.85, 0.35);
  // 1 · the operator: a wall of screens
  const cols = 14;
  const b1 = make(
    (i, r) => center(i) ?? [((i % cols) / (cols - 1) - 0.5) * 11, (Math.floor(i / cols) / Math.ceil(n / cols) - 0.5) * 6.2, -1.6 + (r() - 0.5) * 0.15],
    3,
    1.02,
    0.05
  );
  // 2 · the customer: a form, field after field, with a few nodes drifting off
  const b2 = make((i, r) => {
    const c = center(i);
    if (c) return [2.6, -0.2, 0.6];
    if (r() < 0.28) return [(r() - 0.5) * 13, (r() - 0.5) * 7, -3 + r() * 2];
    const row = Math.floor(r() * 5);
    return [-2.2 + r() * 3.4, 1.6 - row * 0.8 + (r() - 0.5) * 0.06, 0];
  }, 4, 0.72, 0.06);
  // 3 · the team: clusters, reaching for each other
  const hubs: [number, number, number][] = [[-3.4, 1.1, 0], [3.1, 1.3, -0.6], [-2.2, -1.7, 0.4], [2.6, -1.5, 0], [0, 0.1, -1.2]];
  const b3 = make((i, r) => {
    const c = center(i);
    if (c) return c;
    const h = hubs[i % hubs.length];
    const a = r() * Math.PI * 2;
    const b = Math.acos(2 * r() - 1);
    const d = 0.95 * Math.cbrt(r());
    return [h[0] + d * Math.sin(b) * Math.cos(a), h[1] + d * Math.sin(b) * Math.sin(a), h[2] + d * Math.cos(b)];
  }, 5, 1.1, 0.12);
  // 4 · build for that person first: everything turns towards one point
  const b4 = make((i, r) => {
    const c = center(i);
    if (c) return [0, 0, 0];
    const a = r() * Math.PI * 2;
    const b = Math.acos(2 * r() - 1);
    const d = 1.1 + Math.pow(r(), 0.6) * 1.6;
    return [d * Math.sin(b) * Math.cos(a), d * Math.sin(b) * Math.sin(a) * 0.85, d * Math.cos(b) * 0.6];
  }, 6, 1.45, 0.1);
  // 5 · the rest, I write down: lines of text on a page
  const rows = 7;
  const b5 = make((i, r) => {
    const c = center(i);
    if (c) return [-4.6, 2.0, 0];
    const row = i % rows;
    const len = row === rows - 1 ? 0.45 : 0.75 + r() * 0.25;
    return [-4.6 + r() * 9.2 * len, 2.0 - row * 0.62, (r() - 0.5) * 0.1];
  }, 7, 0.58, 0.03);

  return { drift, beats: [b0, b1, b2, b3, b4, b5] };
}

const lineVertex = /* glsl */ `
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lineFragment = /* glsl */ `
  uniform vec3 uKey;
  uniform vec3 uRim;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec3 col = mix(uRim, uKey, clamp(vAlpha * 1.4, 0.0, 1.0));
    gl_FragColor = vec4(col, vAlpha * uOpacity);
  }
`;
const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute float aGlow;
  uniform float uPixelRatio;
  varying float vGlow;
  void main() {
    vGlow = aGlow;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (9.0 / -mv.z);
  }
`;
const pointFragment = /* glsl */ `
  uniform vec3 uKey;
  uniform vec3 uRim;
  uniform float uOpacity;
  varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    vec3 col = mix(uRim, uKey, clamp(vGlow, 0.0, 1.0));
    gl_FragColor = vec4(col, a * clamp(vGlow, 0.15, 1.6) * uOpacity);
  }
`;

export function Network() {
  const { viewport, gl } = useThree();
  const n = useMemo(() => (typeof window !== "undefined" && window.innerWidth < 768 ? 84 : 150), []);
  const lay = useMemo(() => layouts(n), [n]);

  const state = useMemo(() => {
    const p = new Float32Array(lay.drift.pos);
    const v = new Float32Array(n * 3);
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) phase[i] = Math.random() * 100;
    return { p, v, phase, degree: new Float32Array(n), pulses: Array.from({ length: PULSES }, () => ({ a: 0, b: 0, t: 1, speed: 0.6 })) };
  }, [lay, n]);

  const lines = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 6), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 2), 1).setUsage(THREE.DynamicDrawUsage));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    return g;
  }, []);

  const points = useMemo(() => {
    const total = n + PULSES;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(total * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(total), 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aGlow", new THREE.BufferAttribute(new Float32Array(total), 1).setUsage(THREE.DynamicDrawUsage));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    return g;
  }, [n]);

  const c0 = ATMOSPHERES[atmosphereStore.get().atmosphere];
  const uniforms = useMemo(
    () => ({
      uKey: { value: new THREE.Color(c0.key) },
      uRim: { value: new THREE.Color(c0.rim) },
      uOpacity: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: lineVertex,
        fragmentShader: lineFragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms]
  );
  const pointMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pointVertex,
        fragmentShader: pointFragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms]
  );

  const group = useRef<THREE.Group>(null);
  const mouse = useRef(new THREE.Vector2());
  const link = useRef(lay.drift.link);
  const neighbors = useMemo(() => Array.from({ length: n }, () => [] as number[]), [n]);
  const tmpKey = useMemo(() => new THREE.Color(), []);
  const tmpRim = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const scene = sceneStore.get();
    const atmo = atmosphereStore.get();
    const calm = atmo.motion === "calm";
    const t = frame.clock.elapsedTime;
    const prologue = scene.mode === "prologue" && scene.target === "network";
    // Nothing to draw outside the prologue once the fade has finished.
    if (!prologue && uniforms.uOpacity.value < 0.004) {
      uniforms.uOpacity.value = 0;
      return;
    }
    const layout = prologue ? lay.beats[Math.min(lay.beats.length - 1, Math.max(0, scene.beat))] : lay.drift;
    link.current += (layout.link - link.current) * Math.min(1, dt * 1.5);

    // ── move nodes: a damped spring towards their formation, plus a slow wander
    const { p, v, phase } = state;
    const k = prologue ? 2.4 : 0.9;
    const damp = prologue ? 2.6 : 1.6;
    const w = calm ? layout.wander * 0.2 : layout.wander;
    const speed = calm ? 0.15 : 1;
    for (let i = 0; i < n; i++) {
      const j = i * 3;
      const ph = phase[i];
      const tx = layout.pos[j] + Math.sin(t * 0.21 * speed + ph) * w;
      const ty = layout.pos[j + 1] + Math.cos(t * 0.17 * speed + ph * 1.3) * w;
      const tz = layout.pos[j + 2] + Math.sin(t * 0.13 * speed + ph * 0.7) * w;
      v[j] += ((tx - p[j]) * k - v[j] * damp) * dt;
      v[j + 1] += ((ty - p[j + 1]) * k - v[j + 1] * damp) * dt;
      v[j + 2] += ((tz - p[j + 2]) * k - v[j + 2] * damp) * dt;
      p[j] += v[j] * dt;
      p[j + 1] += v[j + 1] * dt;
      p[j + 2] += v[j + 2] * dt;
    }

    // ── links: every close pair, brighter the closer it is
    const lp = lines.getAttribute("position") as THREE.BufferAttribute;
    const la = lines.getAttribute("aAlpha") as THREE.BufferAttribute;
    const lpa = lp.array as Float32Array;
    const laa = la.array as Float32Array;
    const th = link.current;
    const th2 = th * th;
    let count = 0;
    const lineGain = prologue ? 0.95 : 0.5;
    const deg = state.degree;
    deg.fill(0);
    for (let i = 0; i < n; i++) neighbors[i].length = 0;
    for (let i = 0; i < n && count < MAX_LINKS; i++) {
      const ix = p[i * 3], iy = p[i * 3 + 1], iz = p[i * 3 + 2];
      for (let j = i + 1; j < n && count < MAX_LINKS; j++) {
        const dx = p[j * 3] - ix, dy = p[j * 3 + 1] - iy, dz = p[j * 3 + 2] - iz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > th2) continue;
        const a = Math.pow(1 - Math.sqrt(d2) / th, 1.6);
        const o = count * 6;
        lpa[o] = ix; lpa[o + 1] = iy; lpa[o + 2] = iz;
        lpa[o + 3] = p[j * 3]; lpa[o + 4] = p[j * 3 + 1]; lpa[o + 5] = p[j * 3 + 2];
        laa[count * 2] = a * lineGain;
        laa[count * 2 + 1] = a * lineGain;
        deg[i] += a;
        deg[j] += a;
        neighbors[i].push(j);
        neighbors[j].push(i);
        count++;
      }
    }
    lines.setDrawRange(0, count * 2);
    lp.needsUpdate = true;
    la.needsUpdate = true;

    // ── pulses travel along live links, node to node
    const pp = points.getAttribute("position") as THREE.BufferAttribute;
    const ps = points.getAttribute("aSize") as THREE.BufferAttribute;
    const pg = points.getAttribute("aGlow") as THREE.BufferAttribute;
    const ppa = pp.array as Float32Array;
    const psa = ps.array as Float32Array;
    const pga = pg.array as Float32Array;
    for (let i = 0; i < n; i++) {
      ppa[i * 3] = p[i * 3];
      ppa[i * 3 + 1] = p[i * 3 + 1];
      ppa[i * 3 + 2] = p[i * 3 + 2];
      const hero = prologue && i === 0;
      psa[i] = hero ? 26 + Math.sin(t * 2.2) * 4 : 5 + Math.min(deg[i], 4) * 2.2;
      pga[i] = hero ? 1.6 : 0.25 + Math.min(deg[i], 4) * 0.18;
    }
    state.pulses.forEach((pl, q) => {
      if (!calm) pl.t += dt * pl.speed;
      if (pl.t >= 1) {
        const nb = neighbors[pl.b];
        pl.a = pl.b;
        // In the prologue, pulses favour the figure at the center.
        if (prologue && nb.includes(0) && Math.random() < 0.35) pl.b = 0;
        else pl.b = nb.length ? nb[Math.floor(Math.random() * nb.length)] : Math.floor(Math.random() * n);
        pl.t = 0;
        pl.speed = 0.5 + Math.random() * 0.9;
      }
      const a = pl.a * 3;
      const b = pl.b * 3;
      const e = pl.t;
      const idx = (n + q) * 3;
      ppa[idx] = p[a] + (p[b] - p[a]) * e;
      ppa[idx + 1] = p[a + 1] + (p[b + 1] - p[a + 1]) * e;
      ppa[idx + 2] = p[a + 2] + (p[b + 2] - p[a + 2]) * e;
      psa[n + q] = 9 * Math.sin(Math.PI * e) + 2;
      pga[n + q] = 1.3 * Math.sin(Math.PI * e);
    });
    pp.needsUpdate = true;
    ps.needsUpdate = true;
    pg.needsUpdate = true;

    // ── look: colour, opacity, framing
    const c = ATMOSPHERES[atmo.atmosphere];
    const kk = Math.min(1, dt * 1.8);
    uniforms.uKey.value.lerp(tmpKey.set(c.key), kk);
    uniforms.uRim.value.lerp(tmpRim.set(c.rim), kk);
    // The web only appears in the prologue; everywhere else the stage stays clean.
    const target = prologue ? scene.opacity : 0;
    uniforms.uOpacity.value += (target - uniforms.uOpacity.value) * Math.min(1, dt * 1.6);
    uniforms.uPixelRatio.value = gl.getPixelRatio();

    const g = group.current;
    if (g) {
      const s = Math.min(1.1, Math.max(0.42, viewport.width / 12.5));
      g.scale.setScalar(g.scale.x + (s - g.scale.x) * Math.min(1, dt * 2));
      const mx = calm ? 0 : mouse.current.x;
      const my = calm ? 0 : mouse.current.y;
      const drift = calm ? 0 : Math.sin(t * 0.05) * 0.08;
      g.rotation.y += (mx * 0.12 + drift - g.rotation.y) * Math.min(1, dt * 1.5);
      g.rotation.x += (-my * 0.07 - g.rotation.x) * Math.min(1, dt * 1.5);
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lines} material={lineMat} frustumCulled={false} />
      <points geometry={points} material={pointMat} frustumCulled={false} />
    </group>
  );
}

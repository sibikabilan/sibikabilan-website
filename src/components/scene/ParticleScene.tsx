"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { atmosphereStore, sceneStore } from "@/lib/stores";
import { ATMOSPHERES } from "@/lib/atmosphere";
import { buildTargets, HALOS, ROLLING, SPINNING, type TargetKey } from "./targets";

/* ───────────────────────── shaders ───────────────────────── */

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uSpin;
  uniform float uRoll;
  uniform float uMotion;
  uniform vec3 uMouse;
  uniform float uDisperse;
  uniform vec2 uView;
  uniform vec3 uCenter;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aFromB;
  attribute float aToB;
  attribute float aRand;
  attribute float aSize;
  varying float vAlpha;
  varying float vLight;
  varying float vRand;

  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  void main() {
    float delay = aRand * 0.42;
    float p = clamp((uProgress - delay) / 0.58, 0.0, 1.0);
    float e = easeInOutCubic(p);
    vec3 pos = mix(aFrom, aTo, e);

    float mid = sin(p * 3.14159);
    vec3 swirl = vec3(
      sin(aRand * 61.0 + uTime * 0.7),
      cos(aRand * 47.0 + uTime * 0.6),
      sin(aRand * 29.0 + uTime * 0.5)
    );
    pos += swirl * mid * (0.6 + aRand * 1.2) * uMotion;
    pos += vec3(
      sin(uTime * 0.35 + aRand * 30.0),
      cos(uTime * 0.3 + aRand * 20.0),
      sin(uTime * 0.25 + aRand * 10.0)
    ) * 0.02 * uMotion;

    pos.xy = rot(uRoll) * pos.xy;
    pos.xz = rot(uSpin) * pos.xz;

    vec2 d = pos.xy - uMouse.xy;
    float push = smoothstep(1.15, 0.0, length(d)) * uMouse.z;
    pos.xy += normalize(d + 0.0001) * push * 0.5;
    pos.z += push * 0.7;

    // Leaving the hero: each grain breaks away and sinks like dust, shrinking to a
    // fine speck as it falls, and comes to rest low in the room, where the
    // prologue's smoke is being born from it (see ReadingLight).
    vec4 world = modelMatrix * vec4(pos, 1.0);
    float dd = clamp((uDisperse - aRand * 0.3) / 0.7, 0.0, 1.0);
    float de = dd * dd * (3.0 - 2.0 * dd);
    float arc = sin(de * 3.14159);
    if (dd > 0.0) {
      // Advect through one smooth flow field with gravity, so neighbouring grains
      // travel together in curling streams, the way poured smoke or dust in water does.
      vec2 p = world.xy;
      for (int i = 0; i < 4; i++) {
        vec2 f = vec2(
          sin(p.y * 1.4 + uTime * 0.5) + 0.6 * sin(p.y * 2.9 - uTime * 0.35 + p.x * 0.7),
          0.5 * cos(p.x * 1.2 - uTime * 0.45)
        );
        p += (f * 0.35 + vec2(0.0, -0.9)) * de * 0.6;
      }
      vec2 h = vec2(fract(aRand * 91.7), fract(aRand * 53.3 + 0.37));
      vec2 settle = vec2((h.x - 0.5) * uView.x * 1.05, (h.y * 0.5 - 0.5) * uView.y);
      vec2 burst = normalize(world.xy - uCenter.xy + vec2(0.0001)) * 0.7 * sin(min(de, 0.5) * 3.14159);
      world.xy = mix(p, settle, smoothstep(0.55, 1.0, de)) + burst;
      world.z += (fract(aRand * 17.1) - 0.5) * de;
    }

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * uPixelRatio * (1.0 / -mv.z) * (1.0 + push * 0.9) * mix(1.0, 0.3, de);

    vLight = clamp(0.5 + pos.x * 0.24 + pos.y * 0.07 + pos.z * 0.15, 0.0, 1.0);
    vAlpha = (0.45 + 0.55 * fract(aRand * 7.31)) * mix(aFromB, aToB, e) * (1.0 + push * 1.4);
    vAlpha *= (1.0 - 0.2 * arc) * (1.0 - smoothstep(0.7, 1.0, dd));
    vRand = aRand;
  }
`;

const particleFragment = /* glsl */ `
  uniform vec3 uKey;
  uniform vec3 uRim;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vLight;
  varying float vRand;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    vec3 col = mix(uRim, uKey, smoothstep(0.12, 0.88, vLight));
    col = mix(col, vec3(1.0), 0.22 * step(0.94, vRand));
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
  }
`;

/* ───────────────────────── helpers ───────────────────────── */

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ───────────────────────── stage ───────────────────────── */

function Stage({ count }: { count: number }) {
  const { viewport, gl, camera } = useThree();
  const targets = useMemo(() => buildTargets(count), [count]);

  const { geometry, rand } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const scatter = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      const r = 6 + Math.random() * 6;
      scatter[i * 3] = r * Math.sin(b) * Math.cos(a);
      scatter[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
      scatter[i * 3 + 2] = r * Math.cos(b) - 4;
      rnd[i] = Math.random();
      const s = Math.random();
      size[i] = s > 0.985 ? 2.6 + Math.random() * 2 : 0.45 + s * 1.1;
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(scatter, 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(scatter.slice(), 3));
    const tone = new Float32Array(count).fill(0.6);
    g.setAttribute("aFromB", new THREE.BufferAttribute(tone, 1));
    g.setAttribute("aToB", new THREE.BufferAttribute(tone.slice(), 1));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    return { geometry: g, rand: rnd };
  }, [count]);

  const initial = ATMOSPHERES[atmosphereStore.get().atmosphere];
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uSize: { value: 30 },
          uPixelRatio: { value: 1 },
          uSpin: { value: 0 },
          uRoll: { value: 0 },
          uMotion: { value: 1 },
          uMouse: { value: new THREE.Vector3(99, 99, 0) },
          uKey: { value: new THREE.Color(initial.key) },
          uRim: { value: new THREE.Color(initial.rim) },
          uOpacity: { value: 0 },
          uDisperse: { value: 0 },
          uView: { value: new THREE.Vector2(10, 6) },
          uCenter: { value: new THREE.Vector3() },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const group = useRef<THREE.Group>(null);
  const motion = useRef({
    current: null as TargetKey | null,
    spinSpeed: 0,
    rollSpeed: 0,
    progress: 1,
    duration: 2.6,
    mouse: new THREE.Vector2(0, 0),
    mouseActive: 0,
    lastMove: 0,
    keyColor: new THREE.Color(initial.key),
    rimColor: new THREE.Color(initial.rim),
    beamColor: new THREE.Color(initial.beam),
  });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      motion.current.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      motion.current.lastMove = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  /** Freezes the in-flight interpolation into aFrom, so a new move starts where particles are. */
  function retarget(next: TargetKey) {
    if (!targets) return;
    const m = motion.current;
    const from = geometry.getAttribute("aFrom") as THREE.BufferAttribute;
    const to = geometry.getAttribute("aTo") as THREE.BufferAttribute;
    const fromB = geometry.getAttribute("aFromB") as THREE.BufferAttribute;
    const toB = geometry.getAttribute("aToB") as THREE.BufferAttribute;
    const fa = from.array as Float32Array;
    const ta = to.array as Float32Array;
    const fb = fromB.array as Float32Array;
    const tb = toB.array as Float32Array;
    if (m.progress < 1) {
      for (let i = 0; i < count; i++) {
        const p = Math.min(1, Math.max(0, (m.progress - rand[i] * 0.42) / 0.58));
        const e = ease(p);
        const j = i * 3;
        fa[j] += (ta[j] - fa[j]) * e;
        fa[j + 1] += (ta[j + 1] - fa[j + 1]) * e;
        fa[j + 2] += (ta[j + 2] - fa[j + 2]) * e;
        fb[i] += (tb[i] - fb[i]) * e;
      }
    } else {
      fa.set(ta);
      fb.set(tb);
    }
    ta.set(targets[next].pos);
    tb.set(targets[next].bright);
    from.needsUpdate = true;
    to.needsUpdate = true;
    fromB.needsUpdate = true;
    toB.needsUpdate = true;
    m.current = next;
    m.progress = 0;
  }

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const m = motion.current;
    const scene = sceneStore.get();
    const atmo = atmosphereStore.get();
    const calm = atmo.motion === "calm";
    const u = material.uniforms;
    const t = state.clock.elapsedTime;

    const wanted: TargetKey = HALOS[((scene.variant % HALOS.length) + HALOS.length) % HALOS.length].key;
    if (targets && wanted !== m.current) {
      const haloToHalo = m.current?.startsWith("halo-") && wanted.startsWith("halo-");
      m.duration = calm ? 1.2 : m.current === null ? 3.2 : haloToHalo ? 1.9 : 2.6;
      retarget(wanted);
    }
    if (m.progress < 1) m.progress = Math.min(1, m.progress + dt / m.duration);

    const narrow = viewport.aspect < 0.95;
    let scale = Math.min(1, Math.max(0.5, viewport.width / 10.5));
    const side = narrow ? 0 : scene.side;
    let xTarget = side * Math.max(0, viewport.width / 2 - 2.8 * scale);
    let yTarget = 0;
    let follow = 1.6;
    if (scene.anchor) {
      // Pin the light to a DOM element (the portrait's head) and size it to match.
      scale = (scene.anchor.size * viewport.width * 0.5) / 2.05;
      xTarget = (scene.anchor.x * viewport.width) / 2;
      yTarget = (scene.anchor.y * viewport.height) / 2;
      follow = 9;
    }
    const g = group.current;
    // Mid-dispersal with the portrait gone, the halo holds its place so the grains
    // already in flight don't jump.
    const dispersing = !calm && scene.disperse > 0.001;
    if (g && !(dispersing && !scene.anchor)) {
      g.position.x += (xTarget - g.position.x) * Math.min(1, dt * follow);
      g.position.y += (yTarget - g.position.y) * Math.min(1, dt * follow);
      const s = g.scale.x + (scale - g.scale.x) * Math.min(1, dt * (scene.anchor ? 9 : 2));
      g.scale.setScalar(s);
      const mx = calm ? 0 : m.mouse.x;
      const my = calm ? 0 : m.mouse.y;
      // Keep the halo facing the camera; just a whisper of parallax.
      g.rotation.y += (mx * 0.1 - g.rotation.y) * Math.min(1, dt * 2.2);
      g.rotation.x += (-my * 0.06 - g.rotation.x) * Math.min(1, dt * 2.2);
    }

    // mouse in group space
    const active = !calm && performance.now() - m.lastMove < 2200 ? 1 : 0;
    m.mouseActive += (active * 0.5 - m.mouseActive) * Math.min(1, dt * 3);
    if (g) {
      const wx = (m.mouse.x * viewport.width) / 2;
      const wy = (m.mouse.y * viewport.height) / 2;
      u.uMouse.value.set((wx - g.position.x) / g.scale.x, (wy - g.position.y) / g.scale.x, m.mouseActive);
    }

    const c = ATMOSPHERES[atmo.atmosphere];
    const k = Math.min(1, dt * 1.8);
    m.keyColor.lerp(new THREE.Color(c.key), k);
    m.rimColor.lerp(new THREE.Color(c.rim), k);
    m.beamColor.lerp(new THREE.Color(c.beam), k);
    u.uKey.value.copy(m.keyColor);
    u.uRim.value.copy(m.rimColor);

    // Speeds ease, angles accumulate: changing crowns never whips the ring around.
    const spinTarget = m.current ? SPINNING[m.current] : 0;
    m.spinSpeed += (spinTarget - m.spinSpeed) * Math.min(1, dt * 0.8);
    const rollTarget = m.current && !calm ? ROLLING[m.current] : 0;
    m.rollSpeed += (rollTarget - m.rollSpeed) * Math.min(1, dt * 0.8);
    u.uSpin.value += dt * 0.11 * m.spinSpeed;
    u.uRoll.value += dt * 0.12 * m.rollSpeed;
    u.uMotion.value += ((calm ? 0.15 : 1) - u.uMotion.value) * Math.min(1, dt * 2);
    const flowing = dispersing && scene.disperse < 0.999;
    const haloOpacity = scene.target === "halo" || flowing ? 1 : 0;
    u.uDisperse.value = calm ? 0 : scene.disperse;
    u.uView.value.set(viewport.width, viewport.height);
    if (g) u.uCenter.value.copy(g.position);
    u.uOpacity.value += (haloOpacity - u.uOpacity.value) * Math.min(1, dt * 2.2);
    u.uTime.value = t;
    u.uProgress.value = m.progress;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uSize.value = narrow ? 22 : 26;



    camera.position.y += ((calm ? 0 : m.mouse.y * 0.15) - camera.position.y) * Math.min(1, dt * 1.5);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group ref={group}>
        <points geometry={geometry} material={material} />
      </group>
    </>
  );
}

export default function ParticleScene() {
  const [count] = useState(() => {
    if (typeof window === "undefined") return 9000;
    const small = window.innerWidth < 768;
    const weak = (navigator.hardwareConcurrency || 4) <= 4;
    return small ? 8000 : weak ? 12000 : 18000;
  });

  return (
    <Canvas
      className="!fixed inset-0 !h-[100lvh] !w-full"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <Stage count={count} />
    </Canvas>
  );
}

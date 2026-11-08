"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { atmosphereStore, sceneStore, type SceneTarget } from "@/lib/stores";
import { ATMOSPHERES } from "@/lib/atmosphere";
import { buildTargets, SPINNING } from "./targets";

/* ───────────────────────── shaders ───────────────────────── */

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uSpin;
  uniform float uMotion;
  uniform vec3 uMouse;
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

    pos.xz = rot(uTime * 0.11 * uSpin) * pos.xz;

    vec2 d = pos.xy - uMouse.xy;
    float push = smoothstep(1.15, 0.0, length(d)) * uMouse.z;
    pos.xy += normalize(d + 0.0001) * push * 0.5;
    pos.z += push * 0.7;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * uPixelRatio * (1.0 / -mv.z) * (1.0 + push * 0.9);

    vLight = clamp(0.5 + pos.x * 0.24 + pos.y * 0.07 + pos.z * 0.15, 0.0, 1.0);
    vAlpha = (0.45 + 0.55 * fract(aRand * 7.31)) * mix(aFromB, aToB, e) * (1.0 + push * 1.4);
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

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - vec2(0.62, 1.08);
    float ang = atan(p.x, -p.y);
    float cone = smoothstep(0.36, 0.0, abs(ang + 0.12));
    float fall = smoothstep(1.25, 0.05, length(p));
    float streaks = 0.82 + 0.18 * sin(ang * 90.0 + uTime * 0.4);
    float flick = 0.92 + 0.08 * sin(uTime * 1.3) * sin(uTime * 0.71 + 1.0);
    float a = cone * fall * streaks * flick * 0.42;
    gl_FragColor = vec4(uColor, a * uOpacity);
  }
`;

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aRand;
  varying float vA;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * 0.07 * (0.4 + aRand) + 4.5, 9.0) - 4.5;
    p.x += sin(uTime * 0.2 + aRand * 10.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (10.0 + aRand * 26.0) * uPixelRatio * (1.0 / -mv.z);
    vA = 0.15 + 0.5 * aRand;
  }
`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vA * uOpacity);
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
          uMotion: { value: 1 },
          uMouse: { value: new THREE.Vector3(99, 99, 0) },
          uKey: { value: new THREE.Color(initial.key) },
          uRim: { value: new THREE.Color(initial.rim) },
          uOpacity: { value: 0 },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const beam = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(initial.beam) },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const dust = useMemo(() => {
    const n = 420;
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(n * 3);
    const r = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 16;
      p[i * 3 + 1] = (Math.random() - 0.5) * 9;
      p[i * 3 + 2] = Math.random() * 5 - 3;
      r[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(r, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: new THREE.Color(initial.beam) },
        uOpacity: { value: 0 },
      },
    });
    return { geometry: g, material: m };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const group = useRef<THREE.Group>(null);
  const motion = useRef({
    current: null as SceneTarget | null,
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
  function retarget(next: SceneTarget) {
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

    if (targets && scene.target !== m.current) {
      m.duration = calm ? 1.2 : m.current === null ? 3.4 : 2.6;
      retarget(scene.target);
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
      yTarget = (scene.anchor.y * viewport.height) / 2 - 0.55 * scale;
      follow = 9;
    }
    const g = group.current;
    if (g) {
      g.position.x += (xTarget - g.position.x) * Math.min(1, dt * follow);
      g.position.y += (yTarget - g.position.y) * Math.min(1, dt * follow);
      const s = g.scale.x + (scale - g.scale.x) * Math.min(1, dt * (scene.anchor ? 9 : 2));
      g.scale.setScalar(s);
      const mx = calm ? 0 : m.mouse.x;
      const my = calm ? 0 : m.mouse.y;
      g.rotation.y += (mx * 0.32 - g.rotation.y) * Math.min(1, dt * 2.2);
      g.rotation.x += (-my * 0.12 - g.rotation.x) * Math.min(1, dt * 2.2);
    }

    // mouse in group space
    const active = !calm && performance.now() - m.lastMove < 2200 ? 1 : 0;
    m.mouseActive += (active - m.mouseActive) * Math.min(1, dt * 3);
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

    const spinTarget = m.current ? SPINNING[m.current] : 0;
    u.uSpin.value += (spinTarget - u.uSpin.value) * Math.min(1, dt * 0.8);
    u.uMotion.value += ((calm ? 0.15 : 1) - u.uMotion.value) * Math.min(1, dt * 2);
    u.uOpacity.value += (scene.opacity - u.uOpacity.value) * Math.min(1, dt * 2.2);
    u.uTime.value = t;
    u.uProgress.value = m.progress;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uSize.value = narrow ? 22 : 26;

    beam.uniforms.uTime.value = t;
    beam.uniforms.uColor.value.copy(m.beamColor);
    beam.uniforms.uOpacity.value = u.uOpacity.value * (scene.target === "halo" ? 0.75 : 0.4);

    dust.material.uniforms.uTime.value = calm ? 0 : t;
    dust.material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    dust.material.uniforms.uColor.value.copy(m.beamColor);
    dust.material.uniforms.uOpacity.value = Math.max(0.35, u.uOpacity.value);

    camera.position.y += ((calm ? 0 : m.mouse.y * 0.15) - camera.position.y) * Math.min(1, dt * 1.5);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <mesh position={[0, 0.4, -3]} material={beam}>
        <planeGeometry args={[18, 11]} />
      </mesh>
      <points geometry={dust.geometry} material={dust.material} />
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

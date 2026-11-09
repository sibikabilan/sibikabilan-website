"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { atmosphereStore, sceneStore } from "@/lib/stores";
import { ATMOSPHERES } from "@/lib/atmosphere";
import { loadTargets, SILHOUETTES, type Target, type TargetKey } from "./targets";

/* ───────────────────────── shaders ───────────────────────── */

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMotion;
  uniform vec3 uMouse;
  uniform float uDisperse;
  uniform vec2 uView;
  uniform vec3 uCenter;
  uniform float uField;
  uniform vec2 uLamp;
  uniform float uWarmth;
  uniform float uReturn;
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
  float hash12(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }

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

    vec2 d = pos.xy - uMouse.xy;
    float push = smoothstep(1.15, 0.0, length(d)) * uMouse.z;
    pos.xy += normalize(d + 0.0001) * push * 0.5;
    pos.z += push * 0.7;

    // Leaving the hero: each grain breaks away and pours down like dust, gathers on the
    // floor, and rises again as the smoke the prologue is read in. The smoke is made of
    // the same grains: each has a place in a slow current that climbs through the whole
    // room and wraps, thick in some places and thin in others, and brightest around the
    // word being read (uLamp). The prologue's own soft light sits underneath (see ReadingLight).
    // Scrolling back up (uReturn) is not that pour played backwards, which would sink the smoke
    // off the bottom of the screen and leave nothing to see: the smoke is drawn back up into
    // him instead, each grain curling as it goes, and the shape gathers out of the room.
    vec4 world = modelMatrix * vec4(pos, 1.0);
    float dd = clamp((uDisperse - aRand * 0.3) / 0.7, 0.0, 1.0);
    float de = dd * dd * (3.0 - 2.0 * dd);
    float arc = sin(de * 3.14159);
    vec3 h3 = vec3(fract(aRand * 91.7), fract(aRand * 53.3 + 0.37), fract(aRand * 27.1 + 0.71));
    float climb = fract(h3.y + uTime * (0.004 + 0.009 * h3.z));
    vec2 room = vec2((h3.x - 0.5) * uView.x * 1.08, (climb - 0.5) * uView.y * 1.1);
    room.x += 0.45 * sin(room.y * 0.55 + uTime * 0.16 + h3.z * 6.28) + 0.18 * sin(room.y * 1.7 - uTime * 0.12 + h3.x * 4.0);
    room.y += 0.22 * cos(room.x * 0.8 + uTime * 0.13);
    float toRoom = smoothstep(0.6, 1.0, dd);
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
      // It lands on the floor first, then climbs to its place in the room.
      float floorY = -0.5 * uView.y - 0.2;
      vec2 settle = vec2(room.x, mix(floorY, room.y, smoothstep(0.75, 1.0, de)));
      vec2 burst = normalize(world.xy - uCenter.xy + vec2(0.0001)) * 0.7 * sin(min(de, 0.5) * 3.14159);
      vec2 fall = mix(p, settle, smoothstep(0.45, 0.9, de)) + burst;
      // Both ways meet at the ends: in the shape (de 0), and at the grain's place in the room (de 1).
      vec2 curl = vec2(
        sin(world.y * 1.3 + uTime * 0.55 + h3.z * 6.28),
        0.6 * cos(world.x * 1.1 - uTime * 0.45 + h3.x * 6.28)
      );
      // While he is still above the screen, the gathering cloud waits just inside its top edge
      // rather than leaving through it, and follows him in as the hero comes back down.
      vec2 home = world.xy;
      float lid = 0.5 * uView.y - 0.25;
      if (home.y > lid) home.y = mix(home.y, lid + (home.y - lid) * 0.2, smoothstep(0.0, 0.25, de));
      vec2 gather = mix(home, room, de) + burst + curl * sin(de * 3.14159) * (0.45 + 0.6 * h3.y);
      world.xy = mix(fall, gather, uReturn);
      world.z += (fract(aRand * 17.1) - 0.5) * de;
    }

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * uPixelRatio * (1.0 / -mv.z) * (1.0 + push * 0.9) * mix(1.0, 0.82, de);

    float warm = 0.2 + 0.7 * uWarmth;
    vLight = mix(clamp(0.5 + pos.x * 0.24 + pos.y * 0.07 + pos.z * 0.15, 0.0, 1.0), warm, toRoom);
    float grain = 0.45 + 0.55 * fract(aRand * 7.31);
    // Falling, every grain shows at least as a fine speck, so the pour reads as a stream of dust.
    float shadow = grain * max(mix(aFromB, aToB, e), 0.42 * dd) * (1.0 + push * 1.4) * (1.0 - 0.15 * arc) * (1.0 + 0.9 * uReturn * arc);
    // In the room: drifting banks of smoke, lit around the reader's word, faded where the current wraps.
    // Banks drawn out sideways, the way smoke layers in still air, with a finer curl inside them.
    vec2 q = room * vec2(0.26, 0.5) + vec2(uTime * 0.02, -uTime * 0.03);
    float dens = smoothstep(0.3, 0.8, 0.68 * vnoise(q) + 0.32 * vnoise(q * 2.3 + 4.1));
    vec2 dl = (room - uLamp) * vec2(0.7, 1.1);
    float lit = exp(-dot(dl, dl) * 0.08);
    float wrap = smoothstep(0.0, 0.08, climb) * smoothstep(1.0, 0.9, climb);
    float smoke = grain * (0.12 + 1.15 * dens * dens) * (0.55 + 1.6 * lit) * (0.8 + 0.4 * uWarmth) * wrap * uField;
    vAlpha = mix(shadow, smoke, toRoom);
    vRand = aRand;
  }
`;

const particleFragment = /* glsl */ `
  uniform vec3 uKey;
  uniform vec3 uRim;
  uniform float uOpacity;
  uniform sampler2D uOcc;
  uniform vec4 uOccRect;
  uniform float uOccOn;
  uniform vec2 uCss;
  uniform vec2 uRes;
  varying float vAlpha;
  varying float vLight;
  varying float vRand;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    vec3 col = mix(uRim, uKey, smoothstep(0.12, 0.88, vLight));
    col = mix(col, vec3(1.0), 0.22 * step(0.94, vRand));

    // He stands in front of his shadow: no grain is drawn over his shape, even where the
    // portrait fades into the page. The mask is his cutout, read a little blurred and
    // thresholded low so it reaches a few pixels past his edge (his live clip moves a touch).
    if (uOccOn > 0.5) {
      vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) * (uCss / uRes);
      vec2 uv = (css - uOccRect.xy) / uOccRect.zw;
      if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
        float body = smoothstep(0.06, 0.4, texture2D(uOcc, vec2(uv.x, 1.0 - uv.y), 2.0).a);
        // His shoulders are cut off at the square's sides; soften the cut there.
        body *= smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x);
        a *= 1.0 - body;
      }
    }
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
  }
`;

/* ───────────────────────── helpers ───────────────────────── */

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ───────────────────────── stage ───────────────────────── */

function Stage({ count }: { count: number }) {
  const { viewport, gl, camera } = useThree();
  // The shapes are traced from small mask images, so they arrive a moment after the scene.
  const [targets, setTargets] = useState<Record<TargetKey, Target> | null>(null);
  useEffect(() => {
    let live = true;
    loadTargets(count)
      .then((t) => live && setTargets(t))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [count]);

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
          uMotion: { value: 1 },
          uMouse: { value: new THREE.Vector3(99, 99, 0) },
          uKey: { value: new THREE.Color(initial.key) },
          uRim: { value: new THREE.Color(initial.rim) },
          uOpacity: { value: 0 },
          uDisperse: { value: 0 },
          uView: { value: new THREE.Vector2(10, 6) },
          uCenter: { value: new THREE.Vector3() },
          uField: { value: 0 },
          uLamp: { value: new THREE.Vector2(0, 0) },
          uWarmth: { value: 0 },
          uReturn: { value: 0 },
          uOcc: { value: null as THREE.Texture | null },
          uOccRect: { value: new THREE.Vector4(0, 0, 1, 1) },
          uOccOn: { value: 0 },
          uCss: { value: new THREE.Vector2(1, 1) },
          uRes: { value: new THREE.Vector2(1, 1) },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // His cutout, as the shape the dust is kept out of (the page has already loaded it).
  useEffect(() => {
    let tex: THREE.Texture | null = null;
    let live = true;
    new THREE.TextureLoader().load("/media/sibi-cutout.webp", (t) => {
      if (!live) return t.dispose();
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      tex = t;
      material.uniforms.uOcc.value = t;
    });
    return () => {
      live = false;
      tex?.dispose();
      material.uniforms.uOcc.value = null;
    };
  }, [material]);

  const group = useRef<THREE.Group>(null);
  const buffer = useMemo(() => new THREE.Vector2(), []);
  const motion = useRef({
    current: null as TargetKey | null,
    progress: 1,
    duration: 2.6,
    mouse: new THREE.Vector2(0, 0),
    mouseActive: 0,
    lastMove: 0,
    /** Which way the dust last moved: 0 pouring down into the prologue, 1 gathering back into the hero. */
    returning: 0,
    lastDisperse: 0,
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

    const n = SILHOUETTES.length;
    const wanted: TargetKey = SILHOUETTES[((scene.variant % n) + n) % n].key;
    if (targets && wanted !== m.current) {
      m.duration = calm ? 1.2 : m.current === null ? 3.2 : 1.9;
      retarget(wanted);
    }
    if (m.progress < 1) m.progress = Math.min(1, m.progress + dt / m.duration);

    const narrow = viewport.aspect < 0.95;
    let scale = Math.min(1, Math.max(0.5, viewport.width / 10.5));
    const side = narrow ? 0 : scene.side;
    let xTarget = side * Math.max(0, viewport.width / 2 - 2.8 * scale);
    let yTarget = 0;
    let follow = 1.6;
    // The canvas's own size in CSS px: on phones it is taller than the window while the
    // browser's toolbar shows, so DOM positions are mapped onto it, not onto the window.
    const cssW = gl.domElement.clientWidth || window.innerWidth;
    const cssH = gl.domElement.clientHeight || window.innerHeight;
    if (scene.anchor) {
      // Pin the shadow to its frame in the hero and size it to match.
      scale = ((scene.anchor.width / cssW) * viewport.width * 0.5) / 2.05;
      xTarget = (scene.anchor.x / cssW - 0.5) * viewport.width;
      yTarget = (0.5 - scene.anchor.y / cssH) * viewport.height;
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

    u.uMotion.value += ((calm ? 0.15 : 1) - u.uMotion.value) * Math.min(1, dt * 2);
    // Once dispersed, the dust stays on as the prologue's smoke for as long as the prologue is in view.
    const settled = dispersing && scene.field > 0.001;
    // Nothing shows until the shapes are ready, so the first thing seen is the figure gathering.
    const haloOpacity = targets && (scene.target === "halo" || settled) ? 1 : 0;
    u.uDisperse.value = calm ? 0 : scene.disperse;
    // Read the direction from the scroll, and ease between the two paths so a change of
    // heart mid-way slides the grains across rather than jumping them.
    if (scene.disperse < m.lastDisperse - 0.001) m.returning = 1;
    else if (scene.disperse > m.lastDisperse + 0.001) m.returning = 0;
    m.lastDisperse = scene.disperse;
    u.uReturn.value += (m.returning - u.uReturn.value) * Math.min(1, dt * 4);
    u.uView.value.set(viewport.width, viewport.height);
    if (g) u.uCenter.value.copy(g.position);
    u.uOpacity.value += (haloOpacity - u.uOpacity.value) * Math.min(1, dt * 2.2);
    u.uTime.value = t;
    u.uProgress.value = m.progress;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uSize.value = narrow ? 22 : 26;
    u.uField.value = scene.field;
    u.uWarmth.value += (scene.warmth - u.uWarmth.value) * Math.min(1, dt * 2);
    // The lamp drifts after the reader's eye rather than jumping from word to word.
    const lx = (scene.lamp.x / cssW - 0.5) * viewport.width;
    const ly = (0.5 - scene.lamp.y / cssH) * viewport.height;
    u.uLamp.value.x += (lx - u.uLamp.value.x) * Math.min(1, dt * 2.5);
    u.uLamp.value.y += (ly - u.uLamp.value.y) * Math.min(1, dt * 2.5);

    const occ = scene.occluder;
    u.uOccOn.value = occ && u.uOcc.value ? 1 : 0;
    if (occ) u.uOccRect.value.set(occ.left, occ.top, occ.width, occ.height);
    u.uCss.value.set(cssW, cssH);
    gl.getDrawingBufferSize(buffer);
    u.uRes.value.copy(buffer);


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

"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { useAtmosphere } from "@/lib/stores";
import { ATMOSPHERES } from "@/lib/atmosphere";

/**
 * Light to read by. A slow field of domain warped smoke, lit from where the
 * reader is: a soft lamp follows the word being read, and the whole room
 * warms from night blue to lamplight as the paragraph comes to its end.
 *
 * The smoke is born from the hero's dust. As the grains sink and settle low
 * in the room, it gathers from the bottom up, first as fine specks drifting
 * with the flow, then filling in as continuous smoke.
 * Fine ordered dithering keeps the gradients smooth, with no banding and no flicker.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uProgress;
  uniform float uFade;
  uniform float uBirth;
  uniform vec2 uLamp;
  uniform vec3 uCool;
  uniform vec3 uWarm;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = r * p * 2.02 + 3.1;
      a *= 0.5;
    }
    return v;
  }
  // 4x4 Bayer matrix, for dithering the gradient instead of letting it band.
  float bayer(vec2 c) {
    vec2 p = mod(floor(c), 4.0);
    float i = p.x + p.y * 4.0;
    float b = 0.0;
    if (i < 1.0) b = 0.0; else if (i < 2.0) b = 8.0; else if (i < 3.0) b = 2.0; else if (i < 4.0) b = 10.0;
    else if (i < 5.0) b = 12.0; else if (i < 6.0) b = 4.0; else if (i < 7.0) b = 14.0; else if (i < 8.0) b = 6.0;
    else if (i < 9.0) b = 3.0; else if (i < 10.0) b = 11.0; else if (i < 11.0) b = 1.0; else if (i < 12.0) b = 9.0;
    else if (i < 13.0) b = 15.0; else if (i < 14.0) b = 7.0; else if (i < 15.0) b = 13.0; else b = 5.0;
    return b / 16.0;
  }

  void main() {
    vec2 frag = vUv * uRes;
    vec2 p = (frag - 0.5 * uRes) / uRes.y;
    float t = uTime * 0.03;

    // Smoke: two passes of domain warping, drifting slowly.
    vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p * 1.1 + 2.1 * q + vec2(1.7, 9.2) + 0.7 * t), fbm(p * 1.1 + 2.1 * q + vec2(8.3, 2.8) - 0.5 * t));
    float smoke = fbm(p * 1.0 + 2.3 * r);
    smoke = smoothstep(0.3, 0.86, smoke);

    // The lamp: wide and soft, centred on the word being read.
    vec2 lamp = (uLamp * uRes - 0.5 * uRes) / uRes.y;
    float d = length((p - lamp) * vec2(0.85, 1.25));
    float glow = exp(-d * d * 4.5);
    float halo = exp(-d * d * 0.9);

    // Night blue at the first word, lamplight by the last.
    float warmth = smoothstep(0.08, 0.95, uProgress);
    vec3 tint = mix(uCool, uWarm, warmth);

    float light = (0.045 + 0.17 * smoke) * (0.22 + 1.05 * halo) + 0.12 * glow * (0.55 + 0.45 * smoke);
    light *= 0.8 + 0.6 * warmth;

    // Only light is drawn; everywhere else stays transparent, so the page's own
    // background, grain and spotlight carry straight through and no edge shows.
    float edge = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
    float a = clamp(light * 1.15, 0.0, 1.0) * edge * uFade;

    // Born from the dust: a front rises from the floor as the grains land, and
    // below it the smoke starts as specks that fill in as it thickens.
    float front = mix(-0.75, 0.95, uBirth);
    float rise = smoothstep(front + 0.3, front - 0.2, p.y);
    float speck = step(0.85 - 0.85 * uBirth, hash(floor((p + 0.08 * r) * uRes.y / 2.2)));
    a *= rise * mix(speck * 2.2, 1.0, smoothstep(0.45, 1.0, uBirth));
    a += (bayer(frag) - 0.5) / 255.0 * 2.0 * step(0.002, a);
    a = max(a, 0.0);
    gl_FragColor = vec4(tint * a, a);
  }
`;

export function ReadingLight({
  progress,
  lamp,
}: {
  /** Scroll progress through the prologue, 0 to 1. */
  progress: MotionValue<number>;
  /** Where the reader's eye is, in viewport fractions (0,0 top left). */
  lamp: RefObject<{ x: number; y: number }>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { motion, atmosphere } = useAtmosphere();
  const palette = useRef(ATMOSPHERES[atmosphere]);

  useEffect(() => {
    palette.current = ATMOSPHERES[atmosphere];
  }, [atmosphere]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || motion === "calm") return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
      renderer.setClearColor(0x000000, 0);
    } catch {
      return;
    }
    const c = palette.current;
    const warm = new THREE.Color(c.key).lerp(new THREE.Color("#c99a62"), 0.5);
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uFade: { value: 0 },
        uBirth: { value: 0 },
        uLamp: { value: new THREE.Vector2(0.5, 0.5) },
        uCool: { value: new THREE.Color(c.rim) },
        uWarm: { value: warm },
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: THREE.NoBlending,
    });
    const scene = new THREE.Scene();
    const cam = new THREE.Camera();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    // The field is soft, so it renders at reduced resolution and is scaled up by the browser.
    const resize = () => {
      const small = window.innerWidth < 768;
      const scale = Math.min(window.devicePixelRatio, 1.5) * (small ? 0.5 : 0.7);
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      renderer.setPixelRatio(scale);
      renderer.setSize(w, h, false);
      (mat.uniforms.uRes.value as THREE.Vector2).set(w * scale, h * scale);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);

    const at = new THREE.Vector2(0.5, 0.45);
    let fade = 0;
    let raf = 0;
    const start = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const l = lamp.current;
      // Eased toward the reading position so the lamp drifts rather than jumps.
      at.lerp(new THREE.Vector2(l.x, 1 - l.y), 0.045);
      fade += (1 - fade) * 0.03;
      const pal = palette.current;
      mat.uniforms.uTime.value = (performance.now() - start) / 1000;
      const pr = progress.get();
      mat.uniforms.uProgress.value = pr;
      // In step with the hero's dust settling: it sinks while the prologue rises into view.
      const b = Math.min(1, Math.max(0, (pr - 0.06) / 0.34));
      mat.uniforms.uBirth.value = b * b * (3 - 2 * b);
      mat.uniforms.uFade.value = fade;
      (mat.uniforms.uLamp.value as THREE.Vector2).copy(at);
      (mat.uniforms.uCool.value as THREE.Color).lerp(new THREE.Color(pal.rim), 0.05);
      (mat.uniforms.uWarm.value as THREE.Color).lerp(new THREE.Color(pal.key).lerp(new THREE.Color("#c99a62"), 0.5), 0.05);
      renderer.render(scene, cam);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mat.dispose();
      renderer.dispose();
    };
  }, [motion, progress, lamp]);

  if (motion === "calm") {
    return (
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(50% 45% at 50% 50%, color-mix(in oklab, var(--key) 7%, transparent), transparent 75%)" }}
      />
    );
  }
  return <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />;
}

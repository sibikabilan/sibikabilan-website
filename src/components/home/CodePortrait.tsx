"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useAtmosphere } from "@/lib/stores";
import { ATMOSPHERES } from "@/lib/atmosphere";

/**
 * Sibi, talking, then decompiled into code and rendered back into himself.
 * A transparent video drives a shader that blends the footage with a field
 * of glyphs sampled from the same frame, with glitch bands on the way in and
 * out. Loops every 13 seconds.
 */

const CYCLE = 13;
const PHASES = [
  { until: 4.5, label: "Rendering · live" },
  { until: 6.3, label: "Decompiling" },
  { until: 8.8, label: "In code" },
  { until: 10.6, label: "Recompiling" },
  { until: CYCLE, label: "Rendering · live" },
];

function mixAt(t: number) {
  const s = (x: number) => x * x * (3 - 2 * x);
  if (t < 4.5) return 0;
  if (t < 6.3) return s((t - 4.5) / 1.8);
  if (t < 8.8) return 1;
  if (t < 10.6) return 1 - s((t - 8.8) / 1.8);
  return 0;
}

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  uniform sampler2D uVideo;
  uniform sampler2D uGlyphs;
  uniform float uTime;
  uniform float uMix;
  uniform float uGrid;
  uniform vec3 uTint;
  uniform vec3 uHot;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    float glitch = uMix * (1.0 - uMix) * 4.0;
    float band = floor(uv.y * 46.0);
    float on = step(0.7, hash(vec2(band, floor(uTime * 9.0))));
    float shift = (hash(vec2(band, floor(uTime * 18.0))) - 0.5) * 0.09 * glitch * on;

    vec4 real = texture2D(uVideo, vec2(uv.x + shift, uv.y));
    real.r = texture2D(uVideo, vec2(uv.x + shift + 0.007 * glitch, uv.y)).r;
    real.b = texture2D(uVideo, vec2(uv.x + shift - 0.007 * glitch, uv.y)).b;

    vec2 grid = vec2(uGrid);
    vec2 cell = floor(uv * grid);
    vec2 cuv = fract(uv * grid);
    vec4 s = texture2D(uVideo, (cell + 0.5) / grid);
    float lum = dot(s.rgb, vec3(0.299, 0.587, 0.114));

    float seed = hash(vec2(cell.x, 7.0));
    float fall = fract(uTime * (0.18 + seed * 0.3) + seed + cell.y / grid.y);
    float trail = pow(fall, 7.0);
    float g = floor(hash(cell + floor(uTime * (1.5 + seed * 6.0))) * 64.0);
    vec2 gp = vec2(mod(g, 8.0), floor(g / 8.0));
    float glyph = texture2D(uGlyphs, (gp + cuv) / 8.0).r;

    vec3 base = mix(uTint, vec3(1.0), 0.35) * (0.6 + lum * 1.6);
    vec3 codeCol = mix(base, uHot * 1.3, trail * 0.9);
    float codeA = glyph * s.a * clamp(0.55 + lum * 1.5 + trail, 0.0, 1.0);

    float n = hash(cell * 1.37);
    float m = smoothstep(n - 0.22, n + 0.22, uMix * 1.44 - 0.22);
    vec3 col = mix(real.rgb, codeCol, m);
    float alpha = mix(real.a, codeA, m);
    col *= 0.95 + 0.05 * sin(uv.y * 900.0 + uTime * 3.0);
    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

function glyphAtlas(): THREE.CanvasTexture {
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワ<>/{}=+*#$%&@;:[]";
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 42px ui-monospace, Menlo, monospace";
  for (let i = 0; i < 64; i++) {
    ctx.fillText(chars[i % chars.length], (i % 8) * 64 + 32, Math.floor(i / 8) * 64 + 34);
  }
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

export function CodePortrait({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [ready, setReady] = useState(false);
  const { motion, atmosphere } = useAtmosphere();
  const colors = useRef(ATMOSPHERES[atmosphere]);

  useEffect(() => {
    colors.current = ATMOSPHERES[atmosphere];
  }, [atmosphere]);

  useEffect(() => {
    const ua = navigator.userAgent;
    const safari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Android/.test(ua);
    // Picks the alpha video format this browser can composite.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(safari ? "/media/sibi-talk.mov" : "/media/sibi-talk.webm");
  }, []);

  useEffect(() => {
    const v = video.current;
    const cv = canvas.current;
    const box = wrap.current;
    if (!v || !cv || !box || !src || motion === "calm") return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, premultipliedAlpha: true, antialias: false });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const tex = new THREE.VideoTexture(v);
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    const glyphs = glyphAtlas();
    const c = colors.current;
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uVideo: { value: tex },
        uGlyphs: { value: glyphs },
        uTime: { value: 0 },
        uMix: { value: 0 },
        uGrid: { value: 68 },
        uTint: { value: new THREE.Color(c.rim) },
        uHot: { value: new THREE.Color(c.key) },
      },
      blending: THREE.NoBlending,
    });
    const scene = new THREE.Scene();
    const cam = new THREE.Camera();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const resize = () => {
      const w = box.clientWidth;
      renderer.setSize(w, w, false);
      mat.uniforms.uGrid.value = w < 480 ? 46 : 68;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    let raf = 0;
    let visible = false;
    let lastPhase = -1;
    const start = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || v.readyState < 2) return;
      const t = ((performance.now() - start) / 1000) % CYCLE;
      const p = PHASES.findIndex((x) => t < x.until);
      if (p !== lastPhase) {
        lastPhase = p;
        setPhase(p);
      }
      mat.uniforms.uTime.value = performance.now() / 1000;
      mat.uniforms.uMix.value = mixAt(t);
      const col = colors.current;
      (mat.uniforms.uTint.value as THREE.Color).lerp(new THREE.Color(col.rim), 0.05);
      (mat.uniforms.uHot.value as THREE.Color).lerp(new THREE.Color(col.key), 0.05);
      renderer.render(scene, cam);
    };
    loop();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(box);
    const onReady = () => setReady(true);
    v.addEventListener("playing", onReady);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      v.removeEventListener("playing", onReady);
      tex.dispose();
      glyphs.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [src, motion]);

  const calm = motion === "calm";
  return (
    <div className={className}>
      <div ref={wrap} className="code-portrait relative aspect-square w-full">
        {/* The still shows first, and stays in calm mode. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/sibi-talk-poster.webp"
          alt="Sibi Kabilan"
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
          style={{ opacity: ready && !calm ? 0 : 1 }}
        />
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" style={{ opacity: ready && !calm ? 1 : 0 }} aria-hidden />
        {src && <video ref={video} src={src} muted playsInline loop preload="auto" className="pointer-events-none absolute h-px w-px opacity-0" aria-hidden />}
      </div>
      <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.26em] text-faint">
        <span className="flex items-center gap-2">
          <i className={`h-1.5 w-1.5 rounded-full ${phase === 2 ? "bg-[var(--rim)]" : "bg-[var(--key)]"} ${calm ? "" : "animate-pulse"}`} />
          {calm ? "Sibi Kabilan" : PHASES[phase].label}
        </span>
        <span>sibi.render()</span>
      </div>
    </div>
  );
}

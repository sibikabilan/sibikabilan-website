"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { portraitStore, useAtmosphere } from "@/lib/stores";
import { ATMOSPHERES } from "@/lib/atmosphere";
import { SPOKEN_END, SPOKEN_HAS_VOICE, SPOKEN_LINE } from "@/lib/spoken";
import { portraitVideo } from "@/lib/portraitVideo";

/**
 * As he comes into view, Sibi comes apart first: a glitch into falling green
 * numbers, then a constellation of connected points, and a render pass
 * sweeps him back into the real footage, where he says his line once. Each
 * word is published to `portraitStore` so the caption beside him lights up
 * as it's said. Then he rests on the last frame with the whole line beside
 * him, and a Replay button plays it again (it never loops on its own, so the
 * line never fades away while someone is reading it).
 */

/** real → code */
const GLITCH = 1.2;
/** code → connected points */
const NET_AT = GLITCH + 1.2;
const NET_DUR = 1.3;
/** connected points → real */
const REAL_AT = NET_AT + NET_DUR + 1.1;
const REAL_DUR = 1.5;
/** The clip, and his voice, start as the render pass is sweeping him back. */
const SPEAK_AT = REAL_AT + 0.9;
/** How long he holds after the last word before the clip stops on that frame. */
const HOLD = 0.6;
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const stages = (t: number) => ({
  toCode: smooth(t / GLITCH),
  toNet: smooth((t - NET_AT) / NET_DUR),
  toReal: smooth((t - REAL_AT) / REAL_DUR),
});
const PHASES = [
  { until: GLITCH, label: "Decompiling" },
  { until: NET_AT, label: "In code" },
  { until: NET_AT + NET_DUR, label: "Rewiring" },
  { until: REAL_AT, label: "Connected" },
  { until: SPEAK_AT, label: "Rendering" },
  { until: Infinity, label: "Live" },
];

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  uniform sampler2D uVideo;
  uniform sampler2D uGlyphs;
  uniform float uTime;
  uniform float uToCode;
  uniform float uToNet;
  uniform float uToReal;
  uniform float uGrid;
  uniform float uNetGrid;
  uniform vec3 uGreen;
  uniform vec3 uNode;
  uniform vec3 uHot;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }
  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  // The clip is packed: colour in the top half, the transparency matte in the bottom half.
  vec4 vid(vec2 p) {
    p = clamp(p, vec2(0.0, 0.003), vec2(1.0, 0.997));
    vec3 c = texture2D(uVideo, vec2(p.x, 0.5 + p.y * 0.5)).rgb;
    float a = texture2D(uVideo, vec2(p.x, p.y * 0.5)).r;
    return vec4(c, smoothstep(0.08, 0.92, a));
  }

  // ── the footage, with glitch bands while it transforms ──
  vec4 realAt(vec2 uv, float glitch) {
    float band = floor(uv.y * 46.0);
    float on = step(0.72, hash(vec2(band, floor(uTime * 9.0))));
    float shift = (hash(vec2(band, floor(uTime * 18.0))) - 0.5) * 0.08 * glitch * on;
    vec4 c = vid(vec2(uv.x + shift, uv.y));
    if (glitch > 0.001) {
      c.r = vid(vec2(uv.x + shift + 0.006 * glitch, uv.y)).r;
      c.b = vid(vec2(uv.x + shift - 0.006 * glitch, uv.y)).b;
    }
    return vec4(c.rgb * c.a, c.a);
  }

  // ── falling green numbers, dense where his face is bright ──
  vec4 rainAt(vec2 uv) {
    vec2 grid = vec2(uGrid);
    vec2 cell = floor(uv * grid);
    vec2 cuv = fract(uv * grid);
    vec4 s = vid((cell + 0.5) / grid);
    float lum = luma(s.rgb);
    float y = (cell.y + 0.5) / grid.y;

    float trail = 0.0;
    float headHit = 0.0;
    for (int k = 0; k < 2; k++) {
      float seed = hash(vec2(cell.x, 11.0 + float(k) * 17.0));
      float speed = 0.22 + seed * 0.38;
      float head = 1.0 - fract(uTime * speed + seed * 3.7);
      float d = fract(y - head);
      trail = max(trail, pow(1.0 - d, 5.0 + seed * 6.0));
      headHit = max(headHit, step(d, 1.2 / grid.y));
    }

    float rate = 2.0 + hash(cell) * 7.0;
    float g = floor(hash(cell + floor(uTime * rate)) * 64.0);
    vec2 gp = vec2(mod(g, 8.0), floor(g / 8.0));
    float glyph = texture2D(uGlyphs, (gp + cuv) / 8.0).r;

    float shade = smoothstep(0.06, 0.72, lum);
    float body = 0.07 + shade * 0.85;
    vec3 col = uGreen * (0.45 + shade * 0.75 + trail * 0.9);
    col = mix(col, vec3(0.88, 1.0, 0.92), headHit * 0.9);
    float a = glyph * s.a * clamp(body + trail * 1.15 + headHit, 0.0, 1.0);
    return vec4(col * a, a);
  }

  // ── a constellation: points inside his silhouette, linked to their neighbours ──
  vec2 netPoint(vec2 id) {
    vec2 h = hash2(id);
    return id + 0.5 + 0.36 * vec2(sin(uTime * 0.55 + h.x * 6.2831), cos(uTime * 0.47 + h.y * 6.2831));
  }
  vec2 segment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return vec2(length(pa - ba * h), h);
  }
  vec4 netAt(vec2 uv) {
    float N = uNetGrid;
    vec2 p = uv * N;
    vec2 id = floor(p);
    vec2 pts[9];
    float on[9];
    float lum[9];
    for (int j = 0; j < 3; j++) {
      for (int i = 0; i < 3; i++) {
        int k = j * 3 + i;
        vec2 q = netPoint(id + vec2(float(i) - 1.0, float(j) - 1.0));
        vec4 s = vid(q / N);
        pts[k] = q;
        on[k] = smoothstep(0.35, 0.75, s.a);
        lum[k] = luma(s.rgb);
      }
    }
    float dots = 0.0;
    float lines = 0.0;
    float pulse = 0.0;
    for (int k = 0; k < 9; k++) {
      float r = 0.05 + lum[k] * 0.11;
      dots = max(dots, on[k] * smoothstep(r, r * 0.25, length(p - pts[k])));
      if (k != 4) {
        vec2 sg = segment(p, pts[4], pts[k]);
        float len = length(pts[4] - pts[k]);
        float w = on[4] * on[k] * smoothstep(1.75, 0.9, len);
        lines = max(lines, w * smoothstep(0.045, 0.0, sg.x) * (0.35 + 0.4 * (lum[4] + lum[k])));
        float travel = fract(uTime * 0.45 + hash(pts[4] + pts[k]));
        pulse = max(pulse, w * smoothstep(0.06, 0.0, sg.x) * smoothstep(0.09, 0.0, abs(sg.y - travel)));
      }
    }
    // the four links between side neighbours close the triangles
    vec2 e1 = segment(p, pts[1], pts[3]);
    vec2 e2 = segment(p, pts[1], pts[5]);
    vec2 e3 = segment(p, pts[7], pts[3]);
    vec2 e4 = segment(p, pts[7], pts[5]);
    lines = max(lines, on[1] * on[3] * smoothstep(0.04, 0.0, e1.x) * 0.5);
    lines = max(lines, on[1] * on[5] * smoothstep(0.04, 0.0, e2.x) * 0.5);
    lines = max(lines, on[7] * on[3] * smoothstep(0.04, 0.0, e3.x) * 0.5);
    lines = max(lines, on[7] * on[5] * smoothstep(0.04, 0.0, e4.x) * 0.5);

    vec4 s = vid(uv);
    float ghost = s.a * (0.05 + luma(s.rgb) * 0.16);
    vec3 col = uNode * (lines * 0.85 + ghost) + mix(uNode, vec3(1.0), 0.6) * dots + uHot * pulse * 1.4;
    float a = clamp(max(max(dots, lines * 0.9), ghost) + pulse, 0.0, 1.0);
    return vec4(col, a);
  }

  void main() {
    vec2 uv = vUv;
    float glitch = 4.0 * uToCode * (1.0 - uToCode) + 2.0 * uToNet * (1.0 - uToNet) + 2.4 * uToReal * (1.0 - uToReal);
    vec4 real = realAt(uv, glitch);
    vec4 rain = rainAt(uv);
    vec4 net = netAt(uv);

    // footage → numbers: cell by cell
    float n = hash(floor(uv * uGrid) * 1.37);
    float m1 = smoothstep(n - 0.2, n + 0.2, uToCode * 1.4 - 0.2);
    // numbers → constellation: cell by cell, coarser
    float nb = hash(floor(uv * uNetGrid) * 2.11);
    float m2 = smoothstep(nb - 0.2, nb + 0.2, uToNet * 1.4 - 0.2);
    // constellation → footage: a render pass sweeping down
    float front = uToReal * 1.16 - 0.08;
    float depth = 1.0 - uv.y;
    float m3 = 1.0 - smoothstep(front - 0.05, front, depth);
    float scan = exp(-pow((depth - front) * 70.0, 2.0)) * step(0.001, uToReal) * step(uToReal, 0.999);

    vec4 col = mix(real, rain, m1);
    col = mix(col, net, m2);
    col = mix(col, real, m3);
    float edge = scan * max(real.a, net.a);
    col.rgb += uHot * edge * 0.9;
    col.a = max(col.a, edge * 0.6);
    col.rgb *= 0.96 + 0.04 * sin(uv.y * 900.0 + uTime * 3.0);
    gl_FragColor = col;
  }
`;

/** Numbers mostly, with a few mirrored katakana, the way the rain looks in the films. */
function glyphAtlas(): THREE.CanvasTexture {
  const kana = "アイウエオカキクケコサシスセソタチツテトナニヌ";
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 44px ui-monospace, Menlo, monospace";
  for (let i = 0; i < 64; i++) {
    const x = (i % 8) * 64 + 32;
    const y = Math.floor(i / 8) * 64 + 34;
    if (i < 44) {
      ctx.fillText(String(i % 10), x, y);
    } else {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.fillText(kana[(i - 44) % kana.length], 0, 0);
      ctx.restore();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

function wordAt(t: number) {
  if (t > SPOKEN_END) return -1;
  let w = -1;
  SPOKEN_LINE.forEach((x, i) => {
    if (t >= x.at) w = i;
  });
  return w;
}

export function CodePortrait({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [ready, setReady] = useState(false);
  /** He has said his line and is resting on its last frame. */
  const [done, setDone] = useState(false);
  // Sound is on by default. Browsers only allow audible playback once the visitor
  // has tapped, clicked or pressed a key on the page, so until then the clip plays
  // silently and the first such interaction brings the voice in from the top.
  const [muted, setMuted] = useState(false);
  const [audible, setAudible] = useState(false);
  const wantSound = useRef(true);
  /** Says the line again: from the first word if he's mid-line, with a short render-in once he's finished. */
  const againRef = useRef<(withSound?: boolean) => void>(() => undefined);
  const stateRef = useRef<{ speaking: boolean; done: boolean }>({ speaking: false, done: false });

  useEffect(() => {
    let off = false;
    try {
      off = localStorage.getItem("sk-sound") === "off";
    } catch {
      off = false;
    }
    wantSound.current = !off;
    // The visitor's own mute choice is remembered on this device.
    if (off) setMuted(true);
  }, []);
  // The portrait is content, not decoration: it plays in calm mode too.
  const { atmosphere } = useAtmosphere();
  const colors = useRef(ATMOSPHERES[atmosphere]);

  useEffect(() => {
    colors.current = ATMOSPHERES[atmosphere];
  }, [atmosphere]);

  // One packed H.264 clip (colour over matte) plays and uploads to WebGL in every browser.
  // It is the visit's one portrait video (see portraitVideo), so a tap on the opening
  // screen may already have given it permission to speak.
  const holder = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const v = portraitVideo();
    holder.current?.appendChild(v);
    video.current = v;
    setSrc(v.src);
    return () => {
      v.pause();
      v.remove();
    };
  }, []);

  // The opening screen's choice (enter with sound, or quietly) arrives as an event.
  useEffect(() => {
    const choose = (e: Event) => {
      const want = (e as CustomEvent<boolean>).detail;
      wantSound.current = want;
      setMuted(!want);
    };
    window.addEventListener("sk-sound", choose);
    return () => window.removeEventListener("sk-sound", choose);
  }, []);

  useEffect(() => {
    const v = video.current;
    const cv = canvas.current;
    const box = wrap.current;
    if (!v || !cv || !box || !src) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, premultipliedAlpha: true, antialias: false });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const gl = renderer.getContext();
    const probe = new Uint8Array(4);

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
        uToCode: { value: 0 },
        uToNet: { value: 0 },
        uToReal: { value: 0 },
        uGrid: { value: 72 },
        uNetGrid: { value: 30 },
        uGreen: { value: new THREE.Color("#34f07a") },
        uNode: { value: new THREE.Color(c.beam) },
        uHot: { value: new THREE.Color(c.key) },
      },
      blending: THREE.NoBlending,
    });
    const scene = new THREE.Scene();
    const cam = new THREE.Camera();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    /** A frame to draw even while resting (after a resize, or the last frame of the line). */
    let dirty = false;
    const resize = () => {
      const w = box.clientWidth;
      renderer.setSize(w, w, false);
      // Resizing clears the canvas; a resting portrait draws its frame again.
      dirty = true;
      mat.uniforms.uGrid.value = w < 480 ? 54 : 80;
      mat.uniforms.uNetGrid.value = w < 480 ? 22 : 30;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    let raf = 0;
    let frames = 0;
    let confirmed = false;
    let visible = false;
    let lastPhase = -1;
    let lastWord = -2;
    let cycleStart = 0;
    let speaking = false;
    /** Where on the timeline his voice starts: later on arrival, at once on a replay. */
    let speakAt = SPEAK_AT;
    let done = false;
    let started = false;
    const sync = () => (stateRef.current = { speaking, done });
    // Every play gets a ticket, so a slower, older play() can't undo a newer one.
    let ticket = 0;
    /** Play the clip from `from` seconds: the spoken part of the loop. */
    const speak = (withSound: boolean | undefined, from: number) => {
      const mine = ++ticket;
      speaking = true;
      sync();
      v.currentTime = Math.max(0, from);
      const activated =
        (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive ?? false;
      // Inside a tap we may always ask for sound; otherwise only once the visitor has interacted.
      v.muted = !(wantSound.current && (withSound ?? activated));
      v.play()
        .then(() => {
          if (mine === ticket) setAudible(!v.muted);
        })
        .catch((err: unknown) => {
          if (mine !== ticket) return;
          // Only a refusal of sound falls back to silent playback; an interrupted play() is not a refusal.
          if (err instanceof DOMException && err.name === "NotAllowedError" && !v.muted) {
            v.muted = true;
            setAudible(false);
            v.play().catch(() => undefined);
          }
        });
    };
    /**
     * Run the timeline from `at` seconds, with his voice starting at `sayAt`:
     * from the top (the glitch) when he comes into view, or from the render
     * pass with the line straight away when someone asks to hear it again.
     */
    const start = (at: number, sayAt: number, withSound?: boolean) => {
      started = true;
      done = false;
      setDone(false);
      speakAt = sayAt;
      cycleStart = performance.now() - at * 1000;
      speaking = false;
      sync();
      lastWord = -2;
      portraitStore.set({ word: -1, said: -1 });
      if (at >= sayAt) speak(withSound, at - sayAt);
      // The clip keeps running, silent, under the glitch: some phones only hand
      // WebGL real frames from a playing video. His voice comes in with the line.
      else {
        v.muted = true;
        if (v.paused) v.play().catch(() => undefined);
      }
    };
    /** The line is said: hold on its last frame, with every word of it still showing. */
    const finish = () => {
      done = true;
      speaking = false;
      sync();
      ++ticket;
      v.pause();
      setDone(true);
      setAudible(false);
      lastWord = -1;
      portraitStore.set({ word: -1 });
      dirty = true;
    };
    againRef.current = (withSound?: boolean) => {
      if (speaking) {
        // Mid-line: the line over from its first word (inside the tap, so phones allow the sound).
        cycleStart = performance.now() - speakAt * 1000;
        lastWord = -2;
        portraitStore.set({ word: -1, said: -1 });
        speak(withSound, 0);
      } else if (done) {
        // Finished: a short render pass brings him back and he says it again.
        start(REAL_AT, REAL_AT, withSound);
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || v.readyState < 2) return;
      if (done) {
        // Resting: draw the held frame once (and again after a resize), then nothing.
        if (!dirty) return;
        dirty = false;
        renderer.render(scene, cam);
        return;
      }
      const t = (performance.now() - cycleStart) / 1000;
      // The line starts from the top of the clip, in sync, as he renders back in.
      if (!speaking && t >= speakAt) speak(undefined, t - speakAt);
      if (speaking && t >= speakAt + SPOKEN_END + HOLD) {
        finish();
        return;
      }
      // A replay skips the first phases, so the label follows the timeline, not the clock.
      const p = PHASES.findIndex((x) => t < x.until);
      if (p !== lastPhase) {
        lastPhase = p;
        setPhase(p);
      }
      const w = speaking ? wordAt(t - speakAt) : -1;
      if (w !== lastWord) {
        lastWord = w;
        portraitStore.set({ word: w, said: Math.max(portraitStore.get().said, w) });
      }
      const s = stages(t);
      mat.uniforms.uTime.value = performance.now() / 1000;
      mat.uniforms.uToCode.value = s.toCode;
      mat.uniforms.uToNet.value = s.toNet;
      mat.uniforms.uToReal.value = s.toReal;
      const col = colors.current;
      (mat.uniforms.uNode.value as THREE.Color).lerp(new THREE.Color(col.beam), 0.05);
      (mat.uniforms.uHot.value as THREE.Color).lerp(new THREE.Color(col.key), 0.05);
      renderer.render(scene, cam);
      // Only hide the still once the canvas really shows him. Some phones play the
      // clip but hand WebGL empty frames; then the still simply stays.
      frames += 1;
      if (!confirmed && frames % 6 === 0) {
        const W = gl.drawingBufferWidth;
        const H = gl.drawingBufferHeight;
        for (const [fx, fy] of [[0.5, 0.55], [0.5, 0.35], [0.42, 0.7]]) {
          gl.readPixels(Math.floor(W * fx), Math.floor(H * fy), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, probe);
          if (probe[3] > 24) {
            confirmed = true;
            setReady(true);
            portraitStore.set({ live: true });
            break;
          }
        }
      }
    };
    loop();

    // He arrives each time he comes into view, until he has said his line once in full.
    // After that he stays at rest; Replay is there for another listen.
    const io = new IntersectionObserver(
      ([e]) => {
        const was = visible;
        visible = e.isIntersecting;
        if (visible && !was) {
          if (done) dirty = true;
          else start(0, SPEAK_AT);
        } else if (!visible && !done && started) {
          v.pause();
          portraitStore.set({ word: -1 });
          lastWord = -2;
        }
      },
      { threshold: 0.35 }
    );
    io.observe(box);
    // If autoplay was held back, the first scroll starts the clip (silently).
    const nudge = () => {
      if (visible && !done && v.paused) v.play().catch(() => undefined);
    };
    // A tap, click or key press while he's saying his line without sound brings the voice
    // in from the first word. During his arrival a tap changes nothing: the line simply
    // comes with sound when he gets to it. The portrait's own buttons handle their own taps.
    const unlock = (e: Event) => {
      const t = e.target as Element | null;
      if (t && typeof t.closest === "function" && t.closest("[data-sound-toggle]")) return;
      if (visible && speaking && wantSound.current && v.muted) againRef.current(true);
      else nudge();
    };
    window.addEventListener("click", unlock, { passive: true });
    window.addEventListener("touchend", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("wheel", nudge, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchend", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("wheel", nudge);
      portraitStore.set({ live: false, word: -1 });
      tex.dispose();
      glyphs.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [src]);

  const remember = (on: boolean) => {
    try {
      localStorage.setItem("sk-sound", on ? "on" : "off");
    } catch {
      /* storage unavailable */
    }
  };
  // Muting is instant. Unmuting mid-line plays the line again from the first word,
  // inside the tap, so phones allow the sound; during his arrival it just lets the
  // line come with sound; once he's finished it plays the line again.
  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    if (!muted && (audible || done)) {
      wantSound.current = false;
      v.muted = true;
      setMuted(true);
      setAudible(false);
      remember(false);
      return;
    }
    wantSound.current = true;
    setMuted(false);
    remember(true);
    if (stateRef.current.speaking) againRef.current(true);
  };
  const replay = () => againRef.current(wantSound.current);
  // At rest the button shows the visitor's choice for the replay; while he speaks, whether he's heard.
  const hearing = done ? !muted : !muted && audible;
  const waiting = !muted && !audible && !done;
  return (
    <div className={`relative ${className}`}>
      <div ref={wrap} className="code-portrait relative aspect-square w-full">
        <div ref={holder} className="contents" />
        {/* The still shows until the canvas has real frames of him. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/sibi-portrait.webp"
          alt="Sibi Kabilan"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
          style={{ opacity: ready ? 0 : 1 }}
        />
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" style={{ opacity: ready ? 1 : 0 }} aria-hidden />
      </div>
      {SPOKEN_HAS_VOICE && waiting && ready && (
        <button
          type="button"
          data-sound-toggle
          onClick={toggleSound}
          className="absolute bottom-[16%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[12.5px] text-ink backdrop-blur-md transition-colors hover:border-[color:var(--key)]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" fill="currentColor" />
            <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a7.8 7.8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Tap to hear Sibi
        </button>
      )}
      <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.26em] text-faint">
        {done ? (
          <button
            type="button"
            data-sound-toggle
            onClick={replay}
            className="group -my-2 flex items-center gap-2 rounded-full py-2 pr-2 text-ink-2 transition-colors hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-500 group-hover:-rotate-180">
              <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Replay
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <i
              className={`h-1.5 w-1.5 rounded-full ${phase <= 1 ? "bg-[#34f07a]" : phase <= 4 ? "bg-[var(--beam)]" : "bg-[var(--key)]"} animate-pulse`}
            />
            {PHASES[phase].label}
          </span>
        )}
        {SPOKEN_HAS_VOICE ? (
          <span className="flex items-center gap-3">
            {waiting && <span className="hidden normal-case tracking-[0.12em] text-muted sm:inline">Tap for sound</span>}
            <button
              type="button"
              data-sound-toggle
              onClick={toggleSound}
              aria-label={hearing ? "Mute Sibi's voice" : "Unmute Sibi's voice"}
              title={hearing ? "Mute" : "Unmute"}
              aria-pressed={!hearing}
              className={`relative grid h-10 w-10 place-items-center rounded-full border text-ink transition-colors duration-300 ${hearing ? "border-[var(--line-strong)] bg-white/[0.04] hover:border-[color:var(--key)]" : "border-[color:var(--key)] bg-[color-mix(in_oklab,var(--key)_12%,transparent)]"}`}
            >
              {waiting && <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-[color:var(--key)] opacity-40" />}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" fill="currentColor" />
                {hearing ? (
                  <>
                    <path d="M15.5 9a4.2 4.2 0 0 1 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M18.2 6.5a7.8 7.8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </>
                ) : (
                  <path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </span>
        ) : (
          <span>sibi.render()</span>
        )}
      </div>
    </div>
  );
}

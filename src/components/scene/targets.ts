/**
 * The shapes the hero's particle field can become: his own outline, a third
 * larger than him, standing just behind the portrait so it shows as a band of
 * light round his head and off his shoulders. Then the same shadow in the
 * same pose with one thing added for two of the opening's lines: a hammer on
 * the shoulder (build), headphones (engineer). For the last (write), an open
 * book standing behind him, drawn in line. Each is traced from a small black
 * and white mask in /media/shadows (made by scripts/build-shadows.mjs) and
 * returns `count` xyz triplets in world units.
 *
 * x runs -2.05..2.05 across the frame's width (2.05 is half the anchor's
 * width, see ParticleScene) and y up the frame, centred on it.
 */

type Rng = () => number;

function mulberry32(seed: number): Rng {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: Rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface Target {
  pos: Float32Array;
  /** Per particle brightness, so a cloud can carry tone as well as shape. */
  bright: Float32Array;
}

/**
 * /media is cached for a month (see next.config), so the masks carry a version:
 * bump it whenever scripts/build-shadows.mjs is run again.
 */
const V = "?v=5";

export const SILHOUETTES = [
  { key: "you", name: "His own shadow", src: `/media/shadows/you.png${V}` },
  { key: "builder", name: "The builder", src: `/media/shadows/builder.png${V}` },
  { key: "engineer", name: "The engineer", src: `/media/shadows/engineer.png${V}` },
  { key: "writer", name: "The open book", src: `/media/shadows/writer.png${V}` },
] as const;

export type TargetKey = (typeof SILHOUETTES)[number]["key"];

/** Half the frame's width in world units. */
const HALF = 2.05;

interface Mask {
  w: number;
  h: number;
  /** Pixel indices on the outline, and inside the figure. */
  edge: Uint32Array;
  fill: Uint32Array;
  /** Each pixel's tone, 0 to 1: grey in the mask draws fainter, with fewer grains. */
  tone: Float32Array;
}

async function loadMask(src: string): Promise<Mask> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;
  const tone = new Float32Array(w * h);
  for (let i = 0; i < tone.length; i++) tone[i] = px[i * 4] > 240 ? 1 : px[i * 4] / 255;
  // Past the bottom edge counts as inside: the figure is cropped there, not outlined.
  const inside = (x: number, y: number) => (y >= h ? x >= 0 && x < w : x >= 0 && x < w && y >= 0 && px[(y * w + x) * 4] > 127);
  const edge: number[] = [];
  const fill: number[] = [];
  const R = 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue;
      const rim = !inside(x - R, y) || !inside(x + R, y) || !inside(x, y - R) || !inside(x, y + R);
      (rim ? edge : fill).push(y * w + x);
    }
  }
  return { w, h, edge: Uint32Array.from(edge), fill: Uint32Array.from(fill), tone };
}

function silhouette(mask: Mask, count: number, seed: number): Target {
  const r = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const bright = new Float32Array(count);
  const { w, h, edge, fill, tone } = mask;
  const unit = (HALF * 2) / w;
  // A shape drawn only in fine line (the book) can have no inside to speak of: use its lines.
  const body = fill.length ? fill : edge;
  // Fainter pixels are picked less often, in proportion to their tone.
  const pick = (list: Uint32Array) => {
    let i = list[Math.floor(r() * list.length)];
    for (let tries = 0; tries < 6 && tone[i] < 1 && r() > tone[i] * tone[i]; tries++) i = list[Math.floor(r() * list.length)];
    return i;
  };
  for (let n = 0; n < count; n++) {
    const k = r();
    const fromEdge = k < 0.52 || k >= 0.9;
    const i = pick(fromEdge ? edge : body);
    let x = (i % w) + r() - 0.5;
    let y = Math.floor(i / w) + r() - 0.5;
    let z = 0;
    let b: number;
    if (k < 0.52) {
      // The outline: the light catching the edge of the shadow.
      z = gauss(r) * 0.04;
      b = 0.65 + r() * 0.6;
    } else if (k < 0.78) {
      // The body of the shadow: a dim, even haze.
      z = -0.3 + gauss(r) * 0.08;
      b = 0.1 + r() * 0.14;
    } else if (k < 0.9) {
      // A soft aura spilling just past the figure.
      x += gauss(r) * 7;
      y += gauss(r) * 7;
      z = -0.55 + gauss(r) * 0.1;
      b = 0.05 + r() * 0.1;
    } else {
      // Loose sparks drifting off the outline, towards the camera.
      const a = r() * Math.PI * 2;
      const d = 4 + r() * 22;
      x += Math.cos(a) * d;
      y += Math.sin(a) * d;
      z = 0.2 + r() * 0.8;
      b = 0.2 + r() * 0.45;
    }
    // Melt away towards the bottom, where the figure is cropped.
    const fade = Math.min(1, Math.max(0, (h - y) / (h * 0.22)));
    pos[n * 3] = (x - w / 2) * unit;
    pos[n * 3 + 1] = (h / 2 - y) * unit;
    pos[n * 3 + 2] = z;
    bright[n] = b * (0.25 + 0.75 * fade) * (0.35 + 0.65 * tone[i]);
  }
  return { pos, bright };
}

export async function loadTargets(count: number): Promise<Record<TargetKey, Target>> {
  const masks = await Promise.all(SILHOUETTES.map((s) => loadMask(s.src)));
  const out = {} as Record<TargetKey, Target>;
  SILHOUETTES.forEach((s, i) => {
    out[s.key] = silhouette(masks[i], count, 11 + i);
  });
  return out;
}

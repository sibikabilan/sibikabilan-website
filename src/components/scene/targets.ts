/**
 * The shadows the hero's particle field can become: a figure standing behind
 * the portrait, larger than life. First his own outline (traced from the real
 * cutout), then the builder, the engineer and the writer, one for each line
 * of the opening. Each is drawn from a small black and white mask in
 * /media/silhouettes and returns `count` xyz triplets in world units.
 *
 * The frame is 3:4. x runs -2.05..2.05 across its width (2.05 is half the
 * anchor's width, see ParticleScene) and y up the frame, centred on it.
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

export const SILHOUETTES = [
  { key: "you", name: "His own shadow", src: "/media/silhouettes/you.png" },
  { key: "builder", name: "The builder", src: "/media/silhouettes/builder.png" },
  { key: "engineer", name: "The engineer", src: "/media/silhouettes/engineer.png" },
  { key: "writer", name: "The writer", src: "/media/silhouettes/writer.png" },
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
  return { w, h, edge: Uint32Array.from(edge), fill: Uint32Array.from(fill) };
}

function silhouette(mask: Mask, count: number, seed: number): Target {
  const r = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const bright = new Float32Array(count);
  const { w, h, edge, fill } = mask;
  const unit = (HALF * 2) / w;
  const pick = (list: Uint32Array) => list[Math.floor(r() * list.length)];
  for (let n = 0; n < count; n++) {
    const k = r();
    const fromEdge = k < 0.52 || k >= 0.9;
    const i = pick(fromEdge ? edge : fill);
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
    bright[n] = b * (0.25 + 0.75 * fade);
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

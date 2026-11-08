
/**
 * The halo crowns the hero particle field can become. Each returns `count`
 * xyz triplets in world units, centered on the head.
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

/* ───────────────────────── halos ─────────────────────────
 * A set of crowns that sit behind the portrait. All are centered on the
 * origin (the head) with the ring at radius R, and use z for depth: glow
 * behind, ring in the middle, sparks drifting towards the camera.
 */

const R = 2.05;

function sparks(r: Rng, pos: Float32Array, bright: Float32Array, n: number, spread = 1.6) {
  const a = r() * Math.PI * 2;
  const d = R + (r() - 0.3) * spread;
  pos[n * 3] = Math.cos(a) * d;
  pos[n * 3 + 1] = Math.sin(a) * d;
  pos[n * 3 + 2] = 0.2 + r() * 0.9;
  bright[n] = 0.25 + r() * 0.6;
}

function glow(r: Rng, pos: Float32Array, bright: Float32Array, n: number) {
  const a = r() * Math.PI * 2;
  const d = R * 0.95 * Math.sqrt(r());
  pos[n * 3] = Math.cos(a) * d;
  pos[n * 3 + 1] = Math.sin(a) * d;
  pos[n * 3 + 2] = -0.7 + gauss(r) * 0.12;
  bright[n] = 0.12 + r() * 0.22;
}

function ring(r: Rng, pos: Float32Array, bright: Float32Array, n: number, radius = R, width = 0.035, z = 0) {
  const a = r() * Math.PI * 2;
  const d = radius + gauss(r) * width;
  pos[n * 3] = Math.cos(a) * d;
  pos[n * 3 + 1] = Math.sin(a) * d;
  pos[n * 3 + 2] = z + gauss(r) * 0.05;
  bright[n] = 0.6 + r() * 0.7;
}

/** 01 · The halo: a clean ring with a soft disc of light behind the head. */
function haloRing(count: number): Target {
  const r = mulberry32(5);
  const pos = new Float32Array(count * 3);
  const bright = new Float32Array(count);
  for (let n = 0; n < count; n++) {
    const k = r();
    if (k < 0.5) ring(r, pos, bright, n);
    else if (k < 0.62) ring(r, pos, bright, n, R * 1.09, 0.012, -0.25);
    else if (k < 0.85) glow(r, pos, bright, n);
    else sparks(r, pos, bright, n);
  }
  return { pos, bright };
}

/** 02 · The founder's crown: a sunburst of blades, longest at the top. */
function haloCrown(count: number): Target {
  const r = mulberry32(6);
  const pos = new Float32Array(count * 3);
  const bright = new Float32Array(count);
  const blades = 28;
  for (let n = 0; n < count; n++) {
    const k = r();
    if (k < 0.32) ring(r, pos, bright, n, R, 0.03);
    else if (k < 0.82) {
      const i = Math.floor(r() * blades);
      const ang = (i / blades) * Math.PI * 2 + Math.PI / 2;
      const top = Math.max(0, Math.sin(ang));
      const len = (i % 2 === 0 ? 0.95 : 0.5) * (0.45 + 0.55 * top) + 0.12;
      const t = Math.pow(r(), 0.8);
      const halfWidth = 0.09 * (1 - t);
      const across = (r() - 0.5) * 2 * halfWidth;
      const d = R + 0.06 + t * len;
      const x = Math.cos(ang) * d - Math.sin(ang) * across;
      const y = Math.sin(ang) * d + Math.cos(ang) * across;
      pos[n * 3] = x;
      pos[n * 3 + 1] = y;
      pos[n * 3 + 2] = -0.15 + t * 0.15;
      bright[n] = 0.5 + (1 - t) * 0.7;
    } else if (k < 0.93) glow(r, pos, bright, n);
    else sparks(r, pos, bright, n, 2.2);
  }
  return { pos, bright };
}

/** 03 · The engineer's circuit: segmented rings, nodes and right angle traces. */
function haloCircuit(count: number): Target {
  const r = mulberry32(7);
  const pos = new Float32Array(count * 3);
  const bright = new Float32Array(count);
  const nodes = 16;
  for (let n = 0; n < count; n++) {
    const k = r();
    if (k < 0.3) ring(r, pos, bright, n, R, 0.02);
    else if (k < 0.55) {
      // dashed outer arcs
      const layer = r() < 0.5 ? 0.32 : 0.6;
      let a = r() * Math.PI * 2;
      const seg = Math.PI / 10;
      if (Math.floor(a / seg) % 2 === 1) a -= seg;
      const d = R + layer + gauss(r) * 0.01;
      pos[n * 3] = Math.cos(a) * d;
      pos[n * 3 + 1] = Math.sin(a) * d;
      pos[n * 3 + 2] = -0.2 - layer * 0.3;
      bright[n] = 0.4 + r() * 0.5;
    } else if (k < 0.8) {
      // traces: radial, then a short tangential jog
      const i = Math.floor(r() * nodes);
      const a = (i / nodes) * Math.PI * 2;
      const t = r();
      const radial = t < 0.6;
      const d = radial ? R + (t / 0.6) * 0.32 : R + 0.32;
      const jog = radial ? 0 : ((t - 0.6) / 0.4) * 0.18 * (i % 2 ? 1 : -1);
      const aa = a + jog / d;
      pos[n * 3] = Math.cos(aa) * d;
      pos[n * 3 + 1] = Math.sin(aa) * d;
      pos[n * 3 + 2] = -0.1;
      bright[n] = 0.45 + r() * 0.4;
    } else if (k < 0.9) {
      // square pads at the end of each trace
      const i = Math.floor(r() * nodes);
      const a = (i / nodes) * Math.PI * 2 + (0.18 * (i % 2 ? 1 : -1)) / (R + 0.32);
      const cx = Math.cos(a) * (R + 0.32);
      const cy = Math.sin(a) * (R + 0.32);
      pos[n * 3] = cx + (r() - 0.5) * 0.09;
      pos[n * 3 + 1] = cy + (r() - 0.5) * 0.09;
      pos[n * 3 + 2] = -0.1;
      bright[n] = 1.1;
    } else glow(r, pos, bright, n);
  }
  return { pos, bright };
}

/** 04 · The storyteller's orbit: orbs strung on a fine thread, like beads of light. */
function haloOrbs(count: number): Target {
  const r = mulberry32(8);
  const pos = new Float32Array(count * 3);
  const bright = new Float32Array(count);
  const orbs = 9;
  for (let n = 0; n < count; n++) {
    const k = r();
    if (k < 0.62) {
      const i = Math.floor(r() * orbs);
      const a = (i / orbs) * Math.PI * 2 + Math.PI / 2;
      const rad = 0.2 * Math.cbrt(r());
      const u = r() * Math.PI * 2;
      const v = Math.acos(2 * r() - 1);
      pos[n * 3] = Math.cos(a) * (R + 0.15) + rad * Math.sin(v) * Math.cos(u);
      pos[n * 3 + 1] = Math.sin(a) * (R + 0.15) + rad * Math.sin(v) * Math.sin(u);
      pos[n * 3 + 2] = rad * Math.cos(v);
      bright[n] = 0.7 + r() * 0.6;
    } else if (k < 0.78) ring(r, pos, bright, n, R + 0.15, 0.008, -0.05);
    else if (k < 0.92) glow(r, pos, bright, n);
    else sparks(r, pos, bright, n);
  }
  return { pos, bright };
}

export const HALOS = [
  { key: "halo-ring", name: "The halo" },
  { key: "halo-crown", name: "The founder's crown" },
  { key: "halo-circuit", name: "The engineer's circuit" },
  { key: "halo-orbs", name: "The storyteller's orbit" },
] as const;

export type TargetKey = (typeof HALOS)[number]["key"];

export function buildTargets(count: number): Record<TargetKey, Target> {
  return {
    "halo-ring": haloRing(count),
    "halo-crown": haloCrown(count),
    "halo-circuit": haloCircuit(count),
    "halo-orbs": haloOrbs(count),
  };
}

/** Targets that slowly revolve in place. */
/** Rotation about the vertical axis (gives depth). */
export const SPINNING: Record<TargetKey, number> = {
  "halo-ring": 0,
  "halo-crown": 0,
  "halo-circuit": 0,
  "halo-orbs": 0,
};

/** Rotation within the ring's own plane, like a crown slowly turning. */
export const ROLLING: Record<TargetKey, number> = {
  "halo-ring": 0.3,
  "halo-crown": 0.6,
  "halo-circuit": -0.5,
  "halo-orbs": 0.8,
};

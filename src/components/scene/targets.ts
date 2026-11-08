import type { SceneTarget } from "@/lib/stores";

/**
 * Point clouds the particle field can become. Each returns `count` xyz
 * triplets in world units (the stage is roughly 10 wide by 5.7 tall).
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

function withTone(pos: Float32Array, seed: number, min = 0.55, span = 0.6): Target {
  const r = mulberry32(seed);
  const bright = new Float32Array(pos.length / 3);
  for (let i = 0; i < bright.length; i++) bright[i] = min + r() * span;
  return { pos, bright };
}

/**
 * A halo of light that sits behind the portrait photo: a bright ring, a soft
 * inner glow and a few rays, like a backlight on a film set.
 */
function haloTarget(count: number): Target {
  const r = mulberry32(5);
  const pos = new Float32Array(count * 3);
  const bright = new Float32Array(count);
  for (let n = 0; n < count; n++) {
    const roll = r();
    let x: number, y: number, z: number, b: number;
    if (roll < 0.55) {
      // the ring
      const a = r() * Math.PI * 2;
      const R = 2.05 + gauss(r) * 0.035 + (r() < 0.15 ? gauss(r) * 0.18 : 0);
      x = Math.cos(a) * R;
      y = Math.sin(a) * R;
      z = gauss(r) * 0.08;
      b = 0.55 + r() * 0.7;
    } else if (roll < 0.8) {
      // soft disc of light inside the ring
      const a = r() * Math.PI * 2;
      const R = 2.0 * Math.sqrt(r());
      x = Math.cos(a) * R;
      y = Math.sin(a) * R;
      z = -0.4 + gauss(r) * 0.15;
      b = 0.18 + r() * 0.3;
    } else {
      // rays fanning out from the ring
      const ray = Math.floor(r() * 28);
      const a = (ray / 28) * Math.PI * 2 + gauss(r) * 0.01;
      const R = 2.2 + Math.pow(r(), 1.6) * 2.6;
      x = Math.cos(a) * R;
      y = Math.sin(a) * R;
      z = -0.2 + gauss(r) * 0.1;
      b = 0.25 * (1 - (R - 2.2) / 2.8) + 0.08;
    }
    pos[n * 3] = x;
    pos[n * 3 + 1] = y + 0.55;
    pos[n * 3 + 2] = z;
    bright[n] = b;
  }
  return { pos, bright };
}

/** Threads of light converging into one strand, after the interlude scene. */
function threadsTarget(count: number): Float32Array {
  const r = mulberry32(11);
  const out = new Float32Array(count * 3);
  const lines = 120;
  for (let n = 0; n < count; n++) {
    const k = n % lines;
    const x0 = ((k / (lines - 1)) * 2 - 1) * 5.4 + (r() - 0.5) * 0.04;
    const z0 = gauss(r) * 0.6;
    const t = Math.pow(r(), 0.85);
    // Bottom spread wide, top gathers to a single bright strand.
    const pull = Math.pow(t, 1.7);
    out[n * 3] = x0 * (1 - pull) + (r() - 0.5) * 0.015;
    out[n * 3 + 1] = -3.1 + t * 6.2;
    out[n * 3 + 2] = z0 * (1 - pull);
  }
  return out;
}

/** The agent: a shell, a dense core and three orbits. */
function agentTarget(count: number): Float32Array {
  const r = mulberry32(19);
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const shell = Math.floor(count * 0.5);
  const core = Math.floor(count * 0.16);
  for (let n = 0; n < count; n++) {
    let x: number, y: number, z: number;
    if (n < shell) {
      const yy = 1 - (n / (shell - 1)) * 2;
      const rad = Math.sqrt(1 - yy * yy);
      const th = golden * n;
      const R = 1.55 + gauss(r) * 0.03;
      x = Math.cos(th) * rad * R;
      y = yy * R;
      z = Math.sin(th) * rad * R;
    } else if (n < shell + core) {
      x = gauss(r) * 0.32;
      y = gauss(r) * 0.32;
      z = gauss(r) * 0.32;
    } else {
      const ring = n % 3;
      const R = [2.15, 2.5, 2.9][ring];
      const tilt = [0.35, -0.9, 1.25][ring];
      const yaw = [0.2, 1.1, -0.6][ring];
      const a = r() * Math.PI * 2;
      const px = Math.cos(a) * R + gauss(r) * 0.02;
      const pz = Math.sin(a) * R + gauss(r) * 0.02;
      // tilt around x, then yaw around y
      const py = -pz * Math.sin(tilt);
      const pz2 = pz * Math.cos(tilt);
      x = px * Math.cos(yaw) + pz2 * Math.sin(yaw);
      z = -px * Math.sin(yaw) + pz2 * Math.cos(yaw);
      y = py;
    }
    out[n * 3] = x;
    out[n * 3 + 1] = y;
    out[n * 3 + 2] = z;
  }
  return out;
}

/** One continuous conversation: a twisting ribbon with three channel nodes. */
function ribbonTarget(count: number): Float32Array {
  const r = mulberry32(23);
  const out = new Float32Array(count * 3);
  const nodes = [0.18, 0.5, 0.82];
  const nodeCount = Math.floor(count * 0.18);
  for (let n = 0; n < count; n++) {
    let x: number, y: number, z: number;
    if (n < nodeCount) {
      const t = nodes[n % 3];
      const cx = -5 + 10 * t;
      const cy = 0.9 * Math.sin(Math.PI * 2 * t * 1.15 + 0.4);
      const cz = 0.8 * Math.cos(Math.PI * 2 * t * 0.8);
      const a = r() * Math.PI * 2;
      const b = Math.acos(2 * r() - 1);
      const R = 0.32 * Math.cbrt(r());
      x = cx + R * Math.sin(b) * Math.cos(a);
      y = cy + R * Math.sin(b) * Math.sin(a);
      z = cz + R * Math.cos(b);
    } else {
      const t = r();
      const u = r() - 0.5;
      const cx = -5.6 + 11.2 * t;
      const cy = 0.9 * Math.sin(Math.PI * 2 * t * 1.15 + 0.4);
      const cz = 0.8 * Math.cos(Math.PI * 2 * t * 0.8);
      const th = Math.PI * 4 * t;
      const wdt = 0.55 * (Math.abs(u) > 0.46 ? 1.02 : 1);
      x = cx;
      y = cy + u * wdt * Math.cos(th);
      z = cz + u * wdt * Math.sin(th);
    }
    out[n * 3] = x;
    out[n * 3 + 1] = y;
    out[n * 3 + 2] = z;
  }
  return out;
}

/** An open book with lines of text and pages mid turn. */
function bookTarget(count: number): Float32Array {
  const r = mulberry32(29);
  const out = new Float32Array(count * 3);
  const W = 2.05;
  const H = 1.45;
  const tilt = -0.42;
  for (let n = 0; n < count; n++) {
    const roll = r();
    let x: number, y: number, z: number;
    if (roll < 0.74) {
      const side = r() < 0.5 ? -1 : 1;
      let s = r();
      let v = (r() * 2 - 1) * H;
      if (r() < 0.62) {
        // text rows
        s = 0.12 + r() * 0.78;
        v = Math.round(v / 0.13) * 0.13 + gauss(r) * 0.008;
        if (Math.abs(v) > H * 0.86) v *= 0.86;
      }
      x = side * s * W;
      z = 0.38 * Math.sin(Math.PI * Math.min(1, s * 1.05)) * (1 - s * 0.35) - 0.05;
      y = v;
    } else if (roll < 0.92) {
      // turning pages hinged at the spine
      const page = Math.floor(r() * 3);
      const ang = [0.55, 1.15, 1.75][page];
      const s = r() * W;
      const v = (r() * 2 - 1) * H;
      const bend = 0.18 * Math.sin(Math.PI * (s / W));
      x = Math.cos(ang) * s - Math.sin(ang) * bend;
      z = Math.sin(ang) * s + Math.cos(ang) * bend;
      y = v;
    } else {
      // dust and loose letters rising from the pages
      x = gauss(r) * 1.1;
      y = H + r() * 1.6;
      z = 0.4 + gauss(r) * 0.5;
    }
    // tip the book back towards the camera
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
    out[n * 3] = x;
    out[n * 3 + 1] = y2 - 0.15;
    out[n * 3 + 2] = z2;
  }
  return out;
}

/** A three armed galaxy, tilted. */
function galaxyTarget(count: number): Float32Array {
  const r = mulberry32(31);
  const out = new Float32Array(count * 3);
  const tilt = 1.05;
  for (let n = 0; n < count; n++) {
    const arm = n % 3;
    const rad = Math.pow(r(), 0.65) * 5.2;
    const a = (arm / 3) * Math.PI * 2 + rad * 0.95 + gauss(r) * 0.32 * (1 - rad / 7);
    const x = Math.cos(a) * rad + gauss(r) * 0.12;
    const zz = Math.sin(a) * rad + gauss(r) * 0.12;
    const y = gauss(r) * 0.18 * (1 - rad / 6);
    out[n * 3] = x;
    out[n * 3 + 1] = y * Math.cos(tilt) - zz * Math.sin(tilt);
    out[n * 3 + 2] = y * Math.sin(tilt) + zz * Math.cos(tilt);
  }
  return out;
}

export function buildTargets(count: number): Record<SceneTarget, Target> {
  return {
    halo: haloTarget(count),
    threads: withTone(threadsTarget(count), 3, 0.35, 0.9),
    agent: withTone(agentTarget(count), 4),
    ribbon: withTone(ribbonTarget(count), 5),
    book: withTone(bookTarget(count), 6, 0.5, 0.7),
    galaxy: withTone(galaxyTarget(count), 7, 0.35, 0.9),
  };
}

/** Targets that slowly revolve in place. */
export const SPINNING: Record<SceneTarget, number> = {
  halo: 0,
  threads: 0,
  agent: 1,
  ribbon: 0,
  book: 0,
  galaxy: 0.6,
};

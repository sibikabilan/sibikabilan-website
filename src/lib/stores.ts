"use client";

import { useSyncExternalStore } from "react";
import { ATMOSPHERES, isAtmosphere, type AtmosphereId } from "./atmosphere";

/** A tiny observable store, readable from React and from the WebGL frame loop. */
function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(patch: Partial<T>) {
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/* ───────── atmosphere ───────── */

export type MotionMode = "cinematic" | "calm";

export interface AtmosphereState {
  atmosphere: AtmosphereId;
  grain: boolean;
  motion: MotionMode;
  ready: boolean;
}

export const atmosphereStore = createStore<AtmosphereState>({
  atmosphere: "noir",
  grain: true,
  motion: "cinematic",
  ready: false,
});

const KEY = "sk-atmosphere-v1";

function apply(state: AtmosphereState) {
  const root = document.documentElement;
  root.dataset.atmosphere = state.atmosphere;
  root.dataset.grain = state.grain ? "on" : "off";
  root.dataset.motion = state.motion;
}

export function initAtmosphere(defaultAtmosphere: AtmosphereId) {
  let saved: Partial<AtmosphereState> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    saved = {};
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const next: AtmosphereState = {
    atmosphere: isAtmosphere(saved.atmosphere) ? saved.atmosphere : defaultAtmosphere,
    grain: typeof saved.grain === "boolean" ? saved.grain : true,
    motion: saved.motion === "calm" || saved.motion === "cinematic" ? saved.motion : reduce ? "calm" : "cinematic",
    ready: true,
  };
  atmosphereStore.set(next);
  apply(next);
}

export function updateAtmosphere(patch: Partial<Omit<AtmosphereState, "ready">>) {
  atmosphereStore.set(patch);
  const state = atmosphereStore.get();
  apply(state);
  try {
    const { atmosphere, grain, motion } = state;
    localStorage.setItem(KEY, JSON.stringify({ atmosphere, grain, motion }));
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this visit.
  }
}

export function useAtmosphere(): AtmosphereState {
  return useSyncExternalStore(atmosphereStore.subscribe, atmosphereStore.get, atmosphereStore.get);
}

export function atmosphereColors(id: AtmosphereId) {
  return ATMOSPHERES[id];
}

/* ───────── scene direction ───────── */

/** "halo" shows the crown behind the portrait; "network" is the connected web of light everywhere else. */
export type SceneTarget = "halo" | "network";
export type NetworkMode = "drift" | "prologue";

export interface SceneState {
  target: SceneTarget;
  /** -1 left, 0 center, 1 right of the stage */
  side: number;
  opacity: number;
  /** Optional DOM anchor in normalized device coords, so the light sits exactly behind an element. */
  anchor: { x: number; y: number; size: number } | null;
  /** Which crown the halo is wearing (cycles in the hero). */
  variant: number;
  mode: NetworkMode;
  /** Prologue beat, which choreographs the network. */
  beat: number;
}

export const sceneStore = createStore<SceneState>({
  target: "halo",
  side: 1,
  opacity: 1,
  anchor: null,
  variant: 0,
  mode: "drift",
  beat: 0,
});

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as Record<string, unknown>).__sk = { sceneStore, atmosphereStore };
}

"use client";

import { useSyncExternalStore } from "react";
import { useAtmosphere } from "@/lib/stores";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * True when the visitor asked for stillness: calm mode in the atmosphere
 * panel, or reduced motion in the OS. Hydration safe (false on the server).
 */
export function useCalm(): boolean {
  const { motion } = useAtmosphere();
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
  return motion === "calm" || reduced;
}

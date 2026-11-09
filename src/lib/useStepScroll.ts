"use client";

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";
import { wheelGates, type WheelGate } from "@/lib/stores";

const STEP_SECONDS = 0.95;
const GESTURE_GAP_MS = 200;
const ease = (t: number) => 1 - Math.pow(1 - t, 4);

const average = (xs: number[], n: number) => {
  const tail = xs.slice(-n);
  return tail.reduce((a, b) => a + b, 0) / Math.max(1, tail.length);
};

/**
 * One gesture, one step. Inside a pinned section split into `steps` equal
 * stops, a wheel or trackpad gesture glides to the next stop and no further.
 *
 * Trackpads keep sending momentum events for a second or more after the
 * fingers lift, which used to carry the page through two steps. Here a step
 * only fires when input is accelerating (a new push), never on a decaying
 * tail, and never while the previous glide is still running. At the first
 * and last stop a new push is handed back to normal scrolling, so leaving
 * the section feels like any other scroll.
 */
export function useStepScroll(ref: RefObject<HTMLElement | null>, steps: number, media?: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el || steps < 2) return;

    let history: number[] = [];
    let lastAt = 0;
    let lockedUntil = 0;
    let released = false;

    const gate: WheelGate = ({ deltaY, event }) => {
      if (event.type !== "wheel") return true;
      if (media && !window.matchMedia(media).matches) return true;
      const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
      if (!lenis) return true;

      const now = performance.now();
      if (now - lastAt > GESTURE_GAP_MS) {
        history = [];
        released = false;
      }
      lastAt = now;
      history.push(Math.abs(deltaY));
      if (history.length > 70) history.shift();
      if (released) return true;

      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      const size = range / (steps - 1);
      const y = lenis.animatedScroll;
      if (y < top - 4 || y > top + range + 4) return true;

      const swallow = () => {
        if (event.cancelable) event.preventDefault();
        return false;
      };
      if (now < lockedUntil || deltaY === 0) return swallow();

      const f = Math.min(steps - 1, Math.max(0, (y - top) / size));
      const settled = Math.abs(f - Math.round(f)) < 0.04;
      // A push, not a tail: recent input is at least as strong as the gesture so far,
      // and strong enough not to be the last trickle of momentum.
      const recent = average(history, 6);
      const accelerating = recent > 3 && recent >= average(history, 40) * 0.98;

      let target: number;
      if (!settled) {
        // Arrived mid-way (from below, a scrollbar drag, a resize): settle on the nearest stop.
        target = Math.round(f);
      } else {
        if (!accelerating) return swallow();
        target = Math.round(f) + (deltaY > 0 ? 1 : -1);
        if (target < 0 || target > steps - 1) {
          released = true;
          return true;
        }
      }

      lockedUntil = now + STEP_SECONDS * 1000 + 60;
      lenis.scrollTo(top + target * size, { duration: STEP_SECONDS, easing: ease, force: true });
      return swallow();
    };

    wheelGates.add(gate);
    return () => {
      wheelGates.delete(gate);
    };
  }, [ref, steps, media]);
}

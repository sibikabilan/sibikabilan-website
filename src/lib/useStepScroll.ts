"use client";

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";
import { wheelGates, type WheelGate } from "@/lib/stores";
import { stepSections } from "@/lib/touchSteps";

const STEP_SECONDS = 0.6;
/** Input this far apart starts a new gesture. */
const GESTURE_GAP_MS = 200;
/** A wheel event after a pause this long is a fresh push (a mouse wheel notch, a new flick). */
const PUSH_GAP_MS = 60;
/** Pushes closer together than this count as one, so a fast flick of a wheel can't skip ahead. */
const MIN_PUSH_MS = 140;
const ease = (t: number) => 1 - Math.pow(1 - t, 4);

const average = (xs: number[], n: number) => {
  const tail = xs.slice(-n);
  return tail.reduce((a, b) => a + b, 0) / Math.max(1, tail.length);
};

/**
 * One push, one step. Inside a pinned section split into `steps` equal stops,
 * each wheel notch or trackpad push glides to the next stop. Pushes chain:
 * scroll three times quickly and it moves three stops, each new push picking
 * up from where the last one was headed, with no wait in between.
 * `media` limits the wheel behaviour; phones step one swipe per stop.
 *
 * What doesn't count is momentum. Trackpads keep sending a fading tail of
 * events for a second or more after the fingers lift; a push is only a new
 * one when it arrives after a pause or rises again after the input had died
 * down. At the first and last stop a new push is handed back to normal
 * scrolling, so leaving the section feels like any other scroll.
 */
export function useStepScroll(ref: RefObject<HTMLElement | null>, steps: number, media?: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el || steps < 2) return;

    let history: number[] = [];
    let lastAt = 0;
    let released = false;
    let goal: number | null = null;
    let glideUntil = 0;
    let lastPushAt = 0;
    // The strongest and weakest input since the last accepted push.
    let peak = 0;
    let trough = Infinity;

    const gate: WheelGate = ({ deltaY, event }) => {
      if (event.type !== "wheel") return true;
      if (media && !window.matchMedia(media).matches) return true;
      const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
      if (!lenis) return true;

      const now = performance.now();
      const gap = now - lastAt;
      if (gap > GESTURE_GAP_MS) {
        history = [];
        released = false;
        peak = 0;
        trough = Infinity;
      }
      lastAt = now;
      const mag = Math.abs(deltaY);
      history.push(mag);
      if (history.length > 70) history.shift();
      if (released) return true;

      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      const size = range / (steps - 1);
      const y = lenis.animatedScroll;
      if (y < top - 4 || y > top + range + 4) {
        goal = null;
        return true;
      }

      const swallow = () => {
        if (event.cancelable) event.preventDefault();
        return false;
      };
      if (deltaY === 0) return swallow();

      const gliding = now < glideUntil;
      if (!gliding) goal = null;
      const f = Math.min(steps - 1, Math.max(0, (y - top) / size));

      const glideTo = (target: number) => {
        goal = target;
        glideUntil = now + STEP_SECONDS * 1000;
        lenis.scrollTo(top + target * size, { duration: STEP_SECONDS, easing: ease, force: true });
      };

      // Arrived mid-way (from below, a scrollbar drag, a resize): settle on the nearest stop.
      if (goal === null && Math.abs(f - Math.round(f)) >= 0.04) {
        glideTo(Math.round(f));
        lastPushAt = now;
        peak = mag;
        trough = Infinity;
        return swallow();
      }

      // The trough only counts the fall after the peak: a push still building up isn't a dip.
      if (mag > peak) {
        peak = mag;
        trough = mag;
      } else trough = Math.min(trough, mag);
      const fresh = gap > PUSH_GAP_MS || (trough < peak * 0.45 && average(history, 3) > trough * 2 + 4);
      if (!fresh || now - lastPushAt < MIN_PUSH_MS) return swallow();

      const target = (goal ?? Math.round(f)) + (deltaY > 0 ? 1 : -1);
      if (target < 0 || target > steps - 1) {
        // Past the first or last stop: let the page scroll on, once any glide has landed.
        if (gliding) return swallow();
        released = true;
        return true;
      }
      lastPushAt = now;
      peak = mag;
      trough = Infinity;
      glideTo(target);
      return swallow();
    };

    wheelGates.add(gate);
    // Touch screens step through the same stops, one swipe each (see touchSteps).
    const section = { el, steps };
    stepSections.add(section);
    return () => {
      wheelGates.delete(gate);
      stepSections.delete(section);
    };
  }, [ref, steps, media]);
}

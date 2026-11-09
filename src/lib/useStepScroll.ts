"use client";

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";
import { wheelGates, type WheelGate } from "@/lib/stores";
import { sectionStops, stepSections, touchStepsChanged } from "@/lib/touchSteps";

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

const lenisOf = () => (window as unknown as { __lenis?: Lenis }).__lenis;

/** When the last wheel or trackpad input came in: the catch only acts on scrolling someone is doing. */
let lastWheel = -Infinity;
if (typeof window !== "undefined") {
  window.addEventListener("wheel", () => (lastWheel = performance.now()), { passive: true, capture: true });
}

/** Fractional step index of `y` between the stops `ys`. */
function stepAt(ys: number[], y: number) {
  if (y <= ys[0]) return 0;
  for (let i = 0; i < ys.length - 1; i++) {
    if (y <= ys[i + 1]) return i + (y - ys[i]) / Math.max(1, ys[i + 1] - ys[i]);
  }
  return ys.length - 1;
}

/**
 * One push, one step. A pinned section is split into stops (`steps`: a
 * count spread evenly over the pin, or a list of section progress values,
 * see sectionStops), and each wheel notch or trackpad push glides to the
 * next one. Pushes chain: scroll three times quickly and it moves three
 * stops, each new push picking up from where the last one was headed.
 * `media` limits the wheel behaviour; phones page through the same stops
 * one swipe each (see touchSteps).
 *
 * What doesn't count is momentum. Trackpads keep sending a fading tail of
 * events for a second or more after the fingers lift; a push is only a new
 * one when it arrives after a pause or rises again after the input had died
 * down. At the first and last stop a new push is handed back to normal
 * scrolling, so leaving the section feels like any other scroll.
 *
 * A hard fling can't fly past the section either: arriving at speed with
 * the scroll aimed beyond it, the page is caught on its first stop (or its
 * last, coming back up).
 */
export function useStepScroll(ref: RefObject<HTMLElement | null>, steps: number | readonly number[], media?: string) {
  const key = typeof steps === "number" ? String(steps) : steps.join(",");
  useEffect(() => {
    const el = ref.current;
    const list = key.split(",").map(Number);
    const spec: number | number[] = key.includes(",") ? list : list[0];
    const count = typeof spec === "number" ? spec : spec.length;
    if (!el || count < 2) return;
    const stops = () => sectionStops(el, spec);
    const wheelOn = () => !media || window.matchMedia(media).matches;

    let history: number[] = [];
    let lastAt = 0;
    let released = false;
    let goal: number | null = null;
    let glideUntil = 0;
    let lastPushAt = 0;
    // The strongest and weakest input since the last accepted push.
    let peak = 0;
    let trough = Infinity;

    const glideTo = (lenis: Lenis, ys: number[], target: number) => {
      goal = target;
      glideUntil = performance.now() + STEP_SECONDS * 1000;
      lenis.scrollTo(ys[target], { duration: STEP_SECONDS, easing: ease, force: true });
    };

    const gate: WheelGate = ({ deltaY, event }) => {
      if (event.type !== "wheel" || !wheelOn()) return true;
      const lenis = lenisOf();
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

      const ys = stops();
      const y = lenis.animatedScroll;
      if (y < ys[0] - 4 || y > ys[ys.length - 1] + 4) {
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
      const f = stepAt(ys, y);

      // Arrived mid-way (from below, a scrollbar drag, a resize): settle on the stop ahead.
      if (goal === null && Math.abs(f - Math.round(f)) >= 0.04) {
        glideTo(lenis, ys, deltaY > 0 ? Math.ceil(f) : Math.floor(f));
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
      if (target < 0 || target > ys.length - 1) {
        // Past the first or last stop: let the page scroll on, once any glide has landed.
        if (gliding) return swallow();
        released = true;
        return true;
      }
      lastPushAt = now;
      peak = mag;
      trough = Infinity;
      glideTo(lenis, ys, target);
      return swallow();
    };

    // The catch: watch the page move, and when a scroll (however hard) carries it into the
    // section, bring it to rest on the first stop (the last, coming back up) instead of
    // wherever the scroll was going to end. Jumps from links don't count: only wheel input.
    let lastY = window.scrollY;
    const onScroll = () => {
      const lenis = lenisOf();
      const y = lenis ? lenis.animatedScroll : window.scrollY;
      const prev = lastY;
      lastY = y;
      const now = performance.now();
      if (!lenis || !wheelOn() || now < glideUntil || now - lastWheel > 1200) return;
      const ys = stops();
      const first = ys[0];
      const last = ys[ys.length - 1];
      const aim = lenis.targetScroll;
      if (prev < first - 4 && y >= first - 4 && aim > first + 4) {
        released = false;
        glideTo(lenis, ys, 0);
      } else if (prev > last + 4 && y <= last + 4 && aim < last - 4) {
        released = false;
        glideTo(lenis, ys, ys.length - 1);
      }
    };

    wheelGates.add(gate);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Touch screens page through the same stops, one swipe each (see touchSteps).
    const section = { el, stops };
    stepSections.add(section);
    touchStepsChanged();
    return () => {
      wheelGates.delete(gate);
      window.removeEventListener("scroll", onScroll);
      stepSections.delete(section);
      touchStepsChanged();
    };
    // `key` stands in for `steps`, so a new array with the same stops doesn't re-run this.
  }, [ref, key, media]);
}

/**
 * Phones: the home page turns like pages, one swipe per stop, built on
 * GSAP's Observer.
 *
 * Every stop on the page is listed top to bottom: each step of the pinned
 * sections (hero, prologue, fiction, contact; see useStepScroll), one stop
 * for each section that fits on a screen, and a stop every screen or so in
 * the taller ones (marked `data-page`), down to the footer. Observer takes
 * the touch from the very first movement, so the browser never starts a
 * scroll of its own alongside ours (which is what made a swipe move twice),
 * and each swipe glides to the next stop above or below where the page is,
 * or where the running glide is headed, so quick swipes chain.
 *
 * Stops are always found from the page's position, never by guessing the
 * nearest one, so a swipe back up can only ever land on the stop directly
 * above. And because the whole page is paged there is no hand-over to the
 * browser's own scrolling to get wrong on the way back.
 *
 * A wheel or trackpad on a touch screen (a tablet's keyboard, or a phone
 * being tried out in the browser's device mode) pages the same way: one
 * push, one stop (see wheelPush), so it behaves just as a swipe does.
 *
 * Desktop wheels and trackpads are handled by useStepScroll with Lenis.
 */
import type Lenis from "lenis";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { wheelGates, type WheelGate } from "@/lib/stores";
import { createPushDetector, GESTURE_GAP_MS } from "@/lib/wheelPush";

/** A pinned section and where its steps sit on the page (document y, in px). */
export type StepSection = { el: HTMLElement; stops: () => number[] };
export const stepSections = new Set<StepSection>();

let resync: (() => void) | null = null;
/** Call when sections come and go (page changes), so paging is switched on or off to match. */
export function touchStepsChanged() {
  resync?.();
  requestAnimationFrame(() => resync?.());
}

/** Development only: `localStorage["sk-touch"] = "1"` turns this on with a mouse, for testing. */
function forced(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  try {
    return localStorage.getItem("sk-touch") === "1";
  } catch {
    return false;
  }
}

export function isTouchPaged(): boolean {
  return typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || forced());
}

export const docTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

/**
 * Where a pinned section's steps sit. A number spreads that many steps evenly
 * over the pin; a list gives each step as section progress, measured from the
 * section's top entering at the bottom of the screen (0) to its bottom
 * reaching the bottom of the screen (1).
 */
export function sectionStops(el: HTMLElement, spec: number | readonly number[]): number[] {
  const top = docTop(el);
  const vh = window.innerHeight;
  const h = el.offsetHeight;
  if (typeof spec === "number") {
    const range = Math.max(0, h - vh);
    return Array.from({ length: spec }, (_, k) => Math.round(top + (range * k) / Math.max(1, spec - 1)));
  }
  return spec.map((p) => Math.round(top - vh + p * h));
}

/**
 * A section that scrolls normally: one stop if it fits on a screen (centred), otherwise about
 * one per screen. Inside it, `data-page-stop` marks something a stop should begin with (just
 * under the nav), so a heading is carried onto the next screen instead of being cut through.
 */
function pageStops(el: HTMLElement): number[] {
  const top = docTop(el);
  const vh = window.innerHeight;
  const h = el.offsetHeight;
  // A section only a little taller than the screen still gets one stop, at its top.
  if (h <= vh + 2) return [Math.round(top + (h - vh) / 2)];
  const marks = Array.from(el.querySelectorAll<HTMLElement>("[data-page-stop]"));
  if (marks.length) {
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
    const end = top + h - vh;
    const ys = [top, ...marks.map((m) => Math.min(end, Math.max(top, docTop(m) - nav - 12))), end];
    return ys.map(Math.round);
  }
  if (h - vh < vh * 0.25) return [Math.round(top)];
  const n = Math.ceil((h - vh) / (vh * 0.85));
  return Array.from({ length: n + 1 }, (_, k) => Math.round(top + ((h - vh) * k) / n));
}

/** Every stop on the page, top to bottom, closer ones merged. Empty on pages that aren't paged. */
function layout(): number[] {
  if (!stepSections.size) return [];
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const ys: number[] = [0, max];
  for (const s of stepSections) ys.push(...s.stops());
  document.querySelectorAll<HTMLElement>("[data-page]").forEach((el) => ys.push(...pageStops(el)));
  const sorted = ys.map((y) => Math.min(max, Math.max(0, y))).sort((a, b) => a - b);
  const out: number[] = [];
  for (const y of sorted) if (!out.length || y - out[out.length - 1] > 48) out.push(y);
  // The end of the page always counts, even when it's close to the stop before it.
  if (out[out.length - 1] !== max) out[out.length - 1] = max;
  return out;
}

/** A glide's length grows a little with distance, so a screen-wide move doesn't feel rushed. */
const durationFor = (px: number) => 0.5 + 0.22 * Math.min(2, Math.abs(px) / window.innerHeight);

export function installTouchSteps(): () => void {
  if (!isTouchPaged()) return () => undefined;
  gsap.registerPlugin(Observer, ScrollToPlugin);

  /** Where the running glide is headed. */
  let goal: number | null = null;
  let tween: gsap.core.Tween | null = null;
  let used = false;

  const glideTo = (y: number) => {
    tween?.kill();
    goal = y;
    tween = gsap.to(window, {
      scrollTo: { y, autoKill: false },
      duration: durationFor(y - window.scrollY),
      ease: "power3.out",
      onComplete: () => {
        tween = null;
        goal = null;
      },
    });
  };

  const go = (dir: 1 | -1) => {
    // The opening screen takes the first swipe for itself (see Intro).
    if (document.documentElement.dataset.gate === "open") return;
    const ys = layout();
    if (ys.length < 2) return;
    const from = goal ?? window.scrollY;
    const next = dir > 0 ? ys.find((y) => y > from + 6) : [...ys].reverse().find((y) => y < from - 6);
    if (next !== undefined) glideTo(next);
  };

  const intent = Observer.create({
    target: window,
    type: forced() ? "touch,pointer" : "touch",
    tolerance: 8,
    preventDefault: true,
    // Taps on links and buttons still go through.
    allowClicks: true,
    // Overlays (the menu, the atmosphere panel) keep their own touches.
    ignore: "[data-touch-native]",
    onPress: () => {
      used = false;
    },
    // A finger moving up scrolls the page down: the next stop.
    onUp: () => {
      if (used) return;
      used = true;
      go(1);
    },
    onDown: () => {
      if (used) return;
      used = true;
      go(-1);
    },
  });
  intent.disable();

  // A wheel or trackpad: every event is held back from the page, and each new push moves one stop.
  const push = createPushDetector();
  let paged = false;
  // The scroll that opens the front door (see Intro) is the door's, momentum and all: nothing
  // here moves until that input has died away, or until a moment has passed if there was none.
  let doorClosedAt = -Infinity;
  let doorMomentum = false;
  let lastWheelAt = -Infinity;
  const door = new MutationObserver(() => {
    if (document.documentElement.dataset.gate !== "open" && doorClosedAt === -Infinity) {
      doorClosedAt = performance.now();
      doorMomentum = true;
    }
  });
  door.observe(document.documentElement, { attributes: true, attributeFilter: ["data-gate"] });
  const onWheel = (event: WheelEvent, deltaY: number): boolean => {
    // Pinch zoom, sideways scrolling, and the overlays (the menu, the atmosphere panel) keep theirs.
    if (!paged || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return true;
    if ((event.target as Element | null)?.closest?.("[data-touch-native]")) return true;
    if (event.cancelable) event.preventDefault();
    if (document.documentElement.dataset.gate === "open") return false;
    const input = push.read(event, deltaY);
    const firstSince = lastWheelAt < doorClosedAt;
    const gap = input.now - lastWheelAt;
    lastWheelAt = input.now;
    if (doorMomentum) {
      // The door's own input never reaches here, so its tail is whatever arrives straight after.
      if (firstSince ? input.now - doorClosedAt < 400 : gap < GESTURE_GAP_MS) return false;
      doorMomentum = false;
    }
    if (deltaY !== 0 && push.isPush(input)) {
      push.accept(input);
      go(deltaY > 0 ? 1 : -1);
    }
    return false;
  };
  const gate: WheelGate = ({ deltaY, event }) => (event.type === "wheel" ? onWheel(event as WheelEvent, deltaY) : true);
  // With smooth scrolling on, it asks its gates; without it (calm motion), the page's own wheel events come here.
  const lenisOf = () => (window as unknown as { __lenis?: Lenis }).__lenis;
  const onNativeWheel = (e: WheelEvent) => {
    if (!lenisOf()) onWheel(e, e.deltaY);
  };
  wheelGates.add(gate);
  window.addEventListener("wheel", onNativeWheel, { passive: false });

  // On only on a page with stops (the home page); everywhere else the browser scrolls as usual.
  const sync = () => {
    paged = layout().length > 1;
    if (paged) intent.enable();
    else {
      intent.disable();
      tween?.kill();
      tween = null;
      goal = null;
    }
  };
  resync = sync;
  const first = requestAnimationFrame(sync);

  return () => {
    cancelAnimationFrame(first);
    resync = null;
    tween?.kill();
    intent.kill();
    door.disconnect();
    wheelGates.delete(gate);
    window.removeEventListener("wheel", onNativeWheel);
  };
}

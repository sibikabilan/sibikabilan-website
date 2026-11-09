/**
 * Phones: one swipe, one step, built on GSAP's Observer.
 *
 * The top of the home page (hero, prologue, the long way here) is one paged
 * zone. Its stops are every step of every pinned section, in order. While
 * the page is in that zone, Observer takes the touch input from the very
 * first movement (so the browser never starts a scroll of its own alongside
 * ours, which is what made a swipe move twice), and each swipe glides to the
 * next or previous stop with ScrollToPlugin. Swipes chain: a new swipe while
 * a glide is running carries on from where that glide was headed.
 *
 * Swiping on from the last stop glides to the section below and hands the
 * page back to the browser's own scrolling. Scrolling back up into the zone
 * (a fling from below) freezes the momentum and settles on the last stop.
 *
 * Desktop wheels and trackpads are handled by useStepScroll with Lenis.
 */
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

export type StepSection = { el: HTMLElement; steps: number };
export const stepSections = new Set<StepSection>();

let resync: (() => void) | null = null;
/** Call when sections come and go (page changes), so the zone is switched on or off to match. */
export function touchStepsChanged() {
  resync?.();
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

const docTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

/** Every stop in the zone, top to bottom, plus where the zone hands over to normal scrolling. */
function layout(): { stops: number[]; exit: number } {
  const sections = [...stepSections].sort((a, b) => docTop(a.el) - docTop(b.el));
  const stops: number[] = [];
  for (const s of sections) {
    const top = docTop(s.el);
    const range = Math.max(0, s.el.offsetHeight - window.innerHeight);
    for (let k = 0; k < s.steps; k++) stops.push(Math.round(top + (range * k) / Math.max(1, s.steps - 1)));
  }
  const last = sections[sections.length - 1];
  const exit = last ? Math.round(docTop(last.el) + last.el.offsetHeight) : 0;
  return { stops, exit };
}

/** A glide's length grows a little with distance, so a screen-wide move doesn't feel rushed. */
const durationFor = (px: number) => 0.5 + 0.22 * Math.min(2, Math.abs(px) / window.innerHeight);

export function installTouchSteps(): () => void {
  if (!isTouchPaged()) return () => undefined;
  gsap.registerPlugin(Observer, ScrollToPlugin);
  const root = document.documentElement;

  let goal: number | null = null;
  let tween: gsap.core.Tween | null = null;
  let used = false;
  let lastY = window.scrollY;
  let flingAt = -Infinity;

  const nearest = (stops: number[], y: number) => {
    let best = 0;
    for (let i = 1; i < stops.length; i++) if (Math.abs(stops[i] - y) < Math.abs(stops[best] - y)) best = i;
    return best;
  };

  const glideTo = (y: number, index: number | null, then?: () => void) => {
    tween?.kill();
    goal = index;
    // Overflow stays hidden for the glide: it stops any momentum still running (iOS
    // included) and nothing else can move the page underneath it.
    root.style.overflow = "hidden";
    tween = gsap.to(window, {
      scrollTo: { y, autoKill: false },
      duration: durationFor(y - window.scrollY),
      ease: "power3.out",
      onComplete: () => {
        tween = null;
        goal = null;
        root.style.overflow = "";
        lastY = window.scrollY;
        then?.();
      },
    });
  };

  const go = (dir: 1 | -1) => {
    const { stops, exit } = layout();
    if (!stops.length) return;
    const from = goal ?? nearest(stops, window.scrollY);
    const next = from + dir;
    if (next < 0) {
      glideTo(stops[0], 0);
      return;
    }
    if (next >= stops.length) {
      // Past the last stop: glide to the section below and give the page back.
      glideTo(exit, null, () => intent.disable());
      return;
    }
    glideTo(stops[next], next);
  };

  const intent = Observer.create({
    target: window,
    type: forced() ? "touch,pointer" : "touch",
    tolerance: 8,
    preventDefault: true,
    // Taps on links and buttons still go through.
    allowClicks: true,
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

  const inZone = (y: number) => y < layout().exit - 2;
  // On only while the page is inside the zone (and there is a zone: other pages have none).
  const sync = () => {
    if (tween) return;
    if (inZone(window.scrollY)) intent.enable();
    else intent.disable();
  };
  resync = sync;
  const first = requestAnimationFrame(sync);

  // Below the zone the browser scrolls natively; coming back up into it, take over again.
  const onTouchEnd = () => {
    if (!intent.isEnabled) flingAt = performance.now();
  };
  const onScroll = () => {
    const y = window.scrollY;
    const up = y < lastY;
    lastY = y;
    if (tween) return;
    const zone = inZone(y);
    if (zone && !intent.isEnabled) {
      intent.enable();
      // A fling from below: stop it on the last stop rather than letting it carry on.
      if (up && performance.now() - flingAt < 2500) {
        const { stops } = layout();
        if (stops.length) glideTo(stops[stops.length - 1], stops.length - 1);
      }
    } else if (!zone && intent.isEnabled) intent.disable();
  };

  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    cancelAnimationFrame(first);
    resync = null;
    tween?.kill();
    intent.kill();
    root.style.overflow = "";
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("scroll", onScroll);
  };
}

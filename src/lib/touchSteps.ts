/**
 * Phones: one swipe, one step.
 *
 * The pinned sections (hero, prologue, the long way here) are split into
 * equal stops. On a touch screen a swipe inside one glides to the next stop
 * and no further, and swipes chain: a second swipe while the first is still
 * gliding carries on to the stop after, with no wait. At the first and last
 * stop the swipe is handed back to the browser, so leaving feels like any
 * other scroll. A fling that carries into
 * a section from outside is caught on its first stop instead of sailing
 * through it.
 *
 * Anchors are softer: scroll down onto one and, once the page comes to rest
 * with it near the top, it settles just under the nav.
 */

export type StepSection = { el: HTMLElement; steps: number };
export const stepSections = new Set<StepSection>();
export const settleAnchors = new Set<HTMLElement>();

/** Height of the floating nav: anchors settle just below it. */
const NAV = 68;
/** A drag shorter than this is a nudge, not a swipe: it settles back. */
const SWIPE = 24;
const GLIDE_MS = 520;
/** A fling counts as the visitor's for this long after the finger lifts. */
const FLING_MS = 2200;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

type Span = { s: StepSection; top: number; end: number; size: number; last: number };

function spanOf(s: StepSection): Span {
  const top = s.el.getBoundingClientRect().top + window.scrollY;
  const range = Math.max(0, s.el.offsetHeight - window.innerHeight);
  const last = Math.max(1, s.steps - 1);
  return { s, top, end: top + range, size: range / last, last };
}

function spanAt(y: number): Span | null {
  for (const s of stepSections) {
    const sp = spanOf(s);
    if (sp.size > 0 && y >= sp.top - 2 && y <= sp.end + 2) return sp;
  }
  return null;
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

export function installTouchSteps(): () => void {
  if (!window.matchMedia("(pointer: coarse)").matches && !forced()) return () => undefined;
  const root = document.documentElement;

  let raf = 0;
  let gliding = false;
  /** Where the current glide is headed, so a swipe mid-glide continues from there. */
  let goal: { sp: Span; k: number } | null = null;
  let touching = false;
  let startY = 0;
  let mode: "idle" | "native" | "step" = "idle";
  let held: { sp: Span; f: number } | null = null;
  let lastY = window.scrollY;
  let dir = 0;
  let flingAt = -Infinity;
  let flingFrom = 0;
  let idle = 0;

  const glide = (to: number) => {
    cancelAnimationFrame(raf);
    const from = window.scrollY;
    if (Math.abs(to - from) < 1) return;
    gliding = true;
    // Hiding overflow for the glide stops any momentum still running (iOS included);
    // scrolling from script still works underneath.
    root.style.overflow = "hidden";
    const t0 = performance.now();
    const frame = () => {
      const t = Math.min(1, (performance.now() - t0) / GLIDE_MS);
      window.scrollTo(0, from + (to - from) * ease(t));
      if (t < 1) {
        raf = requestAnimationFrame(frame);
        return;
      }
      gliding = false;
      goal = null;
      root.style.overflow = "";
      lastY = window.scrollY;
    };
    raf = requestAnimationFrame(frame);
  };

  const toStep = (sp: Span, k: number) => {
    const to = Math.min(sp.last, Math.max(0, k));
    goal = { sp, k: to };
    glide(sp.top + to * sp.size);
  };

  const settleAnchors_ = () => {
    if (gliding || touching || dir <= 0 || performance.now() - flingAt > FLING_MS + 1500) return;
    const h = window.innerHeight;
    for (const el of settleAnchors) {
      const top = el.getBoundingClientRect().top;
      if (Math.abs(top - NAV) > 4 && top > -h * 0.2 && top < h * 0.6) {
        glide(window.scrollY + top - NAV);
        return;
      }
    }
  };
  const scheduleSettle = () => {
    window.clearTimeout(idle);
    idle = window.setTimeout(settleAnchors_, 180);
  };

  const onStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    touching = true;
    startY = e.touches[0].clientY;
    mode = "idle";
    held = null;
  };

  const onMove = (e: TouchEvent) => {
    if (mode === "native" || e.touches.length !== 1) return;
    const dy = startY - e.touches[0].clientY;
    if (mode === "idle" && gliding && goal) {
      // Mid-glide: this swipe picks up from where the glide is headed.
      if (e.cancelable) e.preventDefault();
      if (Math.abs(dy) < 6) return;
      mode = "step";
      held = { sp: goal.sp, f: goal.k };
    }
    if (mode === "idle") {
      if (Math.abs(dy) < 6) return;
      const sp = spanAt(window.scrollY);
      if (!sp) {
        mode = "native";
        return;
      }
      const f = (window.scrollY - sp.top) / sp.size;
      const at = Math.round(f);
      const settled = Math.abs(f - at) < 0.04;
      // Swiping on from the last stop, or back from the first, leaves the section.
      if (settled && ((at >= sp.last && dy > 0) || (at <= 0 && dy < 0))) {
        mode = "native";
        return;
      }
      mode = "step";
      held = { sp, f };
    }
    if (e.cancelable) e.preventDefault();
  };

  const onEnd = (e: TouchEvent) => {
    touching = e.touches.length > 0;
    const dy = startY - (e.changedTouches[0]?.clientY ?? startY);
    if (mode === "step" && held) {
      const { sp, f } = held;
      const at = Math.round(f);
      const settled = Math.abs(f - at) < 0.04;
      let k = at;
      if (Math.abs(dy) >= SWIPE) k = settled ? at + (dy > 0 ? 1 : -1) : dy > 0 ? Math.ceil(f) : Math.floor(f);
      toStep(sp, k);
    } else if (mode === "native") {
      flingAt = performance.now();
      flingFrom = window.scrollY;
      dir = dy > 0 ? 1 : dy < 0 ? -1 : dir;
      scheduleSettle();
    }
    mode = "idle";
    held = null;
  };

  const onScroll = () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 0.5) dir = y > lastY ? 1 : -1;
    lastY = y;
    if (gliding || touching) return;
    // Only the visitor's own fling is caught; links and buttons that scroll the page are left alone.
    if (performance.now() - flingAt > FLING_MS) return;
    const sp = spanAt(y);
    if (sp) {
      const f = (y - sp.top) / sp.size;
      if (Math.abs(f - Math.round(f)) > 0.04) {
        flingAt = -Infinity;
        if (dir > 0) toStep(sp, flingFrom < sp.top - 2 ? 0 : Math.ceil(f));
        else toStep(sp, flingFrom > sp.end + 2 ? sp.last : Math.floor(f));
        return;
      }
    }
    scheduleSettle();
  };

  window.addEventListener("touchstart", onStart, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onEnd, { passive: true });
  window.addEventListener("touchcancel", onEnd, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(idle);
    root.style.overflow = "";
    window.removeEventListener("touchstart", onStart);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onEnd);
    window.removeEventListener("touchcancel", onEnd);
    window.removeEventListener("scroll", onScroll);
  };
}

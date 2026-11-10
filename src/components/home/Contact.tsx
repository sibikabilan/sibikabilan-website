"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import type { Settings } from "@/lib/cms/types";
import { useAtmosphere } from "@/lib/stores";
import { useStepScroll } from "@/lib/useStepScroll";

/**
 * Progress runs from the moment the section's top enters the screen to the
 * moment its bottom reaches the bottom edge. In a 230svh section the frame
 * pins at 100/230 of the way, so the walk is already underway as it rises in.
 */
const PIN = 100 / 230;
/** Progress at which the walk reaches the door. */
const ARRIVE = 0.86;
/** How much of the clip to use: it stops at the open door, before the light washes the frame out. */
const STOP = 0.86;
/**
 * The two places a scroll comes to rest (section progress, see sectionStops):
 * partway down the corridor with the invitation up, then at the door. A hard
 * scroll or fling is caught on the first, so nobody sails past (useStepScroll),
 * and the page doesn't move on from the door until the walk has got there.
 */
const HOLDS = [0.5, 1] as const;

/** Forward, the walk runs at about the footage's own pace, a little quicker when there's far to go. */
const MAX_RATE = 1.5;
/** Pushing on while it's still walking hurries it along, up to this. */
const HURRY_RATE = 2.2;
/** How long a push keeps it hurrying, in ms. */
const HURRY_MS = 1600;
/** Footage that hasn't moved for this long (still loading, say) doesn't keep the page waiting. */
const STALL_MS = 1500;
/** Back up the corridor (seeking, since video can't play in reverse) it may go this much faster. */
const BACK_RATE = 2.4;

/** Scroll-linked value between two points; a function transform so it follows this section, not the page. */
function useBetween(p: MotionValue<number>, a: number, b: number, from: number, to: number) {
  return useTransform(p, (v) => from + (to - from) * Math.min(1, Math.max(0, (v - a) / (b - a))));
}

/**
 * The last room. Scrolling walks you down a concrete corridor to an open
 * door: the scroll sets how far down the corridor you are headed, and the
 * footage walks there at its own pace (a little quicker if you push on), so
 * however quickly the page moves the walk never fast-forwards, and the page
 * waits at the door for it. The light from the door blooms and the rest of the
 * invitation arrives with the footage, as you near the door; the title
 * settles in the middle of the screen as the frame pins.
 */
export function Contact({ settings }: { settings: Settings }) {
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { motion: mode } = useAtmosphere();
  const calm = mode === "calm";
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end end"] });
  /** The footage (1.4 MB) only starts loading as the page nears it, a couple of screens ahead. */
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "250% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  /** When the footage last moved on, and until when it's been asked to hurry. */
  const pace = useRef({ movedAt: 0, hurryUntil: 0 });
  /**
   * Where in the footage the scroll is headed, in seconds (null: nothing to walk). Measured
   * from where the section is right now rather than from `p`, which only catches up with the
   * page a frame or so later: the page mustn't be let go on a stale reading.
   */
  const aim = useCallback(() => {
    const v = video.current;
    const el = ref.current;
    const d = v?.duration;
    if (!v || !el || calm || !d || Number.isNaN(d)) return null;
    const r = el.getBoundingClientRect();
    const progress = (window.innerHeight - r.top) / Math.max(1, r.height);
    return Math.min(1, Math.max(0, progress / ARRIVE)) * d * STOP;
  }, [calm]);
  const hold = useMemo(
    () => ({
      // Free to move on once the walk is at the scroll's mark, or if the footage is stuck.
      ready: () => {
        const target = aim();
        const v = video.current;
        if (target === null || !v) return true;
        return v.currentTime >= target - 0.05 || performance.now() - pace.current.movedAt > STALL_MS;
      },
      nudge: () => {
        pace.current.hurryUntil = performance.now() + HURRY_MS;
      },
    }),
    [aim]
  );
  useStepScroll(ref, HOLDS, undefined, hold);

  /** How far down the corridor the footage is, 0 to 1 (the door). */
  const walk = useMotionValue(0);
  const bloom = useBetween(walk, 0.52, 1, 0, 1);
  // The title is in by the first hold; the rest arrives on the way to the door.
  const titleIn = useBetween(p, PIN - 0.08, PIN + 0.05, 0, 1);
  const titleY = useBetween(p, PIN - 0.08, PIN + 0.06, 32, 0);
  const restIn = useBetween(walk, 0.7, 0.94, 0, 1);
  const restY = useBetween(walk, 0.7, 0.96, 20, 0);

  useEffect(() => {
    const v = video.current;
    const el = ref.current;
    const state = pace.current;
    if (!v || !el || calm || !near) return;
    let raf = 0;
    let last = 0;
    let primed = false;
    /** Whether the walk wants the footage running right now. */
    let walking = false;
    /** Where the footage was last frame. */
    let lastT = -1;
    // Some browsers only decode frames for seeking once the video has played a moment.
    const prime = () => {
      if (primed) return;
      primed = true;
      v.play()
        .then(() => !walking && v.pause())
        .catch(() => undefined);
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      const target = aim();
      if (target === null) return;
      const end = v.duration * STOP;
      const t = v.currentTime;
      if (t !== lastT || !walking) {
        lastT = t;
        state.movedAt = performance.now();
      }
      walking = target > t + 0.05;
      if (walking) {
        // Ahead: let it play, a little quicker while there's far to go (quicker still if
        // someone's pushing on), easing in as it arrives.
        const cap = now < state.hurryUntil ? HURRY_RATE : MAX_RATE;
        const rate = Math.min(cap, Math.max(0.6, (target - t) / 0.6));
        if (Math.abs(v.playbackRate - rate) > 0.04) v.playbackRate = rate;
        if (v.paused) v.play().catch(() => undefined);
      } else if (target < t - 0.05) {
        // Behind: step back a frame at a time. One seek at a time, or the decoder starves
        // and the picture freezes mid-swipe.
        if (!v.paused) v.pause();
        if (!v.seeking) v.currentTime = Math.max(target, t - Math.max(1 / 30, dt * BACK_RATE));
      } else if (!v.paused) v.pause();
      walk.set(Math.min(1, v.currentTime / end));
    };
    const io = new IntersectionObserver(
      ([e]) => {
        cancelAnimationFrame(raf);
        last = 0;
        state.movedAt = performance.now();
        if (e.isIntersecting) {
          prime();
          raf = requestAnimationFrame(tick);
        } else if (!v.paused) v.pause();
      },
      { rootMargin: "50% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [aim, calm, near, walk]);

  return (
    <section
      id="contact"
      data-spotlight="off"
      ref={ref}
      className="relative h-[230svh] bg-black"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0"
      aria-labelledby="contact-title"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <video
          ref={video}
          // In calm mode the hallway is the still alone.
          src={near && !calm ? "/media/hallway.mp4" : undefined}
          poster="/media/hallway-poster.webp"
          muted
          playsInline
          preload={near ? "auto" : "none"}
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* the light from the doorway, swelling as you get close */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: calm ? 0.6 : bloom,
            background: "radial-gradient(46% 56% at 50% 44%, rgb(255 248 236 / 0.22), transparent 70%)",
          }}
        />
        {/* a soft shade behind the words so they read against the bright door */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 46% at 50% 52%, rgb(0 0 0 / 0.5), rgb(0 0 0 / 0.18) 70%, rgb(0 0 0 / 0.3))",
          }}
        />
        {/* blend into the section above and the footer below */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[22svh] bg-gradient-to-b from-[var(--bg)] to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[24svh] bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col items-center justify-center px-5 text-center md:px-10">
          <motion.div style={calm ? undefined : { opacity: titleIn, y: titleY }}>
            <p className="eyebrow text-white/70">Contact</p>
            <h2
              id="contact-title"
              className="display mx-auto mt-6 max-w-[14ch] text-[clamp(3rem,8vw,7.5rem)] text-white [text-shadow:0_2px_30px_rgb(0_0_0/0.35)]"
            >
              The door&apos;s open. Say <em className="italic">hello.</em>
            </h2>
          </motion.div>
          <motion.div style={calm ? undefined : { opacity: restIn, y: restY }}>
            <p className="lede mx-auto mt-8 max-w-[580px] text-white/85 [text-shadow:0_1px_18px_rgb(0_0_0/0.45)]">
              Building something, investing in something, writing something, or just want to trade notes on agents and
              stories? I&apos;d like to hear from you.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <a href={`mailto:${settings.email}`} className="btn btn-key">
                {settings.email}
              </a>
              <a href={settings.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">
                LinkedIn ↗
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

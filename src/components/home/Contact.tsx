"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { Settings } from "@/lib/cms/types";
import { useAtmosphere } from "@/lib/stores";

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

/** Scroll-linked value between two points; a function transform so it follows this section, not the page. */
function useBetween(p: MotionValue<number>, a: number, b: number, from: number, to: number) {
  return useTransform(p, (v) => from + (to - from) * Math.min(1, Math.max(0, (v - a) / (b - a))));
}

/**
 * The last room. Scrolling walks you down a concrete corridor to an open
 * door: the footage is scrubbed by scroll from the moment the section comes
 * into view, the light from the door blooms as you near it, and the
 * invitation settles in the middle of the screen as the frame pins.
 */
export function Contact({ settings }: { settings: Settings }) {
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { motion: mode } = useAtmosphere();
  const calm = mode === "calm";
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end end"] });

  const bloom = useBetween(p, 0.45, ARRIVE, 0, 1);
  const titleIn = useBetween(p, PIN - 0.06, PIN + 0.1, 0, 1);
  const titleY = useBetween(p, PIN - 0.06, PIN + 0.12, 32, 0);
  const restIn = useBetween(p, PIN + 0.08, PIN + 0.22, 0, 1);
  const restY = useBetween(p, PIN + 0.08, PIN + 0.24, 20, 0);

  useEffect(() => {
    const v = video.current;
    const el = ref.current;
    if (!v || !el || calm) return;
    let raf = 0;
    let shown = 0;
    let primed = false;
    // Some browsers only decode frames for seeking once the video has played a moment.
    const prime = () => {
      if (primed) return;
      primed = true;
      v.play()
        .then(() => v.pause())
        .catch(() => undefined);
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const d = v.duration;
      if (!d || Number.isNaN(d)) return;
      const walk = Math.min(1, Math.max(0, p.get() / ARRIVE));
      const target = walk * d * STOP;
      shown += (target - shown) * 0.18;
      // One seek at a time: asking for a new frame before the last one has
      // painted starves the decoder, and the picture freezes mid-swipe.
      if (!v.seeking && Math.abs(v.currentTime - shown) > 1 / 30) v.currentTime = shown;
    };
    const io = new IntersectionObserver(
      ([e]) => {
        cancelAnimationFrame(raf);
        if (e.isIntersecting) {
          prime();
          tick();
        }
      },
      { rootMargin: "50% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [calm, p]);

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
          src="/media/hallway.mp4"
          poster="/media/hallway-poster.webp"
          muted
          playsInline
          preload="auto"
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

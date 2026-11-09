"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { Settings } from "@/lib/cms/types";
import { useAtmosphere } from "@/lib/stores";

/** Scroll progress through the section at which the walk reaches the door. */
const ARRIVE = 0.78;

/** Scroll-linked value between two points; a function transform so it follows this section, not the page. */
function useBetween(p: MotionValue<number>, a: number, b: number, from: number, to: number) {
  return useTransform(p, (v) => from + (to - from) * Math.min(1, Math.max(0, (v - a) / (b - a))));
}

/**
 * The last room. Scrolling walks you down a concrete corridor toward a lit
 * doorway: the footage is scrubbed by scroll (eased, so it glides rather than
 * stutters), the light from the door blooms as you near it, and the
 * invitation arrives as you reach it.
 */
export function Contact({ settings }: { settings: Settings }) {
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { motion: mode } = useAtmosphere();
  const calm = mode === "calm";
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const bloom = useBetween(p, 0.35, ARRIVE + 0.1, 0, 1);
  const titleIn = useBetween(p, 0.42, 0.62, 0, 1);
  const titleY = useBetween(p, 0.42, 0.66, 28, 0);
  const restIn = useBetween(p, 0.62, 0.8, 0, 1);
  const restY = useBetween(p, 0.62, 0.82, 18, 0);

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
      const target = Math.min(1, Math.max(0, p.get() / ARRIVE)) * (d - 0.05);
      shown += (target - shown) * 0.14;
      if (Math.abs(v.currentTime - shown) > 1 / 48) v.currentTime = shown;
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        prime();
        cancelAnimationFrame(raf);
        tick();
      } else cancelAnimationFrame(raf);
    });
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
      className="relative h-[260svh] bg-black"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0"
      aria-labelledby="contact-title"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="grade absolute inset-0">
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
        </div>
        {/* the light from the doorway, swelling as you get close */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: calm ? 0.6 : bloom,
            background: "radial-gradient(42% 52% at 50% 46%, rgb(255 248 236 / 0.28), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-black/35 to-black/80" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col items-center justify-end px-5 pb-[14svh] text-center md:px-10">
          <motion.div style={calm ? undefined : { opacity: titleIn, y: titleY }}>
            <p className="eyebrow text-white/60">Contact</p>
            <h2 id="contact-title" className="display mx-auto mt-6 max-w-[14ch] text-[clamp(3rem,8vw,7.5rem)] text-white">
              The door&apos;s open. Say <em className="italic">hello.</em>
            </h2>
          </motion.div>
          <motion.div style={calm ? undefined : { opacity: restIn, y: restY }}>
            <p className="lede mx-auto mt-8 max-w-[580px] text-white/75">
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

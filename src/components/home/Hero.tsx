"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Settings } from "@/lib/cms/types";
import { atmosphereStore, sceneStore } from "@/lib/stores";
import { HALOS } from "@/components/scene/targets";
import { LivePortrait } from "./LivePortrait";

const EASE = [0.16, 1, 0.3, 1] as const;

/** The halo changes crowns on its own, and on click. */
function useCrowns(ref: React.RefObject<HTMLDivElement | null>) {
  const variant = useSyncExternalStore(sceneStore.subscribe, () => sceneStore.get().variant, () => 0);
  const lastTouch = useRef(0);
  const visible = useRef(true);

  useEffect(() => {
    const el = ref.current;
    const io = el ? new IntersectionObserver(([e]) => (visible.current = e.isIntersecting)) : null;
    if (el && io) io.observe(el);
    const id = window.setInterval(() => {
      const calm = atmosphereStore.get().motion === "calm";
      if (!visible.current || calm || Date.now() - lastTouch.current < 9000) return;
      sceneStore.set({ variant: sceneStore.get().variant + 1 });
    }, 5200);
    return () => {
      window.clearInterval(id);
      io?.disconnect();
    };
  }, [ref]);

  const next = () => {
    lastTouch.current = Date.now();
    sceneStore.set({ variant: sceneStore.get().variant + 1 });
  };
  const i = ((variant % HALOS.length) + HALOS.length) % HALOS.length;
  return { next, index: i, name: HALOS[i].name };
}

export function Hero({ settings }: { settings: Settings }) {
  const d = 0.25;
  const stage = useRef<HTMLDivElement>(null);
  const crown = useCrowns(stage);
  return (
    <section
      className="relative min-h-[100svh] overflow-hidden"
      data-scene="halo"
      data-scene-side="1"
      data-scene-opacity="1"
    >
      {/* soft key light behind the portrait */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 55% at 72% 38%, color-mix(in oklab, var(--beam) 11%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1400px] grid-rows-[auto_1fr] px-5 pt-[var(--nav-h)] md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-1">
        {/* Portrait */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: EASE, delay: d }}
          className="relative order-1 mx-auto mt-4 aspect-square w-[min(88vw,460px)] lg:order-2 lg:mt-0 lg:h-full lg:w-full lg:max-w-none lg:aspect-auto"
        >
          <div
            ref={stage}
            className="absolute inset-x-0 bottom-0 aspect-square w-full lg:bottom-0 lg:left-auto lg:right-[-2%] lg:w-[min(96%,780px)]"
          >
            {/* The halo anchor: centered just above the head, wide enough to clear it. */}
            <div data-scene-anchor aria-hidden className="absolute left-1/2 top-[29%] h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2" />
            {/* Backlight: the halo's glow falling on the head and shoulders. */}
            <div
              aria-hidden
              className="absolute left-1/2 top-[30%] h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--beam) 26%, transparent) 0%, color-mix(in oklab, var(--rim) 10%, transparent) 45%, transparent 70%)",
              }}
            />
            <button
              type="button"
              onClick={crown.next}
              aria-label="Change the crown"
              title="Click to change the crown"
              className="absolute inset-0 cursor-pointer"
            >
              <LivePortrait priority className="h-full w-full" />
            </button>
          </div>
        </motion.div>

        {/* Words */}
        <div className="relative z-10 order-2 flex flex-col justify-end pb-12 pt-6 lg:order-1 lg:justify-center lg:pb-24 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: d }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[12px] text-ink-2 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--key)] opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--key)]" />
              </span>
              {settings.nowStatus}
            </span>
          </motion.div>

          <h1 className="display mt-7 text-[clamp(4rem,10.5vw,10rem)] text-ink">
            <span className="block overflow-hidden pb-[0.04em]">
              <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.4, ease: EASE, delay: d + 0.1 }}>
                Sibi
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span
                className="block italic text-ink-2"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.4, ease: EASE, delay: d + 0.22 }}
              >
                Kabilan
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: d + 0.5 }}
            className="eyebrow mt-4"
          >
            {settings.heroEyebrow}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: EASE, delay: d + 0.6 }}
            className="display mt-8 max-w-[560px] text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.12] text-ink"
          >
            {settings.heroHeadline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: d + 0.75 }}
            className="lede mt-5 max-w-[540px] text-[1.02rem]"
          >
            {settings.heroSub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: d + 0.9 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <a href="#prologue" className="btn btn-key">
              Roll the film <span aria-hidden>↓</span>
            </a>
            <Link href="/blog" className="btn btn-ghost">
              Read the writing
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: d + 1.2 }}
            className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-faint"
          >
            <span>Wearing</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={crown.index}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.45 }}
                className="text-ink-2"
              >
                {String(crown.index + 1).padStart(2, "0")} · {crown.name}
              </motion.span>
            </AnimatePresence>
            <button type="button" onClick={crown.next} className="rounded-full border border-line px-2.5 py-1 text-muted transition-colors hover:border-[var(--line-strong)] hover:text-ink">
              Change crown ↻
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: d + 1.4 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden justify-center pb-6 lg:flex"
      >
        <span className="flex flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
          Scroll
          <span className="relative block h-10 w-px overflow-hidden bg-[var(--line)]">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-[var(--key)]"
              animate={{ y: [-16, 40] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </span>
      </motion.div>
    </section>
  );
}

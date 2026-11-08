"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import type { Settings } from "@/lib/cms/types";
import { FACETS } from "@/lib/site";
import { sceneStore } from "@/lib/stores";
import { LivePortrait } from "./LivePortrait";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The opening. The portrait stays put while scrolling rewrites the words
 * beside it (who I am, then build, engineer, write) and the halo behind
 * him changes crown with each line.
 */
export function Hero({ settings }: { settings: Settings }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  const steps = 1 + FACETS.length;

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setStep(Math.min(steps - 1, Math.max(0, Math.floor(p * steps * 0.999))));
  });

  useEffect(() => {
    sceneStore.set({ variant: step });
  }, [step]);

  const facet = step > 0 ? FACETS[step - 1] : null;

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: `${steps * 85 + 15}svh` }}
      data-scene="halo"
      data-scene-side="1"
      data-scene-opacity="1"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 50% at 72% 42%, color-mix(in oklab, var(--beam) 10%, transparent), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid h-full max-w-[1400px] grid-rows-[46svh_1fr] px-5 pt-[var(--nav-h)] md:px-10 lg:grid-cols-[1fr_1fr] lg:grid-rows-1">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.8, ease: EASE, delay: 0.25 }}
            className="relative order-1 lg:order-2"
          >
            <div className="absolute bottom-0 left-1/2 aspect-square h-full -translate-x-1/2 lg:bottom-auto lg:top-[8svh] lg:h-[min(76svh,52vw)]">
              {/* The halo anchor: centered just above the head, wide enough to clear it. */}
              <div data-scene-anchor aria-hidden className="absolute left-1/2 top-[29%] h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2" />
              {/* Backlight: the halo's glow falling on the head and shoulders. */}
              <div
                aria-hidden
                className="absolute left-1/2 top-[30%] h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in oklab, var(--beam) 24%, transparent) 0%, color-mix(in oklab, var(--rim) 10%, transparent) 45%, transparent 70%)",
                }}
              />
              <LivePortrait priority className="absolute inset-0" />
            </div>
          </motion.div>

          {/* Words */}
          <div className="relative z-10 order-2 flex flex-col justify-center pb-10 lg:order-1 lg:pb-[6svh]">
            <AnimatePresence mode="wait">
              {facet ? (
                <motion.div key={facet.verb} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }}>
                  <motion.p
                    initial={{ opacity: 0, letterSpacing: "0.5em" }}
                    animate={{ opacity: 1, letterSpacing: "0.22em" }}
                    transition={{ duration: 1, ease: EASE }}
                    className="eyebrow"
                  >
                    {facet.title}
                  </motion.p>
                  <h2 className="display mt-4 text-[clamp(3.6rem,9vw,8.5rem)] text-ink">
                    <span className="block overflow-hidden pb-[0.08em]">
                      <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, ease: EASE }}>
                        I <em className="text-ink-2">{facet.verb.toLowerCase()}</em>.
                      </motion.span>
                    </span>
                  </h2>
                  <motion.p
                    initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                    className="lede mt-5 max-w-[500px]"
                  >
                    {facet.body}
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} className="mt-7">
                    <Link href={facet.href} className="btn btn-ghost">
                      {facet.cta} →
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="intro" exit={{ opacity: 0, y: -20, filter: "blur(8px)", transition: { duration: 0.4 } }}>
                  <h1 className="display text-[clamp(3.8rem,9vw,9rem)] text-ink">
                    <span className="block overflow-hidden pb-[0.04em]">
                      <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.4, ease: EASE, delay: 0.35 }}>
                        Sibi
                      </motion.span>
                    </span>
                    <span className="block overflow-hidden pb-[0.1em]">
                      <motion.span
                        className="block italic text-ink-2"
                        initial={{ y: "105%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 1.4, ease: EASE, delay: 0.47 }}
                      >
                        Kabilan
                      </motion.span>
                    </span>
                  </h1>
                  <motion.p
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.85 }}
                    className="display mt-5 max-w-[540px] text-[clamp(1.45rem,2.3vw,2.1rem)] leading-[1.14] text-ink"
                  >
                    {settings.heroHeadline}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: EASE, delay: 1 }}
                    className="lede mt-4 max-w-[520px] text-[1rem]"
                  >
                    {settings.heroSub}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Where you are in the opening; no labels needed. */}
        <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {Array.from({ length: steps }).map((_, i) => (
            <i key={i} className={`block h-px transition-all duration-700 ${i === step ? "w-10 bg-[var(--key)]" : "w-4 bg-white/20"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import type { Settings } from "@/lib/cms/types";
import { FACETS } from "@/lib/site";
import { sceneStore } from "@/lib/stores";
import { useStepScroll } from "@/lib/useStepScroll";
import { LivePortrait } from "./LivePortrait";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Timing for a CSS entrance (.enter-rise / .enter-line in globals.css). */
const enter = (delay: number, duration: number, from: { y?: string; blur?: string } = {}) =>
  ({
    "--enter-delay": `${delay}s`,
    "--enter-dur": `${duration}s`,
    ...(from.y ? { "--enter-y": from.y } : {}),
    ...(from.blur ? { "--enter-blur": from.blur } : {}),
  }) as CSSProperties;

/**
 * The opening. The portrait stays put while scrolling rewrites the words
 * beside it (who I am, then build, engineer, write) and the halo behind
 * him changes crown with each line.
 */
export function Hero({ settings }: { settings: Settings }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  // The scroll cue shows after a moment of stillness and hides the moment anyone scrolls.
  const [cue, setCue] = useState(false);
  useEffect(() => {
    let idle = window.setTimeout(() => setCue(true), 2400);
    const onScroll = () => {
      setCue(false);
      window.clearTimeout(idle);
      // Only come back while the hero still fills the screen (including its last step).
      const bottom = ref.current?.getBoundingClientRect().bottom ?? 0;
      if (bottom > window.innerHeight * 0.95) idle = window.setTimeout(() => setCue(true), 4200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const steps = 1 + FACETS.length;

  useStepScroll(ref, steps);

  // As the hero leaves, the halo breaks up and drifts down into the prologue's smoke.
  const { scrollYProgress: leaving } = useScroll({ target: ref, offset: ["end end", "end start"] });
  useMotionValueEvent(leaving, "change", (p) => {
    sceneStore.set({ disperse: Math.min(1, Math.max(0, p)) });
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setStep(Math.min(steps - 1, Math.max(0, Math.round(p * (steps - 1)))));
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
      {Array.from({ length: steps }).map((_, i) => (
        <i key={i} aria-hidden className="snap-point pointer-events-none absolute left-0 h-px w-px" style={{ top: `${i * 85}svh` }} />
      ))}
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
          {/* Portrait. Its entrance runs in CSS from the first paint, so the largest
              thing on the page never waits for JavaScript (see .enter-rise). */}
          <div
            className="enter-rise relative order-1 lg:order-2"
            // Starts part-visible so the portrait counts as painted at once; the blur still does the reveal.
            style={{ ...enter(0.25, 1.8, { y: "30px", blur: "12px" }), "--enter-opacity": "0.35" } as CSSProperties}
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
          </div>

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
                  {/* The opening lines enter in CSS too: same curve, timing and order. */}
                  <h1 className="display text-[clamp(3.8rem,9vw,9rem)] text-ink">
                    <span className="block overflow-hidden pb-[0.04em]">
                      <span className="enter-line block" style={enter(0.35, 1.4)}>
                        Sibi
                      </span>
                    </span>
                    <span className="block overflow-hidden pb-[0.1em]">
                      <span className="enter-line block italic text-ink-2" style={enter(0.47, 1.4)}>
                        Kabilan
                      </span>
                    </span>
                  </h1>
                  <p
                    className="enter-rise display mt-5 max-w-[540px] text-[clamp(1.45rem,2.3vw,2.1rem)] leading-[1.14] text-ink"
                    style={enter(0.85, 1.2, { y: "18px" })}
                  >
                    {settings.heroHeadline}
                  </p>
                  <p className="enter-rise lede mt-4 max-w-[520px] text-[1rem]" style={enter(1, 1.2, { y: "18px", blur: "0px" })}>
                    {settings.heroSub}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* A quiet nudge for anyone who hasn't scrolled yet. */}
        <AnimatePresence>
          {cue && (
            <motion.div
              key="cue"
              aria-hidden
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.35 } }}
              transition={{ duration: 0.9, ease: EASE }}
              className="pointer-events-none absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-16"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-ink-2">
                {step === steps - 1 ? "Keep scrolling" : "Scroll"}
              </span>
              <span className="relative block h-11 w-px overflow-hidden bg-white/15">
                <motion.i
                  className="absolute left-0 top-0 block h-4 w-px bg-[var(--key)] shadow-[0_0_8px_var(--key)]"
                  animate={{ y: [-16, 44] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
                />
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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

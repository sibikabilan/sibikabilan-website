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
 * beside it (who I am, then build, engineer, write), and what stands behind
 * him changes with each line, drawn in light by the particle field: his own
 * shadow, a third larger than him; the same shadow with a hammer on its
 * shoulder, then with headphones; and last an open book (see scene/targets).
 */
export function Hero({ settings }: { settings: Settings }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  const steps = 1 + FACETS.length;

  useStepScroll(ref, steps);

  // As the hero leaves, the halo breaks up and drifts down into the prologue's smoke.
  const { scrollYProgress: leaving } = useScroll({ target: ref, offset: ["end end", "end start"] });
  useMotionValueEvent(leaving, "change", (p) => {
    sceneStore.set({ disperse: Math.min(1, Math.max(0, p)) });
  });
  // Coming back to the page starts from wherever it opens, not from the last visit's dust.
  useEffect(() => {
    sceneStore.set({ disperse: Math.min(1, Math.max(0, leaving.get())) });
  }, [leaving]);

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
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 50% at 72% 42%, color-mix(in oklab, var(--beam) 10%, transparent), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid h-full max-w-[1400px] grid-rows-[52svh_minmax(0,1fr)] px-5 pt-[var(--nav-h)] md:px-10 lg:grid-cols-[1fr_1fr] lg:grid-rows-1">
          {/* Portrait. Its entrance runs in CSS from the first paint, so the largest
              thing on the page never waits for JavaScript (see .enter-rise). */}
          <div
            className="enter-rise relative order-1 lg:order-2"
            // Starts part-visible so the portrait counts as painted at once; the blur still does the reveal.
            style={{ ...enter(0.25, 1.8, { y: "30px", blur: "12px" }), "--enter-opacity": "0.35" } as CSSProperties}
          >
            {/* He is the picture: as tall as the frame allows, standing at its bottom, with just enough
                room above for the shadow's head to clear the nav. On phones the words below may run
                over his chest, where the portrait has already faded into the page.
                The dust is cut out of his shape here (data-scene-occluder), so it never comes in front of him. */}
            <div data-scene-occluder className="absolute bottom-0 left-1/2 aspect-square h-[min(46svh,92vw)] -translate-x-1/2 lg:h-[min(76svh,46vw,700px)]">
              {/* The shadow's frame, standing on the same floor: 1.6 of his widths across and 1.3 high,
                  the size of the masks in /media/shadows (see scripts/build-shadows.mjs). The
                  particle field draws the shape into it (data-scene-anchor). */}
              <div data-scene-anchor aria-hidden className="absolute bottom-0 left-1/2 aspect-[480/390] w-[160%] -translate-x-1/2">
                {/* The light the shadow stands in. */}
                <div
                  className="absolute left-1/2 top-[50%] h-[85%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                  style={{
                    background:
                      "radial-gradient(closest-side, color-mix(in oklab, var(--beam) 16%, transparent), color-mix(in oklab, var(--rim) 6%, transparent) 55%, transparent)",
                  }}
                />
              </div>
              {/* Backlight on his head and shoulders. */}
              <div
                aria-hidden
                className="absolute left-1/2 top-[34%] h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in oklab, var(--beam) 18%, transparent) 0%, color-mix(in oklab, var(--rim) 8%, transparent) 45%, transparent 70%)",
                }}
              />
              {/* Reaches a little above the square, so the rim light over his hair fades out instead of
                  being cut off flat by the box's top edge. The picture itself still sits in the square. */}
              <LivePortrait priority className="absolute inset-x-0 bottom-0 top-[-14%]" />
            </div>
          </div>

          {/* Words */}
          {/* On phones the words sit at the bottom of the screen and, if they need the room, rise over
              the faded foot of the portrait rather than pushing it smaller. */}
          <div className="relative z-10 order-2 flex min-h-0 flex-col justify-end pb-12 lg:order-1 lg:justify-center lg:pb-[6svh]">
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
                  <h2 className="display mt-3 text-[2.9rem] text-ink sm:mt-4 sm:text-[clamp(3.6rem,9vw,8.5rem)]">
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
                    className="lede mt-3 max-w-[500px] max-sm:!text-[14.5px] max-sm:!leading-[1.55] sm:mt-5"
                  >
                    {facet.body}
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} className="mt-5 sm:mt-7">
                    <Link href={facet.href} className="btn btn-ghost">
                      {facet.cta} →
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="intro" exit={{ opacity: 0, y: -20, filter: "blur(8px)", transition: { duration: 0.4 } }}>
                  {/* The opening lines enter in CSS too: same curve, timing and order. */}
                  <h1 className="display text-[3.3rem] text-ink sm:text-[clamp(3.8rem,9vw,9rem)]">
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

        {/* Where you are in the opening; no labels needed. */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-7">
          {Array.from({ length: steps }).map((_, i) => (
            <i key={i} className={`block h-px transition-all duration-700 ${i === step ? "w-10 bg-[var(--key)]" : "w-4 bg-white/20"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

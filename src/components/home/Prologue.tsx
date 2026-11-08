"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { PROLOGUE } from "@/lib/site";
import { sceneStore } from "@/lib/stores";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The prologue. The frame is see-through: behind it the network of light
 * re-forms on every line (a scatter, a wall of screens, a form, a team, one
 * person at the center, lines of text), while scrolling plays the subtitles.
 */
export function Prologue() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [index, setIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setIndex(Math.min(PROLOGUE.length - 1, Math.max(0, Math.floor(p * PROLOGUE.length * 1.02))));
  });

  useEffect(() => {
    sceneStore.set({ beat: index });
  }, [index]);

  const bars = useTransform(scrollYProgress, [0, 0.06, 0.94, 1], ["0vh", "10vh", "10vh", "0vh"]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const current = PROLOGUE[index];
  const last = index === PROLOGUE.length - 1;
  const words = current.line.split(" ");

  return (
    <section
      id="prologue"
      ref={ref}
      className="relative h-[620vh]"
      data-scene="network"
      data-scene-mode="prologue"
      data-scene-side="0"
      data-scene-opacity="1"
      aria-label="Prologue"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "radial-gradient(70% 60% at 50% 50%, transparent 40%, color-mix(in oklab, var(--bg) 85%, transparent) 100%)" }}
        />

        {/* letterbox */}
        <motion.div className="absolute inset-x-0 top-0 z-10 bg-black" style={{ height: bars }} />
        <motion.div className="absolute inset-x-0 bottom-0 z-10 bg-black" style={{ height: bars }} />

        {/* giant scene numeral */}
        <AnimatePresence mode="wait">
          <motion.span
            key={`n-${index}`}
            aria-hidden
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 1, ease: EASE }}
            className="display pointer-events-none absolute left-[4vw] top-1/2 z-0 -translate-y-1/2 text-[34vw] leading-none text-white/[0.035] md:text-[24vw]"
          >
            {String(index).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>

        <div className="absolute inset-x-5 top-[13vh] z-20 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/50 md:inset-x-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={current.note}
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.28em" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {current.note}
            </motion.span>
          </AnimatePresence>
          <span className="flex items-center gap-3 tabular-nums">
            {PROLOGUE.map((_, i) => (
              <i
                key={i}
                className={`block h-px transition-all duration-700 ${i === index ? "w-8 bg-white/80" : i < index ? "w-3 bg-white/40" : "w-3 bg-white/15"}`}
              />
            ))}
          </span>
        </div>

        {/* subtitles, word by word */}
        <div className="absolute inset-x-0 bottom-[16vh] z-20 flex justify-center px-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              className={`display max-w-[20ch] text-center text-[clamp(2.2rem,5.2vw,5rem)] leading-[1.04] text-white md:max-w-[24ch] ${last ? "glow-text" : ""}`}
              exit={{ opacity: 0, y: -14, filter: "blur(10px)", transition: { duration: 0.45 } }}
            >
              {words.map((w, i) => {
                const italic = last && i >= words.length - 5;
                return (
                  <motion.span
                    key={`${w}-${i}`}
                    className={`inline-block ${italic ? "italic text-white/70" : ""}`}
                    initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.08 + i * 0.055 }}
                  >
                    {w}
                    {i < words.length - 1 ? " " : ""}
                  </motion.span>
                );
              })}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-5 bottom-[12.5vh] z-20 h-px bg-white/10 md:inset-x-10">
          <motion.div className="h-px bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.6)]" style={{ width: progress }} />
        </div>
      </div>
      <ol className="sr-only">
        {PROLOGUE.map((m) => (
          <li key={m.line}>{m.line}</li>
        ))}
      </ol>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { PROLOGUE } from "@/lib/site";
import { CinematicVideo } from "@/components/ui/CinematicVideo";

/**
 * A letterboxed interlude. The frame stays pinned while scrolling advances
 * the subtitles, like scrubbing through a scene.
 */
export function Prologue() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [index, setIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setIndex(Math.min(PROLOGUE.length - 1, Math.max(0, Math.floor(p * PROLOGUE.length * 1.02))));
  });

  const bars = useTransform(scrollYProgress, [0, 0.08], ["0vh", "11vh"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const dim = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.2, 0.5, 0.5, 0.25]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const current = PROLOGUE[index];
  const last = index === PROLOGUE.length - 1;

  return (
    <section
      id="prologue"
      ref={ref}
      className="relative h-[520vh]"
      data-scene="threads"
      data-scene-side="0"
      data-scene-opacity="0"
      aria-label="Prologue"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        <motion.div className="grade absolute inset-0" style={{ scale }}>
          <CinematicVideo src="/media/threads.mp4" poster="/media/threads-poster.webp" />
        </motion.div>
        <motion.div className="absolute inset-0 bg-black" style={{ opacity: dim }} />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_50%,transparent,rgba(0,0,0,0.7))]" />

        <motion.div className="absolute inset-x-0 top-0 z-10 bg-black" style={{ height: bars }} />
        <motion.div className="absolute inset-x-0 bottom-0 z-10 bg-black" style={{ height: bars }} />

        <div className="absolute inset-x-5 top-[13vh] z-20 flex justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/50 md:inset-x-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={current.note}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.5 }}
            >
              {current.note}
            </motion.span>
          </AnimatePresence>
          <span className="tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(PROLOGUE.length).padStart(2, "0")}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-[17vh] z-20 flex justify-center px-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`display max-w-[20ch] text-center text-[clamp(2.1rem,5vw,4.8rem)] leading-[1.04] text-white md:max-w-[24ch] ${last ? "glow-text" : ""}`}
            >
              {last ? (
                <>
                  Some of their stories I tell in code. <em className="text-white/70">The rest, I write down.</em>
                </>
              ) : (
                current.line
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-5 bottom-[13vh] z-20 h-px bg-white/10 md:inset-x-10">
          <motion.div className="h-px bg-white/80" style={{ width: progress }} />
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

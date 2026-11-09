"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { PROLOGUE } from "@/lib/site";
import { useNearViewport } from "@/lib/useNearViewport";
import { useStepScroll } from "@/lib/useStepScroll";
import { sceneStore } from "@/lib/stores";

// three.js and the smoke shader load only as the prologue approaches, not with the page.
const ReadingLight = dynamic(() => import("./ReadingLight").then((m) => m.ReadingLight), { ssr: false });

/** Words that carry the idea, set in italic. */
const EMPHASIS = new Set(["someone", "operator", "customer", "team", "person"]);

/** How long the page has to sit still on the prologue before a quiet "scroll" appears. */
const IDLE_MS = 7000;

/** The lines arrive in pairs: one pair per step. */
const PER_STEP = 2;
/** Section height in svh: the frame pins for the last 160svh, one step every 80svh. */
const HEIGHT = 260;
/**
 * Progress runs from the section's top entering the screen to its bottom
 * reaching the bottom edge. Pair k is fully lit by the time step k is
 * reached; the first pair lights as the section rises into view.
 */
const STOPS = [100 / HEIGHT, 180 / HEIGHT, 1];
const WINDOWS = STOPS.map((stop, k) => [k === 0 ? 0.1 : STOPS[k - 1] + 0.03, stop - (k === STOPS.length - 1 ? 0.015 : 0.02)]);

function Word({
  text,
  from,
  to,
  progress,
  italic,
}: {
  text: string;
  from: number;
  to: number;
  progress: MotionValue<number>;
  italic: boolean;
}) {
  const opacity = useTransform(progress, (p) => 0.16 + 0.84 * Math.min(1, Math.max(0, (p - from) / (to - from))));
  return (
    <motion.span style={{ opacity }} className={italic ? "italic text-ink-2" : undefined}>
      {text}{" "}
    </motion.span>
  );
}

/**
 * The prologue: one paragraph, read two lines at a time. Each scroll (or
 * swipe) lights the next pair, word by word; a soft lamp follows the word
 * being read, and the room warms from night to lamplight by the last line.
 */
export function Prologue() {
  const ref = useRef<HTMLElement>(null);
  const near = useNearViewport(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  useStepScroll(ref, STOPS.length);

  // The hero's dust is this room's smoke: it stays on while the prologue is in view and
  // thins away as the prologue leaves (see ParticleScene).
  const { scrollYProgress: leaving } = useScroll({ target: ref, offset: ["end end", "end start"] });
  useMotionValueEvent(leaving, "change", (p) => sceneStore.set({ field: 1 - Math.min(1, Math.max(0, p)) }));
  useEffect(() => {
    sceneStore.set({ field: 1 - Math.min(1, Math.max(0, leaving.get())) });
    return () => sceneStore.set({ field: 0 });
  }, [leaving]);
  // A function transform keeps the word fades on this section's progress. Motion would
  // otherwise hand opacity to a native scroll timeline measured over the whole page.
  const progress = useTransform(scrollYProgress, (v) => v);

  const words = useMemo(() => {
    const out: { text: string; italic: boolean; from: number; to: number }[] = [];
    for (let k = 0; k < STOPS.length; k++) {
      const lines = PROLOGUE.slice(k * PER_STEP, (k + 1) * PER_STEP);
      const group = lines.flatMap((p, j) => {
        const last = k * PER_STEP + j === PROLOGUE.length - 1;
        return p.line.split(" ").map((w) => ({ w, last }));
      });
      const [a, b] = WINDOWS[k];
      group.forEach(({ w, last }, j) => {
        const bare = w.toLowerCase().replace(/[^a-z']/g, "");
        const from = a + (b - a) * 0.8 * (j / group.length);
        out.push({ text: w, italic: last || EMPHASIS.has(bare), from, to: from + (b - a) * 0.2 });
      });
    }
    return out;
  }, []);

  // Only for someone who has stopped here a good while: a small cue below the words.
  const [cue, setCue] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const pinned = () => {
      const r = el.getBoundingClientRect();
      return r.top <= 2 && r.bottom >= window.innerHeight - 2;
    };
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCue(pinned()), IDLE_MS);
    };
    const wake = () => {
      setCue(false);
      arm();
    };
    const events = ["scroll", "wheel", "touchstart", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, wake));
    };
  }, []);

  // Where the reader's eye is: the word being lit right now, in viewport fractions.
  const text = useRef<HTMLParagraphElement>(null);
  const lamp = useRef({ x: 0.5, y: 0.45 });
  useMotionValueEvent(progress, "change", (p) => {
    const el = text.current;
    if (!el) return;
    let i = 0;
    while (i < words.length - 1 && words[i + 1].from <= p) i++;
    const w = el.children[i] as HTMLElement | undefined;
    if (!w) return;
    const r = w.getBoundingClientRect();
    lamp.current = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
    sceneStore.set({ lamp: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, warmth: Math.min(1, Math.max(0, p)) });
  });

  return (
    <section
      id="prologue"
      data-spotlight="off"
      ref={ref}
      className="relative"
      style={{ height: `${HEIGHT}svh` }}
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0"
      aria-label="Prologue"
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-6 md:px-10">
        {near && <ReadingLight progress={progress} lamp={lamp} />}

        <div className="relative z-10 mx-auto w-full max-w-[1080px]">
          <p
            ref={text}
            aria-hidden
            className="display text-center text-[clamp(1.9rem,3.6vw,3.4rem)] leading-[1.16] tracking-[-0.01em] text-ink [text-shadow:0_2px_30px_rgba(0,0,0,0.6)]"
          >
            {words.map((w, i) => (
              <Word key={i} text={w.text} from={w.from} to={w.to} progress={progress} italic={w.italic} />
            ))}
          </p>
        </div>

        <AnimatePresence>
          {cue && (
            <motion.div
              key="cue"
              aria-hidden
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.35 } }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute bottom-[6svh] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-ink-2">Scroll</span>
              <span className="relative block h-10 w-px overflow-hidden bg-white/15">
                <motion.i
                  className="absolute left-0 top-0 block h-4 w-px bg-[var(--key)] shadow-[0_0_8px_var(--key)]"
                  animate={{ y: [-16, 40] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
                />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="sr-only">
        {PROLOGUE.map((m) => (
          <p key={m.line}>{m.line}</p>
        ))}
      </div>
    </section>
  );
}

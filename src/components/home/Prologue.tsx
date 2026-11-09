"use client";

import { useMemo, useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { PROLOGUE } from "@/lib/site";
import { useNearViewport } from "@/lib/useNearViewport";

// three.js and the smoke shader load only as the prologue approaches, not with the page.
const ReadingLight = dynamic(() => import("./ReadingLight").then((m) => m.ReadingLight), { ssr: false });

/** Words that carry the idea, set in italic. */
const EMPHASIS = new Set(["someone", "operator", "customer", "team", "person"]);

/** Scroll progress over which the words light up, first to last. */
const START = 0.06;
const END = 0.86;

function Word({
  text,
  i,
  total,
  progress,
  italic,
}: {
  text: string;
  i: number;
  total: number;
  progress: MotionValue<number>;
  italic: boolean;
}) {
  const span = (END - START) / total;
  const from = START + i * span;
  const opacity = useTransform(progress, [from - span * 2, from + span * 3], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className={italic ? "italic text-ink-2" : undefined}>
      {text}{" "}
    </motion.span>
  );
}

/**
 * The prologue: one paragraph, read at the pace you scroll. Words light up
 * in order, a soft lamp follows the word being read, and the room warms
 * from night to lamplight by the last line.
 */
export function Prologue() {
  const ref = useRef<HTMLElement>(null);
  const near = useNearViewport(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // A function transform keeps the word fades on this section's progress. Motion would
  // otherwise hand opacity to a native scroll timeline measured over the whole page.
  const progress = useTransform(scrollYProgress, (v) => v);

  const words = useMemo(() => {
    const out: { text: string; sentence: number; italic: boolean }[] = [];
    PROLOGUE.forEach((p, s) => {
      const last = s === PROLOGUE.length - 1;
      p.line.split(" ").forEach((w) => {
        const bare = w.toLowerCase().replace(/[^a-z']/g, "");
        out.push({ text: w, sentence: s, italic: last || EMPHASIS.has(bare) });
      });
    });
    return out;
  }, []);

  // Where the reader's eye is: the word being lit right now, in viewport fractions.
  const text = useRef<HTMLParagraphElement>(null);
  const lamp = useRef({ x: 0.5, y: 0.45 });
  useMotionValueEvent(progress, "change", (p) => {
    const el = text.current;
    if (!el) return;
    const i = Math.min(words.length - 1, Math.max(0, Math.floor(((p - START) / (END - START)) * words.length)));
    const w = el.children[i] as HTMLElement | undefined;
    if (!w) return;
    const r = w.getBoundingClientRect();
    lamp.current = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
  });

  return (
    <section
      id="prologue"
      data-spotlight="off"
      ref={ref}
      className="relative h-[440vh]"
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
              <Word key={i} text={w.text} i={i} total={words.length} progress={progress} italic={w.italic} />
            ))}
          </p>
        </div>
      </div>
      <div className="sr-only">
        {PROLOGUE.map((m) => (
          <p key={m.line}>{m.line}</p>
        ))}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { REEL, type ReelFrame } from "@/lib/site";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";

function Frame({ frame, i, progress }: { frame: ReelFrame; i: number; progress: MotionValue<number> }) {
  // Each frame drifts slightly against the strip for parallax.
  const x = useTransform(progress, [0, 1], [`${-6 + i * 2}%`, `${6 - i * 2}%`]);
  return (
    <article className="relative w-[78vw] shrink-0 md:w-[62vw] lg:w-[54vw]">
      <div className="sprockets h-3 w-full opacity-70" />
      <div className="grade relative mt-2 aspect-[16/9] overflow-hidden rounded-[4px] bg-black">
        <motion.div className="absolute inset-[-8%]" style={{ x }}>
          <Image src={frame.image} alt={frame.alt} fill sizes="(min-width: 1024px) 54vw, 78vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
          Reel {String(i + 1).padStart(2, "0")} · {frame.years}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <p className="display text-[clamp(1.9rem,3.4vw,3.4rem)] leading-none text-white">{frame.role}</p>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/60">{frame.place}</p>
        </div>
      </div>
      <div className="sprockets mt-2 h-3 w-full opacity-70" />
      <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_1fr] md:gap-8">
        <p className="text-[15px] leading-relaxed text-ink-2">{frame.story}</p>
        <p className="display text-2xl italic leading-snug text-ink">“{frame.lesson}”</p>
      </div>
    </article>
  );
}

export function Reel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.04, 0.96], ["0%", "-69%"]);
  const counter = useTransform(scrollYProgress, (p) => String(Math.min(REEL.length, Math.floor(p * REEL.length) + 1)).padStart(2, "0"));

  return (
    <section
      id="story"
      ref={ref}
      className="relative md:h-[460vh]"
      data-scene="ribbon"
      data-scene-side="0"
      data-scene-opacity="0.3"
    >
      {/* Desktop: a pinned film strip that runs sideways. */}
      <div className="sticky top-0 hidden h-[100svh] flex-col justify-center overflow-hidden md:flex">
        <div className="mx-auto mb-10 flex w-full max-w-[1400px] items-end justify-between px-10">
          <div>
            <p className="eyebrow">The story so far</p>
            <h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.6rem)] text-ink">
              <TitleReveal text="The long way here." italicWords={["long"]} />
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            Reel <motion.span className="text-[color:var(--key)]">{counter}</motion.span> / {String(REEL.length).padStart(2, "0")}
          </p>
        </div>
        <motion.div className="flex w-max gap-[6vw] pl-10 will-change-transform" style={{ x }}>
          {REEL.map((f, i) => (
            <Frame key={f.years} frame={f} i={i} progress={scrollYProgress} />
          ))}
          <div className="w-[20vw] shrink-0" />
        </motion.div>
      </div>

      {/* Mobile: the same reel, stacked. */}
      <div className="px-5 py-24 md:hidden">
        <p className="eyebrow">The story so far</p>
        <h2 className="display mt-4 text-5xl text-ink">
          The <em className="keyed">long</em> way here.
        </h2>
        <div className="mt-12 space-y-16">
          {REEL.map((f, i) => (
            <Reveal key={f.years}>
              <div className="grade relative aspect-[16/9] overflow-hidden rounded-[4px]">
                <Image src={f.image} alt={f.alt} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <div className="absolute left-3 top-3 font-mono text-[9.5px] uppercase tracking-[0.3em] text-white/60">
                  Reel {String(i + 1).padStart(2, "0")} · {f.years}
                </div>
                <p className="display absolute bottom-3 left-4 text-3xl text-white">{f.role}</p>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{f.place}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{f.story}</p>
              <p className="display mt-4 text-2xl italic text-ink">“{f.lesson}”</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

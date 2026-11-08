"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { REEL, type ReelCredit, type ReelFrame, type ReelLogo } from "@/lib/site";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { cx } from "@/lib/utils";

/**
 * Optical heights per mark, for large ("lg") and supporting ("md") credits.
 * Each file has different proportions, so one height does not fit all.
 */
const HEIGHTS: Record<string, { lg: string; md: string }> = {
  "/logos/oregon-state.svg": { lg: "h-16 xl:h-[4.5rem]", md: "h-10" },
  "/logos/odot.svg": { lg: "h-14", md: "h-8" },
  "/logos/usda.svg": { lg: "h-14", md: "h-7" },
  "/logos/hp.svg": { lg: "h-14", md: "h-8" },
  "/logos/samsung.svg": { lg: "h-20 md:h-24 -my-5", md: "h-14 -my-3" },
  "/logos/apple.svg": { lg: "h-9 md:h-10", md: "h-7" },
  "/logos/supragent.webp": { lg: "h-24 md:h-28", md: "h-14" },
};

function CreditLogo({ logo, size }: { logo: ReelLogo; size: "lg" | "md" }) {
  if (logo.wordmark) {
    return (
      <span
        className={cx(
          "display italic leading-none text-white",
          size === "lg" ? "text-[clamp(2.2rem,3.4vw,3.4rem)]" : "max-w-[11ch] text-[1.2rem] leading-[1.05]"
        )}
      >
        {logo.label}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-3" title={logo.label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.suffix ? "" : logo.label}
        className={cx(
          "w-auto",
          HEIGHTS[logo.src ?? ""]?.[size] ?? (size === "lg" ? "h-14" : "h-9"),
          !logo.color && "[filter:brightness(0)_invert(1)]"
        )}
      />
      {logo.suffix && (
        <span className={cx("font-medium tracking-tight text-white", size === "lg" ? "text-[clamp(1.6rem,2.4vw,2.4rem)]" : "text-lg")}>
          {logo.suffix}
        </span>
      )}
    </span>
  );
}

function Credits({ credits }: { credits: ReelCredit[] }) {
  return (
    <div className="space-y-5">
      {credits.map((c) => (
        <div key={c.label}>
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/45">{c.label}</p>
          <div className={cx("mt-3 flex flex-wrap items-center", c.size === "lg" ? "gap-x-10 gap-y-4" : "gap-x-7 gap-y-3")}>
            {c.logos.map((l) => (
              <CreditLogo key={l.label} logo={l} size={c.size} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A system diagram that draws itself. */
function Blueprint() {
  const nodes = [
    { x: 70, y: 90, label: "ingest" },
    { x: 250, y: 55, label: "features" },
    { x: 250, y: 165, label: "models" },
    { x: 440, y: 110, label: "serve" },
    { x: 620, y: 55, label: "clients" },
    { x: 620, y: 170, label: "monitor" },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [5, 2],
  ];
  const path = (a: number, b: number) => {
    const A = nodes[a];
    const B = nodes[b];
    if (B.x < A.x) return `M${A.x} ${A.y + 16} C ${A.x} ${A.y + 60}, ${B.x} ${B.y + 60}, ${B.x} ${B.y + 16}`;
    const sx = A.x + 44;
    const ex = B.x - 44;
    const mx = (sx + ex) / 2;
    return `M${sx} ${A.y} C ${mx} ${A.y}, ${mx} ${B.y}, ${ex} ${B.y}`;
  };
  return (
    <svg viewBox="0 0 700 250" className="absolute inset-x-[6%] top-[16%] w-[88%] text-white" aria-hidden>
      {edges.map(([a, b], i) => (
        <motion.path
          key={`${a}-${b}`}
          d={path(a, b)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.6}
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.3 + i * 0.18, ease: "easeInOut" }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.g key={n.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: i * 0.12 }}>
          <rect x={n.x - 44} y={n.y - 16} width={88} height={32} rx={6} fill="rgba(0,0,0,0.55)" stroke="currentColor" strokeOpacity={0.75} />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontSize={10.5}
            fill="currentColor"
            fillOpacity={0.9}
            style={{ fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "0.12em" }}
          >
            {n.label.toUpperCase()}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

function Still({ frame, sizes }: { frame: ReelFrame; sizes: string }) {
  return (
    <>
      <Image src={frame.image} alt={frame.alt} fill sizes={sizes} className={cx("object-cover", frame.overlay && "opacity-40")} />
      {frame.overlay === "blueprint" && <Blueprint />}
    </>
  );
}

/** One reel: a frame of film on the left, its title card on the right. */
function Frame({ frame, i, progress }: { frame: ReelFrame; i: number; progress: MotionValue<number> }) {
  const x = useTransform(progress, [0, 1], [`${-5 + i * 2}%`, `${5 - i * 2}%`]);
  return (
    <article className="relative grid h-[72svh] max-h-[760px] w-[84vw] shrink-0 grid-cols-[1.2fr_1fr] overflow-hidden rounded-[6px] border border-line bg-[var(--bg-2)] xl:w-[76vw]">
      <div className="relative">
        <div className="sprockets absolute inset-x-0 top-2 z-10 h-3 opacity-60" />
        <div className="grade absolute inset-0 overflow-hidden">
          <motion.div className="absolute inset-[-7%]" style={{ x }}>
            <Still frame={frame} sizes="45vw" />
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--bg-2)]" />
        <div className="sprockets absolute inset-x-0 bottom-2 z-10 h-3 opacity-60" />
        <p className="absolute bottom-8 left-6 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
          Reel {String(i + 1).padStart(2, "0")} · {frame.years}
        </p>
      </div>
      <div className="flex flex-col justify-between gap-6 p-7 xl:p-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">{frame.place}</p>
          <h3 className="display mt-3 text-[clamp(2rem,3vw,3.2rem)] leading-[1] text-ink">{frame.title}</h3>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{frame.body}</p>
        </div>
        <Credits credits={frame.credits} />
        <p className="display text-lg italic leading-snug text-ink-2">“{frame.line}”</p>
      </div>
    </article>
  );
}

export function Reel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "-76.5%"]);
  const counter = useTransform(scrollYProgress, (p) => String(Math.min(REEL.length, Math.floor(p * REEL.length) + 1)).padStart(2, "0"));

  return (
    <section id="story" ref={ref} className="relative md:h-[520vh]" data-scene="network" data-scene-side="0" data-scene-opacity="0">
      <div className="sticky top-0 hidden h-[100svh] flex-col justify-center overflow-hidden pt-[var(--nav-h)] md:flex">
        <div className="mx-auto mb-6 flex w-full max-w-[1400px] items-end justify-between px-10">
          <h2 className="display text-[clamp(2.4rem,4.2vw,4rem)] text-ink">
            <TitleReveal text="The long way here." italicWords={["long"]} />
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            Reel <motion.span className="text-ink">{counter}</motion.span> / {String(REEL.length).padStart(2, "0")}
          </p>
        </div>
        <motion.div className="flex w-max gap-[4vw] pl-10 will-change-transform" style={{ x }}>
          {REEL.map((f, i) => (
            <Frame key={f.years} frame={f} i={i} progress={scrollYProgress} />
          ))}
          <div className="w-[8vw] shrink-0" />
        </motion.div>
      </div>

      <div className="px-5 py-24 md:hidden">
        <h2 className="display text-5xl text-ink">
          The <em className="text-ink-2">long</em> way here.
        </h2>
        <div className="mt-12 space-y-16">
          {REEL.map((f, i) => (
            <Reveal key={f.years} className="overflow-hidden rounded-[6px] border border-line bg-[var(--bg-2)]">
              <div className="grade relative aspect-[16/10] overflow-hidden bg-black">
                <Still frame={f} sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-2)] to-transparent" />
                <p className="absolute left-4 top-4 font-mono text-[9.5px] uppercase tracking-[0.3em] text-white/60">
                  Reel {String(i + 1).padStart(2, "0")} · {f.years}
                </p>
              </div>
              <div className="space-y-6 p-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">{f.place}</p>
                  <h3 className="display mt-3 text-4xl leading-none text-ink">{f.title}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{f.body}</p>
                </div>
                <Credits credits={f.credits} />
                <p className="display text-xl italic text-ink-2">“{f.line}”</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

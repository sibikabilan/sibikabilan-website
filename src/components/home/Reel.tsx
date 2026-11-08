"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { REEL, type ReelFrame, type ReelLogo } from "@/lib/site";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { cx } from "@/lib/utils";

/** Optical sizes: each mark has different proportions inside its file. */
const LOGO_HEIGHT: Record<string, string> = {
  "/logos/samsung.svg": "h-[44px] -my-3",
  "/logos/apple.svg": "h-[19px]",
  "/logos/hp.svg": "h-[24px]",
  "/logos/oregon-state.svg": "h-[26px]",
  "/logos/odot.svg": "h-[24px]",
  "/logos/usda.svg": "h-[22px]",
  "/logos/supragent.webp": "h-[46px] -my-2",
};

function LogoPlate({ logo }: { logo: ReelLogo }) {
  if (logo.wordmark) {
    return (
      <span className="flex h-11 items-center whitespace-nowrap rounded-full border border-white/15 bg-black/30 px-4 font-display text-[17px] italic text-white/90 backdrop-blur">
        {logo.label}
      </span>
    );
  }
  const suffix = logo.label === "Care+" || logo.label === "AppleCare+";
  return (
    <span
      className="group/logo flex h-11 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-white/15 bg-black/30 px-4 backdrop-blur"
      title={logo.label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={suffix ? "" : logo.label}
        className={cx(
          "w-auto transition-opacity duration-500",
          LOGO_HEIGHT[logo.src ?? ""] ?? "h-[20px]",
          !logo.color && "opacity-85 [filter:brightness(0)_invert(1)] group-hover/logo:opacity-100"
        )}
      />
      {suffix && <span className="text-[14px] font-medium text-white/90">{logo.label}</span>}
    </span>
  );
}

/** A system diagram that draws itself, with packets moving through it. */
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
    const back = B.x < A.x;
    const sx = A.x + (back ? -44 : 44);
    const ex = B.x + (back ? 44 : -44);
    const mx = (sx + ex) / 2;
    return back
      ? `M${A.x} ${A.y + 16} C ${A.x} ${A.y + 60}, ${B.x} ${B.y + 60}, ${B.x} ${B.y + 16}`
      : `M${sx} ${A.y} C ${mx} ${A.y}, ${mx} ${B.y}, ${ex} ${B.y}`;
  };
  return (
    <svg viewBox="0 0 700 250" className="absolute inset-x-[6%] top-[12%] w-[88%] text-white" aria-hidden>
      {edges.map(([a, b], i) => (
        <g key={`${a}-${b}`}>
          <motion.path
            d={path(a, b)}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.55}
            strokeWidth={1}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: 0.3 + i * 0.18, ease: "easeInOut" }}
          />
          <circle r={2.6} fill="currentColor">
            <animateMotion dur={`${2.4 + (i % 3) * 0.7}s`} repeatCount="indefinite" path={path(a, b)} begin={`${i * 0.35}s`} />
          </circle>
        </g>
      ))}
      {nodes.map((n, i) => (
        <motion.g
          key={n.label}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: i * 0.12 }}
        >
          <rect x={n.x - 44} y={n.y - 16} width={88} height={32} rx={6} fill="rgba(0,0,0,0.5)" stroke="currentColor" strokeOpacity={0.7} />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontSize={10.5}
            fill="currentColor"
            fillOpacity={0.85}
            style={{ fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "0.12em" }}
          >
            {n.label.toUpperCase()}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

function Still({ frame }: { frame: ReelFrame }) {
  return (
    <>
      <Image
        src={frame.image}
        alt={frame.alt}
        fill
        sizes="(min-width: 1024px) 54vw, 90vw"
        className={cx("object-cover", frame.overlay && "opacity-40")}
      />
      {frame.overlay === "blueprint" && <Blueprint />}
    </>
  );
}

function Frame({ frame, i, progress }: { frame: ReelFrame; i: number; progress: MotionValue<number> }) {
  const x = useTransform(progress, [0, 1], [`${-6 + i * 2}%`, `${6 - i * 2}%`]);
  return (
    <article className="relative w-[78vw] shrink-0 md:w-[62vw] lg:w-[54vw]">
      <div className="sprockets h-3 w-full opacity-70" />
      <div className="grade relative mt-2 aspect-[16/9] overflow-hidden rounded-[4px] bg-black">
        <motion.div className="absolute inset-[-8%]" style={{ x }}>
          <Still frame={frame} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
        <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
          Reel {String(i + 1).padStart(2, "0")} · {frame.years} · {frame.place}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
          <p className="display text-[clamp(1.9rem,3.2vw,3.2rem)] leading-[1.02] text-white">{frame.title}</p>
          {frame.logos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {frame.logos.map((l) => (
                <LogoPlate key={l.label} logo={l} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="sprockets mt-2 h-3 w-full opacity-70" />
      <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_1fr] md:gap-8">
        <p className="text-[15px] leading-relaxed text-ink-2">{frame.body}</p>
        <p className="display text-2xl italic leading-snug text-ink">“{frame.line}”</p>
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
    <section id="story" ref={ref} className="relative md:h-[480vh]" data-scene="network" data-scene-side="0" data-scene-opacity="0.3">
      <div className="sticky top-0 hidden h-[100svh] flex-col justify-center overflow-hidden md:flex">
        <div className="mx-auto mb-8 flex w-full max-w-[1400px] items-end justify-between px-10">
          <div>
            <p className="eyebrow">The story so far</p>
            <h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.6rem)] text-ink">
              <TitleReveal text="The long way here." italicWords={["long"]} />
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            Reel <motion.span className="text-ink">{counter}</motion.span> / {String(REEL.length).padStart(2, "0")}
          </p>
        </div>
        <motion.div className="flex w-max gap-[6vw] pl-10 will-change-transform" style={{ x }}>
          {REEL.map((f, i) => (
            <Frame key={f.years} frame={f} i={i} progress={scrollYProgress} />
          ))}
          <div className="w-[20vw] shrink-0" />
        </motion.div>
      </div>

      <div className="px-5 py-24 md:hidden">
        <p className="eyebrow">The story so far</p>
        <h2 className="display mt-4 text-5xl text-ink">
          The <em className="text-ink-2">long</em> way here.
        </h2>
        <div className="mt-12 space-y-16">
          {REEL.map((f, i) => (
            <Reveal key={f.years}>
              <div className="grade relative aspect-[16/9] overflow-hidden rounded-[4px] bg-black">
                <Still frame={f} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <div className="absolute left-3 top-3 font-mono text-[9.5px] uppercase tracking-[0.3em] text-white/60">
                  Reel {String(i + 1).padStart(2, "0")} · {f.years}
                </div>
                <p className="display absolute bottom-3 left-4 right-4 text-3xl leading-tight text-white">{f.title}</p>
              </div>
              {f.logos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {f.logos.map((l) => (
                    <LogoPlate key={l.label} logo={l} />
                  ))}
                </div>
              )}
              <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{f.body}</p>
              <p className="display mt-4 text-2xl italic text-ink">“{f.line}”</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

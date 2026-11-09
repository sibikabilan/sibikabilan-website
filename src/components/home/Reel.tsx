"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type Lenis from "lenis";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, type Variants } from "motion/react";
import { REEL, type ReelFrame, type ReelLockup, type ReelLogo } from "@/lib/site";
import { useStepScroll } from "@/lib/useStepScroll";
import { cx } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const DESKTOP = "(min-width: 768px)";

/** Height of each mark when it's the centre of a scene; every file has its own proportions. */
const LOCKUP_H: Record<string, string> = {
  "/logos/supragent.webp": "h-[clamp(130px,26svh,300px)]",
  "/logos/kayadev.webp": "h-[clamp(38px,8vw,124px)]",
  "/logos/samsung-care-plus.webp": "h-[clamp(26px,4vw,60px)]",
  "/logos/applecare-plus.webp": "h-[clamp(30px,4.1vw,62px)]",
  "/logos/oregon-state.svg": "h-[clamp(70px,13svh,150px)]",
};
const PARTNER_H: Record<string, string> = {
  "/logos/odot.svg": "h-6 md:h-10",
  "/logos/usda.svg": "h-6 md:h-10",
  "/logos/hp.svg": "h-6 md:h-10",
};

const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
  shown: (d: number = 0) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE, delay: d } }),
};
const mark: Variants = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(14px)" },
  shown: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 1.3, ease: EASE, delay: 0.15 } },
};

function Mark({ logo, className }: { logo: ReelLogo; className?: string }) {
  if (logo.wordmark || !logo.src) {
    return (
      <span className="display max-w-[12ch] text-center text-[0.85rem] italic leading-[1.05] text-white md:text-[clamp(1rem,1.3vw,1.3rem)]">
        {logo.label}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt={logo.label}
      // The story sits several screens down; lazy keeps these out of the first load.
      loading="lazy"
      decoding="async"
      className={cx("w-auto max-w-[82vw] object-contain", className, !logo.color && "[filter:brightness(0)_invert(1)]")}
    />
  );
}

function Credit({ children }: { children: string }) {
  return <p className="font-mono text-[10.5px] uppercase tracking-[0.36em] text-white/55">{children}</p>;
}

function Lockup({ lockup }: { lockup: ReelLockup }) {
  if (lockup.kind === "statement") {
    return (
      <div className="flex flex-col items-center">
        <Credit>{lockup.credit}</Credit>
        <p className="display mt-4 max-w-full text-center text-[clamp(1.85rem,8vw,2.6rem)] leading-[1.02] text-white md:mt-5 md:text-[clamp(2.4rem,5.6vw,5.6rem)] md:leading-[0.98]">
          {lockup.lines.map((l, i) => (
            <span key={l} className={cx("block", i === 1 && "italic text-white/75")}>
              {l}
            </span>
          ))}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <Credit>{lockup.credit}</Credit>
      <div className="mt-4 flex flex-col items-center gap-5 md:mt-6 md:gap-7 lg:flex-row lg:gap-16">
        {lockup.logos.map((l) => (
          <Mark key={l.label} logo={l} className={LOCKUP_H[l.src ?? ""]} />
        ))}
      </div>
    </div>
  );
}

/** Fade to transparent, not to a colour, so a scene melts into whatever light is behind the page. */
const FADE = "linear-gradient(to bottom, transparent 0%, #000 24%, #000 62%, transparent 100%)";

/** The light behind an era: its picture, graded down so the type reads, or a lit stage where the mark is the picture. */
function Backdrop({ frame, live }: { frame: ReelFrame; live: boolean }) {
  if (!frame.image) {
    return (
      <div className="absolute inset-0" style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(38% 46% at 50% 36%, rgba(214, 48, 40, 0.2), transparent 70%), radial-gradient(70% 60% at 50% 30%, color-mix(in oklab, var(--beam) 9%, transparent), transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(60% 55% at 50% 40%, black, transparent 80%)",
          }}
        />
      </div>
    );
  }
  return (
    <div
      className="grade absolute inset-0 overflow-hidden"
      style={{
        maskImage: FADE,
        WebkitMaskImage: FADE,
      }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={live ? { scale: 1 } : { scale: 1.1 }}
        transition={{ duration: 9, ease: "easeOut" }}
      >
        <Image src={frame.image} alt={frame.alt ?? ""} fill sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_65%_at_50%_45%,transparent_0%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}

/** One era, full screen: the mark or statement centre stage, the story centred beneath it. */
function Scene({ frame }: { frame: ReelFrame }) {
  return (
    <motion.div initial="hidden" animate="shown" className="absolute inset-0 isolate overflow-hidden">
      <Backdrop frame={frame} live />
      <div className="relative z-10 mx-auto flex h-full max-w-[1100px] flex-col items-center justify-center px-5 pb-[4svh] pt-[calc(var(--nav-h)+4svh)] text-center md:px-6 md:pb-[6svh] md:pt-[calc(var(--nav-h)+5svh)]">
        <motion.div variants={mark} className="w-full">
          <Lockup lockup={frame.lockup} />
        </motion.div>

        <div className="mt-[3svh] max-w-[760px] md:mt-[5svh]">
          <motion.p variants={item} custom={0.35} className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/60 md:text-[11px] md:tracking-[0.3em]">
            {frame.years} · {frame.place}
          </motion.p>
          <motion.h3
            variants={item}
            custom={0.45}
            className="display mt-2.5 text-[1.9rem] leading-[1.04] text-white md:mt-3 md:text-[clamp(2rem,3.6vw,3.4rem)] md:leading-[1.02]"
          >
            {frame.title}
          </motion.h3>
          <motion.p
            variants={item}
            custom={0.55}
            className="mx-auto mt-3 max-w-[62ch] text-[14.5px] leading-[1.6] text-white/80 md:mt-4 md:text-[clamp(1rem,1.12vw,1.14rem)] md:leading-[1.7]"
          >
            {frame.body}
          </motion.p>
          <motion.p
            variants={item}
            custom={0.7}
            className="display mt-4 text-[1.05rem] italic text-white/70 md:mt-5 md:text-[clamp(1.1rem,1.45vw,1.4rem)] [@media(max-height:680px)]:hidden"
          >
            “{frame.line}”
          </motion.p>
        </div>

        {frame.partners && (
          <motion.div variants={item} custom={0.8} className="mt-[3svh] flex flex-col items-center md:mt-[4svh]">
            <Credit>{frame.partners.credit}</Credit>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:mt-4 md:gap-x-10 md:gap-y-4">
              {frame.partners.logos.map((l) => (
                <Mark key={l.label} logo={l} className={PARTNER_H[l.src ?? ""] ?? "h-9"} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * The long way here, newest first. The section pins and each era crossfades
 * into the next. A wheel or trackpad gesture moves exactly one era; on
 * phones each swipe settles on an era (scroll snap); the rail on the left
 * jumps straight to one.
 */
export function Reel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [index, setIndex] = useState(0);
  const n = REEL.length;

  useStepScroll(ref, n, DESKTOP);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
    setIndex((prev) => (prev === i ? prev : i));
  });

  const jump = (i: number) => {
    const el = ref.current;
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((el.offsetHeight - window.innerHeight) / (n - 1)) * i;
    if (lenis) lenis.scrollTo(y, { duration: 1.2, force: true });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const frame = REEL[index];

  return (
    <section
      id="story"
      data-spotlight="off"
      ref={ref}
      className="relative h-[500svh]"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0"
      aria-label="The long way here"
    >
      {REEL.map((f, i) => (
        <i key={f.key} aria-hidden className="snap-point pointer-events-none absolute left-0 h-px w-px" style={{ top: `${i * 100}svh` }} />
      ))}
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={frame.key}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.9, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }}
          >
            <Scene frame={frame} />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-5 top-[calc(var(--nav-h)+0.5rem)] z-20 flex items-baseline justify-between md:inset-x-10 md:top-[calc(var(--nav-h)+1.25rem)]">
          <h2 className="display text-[1.35rem] text-white md:text-[clamp(1.6rem,2.2vw,2.2rem)]">
            The <em className="text-white/70">long</em> way here.
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
            <span className="text-white">{String(index + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
          </p>
        </div>

        <nav aria-label="Eras" className="absolute left-10 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
          <ol className="space-y-5">
            {REEL.map((f, i) => (
              <li key={f.key}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={i === index ? "step" : undefined}
                  className="group flex items-center gap-3 text-left"
                >
                  <i className={cx("block h-px transition-all duration-500", i === index ? "w-8 bg-white" : "w-3 bg-white/30 group-hover:w-5")} />
                  <span
                    className={cx(
                      "font-mono text-[10.5px] uppercase tracking-[0.24em] transition-colors duration-500",
                      i === index ? "text-white" : "text-white/40 group-hover:text-white/70"
                    )}
                  >
                    {f.years.slice(0, 4)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

    </section>
  );
}

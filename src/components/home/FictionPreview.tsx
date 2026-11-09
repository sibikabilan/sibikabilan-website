"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Book } from "@/components/fiction/Book";
import { useCalm } from "@/components/fiction/useCalm";
import { introWithoutTitle } from "@/components/fiction/volume";
import { Reveal } from "@/components/ui/Reveal";

/** The book on the desk is everything at once: the collected works. */
type DeskBook = { slug: string; title: string; kind: string; cover: string | null };
const COMPENDIUM: DeskBook = { slug: "collected-works", title: "Collected Works", kind: "compendium", cover: null };

const BOOK_WIDTH = "clamp(150px, 16.5vw, 236px)";
/** Where the board and the loose leaves come to rest: a slightly lifted stack on the left. */
const COVER_END = -168;
const LEAF_ENDS = [-165, -162, -158, -153];
const DIM = "#8a8680";
const WARM = "#f6e9d4";
/** Pages in shadow; the light that rises out of them does the brightening. */
const PAPER = { "--paper": "#cbbfa6", "--paper-2": "#aa9d84" } as CSSProperties;

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Scroll-linked value that holds `from` before `a` and `to` after `b`.
 * A function transform on purpose: motion hardware-accelerates array-range
 * transforms of scroll progress (opacity) with a timeline it builds when the
 * child mounts, before this section's ref is attached, so those would follow
 * whole-page progress instead of this section's.
 */
function useSegment(p: MotionValue<number>, a: number, b: number, from: number, to: number, ease = false) {
  return useTransform(p, (v) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return from + (to - from) * (ease ? smooth(t) : t);
  });
}

/** Light rising out of an open page, with a little shade in its corners. */
function PageLight({ light, side }: { light: MotionValue<number> | number; side: "left" | "right" }) {
  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: light,
          background: `radial-gradient(95% 85% at ${side === "left" ? "80%" : "20%"} 50%, rgb(255 240 210 / 0.75), rgb(255 222 172 / 0.2) 55%, transparent 85%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 110% at 50% 45%, transparent 55%, rgb(60 40 20 / 0.28) 100%)" }}
      />
    </>
  );
}

/** The left-hand page: a title page for the book on the desk. */
function TitlePage({ book, light }: { book: DeskBook; light: MotionValue<number> | number }) {
  return (
    <>
      {/* a clean sheet, no ruled lines behind the title */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgb(40 28 14 / 0.22), transparent 10%), radial-gradient(130% 100% at 40% 30%, var(--paper), var(--paper-2))",
        }}
      />
      <PageLight light={light} side="left" />
      <motion.div
        className="absolute flex flex-col items-center justify-center text-center"
        style={{ inset: "14% 15% 16% 12%", opacity: light, color: "var(--paper-ink)" }}
      >
        <span className="font-mono uppercase" style={{ fontSize: "calc(var(--bw) * 0.036)", letterSpacing: "0.32em", opacity: 0.6 }}>
          Fiction
        </span>
        <span className="font-display italic" style={{ marginTop: "14%", fontSize: "calc(var(--bw) * 0.11)", lineHeight: 1 }}>
          {book.title}
        </span>
        <span style={{ marginTop: "10%", width: "16%", height: 1, background: "var(--paper-rule)" }} />
        <span className="font-mono uppercase" style={{ marginTop: "10%", fontSize: "calc(var(--bw) * 0.034)", letterSpacing: "0.3em", opacity: 0.7 }}>
          Sibi Kabilan
        </span>
      </motion.div>
    </>
  );
}

/** The right-hand page: the line, set like an epigraph. */
function LinePage({ text, light }: { text: string; light: MotionValue<number> | number }) {
  return (
    <>
      <PageLight light={light} side="right" />
      <motion.div
        className="absolute flex flex-col items-center justify-center text-center"
        style={{ inset: "14% 13% 16% 15%", opacity: light, color: "var(--paper-ink)" }}
      >
        <p className="font-display italic text-balance" style={{ fontSize: "calc(var(--bw) * 0.074)", lineHeight: 1.3 }}>
          {text}
        </p>
        <span aria-hidden style={{ marginTop: "12%", fontSize: "calc(var(--bw) * 0.06)", opacity: 0.55 }}>
          ❦
        </span>
      </motion.div>
    </>
  );
}

/** A few motes of dust turning slowly in the light. */
function Dust({ light }: { light: MotionValue<number> | number }) {
  const motes = [
    [18, 62, 0], [27, 40, 2.1], [38, 70, 4.3], [46, 30, 1.2], [55, 58, 3.4], [63, 36, 5.2], [71, 66, 0.7], [80, 44, 2.8],
  ];
  return (
    <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: light }}>
      {motes.map(([x, y, d], i) => (
        <i
          key={i}
          className="dust-mote absolute block h-[3px] w-[3px] rounded-full bg-[rgb(255_226_180)]"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-d}s` }}
        />
      ))}
    </motion.div>
  );
}

function Glow({ light }: { light: MotionValue<number> | number }) {
  return (
    <>
      {/* the pool of light around the open book */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[58%] h-[110vmin] w-[150vmin] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: light,
          background:
            "radial-gradient(closest-side, rgb(255 210 150 / 0.2), rgb(255 196 128 / 0.07) 42%, transparent 75%)",
        }}
      />
      {/* and the light it throws up onto the title */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[4%] h-[72%]"
        style={{
          opacity: light,
          // centre + radius stay inside the box on every side, so no edge ever shows
          background: "radial-gradient(min(420px, 46%) 48% at 50% 50%, rgb(255 214 160 / 0.12), transparent 100%)",
        }}
      />
    </>
  );
}

function Title({ color, textShadow }: { color: MotionValue<string> | string; textShadow: MotionValue<string> | string }) {
  return (
    <motion.h2
      id="fiction-title"
      className="display mx-auto max-w-[13ch] text-[clamp(2.7rem,6.6vw,6rem)]"
      style={{ color, textShadow }}
    >
      And then there are the <em className="italic">stories.</em>
    </motion.h2>
  );
}

function Enter() {
  return (
    <Link href="/fiction" className="btn btn-ghost">
      Enter the library →
    </Link>
  );
}

function DeskBookView({
  book,
  intro,
  tilt,
  turn,
  yaw,
  cover,
  leaves,
  light,
  spread,
}: {
  book: DeskBook;
  intro: string;
  tilt: MotionValue<number> | number;
  turn: MotionValue<number> | number;
  yaw: MotionValue<number> | number;
  cover: MotionValue<number> | number;
  leaves: (MotionValue<number> | number)[];
  light: MotionValue<number> | number;
  /** 0 shut, 1 open: widens the shadow under the book. */
  spread: MotionValue<number> | number;
}) {
  return (
    <div className="relative [perspective:calc(var(--bw)*5)]" style={{ "--bw": BOOK_WIDTH } as CSSProperties}>
      {/* the soft shadow it casts, wider once it lies open */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[-55%] top-[86%] h-[22%] w-[160%] rounded-[50%] blur-xl"
        style={{
          scaleX: typeof spread === "number" ? 0.55 + spread * 0.45 : undefined,
          x: "-0%",
          background: "radial-gradient(closest-side, rgb(0 0 0 / 0.7), transparent)",
        }}
      />
      <Book
        slug={book.slug}
        title={book.title}
        kind={book.kind}
        cover={book.cover}
        width={BOOK_WIDTH}
        heightScale={1}
        toneName="oxblood"
        style={{ rotateX: tilt, rotateZ: turn, rotateY: yaw, ...(PAPER as object) }}
        coverAngle={cover}
        leaves={leaves}
        glow={light}
        inside={<PageLight light={light} side="left" />}
        page={<LinePage text={intro} light={light} />}
        topLeafBack={<TitlePage book={book} light={light} />}
      />
    </div>
  );
}

/**
 * Scrolling in, a closed book lies on a dark desk. As the section pins its
 * board swings open, the leaves riffle over after it, and the light from the
 * pages rises and warms the title above.
 */
function ScrollFiction({ intro, book }: { intro: string; book: DeskBook }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end end"] });

  const titleIn = useSegment(p, 0.1, 0.32, 0, 1);
  const titleY = useSegment(p, 0.1, 0.36, 36, 0);
  const light = useSegment(p, 0.5, 0.82, 0, 1);
  const color = useTransform(light, [0, 1], [DIM, WARM]);
  const textShadow = useTransform(
    light,
    (l) => `0 0 ${Math.round(30 + 40 * l)}px rgb(255 206 140 / ${(0.34 * l).toFixed(3)})`
  );
  const outro = useSegment(p, 0.72, 0.86, 0, 1);
  const outroY = useSegment(p, 0.72, 0.88, 18, 0);

  const rise = useSegment(p, 0, 0.42, 38, 0);
  // Held up toward the reader: leaning back a little, turned a touch, never lying flat.
  const tilt = useSegment(p, 0, 0.46, 34, 16);
  const turn = useSegment(p, 0, 0.46, -7, -2);
  const yaw = useSegment(p, 0, 0.46, 18, 6);
  const cover = useSegment(p, 0.44, 0.74, 0, COVER_END, true);
  const l0 = useSegment(p, 0.5, 0.78, 0, LEAF_ENDS[0], true);
  const l1 = useSegment(p, 0.54, 0.8, 0, LEAF_ENDS[1], true);
  const l2 = useSegment(p, 0.58, 0.82, 0, LEAF_ENDS[2], true);
  const l3 = useSegment(p, 0.62, 0.84, 0, LEAF_ENDS[3], true);
  const riseY = useTransform(rise, (v) => `${v}%`);
  // The board opens to the left of the hinge; slide right by half a book so the spread stays centred.
  const centre = useSegment(p, 0.44, 0.76, 0, 50, true);
  const centreX = useTransform(centre, (v) => `${v}%`);

  return (
    <section
      ref={ref}
      id="fiction"
      data-spotlight="off"
      aria-labelledby="fiction-title"
      className="relative h-[190svh] md:h-[250svh]"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.18"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Glow light={light} />
        <Dust light={light} />
        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col items-center px-5 pb-[7svh] pt-[calc(var(--nav-h)+5svh)] text-center md:px-10">
          <motion.div style={{ opacity: titleIn, y: titleY }}>
            <p className="eyebrow">Fiction</p>
            <div className="mt-5">
              <Title color={color} textShadow={textShadow} />
            </div>
          </motion.div>

          <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
            <motion.div style={{ y: riseY, x: centreX }}>
              <DeskBookView
                book={book}
                intro={intro}
                tilt={tilt}
                turn={turn}
                yaw={yaw}
                cover={cover}
                leaves={[l0, l1, l2, l3]}
                light={light}
                spread={centre}
              />
            </motion.div>
          </div>

          <motion.div style={{ opacity: outro, y: outroY }}>
            <Enter />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Calm mode: the book is already open and lit; nothing moves. */
function StillFiction({ intro, book }: { intro: string; book: DeskBook }) {
  return (
    <section
      id="fiction"
      data-spotlight="off"
      aria-labelledby="fiction-title"
      className="relative overflow-hidden px-5 py-28 text-center md:px-10 md:py-36"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.18"
    >
      <Glow light={1} />
      <div className="relative mx-auto max-w-[1400px]">
        <Reveal>
          <p className="eyebrow">Fiction</p>
        </Reveal>
        <Reveal delay={0.05} className="mt-5">
          <Title color={WARM} textShadow="0 0 70px rgb(255 206 140 / 0.34)" />
        </Reveal>
        <div className="my-14 flex justify-center md:my-16">
          <div className="translate-x-1/2">
            <DeskBookView book={book} intro={intro} tilt={16} turn={-2} yaw={6} cover={COVER_END} leaves={LEAF_ENDS} light={1} spread={1} />
          </div>
        </div>
        <Reveal delay={0.1}>
          <Enter />
        </Reveal>
      </div>
    </section>
  );
}

export function FictionPreview({ intro }: { intro: string }) {
  const calm = useCalm();
  const text = introWithoutTitle(intro);
  const book = COMPENDIUM;
  return calm ? <StillFiction intro={text} book={book} /> : <ScrollFiction intro={text} book={book} />;
}

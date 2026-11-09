"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValue } from "motion/react";
import { Book, bookHeightScale } from "./Book";
import { useLastRead } from "./ContinueReading";
import { chapterCount, kindLine, toRoman, type Volume } from "./volume";
import { cx } from "@/lib/utils";
import s from "./book.module.css";

/* ───────── geometry ───────── */

interface Layout {
  W: number;
  H: number;
  L: number;
  T: number;
  /** Phones get one page instead of a spread. */
  single: boolean;
  /** How far the closed book slides right so the open spread is centred on the spine. */
  shift: number;
}

function computeLayout(hs: number): Layout {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const single = vw < 768;
  const maxH = vh - (single ? 136 : 150);
  const W = Math.round(
    single ? Math.min(vw - 32, maxH / (1.5 * hs), 440) : Math.min((vw - 120) / 2, maxH / (1.5 * hs), 500)
  );
  const H = Math.round(W * 1.5 * hs);
  return { W, H, L: (vw - W) / 2, T: (vh - H) / 2 + (single ? 22 : 8), single, shift: single ? 0 : W / 2 };
}

type Rect = { left: number; top: number; width: number; height: number };

/** The transform that puts the centred book back where it stood on the shelf. */
function flipFrom(o: Rect, l: Layout) {
  return {
    x: o.left + o.width / 2 - (l.L + l.W / 2),
    y: o.top + o.height / 2 - (l.T + l.H / 2),
    s: o.width / l.W,
  };
}

/* Shelf poses, as fractions of the book's width (see .pose in book.module.css). */
const REST_TURN = 24;
const PULLED_TURN = 12;
const PULLED_LIFT = -0.05;
const PULLED_OUT = 0.14;
const PERSPECTIVE = 7.5;

const TRAVEL = [0.7, 0, 0.2, 1] as const;
const SWING = [0.6, 0.02, 0.2, 1] as const;

/* ───────── page lock: no scrolling, nothing behind is reachable ───────── */

function lockPage(dialog: HTMLElement | null) {
  const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
  lenis?.stop();
  const html = document.documentElement;
  const prevOverflow = html.style.overflow;
  html.style.overflow = "hidden";
  const inerted: Element[] = [];
  for (const el of Array.from(document.body.children)) {
    if (el === dialog || el.hasAttribute("inert") || ["SCRIPT", "NEXT-ROUTE-ANNOUNCER"].includes(el.tagName)) continue;
    el.setAttribute("inert", "");
    inerted.push(el);
  }
  return () => {
    inerted.forEach((el) => el.removeAttribute("inert"));
    html.style.overflow = prevOverflow;
    lenis?.start();
  };
}

/* ───────── pages ───────── */

function TitleBlock({ volume, titleId, compact = false }: { volume: Volume; titleId: string; compact?: boolean }) {
  return (
    <>
      <p className="font-mono text-[0.66em] uppercase tracking-[0.26em] text-[color:var(--paper-dim)]">
        {kindLine(volume)}
      </p>
      <h2
        id={titleId}
        className={cx(
          "mt-[0.7em] font-display leading-[0.95] tracking-[-0.02em] text-[color:var(--paper-ink)]",
          compact ? "text-[2.1em]" : "text-[2.6em]"
        )}
      >
        {volume.title}
      </h2>
      {volume.tagline && (
        <p className="mt-[0.6em] font-display text-[1.18em] italic leading-snug text-[color:var(--paper-dim)]">
          {volume.tagline}
        </p>
      )}
    </>
  );
}

function Synopsis({ html }: { html: string }) {
  if (!html) return null;
  return (
    <div
      className={cx(s.synopsis, "font-read text-[0.98em] leading-[1.65] text-[color:var(--paper-ink)]")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Meta({ volume }: { volume: Volume }) {
  const bits = volume.placeholder
    ? ["In the drafting room"]
    : [
        volume.progress,
        chapterCount(volume.chapters.length),
        volume.words ? `${volume.words.toLocaleString("en-US")} words` : "",
      ].filter(Boolean);
  return <span>{bits.join(" · ")}</span>;
}

/** Left-hand page: what the book is. */
function TitlePage({ volume, titleId }: { volume: Volume; titleId: string }) {
  return (
    <div className={cx(s.paperText, "absolute inset-0 flex flex-col px-[11%] pb-[9%] pt-[12%]")}>
      <TitleBlock volume={volume} titleId={titleId} />
      <span className="my-[1.3em] block h-px w-10 flex-none bg-[color:var(--paper-rule)]" />
      <div className={cx(s.paperScroll, "min-h-0 flex-1")}>
        <Synopsis html={volume.synopsisHtml} />
      </div>
      <div className="mt-[0.8em] flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-[0.6em] uppercase tracking-[0.2em] text-[color:var(--paper-dim)]">
        <Meta volume={volume} />
        {!volume.placeholder && (
          <Link href={`/fiction/${volume.slug}`} className="transition-colors hover:text-[color:var(--paper-accent)]">
            Book page →
          </Link>
        )}
      </div>
    </div>
  );
}

function ChapterList({ volume, last }: { volume: Volume; last: { slug: string } | null }) {
  return (
    <ol>
      {volume.chapters.map((c, i) => {
        const here = last?.slug === c.slug;
        return (
          <li key={c.slug}>
            <Link
              href={`/fiction/${volume.slug}/${c.slug}`}
              className="group flex items-baseline py-[0.42em] text-[color:var(--paper-ink)]"
              aria-label={`Chapter ${i + 1}: ${c.title}${here ? " (where you left off)" : ""}`}
            >
              <span className="w-[2.6em] flex-none font-display text-[0.92em] italic text-[color:var(--paper-dim)]">
                {toRoman(i + 1)}
              </span>
              <span className="font-display text-[1.24em] leading-[1.15] transition-colors duration-300 group-hover:text-[color:var(--paper-accent)]">
                {c.title}
              </span>
              <span className={s.leader} aria-hidden />
              <span className="flex-none font-mono text-[0.64em] uppercase tracking-[0.14em] text-[color:var(--paper-dim)]">
                {here ? "Last read" : `${c.minutes} min`}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function Actions({ volume, last }: { volume: Volume; last: { slug: string; title: string } | null }) {
  const first = volume.chapters[0];
  if (!first) return null;
  const target = last ?? first;
  return (
    <div className="mt-[1em] flex flex-none flex-wrap items-center gap-x-[1.1em] gap-y-[0.6em]">
      <Link
        href={`/fiction/${volume.slug}/${target.slug}`}
        className="inline-flex h-[2.7em] items-center rounded-full bg-[color:var(--paper-ink)] px-[1.15em] text-[0.88em] text-[color:var(--paper)] transition-transform duration-500 hover:-translate-y-px"
      >
        {last ? `Continue: ${last.title}` : "Start reading"} →
      </Link>
      {last && last.slug !== first.slug && (
        <Link
          href={`/fiction/${volume.slug}/${first.slug}`}
          className="text-[0.82em] text-[color:var(--paper-dim)] underline decoration-[color:var(--paper-rule)] underline-offset-4 transition-colors hover:text-[color:var(--paper-accent)]"
        >
          From the beginning
        </Link>
      )}
    </div>
  );
}

function OnTheWay({ volume }: { volume: Volume }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="font-display text-[1.5em] italic leading-tight text-[color:var(--paper-ink)]">
        {volume.placeholder ? "The stories are on the way." : "The first chapter is on its way."}
      </p>
      <p className="mt-[0.9em] max-w-[22em] font-read text-[0.95em] leading-relaxed text-[color:var(--paper-dim)]">
        They&apos;ll appear here as they&apos;re finished, one chapter at a time.
      </p>
      <Link
        href="/rss.xml"
        className="mt-[1.4em] font-mono text-[0.62em] uppercase tracking-[0.22em] text-[color:var(--paper-dim)] underline decoration-[color:var(--paper-rule)] underline-offset-4 hover:text-[color:var(--paper-accent)]"
      >
        Follow along with RSS
      </Link>
    </div>
  );
}

function ContentsHeading() {
  return (
    <>
      <p className="text-center font-display text-[1.55em] italic leading-none text-[color:var(--paper-ink)]">Contents</p>
      <span className="mx-auto mt-[0.7em] block h-px w-8 flex-none bg-[color:var(--paper-rule)]" />
    </>
  );
}

/** Right-hand page: the contents, and the way in. */
function ContentsPage({ volume, last }: { volume: Volume; last: { slug: string; title: string } | null }) {
  return (
    <div className={cx(s.paperText, "absolute inset-0 flex flex-col pb-[9%] pl-[13%] pr-[10%] pt-[12%]")}>
      <ContentsHeading />
      {volume.chapters.length ? (
        <>
          <div className={cx(s.paperScroll, "mt-[1.3em] min-h-0 flex-1")}>
            <ChapterList volume={volume} last={last} />
          </div>
          <Actions volume={volume} last={last} />
        </>
      ) : (
        <OnTheWay volume={volume} />
      )}
    </div>
  );
}

/** Phones: one page holds the title, the synopsis and the contents. */
function SinglePage({
  volume,
  titleId,
  last,
}: {
  volume: Volume;
  titleId: string;
  last: { slug: string; title: string } | null;
}) {
  return (
    <div className={cx(s.paperText, "absolute inset-0 flex flex-col px-[9%] pb-[7%] pt-[9%]")}>
      <div className={cx(s.paperScroll, "min-h-0 flex-1")}>
        <TitleBlock volume={volume} titleId={titleId} compact />
        {volume.synopsisHtml && (
          <div className="mt-[1em]">
            <Synopsis html={volume.synopsisHtml} />
          </div>
        )}
        <p className="mt-[1em] font-mono text-[0.6em] uppercase tracking-[0.2em] text-[color:var(--paper-dim)]">
          <Meta volume={volume} />
        </p>
        <div className="mt-[1.6em] border-t border-[color:var(--paper-rule)] pt-[1.3em]">
          <ContentsHeading />
          {volume.chapters.length ? (
            <div className="mt-[1em]">
              <ChapterList volume={volume} last={last} />
            </div>
          ) : (
            <div className="flex py-[1.4em]">
              <OnTheWay volume={volume} />
            </div>
          )}
        </div>
        {!volume.placeholder && (
          <Link
            href={`/fiction/${volume.slug}`}
            className="mt-[1.2em] inline-block font-mono text-[0.6em] uppercase tracking-[0.2em] text-[color:var(--paper-dim)] hover:text-[color:var(--paper-accent)]"
          >
            Book page →
          </Link>
        )}
      </div>
      <Actions volume={volume} last={last} />
    </div>
  );
}

/* ───────── the open book ───────── */

/**
 * The book lifts off the shelf, travels to the centre of the screen and its
 * front board swings open on the hinge, showing a title page on the left and
 * the contents on the right. Closing reverses it and puts the book back.
 * In calm mode the same open spread simply fades in and out.
 */
export function OpenBook({
  volume,
  origin,
  getOrigin,
  calm,
  onClosed,
}: {
  volume: Volume;
  origin: Rect;
  getOrigin: () => Rect | null;
  calm: boolean;
  onClosed: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const release = useRef<(() => void) | null>(null);
  const closing = useRef(false);
  const opened = useRef(false);
  const hs = bookHeightScale(volume.slug);
  const last = useLastRead(volume.slug, volume.chapters);

  // Everything is measured once when the book is taken down; resizes update layout below.
  const [start] = useState(() => {
    const l = computeLayout(hs);
    return { calm, layout: l, flip: flipFrom(origin, l) };
  });
  const [layout, setLayout] = useState(start.layout);
  const still = start.calm;
  const f = start.flip;
  const L0 = start.layout;

  // Outer wrapper: a flat move and scale from the shelf to the centre.
  const wx = useMotionValue(still ? L0.shift : f.x);
  const wy = useMotionValue(still ? 0 : f.y);
  const ws = useMotionValue(still ? 1 : f.s);
  // The book itself: its pose on the shelf, in its own perspective.
  const turn = useMotionValue(still ? 0 : PULLED_TURN);
  const lift = useMotionValue(still ? 0 : PULLED_LIFT * L0.W);
  const out = useMotionValue(still ? 0 : PULLED_OUT * L0.W);
  const coverAngle = useMotionValue(still ? -180 : 0);
  const coverFace = useMotionValue(still && L0.single ? 0 : 1);
  const backdrop = useMotionValue(still ? 1 : 0);
  const glow = useMotionValue(still ? 1 : 0);
  const content = useMotionValue(still ? 1 : 0);
  const fade = useMotionValue(still ? 0 : 1);

  useEffect(() => {
    release.current = lockPage(dialogRef.current);
    dialogRef.current?.focus({ preventScroll: true });

    if (still) {
      animate(fade, 1, { duration: 0.35, ease: "easeOut" });
    } else {
      const travel = { duration: 0.95, ease: TRAVEL };
      const swing = { duration: 1.3, ease: SWING, delay: 0.8 };
      animate(backdrop, 1, { duration: 0.6, ease: "easeOut" });
      // Travel to the centre, then slide right as the board opens so the spread sits on the spine.
      animate(wx, [f.x, 0, L0.shift], { duration: 2.1, ease: [TRAVEL, SWING], times: [0, 0.45, 1] });
      animate(wy, 0, travel);
      animate(ws, 1, travel);
      animate(turn, 0, travel);
      animate(lift, 0, travel);
      animate(out, 0, travel);
      animate(coverAngle, L0.single ? -180 : -178, swing);
      if (L0.single) animate(coverFace, 0, { duration: 0.45, ease: "easeIn", delay: 1.35 });
      animate(glow, 1, { duration: 1.4, ease: "easeOut", delay: 0.75 });
      animate(content, 1, { duration: 0.6, ease: "easeOut", delay: 1.4 });
    }
    opened.current = true;

    return () => {
      release.current?.();
      release.current = null;
    };
  }, [still, f, L0, backdrop, wx, wy, ws, turn, lift, out, coverAngle, coverFace, glow, content, fade]);

  useEffect(() => {
    const onResize = () => {
      const next = computeLayout(hs);
      setLayout(next);
      if (opened.current && !closing.current) {
        wx.set(next.shift);
        coverFace.set(next.single ? 0 : 1);
        coverAngle.set(next.single ? -180 : -178);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hs, wx, coverFace, coverAngle]);

  const close = async () => {
    if (closing.current) return;
    closing.current = true;

    if (still) {
      await animate(fade, 0, { duration: 0.25, ease: "easeIn" });
    } else {
      // Measure again: the shelf may have moved since the book was taken down.
      const back = flipFrom(getOrigin() ?? origin, layout);
      const swing = { duration: 0.65, ease: SWING };
      const travel = { duration: 0.75, ease: TRAVEL, delay: 0.65 };
      await Promise.all([
        animate(content, 0, { duration: 0.2 }),
        animate(coverAngle, 0, swing),
        animate(coverFace, 1, { duration: 0.3 }),
        animate(glow, 0, { duration: 0.6 }),
        animate(wx, [wx.get(), 0, back.x], { duration: 1.4, ease: [SWING, TRAVEL], times: [0, 0.46, 1] }),
        animate(wy, back.y, travel),
        animate(ws, back.s, travel),
        animate(turn, REST_TURN, travel),
        animate(backdrop, 0, { duration: 0.5, ease: "easeIn", delay: 0.9 }),
      ]);
    }
    release.current?.();
    release.current = null;
    onClosed();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      void close();
      return;
    }
    if (e.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
    if (!items.length) return;
    const first = items[0];
    const lastItem = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === root)) {
      e.preventDefault();
      lastItem.focus();
    } else if (!e.shiftKey && active === lastItem) {
      e.preventDefault();
      first.focus();
    }
  };

  const { W, H, L, T, single } = layout;
  let inside: ReactNode = null;
  let page: ReactNode;
  if (single) {
    page = <SinglePage volume={volume} titleId={titleId} last={last} />;
  } else {
    inside = <TitlePage volume={volume} titleId={titleId} />;
    page = <ContentsPage volume={volume} last={last} />;
  }

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-lenis-prevent
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[55] outline-none"
      style={{ opacity: fade }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[rgb(5_5_7/0.94)]"
        style={{ opacity: backdrop }}
        onClick={() => void close()}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: glow,
          background:
            "radial-gradient(46% 62% at 50% 52%, rgb(255 214 160 / 0.13), rgb(255 200 140 / 0.04) 55%, transparent 75%)",
        }}
      />

      <motion.div
        className="absolute will-change-transform"
        style={{ left: L, top: T, width: W, height: H, x: wx, y: wy, scale: ws }}
      >
        <Book
          slug={volume.slug}
          title={volume.title}
          cover={volume.cover}
          kind={volume.kind}
          width={`${W}px`}
          heightScale={hs}
          coverAngle={coverAngle}
          coverFaceOpacity={coverFace}
          style={{ transformPerspective: W * PERSPECTIVE, y: lift, z: out, rotateY: turn }}
          inside={inside && <motion.div style={{ opacity: content }} className="absolute inset-0">{inside}</motion.div>}
          page={<motion.div style={{ opacity: content }} className="absolute inset-0">{page}</motion.div>}
        />
      </motion.div>

      <motion.div style={{ opacity: backdrop }} className="absolute right-4 top-4 flex items-center gap-4 md:right-8 md:top-6">
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-white/40 md:inline" aria-hidden>
          Esc to close
        </span>
        <button
          type="button"
          onClick={() => void close()}
          aria-label={`Close ${volume.title}`}
          className="btn btn-ghost h-11 w-11 justify-center p-0 text-lg"
        >
          <span aria-hidden>×</span>
        </button>
      </motion.div>
    </motion.div>,
    document.body
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Book, bookHeightScale } from "./Book";
import { useCalm } from "./useCalm";
import { capitalize, chapterCount, type Volume } from "./volume";
import { cx } from "@/lib/utils";
import s from "./book.module.css";

type Rect = { left: number; top: number; width: number; height: number };

// The open book is only needed once a reader takes one down, so it loads on its own,
// warmed up while the shelf sits idle (see below).
const loadOpenBook = () => import("./OpenBook");
const OpenBook = dynamic(() => loadOpenBook().then((m) => m.OpenBook), { ssr: false });

const SHELF_WIDTH = "clamp(124px, 14vw, 196px)";
/** Books per shelf: more than this and the case gains a shelf instead of scrolling sideways. */
const PER_SHELF = 3;
const EASE = [0.16, 1, 0.3, 1] as const;

function shelves<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += PER_SHELF) rows.push(items.slice(i, i + PER_SHELF));
  return rows;
}

function rectOf(el: Element | undefined | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/**
 * The library: every work stands face out on a lit shelf. Taking one down
 * opens it in place (see OpenBook); putting it back returns focus here.
 */
export function Library({ volumes }: { volumes: Volume[] }) {
  const calm = useCalm();
  const slots = useRef(new Map<string, HTMLDivElement>());
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const [active, setActive] = useState<{ volume: Volume; origin: Rect } | null>(null);

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    const warm = () => void loadOpenBook();
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(warm);
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(t);
  }, []);

  const takeDown = (volume: Volume) => {
    if (active) return;
    const origin = rectOf(slots.current.get(volume.slug));
    if (origin) setActive({ volume, origin });
  };

  const putBack = () => {
    const slug = active?.volume.slug;
    setActive(null);
    if (slug) buttons.current.get(slug)?.focus({ preventScroll: true });
  };

  return (
    <div className={cx(s.shelf, s.shelfRoom)} data-calm={calm ? "" : undefined}>
      {shelves(volumes).map((row, r, all) => (
        <div key={r} className="relative">
          <div className={s.shelfScroller}>
            <ul className={s.shelfRow} aria-label={all.length > 1 ? `Shelf ${r + 1} of ${all.length}` : "Books on the shelf"}>
              {row.map((v, j) => {
                const i = r * PER_SHELF + j;
                const hidden = active?.volume.slug === v.slug;
                const meta = v.placeholder
                  ? "In the drafting room"
                  : [capitalize(v.kind), chapterCount(v.chapters.length)].join(" · ");
                return (
                  <motion.li
                    key={v.slug}
                    className={s.shelfItem}
                    style={{ "--bw": SHELF_WIDTH } as React.CSSProperties}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.15 + Math.min(i, 8) * 0.09 }}
                  >
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) buttons.current.set(v.slug, el);
                        else buttons.current.delete(v.slug);
                      }}
                      className={s.shelfButton}
                      onClick={() => takeDown(v)}
                      aria-haspopup="dialog"
                      aria-label={`Open ${v.title}. ${meta}.`}
                    >
                      <div
                        ref={(el) => {
                          if (el) slots.current.set(v.slug, el);
                          else slots.current.delete(v.slug);
                        }}
                        className={s.slot}
                        style={{ "--hs": bookHeightScale(v.slug) } as React.CSSProperties}
                        data-hidden={hidden ? "" : undefined}
                      >
                        <span className={s.contact} aria-hidden />
                        <Book
                          slug={v.slug}
                          title={v.title}
                          cover={v.cover}
                          kind={v.kind}
                          width={SHELF_WIDTH}
                          className={s.pose}
                        />
                      </div>
                    </button>
                    <div className={s.label} aria-hidden>
                      <p className="display truncate text-[1.3rem] leading-tight text-ink">{v.title}</p>
                      <p className="mt-1.5 line-clamp-2 font-mono text-[9.5px] uppercase leading-[1.6] tracking-[0.2em] text-muted">{meta}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
          {/* label (30 + 64) below the books, less the 18px of plank that shows under them */}
          <div className={s.plank} style={{ bottom: 76 }} aria-hidden />
        </div>
      ))}

      {active && (
        <OpenBook
          key={active.volume.slug}
          volume={active.volume}
          origin={active.origin}
          getOrigin={() => rectOf(slots.current.get(active.volume.slug))}
          calm={calm}
          onClosed={putBack}
        />
      )}
    </div>
  );
}

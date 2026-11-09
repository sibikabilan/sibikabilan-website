"use client";

import { motion, type MotionStyle, type MotionValue } from "motion/react";
import type { ReactNode, Ref } from "react";
import { cx } from "@/lib/utils";
import s from "./book.module.css";

type Num = number | MotionValue<number>;

/** Deep, restrained leather colours with a foil that suits each one. */
export const BOOK_TONES = [
  { name: "oxblood", cloth: "#4a1c1f", foil: "#d6b57e" },
  { name: "ink", cloth: "#17213a", foil: "#d8c8a2" },
  { name: "bottle", cloth: "#163226", foil: "#d2b57b" },
  { name: "saddle", cloth: "#5a3520", foil: "#e6cf9f" },
  { name: "charcoal", cloth: "#26272b", foil: "#c9ccd2" },
  { name: "plum", cloth: "#3a1d36", foil: "#ddbd8f" },
  { name: "petrol", cloth: "#16343a", foil: "#d8c59d" },
] as const;

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Salted so the books on the shelf today all come out in different leathers. */
const TONE_SALT = "leather85:";

export function bookTone(slug: string) {
  return BOOK_TONES[hash(TONE_SALT + slug) % BOOK_TONES.length];
}

/** Thickness as a fraction of the width: a novel is fatter than a story. */
const DEPTH: Record<string, number> = {
  compendium: 0.26,
  novel: 0.2,
  collection: 0.17,
  serial: 0.15,
  novella: 0.13,
  "short story": 0.1,
};
export function bookDepth(kind?: string) {
  return DEPTH[kind ?? ""] ?? 0.15;
}

/** Real shelves are uneven: each book is a touch shorter or taller, always the same for a slug. */
export function bookHeightScale(slug: string) {
  return 0.93 + ((hash(`${slug}:h`) % 8) / 100);
}

const KIND_LABEL: Record<string, string> = {
  compendium: "A compendium",
  novel: "A novel",
  collection: "Stories",
  "short story": "A story",
  novella: "A novella",
  serial: "A serial",
};

function titleScale(title: string) {
  const n = title.length;
  const longest = Math.max(1, ...title.split(/\s+/).map((w) => w.length));
  const byLength = n <= 8 ? 0.17 : n <= 14 ? 0.15 : n <= 22 ? 0.13 : n <= 34 ? 0.11 : 0.095;
  // The longest word has to fit inside the frame on one line.
  return Math.min(byLength, 0.66 / (longest * 0.46));
}

export interface BookProps {
  slug: string;
  title: string;
  cover?: string | null;
  kind?: string;
  /** Pick a leather by name (see BOOK_TONES) instead of deriving it from the slug. */
  toneName?: string;
  /** Front board width as a CSS length. Height is 1.5x (times the slug's height scale). */
  width?: string;
  heightScale?: number;
  /** Degrees the front board has swung open: 0 is shut, -180 lies flat to the left. */
  coverAngle?: Num;
  /** Fades the front board (used when the open book collapses to one page). */
  coverFaceOpacity?: Num;
  /** Loose leaves between the board and the block, each an angle in degrees. */
  leaves?: Num[];
  /** 0..1: warm light rising out of the leaves. */
  glow?: Num;
  /** Left-hand page: printed on the inside of the front board. */
  inside?: ReactNode;
  /** Right-hand page: the first page of the block. */
  page?: ReactNode;
  /** Printed on the back of the last loose leaf, which ends up as the visible left-hand page. */
  topLeafBack?: ReactNode;
  className?: string;
  style?: MotionStyle;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A CSS 3D leather bound hardcover: front and back boards, a banded spine with the title set
 * vertically, the page block's three edges, and a first page under the cover.
 * The front board swings on its left hinge to show `inside` and `page`.
 */
export function Book({
  slug,
  title,
  cover,
  kind,
  toneName,
  width = "220px",
  heightScale,
  coverAngle,
  coverFaceOpacity,
  leaves,
  glow,
  inside,
  page,
  topLeafBack,
  className,
  style,
  ref,
}: BookProps) {
  const tone = BOOK_TONES.find((t) => t.name === toneName) ?? bookTone(slug);
  const hs = heightScale ?? bookHeightScale(slug);
  const vars = {
    "--bw": width,
    "--hs": hs,
    "--dr": bookDepth(kind),
    "--cloth": tone.cloth,
    "--foil": tone.foil,
    ...(glow !== undefined ? { "--glow": glow } : {}),
  } as MotionStyle;
  const driven = coverAngle !== undefined;

  return (
    <motion.div ref={ref} className={cx(s.book, className)} style={{ ...vars, ...style }}>
      <div className={cx(s.face, s.back)} aria-hidden />
      <div className={cx(s.face, s.spine)} aria-hidden>
        <span className={s.spineBand} />
        <span className={s.spineTitle}>{title}</span>
        <span className={s.spineMark}>S.K.</span>
      </div>
      <div className={cx(s.face, s.edgeTop)} aria-hidden />
      <div className={cx(s.face, s.edgeBottom)} aria-hidden />
      <div className={cx(s.face, s.edgeFore)} aria-hidden />

      <div className={cx(s.face, s.page)}>{page}</div>

      {leaves?.map((angle, i) => (
        <div
          key={i}
          className={s.leafBase}
          // Leaves sit in the gap between the block and the front board, never above the board.
          style={{ transform: `translateZ(calc(var(--pd) / 2 + var(--board) * ${((i + 1) / (leaves.length + 1)).toFixed(3)}))` }}
          aria-hidden
        >
          <motion.div className={s.leaf} style={{ rotateY: angle }}>
            <div className={cx(s.face, s.leafFace)} />
            <div className={cx(s.face, s.leafFace, s.leafBack)}>{i === leaves.length - 1 ? topLeafBack : null}</div>
          </motion.div>
        </div>
      ))}

      <div className={s.hinge}>
        <motion.div className={cx(s.cover, !driven && s.coverCss)} style={driven ? { rotateY: coverAngle } : undefined}>
          <motion.div
            className={cx(s.face, s.coverFront)}
            style={coverFaceOpacity !== undefined ? { opacity: coverFaceOpacity } : undefined}
            aria-hidden
          >
            {cover ? (
              // Covers are uploaded to Blob storage, outside next/image's configured hosts.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" loading="lazy" draggable={false} />
            ) : (
              <div className={s.cloth}>
                <div className={s.frame} />
                <div className={s.coverText}>
                  <p className={s.coverKind}>{KIND_LABEL[kind ?? ""] ?? "Fiction"}</p>
                  <p className={s.coverTitle} style={{ fontSize: `calc(var(--bw) * ${titleScale(title)})` }}>
                    {title}
                  </p>
                  <span className={s.coverRule} />
                  <p className={s.coverAuthor}>Sibi Kabilan</p>
                </div>
              </div>
            )}
            <div className={s.light} />
            <div className={s.sheen} />
          </motion.div>
          <motion.div
            className={cx(s.face, s.coverInside)}
            style={coverFaceOpacity !== undefined ? { opacity: coverFaceOpacity } : undefined}
          >
            {inside}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

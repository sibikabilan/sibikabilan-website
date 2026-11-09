"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fades and lifts its children in as they scroll into view. Use `immediate`
 * for anything in the opening view of a page: the same entrance then runs in
 * CSS from the first paint (see .enter-rise) instead of after hydration.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  immediate = false,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "p" | "span" | "article";
  immediate?: boolean;
} & Omit<HTMLMotionProps<"div">, "children">) {
  if (immediate) {
    const Tag = as;
    // Opening-view type rises out of a soft, dim blur rather than from nothing, so it
    // counts as painted on the first frame (Largest Contentful Paint) instead of only
    // once the fade ends. Set --enter-opacity to 0 for the original fade from black.
    const style = { "--enter-y": `${y}px`, "--enter-delay": `${delay}s`, "--enter-opacity": "0.35" } as CSSProperties;
    return (
      <Tag className={cx("enter-rise", className)} style={style}>
        {children}
      </Tag>
    );
  }
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Reveals a line of display type word by word, like a title sequence. */
export function TitleReveal({
  text,
  className,
  delay = 0,
  italicWords = [],
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  italicWords?: string[];
  /** Run the entrance in CSS from the first paint; for titles in the opening view. */
  immediate?: boolean;
}) {
  const words = text.split(" ");
  const norm = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
  const italic = new Set(italicWords.map(norm));
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          {immediate ? (
            <span
              className={`enter-line inline-block ${italic.has(norm(w)) ? "italic text-ink-2" : ""}`}
              style={{ "--enter-from": "110%", "--enter-delay": `${delay + i * 0.06}s` } as CSSProperties}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ) : (
            <motion.span
              className={`inline-block ${italic.has(norm(w)) ? "italic text-ink-2" : ""}`}
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.06 }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          )}
        </span>
      ))}
    </span>
  );
}

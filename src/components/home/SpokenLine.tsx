"use client";

import { Fragment } from "react";
import { SPOKEN_LINE } from "@/lib/spoken";
import { usePortraitCue } from "@/lib/stores";

/**
 * The line the portrait says. While he's speaking, each word arrives as it's
 * said and the current word catches the light; once said, the line stays.
 * If the footage can't play (no WebGL, autoplay blocked) the whole line simply shows.
 */
export function SpokenLine() {
  const { word, said, live } = usePortraitCue();
  const playing = live;
  const lines = [SPOKEN_LINE.slice(0, 3), SPOKEN_LINE.slice(3)];

  return (
    <h2 className="display text-[clamp(3rem,6.4vw,6.2rem)] leading-[0.98] text-ink" aria-label={SPOKEN_LINE.map((w) => w.word).join(" ")}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.map((w, j) => {
            const i = li * 3 + j;
            const shown = !playing || i <= said;
            const now = playing && i === word;
            return (
              <Fragment key={i}>
                <span
                  className={`inline-block transition-[opacity,filter,transform,color] duration-500 ease-out ${w.word === "Storyteller" ? "italic" : ""}`}
                  style={{
                    opacity: shown ? 1 : 0.08,
                    filter: shown ? "blur(0px)" : "blur(6px)",
                    transform: shown ? "translateY(0)" : "translateY(0.12em)",
                    color: now ? "var(--key)" : w.word === "Storyteller" ? "var(--ink-2)" : undefined,
                    textShadow: now ? "0 0 28px color-mix(in oklab, var(--key) 45%, transparent)" : "none",
                  }}
                >
                  {w.word}
                </span>
                {j < line.length - 1 ? " " : null}
              </Fragment>
            );
          })}
        </span>
      ))}
    </h2>
  );
}

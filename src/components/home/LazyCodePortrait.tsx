"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useNearViewport } from "@/lib/useNearViewport";

/** What the portrait looks like before it plays: the same still, the same caption row. */
function Still() {
  return (
    <>
      <div className="code-portrait relative aspect-square w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/sibi-portrait.webp"
          alt="Sibi Kabilan"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
      <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.26em] text-faint" aria-hidden>
        <span className="flex items-center gap-2">
          <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--key)]" />
          Live
        </span>
      </div>
    </>
  );
}

const CodePortrait = dynamic(() => import("./CodePortrait").then((m) => m.CodePortrait), {
  ssr: false,
  loading: Still,
});

/**
 * The talking portrait (three.js and a 1 MB clip) mounts as its section
 * approaches. Until then the still stands in, so nothing moves when it swaps.
 */
export function LazyCodePortrait() {
  const box = useRef<HTMLDivElement>(null);
  const near = useNearViewport(box, "150% 0px");
  return <div ref={box}>{near ? <CodePortrait /> : <Still />}</div>;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const readingKey = (workSlug: string) => `sk-reading:${workSlug}`;

type NavChapter = { slug: string; title: string };

/** The last chapter this reader opened on this device, if it is still published. */
export function useLastRead<T extends NavChapter>(workSlug: string, chapters: T[]): T | null {
  const [last, setLast] = useState<T | null>(null);

  useEffect(() => {
    try {
      const slug = localStorage.getItem(readingKey(workSlug));
      const found = chapters.find((c) => c.slug === slug);
      // Reading history only exists in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setLast(found);
    } catch {
      /* storage unavailable */
    }
  }, [workSlug, chapters]);

  return last;
}

/** "Continue" points at the last chapter this reader opened on this device. */
export function ContinueReading({
  workSlug,
  chapters,
  className = "btn btn-key",
}: {
  workSlug: string;
  chapters: NavChapter[];
  className?: string;
}) {
  const last = useLastRead(workSlug, chapters);
  const target = last ?? chapters[0];
  return (
    <Link href={`/fiction/${workSlug}/${target.slug}`} className={className}>
      {last ? `Continue: ${last.title}` : "Start reading"} →
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const readingKey = (workSlug: string) => `sk-reading:${workSlug}`;

/** "Continue" points at the last chapter this reader opened on this device. */
export function ContinueReading({
  workSlug,
  chapters,
}: {
  workSlug: string;
  chapters: { slug: string; title: string }[];
}) {
  const [last, setLast] = useState<{ slug: string; title: string } | null>(null);

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

  const target = last ?? chapters[0];
  return (
    <Link href={`/fiction/${workSlug}/${target.slug}`} className="btn btn-key">
      {last ? `Continue: ${last.title}` : "Start reading"} →
    </Link>
  );
}

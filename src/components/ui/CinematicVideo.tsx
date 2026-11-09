"use client";

import { useEffect, useRef, useState } from "react";
import { useAtmosphere } from "@/lib/stores";
import { cx } from "@/lib/utils";

/**
 * Lazy, muted, looping video that only loads near the viewport and pauses
 * when off screen. In calm mode it holds on the poster frame.
 */
export function CinematicVideo({
  src,
  poster,
  className,
  loop = true,
  playOnce = false,
  label,
}: {
  src: string;
  poster: string;
  className?: string;
  loop?: boolean;
  playOnce?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const { motion } = useAtmosphere();
  const calm = motion === "calm";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        const v = ref.current;
        if (!v) return;
        if (entry.isIntersecting && !calm) {
          if (playOnce && v.ended) return;
          v.play().catch(() => undefined);
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [calm, playOnce]);

  useEffect(() => {
    if (calm) ref.current?.pause();
  }, [calm]);

  return (
    <video
      ref={ref}
      className={cx("h-full w-full object-cover", className)}
      // The poster waits until the video is near too, so offscreen clips cost nothing up front.
      poster={near ? poster : undefined}
      src={near ? src : undefined}
      muted
      playsInline
      loop={loop && !playOnce}
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

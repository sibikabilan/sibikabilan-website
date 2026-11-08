"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAtmosphere } from "@/lib/stores";

/**
 * Sibi's real headshot, cut out of its background. A subtle living version
 * (transparent video) plays on top once loaded: WebM with alpha for
 * Chromium and Firefox, HEVC with alpha for Safari. The still is always the
 * first frame, so the swap is invisible.
 */
export function LivePortrait({ priority = false, className = "" }: { priority?: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const { motion } = useAtmosphere();

  useEffect(() => {
    const ua = navigator.userAgent;
    const safari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Android/.test(ua);
    const probe = document.createElement("video");
    const webm = probe.canPlayType('video/webm; codecs="vp9"') !== "";
    // Chooses the alpha format this browser can actually composite.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(safari ? "/media/sibi-live.mov" : webm ? "/media/sibi-live.webm" : null);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    if (motion === "calm") {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => undefined) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [src, motion]);

  return (
    <div className={`portrait-light relative ${className}`}>
      <Image
        src="/media/sibi-cutout.webp"
        alt="Sibi Kabilan"
        fill
        priority={priority}
        sizes="(min-width: 1024px) 46vw, 90vw"
        className="object-contain object-bottom"
      />
      {src && (
        <video
          ref={ref}
          src={src}
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-700"
          style={{ opacity: playing && motion !== "calm" ? 1 : 0 }}
        />
      )}
    </div>
  );
}

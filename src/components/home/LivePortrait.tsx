"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAtmosphere } from "@/lib/stores";

/**
 * Sibi's real headshot, cut out of its background. A subtle living version
 * (transparent video) plays on top once loaded: WebM with alpha for
 * Chromium and Firefox, HEVC with alpha for Safari. The still is always the
 * first frame, so the swap is invisible.
 *
 * The still is the page's largest paint, so it goes first in line, and the
 * video only starts once the still has loaded, any entrance the portrait is
 * part of has finished, and the browser is idle. Until then the still is all
 * there is to see, and the swap stays invisible.
 */
export function LivePortrait({ priority = false, className = "" }: { priority?: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [stillLoaded, setStillLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { motion } = useAtmosphere();

  useEffect(() => {
    if (!stillLoaded) return;
    const ua = navigator.userAgent;
    const safari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Android/.test(ua);
    const probe = document.createElement("video");
    const webm = probe.canPlayType('video/webm; codecs="vp9"') !== "";
    // Chooses the alpha format this browser can actually composite.
    const next = safari ? "/media/sibi-live.mov" : webm ? "/media/sibi-live.webm" : null;
    const el = box.current;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    let cancelled = false;
    let idle = 0;
    let timer = 0;
    // Entrances around the portrait (a CSS fade in the hero) run on the still first.
    const entrances =
      el && typeof document.getAnimations === "function"
        ? document.getAnimations().filter((a) => {
            const target = (a.effect as KeyframeEffect | null)?.target;
            return target instanceof Element && target !== el && target.contains(el);
          })
        : [];
    Promise.all(entrances.map((a) => a.finished.catch(() => undefined))).then(() => {
      if (cancelled) return;
      if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setSrc(next), { timeout: 1500 });
      else timer = window.setTimeout(() => setSrc(next), 300);
    });
    return () => {
      cancelled = true;
      if (idle) w.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, [stillLoaded]);

  // Blinks come with the clip, so it plays a touch slower and then rests on its
  // last frame (the same as its first) for a while before it plays again.
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    const slow = () => {
      v.defaultPlaybackRate = 0.8;
      v.playbackRate = 0.8;
    };
    slow();
    let rest = 0;
    const onEnded = () => {
      rest = window.setTimeout(() => {
        v.currentTime = 0;
        slow();
        v.play().catch(() => undefined);
      }, 6500);
    };
    v.addEventListener("loadedmetadata", slow);
    v.addEventListener("ended", onEnded);
    return () => {
      window.clearTimeout(rest);
      v.removeEventListener("loadedmetadata", slow);
      v.removeEventListener("ended", onEnded);
    };
  }, [src]);

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
    <div ref={box} className={`portrait-light ${className || "relative"}`}>
      <Image
        src="/media/sibi-cutout.webp"
        alt="Sibi Kabilan"
        fill
        // The still is in the server HTML, so the preload scanner finds it; this just puts it first in line.
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        // The square is 33svh tall on phones and min(58svh, 42vw) on desktop (see Hero).
        sizes="(min-width: 1024px) 58vh, 33vh"
        className="object-contain object-bottom"
        onLoad={() => setStillLoaded(true)}
      />
      {src && (
        <video
          ref={ref}
          src={src}
          muted
          playsInline
          preload="auto"
          aria-hidden
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-700"
          // A hairline inset (on transparent edges) keeps the clip a touch smaller than the
          // still beneath it, so browsers keep counting the still as the largest paint.
          style={{ opacity: playing && motion !== "calm" ? 1 : 0, clipPath: "inset(1px)" }}
        />
      )}
    </div>
  );
}

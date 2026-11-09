"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element comes within `margin` of the viewport, and stays true.
 * Used to mount heavy pieces (WebGL, video) just before they are scrolled to,
 * instead of during the first load.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = "100% 0px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}

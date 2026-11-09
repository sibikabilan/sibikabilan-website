"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isTouchPaged } from "@/lib/touchSteps";

/** Height of the floating nav: the anchor settles just below it. */
const NAV = 68;

/**
 * On a phone, scrolling down onto this spot settles it just under the nav:
 * once the page comes to rest with it anywhere in the top 60% of the screen,
 * ScrollTrigger's snap eases it the rest of the way. Scrolling up past it is
 * left alone.
 */
export function SettleAnchor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isTouchPaged()) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "top top",
      snap: {
        snapTo: (v: number) => {
          const span = window.innerHeight * 0.6;
          return st.direction > 0 ? Math.min(1, Math.max(0, (span - NAV) / span)) : v;
        },
        duration: { min: 0.25, max: 0.6 },
        delay: 0.06,
        ease: "power2.out",
        inertia: false,
      },
    });
    return () => st.kill();
  }, []);
  return <div ref={ref} aria-hidden className="h-0" />;
}

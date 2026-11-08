"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** A short title card on the first visit of a session: letterbox, count, open. */
export function Intro() {
  const [show, setShow] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("sk-intro") === "1";
      sessionStorage.setItem("sk-intro", "1");
    } catch {
      seen = false;
    }
    const calm = document.documentElement.dataset.motion === "calm" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || calm) {
      // A returning visitor skips the title card.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(false);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1500);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(() => setShow(false), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="intro-card fixed inset-0 z-[100] flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-black"
            exit={{ y: "-100%" }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-black"
            exit={{ y: "100%" }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div className="relative text-center" exit={{ opacity: 0, filter: "blur(8px)" }} transition={{ duration: 0.4 }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#8c867d]">A film by</p>
            <p className="display mt-4 text-5xl text-[#ede7dd] md:text-6xl">
              Sibi <em className="text-[color:var(--key)]">Kabilan</em>
            </p>
            <p className="mt-6 font-mono text-[11px] tabular-nums tracking-[0.3em] text-[#57534d]">
              {String(count).padStart(3, "0")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

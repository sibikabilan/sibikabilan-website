"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MARK_BODY, MARK_TAIL, MARK_VIEWBOX, MARK_WING } from "./Mark";

/** A brief hello on the first visit of a session: the dove gathers itself and lifts, the name settles, the page opens. */
export function Intro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("sk-intro") === "1";
      sessionStorage.setItem("sk-intro", "1");
    } catch {
      seen = false;
    }
    const calm =
      document.documentElement.dataset.motion === "calm" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || calm) {
      // A returning visitor goes straight in.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(false);
      return;
    }
    const t = window.setTimeout(() => setShow(false), 1900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="intro-card fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b]"
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          aria-hidden
        >
          <motion.div className="flex flex-col items-center" exit={{ y: -12, filter: "blur(6px)" }} transition={{ duration: 0.8 }}>
            <motion.svg
              width="76"
              height="76"
              viewBox={MARK_VIEWBOX}
              fill="#ede7dd"
              initial={{ y: 10 }}
              animate={{ y: -4 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.path
                d={MARK_WING}
                fillRule="evenodd"
                style={{ transformOrigin: "640px 540px" }}
                initial={{ opacity: 0, rotate: -18, scale: 0.9 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              />
              <motion.path
                d={MARK_BODY}
                fillRule="evenodd"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
              <motion.path
                d={MARK_TAIL}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
              />
            </motion.svg>
            <motion.p
              className="display mt-5 text-3xl text-[#ede7dd]"
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              Sibi <em className="text-[#bdb6aa]">Kabilan</em>
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

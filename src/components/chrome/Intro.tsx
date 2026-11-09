"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { MARK_BODY, MARK_TAIL, MARK_VIEWBOX, MARK_WING } from "./Mark";
import { unlockPortraitVoice } from "@/lib/portraitVideo";

type Mode = "intro" | "gate" | "off";

/** Crawlers and link-preview fetchers go straight to the page: no card, nothing to dismiss. */
const AUTOMATED = /bot|crawl|spider|slurp|lighthouse|headless|inspection|preview|facebookexternalhit|whatsapp|embedly|pinterest|quora|vkshare|skype/i;

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * A brief hello on the first visit of a session: the dove gathers itself and
 * lifts, the name settles, the page opens.
 *
 * On the home page it waits to be let in, because the portrait further down
 * speaks: browsers only allow sound after a tap, click or key press, so the
 * hello offers that tap. "Enter with sound" (or a tap anywhere) unlocks the
 * voice for the visit; "or enter quietly" keeps it muted. Scrolling or
 * swiping simply goes in, so no one is ever held at the door. Other pages
 * (where search visitors land on an essay or a chapter) keep the short hello
 * that opens by itself.
 */
export function Intro() {
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>("intro");
  const [ready, setReady] = useState(false);
  const [still, setStill] = useState(false);
  const enterButton = useRef<HTMLButtonElement>(null);
  const firstPath = useRef(pathname);

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
    const automated = AUTOMATED.test(navigator.userAgent) || navigator.webdriver === true;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (seen || automated) {
      // A returning visitor (or a crawler) goes straight in.
      setMode("off");
      return;
    }
    setStill(calm);
    if (firstPath.current === "/") {
      setMode("gate");
      const t = window.setTimeout(() => setReady(true), calm ? 0 : 1150);
      return () => window.clearTimeout(t);
    }
    if (calm) {
      setMode("off");
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = window.setTimeout(() => setMode("off"), 1900);
    return () => window.clearTimeout(t);
  }, []);

  const enter = (withSound: boolean) => {
    try {
      localStorage.setItem("sk-sound", withSound ? "on" : "off");
    } catch {
      /* storage unavailable */
    }
    if (withSound) unlockPortraitVoice();
    window.dispatchEvent(new CustomEvent("sk-sound", { detail: withSound }));
    setMode("off");
  };

  // While the door is closed: a scroll or swipe just goes in (sound stays as it was,
  // waiting for a tap), and it doesn't also move the page underneath.
  useEffect(() => {
    if (mode !== "gate") return;
    let startY = 0;
    const stop = (e: Event) => {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
    };
    const onWheel = (e: WheelEvent) => {
      stop(e);
      if (Math.abs(e.deltaY) > 2) setMode("off");
    };
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      stop(e);
      if (Math.abs((e.touches[0]?.clientY ?? startY) - startY) > 12) setMode("off");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") enter(false);
      else if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "End", "Home"].includes(e.key)) {
        stop(e);
        setMode("off");
      }
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "gate" && ready) enterButton.current?.focus({ preventScroll: true });
  }, [mode, ready]);

  // Phone paging leaves the swipe that dismisses this screen alone (see touchSteps).
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "gate") root.dataset.gate = "open";
    else delete root.dataset.gate;
    return () => {
      delete root.dataset.gate;
    };
  }, [mode]);

  const gate = mode === "gate";
  const t = (delay: number, duration = 0.9) => (still ? { duration: 0 } : { duration, ease: EASE, delay });

  return (
    <AnimatePresence>
      {mode !== "off" && (
        <motion.div
          key="intro"
          className={`intro-card fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b] ${gate ? "cursor-pointer" : ""}`}
          style={gate ? { background: "radial-gradient(60% 50% at 50% 46%, #121214, #09090b 70%)" } : undefined}
          exit={{ opacity: 0, transition: { duration: still ? 0.2 : 0.9, ease: "easeInOut" } }}
          onClick={gate ? () => enter(true) : undefined}
          {...(gate
            ? { role: "dialog", "aria-modal": true, "aria-label": "Welcome. Enter Sibi Kabilan's site with sound, or quietly." }
            : { "aria-hidden": true })}
        >
          <motion.div className="flex flex-col items-center" exit={{ y: -12, filter: "blur(6px)" }} transition={{ duration: 0.8 }}>
            <motion.svg
              width="76"
              height="76"
              viewBox={MARK_VIEWBOX}
              fill="#ede7dd"
              aria-hidden
              initial={{ y: 10 }}
              animate={{ y: -4 }}
              transition={t(0, 1.6)}
            >
              <motion.path
                d={MARK_WING}
                fillRule="evenodd"
                style={{ transformOrigin: "640px 540px" }}
                initial={{ opacity: 0, rotate: -18, scale: 0.9 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={t(0.1, 1)}
              />
              <motion.path d={MARK_BODY} fillRule="evenodd" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={t(0.3)} />
              <motion.path d={MARK_TAIL} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={t(0.45)} />
            </motion.svg>
            <motion.p
              className="display mt-5 text-3xl text-[#ede7dd]"
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={t(0.7)}
            >
              Sibi <em className="text-[#bdb6aa]">Kabilan</em>
            </motion.p>

            {gate && (
              <motion.div
                className="mt-12 flex flex-col items-center gap-5"
                initial={{ opacity: 0, y: 10 }}
                animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={t(0, 1)}
                style={{ pointerEvents: ready ? "auto" : "none" }}
              >
                <button
                  ref={enterButton}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    enter(true);
                  }}
                  className="group relative flex items-center gap-3 rounded-full border border-[#ede7dd]/25 bg-white/[0.04] px-6 py-3 text-[15px] tracking-[0.01em] text-[#ede7dd] backdrop-blur-md transition-colors duration-300 hover:border-[#ede7dd]/55 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#ede7dd]/60"
                >
                  <span aria-hidden className="absolute inset-0 animate-[ping_2.6s_ease-out_infinite] rounded-full border border-[#ede7dd]/15" />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" fill="currentColor" />
                    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a7.8 7.8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Enter with sound
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    enter(false);
                  }}
                  className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#ede7dd]/45 transition-colors hover:text-[#ede7dd]/85"
                >
                  or enter quietly
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

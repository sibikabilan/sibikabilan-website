"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAtmosphere } from "@/lib/stores";

const EASE = [0.16, 1, 0.3, 1] as const;

/** A generic application form, and which fields the institution already knows. */
const FIELDS = [
  { label: "Full name", known: true },
  { label: "Date of birth", known: true },
  { label: "PAN", known: true },
  { label: "Address", known: true },
  { label: "Employer", known: true },
  { label: "Monthly income", known: true },
  { label: "Existing loans", known: true },
  { label: "Loan amount", known: false },
  { label: "Tenure", known: false },
  { label: "Property city", known: true },
  { label: "Co applicant", known: true },
  { label: "Documents", known: true },
];

const STAGES = [
  { label: "Static screen · 12 fields", ms: 2600 },
  { label: "The agent reads what's already known", ms: 2600 },
  { label: "Composed for this person · 1 question", ms: 4200 },
];

/**
 * Agentic UI in one loop: a twelve field form the agent reads, collapses
 * everything it already knows, and composes the one question left to ask,
 * with the product's own components. Illustrative, not a product capture.
 */
export function AgenticDemo() {
  const box = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(false);
  const { motion: mode } = useAtmosphere();
  const calm = mode === "calm";

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || calm) return;
    const t = setTimeout(() => setStage((s) => (s + 1) % STAGES.length), STAGES[stage].ms);
    return () => clearTimeout(t);
  }, [stage, visible, calm]);

  const shown = calm ? 2 : stage;

  return (
    <div ref={box} className="relative mx-auto w-full max-w-[440px]">
      <div
        aria-hidden
        className="absolute -inset-y-10 inset-x-0 -z-10 rounded-[40px] blur-3xl md:-inset-x-10"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--beam) 14%, transparent), transparent)" }}
      />
      <div className="overflow-hidden rounded-[22px] border border-[var(--line-strong)] bg-[var(--bg-2)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">Home loan application</span>
          <span className="flex gap-1.5">
            <i className="h-2 w-2 rounded-full bg-white/15" />
            <i className="h-2 w-2 rounded-full bg-white/15" />
            <i className="h-2 w-2 rounded-full bg-white/15" />
          </span>
        </div>

        <div className="relative h-[430px] px-5 py-4">
          {/* the agent's read: a line of light passing over the form */}
          {shown === 1 && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-10 h-16 bg-gradient-to-b from-transparent via-[color-mix(in_oklab,var(--key)_22%,transparent)] to-transparent"
              initial={{ top: "-15%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          )}

          <AnimatePresence mode="popLayout" initial={false}>
            {shown < 2 ? (
              <motion.ul key="form" className="space-y-2" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
                {FIELDS.map((f, i) => (
                  <motion.li
                    key={f.label}
                    className="flex items-center gap-3"
                    animate={
                      shown === 1 && f.known
                        ? { opacity: 0.28, transition: { delay: 0.25 + i * 0.09, duration: 0.4 } }
                        : { opacity: 1 }
                    }
                  >
                    <span className="w-28 shrink-0 text-[12px] text-muted">{f.label}</span>
                    <span className="relative h-6 flex-1 rounded-md border border-line bg-black/20">
                      {shown === 1 && f.known && (
                        <motion.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.25 + i * 0.09, duration: 0.35, ease: EASE }}
                          className="absolute inset-y-[8px] left-2 right-[30%] origin-left rounded-full bg-white/25"
                        />
                      )}
                      {shown === 1 && f.known && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.35 + i * 0.09 }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[var(--key)]"
                        >
                          ✓
                        </motion.span>
                      )}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.div
                key="composed"
                className="flex h-full flex-col justify-center"
                initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">10 of 12 already known</p>
                <p className="display mt-4 text-[2rem] leading-[1.08] text-ink">What monthly payment feels comfortable?</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Under ₹35,000", "₹35,000 to ₹50,000", "Talk it through"].map((c, i) => (
                    <motion.span
                      key={c}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.12, duration: 0.6, ease: EASE }}
                      className={`rounded-full border px-4 py-2 text-[13px] ${i === 1 ? "border-[var(--key)] text-ink" : "border-[var(--line-strong)] text-ink-2"}`}
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 flex items-center gap-3 text-[12.5px] text-muted"
                >
                  <span className="flex h-5 items-end gap-[3px]" aria-hidden>
                    {[0.5, 1, 0.7, 0.9, 0.4].map((h, i) => (
                      <motion.i
                        key={i}
                        className="block w-[3px] rounded-full bg-[var(--key)]"
                        animate={calm ? { height: `${h * 100}%` } : { height: [`${h * 40}%`, `${h * 100}%`, `${h * 40}%`] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </span>
                  Or just say it.
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={shown}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-2"
            >
              {STAGES[shown].label}
            </motion.span>
          </AnimatePresence>
          <span className="flex gap-1.5">
            {STAGES.map((_, i) => (
              <i key={i} className={`block h-px transition-all duration-500 ${i === shown ? "w-6 bg-[var(--key)]" : "w-2.5 bg-white/20"}`} />
            ))}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-faint">Illustration</p>
    </div>
  );
}

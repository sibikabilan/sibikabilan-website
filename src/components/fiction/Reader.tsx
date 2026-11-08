"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { readingKey } from "./ContinueReading";
import { cx } from "@/lib/utils";

type Theme = "night" | "sepia" | "paper";
type Face = "serif" | "sans";
interface Prefs {
  theme: Theme;
  face: Face;
  size: number;
  width: number;
  leading: number;
}

const DEFAULTS: Prefs = { theme: "night", face: "serif", size: 1.2, width: 38, leading: 1.85 };
const PREFS_KEY = "sk-reader-v1";

interface NavChapter {
  slug: string;
  title: string;
}

export function Reader({
  workSlug,
  workTitle,
  number,
  total,
  title,
  summary,
  html,
  prev,
  next,
  wordCount,
}: {
  workSlug: string;
  workTitle: string;
  number: string;
  total: number;
  title: string;
  summary: string;
  html: string;
  prev: NavChapter | null;
  next: NavChapter | null;
  wordCount: number;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
      // Reader preferences live in this browser only.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrefs({ ...DEFAULTS, ...saved });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(readingKey(workSlug), window.location.pathname.split("/").pop() || "");
    } catch {
      /* ignore */
    }
  }, [workSlug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input,textarea,select")) return;
      if (e.key === "ArrowRight" && next) router.push(`/fiction/${workSlug}/${next.slug}`);
      if (e.key === "ArrowLeft" && prev) router.push(`/fiction/${workSlug}/${prev.slug}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router, workSlug]);

  const update = (patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const n = { ...p, ...patch };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(n));
      } catch {
        /* ignore */
      }
      return n;
    });
  };

  return (
    <div
      className="reader relative z-10 min-h-screen"
      data-theme={prefs.theme}
      data-face={prefs.face}
      style={
        {
          "--reader-size": `${prefs.size}rem`,
          "--reader-width": `${prefs.width}rem`,
          "--reader-leading": prefs.leading,
        } as React.CSSProperties
      }
    >
      <ReadingProgress />
      <div className="sticky top-[var(--nav-h)] z-30 border-b border-[color:color-mix(in_oklab,var(--reader-ink)_10%,transparent)] bg-[var(--reader-bg)]/90 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-[1100px] items-center justify-between px-5 text-[12px]" style={{ color: "var(--reader-dim)" }}>
          <Link href={`/fiction/${workSlug}`} className="truncate font-mono uppercase tracking-[0.18em] hover:opacity-80">
            ← {workTitle}
          </Link>
          <div className="relative flex items-center gap-4">
            <span className="hidden font-mono uppercase tracking-[0.18em] sm:inline">
              {number} of {total}
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="rounded-full border px-3 py-1 font-display text-base italic"
              style={{ borderColor: "color-mix(in oklab, var(--reader-ink) 25%, transparent)", color: "var(--reader-ink)" }}
            >
              Aa
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 top-[calc(100%+10px)] w-[290px] rounded-2xl border border-line bg-[#0e0d12]/95 p-5 text-ink shadow-2xl backdrop-blur-xl"
                  data-lenis-prevent
                >
                  <p className="eyebrow mb-3">Page</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["night", "Night", "#0a0a0d", "#e2dcd2"],
                        ["sepia", "Sepia", "#efe4cf", "#3b2f22"],
                        ["paper", "Paper", "#f7f5f0", "#1d1c1a"],
                      ] as const
                    ).map(([id, label, bg, ink]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update({ theme: id })}
                        className={cx("rounded-lg border py-2 text-xs", prefs.theme === id ? "border-[color:var(--key)]" : "border-line")}
                        style={{ background: bg, color: ink }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="eyebrow mb-3 mt-5">Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["serif", "sans"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => update({ face: f })}
                        className={cx(
                          "rounded-lg border py-2 text-sm",
                          f === "serif" ? "font-read" : "font-sans",
                          prefs.face === f ? "border-[color:var(--key)] text-ink" : "border-line text-ink-2"
                        )}
                      >
                        {f === "serif" ? "Serif" : "Sans"}
                      </button>
                    ))}
                  </div>
                  <Slider label="Size" min={0.95} max={1.6} step={0.05} value={prefs.size} onChange={(v) => update({ size: v })} />
                  <Slider label="Width" min={28} max={48} step={1} value={prefs.width} onChange={(v) => update({ width: v })} />
                  <Slider label="Leading" min={1.5} max={2.2} step={0.05} value={prefs.leading} onChange={(v) => update({ leading: v })} />
                  <button type="button" onClick={() => update(DEFAULTS)} className="mt-5 text-xs text-muted underline-offset-4 hover:underline">
                    Reset
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <header className="mx-auto max-w-[900px] px-5 pb-12 pt-20 text-center md:pt-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.34em]" style={{ color: "var(--reader-dim)" }}>
          Chapter {number}
        </p>
        <h1 className="display mt-6 text-[clamp(2.6rem,6vw,5rem)]" style={{ color: "var(--reader-ink)" }}>
          {title}
        </h1>
        {summary && (
          <p className="mx-auto mt-5 max-w-[46ch] font-display text-xl italic" style={{ color: "var(--reader-dim)" }}>
            {summary}
          </p>
        )}
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--reader-dim)" }}>
          {Math.max(1, Math.round(wordCount / 250))} min · {wordCount.toLocaleString()} words
        </p>
      </header>

      <div className="px-5 pb-24">
        <div className="reader-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <nav className="mx-auto grid max-w-[1100px] gap-px px-5 pb-28 md:grid-cols-2" aria-label="Chapters">
        {prev ? (
          <Link href={`/fiction/${workSlug}/${prev.slug}`} className="group rounded-xl p-6 transition-colors hover:bg-white/[0.03]">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--reader-dim)" }}>
              ← Previous
            </span>
            <span className="display mt-2 block text-3xl" style={{ color: "var(--reader-ink)" }}>
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/fiction/${workSlug}/${next.slug}`} className="group rounded-xl p-6 text-right transition-colors hover:bg-white/[0.03]">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--reader-dim)" }}>
              Next chapter →
            </span>
            <span className="display mt-2 block text-3xl" style={{ color: "var(--reader-ink)" }}>
              {next.title}
            </span>
          </Link>
        ) : (
          <div className="p-6 text-right">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--reader-dim)" }}>
              You&apos;re caught up
            </span>
            <span className="display mt-2 block text-3xl italic" style={{ color: "var(--reader-ink)" }}>
              More soon.
            </span>
          </div>
        )}
      </nav>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="eyebrow flex justify-between">
        {label}
        <span className="tabular-nums text-ink-2">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--key)]"
      />
    </label>
  );
}

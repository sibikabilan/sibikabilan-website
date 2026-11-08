"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ATMOSPHERES, ATMOSPHERE_IDS } from "@/lib/atmosphere";
import { updateAtmosphere, useAtmosphere } from "@/lib/stores";
import { cx } from "@/lib/utils";

export function AtmospherePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useAtmosphere();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const trigger = (e.target as HTMLElement).closest("[data-atmosphere-trigger]");
        if (!trigger) onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-label="Atmosphere settings"
          initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-[calc(100%+12px)] w-[min(92vw,340px)] rounded-2xl border border-line bg-[var(--glass)] p-5 shadow-2xl backdrop-blur-xl"
          data-lenis-prevent
        >
          <p className="eyebrow mb-4">Lighting</p>
          <div className="grid grid-cols-2 gap-2">
            {ATMOSPHERE_IDS.map((id) => {
              const a = ATMOSPHERES[id];
              const active = state.atmosphere === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateAtmosphere({ atmosphere: id })}
                  aria-pressed={active}
                  className={cx(
                    "group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-500",
                    active ? "border-[color:var(--key)]" : "border-line hover:border-[var(--line-strong)]"
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
                    style={{
                      background: `radial-gradient(120% 90% at 85% 0%, ${a.key}55, transparent 60%), radial-gradient(90% 80% at 0% 100%, ${a.rim}44, transparent 60%), ${a.bg}`,
                    }}
                  />
                  <span className="relative block text-sm text-ink">{a.label}</span>
                  <span className="relative mt-0.5 block text-[11px] text-muted">{a.note}</span>
                  <span className="relative mt-3 flex gap-1.5">
                    <i className="block h-2 w-2 rounded-full" style={{ background: a.key }} />
                    <i className="block h-2 w-2 rounded-full" style={{ background: a.rim }} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hairline my-5" />

          <Toggle
            label="Motion"
            options={[
              { value: "cinematic", label: "Cinematic" },
              { value: "calm", label: "Calm" },
            ]}
            value={state.motion}
            onChange={(v) => updateAtmosphere({ motion: v as "cinematic" | "calm" })}
          />
          <div className="h-3" />
          <Toggle
            label="Film grain"
            options={[
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
            value={state.grain ? "on" : "off"}
            onChange={(v) => updateAtmosphere({ grain: v === "on" })}
          />
          <p className="mt-5 text-[11px] leading-relaxed text-faint">
            Your choice is remembered on this device.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="eyebrow">{label}</span>
      <div className="flex rounded-full border border-line p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={cx(
              "rounded-full px-3 py-1 text-xs transition-colors duration-300",
              value === o.value ? "bg-[var(--key)] text-[#0a0908]" : "text-ink-2 hover:text-ink"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

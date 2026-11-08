"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { Settings } from "@/lib/cms/types";
import { ATMOSPHERES, ATMOSPHERE_IDS } from "@/lib/atmosphere";
import { cx } from "@/lib/utils";
import { Field, SaveBar, useEditorKeys } from "./fields";

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setS((p) => ({ ...p, [key]: value }));
    setDirty(true);
    setMessage(null);
  }

  function save() {
    setError(null);
    start(async () => {
      const res = await saveSettingsAction(s);
      if (!res.ok) return setError(res.error);
      setDirty(false);
      setMessage("Saved. The site updates on the next visit.");
      router.refresh();
    });
  }
  useEditorKeys(save, dirty);

  const text = (key: keyof Settings, label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      <input value={String(s[key] ?? "")} onChange={(e) => set(key, e.target.value as never)} className="admin-input" />
    </Field>
  );
  const area = (key: keyof Settings, label: string, rows = 3, hint?: string) => (
    <Field label={label} hint={hint}>
      <textarea value={String(s[key] ?? "")} onChange={(e) => set(key, e.target.value as never)} rows={rows} className="admin-input resize-y" />
    </Field>
  );

  return (
    <div className="max-w-3xl space-y-14">
      <section className="space-y-5">
        <h2 className="display text-3xl text-ink">Hero</h2>
        {text("nowStatus", "Status chip", "The small pill above your name.")}
        {text("heroEyebrow", "Line under your name")}
        {area("heroHeadline", "Headline", 2)}
        {area("heroSub", "Introduction", 4)}
      </section>

      <section className="space-y-5">
        <h2 className="display text-3xl text-ink">About you</h2>
        {area("bio", "Bio", 8, "Markdown. Shown in the “person” section of the homepage.")}
        {area("nowList", "Right now", 5, "One per line, as “Label: text”.")}
        {text("location", "Location")}
      </section>

      <section className="space-y-5">
        <h2 className="display text-3xl text-ink">Writing and fiction</h2>
        <div className="flex flex-wrap gap-6">
          <Toggle label="Show writing" value={s.showWriting} onChange={(v) => set("showWriting", v)} />
          <Toggle label="Show fiction" value={s.showFiction} onChange={(v) => set("showFiction", v)} />
        </div>
        {area("writingIntro", "Writing intro", 2)}
        {area("fictionIntro", "Fiction intro", 2)}
      </section>

      <section className="space-y-5">
        <h2 className="display text-3xl text-ink">Contact and links</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {text("email", "Email")}
          {text("companyUrl", "Company URL")}
          {text("linkedin", "LinkedIn")}
          {text("github", "GitHub")}
          {text("x", "X / Twitter")}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="display text-3xl text-ink">Default lighting</h2>
        <p className="text-sm text-muted">Visitors can still pick their own from the Atmosphere menu.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ATMOSPHERE_IDS.map((id) => {
            const a = ATMOSPHERES[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => set("defaultAtmosphere", id)}
                className={cx(
                  "rounded-xl border p-4 text-left transition-colors",
                  s.defaultAtmosphere === id ? "border-[color:var(--key)]" : "border-line hover:border-[var(--line-strong)]"
                )}
                style={{ background: `radial-gradient(100% 80% at 90% 0%, ${a.key}33, transparent 60%), ${a.bg}` }}
              >
                <span className="block text-sm text-ink">{a.label}</span>
                <span className="mt-1 block text-[11px] text-muted">{a.note}</span>
              </button>
            );
          })}
        </div>
      </section>

      <SaveBar saving={saving} message={message} error={error} dirty={dirty} onSave={save} />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-3 text-sm text-ink-2" aria-pressed={value}>
      <span className={cx("relative h-5 w-9 rounded-full transition-colors", value ? "bg-[var(--key)]" : "bg-white/15")}>
        <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-[#0b0b0d] transition-all", value ? "left-[18px]" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

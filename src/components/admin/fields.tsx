"use client";

import { useEffect, useRef, useState } from "react";
import { uploadImage } from "./upload";
import { cx } from "@/lib/utils";
import type { Status } from "@/lib/cms/types";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="admin-label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function StatusToggle({ value, onChange }: { value: Status; onChange: (s: Status) => void }) {
  return (
    <div className="inline-flex rounded-full border border-line p-0.5">
      {(["draft", "published"] as Status[]).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          aria-pressed={value === s}
          className={cx(
            "rounded-full px-3.5 py-1.5 text-xs capitalize transition-colors",
            value === s ? (s === "published" ? "bg-[var(--key)] text-[#0b0b0d]" : "bg-white/[0.1] text-ink") : "text-muted hover:text-ink"
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]",
        status === "published" ? "bg-emerald-400/10 text-emerald-200/90" : "bg-white/[0.06] text-muted"
      )}
    >
      <i className={cx("h-1.5 w-1.5 rounded-full", status === "published" ? "bg-emerald-300" : "bg-white/30")} />
      {status}
    </span>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  aspect = "aspect-[16/9]",
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <span className="admin-label">{label}</span>
      <div
        className={cx("relative overflow-hidden rounded-xl border border-dashed border-[var(--line-strong)] bg-white/[0.02]", aspect)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <button type="button" onClick={() => ref.current?.click()} className="grid h-full w-full place-items-center text-xs text-muted hover:text-ink">
            {busy ? "Uploading…" : "Drop an image or click to upload"}
          </button>
        )}
      </div>
      <div className="mt-2 flex gap-3 text-xs">
        <button type="button" onClick={() => ref.current?.click()} className="text-muted hover:text-ink" disabled={busy}>
          {value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-muted hover:text-red-300">
            Remove
          </button>
        )}
        {error && <span className="text-red-300">{error}</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

/** Cmd/Ctrl+S saves; warns before leaving with unsaved edits. */
export function useEditorKeys(save: () => void, dirty: boolean) {
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [dirty]);
}

export function SaveBar({
  saving,
  message,
  error,
  onSave,
  onDelete,
  viewHref,
  dirty,
}: {
  saving: boolean;
  message: string | null;
  error: string | null;
  onSave: () => void;
  onDelete?: () => void;
  viewHref?: string | null;
  dirty: boolean;
}) {
  return (
    <div className="sticky bottom-4 z-20 mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-[var(--glass)] px-4 py-3 backdrop-blur-xl">
      <button type="button" onClick={onSave} disabled={saving} className="btn btn-key h-10 disabled:opacity-60">
        {saving ? "Saving…" : "Save"}
      </button>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">⌘S</span>
      <span className={cx("text-sm", error ? "text-red-300" : "text-muted")}>
        {error ?? message ?? (dirty ? "Unsaved changes" : "All changes saved")}
      </span>
      <span className="ml-auto flex items-center gap-4 text-sm">
        {viewHref && (
          <a href={viewHref} target="_blank" className="text-muted hover:text-ink">
            View live ↗
          </a>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="text-muted hover:text-red-300">
            Delete
          </button>
        )}
      </span>
    </div>
  );
}

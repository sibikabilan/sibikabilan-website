"use client";

import { useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { uploadImage } from "./upload";
import { cx, wordCount } from "@/lib/utils";

type Mode = "write" | "split" | "preview";

export function MarkdownEditor({
  value,
  onChange,
  variant = "essay",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  variant?: "essay" | "fiction";
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("split");
  const [focus, setFocus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(() => (mode === "write" ? "" : (marked.parse(value || "", { async: false }) as string)), [value, mode]);
  const words = wordCount(value);

  function wrap(before: string, after = before, fallback = "") {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || fallback;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  }

  function linePrefix(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + prefix.length, s + prefix.length);
    });
  }

  function insert(text: string) {
    const el = ref.current;
    const s = el?.selectionStart ?? value.length;
    onChange(value.slice(0, s) + text + value.slice(s));
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      insert(`\n\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n\n`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const tools: { label: string; title: string; run: () => void }[] = [
    { label: "B", title: "Bold", run: () => wrap("**", "**", "bold") },
    { label: "I", title: "Italic", run: () => wrap("*", "*", "italic") },
    { label: "H2", title: "Heading", run: () => linePrefix("## ") },
    { label: "H3", title: "Subheading", run: () => linePrefix("### ") },
    { label: "❝", title: "Quote", run: () => linePrefix("> ") },
    { label: "•", title: "List", run: () => linePrefix("- ") },
    { label: "Link", title: "Link", run: () => wrap("[", "](https://)", "text") },
    { label: variant === "fiction" ? "⁂" : "—", title: "Scene break", run: () => insert("\n\n---\n\n") },
    { label: "</>", title: "Code", run: () => wrap("`", "`", "code") },
  ];

  return (
    <div
      className={cx(
        "flex flex-col overflow-hidden rounded-2xl border border-line bg-[var(--bg-2)]",
        focus && "fixed inset-0 z-[80] rounded-none border-0 bg-[var(--bg)]"
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 py-2">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            onClick={t.run}
            className="min-w-8 rounded-md px-2 py-1 font-mono text-xs text-ink-2 hover:bg-white/[0.06] hover:text-ink"
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-md px-2 py-1 font-mono text-xs text-ink-2 hover:bg-white/[0.06] hover:text-ink"
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Image"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        <div className="ml-auto flex items-center gap-1">
          {(["write", "split", "preview"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cx(
                "rounded-md px-2.5 py-1 text-xs capitalize",
                mode === m ? "bg-white/[0.08] text-ink" : "text-muted hover:text-ink"
              )}
            >
              {m}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFocus((f) => !f)}
            className="ml-2 rounded-md px-2.5 py-1 text-xs text-muted hover:text-ink"
            title="Distraction free"
          >
            {focus ? "Exit focus" : "Focus"}
          </button>
        </div>
      </div>

      <div
        className={cx("grid min-h-[60vh] flex-1", mode === "split" && "md:grid-cols-2", focus && "min-h-0")}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
      >
        {mode !== "preview" && (
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck
            className={cx(
              "h-full min-h-[60vh] w-full resize-none bg-transparent p-6 text-[15px] leading-[1.8] text-ink outline-none placeholder:text-faint",
              variant === "fiction" ? "font-read text-[17px]" : "font-mono text-[13.5px]",
              focus && "mx-auto max-w-[760px] p-10"
            )}
          />
        )}
        {mode !== "write" && (
          <div
            className={cx(
              "overflow-y-auto border-line p-6 md:p-8",
              mode === "split" && "border-t md:border-l md:border-t-0",
              variant === "fiction" ? "reader-body !max-w-none" : "prose-cine !text-base"
            )}
            dangerouslySetInnerHTML={{ __html: html || '<p style="opacity:.4">Nothing to preview yet.</p>' }}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint">
        <span>
          {words.toLocaleString()} words · {Math.max(1, Math.round(words / 230))} min
        </span>
        <span>{error ? <span className="text-red-300">{error}</span> : "Markdown · drop images to upload"}</span>
      </div>
    </div>
  );
}

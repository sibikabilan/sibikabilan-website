"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { marked } from "marked";

marked.setOptions({ breaks: true });

interface PostEditorProps {
  initialValues?: {
    title?: string;
    slug?: string;
    description?: string;
    tags?: string;
    coverUrl?: string;
    content?: string;
    published?: boolean;
  };
  onSubmit: (data: {
    title: string;
    slug: string;
    description: string;
    tags: string;
    coverUrl: string;
    content: string;
    published: boolean;
  }) => Promise<void>;
  submitLabel?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

type Tab = "write" | "preview";

const TOOLBAR_ACTIONS = [
  { label: "B", title: "Bold", wrap: ["**", "**"] },
  { label: "I", title: "Italic", wrap: ["_", "_"] },
  { label: "H2", title: "Heading 2", line: "## " },
  { label: "H3", title: "Heading 3", line: "### " },
  { label: '""', title: "Blockquote", line: "> " },
  { label: "`", title: "Inline code", wrap: ["`", "`"] },
  { label: "```", title: "Code block", block: true },
  { label: "—", title: "Divider", insert: "\n\n---\n\n" },
] as const;

export function PostEditor({
  initialValues = {},
  onSubmit,
  submitLabel = "Publish",
}: PostEditorProps) {
  const [form, setForm] = useState({
    title: initialValues.title ?? "",
    slug: initialValues.slug ?? "",
    description: initialValues.description ?? "",
    tags: initialValues.tags ?? "",
    coverUrl: initialValues.coverUrl ?? "",
    content: initialValues.content ?? "",
    published: initialValues.published ?? false,
  });
  const [tab, setTab] = useState<Tab>("write");
  const [previewHtml, setPreviewHtml] = useState("");
  const [slugTouched, setSlugTouched] = useState(!!initialValues.slug);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab === "preview") {
      const html = marked.parse(form.content) as string;
      setPreviewHtml(html);
    }
  }, [tab, form.content]);

  const applyFormat = useCallback(
    (action: (typeof TOOLBAR_ACTIONS)[number]) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: start, selectionEnd: end, value } = ta;
      const selected = value.slice(start, end);
      let replacement = "";
      let cursorOffset = 0;

      if ("wrap" in action) {
        const [open, close] = action.wrap;
        replacement = selected
          ? `${open}${selected}${close}`
          : `${open}text${close}`;
        cursorOffset = selected ? replacement.length : open.length;
      } else if ("line" in action) {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineContent = value.slice(lineStart, end);
        const alreadyApplied = lineContent.startsWith(action.line);
        const newLine = alreadyApplied
          ? lineContent.slice(action.line.length)
          : action.line + lineContent;
        const newVal =
          value.slice(0, lineStart) + newLine + value.slice(end);
        setForm((f) => ({ ...f, content: newVal }));
        requestAnimationFrame(() => {
          ta.setSelectionRange(
            lineStart + newLine.length,
            lineStart + newLine.length
          );
          ta.focus();
        });
        return;
      } else if ("block" in action) {
        replacement = selected
          ? `\`\`\`\n${selected}\n\`\`\``
          : `\`\`\`\ncode here\n\`\`\``;
        cursorOffset = selected ? replacement.length : 4;
      } else if ("insert" in action) {
        replacement = action.insert;
        cursorOffset = replacement.length;
      }

      const newVal = value.slice(0, start) + replacement + value.slice(end);
      setForm((f) => ({ ...f, content: newVal }));
      requestAnimationFrame(() => {
        const pos = start + cursorOffset;
        ta.setSelectionRange(pos, pos);
        ta.focus();
      });
    },
    []
  );

  const handleTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: end, value } = ta;
      const newVal = value.slice(0, s) + "  " + value.slice(end);
      setForm((f) => ({ ...f, content: newVal }));
      requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
    },
    []
  );

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { url, error: err } = await res.json();
      if (err) throw new Error(err);

      const ta = textareaRef.current;
      const pos = ta ? ta.selectionStart : form.content.length;
      const insertion = `\n![image](${url})\n`;
      const newVal =
        form.content.slice(0, pos) + insertion + form.content.slice(pos);
      setForm((f) => ({ ...f, content: newVal }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleCoverUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { url, error: err } = await res.json();
      if (err) throw new Error(err);
      setForm((f) => ({ ...f, coverUrl: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Meta fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-label mb-2 block">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                title: e.target.value,
                slug: slugTouched ? f.slug : generateSlug(e.target.value),
              }))
            }
            className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
            placeholder="Your post title"
          />
        </div>

        <div>
          <label className="text-label mb-2 block">Slug</label>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            className="w-full border border-border bg-surface px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="text-label mb-2 block">Tags</label>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="AI, Architecture, Agents"
            className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-label mb-2 block">Description</label>
          <input
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
            placeholder="One-sentence summary shown in listings"
          />
        </div>

        {/* Cover image */}
        <div className="sm:col-span-2">
          <label className="text-label mb-2 block">Cover Image</label>
          <div className="flex gap-3">
            <input
              value={form.coverUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, coverUrl: e.target.value }))
              }
              placeholder="https://... or upload →"
              className="flex-1 border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                const inp = document.createElement("input");
                inp.type = "file";
                inp.accept = "image/*";
                inp.onchange = (ev) => {
                  const file = (ev.target as HTMLInputElement).files?.[0];
                  if (file) handleCoverUpload(file);
                };
                inp.click();
              }}
              className="border border-border px-4 py-3 text-sm text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
          {form.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.coverUrl}
              alt="cover preview"
              className="mt-3 h-32 w-full object-cover border border-border"
            />
          )}
        </div>
      </div>

      {/* Content editor */}
      <div>
        <div className="mb-0 flex items-center justify-between">
          <label className="text-label">Content</label>
          <div className="flex">
            {(["write", "preview"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  tab === t
                    ? "bg-foreground text-background"
                    : "border border-border text-muted hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        {tab === "write" && (
          <div className="flex flex-wrap items-center gap-1 border border-b-0 border-border bg-surface px-3 py-2">
            {TOOLBAR_ACTIONS.map((action) => (
              <button
                key={action.title}
                type="button"
                title={action.title}
                onClick={() => applyFormat(action)}
                className="h-7 min-w-[2rem] px-2 text-xs font-mono text-muted transition-colors hover:bg-accent/10 hover:text-accent cursor-pointer"
              >
                {action.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                disabled={uploading}
                title="Insert image"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-7 items-center gap-1 px-2 text-xs text-muted transition-colors hover:bg-accent/10 hover:text-accent disabled:opacity-40 cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {uploading ? "…" : "Image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        )}

        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            required
            rows={24}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            onKeyDown={handleTabKey}
            className="w-full resize-y border border-border bg-background px-5 py-4 font-mono text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
            placeholder="Write in Markdown…"
          />
        ) : (
          <div
            className="editorial-prose min-h-[24rem] border border-border bg-background px-8 py-6"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm((f) => ({ ...f, published: e.target.checked }))
            }
            className="h-4 w-4 accent-accent"
          />
          Publish immediately
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="ml-auto bg-foreground px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-background transition-colors hover:bg-accent disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

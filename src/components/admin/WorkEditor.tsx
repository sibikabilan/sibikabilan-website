"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteChapterAction, deleteWorkAction, moveChapterAction, saveWorkAction } from "@/app/admin/actions";
import { WORK_KINDS, WORK_PROGRESS, type ChapterMeta, type Status } from "@/lib/cms/types";
import { formatDate, slugify } from "@/lib/utils";
import { Field, ImageField, SaveBar, StatusPill, StatusToggle, useEditorKeys } from "./fields";

export interface WorkDraft {
  id?: string;
  title: string;
  slug: string;
  tagline: string;
  synopsis: string;
  genre: string;
  kind: string;
  progress: string;
  cover: string | null;
  status: Status;
}

export function WorkEditor({ initial, chapters }: { initial: WorkDraft; chapters: ChapterMeta[] }) {
  const router = useRouter();
  const [work, setWork] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();
  const [busy, startBusy] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof WorkDraft>(key: K, value: WorkDraft[K]) {
    setWork((w) => {
      const next = { ...w, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setDirty(true);
    setMessage(null);
  }

  function save() {
    setError(null);
    startSave(async () => {
      const res = await saveWorkAction(work);
      if (!res.ok) return setError(res.error);
      setDirty(false);
      setWork((w) => ({ ...w, id: res.data.id, slug: res.data.slug }));
      setMessage(res.data.status === "published" ? "Saved and live" : "Draft saved");
      if (!work.id) router.replace(`/admin/fiction/${res.data.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!work.id) return;
    if (!confirm(`Delete “${work.title}” and all ${chapters.length} chapters? This cannot be undone.`)) return;
    startSave(async () => {
      const res = await deleteWorkAction(work.id!);
      if (!res.ok) return setError(res.error);
      router.push("/admin/fiction");
      router.refresh();
    });
  }

  function move(id: string, delta: -1 | 1) {
    startBusy(async () => {
      const res = await moveChapterAction(work.id!, id, delta);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  function removeChapter(c: ChapterMeta) {
    if (!confirm(`Delete chapter “${c.title}”? This cannot be undone.`)) return;
    startBusy(async () => {
      const res = await deleteChapterAction(work.id!, c.id);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  useEditorKeys(save, dirty);
  const live = initial.status === "published" && initial.id;

  return (
    <div>
      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <input
            value={work.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Story title"
            className="display w-full bg-transparent text-[clamp(2.2rem,4vw,3.6rem)] text-ink outline-none placeholder:text-faint"
          />
          <Field label="Tagline" hint="A single line, set in italics under the title.">
            <input value={work.tagline} onChange={(e) => set("tagline", e.target.value)} className="admin-input" />
          </Field>
          <Field label="Synopsis" hint="Markdown. Shown on the story's page above the contents.">
            <textarea
              value={work.synopsis}
              onChange={(e) => set("synopsis", e.target.value)}
              rows={7}
              className="admin-input resize-y font-read text-[16px] leading-relaxed"
            />
          </Field>

          {work.id ? (
            <section className="pt-4">
              <div className="flex items-center justify-between">
                <h2 className="display text-3xl text-ink">Chapters</h2>
                <Link href={`/admin/fiction/${work.id}/chapters/new`} className="btn btn-key h-10">
                  New chapter
                </Link>
              </div>
              {chapters.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-[var(--line-strong)] p-6 text-sm text-muted">
                  No chapters yet. Start the first one.
                </p>
              ) : (
                <ol className={`mt-6 divide-y divide-[var(--line)] rounded-xl border border-line ${busy ? "opacity-60" : ""}`}>
                  {chapters.map((c, i) => (
                    <li key={c.id} className="flex items-center gap-4 px-4 py-3">
                      <span className="w-6 font-mono text-xs text-faint">{i + 1}</span>
                      <Link href={`/admin/fiction/${work.id}/chapters/${c.id}`} className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] text-ink hover:underline">{c.title}</span>
                        <span className="text-xs text-faint">
                          {c.wordCount.toLocaleString()} words · updated {formatDate(c.updatedAt, "short")}
                        </span>
                      </Link>
                      <StatusPill status={c.status} />
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <button type="button" disabled={i === 0} onClick={() => move(c.id, -1)} className="rounded px-1.5 py-1 hover:bg-white/[0.06] disabled:opacity-30" aria-label="Move up">
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={i === chapters.length - 1}
                          onClick={() => move(c.id, 1)}
                          className="rounded px-1.5 py-1 hover:bg-white/[0.06] disabled:opacity-30"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                        <button type="button" onClick={() => removeChapter(c)} className="rounded px-1.5 py-1 hover:bg-white/[0.06] hover:text-red-300" aria-label="Delete chapter">
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ) : (
            <p className="text-sm text-muted">Save the story once to start adding chapters.</p>
          )}
        </div>

        <aside className="space-y-6">
          <div>
            <span className="admin-label">Status</span>
            <StatusToggle value={work.status} onChange={(s) => set("status", s)} />
            <p className="mt-2 text-xs text-faint">Only published chapters of a published story are visible.</p>
          </div>
          <Field label="URL slug" hint={`/fiction/${work.slug || "…"}`}>
            <input
              value={work.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              className="admin-input font-mono text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Form">
              <select value={work.kind} onChange={(e) => set("kind", e.target.value)} className="admin-input capitalize">
                {WORK_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Progress">
              <select value={work.progress} onChange={(e) => set("progress", e.target.value)} className="admin-input capitalize">
                {WORK_PROGRESS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Genre">
            <input value={work.genre} onChange={(e) => set("genre", e.target.value)} className="admin-input" placeholder="Literary, speculative…" />
          </Field>
          <ImageField label="Cover" value={work.cover} onChange={(url) => set("cover", url)} aspect="aspect-[3/4]" />
        </aside>
      </div>

      <SaveBar
        saving={saving}
        message={message}
        error={error}
        dirty={dirty}
        onSave={save}
        onDelete={work.id ? remove : undefined}
        viewHref={live ? `/fiction/${work.slug}` : null}
      />
    </div>
  );
}

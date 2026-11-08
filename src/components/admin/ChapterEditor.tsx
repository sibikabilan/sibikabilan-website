"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteChapterAction, saveChapterAction } from "@/app/admin/actions";
import type { Status } from "@/lib/cms/types";
import { slugify } from "@/lib/utils";
import { MarkdownEditor } from "./MarkdownEditor";
import { Field, SaveBar, StatusToggle, useEditorKeys } from "./fields";

export interface ChapterDraft {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  status: Status;
  content: string;
}

export function ChapterEditor({
  workId,
  workSlug,
  workTitle,
  workLive,
  number,
  initial,
}: {
  workId: string;
  workSlug: string;
  workTitle: string;
  workLive: boolean;
  number: number;
  initial: ChapterDraft;
}) {
  const router = useRouter();
  const [ch, setCh] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveSlug, setLiveSlug] = useState(initial.status === "published" && workLive ? initial.slug : null);

  function set<K extends keyof ChapterDraft>(key: K, value: ChapterDraft[K]) {
    setCh((c) => {
      const next = { ...c, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setDirty(true);
    setMessage(null);
  }

  function save() {
    setError(null);
    startSave(async () => {
      const res = await saveChapterAction(workId, ch);
      if (!res.ok) return setError(res.error);
      setDirty(false);
      setCh((c) => ({ ...c, id: res.data.id, slug: res.data.slug }));
      setLiveSlug(res.data.status === "published" && workLive ? res.data.slug : null);
      setMessage(
        res.data.status === "published"
          ? workLive
            ? "Saved and live"
            : "Saved. Publish the story to make it visible."
          : "Draft saved"
      );
      if (!ch.id) router.replace(`/admin/fiction/${workId}/chapters/${res.data.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!ch.id || !confirm(`Delete “${ch.title}”? This cannot be undone.`)) return;
    startSave(async () => {
      const res = await deleteChapterAction(workId, ch.id!);
      if (!res.ok) return setError(res.error);
      router.push(`/admin/fiction/${workId}`);
      router.refresh();
    });
  }

  useEditorKeys(save, dirty);

  return (
    <div>
      <Link href={`/admin/fiction/${workId}`} className="eyebrow link-sweep">
        ← {workTitle}
      </Link>
      <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">Chapter {number}</p>
            <input
              value={ch.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Chapter title"
              className="display mt-2 w-full bg-transparent text-[clamp(2.2rem,4vw,3.6rem)] text-ink outline-none placeholder:text-faint"
            />
          </div>
          <MarkdownEditor
            variant="fiction"
            value={ch.content}
            onChange={(v) => set("content", v)}
            placeholder="It begins…"
          />
        </div>
        <aside className="space-y-6">
          <div>
            <span className="admin-label">Status</span>
            <StatusToggle value={ch.status} onChange={(s) => set("status", s)} />
          </div>
          <Field label="URL slug" hint={`/fiction/${workSlug}/${ch.slug || "…"}`}>
            <input
              value={ch.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              className="admin-input font-mono text-sm"
            />
          </Field>
          <Field label="Summary" hint="Optional. Shown under the chapter title and in the contents.">
            <textarea value={ch.summary} onChange={(e) => set("summary", e.target.value)} rows={3} className="admin-input resize-y" />
          </Field>
          <div className="rounded-xl border border-line p-4 text-xs leading-relaxed text-muted">
            <p className="text-ink-2">Writing tips</p>
            <p className="mt-2">Use a line with three dashes for a scene break. The first paragraph gets a drop cap automatically.</p>
          </div>
        </aside>
      </div>
      <SaveBar
        saving={saving}
        message={message}
        error={error}
        dirty={dirty}
        onSave={save}
        onDelete={ch.id ? remove : undefined}
        viewHref={liveSlug ? `/fiction/${workSlug}/${liveSlug}` : null}
      />
    </div>
  );
}

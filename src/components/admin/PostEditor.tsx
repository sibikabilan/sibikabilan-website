"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePostAction, savePostAction } from "@/app/admin/actions";
import type { Status } from "@/lib/cms/types";
import { slugify } from "@/lib/utils";
import { MarkdownEditor } from "./MarkdownEditor";
import { Field, ImageField, SaveBar, StatusToggle, useEditorKeys } from "./fields";

export interface PostDraft {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string;
  cover: string | null;
  status: Status;
  content: string;
}

export function PostEditor({ initial }: { initial: PostDraft }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveSlug, setLiveSlug] = useState(initial.status === "published" ? initial.slug : null);

  function set<K extends keyof PostDraft>(key: K, value: PostDraft[K]) {
    setPost((p) => {
      const next = { ...p, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setDirty(true);
    setMessage(null);
  }

  function save() {
    setError(null);
    startSave(async () => {
      const res = await savePostAction({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        tags: post.tags.split(",").map((t) => t.trim()).filter(Boolean),
        cover: post.cover,
        status: post.status,
        content: post.content,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDirty(false);
      setPost((p) => ({ ...p, id: res.data.id, slug: res.data.slug }));
      setLiveSlug(res.data.status === "published" ? res.data.slug : null);
      setMessage(res.data.status === "published" ? "Saved and live" : "Draft saved");
      if (!post.id) router.replace(`/admin/posts/${res.data.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!post.id || !confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    startSave(async () => {
      const res = await deletePostAction(post.id!);
      if (!res.ok) return setError(res.error);
      router.push("/admin/posts");
      router.refresh();
    });
  }

  useEditorKeys(save, dirty);

  return (
    <div>
      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <input
            value={post.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Title"
            className="display w-full bg-transparent text-[clamp(2.2rem,4vw,3.6rem)] text-ink outline-none placeholder:text-faint"
          />
          <Field label="Excerpt" hint="One or two sentences. Shown in lists, search results, and link previews.">
            <textarea
              value={post.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              className="admin-input resize-y"
            />
          </Field>
          <MarkdownEditor value={post.content} onChange={(v) => set("content", v)} placeholder="Start writing…" />
        </div>

        <aside className="space-y-6">
          <div>
            <span className="admin-label">Status</span>
            <StatusToggle value={post.status} onChange={(s) => set("status", s)} />
          </div>
          <Field label="URL slug" hint={`/blog/${post.slug || "…"}`}>
            <input
              value={post.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              className="admin-input font-mono text-sm"
            />
          </Field>
          <Field label="Tags" hint="Comma separated.">
            <input value={post.tags} onChange={(e) => set("tags", e.target.value)} className="admin-input" />
          </Field>
          <ImageField label="Cover image" value={post.cover} onChange={(url) => set("cover", url)} />
        </aside>
      </div>

      <SaveBar
        saving={saving}
        message={message}
        error={error}
        dirty={dirty}
        onSave={save}
        onDelete={post.id ? remove : undefined}
        viewHref={liveSlug ? `/blog/${liveSlug}` : null}
      />
    </div>
  );
}

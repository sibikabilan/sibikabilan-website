"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PostMeta } from "@/lib/blob";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/admin/posts");
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  async function togglePublished(post: PostMeta) {
    await fetch(`/api/admin/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Blog Posts</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/blog/new"
            className="bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            New Post
          </Link>
          <button
            onClick={handleLogout}
            className="border border-border px-5 py-2.5 text-sm text-muted transition-colors hover:text-foreground cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <hr className="editorial-rule mb-8" />

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-muted">No posts yet — create your first one.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 border border-border px-5 py-4 transition-colors hover:border-accent/30"
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-lg font-bold truncate">{post.title}</h2>
                <div className="mt-1 flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-muted">{post.slug}</span>
                  <time className="font-mono text-xs text-muted">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </time>
                  {post.tags.length > 0 && (
                    <span className="font-mono text-xs text-muted">
                      {post.tags.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Published toggle */}
                <button
                  onClick={() => togglePublished(post)}
                  title={post.published ? "Published — click to unpublish" : "Draft — click to publish"}
                  className={`h-7 rounded-full px-3 text-xs font-medium transition-colors cursor-pointer ${
                    post.published
                      ? "bg-accent/15 text-accent hover:bg-accent/25"
                      : "bg-border text-muted hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  {post.published ? "Published" : "Draft"}
                </button>

                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="h-7 px-2 text-xs text-muted transition-colors hover:text-accent"
                  title="View post"
                >
                  ↗
                </Link>

                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="h-7 px-3 text-xs text-muted border border-border transition-colors hover:border-accent/40 hover:text-foreground"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deleting === post.id}
                  className="h-7 px-3 text-xs text-muted border border-border transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-40 cursor-pointer"
                >
                  {deleting === post.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

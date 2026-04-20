"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import type { Post } from "@/lib/blob";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data.post ?? null);
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(data: {
    title: string;
    slug: string;
    description: string;
    tags: string;
    coverUrl: string;
    content: string;
    published: boolean;
  }) {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Failed to update post");
    }
    router.push("/admin/blog");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <Link
        href="/admin/blog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-accent"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to posts
      </Link>

      <h1 className="font-serif text-3xl font-bold">Edit Post</h1>
      <hr className="editorial-rule my-6" />

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !post ? (
        <p className="text-muted">Post not found.</p>
      ) : (
        <PostEditor
          initialValues={{
            title: post.title,
            slug: post.slug,
            description: post.description,
            tags: post.tags.join(", "),
            coverUrl: post.coverUrl ?? "",
            content: post.content,
            published: post.published,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
}

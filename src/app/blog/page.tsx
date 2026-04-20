import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, type PostMeta } from "@/lib/blob";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on AI architecture, entrepreneurship, and building products that scale.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="mb-16">
          <div className="mb-4 flex items-center gap-4">
            <span className="text-label">Blog</span>
            <hr className="editorial-rule-gold" />
          </div>
          <h1 className="text-display">Thoughts & Writing</h1>
          <p className="mt-4 max-w-lg text-editorial-body">
            Ideas on AI, entrepreneurship, and building products.
          </p>
        </div>
        <hr className="editorial-rule mb-12" />
        <p className="text-muted">No posts yet — check back soon.</p>
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <div className="mb-16">
        <div className="mb-4 flex items-center gap-4">
          <span className="text-label">Blog</span>
          <hr className="editorial-rule-gold" />
        </div>
        <h1 className="text-display">Thoughts & Writing</h1>
        <p className="mt-4 max-w-lg text-editorial-body">
          Ideas on AI, entrepreneurship, and building products.
        </p>
      </div>

      <hr className="editorial-rule mb-12" />

      <FeaturedPost post={featured} />

      {rest.length > 0 && (
        <>
          <hr className="editorial-rule-thin mb-12" />
          <div className="grid gap-8 md:grid-cols-2">
            {rest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeaturedPost({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group mb-12 block">
      <article className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="relative aspect-[16/9] overflow-hidden border border-border bg-surface">
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-4xl text-muted/30">{post.title[0]}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-accent" />
        </div>
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-label">{tag}</span>
            ))}
          </div>
          <h2 className="font-serif text-2xl font-bold leading-tight transition-colors group-hover:text-accent md:text-3xl">
            {post.title}
          </h2>
          <p className="mt-3 text-editorial-body">{post.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <time className="font-mono text-xs text-muted">{formatDate(post.createdAt)}</time>
            <span className="font-mono text-xs text-muted">{post.readingTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="border border-border bg-surface transition-colors hover:border-accent/30">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface">
          {post.coverUrl ? (
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-4xl text-muted/30">{post.title[0]}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-accent" />
        </div>
        <div className="p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-label">{tag}</span>
            ))}
          </div>
          <h2 className="font-serif text-xl font-bold leading-snug transition-colors group-hover:text-accent">
            {post.title}
          </h2>
          <p className="mt-2 text-sm text-muted">{post.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <time className="font-mono text-xs text-muted">{formatDate(post.createdAt)}</time>
            <span className="font-mono text-xs text-muted">{post.readingTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

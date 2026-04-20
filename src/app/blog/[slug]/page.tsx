import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPost, getPublishedPosts } from "@/lib/blob";
import { markdownToHtml } from "@/lib/markdown";
import { blogPostSchema } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.description,
    openGraph: post.coverUrl ? { images: [post.coverUrl] } : undefined,
  };
}

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  const html = await markdownToHtml(post.content);

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            blogPostSchema({
              title: post.title,
              description: post.description,
              date: post.createdAt,
              slug,
            })
          ),
        }}
      />
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>

        <header className="mb-12">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-label">{tag}</span>
            ))}
          </div>
          <h1 className="text-display">{post.title}</h1>
          {post.description && (
            <p className="mt-4 text-xl text-muted leading-relaxed">{post.description}</p>
          )}
          <div className="mt-5 flex items-center gap-4">
            <time className="font-mono text-xs text-muted">{formattedDate}</time>
            <span className="font-mono text-xs text-muted">{post.readingTime} min read</span>
          </div>
          <hr className="editorial-rule mt-8" />
        </header>

        {post.coverUrl && (
          <div className="relative mb-12 aspect-[16/9] overflow-hidden border border-border">
            <Image src={post.coverUrl} alt={post.title} fill className="object-cover" />
            <div className="absolute bottom-0 left-0 h-1 w-full bg-accent" />
          </div>
        )}

        <div
          className="editorial-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16">
          <hr className="editorial-rule" />
          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all posts
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

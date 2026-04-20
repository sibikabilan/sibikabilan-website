import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalRule } from "@/components/ui/HorizontalRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts, type PostMeta } from "@/lib/blob";

export async function BlogPreview() {
  let posts: PostMeta[] = [];
  try {
    posts = (await getPublishedPosts()).slice(0, 3);
  } catch {
    // Blob not configured yet — render empty state gracefully
  }

  return (
    <SectionWrapper id="blog-preview">
      <HorizontalRule className="mb-16" />

      <SectionHeading
        label="Latest Writing"
        title="Thoughts & Ideas"
        description="On AI, entrepreneurship, and building products."
      />

      {posts.length === 0 ? (
        <p className="text-muted">No posts yet.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 0.06}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="flex h-full flex-col border border-border bg-surface transition-colors hover:border-accent/30">
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
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-label">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-serif text-lg font-bold leading-snug transition-colors group-hover:text-accent">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted">{post.description}</p>
                    <time className="mt-3 block font-mono text-xs text-muted">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}

      <div className="mt-12">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
        >
          View all posts
          <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </SectionWrapper>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPost, getPublishedPosts } from "@/lib/cms/queries";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedPost(slug);
  if (!data) return { title: "Not found" };
  const { post } = data;
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublishedPost(slug);
  if (!data) notFound();
  const { post, content, newer, older } = data;
  const html = await markdownToHtml(content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    image: post.cover ?? undefined,
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  return (
    <article data-scene="threads" data-scene-side="0" data-scene-opacity="0.18">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ReadingProgress />
      <header className="mx-auto max-w-[980px] px-5 pt-[calc(var(--nav-h)+5rem)] text-center md:px-10 md:pt-[calc(var(--nav-h)+7rem)]">
        <Reveal>
          <Link href="/blog" className="eyebrow link-sweep">
            ← Writing
          </Link>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="display mx-auto mt-8 max-w-[18ch] text-[clamp(2.8rem,7vw,6rem)] text-ink">{post.title}</h1>
        </Reveal>
        {post.excerpt && (
          <Reveal delay={0.1} className="lede mx-auto mt-6 max-w-[640px]">
            {post.excerpt}
          </Reveal>
        )}
        <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingTime} min read</span>
          {post.tags.map((t) => (
            <span key={t} className="text-faint">#{t}</span>
          ))}
        </Reveal>
      </header>

      {post.cover && (
        <Reveal delay={0.2} className="mx-auto mt-14 max-w-[1200px] px-5 md:px-10">
          <div className="grade overflow-hidden rounded-xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt="" className="w-full object-cover" />
          </div>
        </Reveal>
      )}

      <div className="mx-auto max-w-[720px] px-5 py-16 md:py-24">
        <div className="prose-cine" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="hairline mt-20" />
        <p className="mt-8 text-center font-display text-2xl italic text-muted">Thanks for reading.</p>
      </div>

      {(newer || older) && (
        <nav className="mx-auto grid max-w-[1200px] gap-px border-y border-line bg-[var(--line)] md:grid-cols-2" aria-label="More writing">
          {[older, newer].map((p, i) =>
            p ? (
              <Link key={p.id} href={`/blog/${p.slug}`} className={`group bg-[var(--bg)] p-8 md:p-12 ${i === 1 ? "md:text-right" : ""}`}>
                <span className="eyebrow">{i === 0 ? "← Older" : "Newer →"}</span>
                <span className="display mt-3 block text-3xl text-ink transition-colors duration-500 group-hover:text-[color:var(--key)]">
                  {p.title}
                </span>
              </Link>
            ) : (
              <span key={i} className="bg-[var(--bg)]" />
            )
          )}
        </nav>
      )}
      <div className="h-24" />
    </article>
  );
}

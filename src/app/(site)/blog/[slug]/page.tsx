import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPost, getPublishedPosts } from "@/lib/cms/queries";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate, wordCount } from "@/lib/utils";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";
import { AUTHOR, IDS, absoluteUrl, brandTitle, breadcrumbNode, graph, pageMeta, shareImageNode, snippet } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

const NOT_FOUND: Metadata = { title: "Page not found", robots: { index: false } };

function postDescription(excerpt: string, content: string) {
  return snippet(excerpt || content, `An essay by ${SITE.name}.`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedPost(slug);
  if (!data) return NOT_FOUND;
  const { post, content } = data;
  return pageMeta({
    title: brandTitle(post.title, `An essay by ${SITE.name}`),
    socialTitle: post.title,
    description: postDescription(post.excerpt, content),
    path: `/blog/${post.slug}`,
    type: "article",
    image: post.cover ? { url: post.cover, alt: post.title } : null,
    article: { publishedTime: post.publishedAt, modifiedTime: post.updatedAt, tags: post.tags },
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublishedPost(slug);
  if (!data) notFound();
  const { post, content, newer, older } = data;
  const html = await markdownToHtml(content);

  const url = absoluteUrl(`/blog/${post.slug}`);
  const jsonLd = graph(
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: postDescription(post.excerpt, content),
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      datePublished: post.publishedAt ?? post.createdAt,
      dateModified: post.updatedAt,
      wordCount: wordCount(content),
      timeRequired: `PT${post.readingTime}M`,
      keywords: post.tags.length ? post.tags.join(", ") : undefined,
      inLanguage: "en",
      image: [shareImageNode(post.cover ? { url: post.cover, alt: post.title } : null)],
      author: AUTHOR,
      publisher: AUTHOR,
      isPartOf: { "@type": "Blog", "@id": IDS.blog, name: `The blog of ${SITE.name}`, url: absoluteUrl("/blog") },
      isAccessibleForFree: true,
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ])
  );

  return (
    <article data-scene="network" data-scene-side="0" data-scene-opacity="0.18">
      <JsonLd data={jsonLd} />
      <ReadingProgress />
      <header className="mx-auto max-w-[980px] px-5 pt-[calc(var(--nav-h)+5rem)] text-center md:px-10 md:pt-[calc(var(--nav-h)+7rem)]">
        <Reveal immediate>
          <Link href="/blog" className="eyebrow link-sweep">
            ← Blog
          </Link>
        </Reveal>
        <Reveal immediate delay={0.05}>
          <h1 className="display mx-auto mt-8 max-w-[18ch] text-[clamp(2.8rem,7vw,6rem)] text-ink">{post.title}</h1>
        </Reveal>
        {post.excerpt && (
          <Reveal immediate delay={0.1} className="lede mx-auto mt-6 max-w-[640px]">
            {post.excerpt}
          </Reveal>
        )}
        <Reveal immediate delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingTime} min read</span>
          {post.tags.map((t) => (
            <span key={t} className="text-faint">#{t}</span>
          ))}
        </Reveal>
      </header>

      {post.cover && (
        <Reveal immediate delay={0.2} className="mx-auto mt-14 max-w-[1200px] px-5 md:px-10">
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

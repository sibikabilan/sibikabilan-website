import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPosts, getSettings } from "@/lib/cms/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { AUTHOR, IDS, absoluteUrl, breadcrumbNode, graph, pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

const TITLE = "Writing: essays on Agentic UI and AI agents";
const DESCRIPTION =
  "Essays by Sibi Kabilan, founder of SuprAgent, on Agentic UI, putting AI agents into production, and building companies and products people rely on.";

export const metadata = pageMeta({
  title: `${TITLE} · ${SITE.name}`,
  socialTitle: TITLE,
  description: DESCRIPTION,
  path: "/blog",
});

export default async function BlogIndex() {
  const [settings, posts] = await Promise.all([getSettings(), getPublishedPosts()]);
  if (!settings.showWriting) notFound();
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags))).slice(0, 12);

  const jsonLd = graph(
    {
      "@type": "Blog",
      "@id": IDS.blog,
      url: absoluteUrl("/blog"),
      name: `Writing by ${SITE.name}`,
      description: DESCRIPTION,
      inLanguage: "en",
      author: AUTHOR,
      publisher: { "@id": IDS.person },
      isPartOf: { "@id": IDS.website },
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        "@id": `${absoluteUrl(`/blog/${p.slug}`)}#article`,
        headline: p.title,
        url: absoluteUrl(`/blog/${p.slug}`),
        datePublished: p.publishedAt ?? undefined,
        dateModified: p.updatedAt,
        author: AUTHOR,
      })),
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Writing", path: "/blog" },
    ])
  );

  return (
    <div data-scene="network" data-scene-side="1" data-scene-opacity="0.5">
      <JsonLd data={jsonLd} />
      <PageHeader
        eyebrow="Writing"
        title="Notes from the build."
        italic={["build"]}
        lede={settings.writingIntro}
        image="/media/desk.webp"
        imageAlt="A notebook and pen on a desk at night"
      />

      <section className="mx-auto max-w-[1400px] px-5 pb-32 md:px-10">
        {tags.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
                {t}
              </span>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <Reveal className="rounded-2xl border border-dashed border-[var(--line-strong)] p-10 md:p-16">
            <p className="eyebrow">On the desk</p>
            <p className="display mt-4 max-w-[20ch] text-5xl text-ink">The first essays are being written.</p>
            <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed text-muted">
              Subscribe with <Link href="/rss.xml" className="link-sweep text-ink-2">RSS</Link> and they&apos;ll find you.
            </p>
          </Reveal>
        ) : (
          <ul className="border-t border-line">
            {posts.map((p, i) => (
              <Reveal as="li" key={p.id} delay={Math.min(i, 6) * 0.05} className="border-b border-line">
                <Link href={`/blog/${p.slug}`} className="group grid gap-6 py-10 md:grid-cols-[180px_1fr_260px] md:items-center md:gap-10">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {formatDate(p.publishedAt)}
                    <span className="mt-1 block text-faint">{p.readingTime} min read</span>
                  </span>
                  <span>
                    <span className="display block text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.02] text-ink transition-colors duration-500 group-hover:text-[color:var(--key)]">
                      {p.title}
                    </span>
                    {p.excerpt && <span className="mt-3 block max-w-[65ch] text-[15.5px] leading-relaxed text-muted">{p.excerpt}</span>}
                  </span>
                  {p.cover ? (
                    <span className="grade relative hidden aspect-[4/3] overflow-hidden rounded-lg border border-line md:block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                    </span>
                  ) : (
                    <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-faint md:block md:text-right">
                      Read →
                    </span>
                  )}
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

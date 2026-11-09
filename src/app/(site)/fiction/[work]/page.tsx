import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedWork, getPublishedWorks, type PublicWork } from "@/lib/cms/queries";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate, spellNumber } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Book } from "@/components/fiction/Book";
import { ContinueReading } from "@/components/fiction/ContinueReading";
import bookStyles from "@/components/fiction/book.module.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { AUTHOR, absoluteUrl, brandTitle, breadcrumbNode, graph, pageMeta, plainText, shareImageNode, snippet } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ work: string }> };

export async function generateStaticParams() {
  const works = await getPublishedWorks();
  return works.map((w) => ({ work: w.slug }));
}

const sentence = (s: string) => (s && !/[.!?…]["”’)]*$/.test(s.trim()) ? `${s.trim()}.` : s.trim());

function workDescription(work: PublicWork) {
  const about = [sentence(work.tagline), plainText(work.synopsis)].filter(Boolean).join(" ");
  const tail = `A ${work.kind} by ${SITE.name}, free to read.`;
  return snippet(about || `A ${work.kind}${work.genre ? ` (${work.genre})` : ""} by ${SITE.name}, published a chapter at a time.`, tail);
}

const lastUpdate = (work: PublicWork) =>
  [work.updatedAt, ...work.chapters.map((c) => c.updatedAt)].sort().at(-1) ?? work.updatedAt;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { work: slug } = await params;
  const work = await getPublishedWork(slug);
  if (!work) return { title: "Page not found", robots: { index: false } };
  return pageMeta({
    title: brandTitle(work.title, `A ${work.kind} by ${SITE.name}`),
    socialTitle: work.title,
    description: workDescription(work),
    path: `/fiction/${work.slug}`,
    type: "book",
    image: work.cover ? { url: work.cover, alt: `The cover of ${work.title}` } : null,
    article: { tags: work.genre ? [work.genre] : undefined },
  });
}

export default async function WorkPage({ params }: Props) {
  const { work: slug } = await params;
  const work = await getPublishedWork(slug);
  if (!work) notFound();
  const synopsis = work.synopsis ? await markdownToHtml(work.synopsis) : "";
  const words = work.chapters.reduce((n, c) => n + c.wordCount, 0);
  const first = work.chapters[0];

  const url = absoluteUrl(`/fiction/${work.slug}`);
  const jsonLd = graph(
    {
      "@type": "Book",
      "@id": `${url}#book`,
      name: work.title,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      description: workDescription(work),
      ...(work.tagline ? { alternativeHeadline: work.tagline } : {}),
      ...(work.genre ? { genre: work.genre } : {}),
      bookFormat: "https://schema.org/EBook",
      inLanguage: "en",
      image: shareImageNode(work.cover ? { url: work.cover, alt: `The cover of ${work.title}` } : null),
      author: AUTHOR,
      publisher: AUTHOR,
      datePublished: work.publishedAt ?? undefined,
      dateModified: lastUpdate(work),
      creativeWorkStatus: work.progress,
      ...(words ? { wordCount: words } : {}),
      isAccessibleForFree: true,
      hasPart: work.chapters.map((c, i) => ({
        "@type": "Chapter",
        "@id": `${url}/${c.slug}#chapter`,
        name: c.title,
        url: `${url}/${c.slug}`,
        position: i + 1,
      })),
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Fiction", path: "/fiction" },
      { name: work.title, path: `/fiction/${work.slug}` },
    ])
  );

  return (
    <div data-scene="network" data-scene-side="-1" data-scene-opacity="0.35">
      <JsonLd data={jsonLd} />
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-20 pt-[calc(var(--nav-h)+4rem)] md:grid-cols-[minmax(240px,380px)_1fr] md:gap-20 md:px-10 md:pt-[calc(var(--nav-h)+6rem)]">
        <Reveal immediate>
          <div className={`${bookStyles.standingWrap} relative flex justify-center pb-10 pt-4`}>
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-6 -top-10 bottom-0 bg-[radial-gradient(55%_55%_at_50%_45%,color-mix(in_oklab,var(--key)_9%,transparent),transparent_75%)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-1/2 h-7 w-[min(260px,70%)] -translate-x-1/2 rounded-[50%] bg-black/80 blur-xl"
            />
            <Book
              slug={work.slug}
              title={work.title}
              cover={work.cover}
              kind={work.kind}
              width="clamp(200px, 20vw, 290px)"
              className={bookStyles.standing}
            />
          </div>
        </Reveal>
        <div className="md:pt-6">
          <Reveal immediate>
            <Link href="/fiction" className="eyebrow link-sweep">
              ← The library
            </Link>
          </Reveal>
          <Reveal immediate delay={0.05}>
            <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.24em] text-muted">
              A {work.kind}
              {work.genre ? ` · ${work.genre}` : ""} · {work.progress}
            </p>
            <h1 className="display mt-4 text-[clamp(3rem,7vw,6.5rem)] text-ink">{work.title}</h1>
            {work.tagline && <p className="mt-4 font-display text-2xl italic text-ink-2">{work.tagline}</p>}
          </Reveal>
          {synopsis && (
            <Reveal immediate delay={0.1}>
              <div className="prose-cine mt-8 max-w-[62ch] text-[1.08rem]" dangerouslySetInnerHTML={{ __html: synopsis }} />
            </Reveal>
          )}
          <Reveal immediate delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
            {first ? (
              <>
                <ContinueReading workSlug={work.slug} chapters={work.chapters.map((c) => ({ slug: c.slug, title: c.title }))} />
                <Link href={`/fiction/${work.slug}/${first.slug}`} className="btn btn-ghost">
                  From the beginning
                </Link>
              </>
            ) : (
              <span className="text-sm text-muted">The first chapter is on its way.</span>
            )}
            {words > 0 && (
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
                {words.toLocaleString()} words · {Math.max(1, Math.round(words / 250))} min
              </span>
            )}
          </Reveal>
        </div>
      </section>

      {work.chapters.length > 0 && (
        <section className="mx-auto max-w-[1000px] px-5 pb-32 md:px-10">
          <Reveal>
            <p className="eyebrow">Contents</p>
          </Reveal>
          <ol className="mt-6 border-t border-line">
            {work.chapters.map((c, i) => (
              <Reveal as="li" key={c.id} delay={Math.min(i, 8) * 0.04} className="border-b border-line">
                <Link href={`/fiction/${work.slug}/${c.slug}`} className="group grid grid-cols-[90px_1fr_auto] items-baseline gap-6 py-6">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">
                    {i < 20 ? spellNumber(i + 1) : i + 1}
                  </span>
                  <span>
                    <span className="display block text-3xl text-ink transition-colors duration-500 group-hover:text-[color:var(--key)]">
                      {c.title}
                    </span>
                    {c.summary && <span className="mt-1 block text-[14.5px] italic text-muted">{c.summary}</span>}
                  </span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-faint sm:block">
                    {formatDate(c.publishedAt, "short")}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedWork, getPublishedWorks } from "@/lib/cms/queries";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate, spellNumber } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { WorkCover } from "@/components/fiction/WorkCover";
import { ContinueReading } from "@/components/fiction/ContinueReading";

type Props = { params: Promise<{ work: string }> };

export async function generateStaticParams() {
  const works = await getPublishedWorks();
  return works.map((w) => ({ work: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { work: slug } = await params;
  const work = await getPublishedWork(slug);
  if (!work) return { title: "Not found" };
  return {
    title: work.title,
    description: work.tagline || `A ${work.kind} by Sibi Kabilan.`,
    alternates: { canonical: `/fiction/${work.slug}` },
    openGraph: { title: work.title, description: work.tagline, images: work.cover ? [{ url: work.cover }] : undefined },
  };
}

export default async function WorkPage({ params }: Props) {
  const { work: slug } = await params;
  const work = await getPublishedWork(slug);
  if (!work) notFound();
  const synopsis = work.synopsis ? await markdownToHtml(work.synopsis) : "";
  const words = work.chapters.reduce((n, c) => n + c.wordCount, 0);
  const first = work.chapters[0];

  return (
    <div data-scene="book" data-scene-side="-1" data-scene-opacity="0.35">
      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-20 pt-[calc(var(--nav-h)+4rem)] md:grid-cols-[minmax(240px,380px)_1fr] md:gap-20 md:px-10 md:pt-[calc(var(--nav-h)+6rem)]">
        <Reveal>
          <WorkCover title={work.title} cover={work.cover} />
        </Reveal>
        <div className="md:pt-6">
          <Reveal>
            <Link href="/fiction" className="eyebrow link-sweep">
              ← The library
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.24em] text-muted">
              A {work.kind}
              {work.genre ? ` · ${work.genre}` : ""} · {work.progress}
            </p>
            <h1 className="display mt-4 text-[clamp(3rem,7vw,6.5rem)] text-ink">{work.title}</h1>
            {work.tagline && <p className="mt-4 font-display text-2xl italic text-ink-2">{work.tagline}</p>}
          </Reveal>
          {synopsis && (
            <Reveal delay={0.1}>
              <div className="prose-cine mt-8 max-w-[62ch] text-[1.08rem]" dangerouslySetInnerHTML={{ __html: synopsis }} />
            </Reveal>
          )}
          <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
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

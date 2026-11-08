import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedChapter, getPublishedWorks } from "@/lib/cms/queries";
import { markdownToHtml } from "@/lib/markdown";
import { spellNumber } from "@/lib/utils";
import { Reader } from "@/components/fiction/Reader";

type Props = { params: Promise<{ work: string; chapter: string }> };

export async function generateStaticParams() {
  const works = await getPublishedWorks();
  return works.flatMap((w) => w.chapters.map((c) => ({ work: w.slug, chapter: c.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { work, chapter } = await params;
  const data = await getPublishedChapter(work, chapter);
  if (!data) return { title: "Not found" };
  return {
    title: `${data.chapter.title} · ${data.work.title}`,
    description: data.chapter.summary || data.work.tagline || undefined,
    alternates: { canonical: `/fiction/${data.work.slug}/${data.chapter.slug}` },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { work, chapter } = await params;
  const data = await getPublishedChapter(work, chapter);
  if (!data) notFound();
  const html = await markdownToHtml(data.content);

  return (
    <div data-scene="book" data-scene-side="0" data-scene-opacity="0">
      <div className="h-[var(--nav-h)]" />
      <Reader
        workSlug={data.work.slug}
        workTitle={data.work.title}
        number={data.number <= 20 ? spellNumber(data.number) : String(data.number)}
        total={data.work.chapters.length}
        title={data.chapter.title}
        summary={data.chapter.summary}
        html={html}
        wordCount={data.chapter.wordCount}
        prev={data.prev ? { slug: data.prev.slug, title: data.prev.title } : null}
        next={data.next ? { slug: data.next.slug, title: data.next.title } : null}
      />
    </div>
  );
}

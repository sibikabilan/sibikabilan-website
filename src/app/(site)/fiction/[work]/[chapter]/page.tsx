import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedChapter, getPublishedWorks } from "@/lib/cms/queries";
import { markdownToHtml } from "@/lib/markdown";
import { spellNumber } from "@/lib/utils";
import { Reader } from "@/components/fiction/Reader";
import { JsonLd } from "@/components/seo/JsonLd";
import { AUTHOR, absoluteUrl, brandTitle, breadcrumbNode, graph, pageMeta, shareImageNode, snippet } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ work: string; chapter: string }> };

export async function generateStaticParams() {
  const works = await getPublishedWorks();
  return works.flatMap((w) => w.chapters.map((c) => ({ work: w.slug, chapter: c.slug })));
}

type ChapterData = NonNullable<Awaited<ReturnType<typeof getPublishedChapter>>>;

function chapterDescription({ work, chapter, number, content }: ChapterData) {
  const tail = `Chapter ${spellNumber(number).toLowerCase()} of ${work.title}, a ${work.kind} by ${SITE.name}.`;
  return snippet(chapter.summary || content, tail);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { work, chapter } = await params;
  const data = await getPublishedChapter(work, chapter);
  if (!data) return { title: "Page not found", robots: { index: false } };
  return pageMeta({
    title: brandTitle(`${data.chapter.title} · ${data.work.title}`, `Fiction by ${SITE.name}`),
    socialTitle: `${data.chapter.title} · ${data.work.title}`,
    description: chapterDescription(data),
    path: `/fiction/${data.work.slug}/${data.chapter.slug}`,
    type: "article",
    image: data.work.cover ? { url: data.work.cover, alt: `The cover of ${data.work.title}` } : null,
    article: {
      publishedTime: data.chapter.publishedAt,
      modifiedTime: data.chapter.updatedAt,
      tags: data.work.genre ? [data.work.genre] : undefined,
    },
  });
}

export default async function ChapterPage({ params }: Props) {
  const { work, chapter } = await params;
  const data = await getPublishedChapter(work, chapter);
  if (!data) notFound();
  const html = await markdownToHtml(data.content);

  const workUrl = absoluteUrl(`/fiction/${data.work.slug}`);
  const url = `${workUrl}/${data.chapter.slug}`;
  const jsonLd = graph(
    {
      "@type": "Chapter",
      "@id": `${url}#chapter`,
      name: data.chapter.title,
      headline: data.chapter.title,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      position: data.number,
      description: chapterDescription(data),
      isPartOf: { "@type": "Book", "@id": `${workUrl}#book`, name: data.work.title, url: workUrl, author: AUTHOR },
      author: AUTHOR,
      publisher: AUTHOR,
      image: shareImageNode(data.work.cover ? { url: data.work.cover, alt: `The cover of ${data.work.title}` } : null),
      inLanguage: "en",
      ...(data.chapter.wordCount ? { wordCount: data.chapter.wordCount } : {}),
      datePublished: data.chapter.publishedAt ?? data.chapter.createdAt,
      dateModified: data.chapter.updatedAt,
      isAccessibleForFree: true,
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Fiction", path: "/fiction" },
      { name: data.work.title, path: `/fiction/${data.work.slug}` },
      { name: data.chapter.title, path: `/fiction/${data.work.slug}/${data.chapter.slug}` },
    ])
  );

  return (
    <div data-scene="network" data-scene-side="0" data-scene-opacity="0">
      <JsonLd data={jsonLd} />
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

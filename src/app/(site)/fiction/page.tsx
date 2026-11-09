import { notFound } from "next/navigation";
import { getPublishedWorks, getSettings, type PublicWork } from "@/lib/cms/queries";
import { markdownToHtml } from "@/lib/markdown";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { Library } from "@/components/fiction/Library";
import { introWithoutTitle, placeholderVolume, type Volume } from "@/components/fiction/volume";
import { JsonLd } from "@/components/seo/JsonLd";
import { AUTHOR, IDS, absoluteUrl, breadcrumbNode, graph, pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

const TITLE = "Fiction: stories told a chapter at a time";
const DESCRIPTION =
  "Fiction by Sibi Kabilan: stories published a chapter at a time and free to read. Browse the shelf, take a book down, and open it to the first chapter.";

export const metadata = pageMeta({
  title: `${TITLE} · ${SITE.name}`,
  socialTitle: TITLE,
  description: DESCRIPTION,
  path: "/fiction",
});

async function toVolume(w: PublicWork): Promise<Volume> {
  return {
    slug: w.slug,
    title: w.title,
    tagline: w.tagline,
    synopsisHtml: w.synopsis ? await markdownToHtml(w.synopsis) : "",
    genre: w.genre,
    kind: w.kind,
    progress: w.progress,
    cover: w.cover,
    chapters: w.chapters.map((c) => ({
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      minutes: Math.max(1, Math.round(c.wordCount / 250)),
    })),
    words: w.chapters.reduce((n, c) => n + c.wordCount, 0),
  };
}

export default async function FictionLibrary() {
  const [settings, works] = await Promise.all([getSettings(), getPublishedWorks()]);
  if (!settings.showFiction) notFound();

  const volumes = works.length ? await Promise.all(works.map(toVolume)) : [placeholderVolume(settings.fictionIntro)];

  const jsonLd = graph(
    {
      "@type": "CollectionPage",
      "@id": IDS.library,
      url: absoluteUrl("/fiction"),
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en",
      author: AUTHOR,
      isPartOf: { "@id": IDS.website },
      ...(works.length
        ? {
            hasPart: works.map((w) => ({
              "@type": "Book",
              "@id": `${absoluteUrl(`/fiction/${w.slug}`)}#book`,
              name: w.title,
              url: absoluteUrl(`/fiction/${w.slug}`),
              author: AUTHOR,
            })),
          }
        : {}),
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Fiction", path: "/fiction" },
    ])
  );

  return (
    <div data-scene="network" data-scene-side="0" data-scene-opacity="0.3">
      <JsonLd data={jsonLd} />
      <header className="relative mx-auto max-w-[1400px] px-5 pt-[calc(var(--nav-h)+3.5rem)] text-center md:px-10 md:pt-[calc(var(--nav-h)+4rem)]">
        <Reveal immediate>
          <p className="eyebrow">Fiction · The library</p>
        </Reveal>
        <h1 className="display mx-auto mt-5 text-[clamp(2.9rem,6.4vw,6rem)] text-ink">
          <TitleReveal text="And then there are the stories." italicWords={["stories."]} immediate />
        </h1>
        <Reveal immediate delay={0.15} className="lede mx-auto mt-6 max-w-[560px]">
          {introWithoutTitle(settings.fictionIntro)}
        </Reveal>
      </header>

      <section aria-label="The shelf" className="mx-auto max-w-[1400px] pb-28 pt-2 md:pb-36">
        <Library volumes={volumes} />
        <Reveal delay={0.2}>
          <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.26em] text-faint">
            {works.length ? "Take a book down to open it" : "The first book is still being written"}
          </p>
        </Reveal>
      </section>
    </div>
  );
}

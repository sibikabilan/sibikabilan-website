import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedWorks, getSettings } from "@/lib/cms/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WorkCover } from "@/components/fiction/WorkCover";

export const metadata: Metadata = {
  title: "Fiction",
  description: "Stories by Sibi Kabilan, published a chapter at a time.",
  alternates: { canonical: "/fiction" },
};

export default async function FictionLibrary() {
  const [settings, works] = await Promise.all([getSettings(), getPublishedWorks()]);
  if (!settings.showFiction) notFound();

  return (
    <div data-scene="book" data-scene-side="1" data-scene-opacity="0.75">
      <PageHeader
        eyebrow="Fiction · The library"
        title="Elsewhere, I write fiction."
        italic={["fiction"]}
        lede={settings.fictionIntro}
        image="/media/fiction-doorway.webp"
        imageAlt="A figure in a lit doorway as pages drift through a rainy street"
      />
      <section className="mx-auto max-w-[1400px] px-5 pb-32 md:px-10">
        {works.length === 0 ? (
          <Reveal className="grid items-center gap-10 rounded-2xl border border-dashed border-[var(--line-strong)] p-8 md:grid-cols-[280px_1fr] md:p-12">
            <WorkCover title="Untitled" cover={null} />
            <div>
              <p className="eyebrow">In the drafting room</p>
              <p className="display mt-4 max-w-[18ch] text-5xl text-ink">The first chapters are being written.</p>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted">
                Stories will appear here as they&apos;re finished, one chapter at a time. Follow along with{" "}
                <Link href="/rss.xml" className="link-sweep text-ink-2">RSS</Link>.
              </p>
            </div>
          </Reveal>
        ) : (
          <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((w, i) => (
              <Reveal as="li" key={w.id} delay={(i % 3) * 0.08}>
                <Link href={`/fiction/${w.slug}`} className="group block">
                  <WorkCover title={w.title} cover={w.cover} />
                  <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">
                    {w.kind}
                    {w.genre ? ` · ${w.genre}` : ""} · {w.chapters.length} {w.chapters.length === 1 ? "chapter" : "chapters"}
                  </p>
                  <p className="display mt-2 text-4xl leading-tight text-ink transition-colors duration-500 group-hover:text-[color:var(--key)]">
                    {w.title}
                  </p>
                  {w.tagline && <p className="mt-2 text-[15px] italic leading-relaxed text-muted">{w.tagline}</p>}
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{w.progress}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

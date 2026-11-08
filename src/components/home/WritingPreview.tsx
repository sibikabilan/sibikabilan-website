import Image from "next/image";
import Link from "next/link";
import type { PostMeta } from "@/lib/cms/types";
import { formatDate } from "@/lib/utils";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";

export function WritingPreview({ posts, intro }: { posts: PostMeta[]; intro: string }) {
  return (
    <section
      id="writing"
      className="relative px-5 py-28 md:px-10 md:py-36"
      data-scene="galaxy"
      data-scene-side="1"
      data-scene-opacity="0.45"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <p className="eyebrow">Writing</p>
            </Reveal>
            <h2 className="display mt-5 text-[clamp(2.6rem,5.5vw,5rem)] text-ink">
              <TitleReveal text="Notes from the build." italicWords={["build"]} />
            </h2>
            <Reveal delay={0.1} className="lede mt-5 max-w-[520px]">
              {intro}
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <Link href="/blog" className="btn btn-ghost">
              All writing →
            </Link>
          </Reveal>
        </div>

        {posts.length ? (
          <ul className="mt-16 border-t border-line">
            {posts.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.06} className="border-b border-line">
                <Link href={`/blog/${p.slug}`} className="group grid items-center gap-4 py-8 md:grid-cols-[160px_1fr_auto] md:gap-10">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {formatDate(p.publishedAt, "short")}
                  </span>
                  <span>
                    <span className="display block text-[clamp(1.8rem,3vw,2.8rem)] leading-tight text-ink transition-colors duration-500 group-hover:text-[color:var(--key)]">
                      {p.title}
                    </span>
                    {p.excerpt && <span className="mt-2 block max-w-[70ch] text-[15px] text-muted">{p.excerpt}</span>}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint transition-transform duration-500 group-hover:translate-x-1">
                    {p.readingTime} min →
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal className="mt-16 grid items-center gap-8 overflow-hidden rounded-2xl border border-line md:grid-cols-2">
            <div className="grade relative aspect-[16/10] md:aspect-auto md:h-full md:min-h-[320px]">
              <Image src="/media/desk.webp" alt="A notebook and pen on a desk at night" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8 md:p-12">
              <p className="eyebrow">On the desk</p>
              <p className="display mt-4 text-4xl text-ink">The first essays are being written.</p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Agents, interfaces that compose themselves, and what it takes to put AI in front of customers with real
                money on the line.
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

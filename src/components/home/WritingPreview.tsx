import Link from "next/link";
import type { PostMeta } from "@/lib/cms/types";
import { cx, formatDate } from "@/lib/utils";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";

/**
 * The blog, at a glance: the latest few titles with a line each, on one
 * screen. Everything else is on /blog.
 */
export function WritingPreview({ posts, intro }: { posts: PostMeta[]; intro: string }) {
  return (
    <section
      id="blog"
      data-page
      className="relative flex min-h-[100svh] items-center px-5 pb-10 pt-[calc(var(--nav-h)+1.5rem)] md:px-10 md:py-[calc(var(--nav-h)+1rem)]"
      data-scene="network"
      data-scene-side="1"
      data-scene-opacity="0.45"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="w-full md:w-auto">
            <Reveal className="flex items-baseline justify-between gap-6">
              <p className="eyebrow">Blog</p>
              <Link href="/blog" className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-2 md:hidden">
                All posts →
              </Link>
            </Reveal>
            <h2 className="display mt-4 text-[clamp(2.3rem,4.6vw,4.2rem)] text-ink">
              <TitleReveal text="Notes from the build." italicWords={["build"]} />
            </h2>
            <Reveal delay={0.1} className="mt-3 hidden max-w-[520px] text-[15px] leading-relaxed text-muted md:block">
              {intro}
            </Reveal>
          </div>
          <Reveal delay={0.15} className="hidden md:block">
            <Link href="/blog" className="btn btn-ghost">
              The blog →
            </Link>
          </Reveal>
        </div>

        {posts.length ? (
          <ul className="mt-7 grid border-t border-line md:mt-12 md:grid-cols-2 md:gap-x-12">
            {posts.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.06} className={cx("border-b border-line", i > 2 && "max-md:hidden")}>
                <Link href={`/blog/${p.slug}`} className="group block py-4 md:py-7">
                  <span className="flex items-baseline justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] md:text-[10.5px]">
                    <span className="text-faint">
                      {formatDate(p.publishedAt, "short")} · {p.readingTime} min
                    </span>
                    <span className="text-ink-2 transition-transform duration-500 group-hover:translate-x-1">Read →</span>
                  </span>
                  <span className="display mt-1.5 block text-[1.4rem] leading-[1.12] text-ink transition-colors duration-500 group-hover:text-[color:var(--key)] md:text-[clamp(1.6rem,2.2vw,2.1rem)]">
                    {p.title}
                  </span>
                  {p.excerpt && (
                    <span className="mt-1.5 line-clamp-1 max-w-[62ch] text-[13.5px] text-muted md:line-clamp-2 md:text-[14.5px]">{p.excerpt}</span>
                  )}
                </Link>
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] p-8 md:p-12">
            <p className="eyebrow">On the desk</p>
            <p className="display mt-4 text-4xl text-ink">The first essays are being written.</p>
          </Reveal>
        )}

      </div>
    </section>
  );
}

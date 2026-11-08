import Link from "next/link";
import type { PublicWork } from "@/lib/cms/queries";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { CinematicVideo } from "@/components/ui/CinematicVideo";

export function FictionPreview({ works, intro }: { works: PublicWork[]; intro: string }) {
  return (
    <section id="fiction" className="relative">
      <div
        className="grade relative h-[78svh] min-h-[520px] overflow-hidden bg-black"
        data-scene="book"
        data-scene-side="1"
        data-scene-opacity="0"
      >
        <CinematicVideo
          src="/media/fiction-doorway.mp4"
          poster="/media/fiction-doorway-poster.webp"
          label="A figure in a lit doorway as manuscript pages drift through a rainy street"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-black/25 to-[var(--bg)]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-5 pb-16 md:px-10">
          <Reveal>
            <p className="eyebrow text-white/60">Fiction</p>
          </Reveal>
          <h2 className="display mt-5 max-w-[14ch] text-[clamp(3rem,7.5vw,7rem)] text-white">
            <TitleReveal text="Elsewhere, I write fiction." italicWords={["fiction"]} />
          </h2>
        </div>
      </div>

      <div
        className="relative px-5 pb-32 pt-12 md:px-10"
        data-scene="book"
        data-scene-side="1"
        data-scene-opacity="1"
      >
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2">
          <div>
            <Reveal className="lede max-w-[520px]">{intro}</Reveal>

            {works.length ? (
              <ul className="mt-12 border-t border-line">
                {works.slice(0, 4).map((w, i) => (
                  <Reveal as="li" key={w.id} delay={i * 0.06} className="border-b border-line">
                    <Link href={`/fiction/${w.slug}`} className="group block py-7">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">
                        {w.kind}
                        {w.genre ? ` · ${w.genre}` : ""} · {w.chapters.length}{" "}
                        {w.chapters.length === 1 ? "chapter" : "chapters"} · {w.progress}
                      </span>
                      <span className="display mt-2 block text-[clamp(2rem,3.4vw,3rem)] leading-tight text-ink transition-colors duration-500 group-hover:text-[color:var(--key)]">
                        {w.title}
                      </span>
                      {w.tagline && <span className="mt-2 block text-[15px] italic text-muted">{w.tagline}</span>}
                    </Link>
                  </Reveal>
                ))}
              </ul>
            ) : (
              <Reveal delay={0.1} className="mt-12 rounded-2xl border border-dashed border-[var(--line-strong)] p-8">
                <p className="eyebrow">In the drafting room</p>
                <p className="display mt-3 text-3xl text-ink">The first chapters are being written.</p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Pull up a chair. Stories will appear here as they&apos;re finished, one chapter at a time.
                </p>
              </Reveal>
            )}

            <Reveal delay={0.2} className="mt-10">
              <Link href="/fiction" className="btn btn-ghost">
                Enter the library →
              </Link>
            </Reveal>
          </div>
          {/* The particle book renders in this empty column. */}
          <div aria-hidden className="hidden min-h-[460px] lg:block" />
        </div>
      </div>
    </section>
  );
}

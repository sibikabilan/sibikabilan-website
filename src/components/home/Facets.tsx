import Image from "next/image";
import Link from "next/link";
import { FACETS } from "@/lib/site";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";

export function Facets() {
  return (
    <section
      id="facets"
      className="relative px-5 py-28 md:px-10 md:py-40"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.35"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="eyebrow">Three things I do</p>
        </Reveal>
        <h2 className="display mt-6 max-w-[16ch] text-[clamp(2.8rem,6.5vw,6rem)] text-ink">
          <TitleReveal text="I build, I engineer, and I write." italicWords={["write."]} />
        </h2>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {FACETS.map((f, i) => (
            <Reveal key={f.verb} delay={i * 0.1}>
              <Link
                href={f.href}
                className="group relative flex h-full min-h-[520px] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-[var(--bg-2)]"
              >
                <div className="grade absolute inset-0">
                  <Image
                    src={f.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover opacity-55 transition-all duration-[1.6s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105 group-hover:opacity-80"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-transparent" />
                <div className="relative p-7 md:p-8">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] text-faint">{f.n}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {f.cta} →
                    </span>
                  </div>
                  <p className="display mt-4 text-6xl text-ink">{f.verb}</p>
                  <p className="mt-1 font-display text-2xl italic text-ink-2">{f.title}</p>
                  <p className="mt-5 text-[15px] leading-relaxed text-muted">{f.body}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

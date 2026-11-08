import { NOW_WORK } from "@/lib/site";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { CinematicVideo } from "@/components/ui/CinematicVideo";

export function Now({ companyUrl }: { companyUrl: string }) {
  return (
    <section
      id="now"
      className="relative px-5 py-28 md:px-10 md:py-36"
      data-scene="agent"
      data-scene-side="0"
      data-scene-opacity="0.22"
    >
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <Reveal className="grade relative aspect-video overflow-hidden rounded-2xl border border-line bg-black lg:order-2">
          <CinematicVideo
            src="/media/ribbon.mp4"
            poster="/media/ribbon-poster.webp"
            label="A ribbon of light flows from a chat message, through a voice wave, into a phone"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-black/85 to-transparent p-5">
            {NOW_WORK.channels.map((c) => (
              <span key={c} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                {c}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="lg:order-1">
          <Reveal>
            <p className="eyebrow">Now · Company number two</p>
          </Reveal>
          <h2 className="display mt-6 text-[clamp(2.8rem,6vw,5.6rem)] text-ink">
            <TitleReveal text={`Building ${NOW_WORK.name}.`} italicWords={[NOW_WORK.name]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="display mt-6 max-w-[24ch] text-[clamp(1.4rem,2.2vw,2rem)] leading-snug text-ink-2">{NOW_WORK.line}</p>
            <p className="mt-6 max-w-[56ch] text-[15.5px] leading-relaxed text-muted">{NOW_WORK.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <ol className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2">
              {NOW_WORK.steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  {s}
                  {i < NOW_WORK.steps.length - 1 && <span className="text-faint">→</span>}
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-muted">{NOW_WORK.with}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={companyUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Visit supragent.ai ↗
              </a>
              <span className="text-sm text-faint">There&apos;s a live agent there. It picks up.</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

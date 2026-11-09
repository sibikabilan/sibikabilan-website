import Link from "next/link";
import { NOW_WORK } from "@/lib/site";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { AgenticDemo } from "./AgenticDemo";

/** What I'm building now, told through the idea behind it: Agentic UI. */
export function Now({ companyUrl }: { companyUrl: string }) {
  return (
    <section
      id="now"
      className="relative overflow-x-clip px-5 py-28 md:px-10 md:py-36"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.22"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div className="min-w-0">
          <Reveal>
            <p className="eyebrow">Now · Company number two</p>
          </Reveal>
          <h2 className="display mt-6 text-[clamp(2.8rem,6vw,5.6rem)] text-ink">
            <TitleReveal text={`Building ${NOW_WORK.name}.`} italicWords={[NOW_WORK.name]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="display mt-6 max-w-[26ch] text-[clamp(1.45rem,2.3vw,2.1rem)] leading-snug text-ink-2">{NOW_WORK.line}</p>
            <p className="mt-6 max-w-[58ch] text-[16px] leading-relaxed text-muted">{NOW_WORK.body}</p>
          </Reveal>

          <ol className="mt-10 grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
            {NOW_WORK.verbs.map((v, i) => (
              <Reveal as="li" key={v.verb} delay={0.05 * i}>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--key)]">
                  {String(i + 1).padStart(2, "0")} · {v.verb}
                </span>
                <span className="mt-2 block text-[14.5px] leading-relaxed text-ink-2">{v.text}</span>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.15}>
            <p className="mt-10 max-w-[58ch] text-[15px] italic text-muted">{NOW_WORK.not}</p>
            <p className="mt-4 text-sm text-faint">{NOW_WORK.with}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={NOW_WORK.essay.href} className="btn btn-key max-w-full whitespace-normal text-left leading-snug">
                Read: {NOW_WORK.essay.title} →
              </Link>
              <a href={companyUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                supragent.ai ↗
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <AgenticDemo />
        </Reveal>
      </div>
    </section>
  );
}

import Link from "next/link";
import { NOW_WORK } from "@/lib/site";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { AgenticDemo } from "./AgenticDemo";

/**
 * What I'm building now, and what excites me about it, on one screen: the
 * idea in a paragraph, the loop in four words, and on larger screens a small
 * illustration of an Agentic UI at work. On a phone the page settles on it
 * whole (data-page, see touchSteps).
 */
export function Now({ companyUrl }: { companyUrl: string }) {
  return (
    <section
      id="now"
      data-page
      className="relative flex min-h-[100svh] items-center overflow-x-clip px-5 pb-12 pt-[calc(var(--nav-h)+2rem)] md:px-10 md:py-[calc(var(--nav-h)+1rem)]"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.22"
    >
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="min-w-0">
          <Reveal>
            <p className="eyebrow">Now · Company number two</p>
          </Reveal>
          <h2 className="display mt-5 text-[clamp(2.6rem,5.2vw,4.8rem)] text-ink">
            <TitleReveal text={`Building ${NOW_WORK.name}.`} italicWords={[NOW_WORK.name]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="display mt-5 max-w-[26ch] text-[clamp(1.35rem,2vw,1.9rem)] leading-snug text-ink-2">{NOW_WORK.line}</p>
            <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-muted md:text-[16px]">{NOW_WORK.body}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-7 border-t border-line pt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--key)]">
              {NOW_WORK.verbs.map((v) => v.verb).join(" → ")}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a href={companyUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                supragent.ai ↗
              </a>
              <Link href={NOW_WORK.essay.href} className="link-sweep text-[14px] text-ink-2">
                Why I&apos;m betting on it →
              </Link>
            </div>
            <p className="mt-5 text-[13px] text-faint">{NOW_WORK.with}</p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="hidden lg:block">
          <AgenticDemo />
        </Reveal>
      </div>
    </section>
  );
}

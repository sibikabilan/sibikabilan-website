import type { Settings } from "@/lib/cms/types";
import { PRINCIPLES } from "@/lib/site";
import { markdownToHtml } from "@/lib/markdown";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { CodePortrait } from "./CodePortrait";

function parseNow(list: string | undefined) {
  return (list ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      return i > 0 ? { k: line.slice(0, i).trim(), v: line.slice(i + 1).trim() } : { k: "", v: line };
    });
}

export async function Person({ settings }: { settings: Settings }) {
  const bio = await markdownToHtml(settings.bio);
  const now = parseNow(settings.nowList);

  return (
    <section
      id="about"
      className="relative px-5 py-28 md:px-10 md:py-40"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.2"
    >
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal className="relative lg:sticky lg:top-28 lg:self-start">
          <div
            className="relative overflow-hidden rounded-[6px] pt-[6%]"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 40%, color-mix(in oklab, var(--beam) 12%, var(--bg-2)), var(--bg) 75%)",
            }}
          >
            <CodePortrait />
          </div>
          <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.26em] text-faint">
            <span>Sibi Kabilan</span>
            <span>{settings.location}</span>
          </div>
        </Reveal>

        <div className="lg:pt-6">
          <Reveal>
            <p className="eyebrow">The person</p>
          </Reveal>
          <h2 className="display mt-6 text-[clamp(2.6rem,5.5vw,5rem)] text-ink">
            <TitleReveal text="Builder by trade, storyteller by habit." italicWords={["storyteller"]} />
          </h2>
          <Reveal delay={0.1}>
            <div className="prose-cine mt-8 max-w-[60ch] text-[1.08rem]" dangerouslySetInnerHTML={{ __html: bio }} />
          </Reveal>

          {now.length > 0 && (
            <Reveal delay={0.15}>
              <p className="eyebrow mt-14">Right now</p>
              <dl className="mt-5 divide-y divide-[var(--line)] border-y border-line">
                {now.map((item, i) => (
                  <div key={i} className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">{item.k}</dt>
                    <dd className="text-[15px] text-ink">{item.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}

          <div className="mt-14">
            <Reveal>
              <p className="eyebrow">How I work</p>
            </Reveal>
            <ol className="mt-6 space-y-6">
              {PRINCIPLES.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 0.08} className="flex gap-6 border-t border-line pt-6">
                  <span className="font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="display block text-3xl text-ink">{p.title}</span>
                    <span className="mt-2 block text-[15px] leading-relaxed text-muted">{p.body}</span>
                  </span>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

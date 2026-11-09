import type { Settings } from "@/lib/cms/types";
import { markdownToHtml } from "@/lib/markdown";
import { Reveal } from "@/components/ui/Reveal";
import { LazyCodePortrait } from "./LazyCodePortrait";
import { SpokenLine } from "./SpokenLine";
import { SettleAnchor } from "@/components/ui/SettleAnchor";

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

/** The person: he says his line on the left, and it writes itself on the right. */
export async function Person({ settings }: { settings: Settings }) {
  const bio = await markdownToHtml(settings.bio);
  const now = parseNow(settings.nowList);

  return (
    <section
      id="about"
      className="relative px-5 pb-24 pt-20 md:px-10 md:py-40"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.2"
    >
      {/* On a phone, scrolling down onto him settles the portrait and his line on screen together. */}
      <SettleAnchor />
      <div className="mx-auto grid max-w-[1400px] items-center gap-7 sm:gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-[min(620px,44svh)] lg:max-w-[620px]">
          <LazyCodePortrait />
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">The person</p>
          </Reveal>
          <div className="mt-4 sm:mt-6">
            <SpokenLine />
          </div>
          <Reveal delay={0.1}>
            <div className="prose-cine mt-10 max-w-[56ch] text-[1.1rem]" dangerouslySetInnerHTML={{ __html: bio }} />
          </Reveal>

          {now.length > 0 && (
            <Reveal delay={0.15}>
              <dl className="mt-12 divide-y divide-[var(--line)] border-y border-line">
                {now.map((item, i) => (
                  <div key={i} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                    <dt className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">{item.k}</dt>
                    <dd className="text-[15px] text-ink">{item.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

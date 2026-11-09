import type { Settings } from "@/lib/cms/types";
import { markdownToHtml } from "@/lib/markdown";
import { Reveal } from "@/components/ui/Reveal";
import { LazyCodePortrait } from "./LazyCodePortrait";
import { SpokenLine } from "./SpokenLine";

/**
 * The person: he says his line on the left, and it writes itself on the right.
 * On phones the portrait comes first; the next swipe stops with the line at
 * the top of the screen and the bio beneath it (data-page-stop, see touchSteps).
 */
export async function Person({ settings }: { settings: Settings }) {
  const bio = await markdownToHtml(settings.bio);

  return (
    <section
      id="about"
      data-page
      className="relative px-5 pb-24 pt-20 md:px-10 md:py-40"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.2"
    >
      <div className="mx-auto grid max-w-[1400px] items-center gap-7 sm:gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-[min(620px,44svh)] lg:max-w-[620px]">
          <LazyCodePortrait />
        </Reveal>

        <div>
          <div data-page-stop>
            <Reveal>
              <p className="eyebrow">The person</p>
            </Reveal>
            <div className="mt-4 sm:mt-6">
              <SpokenLine />
            </div>
          </div>
          <Reveal delay={0.1}>
            <div className="prose-cine mt-8 max-w-[56ch] text-[1.1rem] sm:mt-10" dangerouslySetInnerHTML={{ __html: bio }} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

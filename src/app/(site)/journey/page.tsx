import Link from "next/link";
import { Reel } from "@/components/home/Reel";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbNode, graph, pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

const TITLE = "The long way here: from Oregon State to SuprAgent";
const DESCRIPTION =
  "Sibi Kabilan's path, newest first: founding SuprAgent, risk and AI at Servify, running KayaDev AI as CEO, independent architecture work, and Oregon State University.";

export const metadata = pageMeta({
  title: `${TITLE} · ${SITE.name}`,
  socialTitle: TITLE,
  description: DESCRIPTION,
  path: "/journey",
});

/** The whole story, one era per screen. The home page shows it at a glance. */
export default function JourneyPage() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "The long way here", path: "/journey" },
          ])
        )}
      />
      <Reel />
      <section data-page className="relative flex min-h-[70svh] items-center px-5 py-24 md:px-10" data-scene="network" data-scene-side="0" data-scene-opacity="0.3">
        <div className="mx-auto w-full max-w-[1400px] text-center">
          <p className="eyebrow">And now</p>
          <p className="display mx-auto mt-5 max-w-[18ch] text-[clamp(2.2rem,4.6vw,4rem)] text-ink">
            The next chapter is <em className="text-ink-2">SuprAgent.</em>
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/#now" className="btn btn-key">
              What I&apos;m building →
            </Link>
            <Link href="/#contact" className="btn btn-ghost">
              Say hello
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

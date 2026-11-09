import Link from "next/link";
import { REEL, type ReelFrame, type ReelLogo } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { cx } from "@/lib/utils";

/** Each mark's height in the timeline: every file has its own proportions. */
const MARK_H: Record<string, string> = {
  "/logos/supragent.webp": "h-11 md:h-16",
  "/logos/kayadev.webp": "h-[18px] md:h-6",
  "/logos/samsung-care-plus.webp": "h-[11px] md:h-[15px]",
  "/logos/applecare-plus.webp": "h-[14px] md:h-[19px]",
  "/logos/oregon-state.svg": "h-8 md:h-11",
  "/logos/odot.svg": "h-3.5 md:h-4",
  "/logos/usda.svg": "h-3.5 md:h-4",
  "/logos/hp.svg": "h-3.5 md:h-4",
};

function Mark({ logo, className }: { logo: ReelLogo; className?: string }) {
  if (!logo.src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt={logo.label}
      loading="lazy"
      decoding="async"
      className={cx("w-auto object-contain", MARK_H[logo.src] ?? "h-6", className, !logo.color && "[filter:brightness(0)_invert(1)]")}
    />
  );
}

/** The era's marks, or its name set in type where there's no mark to show. */
function Marks({ frame }: { frame: ReelFrame }) {
  const logos = frame.lockup.kind === "logos" ? frame.lockup.logos.filter((l) => l.src) : [];
  if (frame.key === "servify") {
    return (
      <span className="flex flex-col items-start gap-1.5">
        <span className="display text-[1.35rem] leading-none text-ink md:text-[1.7rem]">{frame.org}</span>
        <span className="flex items-center gap-2.5 opacity-90">
          {logos.map((l) => (
            <Mark key={l.label} logo={l} />
          ))}
        </span>
      </span>
    );
  }
  if (!logos.length) return <span className="display text-[1.35rem] italic leading-none text-ink md:text-[1.7rem]">{frame.org}</span>;
  return (
    <span className="flex items-center gap-3">
      {logos.map((l) => (
        <Mark key={l.label} logo={l} />
      ))}
    </span>
  );
}

/** The first users at Oregon State, small. */
function Partners({ frame }: { frame: ReelFrame }) {
  if (!frame.partners) return null;
  const logos = frame.partners.logos.filter((l) => l.src);
  return (
    <span className="mt-2 flex items-center gap-3 opacity-70" aria-label={`${frame.partners.credit}: ${frame.partners.logos.map((l) => l.label).join(", ")}`}>
      {logos.map((l) => (
        <Mark key={l.label} logo={l} />
      ))}
    </span>
  );
}

const years = (f: ReelFrame) => f.years.replace(" to now", " – now").replace(" to ", " – ");

/**
 * The long way here, at a glance: from now back to 2013, mostly in marks,
 * on a single screen. The full story has its own page (/journey).
 */
export function Timeline() {
  return (
    <section
      id="story"
      data-page
      className="relative flex min-h-[100svh] items-center px-5 pb-10 pt-[calc(var(--nav-h)+1.5rem)] md:px-10 md:py-[calc(var(--nav-h)+1rem)]"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.25"
      aria-labelledby="story-title"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Reveal>
              <p className="eyebrow">2013 to now</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id="story-title" className="display mt-4 text-[clamp(2.3rem,4.6vw,4.2rem)] text-ink">
                The <em className="text-ink-2">long</em> way here.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="hidden md:block">
            <Link href="/journey" className="btn btn-ghost">
              View more →
            </Link>
          </Reveal>
        </div>

        <ol className="relative mt-8 grid gap-0 md:mt-16 md:grid-cols-5 md:gap-8">
          {/* the line the years hang on: down the side on a phone, across on larger screens */}
          <span aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-[var(--line-strong)] md:bottom-auto md:left-0 md:right-0 md:top-[5px] md:h-px md:w-auto" />
          {REEL.map((f, i) => (
            <Reveal as="li" key={f.key} delay={0.08 + i * 0.07} className="relative pb-5 pl-7 last:pb-0 md:pb-0 md:pl-0 md:pt-9">
              <span
                aria-hidden
                className={cx(
                  "absolute left-0 top-1 block h-[11px] w-[11px] rounded-full border md:top-0",
                  i === 0 ? "border-[var(--key)] bg-[var(--key)] shadow-[0_0_14px_var(--key)]" : "border-[var(--line-strong)] bg-[var(--bg)]"
                )}
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted md:text-[10.5px]">
                {years(f)}
                <span className="text-faint md:hidden"> · {f.org}</span>
              </p>
              <div className="mt-2 flex items-center gap-4 md:mt-5 md:block">
                <div className="flex min-h-[44px] shrink-0 items-center md:min-h-[64px]">
                  <Marks frame={f} />
                </div>
                <div className="min-w-0 md:mt-4">
                  <p className="hidden text-[15px] text-ink md:block">{f.org}</p>
                  <p className="text-[13px] leading-snug text-ink-2 md:mt-1 md:text-[14px] md:leading-relaxed md:text-muted">{f.short}</p>
                </div>
              </div>
              <Partners frame={f} />
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.3} className="mt-7 md:hidden">
          <Link href="/journey" className="btn btn-ghost">
            View more →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

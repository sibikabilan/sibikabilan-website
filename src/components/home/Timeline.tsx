import Link from "next/link";
import { REEL, type ReelFrame, type ReelLogo } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { cx } from "@/lib/utils";

/** Each mark's height in the timeline: every file has its own proportions. */
const MARK_H: Record<string, string> = {
  "/logos/supragent.webp": "h-10 md:h-14",
  "/logos/kayadev.webp": "h-[16px] md:h-6",
  "/logos/samsung-care-plus.webp": "h-[11px] md:h-[15px]",
  "/logos/applecare-plus.webp": "h-[15px] md:h-[19px]",
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

/**
 * The era's marks, or its name set in type where there's no mark to show. Where there are
 * two (Servify's programmes), they stack, so every era's marks keep to the same column.
 */
function Marks({ frame }: { frame: ReelFrame }) {
  const logos = frame.lockup.kind === "logos" ? frame.lockup.logos.filter((l) => l.src) : [];
  if (!logos.length) return <span className="display text-[1.3rem] italic leading-none text-ink md:text-[1.7rem]">{frame.org}</span>;
  return (
    <span className="flex flex-col items-start gap-2 md:gap-2.5">
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
    <span className="mt-3 flex items-center gap-3 opacity-70" aria-label={`${frame.partners.credit}: ${frame.partners.logos.map((l) => l.label).join(", ")}`}>
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
 *
 * Set like a table. On a phone each era is a row of two columns, the years
 * and the marks on the left and the words on the right, so every row's marks
 * and words start at the same place. On larger screens the eras stand side
 * by side, with the marks in a box of the same height, sitting on a common
 * line, so the names under them all start level.
 */
export function Timeline() {
  return (
    <section
      id="story"
      data-page
      className="relative flex min-h-[100svh] items-center px-5 pb-10 pt-[calc(var(--nav-h)+1.5rem)] short:pb-5 short:pt-[calc(var(--nav-h)+0.5rem)] md:px-10 md:py-[calc(var(--nav-h)+1rem)]"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0.25"
      aria-labelledby="story-title"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <Reveal>
          <p className="eyebrow">2013 to now</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="story-title" className="display mt-4 text-[clamp(2.3rem,4.6vw,4.2rem)] text-ink short:mt-2">
            The <em className="text-ink-2">long</em> way here.
          </h2>
        </Reveal>

        <ol className="relative mt-8 grid gap-0 short:mt-5 md:mt-14 md:grid-cols-5 md:gap-8">
          {/* the line the years hang on: down the side on a phone, across on larger screens */}
          <span aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-[var(--line-strong)] md:bottom-auto md:left-0 md:right-0 md:top-[5px] md:h-px md:w-auto" />
          {REEL.map((f, i) => (
            <Reveal
              as="li"
              key={f.key}
              delay={0.08 + i * 0.07}
              className="relative grid grid-cols-[6.75rem_minmax(0,1fr)] content-start gap-x-4 pb-6 pl-7 short:pb-3 last:pb-0 md:grid-cols-1 md:pb-0 md:pl-0 md:pt-9"
            >
              <span
                aria-hidden
                className={cx(
                  "absolute left-0 top-[5px] block h-[11px] w-[11px] rounded-full border md:top-0",
                  i === 0 ? "border-[var(--key)] bg-[var(--key)] shadow-[0_0_14px_var(--key)]" : "border-[var(--line-strong)] bg-[var(--bg)]"
                )}
              />
              <p className="col-start-1 row-start-1 font-mono text-[10px] uppercase leading-[21px] tracking-[0.2em] text-muted md:text-[10.5px] md:leading-normal md:tracking-[0.24em]">
                {years(f)}
              </p>
              <div className="col-start-1 row-start-2 mt-2 flex items-start md:row-start-2 md:mt-5 md:h-16 md:items-end">
                <Marks frame={f} />
              </div>
              <div className="col-start-2 row-span-2 row-start-1 min-w-0 md:col-start-1 md:row-span-1 md:row-start-3 md:mt-4">
                <p className="text-[14px] leading-[21px] text-ink md:text-[15px] md:leading-normal">{f.org}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink-2 md:text-[14px] md:leading-relaxed md:text-muted">{f.short}</p>
                <Partners frame={f} />
              </div>
            </Reveal>
          ))}
        </ol>

        {/* After the eras, on every screen: the way on to the whole story. */}
        <Reveal delay={0.3} className="mt-8 short:mt-5 md:mt-14">
          <Link href="/journey" className="btn btn-ghost">
            View more →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

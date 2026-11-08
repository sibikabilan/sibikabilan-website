import type { Settings } from "@/lib/cms/types";
import { Reveal, TitleReveal } from "@/components/ui/Reveal";
import { CinematicVideo } from "@/components/ui/CinematicVideo";

export function Contact({ settings }: { settings: Settings }) {
  return (
    <section
      id="contact"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-black"
      data-scene="network"
      data-scene-side="0"
      data-scene-opacity="0"
    >
      <div className="grade absolute inset-0">
        <CinematicVideo src="/media/corridor.mp4" poster="/media/corridor-poster.webp" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-black/50 to-[var(--bg)]" />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 py-32 text-center md:px-10">
        <Reveal>
          <p className="eyebrow text-white/60">Contact</p>
        </Reveal>
        <h2 className="display mx-auto mt-6 max-w-[14ch] text-[clamp(3rem,8vw,7.5rem)] text-white">
          <TitleReveal text="The door's open. Say hello." italicWords={["hello."]} />
        </h2>
        <Reveal delay={0.15} className="lede mx-auto mt-8 max-w-[580px] text-white/75">
          Building something, investing in something, writing something, or just want to trade notes on agents and
          stories? I&apos;d like to hear from you.
        </Reveal>
        <Reveal delay={0.25} className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={`mailto:${settings.email}`} className="btn btn-key">
            {settings.email}
          </a>
          <a href={settings.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">
            LinkedIn ↗
          </a>
        </Reveal>
      </div>
    </section>
  );
}

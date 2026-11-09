import Link from "next/link";
import type { Settings } from "@/lib/cms/types";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const socials = [
    { href: settings.linkedin, label: "LinkedIn" },
    { href: settings.github, label: "GitHub" },
    { href: settings.x, label: "X" },
    { href: settings.companyUrl, label: "SuprAgent" },
  ].filter((s) => s.href);

  return (
    <footer className="relative z-10 border-t border-line" data-scene="network" data-scene-side="0" data-scene-opacity="0.9">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <p className="display text-4xl text-ink">
            Sibi <em className="keyed">Kabilan</em>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Entrepreneur, engineer, and writer, based in {settings.location.split(",")[0] || "Bengaluru"}. Building
            SuprAgent, and writing the rest down.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4">Elsewhere</p>
          <ul className="space-y-2 text-sm">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="link-sweep text-ink-2">
                  {s.label} ↗
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${settings.email}`} className="link-sweep text-ink-2">
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Site</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="link-sweep text-ink-2">Home</Link></li>
            <li><Link href="/journey" className="link-sweep text-ink-2">Journey</Link></li>
            {settings.showWriting && <li><Link href="/blog" className="link-sweep text-ink-2">Blog</Link></li>}
            {settings.showFiction && <li><Link href="/fiction" className="link-sweep text-ink-2">Fiction</Link></li>}
            <li><Link href="/rss.xml" className="link-sweep text-ink-2">RSS</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 pb-8 font-mono text-[10.5px] uppercase tracking-[0.22em] text-faint md:px-10">
        <span>© {year} Sibi Kabilan</span>
        <span>Built and written by hand</span>
      </div>
    </footer>
  );
}

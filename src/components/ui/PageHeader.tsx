import Image from "next/image";
import { Reveal, TitleReveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  italic = [],
  lede,
  image,
  imageAlt = "",
}: {
  eyebrow: string;
  title: string;
  italic?: string[];
  lede?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <header className="relative overflow-hidden">
      {image && (
        <div className="grade absolute inset-0 -z-0 opacity-60">
          <Image src={image} alt={imageAlt} fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/40 via-[var(--bg)]/70 to-[var(--bg)]" />
        </div>
      )}
      <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-[calc(var(--nav-h)+5rem)] md:px-10 md:pb-24 md:pt-[calc(var(--nav-h)+8rem)]">
        <Reveal immediate>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <h1 className="display mt-6 max-w-[16ch] text-[clamp(3.2rem,9vw,8rem)] text-ink">
          <TitleReveal text={title} italicWords={italic} immediate />
        </h1>
        {lede && (
          <Reveal immediate delay={0.15} className="lede mt-8 max-w-[620px]">
            {lede}
          </Reveal>
        )}
      </div>
    </header>
  );
}

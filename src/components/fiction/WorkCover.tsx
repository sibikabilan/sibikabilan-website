import Image from "next/image";

/** A book cover: the uploaded art, or a lit book with the title set on it. */
export function WorkCover({ title, cover, className = "" }: { title: string; cover: string | null; className?: string }) {
  return (
    <div
      className={`grade relative aspect-[3/4] overflow-hidden rounded-[3px] border border-line bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] transition-transform duration-700 group-hover:-translate-y-1 ${className}`}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <>
          <Image src="/media/book.webp" alt="" fill sizes="(min-width: 1024px) 30vw, 80vw" className="object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className="absolute inset-x-0 top-0 p-6 text-center">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.4em] text-white/50">Sibi Kabilan</p>
            <p className="display mt-4 text-[clamp(1.8rem,3vw,2.6rem)] italic leading-none text-white">{title}</p>
          </div>
        </>
      )}
      {/* spine light */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-white/15 to-transparent" />
    </div>
  );
}

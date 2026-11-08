import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[80svh] place-items-center px-5 text-center" data-scene="network" data-scene-side="0" data-scene-opacity="0.7">
      <div>
        <p className="eyebrow">404 · Scene missing</p>
        <h1 className="display mt-6 text-[clamp(3rem,9vw,7rem)] text-ink">
          This page ended up <em className="text-ink-2">on the cutting room floor.</em>
        </h1>
        <Link href="/" className="btn btn-key mt-10">
          Back to the beginning
        </Link>
      </div>
    </section>
  );
}

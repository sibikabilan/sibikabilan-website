import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page ended up on the cutting room floor. Head back to Sibi Kabilan's home page, his essays on Agentic UI and AI agents, or the fiction library.",
  robots: { index: false, follow: true },
};

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

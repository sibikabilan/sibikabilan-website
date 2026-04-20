"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="hero-gradient relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* Noise texture for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <h1
          className="hero-fade-in font-serif font-bold leading-[0.85] tracking-[-0.04em] text-foreground"
          style={{
            fontSize: "clamp(4rem, 13vw, 12rem)",
            animationDelay: "0.1s",
          }}
        >
          Sibi
          <br />
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: "2px #0a0a0a" }}
          >
            Kabilan
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 md:mt-12 md:flex-row md:items-end md:justify-between">
          <p
            className="hero-fade-in text-lg text-foreground-secondary md:text-xl"
            style={{ animationDelay: "0.35s" }}
          >
            Founder, AI Architect,{" "}
            <span className="font-medium text-accent">Maker.</span>
          </p>

          <div
            className="hero-fade-in flex gap-4"
            style={{ animationDelay: "0.5s" }}
          >
            <Link
              href="/#ventures"
              className="group inline-flex items-center justify-center gap-2 bg-foreground px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-background transition-all duration-200 hover:bg-accent cursor-pointer"
            >
              Explore Work
              <svg
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-200 hover:bg-foreground hover:text-background cursor-pointer"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

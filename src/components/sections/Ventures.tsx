"use client";

import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalRule } from "@/components/ui/HorizontalRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ventures } from "@/data/ventures";
import Link from "next/link";

export function Ventures() {
  return (
    <SectionWrapper id="ventures" alternate>
      <HorizontalRule className="mb-16" />

      <SectionHeading
        label="Ventures"
        title="Companies I've Built"
        description="From AI analytics to agentic platforms. Products that push boundaries."
      />

      <div className="space-y-12">
        {ventures.map((venture, i) => (
          <ScrollReveal key={venture.name} delay={i * 0.08}>
            <article className={`border border-border bg-surface p-8 md:p-10 ${i === 0 ? "" : ""}`}>
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h3 className="font-serif text-2xl font-bold md:text-3xl">{venture.name}</h3>
                    {venture.status === "active" && (
                      <span className="inline-flex items-center gap-1.5 text-label">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground-secondary">{venture.role}</span>
                    <span className="text-sm text-muted">{venture.period}</span>
                  </div>
                </div>

                {venture.url && (
                  <Link
                    href={venture.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
                  >
                    Visit
                    <svg
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                )}
              </div>

              <p className="mt-5 max-w-2xl text-editorial-body">{venture.description}</p>

              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {venture.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </SectionWrapper>
  );
}

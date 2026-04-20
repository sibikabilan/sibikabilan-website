"use client";

import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalRule } from "@/components/ui/HorizontalRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export function Contact() {
  return (
    <SectionWrapper id="contact" alternate>
      <HorizontalRule className="mb-16" />

      <SectionHeading
        label="Contact"
        title="Let's Build Together"
      />

      <ScrollReveal>
        <div className="max-w-xl">
          <p className="text-xl leading-relaxed text-foreground-secondary md:text-2xl">
            Got a project, an idea, or just want to talk AI?
          </p>
          <p className="mt-6 text-xl font-medium md:text-2xl">
            Email me at{" "}
            <Link
              href="mailto:sibi@supragent.ai"
              className="text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              sibi@supragent.ai
            </Link>
          </p>

          <div className="mt-10 flex gap-6">
            {SITE.links.linkedin && (
              <Link
                href={SITE.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
              >
                LinkedIn
              </Link>
            )}
            {SITE.links.github && (
              <Link
                href={SITE.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
              >
                GitHub
              </Link>
            )}
          </div>
        </div>
      </ScrollReveal>
    </SectionWrapper>
  );
}

"use client";

import Image from "next/image";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalRule } from "@/components/ui/HorizontalRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { clients } from "@/data/experience";

export function Experience() {
  return (
    <SectionWrapper id="worked-with">
      <HorizontalRule className="mb-16" />

      <SectionHeading
        label="Trusted By"
        title="Trusted by Industry"
        description="Organizations I've built AI solutions for, through my ventures, consulting, and direct engagements."
      />

      <ScrollReveal>
        <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
          {clients.map((client) => (
            <div
              key={client.name}
              className="flex flex-col items-center gap-3"
            >
              <Image
                src={client.logo}
                alt={client.context || client.name}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-center text-xs font-medium text-muted">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </SectionWrapper>
  );
}

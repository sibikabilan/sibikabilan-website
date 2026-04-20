"use client";

import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalRule } from "@/components/ui/HorizontalRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { skillCategories } from "@/data/skills";

export function Skills() {
  return (
    <SectionWrapper id="skills" alternate>
      <HorizontalRule className="mb-16" />

      <SectionHeading
        label="Skills"
        title="Tech Stack"
        description="Technologies and tools I work with every day."
      />

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {skillCategories.map((category, i) => (
          <ScrollReveal key={category.name} delay={i * 0.04}>
            <div>
              <h3 className="mb-4 font-serif text-lg font-bold">{category.name}</h3>
              <ul className="space-y-2">
                {category.skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-2.5 text-sm text-foreground-secondary">
                    <span className="h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </SectionWrapper>
  );
}

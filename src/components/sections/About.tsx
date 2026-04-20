"use client";

import { animate } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HorizontalRule } from "@/components/ui/HorizontalRule";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AvatarChat } from "@/components/ui/AvatarChat";
import Image from "next/image";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const controls = animate(0, target, {
            duration: 1.5,
            ease: [0.4, 0, 0.2, 1],
            onUpdate: (v) => setValue(Math.round(v)),
          });
          return () => controls.stop();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, target]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

const stats = [
  { label: "Years in Tech", value: 10, suffix: "+" },
  { label: "Companies Founded", value: 2, suffix: "" },
  { label: "Fortune 500 Clients", value: 10, suffix: "+" },
];

export function About({ hasGeminiKey = false }: { hasGeminiKey?: boolean }) {
  return (
    <SectionWrapper id="about">
      <HorizontalRule className="mb-16" />

      <SectionHeading
        label="About"
        title="A Bit About Me"
      />

      <div className="grid gap-16 md:grid-cols-[1fr_1.5fr] md:items-start">
        {/* Portrait */}
        <ScrollReveal direction="left">
          {hasGeminiKey ? (
            <AvatarChat />
          ) : (
            <div className="relative overflow-hidden border border-border">
              <Image
                src="/images/portrait.png"
                alt="Sibi Kabilan"
                width={400}
                height={533}
                className="w-full"
              />
            </div>
          )}
        </ScrollReveal>

        {/* Bio + Stats */}
        <div>
          <ScrollReveal>
            <div className="space-y-5">
              <p className="text-lg leading-[1.75] text-foreground-secondary">
                I&apos;ve spent the last decade at the intersection of{" "}
                <span className="font-medium text-accent">AI</span> and{" "}
                <span className="font-medium text-foreground">product engineering</span>,
                turning complex technical problems into things people actually use.
              </p>
              <p className="text-lg leading-[1.75] text-foreground-secondary">
                I studied Computer Science at Oregon State University
                <span className="text-accent font-medium"> (Go Beavs!)</span> and
                have since founded two companies, led product teams across India and
                North America, and helped some of the world&apos;s largest organizations
                figure out their AI strategy.
              </p>
              <p className="text-lg leading-[1.75] text-foreground-secondary">
                Right now I&apos;m building{" "}
                <span className="font-medium text-foreground">SuprAgent</span>, an agentic
                UI platform for financial services. Before that, I built{" "}
                <span className="font-medium text-foreground">KayaDev AI</span>, a deep
                learning analytics company that served Fortune 500 clients.
              </p>
              <p className="text-lg leading-[1.75] text-foreground-secondary">
                Outside of work, I write fiction. Stories about the places where
                technology and humanity overlap, and sometimes collide.
              </p>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={0.15}>
            <div className="mt-12 flex divide-x divide-border">
              {stats.map((stat) => (
                <div key={stat.label} className="flex-1 px-6 first:pl-0">
                  <div className="font-serif text-4xl font-bold text-foreground md:text-5xl">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1 text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </SectionWrapper>
  );
}

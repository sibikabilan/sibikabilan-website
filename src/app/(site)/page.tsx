import { getPublishedPosts, getPublishedWorks, getSettings } from "@/lib/cms/queries";
import { Hero } from "@/components/home/Hero";
import { Prologue } from "@/components/home/Prologue";
import { Reel } from "@/components/home/Reel";
import { Now } from "@/components/home/Now";
import { Person } from "@/components/home/Person";
import { WritingPreview } from "@/components/home/WritingPreview";
import { FictionPreview } from "@/components/home/FictionPreview";
import { Contact } from "@/components/home/Contact";
import { SITE } from "@/lib/site";

export default async function HomePage() {
  const [settings, posts, works] = await Promise.all([getSettings(), getPublishedPosts(), getPublishedWorks()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE.url,
    image: `${SITE.url}/media/sibi-headshot.webp`,
    jobTitle: "Founder",
    worksFor: { "@type": "Organization", name: "SuprAgent", url: settings.companyUrl },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Oregon State University" },
    address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
    sameAs: [settings.linkedin, settings.github, settings.x].filter(Boolean),
    knowsAbout: ["Entrepreneurship", "AI agents", "Agentic UI", "Software architecture", "Fiction writing"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero settings={settings} />
      <Prologue />
      <Reel />
      <Now companyUrl={settings.companyUrl} />
      <Person settings={settings} />
      {settings.showWriting && <WritingPreview posts={posts.slice(0, 3)} intro={settings.writingIntro} />}
      {settings.showFiction && <FictionPreview works={works} intro={settings.fictionIntro} />}
      <Contact settings={settings} />
    </>
  );
}

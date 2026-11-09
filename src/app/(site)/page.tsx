import type { Metadata } from "next";
import { getPublishedPosts, getSettings } from "@/lib/cms/queries";
import { Hero } from "@/components/home/Hero";
import { Prologue } from "@/components/home/Prologue";
import { Timeline } from "@/components/home/Timeline";
import { Now } from "@/components/home/Now";
import { Person } from "@/components/home/Person";
import { WritingPreview } from "@/components/home/WritingPreview";
import { FictionPreview } from "@/components/home/FictionPreview";
import { Contact } from "@/components/home/Contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEEDS, homeGraph } from "@/lib/seo";

// Title, description, Open Graph and Twitter card (with the share card)
// come from the root layout; the home page only adds its canonical.
export const metadata: Metadata = {
  alternates: { canonical: "/", types: FEEDS },
};

export default async function HomePage() {
  const [settings, posts] = await Promise.all([getSettings(), getPublishedPosts()]);

  return (
    <>
      <JsonLd data={homeGraph(settings)} />
      <Hero settings={settings} />
      <Prologue />
      <Timeline />
      <Now companyUrl={settings.companyUrl} />
      <Person settings={settings} />
      {settings.showWriting && <WritingPreview posts={posts.slice(0, 4)} intro={settings.writingIntro} />}
      {settings.showFiction && <FictionPreview intro={settings.fictionIntro} />}
      <Contact settings={settings} />
    </>
  );
}

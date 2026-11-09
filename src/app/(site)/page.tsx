import type { Metadata } from "next";
import { getPublishedPosts, getSettings } from "@/lib/cms/queries";
import { Hero } from "@/components/home/Hero";
import { Prologue } from "@/components/home/Prologue";
import { Reel } from "@/components/home/Reel";
import { Now } from "@/components/home/Now";
import { Person } from "@/components/home/Person";
import { WritingPreview } from "@/components/home/WritingPreview";
import { FictionPreview } from "@/components/home/FictionPreview";
import { Contact } from "@/components/home/Contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEEDS, homeGraph } from "@/lib/seo";

// Title, description, Open Graph and Twitter card (with app/opengraph-image.jpg)
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
      <Reel />
      <Now companyUrl={settings.companyUrl} />
      <Person settings={settings} />
      {settings.showWriting && <WritingPreview posts={posts.slice(0, 3)} intro={settings.writingIntro} />}
      {settings.showFiction && <FictionPreview intro={settings.fictionIntro} />}
      <Contact settings={settings} />
    </>
  );
}

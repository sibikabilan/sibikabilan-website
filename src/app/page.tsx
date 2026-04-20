import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Ventures } from "@/components/sections/Ventures";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { Contact } from "@/components/sections/Contact";
import { personSchema, websiteSchema } from "@/lib/structured-data";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema()),
        }}
      />
      <Hero />
      <About hasGeminiKey={!!process.env.GEMINI_API_KEY} />
      <Ventures />
      <Experience />
      <Skills />
      <BlogPreview />
      <Contact />
    </>
  );
}

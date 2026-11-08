import { getSettings } from "@/lib/cms/queries";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Intro } from "@/components/chrome/Intro";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <noscript>
        <style>{`.intro-card{display:none!important}`}</style>
      </noscript>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-[var(--key)] focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <SiteChrome defaultAtmosphere={settings.defaultAtmosphere} />
      <Intro />
      <Nav showWriting={settings.showWriting} showFiction={settings.showFiction} companyUrl={settings.companyUrl} />
      <main id="main" className="relative z-10">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Newsreader } from "next/font/google";
import { SITE } from "@/lib/site";
import { FEEDS } from "@/lib/seo";
import { getSettings } from "@/lib/cms/queries";
import "./globals.css";

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

// The reading face (about 280 KB with its optical size axis) sets essay and
// chapter bodies, which sit below the opening view. It still loads on every
// page that uses it, just without a preload competing with the hero.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "personal website",
  // Each page sets its own canonical; only the feed link is shared.
  alternates: { types: FEEDS },
  // Pages override these with their own title, URL and image (see pageMeta in lib/seo).
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The server renders the site's default lighting; a visitor's saved choice relights it on load.
  const { defaultAtmosphere } = await getSettings();

  return (
    <html
      lang="en"
      data-atmosphere={defaultAtmosphere}
      data-grain="on"
      data-motion="cinematic"
      suppressHydrationWarning
      className={`${instrument.variable} ${geist.variable} ${geistMono.variable} ${newsreader.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

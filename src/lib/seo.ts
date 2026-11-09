import type { Metadata } from "next";
// One share card for every page, imported so its URL is clean and fixed per version
// (/_next/static/media/share-card.<hash>.jpg). The app/opengraph-image file convention
// produced "…jpg?<hash>?dpl=…" on Vercel, which stricter preview fetchers reject.
import shareCard from "@/assets/share-card.jpg";
import type { Settings } from "@/lib/cms/types";
import { SITE } from "@/lib/site";

/**
 * Search and sharing metadata, and the structured data (JSON-LD) that tells
 * search engines and AI assistants who Sibi is and what each page holds.
 * Every node points back to the same Person by @id, so the whole site reads
 * as one connected graph.
 */

export const absoluteUrl = (path = "/") => (/^https?:\/\//.test(path) ? path : path === "/" ? SITE.url : `${SITE.url}${path}`);

export const IDS = {
  person: `${SITE.url}/#person`,
  website: `${SITE.url}/#website`,
  profile: `${SITE.url}/#profile`,
  supragent: `${SITE.url}/#supragent`,
  kayadev: `${SITE.url}/#kayadev`,
  blog: `${SITE.url}/blog#blog`,
  library: `${SITE.url}/fiction#library`,
} as const;

/** Sibi's real headshot: the picture search engines should show for his name. */
export const PHOTO = { url: absoluteUrl("/media/sibi-kabilan.jpg"), width: 1200, height: 1200 };

/** What SuprAgent builds, in one line. */
export const AGENTIC_UI = "SuprAgent builds Agentic UI: interfaces an AI agent composes for each person, in the moment.";

/** Matches app/opengraph-image.alt.txt and app/twitter-image.alt.txt. */
const SHARE_ALT = "Sibi Kabilan, entrepreneur, engineer, and writer, building SuprAgent in Bengaluru";

/**
 * The site's share card: the same app/opengraph-image.jpg and twitter-image.jpg
 * files the home page gets through the file convention. A page that sets its
 * own Open Graph fields replaces the inherited ones wholesale, so nested pages
 * name the card explicitly instead of ending up with no image.
 */
export const DEFAULT_OG_IMAGE = {
  url: shareCard.src,
  width: shareCard.width,
  height: shareCard.height,
  alt: SHARE_ALT,
  type: "image/jpeg",
};
export const DEFAULT_TWITTER_IMAGE = DEFAULT_OG_IMAGE;

export const FEEDS = {
  "application/rss+xml": [{ url: "/rss.xml", title: `${SITE.name}: essays and fiction` }],
};

/* ───────────────────────── text helpers ───────────────────────── */

/** Markdown to a single line of plain text, for descriptions. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`~>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A search snippet of at most `max` characters that reads cleanly: whole
 * sentences when they fill most of the space, otherwise a cut at the last
 * clause (or word) with an ellipsis. When the text runs short, `tail` is
 * added so the snippet still says whose page this is.
 */
export function snippet(text: string, tail = "", max = 160): string {
  const clean = plainText(text);
  let out = clean;
  if (clean.length > max) {
    const sentences = clean.match(/[^.!?]+[.!?]+["”’)]*(?=\s|$)/g) ?? [];
    let whole = "";
    for (const s of sentences) {
      const next = `${whole} ${s.trim()}`.trim();
      if (next.length > max) break;
      whole = next;
    }
    const room = clean.slice(0, max - 1);
    const clause = Math.max(room.lastIndexOf(", "), room.lastIndexOf("; "), room.lastIndexOf(": "));
    if (whole.length >= 120) out = whole;
    else if (clause >= 100) out = `${room.slice(0, clause)}…`;
    else out = `${room.slice(0, room.lastIndexOf(" ")).replace(/[\s,;:.]+$/, "")}…`;
  }
  if (tail && !out.endsWith("…") && out.length < 130 && `${out} ${tail}`.length <= max) out = `${out} ${tail}`.trim();
  return out;
}

/** "Title · Sibi Kabilan", or a longer brand line when the title alone would be thin in results. */
export function brandTitle(title: string, longer: string): string {
  const short = `${title} · ${SITE.name}`;
  if (short.length >= 46) return short;
  const long = `${title} · ${longer}`;
  return long.length <= 62 ? long : short;
}

/* ───────────────────────── metadata ───────────────────────── */

type ShareImage = { url: string; width?: number; height?: number; alt: string };

interface PageMetaInput {
  /** The full <title>, used as is. */
  title: string;
  /** Title for share cards, without the site name (og:site_name carries it). Defaults to `title`. */
  socialTitle?: string;
  description: string;
  path: string;
  image?: ShareImage | null;
  type?: "website" | "article" | "book";
  article?: { publishedTime?: string | null; modifiedTime?: string | null; tags?: string[] };
}

/**
 * Title, description, canonical, feed link, Open Graph and Twitter card for a
 * nested page. The home page doesn't use this: it inherits the root layout's card.
 */
export function pageMeta(p: PageMetaInput): Metadata {
  const socialTitle = p.socialTitle ?? p.title;
  const images = [p.image ?? DEFAULT_OG_IMAGE];
  const base = {
    url: p.path,
    siteName: SITE.name,
    locale: SITE.locale,
    title: socialTitle,
    description: p.description,
    images,
  };

  let openGraph: Metadata["openGraph"];
  if (p.type === "article") {
    openGraph = {
      ...base,
      type: "article",
      publishedTime: p.article?.publishedTime ?? undefined,
      modifiedTime: p.article?.modifiedTime ?? undefined,
      authors: [SITE.url],
      tags: p.article?.tags,
    };
  } else if (p.type === "book") {
    openGraph = { ...base, type: "book", authors: [SITE.url], tags: p.article?.tags };
  } else {
    openGraph = { ...base, type: "website" };
  }

  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: p.path, types: FEEDS },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: p.description,
      images: [p.image ?? DEFAULT_TWITTER_IMAGE],
    },
  };
}

/* ───────────────────────── structured data ───────────────────────── */

type Node = Record<string, unknown>;

/** A reference to the Person, with enough inline for parsers that don't follow @id. */
export const AUTHOR: Node = { "@type": "Person", "@id": IDS.person, name: SITE.name, url: SITE.url };

const imageObject = (img: { url: string; width?: number; height?: number }, caption?: string): Node => ({
  "@type": "ImageObject",
  url: absoluteUrl(img.url),
  contentUrl: absoluteUrl(img.url),
  ...(img.width ? { width: img.width, height: img.height } : {}),
  ...(caption ? { caption } : {}),
});

export const shareImageNode = (img?: ShareImage | null) => imageObject(img ?? DEFAULT_OG_IMAGE);

const BENGALURU: Node = {
  "@type": "PostalAddress",
  addressLocality: "Bengaluru",
  addressRegion: "Karnataka",
  addressCountry: "IN",
};

export function personNode(settings: Settings): Node {
  return {
    "@type": "Person",
    "@id": IDS.person,
    name: SITE.name,
    givenName: "Sibi",
    familyName: "Kabilan",
    url: SITE.url,
    image: imageObject(PHOTO, SITE.name),
    description: SITE.description,
    jobTitle: "Founder",
    hasOccupation: [
      { "@type": "Occupation", name: "Entrepreneur" },
      { "@type": "Occupation", name: "Engineer" },
      { "@type": "Occupation", name: "Writer" },
    ],
    worksFor: { "@id": IDS.supragent },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Oregon State University",
        address: { "@type": "PostalAddress", addressLocality: "Corvallis", addressRegion: "Oregon", addressCountry: "US" },
      },
      {
        "@type": "OrganizationRole",
        roleName: "Co founder and CEO",
        startDate: "2018",
        endDate: "2021",
        alumniOf: { "@id": IDS.kayadev },
      },
      {
        "@type": "OrganizationRole",
        startDate: "2022",
        endDate: "2024",
        description:
          "Device protection programs for Samsung Care+ and AppleCare+, a transactional risk and fraud engine, and generative AI in chat, IVR, and voice.",
        alumniOf: { "@type": "Organization", name: "Servify" },
      },
    ],
    homeLocation: { "@type": "Place", name: "Bengaluru, Karnataka, India", address: BENGALURU },
    address: BENGALURU,
    email: `mailto:${settings.email}`,
    sameAs: [settings.linkedin, settings.github, settings.x].filter(Boolean),
    knowsAbout: [
      "Agentic UI",
      "AI agents",
      "Generative AI",
      "Voice AI",
      "Computer vision",
      "Risk and fraud engines",
      "Software architecture",
      "Entrepreneurship",
      "Essay writing",
      "Fiction writing",
    ],
  };
}

function organizationNodes(settings: Settings): Node[] {
  return [
    {
      "@type": "Organization",
      "@id": IDS.supragent,
      name: "SuprAgent",
      url: settings.companyUrl,
      logo: imageObject({ url: "/logos/supragent.webp", width: 500, height: 500 }),
      description: AGENTIC_UI,
      founder: { "@id": IDS.person },
      location: { "@type": "Place", address: BENGALURU },
    },
    {
      "@type": "Organization",
      "@id": IDS.kayadev,
      name: "KayaDev AI",
      description: "Computer vision and analytics for enterprise teams.",
      foundingDate: "2018",
      founder: { "@id": IDS.person },
      location: { "@type": "Place", address: BENGALURU },
    },
  ];
}

/** Home: the profile page, the website and the person it is about. */
export function homeGraph(settings: Settings): Node {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": IDS.profile,
        url: SITE.url,
        name: SITE.title,
        description: SITE.description,
        inLanguage: "en",
        isPartOf: { "@id": IDS.website },
        about: { "@id": IDS.person },
        mainEntity: { "@id": IDS.person },
        primaryImageOfPage: imageObject(PHOTO, SITE.name),
      },
      {
        "@type": "WebSite",
        "@id": IDS.website,
        url: SITE.url,
        name: SITE.name,
        alternateName: [SITE.domain],
        description: SITE.description,
        inLanguage: "en",
        author: { "@id": IDS.person },
        publisher: { "@id": IDS.person },
      },
      personNode(settings),
      ...organizationNodes(settings),
    ],
  };
}

export function breadcrumbNode(trail: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absoluteUrl(t.path),
    })),
  };
}

export const graph = (...nodes: Node[]): Node => ({ "@context": "https://schema.org", "@graph": nodes });

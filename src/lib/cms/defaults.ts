import type { CmsIndex, PostMeta, Settings, Work } from "./types";
import { STARTER_POSTS } from "@/content/starter-posts";
import { STARTER_WORKS } from "@/content/starter-fiction";
import { readingTime, wordCount } from "@/lib/utils";

export const DEFAULT_SETTINGS: Settings = {
  heroEyebrow: "Entrepreneur · Engineer · Writer",
  heroHeadline: "Two companies, a decade of software people rely on, and stories that have nothing to do with either.",
  heroSub: "Based in Bengaluru. Currently building SuprAgent.",
  nowStatus: "Building SuprAgent · Writing fiction",
  location: "Bengaluru, India",
  email: "sibi.kabilan@gmail.com",
  linkedin: "https://www.linkedin.com/in/sibikabilan/",
  github: "https://github.com/sibikabilan",
  x: "",
  companyUrl: "https://supragent.ai",
  defaultAtmosphere: "noir",
  showWriting: true,
  showFiction: true,
  writingIntro: "Essays on building companies, agents and interfaces, and the lessons that only show up after launch.",
  fictionIntro: "Some of my ideas were never going to be software. They end up here instead, one chapter at a time.",
  bio: `I studied computer science at Oregon State University and shipped my first production software there, for the Oregon Department of Transportation. Since then I've been an independent AI architect, co founded and ran KayaDev AI as CEO, looked after risk and AI for device protection programs at Servify, and now I'm building SuprAgent, the company I founded.

The thread through all of it is software that holds up in front of real people.`,
  nowList: `Building: SuprAgent, and the case for Agentic UI
Thinking about: Interfaces that compose themselves
Based in: Bengaluru, India`,
};

export const STARTER_PREFIX = "starter:";

function starterPosts(): PostMeta[] {
  return STARTER_POSTS.map((p) => ({
    id: `starter-${p.slug}`,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    tags: p.tags,
    cover: null,
    status: "published",
    readingTime: readingTime(p.content),
    publishedAt: p.publishedAt,
    createdAt: p.publishedAt,
    updatedAt: p.publishedAt,
    contentUrl: `${STARTER_PREFIX}${p.slug}`,
  }));
}

/** Sibi's stories ship with the site the same way: bundled, then editable from /admin. */
const WORK_PREFIX = `${STARTER_PREFIX}work/`;

function starterWorks(): Work[] {
  return STARTER_WORKS.map((w) => {
    const latest = w.chapters.reduce((m, c) => (c.publishedAt > m ? c.publishedAt : m), w.publishedAt);
    return {
      id: `starter-work-${w.slug}`,
      slug: w.slug,
      title: w.title,
      tagline: w.tagline,
      synopsis: w.synopsis,
      genre: w.genre,
      kind: w.kind,
      progress: w.progress,
      cover: null,
      status: "published",
      publishedAt: w.publishedAt,
      createdAt: w.publishedAt,
      updatedAt: latest,
      chapters: w.chapters.map((c) => ({
        id: `starter-ch-${w.slug}-${c.slug}`,
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        status: "published",
        wordCount: wordCount(c.content),
        publishedAt: c.publishedAt,
        createdAt: c.publishedAt,
        updatedAt: c.publishedAt,
        contentUrl: `${WORK_PREFIX}${w.slug}/${c.slug}`,
      })),
    };
  });
}

export function starterContent(url: string): string | null {
  if (!url.startsWith(STARTER_PREFIX)) return null;
  if (url.startsWith(WORK_PREFIX)) {
    const [workSlug, chapterSlug] = url.slice(WORK_PREFIX.length).split("/");
    const work = STARTER_WORKS.find((w) => w.slug === workSlug);
    return work?.chapters.find((c) => c.slug === chapterSlug)?.content ?? "";
  }
  const slug = url.slice(STARTER_PREFIX.length);
  return STARTER_POSTS.find((p) => p.slug === slug)?.content ?? "";
}

/** Every bundled item's id: essays and stories. */
function starterIds(): string[] {
  return [...starterPosts().map((p) => p.id), ...starterWorks().map((w) => w.id)];
}

export function emptyIndex(): CmsIndex {
  return {
    version: 1,
    rev: 0,
    updatedAt: new Date(0).toISOString(),
    // A brand new site starts with the starter essays; they become normal posts once edited.
    posts: starterPosts(),
    works: starterWorks(),
    settings: { ...DEFAULT_SETTINGS },
    seenStarters: starterIds(),
  };
}

/** The essays that shipped before indexes tracked which starters they had seen. */
const FIRST_STARTERS = ["customers-dont-say-no-they-go-quiet", "kill-the-static-interface", "production-first-demo-second"].map(
  (slug) => `starter-${slug}`
);

/**
 * Settings that were saved while they still held an earlier default (never
 * edited by hand) move to the current default; anything Sibi wrote stays.
 */
const LEGACY_DEFAULTS: Partial<Record<keyof Settings, string[]>> = {
  fictionIntro: ["Elsewhere, I write fiction. This is where the stories live, a chapter at a time."],
  bio: [
    `I studied computer science at Oregon State University and shipped my first production software there, for the Oregon Department of Transportation. Since then I've been an independent AI architect, co founded and ran KayaDev AI as CEO, looked after risk and AI for device protection programs at Servify, and now I'm building SuprAgent with my co founder Nandini Muthuraman.

The thread through all of it is software that holds up in front of real people.`,
    `I studied computer science at Oregon State University and shipped my first production software there, for the Oregon Department of Transportation. Since then I've been an independent AI architect, co founded and ran KayaDev AI as CEO, owned risk and AI for global device protection programs at Servify, and now I'm building SuprAgent with my co founder Nandini Muthuraman.

The thread through all of it is software that holds up in front of real people. The other thread is stories. I write fiction, and this site is where I share it alongside everything else.`,
  ],
  nowList: [
    `Building: SuprAgent, the AI agent that sells for financial institutions
Writing: Essays here, and fiction a chapter at a time
Thinking about: Interfaces that compose themselves
Based in: Bengaluru, India`,
  ],
};

function upgradeSettings(stored: Partial<Settings>): Partial<Settings> {
  const next = { ...stored };
  for (const [key, olds] of Object.entries(LEGACY_DEFAULTS) as [keyof Settings, string[]][]) {
    const value = next[key];
    if (typeof value === "string" && olds.some((o) => o.trim() === value.trim())) delete next[key];
  }
  return next;
}

/** Fills gaps so older indexes keep working as fields are added. */
export function normalizeIndex(raw: Partial<CmsIndex> | null | undefined): CmsIndex {
  const base = emptyIndex();
  if (!raw) return base;
  // Starter essays added after this index was created join it once; one that was
  // deleted from /admin stays deleted, because it is already marked as seen.
  const posts = Array.isArray(raw.posts) ? raw.posts : [];
  const seen = new Set(raw.seenStarters ?? FIRST_STARTERS);
  const fresh = starterPosts().filter((s) => !seen.has(s.id) && !posts.some((p) => p.id === s.id || p.slug === s.slug));
  const works = Array.isArray(raw.works)
    ? raw.works.map((w) => ({ ...w, chapters: Array.isArray(w.chapters) ? w.chapters : [] }))
    : [];
  const freshWorks = starterWorks().filter((s) => !seen.has(s.id) && !works.some((w) => w.id === s.id || w.slug === s.slug));
  return {
    ...base,
    ...raw,
    posts: [...fresh, ...posts],
    seenStarters: starterIds(),
    works: [...freshWorks, ...works],
    settings: { ...DEFAULT_SETTINGS, ...upgradeSettings(raw.settings ?? {}) },
  };
}

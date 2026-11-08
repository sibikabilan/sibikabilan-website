import type { CmsIndex, PostMeta, Settings } from "./types";
import { STARTER_POSTS } from "@/content/starter-posts";
import { readingTime } from "@/lib/utils";

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
  fictionIntro: "Elsewhere, I write fiction. This is where the stories live, a chapter at a time.",
  bio: `I studied computer science at Oregon State University and shipped my first production software there, for the Oregon Department of Transportation. Since then I've been an independent AI architect, co founded and ran KayaDev AI as CEO, owned risk and AI for global device protection programs at Servify, and now I'm building SuprAgent with my co founder Nandini Muthuraman.

The thread through all of it is software that holds up in front of real people. The other thread is stories. I write fiction, and this site is where I share it alongside everything else.`,
  nowList: `Building: SuprAgent, the AI agent that sells for financial institutions
Writing: Essays here, and fiction a chapter at a time
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

export function starterContent(url: string): string | null {
  if (!url.startsWith(STARTER_PREFIX)) return null;
  const slug = url.slice(STARTER_PREFIX.length);
  return STARTER_POSTS.find((p) => p.slug === slug)?.content ?? "";
}

export function emptyIndex(): CmsIndex {
  return {
    version: 1,
    rev: 0,
    updatedAt: new Date(0).toISOString(),
    // A brand new site starts with the starter essays; they become normal posts once edited.
    posts: starterPosts(),
    works: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Fills gaps so older indexes keep working as fields are added. */
export function normalizeIndex(raw: Partial<CmsIndex> | null | undefined): CmsIndex {
  const base = emptyIndex();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    posts: Array.isArray(raw.posts) ? raw.posts : [],
    works: Array.isArray(raw.works)
      ? raw.works.map((w) => ({ ...w, chapters: Array.isArray(w.chapters) ? w.chapters : [] }))
      : [],
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) },
  };
}

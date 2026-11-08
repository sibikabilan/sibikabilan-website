import "server-only";
import { unstable_cache } from "next/cache";
import { loadIndex, readDoc } from "./repo";
import { emptyIndex, normalizeIndex } from "./defaults";
import type { ChapterMeta, CmsIndex, PostMeta, Settings, Work } from "./types";

export const CMS_TAG = "cms";

// Only stored content is cached. A site with nothing saved yet always reads the
// defaults from code, so changes to defaults or starter posts show up at once.
const cachedIndex = unstable_cache(
  async () => {
    const { index, objects } = await loadIndex();
    return objects.length ? index : null;
  },
  ["cms-index-v3"],
  { tags: [CMS_TAG], revalidate: 3600 }
);

// Document URLs are immutable, so their bodies can be cached forever.
const cachedDoc = unstable_cache(async (url: string) => readDoc(url), ["cms-doc-v1"], {
  tags: [CMS_TAG],
});

async function getIndex(): Promise<CmsIndex> {
  try {
    // Normalizing again keeps older cached shapes compatible with new fields.
    const stored = await cachedIndex();
    return stored ? normalizeIndex(stored) : emptyIndex();
  } catch (err) {
    // Failures are not cached; the site still renders with defaults.
    console.error("[cms] failed to load index", err);
    return emptyIndex();
  }
}

const byPublished = (a: { publishedAt: string | null }, b: { publishedAt: string | null }) =>
  (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");

export async function getSettings(): Promise<Settings> {
  return (await getIndex()).settings;
}

export async function getPublishedPosts(): Promise<PostMeta[]> {
  const { posts } = await getIndex();
  return posts.filter((p) => p.status === "published").sort(byPublished);
}

export async function getPublishedPost(slug: string) {
  const posts = await getPublishedPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  const post = posts[i];
  const content = post.contentUrl ? await cachedDoc(post.contentUrl) : "";
  return { post, content, newer: posts[i - 1] ?? null, older: posts[i + 1] ?? null };
}

export type PublicWork = Work & { chapters: ChapterMeta[] };

function publicWork(work: Work): PublicWork {
  return { ...work, chapters: work.chapters.filter((c) => c.status === "published") };
}

export async function getPublishedWorks(): Promise<PublicWork[]> {
  const { works } = await getIndex();
  return works.filter((w) => w.status === "published").map(publicWork);
}

export async function getPublishedWork(slug: string): Promise<PublicWork | null> {
  const works = await getPublishedWorks();
  return works.find((w) => w.slug === slug) ?? null;
}

export async function getPublishedChapter(workSlug: string, chapterSlug: string) {
  const work = await getPublishedWork(workSlug);
  if (!work) return null;
  const i = work.chapters.findIndex((c) => c.slug === chapterSlug);
  if (i < 0) return null;
  const chapter = work.chapters[i];
  const content = chapter.contentUrl ? await cachedDoc(chapter.contentUrl) : "";
  return {
    work,
    chapter,
    number: i + 1,
    content,
    prev: work.chapters[i - 1] ?? null,
    next: work.chapters[i + 1] ?? null,
  };
}

import "server-only";
import { getStore, type StoredObject } from "./store";
import { emptyIndex, normalizeIndex, STARTER_PREFIX, starterContent } from "./defaults";
import type {
  ChapterMeta,
  CmsIndex,
  PostMeta,
  Settings,
  Status,
  Work,
  WorkKind,
  WorkProgress,
} from "./types";
import { WORK_KINDS, WORK_PROGRESS } from "./types";
import { isAtmosphere } from "@/lib/atmosphere";
import { readingTime, slugify, wordCount } from "@/lib/utils";

const INDEX_PREFIX = "cms/index/";
const DOC_PREFIX = "cms/docs/";
const KEEP_INDEX_VERSIONS = 6;

/* ───────────────────────── index ───────────────────────── */

export async function loadIndex(): Promise<{ index: CmsIndex; objects: StoredObject[] }> {
  const store = getStore();
  const objects = await store.list(INDEX_PREFIX);
  objects.sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
  for (const obj of objects) {
    const text = await store.read(obj.url);
    if (!text) continue;
    try {
      return { index: normalizeIndex(JSON.parse(text)), objects };
    } catch {
      // A corrupt version: fall through to the previous one.
    }
  }
  return { index: emptyIndex(), objects };
}

async function writeIndex(index: CmsIndex, previous: StoredObject[]): Promise<void> {
  const store = getStore();
  index.rev += 1;
  index.updatedAt = new Date().toISOString();
  const stamp = String(Date.now()).padStart(15, "0");
  await store.put(`${INDEX_PREFIX}${stamp}-r${index.rev}.json`, JSON.stringify(index), "application/json");
  const stale = previous.slice(KEEP_INDEX_VERSIONS - 1).map((o) => o.url);
  if (stale.length) await store.remove(stale).catch(() => undefined);
}

export async function readDoc(url: string | null): Promise<string> {
  if (!url) return "";
  const bundled = starterContent(url);
  if (bundled !== null) return bundled;
  const text = await getStore().read(url);
  if (!text) return "";
  try {
    return (JSON.parse(text) as { content?: string }).content ?? "";
  } catch {
    return "";
  }
}

/* ───────────────────────── transactions ───────────────────────── */

class Tx {
  dirty = false;
  private garbage: string[] = [];
  constructor(public index: CmsIndex) {}

  async putDoc(key: string, content: string): Promise<string> {
    const obj = await getStore().put(
      `${DOC_PREFIX}${key}.json`,
      JSON.stringify({ content }),
      "application/json"
    );
    return obj.url;
  }

  discard(url: string | null | undefined) {
    if (url && !url.startsWith(STARTER_PREFIX)) this.garbage.push(url);
  }

  touch() {
    this.dirty = true;
  }

  async cleanup() {
    if (this.garbage.length) await getStore().remove(this.garbage).catch(() => undefined);
  }
}

let queue: Promise<unknown> = Promise.resolve();

/** Serializes writes within an instance and commits a new index version. */
function mutate<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const { index, objects } = await loadIndex();
    const tx = new Tx(index);
    const result = await fn(tx);
    if (tx.dirty) {
      await writeIndex(tx.index, objects);
      await tx.cleanup();
    }
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export class CmsError extends Error {}

function uniqueSlug(desired: string, taken: string[], fallback: string): string {
  const base = slugify(desired) || fallback;
  let slug = base;
  let n = 2;
  while (taken.includes(slug)) slug = `${base}-${n++}`;
  return slug;
}

function clean(s: unknown, max = 2000): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

function asStatus(s: unknown): Status {
  return s === "published" ? "published" : "draft";
}

function nextPublishedAt(status: Status, previous: string | null | undefined, override?: string | null) {
  if (override) {
    const d = new Date(override);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  if (status !== "published") return previous ?? null;
  return previous ?? new Date().toISOString();
}

/* ───────────────────────── posts ───────────────────────── */

export interface PostInput {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  tags?: string[];
  cover?: string | null;
  status?: Status;
  publishedAt?: string | null;
  content: string;
}

export function savePost(input: PostInput): Promise<PostMeta> {
  return mutate(async (tx) => {
    const title = clean(input.title, 200);
    if (!title) throw new CmsError("A post needs a title.");
    const posts = tx.index.posts;
    const existing = input.id ? posts.find((p) => p.id === input.id) : undefined;
    if (input.id && !existing) throw new CmsError("That post no longer exists.");

    const id = existing?.id ?? crypto.randomUUID();
    const slug = uniqueSlug(
      input.slug || title,
      posts.filter((p) => p.id !== id).map((p) => p.slug),
      `post-${id.slice(0, 6)}`
    );
    const content = typeof input.content === "string" ? input.content : "";
    const status = asStatus(input.status);
    const now = new Date().toISOString();

    const contentUrl = await tx.putDoc(`post-${id}`, content);
    tx.discard(existing?.contentUrl);

    const meta: PostMeta = {
      id,
      slug,
      title,
      excerpt: clean(input.excerpt, 600),
      tags: (input.tags ?? []).map((t) => clean(t, 40)).filter(Boolean).slice(0, 12),
      cover: input.cover ? clean(input.cover, 1000) : null,
      status,
      readingTime: readingTime(content),
      publishedAt: nextPublishedAt(status, existing?.publishedAt, input.publishedAt),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      contentUrl,
    };

    tx.index.posts = existing ? posts.map((p) => (p.id === id ? meta : p)) : [meta, ...posts];
    tx.touch();
    return meta;
  });
}

export function deletePost(id: string): Promise<void> {
  return mutate(async (tx) => {
    const post = tx.index.posts.find((p) => p.id === id);
    if (!post) return;
    tx.index.posts = tx.index.posts.filter((p) => p.id !== id);
    tx.discard(post.contentUrl);
    tx.touch();
  });
}

/* ───────────────────────── fiction ───────────────────────── */

export interface WorkInput {
  id?: string;
  title: string;
  slug?: string;
  tagline?: string;
  synopsis?: string;
  genre?: string;
  kind?: string;
  progress?: string;
  cover?: string | null;
  status?: Status;
}

export function saveWork(input: WorkInput): Promise<Work> {
  return mutate(async (tx) => {
    const title = clean(input.title, 200);
    if (!title) throw new CmsError("A story needs a title.");
    const works = tx.index.works;
    const existing = input.id ? works.find((w) => w.id === input.id) : undefined;
    if (input.id && !existing) throw new CmsError("That story no longer exists.");

    const id = existing?.id ?? crypto.randomUUID();
    const status = asStatus(input.status);
    const now = new Date().toISOString();
    const work: Work = {
      id,
      slug: uniqueSlug(
        input.slug || title,
        works.filter((w) => w.id !== id).map((w) => w.slug),
        `story-${id.slice(0, 6)}`
      ),
      title,
      tagline: clean(input.tagline, 300),
      synopsis: clean(input.synopsis, 6000),
      genre: clean(input.genre, 80),
      kind: (WORK_KINDS as readonly string[]).includes(input.kind ?? "")
        ? (input.kind as WorkKind)
        : "novel",
      progress: (WORK_PROGRESS as readonly string[]).includes(input.progress ?? "")
        ? (input.progress as WorkProgress)
        : "in progress",
      cover: input.cover ? clean(input.cover, 1000) : null,
      status,
      publishedAt: nextPublishedAt(status, existing?.publishedAt),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      chapters: existing?.chapters ?? [],
    };
    tx.index.works = existing ? works.map((w) => (w.id === id ? work : w)) : [work, ...works];
    tx.touch();
    return work;
  });
}

export function deleteWork(id: string): Promise<void> {
  return mutate(async (tx) => {
    const work = tx.index.works.find((w) => w.id === id);
    if (!work) return;
    work.chapters.forEach((c) => tx.discard(c.contentUrl));
    tx.index.works = tx.index.works.filter((w) => w.id !== id);
    tx.touch();
  });
}

export interface ChapterInput {
  id?: string;
  title: string;
  slug?: string;
  summary?: string;
  status?: Status;
  content: string;
}

export function saveChapter(workId: string, input: ChapterInput): Promise<ChapterMeta> {
  return mutate(async (tx) => {
    const work = tx.index.works.find((w) => w.id === workId);
    if (!work) throw new CmsError("That story no longer exists.");
    const title = clean(input.title, 200);
    if (!title) throw new CmsError("A chapter needs a title.");
    const existing = input.id ? work.chapters.find((c) => c.id === input.id) : undefined;
    if (input.id && !existing) throw new CmsError("That chapter no longer exists.");

    const id = existing?.id ?? crypto.randomUUID();
    const content = typeof input.content === "string" ? input.content : "";
    const status = asStatus(input.status);
    const now = new Date().toISOString();
    const contentUrl = await tx.putDoc(`chapter-${work.id}-${id}`, content);
    tx.discard(existing?.contentUrl);

    const chapter: ChapterMeta = {
      id,
      slug: uniqueSlug(
        input.slug || title,
        work.chapters.filter((c) => c.id !== id).map((c) => c.slug),
        `chapter-${work.chapters.length + 1}`
      ),
      title,
      summary: clean(input.summary, 600),
      status,
      wordCount: wordCount(content),
      publishedAt: nextPublishedAt(status, existing?.publishedAt),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      contentUrl,
    };
    work.chapters = existing
      ? work.chapters.map((c) => (c.id === id ? chapter : c))
      : [...work.chapters, chapter];
    work.updatedAt = now;
    tx.touch();
    return chapter;
  });
}

export function deleteChapter(workId: string, chapterId: string): Promise<void> {
  return mutate(async (tx) => {
    const work = tx.index.works.find((w) => w.id === workId);
    const chapter = work?.chapters.find((c) => c.id === chapterId);
    if (!work || !chapter) return;
    work.chapters = work.chapters.filter((c) => c.id !== chapterId);
    tx.discard(chapter.contentUrl);
    tx.touch();
  });
}

export function moveChapter(workId: string, chapterId: string, delta: -1 | 1): Promise<void> {
  return mutate(async (tx) => {
    const work = tx.index.works.find((w) => w.id === workId);
    if (!work) return;
    const i = work.chapters.findIndex((c) => c.id === chapterId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= work.chapters.length) return;
    const next = [...work.chapters];
    [next[i], next[j]] = [next[j], next[i]];
    work.chapters = next;
    tx.touch();
  });
}

/* ───────────────────────── settings ───────────────────────── */

export function saveSettings(input: Partial<Settings>): Promise<Settings> {
  return mutate(async (tx) => {
    const current = tx.index.settings;
    const next: Settings = { ...current };
    const strings: (keyof Settings)[] = [
      "heroEyebrow", "heroHeadline", "heroSub", "nowStatus", "location", "email",
      "linkedin", "github", "x", "companyUrl", "writingIntro", "fictionIntro", "bio", "nowList",
    ];
    for (const key of strings) {
      const max = key === "bio" ? 6000 : key === "nowList" ? 2000 : 1200;
      if (key in input) (next as unknown as Record<string, unknown>)[key] = clean(input[key], max);
    }
    if (typeof input.showWriting === "boolean") next.showWriting = input.showWriting;
    if (typeof input.showFiction === "boolean") next.showFiction = input.showFiction;
    if (isAtmosphere(input.defaultAtmosphere)) next.defaultAtmosphere = input.defaultAtmosphere;
    tx.index.settings = next;
    tx.touch();
    return next;
  });
}

/* ───────────────────────── media ───────────────────────── */

export async function saveMedia(name: string, body: Buffer, contentType: string): Promise<string> {
  const safe = slugify(name.replace(/\.[^.]+$/, "")) || "image";
  const ext = (name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "bin").toLowerCase();
  const month = new Date().toISOString().slice(0, 7);
  const obj = await getStore().put(`media/${month}/${safe}.${ext}`, body, contentType);
  return obj.url;
}

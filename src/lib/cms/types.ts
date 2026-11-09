import type { AtmosphereId } from "@/lib/atmosphere";

export type Status = "draft" | "published";

export interface PostMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  cover: string | null;
  status: Status;
  readingTime: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Pointer to the immutable blob that holds the markdown body. */
  contentUrl: string | null;
}

export interface Post extends PostMeta {
  content: string;
}

export interface ChapterMeta {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: Status;
  wordCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contentUrl: string | null;
}

export interface Chapter extends ChapterMeta {
  content: string;
}

export const WORK_KINDS = ["novel", "novella", "short story", "serial", "collection"] as const;
export type WorkKind = (typeof WORK_KINDS)[number];

export const WORK_PROGRESS = ["in progress", "complete", "on hiatus"] as const;
export type WorkProgress = (typeof WORK_PROGRESS)[number];

export interface Work {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  genre: string;
  kind: WorkKind;
  progress: WorkProgress;
  cover: string | null;
  status: Status;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  chapters: ChapterMeta[];
}

export interface Settings {
  heroEyebrow: string;
  heroHeadline: string;
  heroSub: string;
  nowStatus: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  x: string;
  companyUrl: string;
  defaultAtmosphere: AtmosphereId;
  showWriting: boolean;
  showFiction: boolean;
  writingIntro: string;
  fictionIntro: string;
  /** Markdown shown in the "person" section of the homepage. */
  bio: string;
  /** One item per line, "Label: text". Shown as the Now list. */
  nowList: string;
}

export interface CmsIndex {
  version: 1;
  rev: number;
  updatedAt: string;
  posts: PostMeta[];
  works: Work[];
  settings: Settings;
  /** Starter essays this index has already been offered, so deleting one keeps it deleted. */
  seenStarters?: string[];
}

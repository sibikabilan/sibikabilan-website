import { put, del, list } from "@vercel/blob";

export interface PostMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  coverUrl: string | null;
  published: boolean;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post extends PostMeta {
  content: string;
}

const MANIFEST = "blog/manifest.json";

async function fetchBlob<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function getManifestUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: MANIFEST });
  return blobs[0]?.url ?? null;
}

async function saveManifest(posts: PostMeta[]): Promise<void> {
  await put(MANIFEST, JSON.stringify(posts), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const url = await getManifestUrl();
  if (!url) return [];
  return (await fetchBlob<PostMeta[]>(url)) ?? [];
}

export async function getPublishedPosts(): Promise<PostMeta[]> {
  const all = await getAllPosts();
  return all
    .filter((p) => p.published)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPost(slug: string): Promise<Post | null> {
  const { blobs } = await list({ prefix: `blog/posts/${slug}.json` });
  if (!blobs[0]) return null;
  return fetchBlob<Post>(blobs[0].url);
}

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "readingTime">
): Promise<Post> {
  const now = new Date().toISOString();
  const post: Post = {
    ...data,
    id: crypto.randomUUID(),
    readingTime: Math.ceil(data.content.split(/\s+/).length / 200),
    createdAt: now,
    updatedAt: now,
  };

  await put(`blog/posts/${post.slug}.json`, JSON.stringify(post), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  const manifest = await getAllPosts();
  const { content: _c, ...meta } = post;
  await saveManifest([...manifest, meta]);

  return post;
}

export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, "id" | "createdAt">>
): Promise<Post | null> {
  const manifest = await getAllPosts();
  const idx = manifest.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const existing = await getPost(manifest[idx].slug);
  if (!existing) return null;

  const updated: Post = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    readingTime: updates.content
      ? Math.ceil(updates.content.split(/\s+/).length / 200)
      : existing.readingTime,
  };

  // Rename blob if slug changed
  if (updates.slug && updates.slug !== existing.slug) {
    const { blobs } = await list({ prefix: `blog/posts/${existing.slug}.json` });
    if (blobs[0]) await del(blobs[0].url);
  }

  await put(`blog/posts/${updated.slug}.json`, JSON.stringify(updated), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  const { content: _c, ...meta } = updated;
  manifest[idx] = meta;
  await saveManifest(manifest);

  return updated;
}

export async function deletePost(id: string): Promise<boolean> {
  const manifest = await getAllPosts();
  const idx = manifest.findIndex((p) => p.id === id);
  if (idx === -1) return false;

  const { blobs } = await list({ prefix: `blog/posts/${manifest[idx].slug}.json` });
  if (blobs[0]) await del(blobs[0].url);

  manifest.splice(idx, 1);
  await saveManifest(manifest);
  return true;
}

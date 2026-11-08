import "server-only";
import { put, list, del } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Storage driver for the CMS.
 *
 * Production uses Vercel Blob. Every write gets a random suffix, so every URL
 * is immutable: CDN caching can never serve a stale document, and draft
 * content lives at URLs nobody can guess. The newest index is found with
 * list(), which reads the Blob API directly rather than the CDN.
 *
 * Local development without a Blob token falls back to a gitignored .data/
 * folder with the same semantics, so the admin works end to end offline.
 */

export interface StoredObject {
  pathname: string;
  url: string;
  uploadedAt: number;
}

export interface Store {
  kind: "blob" | "fs";
  list(prefix: string): Promise<StoredObject[]>;
  put(pathname: string, body: Buffer | string, contentType: string): Promise<StoredObject>;
  read(url: string): Promise<string | null>;
  remove(urls: string[]): Promise<void>;
}

const IMMUTABLE_MAX_AGE = 60 * 60 * 24 * 365;

function blobStore(): Store {
  return {
    kind: "blob",
    async list(prefix) {
      const out: StoredObject[] = [];
      let cursor: string | undefined;
      do {
        const page = await list({ prefix, cursor, limit: 1000 });
        for (const b of page.blobs) {
          out.push({ pathname: b.pathname, url: b.url, uploadedAt: new Date(b.uploadedAt).getTime() });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return out;
    },
    async put(pathname, body, contentType) {
      const res = await put(pathname, body, {
        access: "public",
        addRandomSuffix: true,
        contentType,
        cacheControlMaxAge: IMMUTABLE_MAX_AGE,
      });
      return { pathname: res.pathname, url: res.url, uploadedAt: Date.now() };
    },
    async read(url) {
      // URLs are immutable, so the response can be cached indefinitely.
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) return null;
      return res.text();
    },
    async remove(urls) {
      if (urls.length) await del(urls);
    },
  };
}

const FS_ROOT = path.join(process.cwd(), ".data");
const FS_URL_PREFIX = "/api/media/";

function withSuffix(pathname: string): string {
  const ext = path.extname(pathname);
  const base = pathname.slice(0, pathname.length - ext.length);
  return `${base}-${crypto.randomBytes(9).toString("base64url")}${ext}`;
}

async function walk(dir: string): Promise<string[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      return e.isDirectory() ? walk(full) : Promise.resolve([full]);
    })
  );
  return files.flat();
}

function fsStore(): Store {
  return {
    kind: "fs",
    async list(prefix) {
      const files = await walk(FS_ROOT);
      const out: StoredObject[] = [];
      for (const file of files) {
        const pathname = path.relative(FS_ROOT, file).split(path.sep).join("/");
        if (!pathname.startsWith(prefix)) continue;
        const stat = await fs.stat(file);
        out.push({ pathname, url: FS_URL_PREFIX + pathname, uploadedAt: stat.mtimeMs });
      }
      return out;
    },
    async put(pathname, body) {
      const finalPath = withSuffix(pathname);
      const full = path.join(FS_ROOT, finalPath);
      await fs.mkdir(path.dirname(full), { recursive: true });
      await fs.writeFile(full, body);
      return { pathname: finalPath, url: FS_URL_PREFIX + finalPath, uploadedAt: Date.now() };
    },
    async read(url) {
      const file = fsPathFromUrl(url);
      if (!file) return null;
      try {
        return await fs.readFile(file, "utf8");
      } catch {
        return null;
      }
    },
    async remove(urls) {
      await Promise.all(
        urls.map(async (u) => {
          const file = fsPathFromUrl(u);
          if (file) await fs.rm(file, { force: true });
        })
      );
    },
  };
}

/** Maps a local media URL back to a file inside .data, refusing traversal. */
export function fsPathFromUrl(url: string): string | null {
  if (!url.startsWith(FS_URL_PREFIX)) return null;
  const rel = decodeURIComponent(url.slice(FS_URL_PREFIX.length));
  const full = path.resolve(FS_ROOT, rel);
  if (!full.startsWith(FS_ROOT + path.sep)) return null;
  return full;
}

let cached: Store | null = null;

export function getStore(): Store {
  if (cached) return cached;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    cached = blobStore();
  } else if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is missing. Connect a Vercel Blob store to this project."
    );
  } else {
    cached = fsStore();
  }
  return cached;
}

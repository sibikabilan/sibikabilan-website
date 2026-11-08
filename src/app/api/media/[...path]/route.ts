import { promises as fs } from "node:fs";
import path from "node:path";
import { fsPathFromUrl } from "@/lib/cms/store";

/** Serves locally stored media in development. Production media lives on Vercel Blob. */
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".json": "application/json",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    return new Response("Not found", { status: 404 });
  }
  const { path: parts } = await ctx.params;
  // Only media is browsable; CMS documents stay server side.
  if (parts[0] !== "media") return new Response("Not found", { status: 404 });
  const file = fsPathFromUrl(`/api/media/${parts.map(encodeURIComponent).join("/")}`);
  if (!file) return new Response("Not found", { status: 404 });
  try {
    const body = await fs.readFile(file);
    return new Response(body, {
      headers: {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

import { NextRequest } from "next/server";
import { getAllPosts, createPost } from "@/lib/blob";

export async function GET() {
  const posts = await getAllPosts();
  const sorted = [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return Response.json({ posts: sorted });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, tags, content, slug, coverUrl, published } = body;

  if (!title || !content || !slug) {
    return Response.json(
      { error: "title, slug and content are required" },
      { status: 400 }
    );
  }

  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const tagsArray: string[] = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
    ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  const post = await createPost({
    slug: safeSlug,
    title,
    description: description ?? "",
    tags: tagsArray,
    content,
    coverUrl: coverUrl ?? null,
    published: published ?? false,
  });

  return Response.json({ post });
}

import { NextRequest } from "next/server";
import { getPost, updatePost, deletePost, getAllPosts } from "@/lib/blob";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // id is either the post uuid or its slug
  const manifest = await getAllPosts();
  const meta = manifest.find((p) => p.id === id || p.slug === id);
  if (!meta) return Response.json({ error: "Not found" }, { status: 404 });

  const post = await getPost(meta.slug);
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ post });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updated = await updatePost(id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ post: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deletePost(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}

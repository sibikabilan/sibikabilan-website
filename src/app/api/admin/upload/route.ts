import { NextRequest } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const pathname = `blog/images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return Response.json({ url: blob.url });
}

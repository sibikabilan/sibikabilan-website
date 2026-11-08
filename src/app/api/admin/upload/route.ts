import { isAdmin } from "@/lib/session";
import { saveMedia } from "@/lib/cms/repo";

const MAX_BYTES = 4_400_000; // stays under the 4.5 MB serverless body limit
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return Response.json({ error: "Use a JPEG, PNG, WebP, AVIF or GIF image." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "That image is over 4 MB even after compression." }, { status: 413 });
  }

  try {
    const url = await saveMedia(file.name || "image", Buffer.from(await file.arrayBuffer()), file.type);
    return Response.json({ url });
  } catch (err) {
    console.error("[upload] failed", err);
    return Response.json({ error: "Upload failed. Check the storage connection." }, { status: 500 });
  }
}

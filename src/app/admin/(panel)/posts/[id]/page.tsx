import { notFound } from "next/navigation";
import { loadIndex, readDoc } from "@/lib/cms/repo";
import { PostEditor } from "@/components/admin/PostEditor";

export const metadata = { title: "Edit essay" };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { index } = await loadIndex();
  const post = index.posts.find((p) => p.id === id);
  if (!post) notFound();
  const content = await readDoc(post.contentUrl);
  return (
    <PostEditor
      key={post.updatedAt}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        tags: post.tags.join(", "),
        cover: post.cover,
        status: post.status,
        content,
      }}
    />
  );
}

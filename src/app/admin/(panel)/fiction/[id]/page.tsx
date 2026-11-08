import { notFound } from "next/navigation";
import { loadIndex } from "@/lib/cms/repo";
import { WorkEditor } from "@/components/admin/WorkEditor";

export const metadata = { title: "Edit story" };

export default async function EditWork({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { index } = await loadIndex();
  const work = index.works.find((w) => w.id === id);
  if (!work) notFound();
  return (
    <WorkEditor
      key={work.updatedAt}
      chapters={work.chapters}
      initial={{
        id: work.id,
        title: work.title,
        slug: work.slug,
        tagline: work.tagline,
        synopsis: work.synopsis,
        genre: work.genre,
        kind: work.kind,
        progress: work.progress,
        cover: work.cover,
        status: work.status,
      }}
    />
  );
}

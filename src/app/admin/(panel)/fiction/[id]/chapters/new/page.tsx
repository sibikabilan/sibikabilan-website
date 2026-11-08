import { notFound } from "next/navigation";
import { loadIndex } from "@/lib/cms/repo";
import { ChapterEditor } from "@/components/admin/ChapterEditor";

export const metadata = { title: "New chapter" };

export default async function NewChapter({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { index } = await loadIndex();
  const work = index.works.find((w) => w.id === id);
  if (!work) notFound();
  return (
    <ChapterEditor
      workId={work.id}
      workSlug={work.slug}
      workTitle={work.title}
      workLive={work.status === "published"}
      number={work.chapters.length + 1}
      initial={{ title: "", slug: "", summary: "", status: "draft", content: "" }}
    />
  );
}

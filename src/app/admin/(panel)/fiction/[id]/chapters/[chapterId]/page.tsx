import { notFound } from "next/navigation";
import { loadIndex, readDoc } from "@/lib/cms/repo";
import { ChapterEditor } from "@/components/admin/ChapterEditor";

export const metadata = { title: "Edit chapter" };

export default async function EditChapter({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;
  const { index } = await loadIndex();
  const work = index.works.find((w) => w.id === id);
  const i = work?.chapters.findIndex((c) => c.id === chapterId) ?? -1;
  if (!work || i < 0) notFound();
  const chapter = work.chapters[i];
  const content = await readDoc(chapter.contentUrl);
  return (
    <ChapterEditor
      key={chapter.updatedAt}
      workId={work.id}
      workSlug={work.slug}
      workTitle={work.title}
      workLive={work.status === "published"}
      number={i + 1}
      initial={{ id: chapter.id, title: chapter.title, slug: chapter.slug, summary: chapter.summary, status: chapter.status, content }}
    />
  );
}

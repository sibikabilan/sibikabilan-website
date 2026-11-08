import { WorkEditor } from "@/components/admin/WorkEditor";

export const metadata = { title: "New story" };

export default function NewWork() {
  return (
    <WorkEditor
      chapters={[]}
      initial={{ title: "", slug: "", tagline: "", synopsis: "", genre: "", kind: "novel", progress: "in progress", cover: null, status: "draft" }}
    />
  );
}

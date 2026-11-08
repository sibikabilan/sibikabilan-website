import { PostEditor } from "@/components/admin/PostEditor";

export const metadata = { title: "New essay" };

export default function NewPost() {
  return (
    <PostEditor initial={{ title: "", slug: "", excerpt: "", tags: "", cover: null, status: "draft", content: "" }} />
  );
}

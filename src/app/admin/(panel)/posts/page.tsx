import Link from "next/link";
import { loadIndex } from "@/lib/cms/repo";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/admin/fields";

export const metadata = { title: "Writing" };

export default async function PostsAdmin() {
  const { index } = await loadIndex();
  const posts = [...index.posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Writing</p>
          <h1 className="display mt-3 text-5xl text-ink">Essays</h1>
        </div>
        <Link href="/admin/posts/new" className="btn btn-key">New essay</Link>
      </div>
      <ul className="mt-10 divide-y divide-[var(--line)] rounded-2xl border border-line">
        {posts.length === 0 && <li className="p-6 text-sm text-muted">No essays yet.</li>}
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/posts/${p.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02]">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] text-ink">{p.title}</span>
                <span className="text-xs text-faint">/blog/{p.slug} · {p.readingTime} min · updated {formatDate(p.updatedAt, "short")}</span>
              </span>
              {p.id.startsWith("starter-") && (
                <span className="hidden rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:inline">Starter</span>
              )}
              <StatusPill status={p.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

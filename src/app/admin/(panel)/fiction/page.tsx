import Link from "next/link";
import { loadIndex } from "@/lib/cms/repo";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/admin/fields";

export const metadata = { title: "Fiction" };

export default async function FictionAdmin() {
  const { index } = await loadIndex();
  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fiction</p>
          <h1 className="display mt-3 text-5xl text-ink">Stories</h1>
        </div>
        <Link href="/admin/fiction/new" className="btn btn-key">New story</Link>
      </div>
      {index.works.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] p-10">
          <p className="display text-3xl text-ink">The shelf is empty.</p>
          <p className="mt-2 text-sm text-muted">Create a story, then add chapters to it. Publish chapters one at a time.</p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {index.works.map((w) => (
            <li key={w.id}>
              <Link href={`/admin/fiction/${w.id}`} className="flex gap-4 rounded-2xl border border-line bg-[var(--bg-2)] p-4 hover:border-[var(--line-strong)]">
                <span className="h-24 w-[72px] shrink-0 overflow-hidden rounded bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {w.cover && <img src={w.cover} alt="" className="h-full w-full object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="display block truncate text-2xl text-ink">{w.title}</span>
                  <span className="mt-1 block text-xs capitalize text-faint">
                    {w.kind} · {w.chapters.length} chapters · {w.progress}
                  </span>
                  <span className="mt-3 flex items-center gap-3">
                    <StatusPill status={w.status} />
                    <span className="text-xs text-faint">updated {formatDate(w.updatedAt, "short")}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

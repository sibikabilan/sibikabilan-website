import Link from "next/link";
import { loadIndex } from "@/lib/cms/repo";
import { getStore } from "@/lib/cms/store";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/admin/fields";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const { index } = await loadIndex();
  const store = getStore();
  const chapters = index.works.flatMap((w) => w.chapters);
  const stats = [
    { k: "Essays", v: index.posts.length, sub: `${index.posts.filter((p) => p.status === "published").length} published` },
    { k: "Stories", v: index.works.length, sub: `${index.works.filter((w) => w.status === "published").length} published` },
    { k: "Chapters", v: chapters.length, sub: `${chapters.reduce((n, c) => n + c.wordCount, 0).toLocaleString()} words` },
  ];
  const recent = [
    ...index.posts.map((p) => ({ title: p.title, href: `/admin/posts/${p.id}`, kind: "Essay", status: p.status, at: p.updatedAt })),
    ...index.works.map((w) => ({ title: w.title, href: `/admin/fiction/${w.id}`, kind: "Story", status: w.status, at: w.updatedAt })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  return (
    <div className="max-w-5xl">
      <p className="eyebrow">Overview</p>
      <h1 className="display mt-3 text-5xl text-ink">Welcome back.</h1>
      {store.kind === "fs" && (
        <p className="mt-4 rounded-xl border border-amber-200/20 bg-amber-200/5 px-4 py-3 text-sm text-amber-100/80">
          Local mode: content is saved to the .data folder on this machine. On Vercel it is saved to Blob storage.
        </p>
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.k} className="rounded-2xl border border-line bg-[var(--bg-2)] p-6">
            <p className="eyebrow">{s.k}</p>
            <p className="display mt-3 text-5xl text-ink">{s.v}</p>
            <p className="mt-1 text-xs text-muted">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/posts/new" className="btn btn-key">New essay</Link>
        <Link href="/admin/fiction/new" className="btn btn-ghost">New story</Link>
        <Link href="/admin/settings" className="btn btn-ghost">Site settings</Link>
      </div>
      <h2 className="display mt-14 text-3xl text-ink">Recently edited</h2>
      <ul className="mt-4 divide-y divide-[var(--line)] rounded-2xl border border-line">
        {recent.length === 0 && <li className="p-5 text-sm text-muted">Nothing yet.</li>}
        {recent.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02]">
              <span className="w-14 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{r.kind}</span>
              <span className="min-w-0 flex-1 truncate text-ink">{r.title}</span>
              <StatusPill status={r.status} />
              <span className="hidden w-28 text-right text-xs text-faint sm:block">{formatDate(r.at, "short")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

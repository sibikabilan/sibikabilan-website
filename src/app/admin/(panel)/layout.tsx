import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/session";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: { default: "Editing room", template: "%s · Editing room" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-line bg-[var(--bg-2)] md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-full flex-col p-5">
          <Link href="/admin" className="block">
            <p className="eyebrow">Editing room</p>
            <p className="display mt-1 text-2xl text-ink">
              Sibi <em className="text-ink-2">Kabilan</em>
            </p>
          </Link>
          <AdminNav />
          <div className="mt-auto hidden space-y-2 pt-6 md:block">
            <a href="/" target="_blank" className="block text-xs text-muted hover:text-ink">
              View site ↗
            </a>
            <form action={logout}>
              <button type="submit" className="text-xs text-muted hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}

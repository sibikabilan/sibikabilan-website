"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/posts", label: "Writing" },
  { href: "/admin/fiction", label: "Fiction" },
  { href: "/admin/settings", label: "Site settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto md:mt-10 md:flex-col" aria-label="Admin">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-white/[0.06] text-ink" : "text-muted hover:bg-white/[0.03] hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

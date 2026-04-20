import Link from "next/link";
import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} {SITE.name}
          </p>

          <div className="flex items-center gap-6">
            {SITE.links.linkedin && (
              <Link
                href={SITE.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
              >
                LinkedIn
              </Link>
            )}
            {SITE.links.github && (
              <Link
                href={SITE.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
              >
                GitHub
              </Link>
            )}
            <Link
              href={`mailto:${SITE.email}`}
              className="text-xs font-medium uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
            >
              Email
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

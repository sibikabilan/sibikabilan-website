import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg">
        <h1 className="text-hero text-foreground">404</h1>
        <hr className="editorial-rule my-6" />
        <p className="font-serif text-xl text-muted">
          This page doesn&apos;t exist. Perhaps it was moved, or perhaps it never was.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}

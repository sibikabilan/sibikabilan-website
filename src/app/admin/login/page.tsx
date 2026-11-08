import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 30%, color-mix(in oklab, var(--beam) 10%, transparent), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <p className="eyebrow text-center">The editing room</p>
        <h1 className="display mt-4 text-center text-5xl text-ink">
          Sibi <em className="text-ink-2">Kabilan</em>
        </h1>
        <LoginForm />
        <p className="mt-8 text-center text-xs text-faint">
          <Link href="/" className="link-sweep">
            ← Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AtmospherePanel } from "./AtmospherePanel";
import { cx } from "@/lib/utils";

interface NavProps {
  showWriting: boolean;
  showFiction: boolean;
  companyUrl: string;
}

export function Nav({ showWriting, showFiction }: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [atmo, setAtmo] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close overlays whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenu(false);
    setAtmo(false);
  }, [pathname]);

  const links = [
    { href: "/#story", label: "Story" },
    { href: "/#now", label: "Work" },
    { href: "/#about", label: "About" },
    ...(showWriting ? [{ href: "/blog", label: "Writing" }] : []),
    ...(showFiction ? [{ href: "/fiction", label: "Fiction" }] : []),
  ];

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-700",
        scrolled ? "bg-[color-mix(in_oklab,var(--bg)_72%,transparent)] backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[var(--nav-h)] max-w-[1400px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="group flex items-center gap-3" aria-label="Sibi Kabilan, home">
          <span className="relative grid h-9 w-9 place-items-center rounded-full border border-line font-display text-lg italic text-ink transition-colors duration-500 group-hover:border-[color:var(--key)]">
            S
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.24em] text-ink-2 sm:block">
            Sibi Kabilan
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cx(
                "link-sweep text-[13px] tracking-wide transition-colors",
                isActive(l.href) ? "text-[color:var(--key)]" : "text-ink-2 hover:text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              data-atmosphere-trigger
              onClick={() => setAtmo((v) => !v)}
              aria-expanded={atmo}
              className="flex h-9 items-center gap-2 rounded-full border border-line px-3 text-[12px] text-ink-2 transition-colors hover:border-[color:var(--key)] hover:text-ink"
            >
              <span className="relative h-3.5 w-3.5 rounded-full" style={{ background: "conic-gradient(var(--key), var(--rim), var(--key))" }} />
              <span className="hidden sm:inline">Atmosphere</span>
            </button>
            <AtmospherePanel open={atmo} onClose={() => setAtmo(false)} />
          </div>
          <Link
            href="/#contact"
            className="hidden h-9 items-center rounded-full bg-[var(--key)] px-4 text-[12px] font-medium text-[#0b0b0d] transition-shadow duration-500 hover:shadow-[0_0_30px_color-mix(in_oklab,var(--key)_30%,transparent)] lg:flex"
          >
            Say hello
          </Link>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-line md:hidden"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <span className="flex flex-col gap-1">
              <i className="block h-px w-4 bg-ink" />
              <i className="block h-px w-4 bg-ink" />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-[var(--bg)] px-6 pb-10 pt-6"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow">Menu</span>
              <button type="button" onClick={() => setMenu(false)} className="eyebrow text-ink" aria-label="Close menu">
                Close
              </button>
            </div>
            <nav className="mt-16 flex flex-col gap-5" aria-label="Mobile">
              {[{ href: "/", label: "Home" }, ...links].map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={l.href} onClick={() => setMenu(false)} className="display text-5xl text-ink">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <Link href="/#contact" onClick={() => setMenu(false)} className="btn btn-key mt-auto justify-center">
              Say hello
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

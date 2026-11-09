"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AtmospherePanel } from "./AtmospherePanel";
import { Mark } from "./Mark";
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
    { href: "/journey", label: "Journey" },
    { href: "/#now", label: "Work" },
    { href: "/#about", label: "About" },
    ...(showWriting ? [{ href: "/blog", label: "Blog" }] : []),
    ...(showFiction ? [{ href: "/fiction", label: "Fiction" }] : []),
  ];

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  // Frosted pills keep each control legible over whatever scrolls beneath; the bar itself stays clear.
  const glass = cx(
    "border transition-[background-color,border-color,backdrop-filter] duration-500",
    scrolled
      ? "border-white/[0.08] bg-[color-mix(in_oklab,var(--bg)_42%,transparent)] backdrop-blur-xl"
      : "border-transparent bg-transparent"
  );
  const iconBtn = "grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-[color-mix(in_oklab,var(--bg)_42%,transparent)] backdrop-blur-xl transition-colors duration-500";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[var(--nav-h)] max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="pointer-events-auto group grid h-11 w-11 place-items-center text-ink [filter:drop-shadow(0_1px_10px_rgba(0,0,0,0.55))]"
          aria-label="Sibi Kabilan, home"
        >
          <Mark size={26} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]" />
        </Link>

        <nav className={cx("pointer-events-auto hidden h-10 items-center gap-7 rounded-full px-6 md:flex", glass)} aria-label="Primary">
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

        <div className="pointer-events-auto flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              data-atmosphere-trigger
              onClick={() => setAtmo((v) => !v)}
              aria-expanded={atmo}
              aria-label="Atmosphere"
              title="Atmosphere"
              className={cx(iconBtn, "hover:border-[color:var(--key)]")}
            >
              <span
                className="h-4 w-4 rounded-full shadow-[0_0_12px_color-mix(in_oklab,var(--key)_35%,transparent)]"
                style={{ background: "conic-gradient(from 210deg, var(--key), var(--rim), var(--beam), var(--key))" }}
              />
            </button>
            <AtmospherePanel open={atmo} onClose={() => setAtmo(false)} />
          </div>
          <Link
            href="/#contact"
            aria-label="Say hello"
            title="Say hello"
            className="hidden h-10 w-10 place-items-center rounded-full bg-[var(--key)] text-[#0b0b0d] transition-shadow duration-500 hover:shadow-[0_0_30px_color-mix(in_oklab,var(--key)_35%,transparent)] md:grid"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 5.5h16a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-9l-4.5 3.5V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M8 11.25h.01M12 11.25h.01M16 11.25h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </Link>
          <button type="button" className={cx(iconBtn, "md:hidden")} onClick={() => setMenu(true)} aria-label="Open menu">
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
            data-touch-native
            className="pointer-events-auto fixed inset-0 z-[70] flex flex-col bg-[var(--bg)] px-6 pb-10 pt-6"
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

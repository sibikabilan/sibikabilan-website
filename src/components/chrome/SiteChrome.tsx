"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { initAtmosphere, sceneStore, useAtmosphere, wheelGates } from "@/lib/stores";
import type { AtmosphereId } from "@/lib/atmosphere";
import { installTouchSteps } from "@/lib/touchSteps";

const ParticleScene = dynamic(() => import("@/components/scene/ParticleScene"), { ssr: false });

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Watches [data-scene] sections and tells the particle field what to become. */
function useSceneDirector() {
  const pathname = usePathname();
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    if (!nodes.length) {
      sceneStore.set({ target: "network", side: 0, opacity: 0.3, anchor: null, mode: "drift" });
      return;
    }
    let active: HTMLElement = nodes[0];
    const measure = () => {
      const a = active.querySelector<HTMLElement>("[data-scene-anchor]");
      if (!a) return null;
      const r = a.getBoundingClientRect();
      return {
        x: ((r.left + r.width / 2) / window.innerWidth) * 2 - 1,
        y: -(((r.top + r.height / 2) / window.innerHeight) * 2 - 1),
        size: r.width / window.innerWidth,
      };
    };
    const apply = (el: HTMLElement) => {
      active = el;
      sceneStore.set({
        target: el.dataset.scene === "halo" ? "halo" : "network",
        mode: el.dataset.sceneMode === "prologue" ? "prologue" : "drift",
        side: Number(el.dataset.sceneSide ?? 0),
        opacity: Number(el.dataset.sceneOpacity ?? 1),
        anchor: measure(),
      });
    };
    apply(nodes[0]);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) apply(e.target as HTMLElement);
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    nodes.forEach((n) => io.observe(n));
    let raf = 0;
    const track = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const anchor = measure();
        if (anchor || sceneStore.get().anchor) sceneStore.set({ anchor });
      });
    };
    window.addEventListener("scroll", track, { passive: true });
    window.addEventListener("resize", track);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", track);
      window.removeEventListener("resize", track);
    };
  }, [pathname]);
}

function useSmoothScroll(enabled: boolean) {
  const pathname = usePathname();
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      duration: 1.25,
      smoothWheel: true,
      anchors: { offset: -40 },
      virtualScroll: (data) => {
        for (const gate of wheelGates) if (!gate(data)) return false;
        return true;
      },
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [enabled]);

  useEffect(() => {
    if (window.location.hash) return;
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
}

function useSpotlight(enabled: boolean) {
  useEffect(() => {
    if (!enabled || window.matchMedia("(pointer: coarse)").matches) return;
    const root = document.documentElement;
    let raf = 0;
    let x = -1;
    let y = -1;
    // Sections marked data-spotlight="off" (the smoke, the photographs, the book, the hallway)
    // already carry their own light; the cursor glow fades out over them.
    const check = () => {
      if (x < 0) return;
      const el = document.elementFromPoint(x, y);
      const off = !!el?.closest('[data-spotlight="off"]');
      if ((root.dataset.spot === "off") !== off) root.dataset.spot = off ? "off" : "on";
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${x}px`);
        root.style.setProperty("--my", `${y}px`);
        check();
      });
    };
    let scrollRaf = 0;
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(check);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);
}

export function SiteChrome({ defaultAtmosphere }: { defaultAtmosphere: AtmosphereId }) {
  const { motion, ready } = useAtmosphere();
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    initAtmosphere(defaultAtmosphere);
  }, [defaultAtmosphere]);

  // Phones: one swipe moves one step through the pinned sections.
  useEffect(() => installTouchSteps(), []);

  // The particle field is atmosphere, not content. It waits for the page to
  // finish loading and the browser to go idle, so three.js never competes with
  // the first paint or hydration; it fades in on its own once mounted.
  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    let timer = 0;
    const w = window as IdleWindow;
    // Detection must run in the browser; it cannot be known during SSR.
    const mount = () => {
      if (!cancelled) setWebgl(hasWebGL());
    };
    const start = () => {
      if (w.requestIdleCallback) idle = w.requestIdleCallback(mount, { timeout: 2000 });
      else timer = window.setTimeout(mount, 200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      if (idle) w.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, []);

  const cinematic = ready && motion === "cinematic";
  useSceneDirector();
  useSmoothScroll(cinematic);
  useSpotlight(cinematic);

  return (
    <>
      {webgl ? (
        <ParticleScene />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 50% at 70% 30%, color-mix(in oklab, var(--beam) 14%, transparent), transparent 70%)",
          }}
        />
      )}
      <div className="vignette" aria-hidden />
      <div className="spotlight" aria-hidden style={{ opacity: cinematic ? 1 : 0 }} />
      <div className="grain" aria-hidden />
    </>
  );
}

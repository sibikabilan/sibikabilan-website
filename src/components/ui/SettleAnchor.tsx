"use client";

import { useEffect, useRef } from "react";
import { settleAnchors } from "@/lib/touchSteps";

/** A spot that settles just under the nav when you scroll down onto it on a phone (see touchSteps). */
export function SettleAnchor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    settleAnchors.add(el);
    return () => {
      settleAnchors.delete(el);
    };
  }, []);
  return <div ref={ref} aria-hidden className="h-0" />;
}

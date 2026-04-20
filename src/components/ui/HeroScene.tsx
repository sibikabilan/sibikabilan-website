"use client";

import { useRef, useEffect } from "react";

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const blobs = el.querySelectorAll<HTMLDivElement>("[data-blob]");

    const handleMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    el.addEventListener("mousemove", handleMouse);

    const animate = () => {
      currentRef.current.x += (mouseRef.current.x - currentRef.current.x) * 0.02;
      currentRef.current.y += (mouseRef.current.y - currentRef.current.y) * 0.02;

      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      blobs.forEach((blob, i) => {
        const intensity = 60 + i * 25;
        const offsetX = (cx - 0.5) * intensity;
        const offsetY = (cy - 0.5) * intensity * 0.7;
        blob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      el.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Primary warm blob, top-right */}
      <div
        data-blob
        className="absolute -right-[15%] -top-[25%] h-[80vh] w-[80vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.28) 0%, rgba(217,119,6,0.15) 40%, transparent 70%)",
          filter: "blur(60px)",
          animation: "heroBlob1 18s ease-in-out infinite",
        }}
      />
      {/* Deep gold blob, center-left */}
      <div
        data-blob
        className="absolute -left-[10%] top-[20%] h-[65vh] w-[65vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(161,98,7,0.25) 0%, rgba(133,77,14,0.12) 40%, transparent 70%)",
          filter: "blur(70px)",
          animation: "heroBlob2 22s ease-in-out infinite",
        }}
      />
      {/* Warm amber blob, bottom */}
      <div
        data-blob
        className="absolute -bottom-[15%] right-[15%] h-[70vh] w-[70vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(245,158,11,0.10) 40%, transparent 70%)",
          filter: "blur(80px)",
          animation: "heroBlob3 20s ease-in-out infinite",
        }}
      />
      {/* Bright accent blob, floating */}
      <div
        data-blob
        className="absolute left-[30%] top-[5%] h-[45vh] w-[45vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(202,138,4,0.20) 0%, rgba(161,98,7,0.08) 50%, transparent 70%)",
          filter: "blur(50px)",
          animation: "heroBlob4 15s ease-in-out infinite",
        }}
      />
      {/* Subtle peach warmth, bottom-left */}
      <div
        data-blob
        className="absolute -bottom-[5%] -left-[5%] h-[50vh] w-[50vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(234,179,8,0.18) 0%, rgba(202,138,4,0.06) 50%, transparent 70%)",
          filter: "blur(90px)",
          animation: "heroBlob1 25s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}

import type { NextConfig } from "next";

/**
 * Pictures, clips and marks in /public keep their names when they're replaced,
 * so they get a month of freshness and a year of stale-while-revalidate rather
 * than `immutable`: repeat visits skip the network, and a swapped file still
 * reaches everyone within a month (sooner on the next visit after it). Fonts
 * and scripts under /_next/static are content-hashed and already cached for a
 * year by Next.js.
 */
const PUBLIC_ASSET_CACHE = "public, max-age=2592000, stale-while-revalidate=31536000";

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE }] },
      { source: "/logos/:path*", headers: [{ key: "Cache-Control", value: PUBLIC_ASSET_CACHE }] },
    ];
  },
};

export default nextConfig;

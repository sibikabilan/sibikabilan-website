import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * AI search and assistant crawlers are welcome: being read and cited by
 * ChatGPT, Claude, Perplexity, Gemini and Apple Intelligence is the point.
 * They get their own group so the welcome is explicit; a crawler follows only
 * its most specific group, so the private paths are repeated there.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

const PRIVATE = ["/admin", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

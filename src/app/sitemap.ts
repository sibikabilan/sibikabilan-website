import type { MetadataRoute } from "next";
import { getPublishedPosts, getPublishedWorks } from "@/lib/cms/queries";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, works] = await Promise.all([getPublishedPosts(), getPublishedWorks()]);
  return [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/fiction`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({ url: `${SITE.url}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
    ...works.map((w) => ({ url: `${SITE.url}/fiction/${w.slug}`, lastModified: w.updatedAt, priority: 0.6 })),
    ...works.flatMap((w) =>
      w.chapters.map((c) => ({ url: `${SITE.url}/fiction/${w.slug}/${c.slug}`, lastModified: c.updatedAt, priority: 0.5 }))
    ),
  ];
}

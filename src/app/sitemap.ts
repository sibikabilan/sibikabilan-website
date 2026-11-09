import type { MetadataRoute } from "next";
import { getPublishedPosts, getPublishedWorks, getSettings } from "@/lib/cms/queries";
import { SITE } from "@/lib/site";
import { PHOTO } from "@/lib/seo";

const latest = (...dates: (string | null | undefined)[]) =>
  dates.filter((d): d is string => !!d).sort().at(-1);

/** Cover images live on Blob storage (absolute) or under the site (relative). */
const abs = (src: string) => (/^https?:\/\//.test(src) ? src : `${SITE.url}${src}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, posts, works] = await Promise.all([getSettings(), getPublishedPosts(), getPublishedWorks()]);

  const postsUpdated = latest(...posts.map((p) => p.updatedAt));
  const workUpdated = (w: (typeof works)[number]) => latest(w.updatedAt, ...w.chapters.map((c) => c.updatedAt));
  const worksUpdated = latest(...works.map(workUpdated));

  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE.url,
      lastModified: latest(postsUpdated, worksUpdated),
      changeFrequency: "weekly",
      priority: 1,
      images: [PHOTO.url],
    },
  ];

  if (settings.showWriting) {
    entries.push({ url: `${SITE.url}/blog`, lastModified: postsUpdated, changeFrequency: "weekly", priority: 0.8 });
  }
  entries.push(
    ...posts.map((p) => ({
      url: `${SITE.url}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(p.cover ? { images: [abs(p.cover)] } : {}),
    }))
  );

  if (settings.showFiction) {
    entries.push({ url: `${SITE.url}/fiction`, lastModified: worksUpdated, changeFrequency: "weekly", priority: 0.6 });
  }
  for (const w of works) {
    entries.push({
      url: `${SITE.url}/fiction/${w.slug}`,
      lastModified: workUpdated(w),
      changeFrequency: "weekly",
      priority: 0.6,
      ...(w.cover ? { images: [abs(w.cover)] } : {}),
    });
    entries.push(
      ...w.chapters.map((c) => ({
        url: `${SITE.url}/fiction/${w.slug}/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
    );
  }

  return entries;
}

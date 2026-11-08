import { getPublishedPosts, getPublishedWorks } from "@/lib/cms/queries";
import { SITE } from "@/lib/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const [posts, works] = await Promise.all([getPublishedPosts(), getPublishedWorks()]);
  const items = [
    ...posts.map((p) => ({
      title: p.title,
      link: `${SITE.url}/blog/${p.slug}`,
      description: p.excerpt,
      date: p.publishedAt,
    })),
    ...works.flatMap((w) =>
      w.chapters.map((c) => ({
        title: `${w.title}: ${c.title}`,
        link: `${SITE.url}/fiction/${w.slug}/${c.slug}`,
        description: c.summary || w.tagline,
        date: c.publishedAt,
      }))
    ),
  ]
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 40);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(SITE.name)}</title>
<link>${SITE.url}</link>
<description>Essays and fiction by ${esc(SITE.name)}.</description>
<atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (i) => `<item><title>${esc(i.title)}</title><link>${i.link}</link><guid>${i.link}</guid>${
      i.date ? `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` : ""
    }<description>${esc(i.description || "")}</description></item>`
  )
  .join("\n")}
</channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
}

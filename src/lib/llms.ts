import "server-only";
import { getPublishedPost, getPublishedPosts, getPublishedWorks, getSettings } from "@/lib/cms/queries";
import type { Settings } from "@/lib/cms/types";
import { NOW_WORK, SITE } from "@/lib/site";
import { plainText } from "@/lib/seo";

/**
 * /llms.txt and /llms-full.txt, following the llmstxt.org convention: a
 * factual summary of who Sibi is for language models and AI search, generated
 * from the same data as the site so it never drifts from what's published.
 */

const url = (path: string) => `${SITE.url}${path}`;
const day = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
const oneLine = (s: string) => plainText(s).replace(/\s+/g, " ").trim();

function summary(settings: Settings): string {
  const links = [
    settings.linkedin && `- LinkedIn: ${settings.linkedin}`,
    settings.github && `- GitHub: ${settings.github}`,
    settings.x && `- X: ${settings.x}`,
    `- Email: ${settings.email}`,
  ].filter(Boolean);

  return `# ${SITE.name}

> ${SITE.name} is an entrepreneur, engineer, and writer based in Bengaluru, Karnataka, India. He is the founder of SuprAgent (${settings.companyUrl}), which builds Agentic UI: interfaces an AI agent composes for each person, in the moment. He also writes essays and fiction, published at ${SITE.url}.

Key facts:

- Now: founder of SuprAgent, building Agentic UI.
- 2022 to 2024: Servify. Device protection programs for Samsung Care+ and AppleCare+, a transactional risk and fraud engine, and generative AI in production through chat, IVR, and voice.
- 2018 to 2021: co founded KayaDev AI and ran it as CEO. Computer vision and analytics for enterprise teams.
- 2017 to 2018: independent AI and solutions architect.
- Education: computer science at Oregon State University, where he shipped his first production software, for the Oregon Department of Transportation.
- Writing: essays on Agentic UI, AI agents, and building companies, plus fiction published a chapter at a time.
- Based in: Bengaluru, Karnataka, India.
${links.join("\n")}

What Agentic UI means: ${NOW_WORK.body} ${NOW_WORK.not}

Canonical profile: ${SITE.url}. Each essay has its own URL, listed below.`;
}

export async function buildLlmsTxt(): Promise<string> {
  const [settings, posts, works] = await Promise.all([getSettings(), getPublishedPosts(), getPublishedWorks()]);
  const sections: string[] = [summary(settings)];

  sections.push(`## About

- [${SITE.name}, home page](${SITE.url}): Who he is, what he is building, the long way here from Oregon to Bengaluru, and how to get in touch.
- [SuprAgent](${settings.companyUrl}): The company he founded, building Agentic UI.`);

  if (settings.showWriting && posts.length) {
    sections.push(
      `## Essays\n\n${posts
        .map((p) => `- [${p.title}](${url(`/blog/${p.slug}`)}): ${oneLine(p.excerpt) || "An essay by Sibi Kabilan."} (${day(p.publishedAt)})`)
        .join("\n")}`
    );
  }

  if (settings.showFiction && works.length) {
    sections.push(
      `## Fiction\n\n${works
        .map((w) => {
          const about = oneLine(w.tagline || w.synopsis);
          const chapters = `${w.chapters.length} chapter${w.chapters.length === 1 ? "" : "s"}`;
          return `- [${w.title}](${url(`/fiction/${w.slug}`)}): A ${w.kind}${w.genre ? `, ${w.genre}` : ""}, ${w.progress}, ${chapters}.${about ? ` ${about}` : ""}`;
        })
        .join("\n")}`
    );
  }

  const profiles = [
    settings.linkedin && `- [LinkedIn](${settings.linkedin}): Career history.`,
    settings.github && `- [GitHub](${settings.github}): Code.`,
    settings.x && `- [X](${settings.x}): Posts.`,
    `- [Email](mailto:${settings.email}): The best way to reach him.`,
  ].filter(Boolean);
  sections.push(`## Contact and profiles\n\n${profiles.join("\n")}`);

  const optional = [
    settings.showWriting && posts.length
      ? `- [Every essay in full](${url("/llms-full.txt")}): The complete markdown of each published essay, in one file.`
      : null,
    `- [RSS feed](${url("/rss.xml")}): New essays and chapters as they are published.`,
    `- [Sitemap](${url("/sitemap.xml")}): Every public page.`,
  ].filter(Boolean);
  sections.push(`## Optional\n\n${optional.join("\n")}`);

  return `${sections.join("\n\n")}\n`;
}

export async function buildLlmsFullTxt(): Promise<string> {
  const [settings, posts] = await Promise.all([getSettings(), getPublishedPosts()]);
  const parts: string[] = [summary(settings)];
  if (!settings.showWriting) return `${parts[0]}\n`;

  for (const p of posts) {
    const data = await getPublishedPost(p.slug);
    if (!data) continue;
    const meta = [
      `URL: ${url(`/blog/${p.slug}`)}`,
      `Author: ${SITE.name}`,
      p.publishedAt ? `Published: ${day(p.publishedAt)}` : null,
      p.updatedAt && day(p.updatedAt) !== day(p.publishedAt) ? `Updated: ${day(p.updatedAt)}` : null,
      p.tags.length ? `Tags: ${p.tags.join(", ")}` : null,
    ].filter(Boolean);
    parts.push(`---

# ${p.title}

${meta.join("\n")}

${p.excerpt ? `> ${oneLine(p.excerpt)}\n\n` : ""}${data.content.trim()}`);
  }
  return `${parts.join("\n\n")}\n`;
}

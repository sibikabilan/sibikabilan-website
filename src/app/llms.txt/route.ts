import { buildLlmsTxt } from "@/lib/llms";

/** A plain summary of the site for language models (llmstxt.org). */
export async function GET() {
  return new Response(await buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
}

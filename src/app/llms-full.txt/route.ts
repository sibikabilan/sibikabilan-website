import { buildLlmsFullTxt } from "@/lib/llms";

/** Every published essay in full, as markdown, for language models (llmstxt.org). */
export async function GET() {
  return new Response(await buildLlmsFullTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
}

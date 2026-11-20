import { llmsTxt } from "@/lib/llms";

/** AI-only summary of the site (llmstxt.org). Built at deploy time from the same content as the pages. */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

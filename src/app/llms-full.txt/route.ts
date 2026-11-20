import { llmsFullTxt } from "@/lib/llms";

/** AI-only full version: every service, FAQ, area and guide summary in one Markdown file. */
export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

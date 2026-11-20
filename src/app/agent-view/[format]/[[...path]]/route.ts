import { AGENT_PATHS, markdownPath } from "@/lib/agent-paths";
import { agentDoc, renderAgentHtml, renderAgentMarkdown } from "@/lib/agent-pages";
import { site } from "@/config/site";

/**
 * Internal route for the AI version. Never linked and never reached directly: proxy.ts rewrites
 * AI agents (and *.md / Accept: text/markdown requests) here, and returns 404 for anyone who
 * requests /agent-view/* directly. Prerendered at build time for every AGENT_PATHS entry.
 */
export function generateStaticParams() {
  return ["html", "md"].flatMap((format) => AGENT_PATHS.map((p) => ({ format, path: p === "/" ? [] : p.slice(1).split("/") })));
}

export async function GET(_req: Request, ctx: RouteContext<"/agent-view/[format]/[[...path]]">) {
  const { format, path } = await ctx.params;
  const pagePath = "/" + (path ?? []).join("/");
  const doc = agentDoc(pagePath);
  if (!doc || (format !== "html" && format !== "md")) return new Response("Not found", { status: 404 });
  const canonical = `${site.url}${pagePath}`;
  const common = { "X-AI-Version": "1", Link: `<${canonical}>; rel="canonical"`, "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" };
  if (format === "md") {
    return new Response(renderAgentMarkdown(doc), { headers: { ...common, "Content-Type": "text/markdown; charset=utf-8" } });
  }
  return new Response(renderAgentHtml(doc), {
    headers: { ...common, "Content-Type": "text/html; charset=utf-8", "X-Markdown-Version": `${site.url}${markdownPath(pagePath)}` },
  });
}

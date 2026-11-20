import { NextResponse, type NextRequest } from "next/server";
import { aiAgentFrom, hasAgentVersion, pathFromMarkdown } from "@/lib/agent-paths";

/**
 * Agent Experience: same URL, two audiences.
 * - Known AI agents (ChatGPT, Claude, Perplexity, Meta, Amazon, Mistral, DuckDuckGo) get a clean,
 *   fact-identical AI version of the page. Googlebot/Bingbot and people always get the normal page.
 * - /page.md (or Accept: text/markdown) returns the Markdown copy of the page, for anyone.
 * - /agent-view/* is internal: direct requests get 404.
 * Every AI-version response is logged as one JSON line ("ai_agent_hit") in the runtime logs.
 */
export function proxy(req: NextRequest) {
  if (req.method !== "GET" && req.method !== "HEAD") return NextResponse.next();
  const path = req.nextUrl.pathname.replace(/\/+$/, "") || "/";

  if (path.startsWith("/agent-view")) return new NextResponse("Not found", { status: 404 });

  const ua = req.headers.get("user-agent");
  const agent = aiAgentFrom(ua);

  // Markdown copy: /page.md, /index.md, or Accept: text/markdown preferred over HTML
  let format: "html" | "md" | null = null;
  let target = path;
  if (path.endsWith(".md")) {
    target = pathFromMarkdown(path);
    if (!hasAgentVersion(target)) return NextResponse.next();
    format = "md";
  } else if (hasAgentVersion(path)) {
    const accept = req.headers.get("accept") ?? "";
    if (/text\/markdown/i.test(accept) && !/text\/html/i.test(accept.split(",")[0] ?? "")) format = "md";
    else if (agent) format = "html";
  }
  if (!format) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/agent-view/${format}${target === "/" ? "" : target}`;
  url.search = "";
  if (agent) console.log(JSON.stringify({ event: "ai_agent_hit", agent, path: target, format, ua: ua?.slice(0, 160) }));
  return NextResponse.rewrite(url);
}

export const config = {
  // Pages only: skip Next internals, APIs and static files (but keep *.md).
  matcher: ["/((?!_next/|api/|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|map|txt|xml|pdf|woff2?|json)$).*)"],
};

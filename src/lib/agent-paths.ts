import { people } from "@/config/site";
import { SERVICES } from "@/content/services";
import { AREAS } from "@/content/areas";
import { POSTS } from "@/content/blog";

/**
 * Public pages that have an AI version (agent view) and a Markdown twin. Every page here is built
 * from the same content files as the human page, so facts can't drift. Pages not listed (about,
 * financing, resident services, legal, thank-you, forms) stay on the normal server-rendered page
 * for every visitor. Lightweight on purpose: proxy.ts imports it.
 */
export const AGENT_PATHS: readonly string[] = [
  "/",
  ...Object.values(SERVICES).map((s) => s.path),
  "/areas",
  ...AREAS.map((a) => `/areas/${a.slug}`),
  "/blog",
  ...POSTS.map((p) => `/blog/${p.slug}`),
  "/join",
  "/team",
  ...Object.values(people).map((p) => `/team/${p.slug}`),
  "/lets-connect",
];

const SET = new Set(AGENT_PATHS);
export const hasAgentVersion = (path: string) => SET.has(path);

/** "/" <-> "/index.md"; "/blog/x" <-> "/blog/x.md" */
export const markdownPath = (path: string) => (path === "/" ? "/index.md" : `${path}.md`);
export const pathFromMarkdown = (mdPath: string) => (mdPath === "/index.md" ? "/" : mdPath.replace(/\.md$/, ""));

/**
 * AI agents that get the AI version. Search-engine crawlers are excluded on purpose (DENY wins):
 * Google's AI Overviews/AI Mode and Bing Copilot read through Googlebot/Bingbot, and giving them a
 * different page would be cloaking. Review this list every quarter.
 */
export const AI_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Amazonbot",
  "meta-externalagent",
  "meta-externalfetcher",
  "MistralAI-User",
  "DuckAssistBot",
] as const;

const DENY = /googlebot|google-inspectiontool|googleother|storebot-google|adsbot-google|mediapartners-google|bingbot|bingpreview|msnbot|applebot|yandex|baiduspider/i;
const AI_RE = new RegExp(AI_AGENTS.map((a) => a.replace(/[-]/g, "\\-")).join("|"), "i");

/** Returns the matched AI agent token, or null for people and search engines. */
export function aiAgentFrom(ua: string | null): string | null {
  if (!ua || DENY.test(ua)) return null;
  const m = ua.match(AI_RE);
  return m ? (AI_AGENTS.find((a) => a.toLowerCase() === m[0].toLowerCase()) ?? m[0]) : null;
}

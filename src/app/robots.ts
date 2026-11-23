import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/agent-view/", "/admin/", "/tenant/", "/customer/"] },
      // AI assistants and AI search: explicitly welcome, so Prime 1 can be cited in their answers.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Amazonbot", "DuckAssistBot", "MistralAI-User"],
        allow: "/",
        disallow: ["/api/", "/agent-view/"],
      },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: [`${site.url}/sitemap.xml`, `${site.url}/sitemap-listings.xml`],
    host: site.url,
  };
}

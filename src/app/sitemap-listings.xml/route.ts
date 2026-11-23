import { connection } from "next/server";
import { site } from "@/config/site";
import { oldAppFetch } from "@/lib/old-app";

/**
 * Every active MLS listing page, so Google/Bing (and AI search built on them) discover and refresh
 * them automatically. Crawls the home-search result pages of the old MLS app (12 per page) until a
 * page adds no new listings. Cached at the edge for an hour.
 */
const MAX_PAGES = 80;
const BATCH = 8;

async function listingsOnPage(page: number) {
  try {
    const r = await oldAppFetch(`/home-search?page=${page}`, { timeoutMs: 20_000 });
    if (r.status !== 200) return [];
    return [...new Set([...r.body.toString("utf8").matchAll(/\/property\/([a-f0-9]{32})/g)].map((m) => m[1]))];
  } catch {
    return [];
  }
}

export async function GET() {
  await connection(); // always run at request time (never frozen at build)
  const ids = new Set<string>();
  for (let start = 1; start <= MAX_PAGES; start += BATCH) {
    const pages = await Promise.all(Array.from({ length: BATCH }, (_, i) => listingsOnPage(start + i)));
    const before = ids.size;
    pages.flat().forEach((id) => ids.add(id));
    if (ids.size === before) break;
  }
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${site.url}/home-search</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>
${[...ids].map((id) => `<url><loc>${site.url}/property/${id}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>`).join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", "X-Listing-Count": String(ids.size) },
  });
}

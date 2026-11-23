import { site } from "@/config/site";

/**
 * IndexNow: tells Bing (which also feeds ChatGPT search and Copilot), Yandex, Seznam and Naver which URLs
 * exist/changed, so new MLS listings get crawled within hours. Runs daily from Vercel Cron (vercel.json);
 * submits every page in sitemap.xml + sitemap-listings.xml. Key file: /public/5f17b520fad19965105c031d56e535ed.txt
 */
const KEY = "5f17b520fad19965105c031d56e535ed";

export async function GET(req: Request) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const urls = new Set<string>();
  for (const sm of ["/sitemap.xml", "/sitemap-listings.xml"]) {
    const xml = await fetch(`${site.url}${sm}`, { cache: "no-store" }).then((r) => r.text()).catch(() => "");
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1]);
  }
  const list = [...urls];
  const results: number[] = [];
  for (let i = 0; i < list.length; i += 9000) {
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(site.url).host, key: KEY, keyLocation: `${site.url}/${KEY}.txt`, urlList: list.slice(i, i + 9000) }),
    }).catch(() => null);
    results.push(r?.status ?? 0);
  }
  console.log(JSON.stringify({ event: "indexnow", submitted: list.length, results }));
  return Response.json({ submitted: list.length, results });
}

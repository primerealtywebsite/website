import { oldAppFetch, OLD_HOST as ORIGIN_HOST } from "@/lib/old-app";
import { optimizeListingHtml } from "@/lib/listing-seo";
import { site } from "@/config/site";

/**
 * MLS home search (old Laravel app) proxy. Every URL this site doesn't own (/home-search, /search,
 * /property/*, /site_assets/*, /enquiry ...) is rewritten here by next.config.ts and fetched from the
 * old GoDaddy server. We connect to its IP directly (OLD_SERVER_IP) but send SNI + Host
 * "prime1realty.net", the vhost that serves the app with a valid certificate. That keeps search working
 * even after prime1realty.net's DNS points to this site.
 */

const HOP = new Set(["connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-connection", "te", "trailer", "host", "content-length", "content-encoding"]);

async function proxy(req: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const inUrl = new URL(req.url);
  const target = `/${path.map(encodeURIComponent).join("/")}${inUrl.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    if (!HOP.has(k) && !k.startsWith("x-vercel") && !k.startsWith("x-forwarded") && k !== "accept-encoding") headers[k] = v;
  });
  headers.host = ORIGIN_HOST;
  headers["accept-encoding"] = "identity";
  if (headers.referer) headers.referer = headers.referer.replace(/^https?:\/\/(www\.)?prime1realty\.net/i, `https://${ORIGIN_HOST}`);
  if (headers.origin) headers.origin = `https://${ORIGIN_HOST}`;
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.from(await req.arrayBuffer());
  if (body) headers["content-length"] = String(body.length);

  const res = await oldAppFetch(target, { method: req.method, headers, body }).catch((e) => {
    console.error("[idx] proxy error", target, e instanceof Error ? e.message : e);
    return null;
  });
  if (!res) return new Response("Home search is temporarily unavailable. Please call (813) 295-8215.", { status: 502 });

  const out = new Headers();
  for (const [k, v] of Object.entries(res.headers)) {
    if (v == null || HOP.has(k)) continue;
    if (k === "location") {
      out.set(k, String(v).replace(/^https?:\/\/(www\.)?prime1realty\.net/i, ""));
      continue;
    }
    if (k === "set-cookie") {
      (Array.isArray(v) ? v : [v]).forEach((c) => out.append("set-cookie", c.replace(/;\s*domain=[^;]+/i, "")));
      continue;
    }
    out.set(k, Array.isArray(v) ? v.join(", ") : String(v));
  }
  let payload: BodyInit = new Uint8Array(res.body);
  // MLS listing pages: unique title/description/image, H1 and RealEstateListing schema (see lib/listing-seo).
  if (req.method === "GET" && res.status === 200 && /^\/property\/[^/]+$/.test(`/${path.join("/")}`) && String(res.headers["content-type"] ?? "").includes("text/html")) {
    try {
      payload = optimizeListingHtml(res.body.toString("utf8"), `${site.url}/${path.join("/")}`);
    } catch (e) {
      console.error("[idx] listing seo error", e);
    }
  }
  // Home search page: real title/description/canonical + SearchResultsPage schema instead of the generic "Prime 1 Realty".
  if (req.method === "GET" && res.status === 200 && path.join("/") === "home-search" && !inUrl.search && String(res.headers["content-type"] ?? "").includes("text/html")) {
    const t = "Tampa Bay Homes for Sale | Search MLS Listings | Prime 1 Realty";
    const d = "Search every Tampa Bay home for sale and rent on Stellar MLS: Tampa, St. Petersburg, Clearwater, Brandon, Riverview and more. Updated daily by Prime 1 Realty.";
    const ld = { "@context": "https://schema.org", "@type": "SearchResultsPage", name: t, description: d, url: `${site.url}/home-search`, provider: { "@id": `${site.url}/#organization` } };
    payload = res.body
      .toString("utf8")
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${d}">`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${t}">`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${d}">`)
      .replace(/<link rel="canonical" href="[^"]*"/i, `<link rel="canonical" href="${site.url}/home-search"`)
      .replace(/<\/head>/i, `<script type="application/ld+json">${JSON.stringify(ld)}</script></head>`);
  }
  // Microsoft Clarity on every proxied HTML page too (home search, listings), same project as the main site.
  if (req.method === "GET" && res.status === 200 && site.clarityId && String(res.headers["content-type"] ?? "").includes("text/html")) {
    const html = typeof payload === "string" ? payload : res.body.toString("utf8");
    if (!html.includes("clarity.ms/tag")) {
      const tag = `<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${site.clarityId}");</script>`;
      payload = html.replace(/<\/head>/i, `${tag}</head>`);
    }
  }
  return new Response(req.method === "HEAD" || res.status === 204 || res.status === 304 ? null : payload, { status: res.status, headers: out });
}

export { proxy as GET, proxy as HEAD, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };

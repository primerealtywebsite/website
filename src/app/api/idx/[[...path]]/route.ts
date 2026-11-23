import { request as httpsRequest } from "node:https";
import type { IncomingHttpHeaders } from "node:http";

/**
 * MLS home search (old Laravel app) proxy. Every URL this site doesn't own (/home-search, /search,
 * /property/*, /site_assets/*, /enquiry ...) is rewritten here by next.config.ts and fetched from the
 * old GoDaddy server. We connect to its IP directly (OLD_SERVER_IP) but send SNI + Host
 * "prime1realty.net", the vhost that serves the app with a valid certificate. That keeps search working
 * even after prime1realty.net's DNS points to this site.
 */
const ORIGIN_HOST = process.env.OLD_SERVER_HOST || "prime1realty.net";
const ORIGIN_IP = process.env.OLD_SERVER_IP || "50.63.133.85";

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

  const res = await new Promise<{ status: number; headers: IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
    const r = httpsRequest(
      {
        host: ORIGIN_HOST,
        servername: ORIGIN_HOST,
        port: 443,
        method: req.method,
        path: target,
        headers,
        timeout: 25_000,
        // Resolve the old app's hostname to the old server, whatever public DNS says.
        lookup: (_h, opts, cb) => {
          if ((opts as { all?: boolean }).all) (cb as unknown as (e: null, a: { address: string; family: number }[]) => void)(null, [{ address: ORIGIN_IP, family: 4 }]);
          else cb(null, ORIGIN_IP, 4);
        },
      },
      (resp) => {
        const chunks: Buffer[] = [];
        resp.on("data", (c: Buffer) => chunks.push(c));
        resp.on("end", () => resolve({ status: resp.statusCode ?? 502, headers: resp.headers, body: Buffer.concat(chunks) }));
        resp.on("error", reject);
      },
    );
    r.on("timeout", () => r.destroy(new Error("timeout")));
    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  }).catch((e) => {
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
  return new Response(req.method === "HEAD" || res.status === 204 || res.status === 304 ? null : new Uint8Array(res.body), { status: res.status, headers: out });
}

export { proxy as GET, proxy as HEAD, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };

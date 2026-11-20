import type { NextConfig } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.prime1realty.net";
const IDX = process.env.NEXT_PUBLIC_IDX_BASE_URL || "https://www.prime1realty.net";
const siteHost = new URL(SITE).host;
const idxHost = new URL(IDX).host;
/**
 * IDX_ORIGIN: where the old Prime 1 app (Laravel + MLS sync) keeps running after www moves to Vercel,
 * e.g. https://idx.prime1realty.net pointed at the current server. Every URL this site doesn't own
 * (/home-search, /search, /property/*, /site_assets/*, /public/uploads/*) is proxied there, so MLS
 * listings keep syncing and keep their existing www URLs (no SEO loss). Must NOT be the www host itself.
 */
const IDX_ORIGIN = (process.env.IDX_ORIGIN || "").replace(/\/$/, "");
if (IDX_ORIGIN && process.env.VERCEL_ENV === "production" && new URL(IDX_ORIGIN).host === siteHost && process.env.ALLOW_SELF_IDX !== "1") {
  throw new Error("IDX_ORIGIN must point at the old server (e.g. https://idx.prime1realty.net), not the site's own host, or requests would loop.");
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  env: { BUILD_YEAR: String(new Date().getFullYear()) },
  // Agent onboarding PDFs live outside /public (never crawlable) and are read at runtime by these routes.
  outputFileTracingIncludes: {
    "/api/agent-docs": ["./private/onboarding/**/*"],
    "/api/join": ["./private/onboarding/**/*"],
  },
  images: {
    qualities: [70, 75, 85],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    type R = { source: string; destination: string; permanent: boolean; has?: { type: "host"; value: string }[] };
    const rules: R[] = [
      // Canonical host: apex -> www
      { source: "/:path*", has: [{ type: "host", value: siteHost.replace(/^www\./, "") }], destination: `${SITE}/:path*`, permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/contact", destination: "/lets-connect", permanent: true },
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/sell", destination: "/sell-your-home", permanent: true },
      { source: "/buy", destination: "/residential", permanent: true },
    ];
    // Old IDX URLs move to a separate IDX host (only when not proxying via IDX_ORIGIN).
    if (!IDX_ORIGIN && idxHost !== siteHost) {
      rules.push(
        { source: "/home-search", destination: `${IDX}/home-search`, permanent: true },
        { source: "/home-search/:path*", destination: `${IDX}/home-search/:path*`, permanent: true },
        { source: "/property/:id", destination: `${IDX}/property/:id`, permanent: true },
      );
    }
    return rules;
  },
  async rewrites() {
    if (!IDX_ORIGIN) return [];
    // Fallback runs only after every page and public file of this site has been checked.
    return { beforeFiles: [], afterFiles: [], fallback: [{ source: "/:path*", destination: `${IDX_ORIGIN}/:path*` }] };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;

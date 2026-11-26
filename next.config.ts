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
    "/api/onboarding/sign": ["./private/onboarding/**/*"],
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
      // Recruiting subdomain (formerly the Capped portal) -> the one Join Prime 1 page. Query strings (utm_*) are kept.
      { source: "/:path*", has: [{ type: "host", value: "join.prime1realty.net" }], destination: `${SITE}/join`, permanent: false },
      // One Join Prime 1 path for every channel (homepage, careers, join. subdomain, LinkedIn, campaigns).
      { source: "/careers", destination: "/join", permanent: true },
      // Prime 1 Property Management W-2 employment (LCAM) is separate from agent affiliation.
      { source: "/careers/lcam-jobs", destination: "/employment", permanent: true },
      { source: "/lcam-jobs", destination: "/employment", permanent: true },
      { source: "/careers/:path+", destination: "/employment", permanent: true },
      { source: "/commercialteam", destination: "/team", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
      // Old-site URLs still reported as 404 in Search Console (26 Nov 2026).
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/LoadBlogItem.asp", destination: "/blog", permanent: true },
      { source: "/favorite-property", destination: "/home-search", permanent: true },
      { source: "/pdf/Resident_Selection_Criteria.pdf", destination: "/resident-criteria.pdf", permanent: true },
      { source: "/blog/pet-friendly-rentals-in-hillsborough-county-what-landlords-need-to-know", destination: "/rent", permanent: true },
      // Former agents' profile pages.
      ...["katia-brizendine", "ashely-jones", "brandon-arias"].map((slug): R => ({ source: `/team/${slug}`, destination: "/team", permanent: true })),
      { source: "/contact", destination: "/lets-connect", permanent: true },
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/sell", destination: "/sell-your-home", permanent: true },
      { source: "/buy", destination: "/residential", permanent: true },
      // Common property-management URLs (typed, old links, ad final URLs). Without these they fall through
      // to the old MLS app, which answers /property-management with a 500 and still serves its outdated
      // /management page.
      ...["/property-management", "/property-management/:path*", "/association-management", "/hoa-management", "/condo-association-management", "/community-association-management", "/management"].map(
        (source): R => ({ source, destination: "/property_management", permanent: true }),
      ),
      { source: "/commercial-property-management", destination: "/commercial_property_management", permanent: true },
      { source: "/rental-management", destination: "/property_management", permanent: true },
      { source: "/resident-services", destination: "/resident_services", permanent: true },
      { source: "/pay-rent", destination: "/resident_services", permanent: true },
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
    // Fallback runs only after every page and public file of this site has been checked: anything this
    // site doesn't own goes to the old MLS app through /api/idx (direct-to-IP proxy, see that route).
    if (process.env.IDX_PROXY === "off") return [];
    return { beforeFiles: [], afterFiles: [], fallback: [{ source: "/:path*", destination: "/api/idx/:path*" }] };
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

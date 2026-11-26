import type { MetadataRoute } from "next";
import { site, people } from "@/config/site";
import { AREAS } from "@/content/areas";
import { POSTS } from "@/content/blog";

const UPDATED = "2026-11-26";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string, priority = 0.7, lastModified = UPDATED) => ({ url: `${site.url}${path}`, lastModified, priority });
  return [
    u("/", 1),
    u("/sell-your-home", 0.95),
    u("/home-valuation", 0.95),
    u("/residential", 0.9),
    ...(process.env.IDX_ORIGIN ? [u("/home-search", 0.85)] : []),
    u("/rent", 0.8),
    u("/property_management", 0.9),
    u("/commercial_property_management", 0.75),
    u("/commercial", 0.85),
    u("/commercial_properties", 0.7),
    u("/sales_acquisitions", 0.75),
    u("/tenant_buyer_representation", 0.75),
    u("/owners-representation", 0.7),
    u("/financing", 0.7),
    u("/resident_services", 0.6),
    u("/get-started", 0.6),
    u("/about-us", 0.6),
    u("/team", 0.6),
    ...Object.values(people).map((p) => u(`/team/${p.slug}`, 0.5)),
    u("/join", 0.6),
    u("/employment", 0.5),
    u("/lets-connect", 0.7),
    u("/areas", 0.7),
    ...AREAS.map((a) => u(`/areas/${a.slug}`, 0.8)),
    u("/blog", 0.6),
    ...POSTS.map((p) => u(`/blog/${p.slug}`, 0.6, p.modified)),
    u("/privacy-policy", 0.2),
    u("/term-conditions", 0.2),
  ];
}

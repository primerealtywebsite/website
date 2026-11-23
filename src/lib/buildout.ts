import "server-only";
import { cacheLife } from "next/cache";

/**
 * Buildout (commercial listings) sync. Buildout publishes the listings that are enabled for the
 * brokerage website as JSON at /plugins/<token>/<host>/inventory.json. We read it server-side so
 * listings are in the HTML (SEO + AI search) and refresh every 15 minutes, with no manual step:
 * add or close a listing in Buildout and the website follows.
 */
export const BUILDOUT_TOKEN = process.env.NEXT_PUBLIC_BUILDOUT_TOKEN || "36fd2b100d8811bf14b2290d7e408d3174365b07";
const HOST = "www.prime1realty.net";

type Raw = Record<string, unknown>;
export type CommercialListing = {
  id: string;
  name: string;
  address: string;
  image?: string;
  type?: string;
  deal?: string;
  price?: string;
  size?: string;
  summary?: string;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const pick = (o: Raw, keys: string[]) => keys.map((k) => str(o[k])).find(Boolean) ?? "";

function normalize(o: Raw): CommercialListing | null {
  const id = str(o.id);
  if (!id) return null;
  const name = pick(o, ["display_name", "name", "title"]);
  const address = pick(o, ["display_name_address", "full_address", "address"]) || [str(o.city), str(o.state)].filter(Boolean).join(", ");
  const sale = o.sale === true || /sale/i.test(pick(o, ["sale_or_lease", "listing_type"]));
  const lease = o.lease === true || /lease/i.test(pick(o, ["sale_or_lease", "listing_type"]));
  return {
    id,
    name: name || address,
    address,
    image: pick(o, ["large_thumbnail_url", "photo_url", "thumbnail_url"]) || undefined,
    type: pick(o, ["property_type_label", "property_type_name", "property_type", "property_subtype_label"]) || undefined,
    deal: sale && lease ? "For sale or lease" : sale ? "For sale" : lease ? "For lease" : undefined,
    price: pick(o, ["sale_price_label", "sale_price_summary", "price_label", "lease_rate_summary", "lease_rate_label"]) || undefined,
    size: pick(o, ["building_size_label", "space_available_summary", "lot_size_label", "size_summary"]) || undefined,
    summary: pick(o, ["marketing_description", "description", "subtitle"]).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 280) || undefined,
  };
}

export async function getCommercialListings(): Promise<CommercialListing[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
  try {
    const r = await fetch(`https://buildout.com/plugins/${BUILDOUT_TOKEN}/${HOST}/inventory.json?limit=100`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return [];
    const j = (await r.json()) as { inventory?: Raw[] };
    return (j.inventory ?? []).map(normalize).filter((x): x is CommercialListing => x !== null);
  } catch {
    return [];
  }
}

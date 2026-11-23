import Image from "next/image";
import { Suspense } from "react";
import { site } from "@/config/site";
import { BUILDOUT_TOKEN, getCommercialListings } from "@/lib/buildout";
import { Heading, Section } from "@/components/sections/Blocks";
import { BuildoutListings } from "./BuildoutListings";

/**
 * Prime 1 commercial listings, synced from Buildout (see lib/buildout). Renders nothing while
 * Buildout has no website-enabled listings, so the page never shows an empty or demo inventory.
 */
async function Listings({ limit, compact }: { limit?: number; compact?: boolean }) {
  const all = await getCommercialListings();
  if (!all.length) return null;
  const items = limit ? all.slice(0, limit) : all;
  const href = (id: string) => `/commercial_properties?propertyId=${encodeURIComponent(id)}#listings`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Prime 1 Realty commercial listings",
    numberOfItems: all.length,
    itemListElement: items.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "RealEstateListing",
        name: l.name,
        url: `${site.url}${href(l.id).replace("#listings", "")}`,
        ...(l.image ? { image: l.image } : {}),
        ...(l.summary ? { description: l.summary } : {}),
        about: { "@type": "Place", name: l.address, address: { "@type": "PostalAddress", streetAddress: l.address, addressRegion: "FL", addressCountry: "US" } },
        provider: { "@id": `${site.url}/#organization` },
      },
    })),
  };
  return (
    <Section tone="white" id="listings">
      <Heading eyebrow="Available now" title={compact ? "Featured commercial listings" : "Prime 1 commercial listings"} intro="Office, retail, industrial, land and investment property for sale and lease. Open a listing for photos, documents and to reach the listing broker." />
      {!compact && <BuildoutListings token={BUILDOUT_TOKEN} />}
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((l) => (
          <li key={l.id} className="card overflow-hidden">
            <a href={href(l.id)} className="block h-full hover:opacity-95">
              <div className="relative aspect-[4/3] bg-sand">
                {l.image && <Image src={l.image} alt={`${l.name}, ${l.address}`} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" unoptimized />}
                {l.deal && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">{l.deal}</span>}
              </div>
              <div className="p-5">
                <h3 className="text-xl leading-snug">{l.name}</h3>
                {l.address && l.address !== l.name && <p className="mt-1 text-sm text-muted">{l.address}</p>}
                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold">
                  {[l.type, l.price, l.size].filter(Boolean).map((t) => <span key={t}>{t}</span>)}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
      {limit && all.length > limit && (
        <a href="/commercial_properties#listings" className="btn btn-ghost mt-8">See all {all.length} listings</a>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </Section>
  );
}

export function CommercialListings(props: { limit?: number; compact?: boolean }) {
  return (
    <Suspense fallback={null}>
      <Listings {...props} />
    </Suspense>
  );
}

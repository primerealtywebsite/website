import { people, site } from "@/config/site";
import { absoluteUrl } from "./utils";

const abs = (p: string) => absoluteUrl(p, site.url);
export const ORG_ID = `${site.url}/#organization`;

export function organizationSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": ["RealEstateAgent", "LocalBusiness"],
      "@id": ORG_ID,
      name: site.name,
      alternateName: [site.pmName, "Prime 1 Realty & Property Management"],
      legalName: site.legalName,
      url: site.url,
      logo: abs("/images/brand/prime1-realty-logo.png"),
      image: abs("/images/blog/modern-florida-luxury-home-pool.jpg"),
      description: site.description,
      telephone: site.phone.e164,
      email: site.email,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.region,
        postalCode: site.address.postal,
        addressCountry: site.address.country,
      },
      geo: { "@type": "GeoCoordinates", latitude: site.address.lat, longitude: site.address.lng },
      hasMap: site.mapsUrl,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: site.phone.e164,
          contactType: "customer service",
          areaServed: "US-FL",
          availableLanguage: "English",
          hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: site.hours.opens, closes: site.hours.closes },
        },
        {
          "@type": "ContactPoint",
          telephone: site.phone.e164,
          contactType: "emergency",
          name: "Community association emergencies (Prime 1 Property Management)",
          areaServed: "US-FL",
          hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" },
        },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: site.hours.opens,
          closes: site.hours.closes,
        },
      ],
      areaServed: { "@type": "State", name: "Florida", sameAs: "https://en.wikipedia.org/wiki/Florida" },
      sameAs: Object.values(site.socials),
      founder: { "@id": `${site.url}/team/${people.antony.slug}#person` },
      employee: [{ "@id": `${site.url}/team/${people.antony.slug}#person` }, { "@id": `${site.url}/team/${people.jennifer.slug}#person` }],
      knowsAbout: [
        "Residential real estate",
        "Commercial real estate",
        "Community association management",
        "HOA management",
        "Condominium association management",
        "Rental property management",
        "Tenant representation",
        "Owner's representation",
      ],
      memberOf: { "@type": "Organization", name: "National Association of REALTORS®" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { "@id": ORG_ID },
      inLanguage: "en-US",
    },
  ];
}

export function breadcrumbSchema(items: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: abs(c.href) })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function serviceSchema(s: { name: string; description: string; path: string; serviceType: string; areas?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${abs(s.path)}#service`,
    name: s.name,
    serviceType: s.serviceType,
    description: s.description,
    url: abs(s.path),
    provider: { "@id": ORG_ID },
    areaServed: s.areas ? s.areas.map((n) => ({ "@type": "Place", name: `${n}, FL` })) : { "@type": "State", name: "Florida" },
  };
}

export function personSchema(key: keyof typeof people) {
  const p = people[key];
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/team/${p.slug}#person`,
    name: p.name,
    jobTitle: p.role,
    email: p.email,
    telephone: site.phone.e164,
    image: p.image ? abs(p.image) : undefined,
    url: abs(`/team/${p.slug}`),
    worksFor: { "@id": ORG_ID },
    address: { "@type": "PostalAddress", addressLocality: "Tampa", addressRegion: "FL", addressCountry: "US" },
    description: p.bio[0],
  };
}

export function articleSchema(a: { title: string; description: string; path: string; image: string; published: string; modified: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.description,
    image: abs(a.image),
    datePublished: a.published,
    dateModified: a.modified,
    mainEntityOfPage: abs(a.path),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

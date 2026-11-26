import type { Faq } from "@/components/sections/Blocks";

export type Area = {
  slug: string;
  name: string;
  county: string;
  metaTitle: string;
  description: string;
  h1: string;
  lede: string;
  image: string;
  imageAlt: string;
  answer: string;
  neighborhoods: { name: string; note: string }[];
  knowBefore: string[];
  faqs: Faq[];
};

export const AREAS: Area[] = [
  {
    slug: "tampa",
    name: "Tampa",
    county: "Hillsborough County",
    metaTitle: "Tampa Real Estate: Buy, Sell & Manage Homes | Prime 1 Realty",
    description: "Buying, selling or renting in Tampa? Neighborhood guidance from Seminole Heights to Westchase, plus flood, insurance and HOA tips from a Tampa brokerage.",
    h1: "Tampa real estate, from a brokerage based in Tampa",
    lede: "Our office is in Centro Ybor, minutes from downtown. We help Tampa buyers, sellers, renters and owners with neighborhood-level advice and one accountable team.",
    image: "/images/areas/tampa-downtown-skyline.jpg",
    imageAlt: "Downtown Tampa skyline at night over the Hillsborough River",
    answer:
      "Tampa is Hillsborough County's largest city and the center of the Tampa Bay job market. Neighborhoods range from historic bungalows in Seminole Heights and Hyde Park to newer suburban communities in New Tampa and Westchase. Flood zone, insurance cost and HOA rules vary a lot by street, so check them for each home before you make an offer.",
    neighborhoods: [
      { name: "South Tampa & Hyde Park", note: "Established, walkable neighborhoods close to Bayshore Boulevard and downtown." },
      { name: "Seminole Heights", note: "Historic bungalows, local restaurants and active renovation." },
      { name: "Ybor City & Channel District", note: "Historic district and urban condos near downtown and the port." },
      { name: "Westchase", note: "Planned communities with HOAs near the airport and Veterans Expressway." },
      { name: "New Tampa", note: "Newer suburban homes, many in HOA and CDD communities." },
    ],
    knowBefore: [
      "Check the FEMA flood zone and get an insurance quote before you offer",
      "Ask for roof age, as it affects insurance eligibility and cost",
      "Review HOA documents and any CDD fee on the tax bill",
      "Historic districts may have exterior renovation rules",
    ],
    faqs: [
      { q: "Do I need flood insurance in Tampa?", a: "Lenders require it for homes in high-risk FEMA flood zones. Many owners outside those zones still buy it because flooding can happen anywhere near the bay. Get a quote before you make an offer." },
      { q: "Where is Prime 1's office?", a: "1600 E 8th Ave, Suite A200, Tampa, FL 33605, in Centro Ybor." },
    ],
  },
  {
    slug: "brandon",
    name: "Brandon",
    county: "Hillsborough County",
    metaTitle: "Brandon FL Homes for Sale & Real Estate Agent | Prime 1",
    description: "Buying or selling in Brandon, FL? Local guidance on Brandon neighborhoods, HOA communities and commuting to Tampa from a licensed Tampa Bay brokerage.",
    h1: "Brandon, FL real estate with a local Tampa Bay team",
    lede: "Brandon sits east of Tampa with quick access to I-75, I-4 and the Selmon Expressway. We help Brandon buyers, sellers and HOA communities.",
    image: "/images/areas/brandon-palm-lined-neighborhood-street.jpg",
    imageAlt: "Palm-lined residential street in a suburban Florida neighborhood",
    answer:
      "Brandon is an unincorporated community in eastern Hillsborough County known for established neighborhoods, newer HOA subdivisions and easy commuting to downtown Tampa. Buyers often compare Brandon with Riverview and Valrico. Each offers a different mix of home age, lot size and HOA fees, so compare them home by home.",
    neighborhoods: [
      { name: "Central Brandon", note: "Established homes near shopping, schools and the Selmon Expressway." },
      { name: "Bloomingdale area", note: "Popular family neighborhoods with larger lots." },
      { name: "Valrico & Seffner edges", note: "More space and a mix of older and newer communities." },
    ],
    knowBefore: [
      "Compare HOA dues and rules between subdivisions",
      "Check commute routes to I-75 and the Selmon Expressway",
      "Confirm flood zone, especially near creeks and retention ponds",
    ],
    faqs: [
      { q: "Is Brandon part of Tampa?", a: "Brandon is an unincorporated community in Hillsborough County, east of the City of Tampa. Many residents commute to Tampa." },
      { q: "Do you manage HOAs in Brandon?", a: "Yes. Prime 1 Property Management is a licensed community association management firm serving Hillsborough County communities." },
    ],
  },
  {
    slug: "riverview",
    name: "Riverview",
    county: "Hillsborough County",
    metaTitle: "Riverview FL Homes for Sale & HOA Management | Prime 1",
    description: "Riverview, FL real estate: newer master-planned communities, HOA and CDD fees, and what to know before buying or selling. Local Tampa Bay brokerage.",
    h1: "Riverview, FL homes, communities and HOA management",
    lede: "Riverview has grown quickly with newer master-planned communities south of Brandon. We help buyers compare communities and help boards run them well.",
    image: "/images/areas/tampa-bay-aerial-homes-with-pools.jpg",
    imageAlt: "Aerial view of suburban Tampa Bay homes with pools",
    answer:
      "Riverview is a fast-growing area in southern Hillsborough County along the Alafia River. Much of its housing is in newer master-planned communities with amenities, HOA dues and often CDD fees. Buyers should compare total monthly cost, including HOA and CDD, alongside the purchase price.",
    neighborhoods: [
      { name: "Master-planned communities", note: "Newer homes with pools, clubhouses and HOA-maintained common areas." },
      { name: "Alafia River area", note: "Established homes and larger lots near the river." },
      { name: "US-301 corridor", note: "Convenient to shopping and I-75." },
    ],
    knowBefore: [
      "Ask for both HOA dues and CDD fees; CDD appears on the property tax bill",
      "Read community rules on rentals, fences, pools and parking",
      "Check flood zone near the river and creeks",
    ],
    faqs: [
      { q: "What is a CDD fee in Riverview?", a: "Many newer Riverview communities are in a Community Development District that funds roads, utilities and amenities. The fee is collected on the annual property tax bill." },
      { q: "Can I rent out a home in a Riverview HOA?", a: "It depends on the community's governing documents. Some limit rentals or require minimum lease terms. We review the rules before you buy." },
    ],
  },
  {
    slug: "clearwater",
    name: "Clearwater",
    county: "Pinellas County",
    metaTitle: "Clearwater FL Real Estate & Condo Management | Prime 1",
    description: "Clearwater, FL real estate and condo association management. Beach condos, Countryside homes, flood zones and insurance: what to know before you buy or sell.",
    h1: "Clearwater, FL real estate and condo expertise",
    lede: "From Clearwater Beach condos to inland neighborhoods like Countryside, we help buyers, sellers and associations across Clearwater and Pinellas County.",
    image: "/images/areas/clearwater-beach-waterfront.jpg",
    imageAlt: "Aerial view of Clearwater Beach, its pier and waterfront hotels",
    answer:
      "Clearwater is a Pinellas County city that includes Clearwater Beach and inland neighborhoods like Countryside. Many properties are condos governed by associations, so buyers should review building inspections, reserves and insurance along with the unit itself. Coastal homes need careful flood zone and elevation review.",
    neighborhoods: [
      { name: "Clearwater Beach", note: "Gulf-front and bayside condos, vacation-friendly buildings and rental rules that vary by association." },
      { name: "Downtown Clearwater", note: "Condos and townhomes near the bluff and waterfront park." },
      { name: "Countryside", note: "Inland single-family neighborhoods with easier insurance profiles." },
    ],
    knowBefore: [
      "For condos, review milestone inspection and reserve study status",
      "Check flood zone, elevation certificate and insurance cost",
      "Confirm short-term rental rules before buying an investment condo",
    ],
    faqs: [
      { q: "What should I check before buying a Clearwater condo?", a: "Association finances and reserves, recent or upcoming special assessments, structural inspection status, insurance coverage and rental rules." },
      { q: "Do you manage condo associations in Pinellas County?", a: "Yes. Prime 1 Property Management is a licensed Florida CAM firm and manages associations across Tampa Bay." },
    ],
  },
  {
    slug: "st-petersburg",
    name: "St. Petersburg",
    county: "Pinellas County",
    metaTitle: "St. Petersburg FL Real Estate: Buy & Sell | Prime 1 Realty",
    description: "St. Petersburg, FL real estate: downtown condos, historic neighborhoods and waterfront homes. Guidance on flood zones, insurance and HOAs from Prime 1 Realty.",
    h1: "St. Petersburg, FL real estate, from downtown condos to historic homes",
    lede: "St. Pete combines a walkable downtown waterfront with historic neighborhoods and bayfront homes. We help buyers and sellers navigate each part of the market.",
    image: "/images/blog/tampa-bay-fishing-pier-aerial.jpg",
    imageAlt: "Aerial view of a pier stretching into Tampa Bay",
    answer:
      "St. Petersburg sits on the Pinellas peninsula between Tampa Bay and the Gulf. Housing ranges from downtown high-rise condos to historic bungalows in Old Northeast and Kenwood. Because much of the city is low-lying and near water, flood zone, elevation and insurance are central to every purchase.",
    neighborhoods: [
      { name: "Downtown St. Pete", note: "High-rise and mid-rise condos near the waterfront and museums." },
      { name: "Old Northeast", note: "Historic homes on brick streets near the bay." },
      { name: "Kenwood", note: "Craftsman bungalows and a strong neighborhood identity." },
      { name: "Snell Isle & waterfront", note: "Bayfront and canal homes with boating access." },
    ],
    knowBefore: [
      "Request the elevation certificate and flood insurance quote",
      "Ask about past storm damage and repairs",
      "For condos, review reserves and inspection status",
    ],
    faqs: [
      { q: "Is flood insurance expensive in St. Petersburg?", a: "It depends on the flood zone, elevation and the home's construction. Get a quote early using the elevation certificate." },
      { q: "Do you help sellers in St. Pete?", a: "Yes. We prepare a property analysis using recent nearby sales and help with pricing, marketing and negotiation." },
    ],
  },
];

export const getArea = (slug: string) => AREAS.find((a) => a.slug === slug);

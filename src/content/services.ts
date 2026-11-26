import { idx, site } from "@/config/site";
import type { LeadType, StandardEvent } from "@/lib/meta";
import type { Faq } from "@/components/sections/Blocks";

export type ServicePageData = {
  path: string;
  category: string;
  leadType: LeadType;
  crumbs: { label: string; href: string }[];
  meta: { title: string; description: string };
  schema: { name: string; serviceType: string };
  hero: {
    eyebrow: string;
    h1: string;
    lede: string;
    image: string;
    imageAlt: string;
    bullets: string[];
    secondary?: { label: string; href: string; event?: StandardEvent; custom?: string; params?: Record<string, string> };
    funnelTitle?: string;
  };
  answer: { q: string; a: string };
  includes: { title: string; intro: string; items: string[]; image: string; imageAlt: string; id?: string };
  audiences?: { title: string; intro?: string; items: { title: string; body: string }[] };
  extra?: "sellerSample" | "rentalManagement" | "valuationExplainer";
  steps: { title: string; intro?: string; items: { title: string; body: string }[] };
  faqs: Faq[];
  related: { label: string; href: string; desc: string }[];
  cta: { title: string; body: string; label: string };
};

const LINK = {
  sell: { label: "Sell your home", href: "/sell-your-home", desc: "Pricing, marketing and negotiation" },
  value: { label: "What's my home worth?", href: "/home-valuation", desc: "Free broker value range" },
  buy: { label: "Buy a home in Florida", href: "/residential", desc: "Buyer representation" },
  rent: { label: "Find a rental", href: "/rent", desc: "Homes and condos for rent" },
  pm: { label: "HOA & property management", href: "/property_management", desc: "Licensed CAM firm" },
  cpm: { label: "Commercial property management", href: "/commercial_property_management", desc: "Operations and reporting" },
  owner: { label: "Owner's representation", href: "/owners-representation", desc: "Protect your project" },
  commercial: { label: "Commercial real estate", href: "/commercial", desc: "Buy, sell, lease and manage" },
  acq: { label: "Sales & acquisitions", href: "/sales_acquisitions", desc: "Investment property" },
  lease: { label: "Leasing & tenant representation", href: "/tenant_buyer_representation", desc: "Find space for your business" },
  fin: { label: "Mortgage calculator", href: "/financing", desc: "Estimate a monthly payment" },
  resident: { label: "Resident services", href: "/resident_services", desc: "Rent, maintenance, move-out" },
  tampa: { label: "Living in Tampa", href: "/areas/tampa", desc: "Neighborhoods and what to know" },
};

export const SERVICES: Record<string, ServicePageData> = {
  sell: {
    path: "/sell-your-home",
    category: "sell",
    leadType: "sell",
    crumbs: [{ label: "Sell your home", href: "/sell-your-home" }],
    meta: {
      title: "Sell Your Florida Home | Free Property Analysis | Prime 1 Realty",
      description: "Selling a home anywhere in Florida? Get a free broker property analysis with comparable sales, a pricing range and a marketing plan. No obligation to list.",
    },
    schema: { name: "Home seller representation in Florida", serviceType: "Real estate listing and seller representation" },
    hero: {
      eyebrow: "Sell with Prime 1",
      h1: "Sell your Florida home for the right price, on your timeline",
      lede: "Know your number before you list. Answer four quick questions and a licensed broker prepares a property analysis with recent comparable sales, current competition and a pricing range.",
      image: "/images/sell/tampa-bay-brick-home-for-sale.jpg",
      imageAlt: "Two-story Florida home with palm trees and a front lawn",
      bullets: ["No obligation to list", "Prepared by a licensed broker", "Homes anywhere in Florida"],
      secondary: { label: "Estimate my home value first", href: "/home-valuation" },
      funnelTitle: "Free property analysis",
    },
    answer: {
      q: "How do I sell my house in Florida?",
      a: "Start with a pricing analysis based on recent comparable sales and the homes you would compete with today. Then prepare the home, launch it on the MLS with professional marketing, review offers on price and terms, and coordinate inspections, appraisal and closing. Prime 1 handles each step and keeps you updated until the keys change hands.",
    },
    includes: {
      title: "What does Prime 1 do for sellers?",
      intro: "Seller representation covers everything from the first price conversation to closing day.",
      items: [
        "Comparable sales and active competition review",
        "Pricing strategy with a clear range and reasoning",
        "Preparation and presentation advice before photos",
        "MLS listing with syndication to major home search sites",
        "Showing coordination and buyer feedback",
        "Offer review, negotiation and counteroffers",
        "Inspection, appraisal and closing coordination",
      ],
      image: "/images/sell/two-story-home-front-lawn.jpg",
      imageAlt: "Family home with a front lawn, ready to list",
    },
    extra: "sellerSample",
    audiences: {
      title: "Who we help sell",
      items: [
        { title: "Move-up and downsizing owners", body: "Coordinate the sale with your next purchase so you are not paying two mortgages longer than needed." },
        { title: "Relocating sellers", body: "Sell from out of town with remote signing options and one point of contact." },
        { title: "Landlords and investors", body: "Sell a rental with tenants in place or after a planned move-out." },
        { title: "Inherited homes", body: "A calm, step-by-step plan for families handling an estate property." },
      ],
    },
    steps: {
      title: "How selling with Prime 1 works",
      items: [
        { title: "Tell us about the home", body: "Answer four questions or call. We learn your goals, timing and any repairs you already know about." },
        { title: "Review your analysis", body: "We walk you through comparable sales, competition and a pricing range, in person or by phone." },
        { title: "Launch and negotiate", body: "Your home goes live with a marketing plan. We review every offer with you on price and terms." },
        { title: "Close with confidence", body: "We coordinate inspection, appraisal, title and closing so nothing slips." },
      ],
    },
    faqs: [
      { q: "Is a property analysis the same as an appraisal?", a: "No. A broker property analysis is a professional opinion of market position based on comparable sales and current competition. An appraisal is a formal valuation, usually ordered by a lender." },
      { q: "Do I need to be ready to sell before contacting you?", a: "No. Many owners start a few months early so they can plan repairs, timing and their next move. There is no obligation to list." },
      { q: "What areas do you serve?", a: "Prime 1 Realty is headquartered in Tampa and serves clients throughout Florida. Tell us where your property is; requests are welcome for any Florida location." },
      { q: "What details help you price my home?", a: "The address, bedrooms and bathrooms, major updates and their years (roof, HVAC, kitchen), any known issues, and whether the home is occupied or rented." },
      { q: "What happens after I submit the form?", a: "A licensed professional reviews your details, prepares your analysis and contacts you, usually within one business day." },
    ],
    related: [LINK.value, LINK.buy, LINK.fin],
    cta: { title: "Find out what your home could sell for", body: "A broker-prepared analysis, free and with no obligation.", label: "Get my property analysis" },
  },

  valuation: {
    path: "/home-valuation",
    category: "valuation",
    leadType: "valuation",
    crumbs: [{ label: "Home valuation", href: "/home-valuation" }],
    meta: {
      title: "What's My Home Worth? Free Florida Home Valuation | Prime 1",
      description: "Get a free home value range for your Florida home, prepared by a licensed broker using recent nearby sales. Not an automated guess. Takes 60 seconds.",
    },
    schema: { name: "Free home valuation in Florida", serviceType: "Broker price opinion / comparative market analysis" },
    hero: {
      eyebrow: "Free home valuation",
      h1: "What's my home worth in today's Florida market?",
      lede: "Online estimates can miss by tens of thousands of dollars because they cannot see your upgrades or condition. Answer a few questions and a broker sends a value range based on real nearby sales.",
      image: "/images/areas/tampa-bay-aerial-homes-with-pools.jpg",
      imageAlt: "Aerial view of Florida homes with backyard pools",
      bullets: ["Broker-prepared, not automated", "Based on recent nearby sales", "No obligation, no pressure"],
      funnelTitle: "Home value report",
    },
    answer: {
      q: "How is my home's value calculated?",
      a: "We compare your home with similar homes that sold nearby in recent months, then adjust for size, condition, updates, lot and location. We also look at homes currently for sale, since that is your competition. The result is a realistic price range, not a single automated number.",
    },
    includes: {
      title: "What's in your home value report?",
      intro: "A clear range you can plan around, with the reasoning behind it.",
      items: [
        "Recent comparable sales near your home",
        "Active and pending listings you would compete with",
        "A suggested value range with adjustments explained",
        "Typical days on market for similar homes",
        "Updates that tend to add value, and ones that usually don't",
      ],
      image: "/images/buy/bright-living-room-interior.jpg",
      imageAlt: "Bright updated living room with large windows",
    },
    extra: "valuationExplainer",
    steps: {
      title: "How it works",
      items: [
        { title: "Answer four questions", body: "Address, bedrooms, condition and timing. About 60 seconds." },
        { title: "We pull the data", body: "A broker reviews recent sales and current listings around your home." },
        { title: "Get your range", body: "We send your value range and are happy to walk you through it." },
      ],
    },
    faqs: [
      { q: "Is this an automated estimate?", a: "No. A licensed broker reviews your details and nearby sales. Automated estimates use public records only and cannot see upgrades or condition." },
      { q: "Is the valuation free?", a: "Yes. There is no cost and no obligation to list your home." },
      { q: "How accurate is a broker valuation?", a: "It is usually closer than an online estimate because it accounts for condition and updates. It is still an opinion of market value, not a formal appraisal." },
      { q: "How long does it take?", a: "Most value ranges are sent within one business day of your request." },
    ],
    related: [LINK.sell, LINK.fin, LINK.buy],
    cta: { title: "Get your home value range", body: "Broker-prepared, free and with no obligation.", label: "Start my home valuation" },
  },

  buy: {
    path: "/residential",
    category: "buy",
    leadType: "buy",
    crumbs: [{ label: "Buy a home", href: "/residential" }],
    meta: {
      title: "Florida Homes for Sale & Buyer Agent | Prime 1 Realty",
      description: "Buying a home in Florida? Search MLS listings and get a buyer agent who checks flood and insurance costs and negotiates price, inspections and closing.",
    },
    schema: { name: "Home buyer representation in Florida", serviceType: "Real estate buyer representation" },
    hero: {
      eyebrow: "Buy with Prime 1",
      h1: "Florida homes for sale, with a buyer agent on your side",
      lede: "Tell us where, how much and when. We send homes that fit, flag the ones with flood, insurance or HOA surprises, and negotiate for you from first showing to closing.",
      image: "/images/buy/florida-pool-home-at-dusk.jpg",
      imageAlt: "Modern Florida home with a swimming pool and patio",
      bullets: ["Live MLS listings", "Flood zone & insurance check on every home", "Buyers anywhere in Florida"],
      secondary: { label: "Search homes for sale", href: idx.search, custom: "HomeSearchClick", params: { search_type: "buy" } },
      funnelTitle: "Personalized home search",
    },
    answer: {
      q: "How does buying a home in Florida work?",
      a: "Get pre-approved so you know your budget, then tour homes that match your area and must-haves. Before you offer, check the flood zone, insurance cost, HOA or CDD fees and the roof's age, since these change your monthly cost in Florida. Your agent writes the offer, negotiates inspection repairs and coordinates closing.",
    },
    includes: {
      title: "What does a buyer agent do for you?",
      intro: "Representation that protects your money and your timeline.",
      items: [
        "Homes that match your budget, area and must-haves",
        "Flood zone, insurance, HOA and CDD fee review before you offer",
        "Comparable sales so you know what to offer",
        "Offer writing, negotiation and contingency strategy",
        "Inspection, appraisal and repair negotiations",
        "Closing coordination with your lender and title company",
      ],
      image: "/images/buy/modern-kitchen-island.jpg",
      imageAlt: "Modern kitchen with island seating and pendant lights",
    },
    audiences: {
      title: "Who we help buy",
      items: [
        { title: "First-time buyers", body: "A plain-language walk through budget, offers and closing costs." },
        { title: "Relocating to Florida", body: "Video tours, neighborhood guidance and remote closing options." },
        { title: "Move-up buyers", body: "Time your purchase with the sale of your current home." },
        { title: "Investors", body: "Rental comps, HOA rental rules and property management under one roof." },
      ],
    },
    steps: {
      title: "How buying with Prime 1 works",
      items: [
        { title: "Share your criteria", body: "Area, price range, financing and timing. Takes a minute." },
        { title: "Get matched homes", body: "We send listings that fit and set up tours, in person or by video." },
        { title: "Offer and negotiate", body: "We price your offer with comparable sales and negotiate terms and repairs." },
        { title: "Close and move in", body: "We coordinate lender, appraisal, title and final walkthrough." },
      ],
    },
    faqs: [
      { q: "Do I need to be pre-approved before touring homes?", a: "It is strongly recommended. A pre-approval sets your budget and makes your offer stronger. If you need a lender, we can share options." },
      { q: "Why do flood zones and insurance matter so much in Florida?", a: "Insurance premiums and flood coverage can change a monthly payment significantly. We check flood zone and roof age before you offer so there are no surprises." },
      { q: "What is a CDD fee?", a: "A Community Development District fee pays for infrastructure in some newer Florida communities. It usually appears on the property tax bill, in addition to any HOA dues." },
      { q: "Can I see homes from out of state?", a: "Yes. We offer live video tours and can coordinate remote or mail-away closings with the title company." },
      { q: "Do you show homes listed by other brokerages?", a: "Yes. As a buyer's agent we can show and negotiate on homes listed on the MLS, regardless of the listing brokerage." },
    ],
    related: [LINK.fin, LINK.value, LINK.tampa],
    cta: { title: "Find the right home without the guesswork", body: "Tell us what you want. We'll send homes that fit.", label: "Start my home search" },
  },

  rent: {
    path: "/rent",
    category: "rent",
    leadType: "rent",
    crumbs: [{ label: "Rent a home", href: "/rent" }],
    meta: {
      title: "Homes & Condos for Rent in Florida | Prime 1 Realty",
      description: "Looking for a rental in Florida? Tell us your area, bedrooms and budget, see homes managed by Prime 1 and apply online.",
    },
    schema: { name: "Rental home search in Florida", serviceType: "Residential leasing" },
    hero: {
      eyebrow: "Rent with Prime 1",
      h1: "Find a home or condo to rent in Florida",
      lede: "Tell us where you want to live, how many bedrooms and your budget. We match you with available rentals and walk you through the application.",
      image: "/images/rent/modern-apartment-building.jpg",
      imageAlt: "Modern apartment building with balconies",
      bullets: ["Online application", "Online rent payments & maintenance requests", "Licensed Florida management team"],
      secondary: { label: "Apply online", href: site.portals.rentalApplication, custom: "RentalApplicationClick", params: { type: "rental_application" } },
      funnelTitle: "Rental match",
    },
    answer: {
      q: "How do I rent a home through Prime 1?",
      a: "Share your area, bedrooms, budget and move-in date. We send matching rentals and schedule viewings. When you find the right home, apply online through our resident portal. Review the resident criteria first so you know the income, credit and pet screening requirements before you apply.",
    },
    includes: {
      title: "What renting with Prime 1 looks like",
      intro: "A straightforward process from application to move-in.",
      items: [
        "Rentals matched to your area, size and budget",
        "Online application through our secure resident portal",
        "Clear resident criteria before you apply",
        "Online rent payments and maintenance requests through the resident portal",
        "Move-in and move-out coordination",
      ],
      image: "/images/rent/new-tenant-receiving-keys.jpg",
      imageAlt: "New tenant holding the keys to a rental home",
    },
    steps: {
      title: "How to rent with Prime 1",
      items: [
        { title: "Tell us what you need", body: "Area, bedrooms, budget and move-in date." },
        { title: "Tour and apply", body: "View matching homes, then apply online in minutes." },
        { title: "Sign and move in", body: "Sign your lease, set up utilities and get your keys." },
      ],
    },
    faqs: [
      { q: "How do I apply for a rental?", a: "Apply online through the Prime 1 resident portal. Review the resident criteria first so you know what is required." },
      { q: "What documents do I need?", a: "Typically a government-issued ID, proof of income and contact details for rental history. The resident criteria lists the full requirements." },
      { q: "Do you allow pets?", a: "Pet policies vary by property. All applicants, including those without pets, complete the pet screening form." },
      { q: "How do I pay rent once I move in?", a: "Rent is paid online through the resident portal, where you can also submit maintenance requests." },
    ],
    related: [LINK.resident, LINK.buy, LINK.pm],
    cta: { title: "Find your next rental", body: "Tell us what you need and we'll match you with available homes.", label: "Find my rental" },
  },

  management: {
    path: "/property_management",
    category: "property_management",
    leadType: "management",
    crumbs: [{ label: "Property management", href: "/property_management" }],
    meta: {
      title: "Florida HOA & Condo Association Management | Prime 1",
      description: "Licensed Florida CAM firm for HOAs, condo and commercial owners' associations and office parks statewide. Request an association management proposal.",
    },
    schema: { name: "Community association management in Florida", serviceType: "Community association management and property management" },
    hero: {
      eyebrow: "Prime 1 Property Management",
      h1: "Community association management throughout Florida",
      lede: "Prime 1 Property Management is a licensed Florida community association management firm, headquartered in Tampa. We manage homeowners and condominium associations, commercial property owners' associations, office parks and qualifying rental portfolios, with inspections, board reporting and Buildium portal access.",
      image: "/images/blog/florida-condo-association-marina.jpg",
      imageAlt: "Condominium towers with palm trees in Tampa",
      bullets: ["Licensed Florida CAM firm with a Designated CAM", "Associations of 10+ units throughout Florida", "24/7 live answering for association emergencies"],
      funnelTitle: "Association management proposal",
    },
    answer: {
      q: "What does a community association manager do?",
      a: "A licensed community association manager (CAM) runs the day-to-day business of an HOA or condo association: budgets and collections, vendor contracts, maintenance, meeting notices and records, and compliance with Florida statutes. The board sets policy; the manager carries it out and reports back. Under Florida law (Chapter 468, Part VIII), an association with more than 10 units or an annual budget over $100,000 must use a licensed CAM. Prime 1 Property Management is a licensed CAM firm with a Designated CAM.",
    },
    includes: {
      title: "What does association management include?",
      intro: "For HOAs, condominium associations, commercial property owners' associations and office parks throughout Florida.",
      items: [
        "Association administration and records",
        "Board meeting support, notices and minutes",
        "Budgeting, collections and financial reporting",
        "Reserve study and structural inspection coordination",
        "Vendor bids, contracts and oversight",
        "Maintenance and common-area inspections",
        "Compliance with Florida association statutes",
      ],
      image: "/images/blog/florida-waterfront-condo-community-aerial.jpg",
      imageAlt: "Aerial view of a waterfront condominium community in Florida",
    },
    extra: "rentalManagement",
    audiences: {
      title: "Who we manage for",
      items: [
        { title: "HOA boards", body: "Communities of 10 or more homes that need dependable administration, enforcement and a licensed CAM." },
        { title: "Condo associations", body: "Associations of 10 or more units facing milestone inspections, reserve requirements and insurance changes." },
        { title: "Rental portfolio owners", body: "Qualifying residential rental portfolios: leasing, rent collection, maintenance and owner reporting." },
        { title: "Commercial associations & office parks", body: "Commercial property owners' associations and office parks that need operations, vendor oversight and reporting." },
      ],
    },
    steps: {
      title: "How switching to Prime 1 works",
      items: [
        { title: "Request a proposal", body: "Association name, location, unit count and primary concern. Attach your RFP if you have one." },
        { title: "Scope & site review", body: "We review your documents, budget, open issues and the site coverage the property needs." },
        { title: "Written proposal", body: "Scope, responsibilities, reporting, site coverage and fees, presented to the board." },
        { title: "Transition, if selected", body: "We transfer records, open work orders, vendor information and resident portal access from your current manager." },
      ],
    },
    faqs: [
      { q: "Is Prime 1 Property Management licensed?", a: "Yes. Prime 1 Property Management is a licensed Florida community association management firm, and Antony Oseitutu serves as its Designated CAM. You can verify licenses at myfloridalicense.com." },
      { q: "Does our association need a licensed CAM?", a: "Under Florida law (Chapter 468, Part VIII), an HOA or condo association with more than 10 units, or with an annual budget over $100,000, must be managed by a licensed community association manager. Either condition is enough. Prime 1 Property Management is a licensed CAM firm with a Designated CAM. Our service criteria start at 10 units for homeowners and condominium associations." },
      { q: "What accounts do you accept?", a: "Homeowners and condominium associations with 10 or more units, commercial property owners' associations and office parks throughout Florida, and qualifying rental portfolios. These are Prime 1's service criteria; send the details in the proposal form and we will confirm fit before proposing." },
      { q: "Do you manage rental properties?", a: "We manage qualifying residential rental portfolios that meet our service criteria. Rental management does not require a community association manager license; Prime 1 handles it as a licensed Florida real estate brokerage." },
      { q: "How do owners and residents access information?", a: "Through Buildium. Owners get statements, reports and documents. Residents and association members use the portal for payments, maintenance requests and community documents. For a community association emergency, call (813) 295-8215: live answering 24/7." },
      { q: "How do you handle the transition from our current manager?", a: "We coordinate the transfer of records, bank accounts, vendor information, open work orders and resident portal access so the board is not left doing it." },
      { q: "Which areas do you serve?", a: "Associations throughout Florida. Prime 1 Property Management is headquartered in Tampa; site coverage for your property is part of the proposal." },
      { q: "Can you help with milestone inspections and reserve studies?", a: "We coordinate the engineers and reserve specialists your association needs and keep the board on schedule with its obligations." },
    ],
    related: [LINK.cpm, LINK.owner, LINK.resident],
    cta: { title: "Request an association management proposal", body: "The broker and Designated CAM reviews every association proposal request.", label: "Request a proposal" },
  },

  commercialPM: {
    path: "/commercial_property_management",
    category: "commercial_property_management",
    leadType: "management",
    crumbs: [
      { label: "Property management", href: "/property_management" },
      { label: "Commercial property management", href: "/commercial_property_management" },
    ],
    meta: {
      title: "Commercial Property Management in Florida | Prime 1",
      description: "Commercial property management throughout Florida: tenant communications, rent collection, vendors, maintenance, budgets and owner reporting. Request a proposal.",
    },
    schema: { name: "Commercial property management in Florida", serviceType: "Commercial property management" },
    hero: {
      eyebrow: "Commercial property management",
      h1: "Commercial property management that keeps owners in control",
      lede: "Keep ownership priorities connected to daily operations. We handle tenants, collections, vendors and maintenance, with agreed spending approvals and regular financial reporting.",
      image: "/images/commercial/white-commercial-building.jpg",
      imageAlt: "Landscaped courtyard between modern office buildings",
      bullets: ["Agreed spending approvals", "Regular financial reporting", "Coordinated with leasing"],
      funnelTitle: "Management proposal",
    },
    answer: {
      q: "What does commercial property management include?",
      a: "It covers the operating side of an income property: tenant communication, rent collection, vendor onboarding, maintenance and inspections, budgets and financial reports. The management agreement sets who approves spending, how often you get reports and how issues are escalated.",
    },
    includes: {
      title: "Services may include",
      intro: "Every agreement is scoped to your property and how involved you want to be.",
      items: [
        "Tenant communications and requests",
        "Rent and CAM charge collection",
        "Vendor onboarding and oversight",
        "Maintenance coordination and property inspections",
        "Operating budgets and financial reporting",
        "Lease administration",
        "Coordination with leasing representatives",
      ],
      image: "/images/commercial/glass-office-interior.jpg",
      imageAlt: "Glass-walled office corridor in a managed commercial building",
    },
    steps: {
      title: "How it works",
      items: [
        { title: "Discuss your property", body: "Asset type, tenants, current issues and goals." },
        { title: "Agree on scope", body: "Responsibilities, approvals, reporting and communication in writing." },
        { title: "Operate and report", body: "We run daily operations and report on a set schedule." },
      ],
    },
    faqs: [
      { q: "What property types do you manage?", a: "Office, retail, flex and mixed-use properties, plus commercial property owners associations and office parks." },
      { q: "Do I approve expenses?", a: "Yes. Spending approval thresholds are set in the management agreement." },
      { q: "Do you also handle leasing?", a: "We coordinate with leasing representatives, and Prime 1 Realty can represent the property for leasing if you choose." },
    ],
    related: [LINK.pm, LINK.lease, LINK.owner],
    cta: { title: "Get a commercial management proposal", body: "Scope, reporting and fees in writing.", label: "Request my proposal" },
  },

  ownersRep: {
    path: "/owners-representation",
    category: "owners_representation",
    leadType: "commercial",
    crumbs: [
      { label: "Commercial", href: "/commercial" },
      { label: "Owner's representation", href: "/owners-representation" },
    ],
    meta: {
      title: "Owner's Representation: Acquisitions & Dispositions | Prime 1",
      description: "Owner's representation for commercial acquisitions and dispositions in Florida: evaluation, negotiation, due diligence and closing.",
    },
    schema: { name: "Owner's representation", serviceType: "Real estate owner's representation" },
    hero: {
      eyebrow: "Owner's representation · Commercial acquisitions & dispositions",
      h1: "Owner's representation for commercial acquisitions and dispositions",
      lede: "When you buy or sell commercial property in Florida, we sit on your side of the table: evaluating the property, negotiating terms, managing due diligence and carrying the transaction through closing.",
      image: "/images/commercial/office-building-lobby-evening.jpg",
      imageAlt: "Curved glass office building",
      bullets: ["Evaluation and underwriting support", "Negotiation and due diligence management", "Closing coordination, one point of accountability"],
      funnelTitle: "Discuss an acquisition or sale",
    },
    answer: {
      q: "What is owner's representation in a commercial acquisition or disposition?",
      a: "An owner's representative acts only for the owner when buying or selling commercial property. For an acquisition, that means evaluating the property and its income, negotiating price and terms, and managing due diligence through closing. For a disposition, it means positioning and pricing the asset, qualifying buyers, negotiating and protecting the owner through closing. Owner's representation can also extend to capital projects after closing.",
    },
    includes: {
      title: "What owner's representation covers",
      intro: "Acquisitions and dispositions first, with project oversight when you need it.",
      items: [
        "Evaluation: rent roll, operating statements, comparable sales and market position",
        "Negotiation of price, terms, credits and contingencies",
        "Due diligence management: inspections, title, survey, environmental, leases and estoppels",
        "Closing coordination with attorneys, lenders and title",
        "Disposition strategy: pricing, marketing, buyer qualification and offer review",
        "Post-closing project oversight: budget, schedule and contractor coordination",
      ],
      image: "/images/commercial/white-commercial-building.jpg",
      imageAlt: "Landscaped courtyard between modern office buildings",
    },
    audiences: {
      title: "Who we work with",
      items: [
        { title: "Investors and funds", body: "Acquisitions and dispositions with disciplined evaluation and negotiation." },
        { title: "Owner-users", body: "Buying or selling the property your business operates from." },
        { title: "Developers", body: "Site acquisitions, dispositions and project oversight." },
        { title: "Associations and institutions", body: "Structured reporting for boards and stakeholders." },
      ],
    },
    steps: {
      title: "How we engage",
      items: [
        { title: "Evaluate", body: "Objectives, property, income, market and risk." },
        { title: "Negotiate", body: "Price, terms and contingencies that protect you." },
        { title: "Due diligence", body: "We manage the investigation period and every deadline." },
        { title: "Close", body: "Coordination with attorneys, lenders and title through closing." },
      ],
    },
    faqs: [
      { q: "When should I bring in an owner's representative?", a: "Before you sign a letter of intent or a contract, so evaluation and negotiation shape the terms and the due diligence period is planned." },
      { q: "Do you work throughout Florida?", a: "Yes. Prime 1 Realty is headquartered in Tampa and represents owners on commercial acquisitions and dispositions throughout Florida." },
      { q: "Can you also oversee a project after closing?", a: "Yes. We can coordinate consultants and contractors and track budget and schedule on capital projects, so the owner keeps control without managing every detail." },
    ],
    related: [LINK.commercial, LINK.cpm, LINK.acq],
    cta: { title: "Discuss an acquisition or disposition", body: "Confidential, and on your side from evaluation to closing.", label: "Discuss owner's representation" },
  },

  commercial: {
    path: "/commercial",
    category: "commercial",
    leadType: "commercial",
    crumbs: [{ label: "Commercial real estate", href: "/commercial" }],
    meta: {
      title: "Florida Commercial Real Estate Brokerage | Prime 1 Realty",
      description: "Commercial real estate throughout Florida: acquisitions, dispositions, leasing, tenant representation, owner's representation and property management.",
    },
    schema: { name: "Commercial real estate brokerage in Florida", serviceType: "Commercial real estate brokerage" },
    hero: {
      eyebrow: "Prime 1 Commercial",
      h1: "Commercial real estate throughout Florida, focused on your objectives",
      lede: "We help owners, investors and businesses buy, sell, lease and manage commercial property throughout Florida, with one accountable team from strategy to operations.",
      image: "/images/areas/tampa-downtown-skyline.jpg",
      imageAlt: "Downtown Tampa skyline with office towers",
      bullets: ["Acquisitions & dispositions", "Leasing & tenant representation", "Owner's rep & management"],
      secondary: { label: "Browse commercial listings", href: "/commercial_properties" },
      funnelTitle: "Commercial consultation",
    },
    answer: {
      q: "What commercial real estate services does Prime 1 offer?",
      a: "Prime 1 represents buyers and sellers of investment property, helps businesses lease or buy space, represents owners on projects and manages commercial properties after closing. Because brokerage and management sit in one firm, your acquisition plan and your operating plan stay connected.",
    },
    includes: {
      title: "Representation for every stage of ownership",
      intro: "Pick the service you need now. We stay with you for the next stage.",
      items: [
        "Acquisitions: criteria, search, underwriting support and due diligence",
        "Property sales: pricing, offering materials, marketing and negotiation",
        "Leasing & tenant representation: requirements, tours and lease terms",
        "Owner's representation: cost, risk and schedule oversight",
        "Commercial property management: operations and reporting",
      ],
      image: "/images/commercial/glass-office-interior.jpg",
      imageAlt: "Glass office interior in a commercial building",
    },
    steps: {
      title: "How we work with commercial clients",
      items: [
        { title: "Clarify objectives", body: "Investment goals, space needs or disposition timing." },
        { title: "Build the strategy", body: "Market data, comparable deals and a clear plan." },
        { title: "Execute and close", body: "Negotiation, due diligence and closing coordination." },
      ],
    },
    faqs: [
      { q: "What areas do you cover for commercial real estate?", a: "Throughout Florida. Prime 1 Realty is headquartered in Tampa, and commercial inquiries are welcome for any Florida location." },
      { q: "Which property types do you work with?", a: "Office, retail, industrial and flex, multifamily, mixed-use, hospitality and land." },
      { q: "Can you manage the property after we buy it?", a: "Yes. Prime 1 Property Management offers commercial property management, so operations can start the day you close." },
    ],
    related: [LINK.acq, LINK.lease, LINK.owner],
    cta: { title: "Talk to a commercial broker", body: "Confidential conversation about your objectives.", label: "Start the conversation" },
  },

  commercialProps: {
    path: "/commercial_properties",
    category: "commercial_listings",
    leadType: "commercial",
    crumbs: [
      { label: "Commercial", href: "/commercial" },
      { label: "Commercial properties", href: "/commercial_properties" },
    ],
    meta: {
      title: "Florida Commercial Properties for Sale & Lease | Prime 1",
      description: "Office, retail, industrial, multifamily and land for sale or lease in Florida. Browse listings or share your criteria for off-market options.",
    },
    schema: { name: "Commercial property search", serviceType: "Commercial property sales and leasing" },
    hero: {
      eyebrow: "Commercial inventory",
      h1: "Commercial properties for sale and lease in Florida",
      lede: "Browse current MLS listings, or tell us your criteria and a commercial broker will send matching properties, including options that are not widely marketed.",
      image: "/images/commercial/office-building-lobby-evening.jpg",
      imageAlt: "Curved glass office building",
      bullets: ["Office, retail, industrial, multifamily, land", "Sale and lease", "Investment underwriting support"],
      secondary: { label: "Browse commercial listings", href: idx.commercial, custom: "HomeSearchClick", params: { search_type: "commercial" } },
      funnelTitle: "Property criteria",
    },
    answer: {
      q: "How do I find commercial property in Florida?",
      a: "Start with your criteria: property type, size, location, budget or rent, and timing. Public listings show part of the market. A commercial broker adds comparable deals, owner outreach and lease or purchase negotiation, which matters most when the right space is not listed.",
    },
    includes: {
      title: "Property types we represent",
      intro: "For buyers, sellers, landlords and tenants.",
      items: ["Office and medical office", "Retail and restaurant", "Industrial, warehouse and flex", "Multifamily (5+ units) and mixed-use", "Hospitality", "Land and redevelopment sites"],
      image: "/images/commercial/white-commercial-building.jpg",
      imageAlt: "Modern office buildings around a landscaped courtyard",
    },
    steps: {
      title: "How it works",
      items: [
        { title: "Share your criteria", body: "Type, size, location and budget." },
        { title: "Review matches", body: "Listed and off-market options with comparable data." },
        { title: "Tour and negotiate", body: "We negotiate price or lease terms on your behalf." },
      ],
    },
    faqs: [
      { q: "Are all available commercial properties listed online?", a: "No. Some owners sell or lease quietly. Sharing your criteria lets us look beyond public listings." },
      { q: "Do you represent tenants as well as buyers?", a: "Yes. See leasing and tenant representation for businesses looking for space." },
    ],
    related: [LINK.commercial, LINK.acq, LINK.lease],
    cta: { title: "Tell us what you're looking for", body: "We'll send matching properties, listed and off-market.", label: "Share my criteria" },
  },

  acquisitions: {
    path: "/sales_acquisitions",
    category: "sales_acquisitions",
    leadType: "commercial",
    crumbs: [
      { label: "Commercial", href: "/commercial" },
      { label: "Sales & acquisitions", href: "/sales_acquisitions" },
    ],
    meta: {
      title: "Florida Investment Property Sales & Acquisitions | Prime 1",
      description: "Buy or sell investment property in Florida with a disciplined process: criteria, comps, rent roll review, pricing, negotiation and due diligence.",
    },
    schema: { name: "Investment property sales and acquisitions", serviceType: "Commercial real estate sales and acquisitions" },
    hero: {
      eyebrow: "Sales & acquisitions",
      h1: "A disciplined approach to buying and selling investment property",
      lede: "Every investment has a purpose. We help buyers find property that fits their criteria and help sellers position assets to attract qualified buyers and strong terms.",
      image: "/images/rent/apartment-building-balconies.jpg",
      imageAlt: "Apartment building with balconies at sunset",
      bullets: ["Rent roll & operating statement review", "Pricing with comparable sales", "Due diligence & closing coordination"],
      funnelTitle: "Acquisition or sale",
    },
    answer: {
      q: "How do you price a commercial or investment property?",
      a: "Pricing starts with income: the rent roll, operating expenses and the resulting net operating income. That is compared with recent sales of similar properties and current market cap rates, then adjusted for condition, lease terms and upside. Buyers use the same analysis to decide what to offer.",
    },
    includes: {
      title: "Services include",
      intro: "For buyers and sellers of commercial and investment real estate.",
      items: [
        "Acquisition criteria and property searches",
        "Comparable sales and market analysis",
        "Rent roll and operating statement review",
        "Pricing strategy",
        "Marketing and offering materials",
        "Tours and offer review",
        "Negotiations, due diligence and closing coordination",
      ],
      image: "/images/commercial/office-building-lobby-evening.jpg",
      imageAlt: "Curved glass office building",
    },
    audiences: {
      title: "Buyers and sellers",
      items: [
        { title: "For buyers", body: "Clear criteria, disciplined underwriting and negotiation that protects your returns." },
        { title: "For sellers", body: "Positioning, documentation and marketing that bring qualified buyers and strong terms." },
      ],
    },
    steps: {
      title: "Our process",
      items: [
        { title: "Define the objective", body: "Return targets, hold period or exit timing." },
        { title: "Analyze", body: "Income, expenses, comparable sales and risk." },
        { title: "Transact", body: "Negotiate, complete due diligence and close." },
      ],
    },
    faqs: [
      { q: "Do you work with 1031 exchange buyers?", a: "Yes. We can help identify replacement properties within your timeline. Your qualified intermediary and tax advisor handle the exchange itself." },
      { q: "What documents should a seller prepare?", a: "A current rent roll, 12–24 months of operating statements, leases, service contracts and any recent inspection or capital improvement records." },
    ],
    related: [LINK.commercial, LINK.cpm, LINK.lease],
    cta: { title: "Discuss an acquisition or sale", body: "Confidential, data-driven and focused on your objectives.", label: "Talk to a commercial broker" },
  },

  tenantRep: {
    path: "/tenant_buyer_representation",
    category: "tenant_representation",
    leadType: "commercial",
    crumbs: [
      { label: "Commercial", href: "/commercial" },
      { label: "Leasing & tenant representation", href: "/tenant_buyer_representation" },
    ],
    meta: {
      title: "Florida Commercial Leasing & Tenant Representation | Prime 1",
      description: "Find office, retail or industrial space in Florida. Tenant representation covers requirements, searches, tours, occupancy costs and lease negotiation.",
    },
    schema: { name: "Commercial leasing and tenant representation", serviceType: "Tenant representation" },
    hero: {
      eyebrow: "Leasing & tenant representation",
      h1: "Find space that supports your business",
      lede: "Whether you are opening, expanding or relocating, we define what you need, search the market, schedule tours and negotiate lease or purchase terms that fit your budget.",
      image: "/images/commercial/glass-office-interior.jpg",
      imageAlt: "Bright glass-walled office space available for lease",
      bullets: ["Requirements & location planning", "Occupancy cost comparison", "Lease and renewal negotiation"],
      funnelTitle: "Space search",
    },
    answer: {
      q: "What does a tenant representative do?",
      a: "A tenant representative works for the business, not the landlord. They define your space requirements, find options, compare the full occupancy cost of each (rent, operating expenses, build-out), and negotiate lease terms, concessions and renewal options in your favor.",
    },
    includes: {
      title: "Services include",
      intro: "From the first requirement list to move-in.",
      items: [
        "Requirements and location planning",
        "Property searches, listed and off-market",
        "Tour scheduling and comparisons",
        "Review of total occupancy costs",
        "Lease and purchase negotiations",
        "Relocation and renewal planning",
        "Milestone coordination through move-in",
      ],
      image: "/images/commercial/white-commercial-building.jpg",
      imageAlt: "Modern office buildings around a landscaped courtyard",
    },
    steps: {
      title: "How it works",
      items: [
        { title: "Define needs", body: "Size, location, budget, timing and must-haves." },
        { title: "Search and tour", body: "Shortlist, tour and compare true costs." },
        { title: "Negotiate and move", body: "Lease terms, concessions and move-in milestones." },
      ],
    },
    faqs: [
      { q: "When should I start looking for new space?", a: "For most businesses, 9–12 months before your current lease ends, and earlier for larger spaces or build-outs." },
      { q: "Can you help me renew my current lease?", a: "Yes. Knowing your alternatives gives you leverage when negotiating a renewal." },
    ],
    related: [LINK.commercial, LINK.acq, LINK.cpm],
    cta: { title: "Find the right space for your business", body: "Tell us what you need. We'll handle the search and negotiation.", label: "Find my space" },
  },
};

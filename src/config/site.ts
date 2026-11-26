/**
 * Single source of truth for business facts, links and integrations.
 * Every page, schema block, sitemap entry and tracking call reads from here.
 */

export const site = {
  name: "Prime 1 Realty",
  legalName: "Antony Kenneth Stefan Oseitutu PLLC",
  pmName: "Prime 1 Property Management",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.prime1realty.net",
  tagline: "Florida residential & commercial real estate brokerage and community association management, headquartered in Tampa",
  description:
    "Prime 1 Realty is a licensed Florida real estate brokerage and Prime 1 Property Management is a licensed Florida community association management firm. Both are headquartered in Tampa and serve clients throughout Florida.",
  phone: {
    display: "(813) 295-8215",
    href: "tel:+18132958215",
    /** Calls only: this number cannot receive text messages, so the site never offers sms: links. */
    e164: "+18132958215",
    /** Office line. Live 24/7 answering applies ONLY to community association emergencies (Prime 1 Property Management). */
    answered: "Mon–Fri, 9 AM–5 PM ET",
    emergency: "24/7 live answering for community association emergencies",
    callsOnly: "Calls only, no text messages",
  },
  email: "admin@prime1realty.net",
  address: {
    street: "1600 E 8th Ave, Suite A200",
    city: "Tampa",
    region: "FL",
    postal: "33605",
    country: "US",
    neighborhood: "Centro Ybor",
    lat: 27.9607,
    lng: -82.4423,
  },
  mapsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=1600+E+8th+Ave+A200+Tampa+FL+33605",
  hours: { label: "Mon–Fri, 9:00 AM–5:00 PM ET", days: "Mo-Fr", opens: "09:00", closes: "17:00", note: "Closed on all federal holidays" },
  /** Statewide: both companies serve clients throughout Florida from the Tampa headquarters. */
  serviceArea: ["Florida"],
  region: "throughout Florida",
  socials: {
    facebook: "https://www.facebook.com/prime1realtyfl/",
    instagram: "https://www.instagram.com/prime1_realty/",
    linkedin: "https://www.linkedin.com/company/prime1-realty",
    youtube: "https://www.youtube.com/@Prime1RealtyNet",
    x: "https://x.com/Prime1RealtyNet",
    zillow: "https://www.zillow.com/profile/Prime1Realty",
  },
  portals: {
    /**
     * Rental OWNER portal. Buildium signs rental owners in through its shared authentication page (the
     * Resident Center itself says "Property manager, rental owner, or vendor? Sign in here" and links here),
     * so this generic-looking Buildium sign-in is the correct owner destination. Verified 26 Nov 2026.
     */
    owner: "https://prime1pm.managebuilding.com/manager/public/authentication/login",
    /** Buildium Resident Center: tenants AND association homeowners / board members sign in here. */
    resident: "https://prime1pm.managebuilding.com/Resident/portal/login",
    association: "https://prime1pm.managebuilding.com/Resident/portal/login",
    rentalApplication: "https://prime1pm.managebuilding.com/Resident/rental-application/new",
    /** Agent Login: the Virtual Office for affiliated agents (it links on to the Agent Portal and tools). */
    agent: "/virtual-office",
    /** Legacy agent portal (app.prime1realty.net), linked from inside the Virtual Office. */
    agentPortal: "https://app.prime1realty.net/",
    /** The one Join Prime 1 path for every channel (homepage, Careers, join. subdomain, LinkedIn, campaigns). */
    joinHome: "/join",
    join: "/join",
    petScreening: "https://prime1realty.petscreening.com/",
  },
  /**
   * Home search (IDX) stays on the current platform. Before the domain moves to this
   * site, set NEXT_PUBLIC_IDX_BASE_URL to the IDX subdomain (e.g. https://search.prime1realty.net).
   */
  idxBase: process.env.NEXT_PUBLIC_IDX_BASE_URL || "https://www.prime1realty.net",
  /**
   * Consultation booking calendar (Calendly / Cal.com). Until it is set, "Book" buttons become
   * "Request a call back" and do NOT fire Meta Schedule, so Schedule only counts real bookings.
   */
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "/lets-connect#start",
  bookingConfigured: Boolean(process.env.NEXT_PUBLIC_BOOKING_URL),
  /**
   * Agent recruiting. Complete application records go to Antony (`notify`) for a decision, with the admin
   * inbox copied (`cc`) for records. There is no booking calendar and no invitation to email the broker
   * about joining: applicants may submit a written request to speak, attached to their application.
   */
  recruiting: {
    name: "Antony Oseitutu",
    email: "antony@prime1realty.net",
    notify: process.env.RECRUITING_EMAIL_TO || "antony@prime1realty.net",
    cc: "admin@prime1realty.net",
  },
  /**
   * Google Ads tag (AW-17574854752). Conversion labels come from Google Ads > Goals > Conversions >
   * (action) > Tag setup > "send_to: AW-17574854752/<LABEL>". Until a label is set, the matching
   * event still goes to Google as a plain event (usable for event-based conversions in Google Ads).
   */
  /** Google Analytics 4 property (same one the previous site used, so reporting continues). */
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "G-NDND810E86",
  /**
   * Microsoft Advertising UET tag ID (Microsoft Ads > Tools > UET tag). When set, every conversion
   * event (leads, calls, bookings, agent applications) is mirrored to Microsoft Ads as well.
   */
  msUetId: process.env.NEXT_PUBLIC_MS_UET_ID || "",
  /** Microsoft Clarity (session recordings + heatmaps). Project: clarity.microsoft.com */
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || "zhvywhzeab",
  googleAds: {
    id: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-17574854752",
    labels: {
      lead: process.env.NEXT_PUBLIC_GADS_LABEL_LEAD || "",
      call: process.env.NEXT_PUBLIC_GADS_LABEL_CALL || "",
      schedule: process.env.NEXT_PUBLIC_GADS_LABEL_SCHEDULE || "",
      agent: process.env.NEXT_PUBLIC_GADS_LABEL_AGENT || "",
      /** Property management only (HOA/condo/rental/commercial PM). When set, PM leads and calls use these instead of lead/call. */
      leadManagement: process.env.NEXT_PUBLIC_GADS_LABEL_LEAD_MANAGEMENT || "",
      callManagement: process.env.NEXT_PUBLIC_GADS_LABEL_CALL_MANAGEMENT || "",
      /** "Calls from website" conversion: swaps the displayed number for a Google forwarding number on ad visits */
      phone: process.env.NEXT_PUBLIC_GADS_LABEL_PHONE || "",
    },
  },
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "1366010352139492",
  mls: "Stellar MLS",
} as const;

export const idx = {
  search: `${site.idxBase}/home-search`,
  rentals: `${site.idxBase}/home-search`,
  commercial: `${site.idxBase}/home-search`,
};

export const people = {
  antony: {
    slug: "antony-oseitutu",
    name: "Antony Oseitutu",
    role: "Owner, Broker of Record & Designated CAM",
    /** Short label for page titles. */
    short: "Broker & Designated CAM",
    titles: ["Owner | Broker of Record, Prime 1 Realty", "Designated CAM, Prime 1 Property Management", "REALTOR®"],
    email: "antony@prime1realty.net",
    image: "/images/team/antony-oseitutu-headshot.jpg",
    cutout: "/images/team/antony-oseitutu-cutout.png",
    bio: [
      "Antony Oseitutu leads Prime 1 Realty as Broker of Record and serves as Designated Community Association Manager for Prime 1 Property Management. His work spans residential and commercial brokerage, rental property management and community association management.",
      "Born in Bern, Switzerland, Antony is a Swiss citizen and a naturalized United States citizen. He built Prime 1 so owners, buyers, sellers and boards throughout Florida could work with one accountable firm instead of juggling separate agents and managers.",
      "Outside real estate, Antony is a licensed race car driver in the United States and overseas.",
    ],
  },
  jennifer: {
    slug: "jennifer-rivera",
    name: "Jennifer M. Rivera",
    role: "Licensed Community Association Manager",
    short: "Licensed CAM",
    titles: ["Licensed Community Association Manager, Prime 1 Property Management"],
    email: "jennifer@prime1realty.net",
    /** Antony's 26 Nov 2026 review: use a clear photo consistent with the other profiles (file pending from the office). */
    image: null as string | null,
    cutout: null as string | null,
    /** Approved by Antony Oseitutu, 26 Nov 2026. Do not edit without his approval. */
    bio: [
      "Jennifer oversees the daily management and operations of community associations within Prime 1 Property Management’s portfolio, including homeowners associations, condominium associations, commercial property owners associations and office parks.",
      "Her responsibilities include association administration, board and homeowner communications, property inspections, maintenance oversight, vendor management, covenant enforcement, architectural review administration, financial reporting support and implementation of board approved initiatives.",
      "Jennifer works directly with association boards, service providers and accounting professionals to support the operational and financial needs of each association.",
      "Working under the leadership of the Designated Community Association Manager, Jennifer also supports new association transitions, management proposals and the continued expansion of Prime 1 Property Management’s Florida portfolio.",
      "Her focus is delivering responsive, accountable and professional community association management services.",
    ],
  },
  gabrielle: {
    slug: "gabrielle-ortiz",
    name: "Gabrielle Ortiz",
    role: "Operations & Transaction Support",
    short: "Operations & Transaction Support",
    titles: ["Operations & Transaction Support, Prime 1 Realty and Prime 1 Property Management"],
    email: "admin2@prime1realty.net",
    image: "/images/team/gabrielle-ortiz.jpg" as string | null,
    cutout: null as string | null,
    /** Approved by Antony Oseitutu, 26 Nov 2026. Do not edit without his approval. */
    bio: [
      "Gabrielle provides dedicated operational and administrative support to Prime 1 Realty and Prime 1 Property Management, supporting residential brokerage, commercial real estate and community association management operations.",
      "Within Prime 1 Realty, her responsibilities include agent affiliation administration, onboarding, CRM records management, listing administration, brokerage systems support, transaction documentation, deadline tracking and administrative compliance support.",
      "Gabrielle provides transaction support to affiliated residential and commercial real estate professionals throughout the transaction process, from contract execution through closing, facilitating communication with transaction participants and maintaining organized records.",
      "Within Prime 1 Property Management, Gabrielle provides administrative support through association records management, routine Buildium administration, prospective association database maintenance, board meeting logistics, vendor documentation, insurance certificate tracking, maintenance records and association onboarding documentation.",
      "Working under the direction of Prime 1 leadership, Gabrielle contributes to the efficient operation of both business divisions, supporting affiliated real estate professionals and licensed community association management personnel.",
    ],
  },
} as const;

export type PersonKey = keyof typeof people;

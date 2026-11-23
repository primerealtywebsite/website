/**
 * Single source of truth for business facts, links and integrations.
 * Every page, schema block, sitemap entry and tracking call reads from here.
 */

export const site = {
  name: "Prime 1 Realty",
  legalName: "Antony Kenneth Stefan Oseitutu PLLC",
  pmName: "Prime 1 Property Management",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.prime1realty.net",
  tagline: "Tampa Bay residential & commercial real estate brokerage and property management",
  description:
    "Prime 1 Realty is a licensed Florida real estate brokerage in Tampa. Buy, sell, rent, lease or get your HOA, condo or rental property professionally managed by one accountable team.",
  phone: {
    display: "(813) 295-8215",
    href: "tel:+18132958215",
    /** Calls only: this number cannot receive text messages, so the site never offers sms: links. */
    e164: "+18132958215",
    /** The line is answered around the clock by Prime 1's receptionist (office hours are separate). */
    answered: "Calls answered 24/7",
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
  hours: { label: "Mon–Fri, 9:00 AM–6:00 PM", days: "Mo-Fr", opens: "09:00", closes: "18:00" },
  serviceArea: ["Tampa", "Brandon", "Riverview", "Clearwater", "St. Petersburg", "Hillsborough County", "Pinellas County"],
  socials: {
    facebook: "https://www.facebook.com/prime1realtyfl/",
    instagram: "https://www.instagram.com/prime1_realty/",
    linkedin: "https://www.linkedin.com/company/prime1-realty",
    youtube: "https://www.youtube.com/@Prime1RealtyNet",
    x: "https://x.com/Prime1RealtyNet",
    zillow: "https://www.zillow.com/profile/Prime1Realty",
  },
  portals: {
    owner: "https://prime1pm.managebuilding.com/manager/public/authentication/login",
    resident: "https://prime1pm.managebuilding.com/Resident/portal/login",
    rentalApplication: "https://prime1pm.managebuilding.com/Resident/rental-application/new",
    agent: "https://app.prime1realty.net/",
    /** Agent recruiting: on-site application + booking page (replaced the old join.prime1realty.net portal) */
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
   * Agent recruiting. Applications and recruiting inquiries go directly to Antony (`notify`), with the
   * admin inbox copied (`cc`) so support staff can log them in the CRM. Override with RECRUITING_EMAIL_TO/CC.
   */
  recruiting: {
    name: "Antony Oseitutu",
    email: "antony@prime1realty.net",
    notify: process.env.RECRUITING_EMAIL_TO || "antony@prime1realty.net",
    cc: "admin@prime1realty.net",
    /** 30-minute call with Antony for agents who want to talk before joining */
    calendly: process.env.NEXT_PUBLIC_RECRUITING_CALENDLY_URL || "https://calendly.com/prime1realty-proton/30min",
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
    titles: ["Owner | Broker of Record, Prime 1 Realty", "Designated CAM, Prime 1 Property Management", "REALTOR®"],
    email: "antony@prime1realty.net",
    image: "/images/team/antony-oseitutu-broker-tampa.jpg",
    cutout: "/images/team/antony-oseitutu-cutout.png",
    bio: [
      "Antony Oseitutu leads Prime 1 Realty as Broker of Record and serves as Designated Community Association Manager for Prime 1 Property Management. His work spans residential and commercial brokerage, rental property management and community association management.",
      "Born in Bern, Switzerland, Antony is a Swiss citizen and a naturalized United States citizen. He built Prime 1 so owners, buyers, sellers and boards across Tampa Bay could work with one accountable firm instead of juggling separate agents and managers.",
      "Outside real estate, Antony is a licensed race car driver in the United States and overseas.",
    ],
  },
  jennifer: {
    slug: "jennifer-rivera",
    name: "Jennifer Rivera",
    role: "Licensed Community Association Manager",
    titles: ["Licensed Community Association Manager, Prime 1 Property Management"],
    email: "jennifer@prime1realty.net",
    image: null as string | null,
    cutout: null as string | null,
    bio: [
      "Jennifer Rivera is a licensed Community Association Manager with Prime 1 Property Management. She supports association boards and owners with day-to-day administration, vendor coordination, compliance and communication.",
    ],
  },
} as const;

export type PersonKey = keyof typeof people;

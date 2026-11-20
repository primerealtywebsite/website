import { idx, site } from "./site";
import type { StandardEvent } from "@/lib/meta";

export type NavLink = { label: string; href: string; desc?: string; event?: StandardEvent; custom?: string; params?: Record<string, string> };
export type NavGroup = { label: string; href: string; items: NavLink[] };

export const NAV: NavGroup[] = [
  {
    label: "Buy",
    href: "/residential",
    items: [
      { label: "Buy a home", href: "/residential", desc: "Buyer representation across Tampa Bay" },
      { label: "Search homes for sale", href: idx.search, desc: "Live MLS listings", custom: "HomeSearchClick", params: { search_type: "buy" } },
      { label: "Mortgage calculator", href: "/financing", desc: "Estimate your monthly payment" },
    ],
  },
  {
    label: "Sell",
    href: "/sell-your-home",
    items: [
      { label: "What's my home worth?", href: "/home-valuation", desc: "Free broker value range" },
      { label: "Sell your home", href: "/sell-your-home", desc: "Pricing, marketing & negotiation" },
    ],
  },
  {
    label: "Rent",
    href: "/rent",
    items: [
      { label: "Find a rental", href: "/rent", desc: "Homes and condos for rent" },
      { label: "Resident services", href: "/resident_services", desc: "Pay rent, maintenance, FAQs" },
      { label: "Rental application", href: site.portals.rentalApplication, desc: "Apply online", custom: "RentalApplicationClick", params: { type: "rental_application" } },
    ],
  },
  {
    label: "Management",
    href: "/property_management",
    items: [
      { label: "HOA & condo association management", href: "/property_management", desc: "Licensed CAM firm" },
      { label: "Rental property management", href: "/property_management#rental-management", desc: "Leasing, rent, maintenance" },
      { label: "Commercial property management", href: "/commercial_property_management", desc: "Operations & reporting" },
      { label: "Owner's representation", href: "/owners-representation", desc: "Protect your project" },
    ],
  },
  {
    label: "Commercial",
    href: "/commercial",
    items: [
      { label: "Commercial real estate", href: "/commercial", desc: "All commercial services" },
      { label: "Commercial properties", href: "/commercial_properties", desc: "Sale, lease & investment" },
      { label: "Sales & acquisitions", href: "/sales_acquisitions", desc: "Buy or sell investment property" },
      { label: "Leasing & tenant rep", href: "/tenant_buyer_representation", desc: "Find space for your business" },
    ],
  },
  {
    label: "About",
    href: "/about-us",
    items: [
      { label: "About Prime 1", href: "/about-us" },
      { label: "Our team", href: "/team" },
      { label: "Careers for agents", href: "/careers" },
      { label: "Join Prime 1 (agents)", href: "/join", desc: "Apply online or book a call" },
      { label: "Real estate insights", href: "/blog" },
      { label: "Contact", href: "/lets-connect" },
    ],
  },
];

export const PORTALS: NavLink[] = [
  { label: "Owner portal", href: site.portals.owner, desc: "Statements, reports & documents" },
  { label: "Resident & association portal", href: site.portals.resident, desc: "Payments, requests & documents" },
  { label: "Agent login", href: site.portals.agent },
];

/** Per-route primary action for the mobile bar and header CTA. Longest prefix wins. */
export const PAGE_CTA: { prefix: string; label: string; href: string; leadType: string }[] = [
  { prefix: "/sell-your-home", label: "Get my free analysis", href: "#start", leadType: "sell" },
  { prefix: "/home-valuation", label: "Get my home value", href: "#start", leadType: "valuation" },
  { prefix: "/residential", label: "Start my search", href: "#start", leadType: "buy" },
  { prefix: "/financing", label: "Start my search", href: "/residential#start", leadType: "buy" },
  { prefix: "/rent", label: "Find my rental", href: "#start", leadType: "rent" },
  { prefix: "/resident_services", label: "Resident login", href: site.portals.resident, leadType: "rent" },
  { prefix: "/property_management", label: "Get a proposal", href: "#start", leadType: "management" },
  { prefix: "/commercial_property_management", label: "Get a proposal", href: "#start", leadType: "management" },
  { prefix: "/owners-representation", label: "Discuss my project", href: "#start", leadType: "commercial" },
  { prefix: "/commercial", label: "Talk to a broker", href: "#start", leadType: "commercial" },
  { prefix: "/sales_acquisitions", label: "Talk to a broker", href: "#start", leadType: "commercial" },
  { prefix: "/tenant_buyer_representation", label: "Find my space", href: "#start", leadType: "commercial" },
  { prefix: "/careers", label: "Apply in 2 minutes", href: "#apply", leadType: "careers" },
  { prefix: "/join", label: "Apply in 2 minutes", href: "#apply", leadType: "careers" },
  { prefix: "/get-started", label: site.bookingConfigured ? "Book a call" : "Get started", href: site.bookingConfigured ? site.bookingUrl : "#start", leadType: "contact" },
  { prefix: "/thank-you", label: site.bookingConfigured ? "Book a call" : "Call us now", href: site.bookingConfigured ? site.bookingUrl : site.phone.href, leadType: "contact" },
  { prefix: "/", label: "Get started", href: "/get-started", leadType: "contact" },
];

export function ctaFor(pathname: string) {
  return PAGE_CTA.filter((c) => (c.prefix === "/" ? true : pathname.startsWith(c.prefix))).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0];
}

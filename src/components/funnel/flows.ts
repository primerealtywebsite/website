import type { LeadType } from "@/lib/meta";

export type IconName = "sell" | "buy" | "rent" | "management" | "commercial" | "careers" | "valuation";

export type Option = { label: string; hint?: string; icon?: IconName; value?: string; next?: FlowId };

export type Step =
  | { id: string; kind: "choice"; question: string; help?: string; options: Option[] }
  | { id: string; kind: "text"; question: string; help?: string; placeholder: string; inputMode?: "text" | "numeric"; autoComplete?: string; optional?: boolean };

export type FlowId = LeadType | "start";

export type Flow = {
  id: FlowId;
  leadType: LeadType;
  /** Title shown on the contact step */
  contactTitle: string;
  contactNote: string;
  submitLabel: string;
  steps: Step[];
};

const timeline: Option[] = [
  { label: "As soon as possible" },
  { label: "1–3 months" },
  { label: "3–6 months" },
  { label: "Just exploring" },
];

export const START: Step = {
  id: "goal",
  kind: "choice",
  question: "What can we help you with?",
  help: "Pick one. Takes about 60 seconds.",
  options: [
    { label: "Sell my home", hint: "Free property analysis", icon: "sell", next: "sell" },
    { label: "Buy a home", hint: "Tampa Bay home search", icon: "buy", next: "buy" },
    { label: "Rent a home", hint: "Rentals & applications", icon: "rent", next: "rent" },
    { label: "Manage my property or HOA", hint: "Rental, condo & HOA management", icon: "management", next: "management" },
    { label: "Commercial real estate", hint: "Buy, sell or lease space", icon: "commercial", next: "commercial" },
    { label: "Join as an agent", hint: "85/15 split, $15K cap", icon: "careers", next: "careers" },
  ],
};

export const FLOWS: Record<LeadType, Flow> = {
  sell: {
    id: "sell",
    leadType: "sell",
    contactTitle: "Where should we send your property analysis?",
    contactNote: "No obligation to list. A broker reviews it personally.",
    submitLabel: "Get my property analysis",
    steps: [
      { id: "address", kind: "text", question: "What's the property address?", help: "We use it to pull recent comparable sales nearby.", placeholder: "Street address, city", autoComplete: "street-address" },
      { id: "propertyType", kind: "choice", question: "What type of property is it?", options: [{ label: "Single-family home" }, { label: "Condo or townhome" }, { label: "Multifamily (2–4 units)" }, { label: "Land or other" }] },
      { id: "timeline", kind: "choice", question: "When would you like to sell?", options: timeline },
      { id: "situation", kind: "choice", question: "Which best describes you?", options: [{ label: "Moving within Tampa Bay" }, { label: "Relocating out of the area" }, { label: "Selling a rental or inherited home" }, { label: "Just want to know the value" }] },
    ],
  },
  valuation: {
    id: "valuation",
    leadType: "valuation",
    contactTitle: "Where should we send your home value report?",
    contactNote: "A broker-prepared value range, not an automated guess. No obligation.",
    submitLabel: "Send my home value",
    steps: [
      { id: "address", kind: "text", question: "What's your home's address?", help: "Your report compares it with recent nearby sales.", placeholder: "Street address, city", autoComplete: "street-address" },
      { id: "beds", kind: "choice", question: "How many bedrooms?", options: [{ label: "1–2" }, { label: "3" }, { label: "4" }, { label: "5+" }] },
      { id: "condition", kind: "choice", question: "How would you describe its condition?", options: [{ label: "Move-in ready / updated" }, { label: "Good, some dated areas" }, { label: "Needs work" }, { label: "Not sure" }] },
      { id: "timeline", kind: "choice", question: "Are you thinking about selling?", options: [{ label: "Yes, within 3 months" }, { label: "Yes, within a year" }, { label: "Maybe, depends on the number" }, { label: "No, just curious" }] },
    ],
  },
  buy: {
    id: "buy",
    leadType: "buy",
    contactTitle: "Who should we send matching homes to?",
    contactNote: "We'll send homes that fit and set up a quick call if you'd like.",
    submitLabel: "Start my home search",
    steps: [
      { id: "area", kind: "choice", question: "Where are you looking?", options: [{ label: "Tampa" }, { label: "Brandon / Riverview" }, { label: "Clearwater / St. Pete" }, { label: "Not sure yet" }] },
      { id: "price", kind: "choice", question: "What price range?", options: [{ label: "Under $350K" }, { label: "$350K–$600K" }, { label: "$600K–$1M" }, { label: "$1M+" }] },
      { id: "financing", kind: "choice", question: "How are you planning to pay?", options: [{ label: "Pre-approved already" }, { label: "Need a lender" }, { label: "Paying cash" }, { label: "Not sure yet" }] },
      { id: "timeline", kind: "choice", question: "When do you want to move?", options: timeline },
    ],
  },
  rent: {
    id: "rent",
    leadType: "rent",
    contactTitle: "How can we reach you about rentals?",
    contactNote: "We'll share available homes that match and how to apply.",
    submitLabel: "Find my rental",
    steps: [
      { id: "area", kind: "choice", question: "Where do you want to live?", options: [{ label: "Tampa" }, { label: "Brandon / Riverview" }, { label: "Clearwater / St. Pete" }, { label: "Flexible" }] },
      { id: "beds", kind: "choice", question: "How many bedrooms?", options: [{ label: "Studio / 1" }, { label: "2" }, { label: "3" }, { label: "4+" }] },
      { id: "budget", kind: "choice", question: "Monthly budget?", options: [{ label: "Under $1,800" }, { label: "$1,800–$2,500" }, { label: "$2,500–$3,500" }, { label: "$3,500+" }] },
      { id: "moveDate", kind: "choice", question: "When do you need to move in?", options: [{ label: "Within 30 days" }, { label: "1–2 months" }, { label: "2+ months" }, { label: "Just looking" }] },
    ],
  },
  management: {
    id: "management",
    leadType: "management",
    contactTitle: "Where should we send your management proposal?",
    contactNote: "A licensed manager reviews your property and replies within one business day.",
    submitLabel: "Request my proposal",
    steps: [
      { id: "propertyType", kind: "choice", question: "What do you need managed?", options: [{ label: "HOA / homeowners association" }, { label: "Condo association" }, { label: "Single-family rental(s)" }, { label: "Multifamily or commercial" }] },
      { id: "size", kind: "choice", question: "How many units, homes or doors?", help: "Associations with more than 10 units (or a budget over $100K) need a licensed CAM. We're licensed.", options: [{ label: "1 home" }, { label: "2–10" }, { label: "11–49" }, { label: "50–149" }, { label: "150+" }] },
      { id: "situation", kind: "choice", question: "What's your current situation?", options: [{ label: "Self-managing, need help" }, { label: "Unhappy with current manager" }, { label: "New property or new board" }, { label: "Comparing options" }] },
      { id: "location", kind: "text", question: "Where is the property?", help: "City or community name is enough.", placeholder: "e.g. Riverview, or Sunset Bay HOA", optional: true },
    ],
  },
  commercial: {
    id: "commercial",
    leadType: "commercial",
    contactTitle: "Who should our commercial broker contact?",
    contactNote: "Confidential. We'll follow up to understand your objectives.",
    submitLabel: "Talk to a commercial broker",
    steps: [
      { id: "goal", kind: "choice", question: "What are you looking to do?", options: [{ label: "Buy or invest" }, { label: "Sell a property" }, { label: "Lease space for my business" }, { label: "Owner's representation" }] },
      { id: "assetType", kind: "choice", question: "What type of property?", options: [{ label: "Office" }, { label: "Retail" }, { label: "Industrial / flex" }, { label: "Multifamily / mixed-use" }] },
      { id: "timeline", kind: "choice", question: "What's your timeline?", options: timeline },
    ],
  },
  careers: {
    id: "careers",
    leadType: "careers",
    contactTitle: "How can our broker reach you?",
    contactNote: "Confidential conversation with the Broker of Record.",
    submitLabel: "Talk about joining Prime 1",
    steps: [
      { id: "license", kind: "choice", question: "Are you a licensed Florida agent?", options: [{ label: "Yes, active license" }, { label: "Licensed, currently inactive" }, { label: "In pre-licensing" }] },
      { id: "focus", kind: "choice", question: "What's your focus?", options: [{ label: "Residential" }, { label: "Commercial" }, { label: "Property / association management" }] },
      { id: "volume", kind: "choice", question: "Transactions in the last 12 months?", options: [{ label: "0–5" }, { label: "6–15" }, { label: "16–30" }, { label: "30+" }] },
    ],
  },
  contact: {
    id: "contact",
    leadType: "contact",
    contactTitle: "How can we reach you?",
    contactNote: "We typically respond within one business day.",
    submitLabel: "Send message",
    steps: [
      { id: "topic", kind: "choice", question: "What is this about?", options: [{ label: "Selling" }, { label: "Buying or renting" }, { label: "Management" }, { label: "Something else" }] },
    ],
  },
};

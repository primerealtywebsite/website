/**
 * Prime 1 Property Management: service criteria, board deliverables, responsibilities and the
 * proposal-to-transition process. Shared by /property_management, the homepage, the proposal form and llms.
 *
 * OPEN ITEM (Antony): confirm the written criteria for qualifying rental portfolios. The wording
 * below is deliberately general until he supplies them.
 */
export const ASSOCIATION_TYPES = ["Homeowners association (HOA)", "Condominium association", "Commercial property owners' association", "Office park"] as const;

export const SERVICE_CRITERIA = [
  { t: "Homeowners associations", b: "Florida HOAs with 10 or more units." },
  { t: "Condominium associations", b: "Florida condominium associations with 10 or more units, including buildings with milestone inspection and reserve requirements." },
  { t: "Commercial property owners' associations & office parks", b: "Commercial owners' associations and office parks throughout Florida, scoped to the property and the services the association needs." },
  { t: "Qualifying rental portfolios", b: "Residential rental portfolios that meet Prime 1's service criteria for location, property condition and portfolio size. We review each portfolio before proposing." },
];

export const DELIVERABLES = [
  ["Inspections", "Scheduled common-area and site inspections with written findings, photos and follow-up on open items."],
  ["Board reporting", "A regular manager's report for every board meeting: open work orders, violations, vendor status, collections and upcoming deadlines."],
  ["Budget & financial reporting support", "Annual budget preparation support, monthly financial statements and delinquency reporting for board review."],
  ["Vendor oversight", "Bids, contracts, insurance certificates and performance follow-up for association vendors."],
  ["Buildium portal access", "Owners and residents pay, submit maintenance requests and get community documents online. Boards get reports and records in one place."],
  ["Compliance calendar", "Florida statutory deadlines: notices, meetings, records, milestone inspections and reserve study coordination."],
] as const;

export const BOARD_DECIDES = [
  "Policy, rules and enforcement decisions",
  "The annual budget, reserves and assessments",
  "Approval of contracts and spending above the agreed limit",
  "Hiring and replacing vendors",
  "Legal action and collections referrals",
];

export const MANAGER_HANDLES = [
  "Day-to-day administration under the management agreement",
  "Carrying out board decisions and reporting back",
  "Inspections, work orders and vendor coordination",
  "Collections, financial records and statements",
  "Owner and resident communication through the portal",
];

export const PROPOSAL_STEPS = [
  ["Request a proposal", "Tell us about the association, its location, unit count and primary concern. Attach your RFP if you have one."],
  ["Scope & site review", "We review the governing documents, budget and open issues, and the site coverage the property needs."],
  ["Written proposal", "Scope, responsibilities, reporting, site coverage and fees, presented to the board."],
  ["Transition, if selected", "We coordinate the transfer of records, open work orders, vendor information and resident portal access from your current manager."],
] as const;

export const RESIDENT_LINKS = [
  { label: "Resident & owner portal login", key: "resident" as const, desc: "Your Buildium account" },
  { label: "Pay dues or rent online", key: "resident" as const, desc: "In the portal: Payments" },
  { label: "Submit a maintenance request", key: "resident" as const, desc: "In the portal: Requests" },
  { label: "Community documents", key: "resident" as const, desc: "In the portal: Documents" },
];

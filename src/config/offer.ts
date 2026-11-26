/**
 * Prime 1 agent offer: the single source for /join, the calculator, the FAQ, the AI version (llms)
 * and every recruiting email. Terms as approved by Antony Oseitutu (email of 23 Nov 2026).
 * The executed Independent Contractor Agreement and written program terms govern.
 *
 * OPEN ITEM: the seller-closing bonus window. The live site and this file say 120 days; an earlier
 * approved template said 150 days. Antony is resolving it from the governing written terms. Change
 * `sellerBonusDays` here once confirmed and every page and email updates together.
 */
export const OFFER = {
  residential: { agentShare: 0.85, cap: 15_000 },
  commercial: { agentShare: 0.85, threshold: 250_000, agentShareAbove: 0.9 },
  companyGenerated: { agentShare: 0.7 },
  fees: { onboarding: 149, techMonthly: 59, transactionCoordination: 355 },
  producerAdvantage: { bonus: 5_000, closings: 5, days: 120, sellerBonus: 1_000, sellerBonusDays: 120 },
  activationDays: 14,
} as const;

/** Approved review standards (applied as flags for the broker; nothing is auto-declined). */
export const STANDARDS = {
  residentialMinClosings: 6,
  residentialLabel: "6 or more closed residential transactions in the last 12 months",
  commercialLabel: "established commercial sales AND leasing experience",
} as const;

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (x: number) => `${Math.round(x * 100)}`;

export const SPLIT_LABEL = {
  residential: `${pct(OFFER.residential.agentShare)}/${pct(1 - OFFER.residential.agentShare)}`,
  commercial: `${pct(OFFER.commercial.agentShare)}/${pct(1 - OFFER.commercial.agentShare)}`,
  commercialAbove: `${pct(OFFER.commercial.agentShareAbove)}/${pct(1 - OFFER.commercial.agentShareAbove)}`,
  company: `${pct(OFFER.companyGenerated.agentShare)}/${pct(1 - OFFER.companyGenerated.agentShare)}`,
};

/** Fees and whether they continue after the residential cap. */
export const FEE_TABLE = [
  { fee: "Onboarding", amount: `${usd(OFFER.fees.onboarding)} one time`, when: "Paid after broker approval and signing, before license transfer", afterCap: "Not applicable (one time)" },
  { fee: "Technology & platform", amount: `${usd(OFFER.fees.techMonthly)} per month`, when: "Monthly", afterCap: "Continues after the cap" },
  { fee: "Transaction coordination (mandatory)", amount: `${usd(OFFER.fees.transactionCoordination)} per covered file, per side`, when: "At settlement", afterCap: "Continues after the cap" },
  { fee: "Desk fee", amount: "None", when: "", afterCap: "" },
  { fee: "Franchise fee", amount: "None", when: "", afterCap: "" },
] as const;

export type Scenario = { label: string; gci: number; files: number; split: number; fees: number; keep: number; keepPct: number; note: string };

/** Year-one take-home at realistic production levels (self-generated business, before incentives). */
export function residentialScenario(gci: number, files: number, label = ""): Scenario {
  const split = Math.min(gci * (1 - OFFER.residential.agentShare), OFFER.residential.cap);
  const fees = OFFER.fees.onboarding + OFFER.fees.techMonthly * 12 + OFFER.fees.transactionCoordination * files;
  const keep = gci - split - fees;
  return { label, gci, files, split, fees, keep, keepPct: keep / gci, note: split >= OFFER.residential.cap ? "Capped: 100% on qualifying commission after the cap" : "Below the cap" };
}

export function commercialScenario(gci: number, files: number, label = ""): Scenario {
  const { agentShare, threshold, agentShareAbove } = OFFER.commercial;
  const split = Math.min(gci, threshold) * (1 - agentShare) + Math.max(0, gci - threshold) * (1 - agentShareAbove);
  const fees = OFFER.fees.onboarding + OFFER.fees.techMonthly * 12 + OFFER.fees.transactionCoordination * files;
  const keep = gci - split - fees;
  return { label, gci, files, split, fees, keep, keepPct: keep / gci, note: gci > threshold ? `${SPLIT_LABEL.commercialAbove} above ${usd(threshold)} GCI` : `${SPLIT_LABEL.commercial} up to ${usd(threshold)} GCI` };
}

export const RESIDENTIAL_SCENARIOS = [
  residentialScenario(60_000, 6, "6 closings · $60K GCI"),
  residentialScenario(100_000, 10, "10 closings · $100K GCI"),
  residentialScenario(150_000, 15, "15 closings · $150K GCI"),
  residentialScenario(250_000, 25, "25 closings · $250K GCI"),
];

export const COMMERCIAL_SCENARIOS = [
  commercialScenario(150_000, 6, "6 files · $150K GCI"),
  commercialScenario(250_000, 10, "10 files · $250K GCI"),
  commercialScenario(400_000, 14, "14 files · $400K GCI"),
];

export const SCENARIO_NOTE = `Assumes all files are qualifying self-generated business, one side per file, a ${usd(OFFER.fees.transactionCoordination)} coordination fee on every file, 12 months of the technology fee and the one-time onboarding fee. Incentives are shown separately and are not included. Estimates only; the executed Independent Contractor Agreement and compensation schedule govern.`;

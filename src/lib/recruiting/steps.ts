import "server-only";
import { createHash } from "node:crypto";
import { PACKET_DOCS, readDocFile } from "@/lib/onboarding-docs";
import { agentToken, brokerToken, type AgentToken } from "./token";
import { logRecord, mailAffiliated, mailAffiliatedOffice, mailPaid, mailPaidBroker, send } from "./workflow";

/** Documents the agent e-signs (the agreement is already executed by the broker). */
export const SIGN_DOCS = PACKET_DOCS.filter((d) => d.sign);

export const HANDBOOK_ACKS = [
  "Independent Contractor Status",
  "Professional Standards & Code of Conduct",
  "Confidentiality, Non-Disclosure & Non-Solicitation",
  "Ownership of Leads, Listings & Intellectual Property",
  "Tools, Systems & Technology Usage",
  "Training, Education & Brand Standards",
  "Financial Responsibilities & Fee Obligations",
];

export async function signHashes() {
  return Promise.all(SIGN_DOCS.map(async (d) => ({ title: d.title, sha256: createHash("sha256").update(await readDocFile(`${d.slug}.pdf`)).digest("hex") })));
}

/** Payment mode: Stripe when STRIPE_SECRET_KEY is set; sandbox (simulated, no charge) outside production or when PAYMENT_SANDBOX=1. */
export function paymentMode(): "stripe" | "sandbox" | "unavailable" {
  if (process.env.STRIPE_SECRET_KEY) return "stripe";
  if (process.env.VERCEL_ENV !== "production" || process.env.PAYMENT_SANDBOX === "1") return "sandbox";
  return "unavailable";
}

/** Shared by Stripe, sandbox and broker-confirmed payments: issue the "paid" link, email the agent and the broker. */
export async function completePayment(tok: AgentToken, origin: string, ref: string, mode: "stripe" | "sandbox" | "invoice") {
  const pay = { at: new Date().toISOString(), ref, mode };
  const paidToken = agentToken(tok.a, "paid", { sig: tok.sig, pay });
  const onboardingUrl = `${origin}/join/onboarding?t=${encodeURIComponent(paidToken)}`;
  const paidRef: AgentToken = { ...tok, st: "paid", pay };
  const affiliateUrl = `${origin}/join/review?t=${encodeURIComponent(brokerToken(tok.a, [], { act: "affiliate", ref: paidRef }))}`;
  await Promise.all([
    send(mailPaid(tok.a, onboardingUrl, ref, mode), "[onboarding:paid]"),
    send(mailPaidBroker(tok.a, ref, mode, affiliateUrl), "[onboarding:paid-broker]"),
    logRecord({ id: tok.a.id, status: "Paid - license transfer in progress", name: `${tok.a.first} ${tok.a.last}`, email: tok.a.email, detail: { payment: `${mode}:${ref}`, paidAt: pay.at } }),
  ]);
  return { paidToken, onboardingUrl };
}

export async function completeAffiliation(ref: AgentToken, origin: string) {
  const affToken = agentToken(ref.a, "affiliated", { sig: ref.sig, pay: ref.pay, aff: { at: new Date().toISOString() } });
  const voUrl = `${origin}/api/virtual-office?t=${encodeURIComponent(affToken)}`;
  const [agentMailed] = await Promise.all([
    send(mailAffiliated(ref.a, voUrl), "[onboarding:affiliated]"),
    send(mailAffiliatedOffice(ref.a, voUrl), "[onboarding:affiliated-office]"),
    logRecord({ id: ref.a.id, status: "Affiliated - Virtual Office active", name: `${ref.a.first} ${ref.a.last}`, email: ref.a.email, detail: { affiliatedAt: new Date().toISOString() } }),
  ]);
  return { voUrl, agentMailed };
}

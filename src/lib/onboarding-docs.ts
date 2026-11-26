import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Agent documents. The PDFs live in /private/onboarding (NOT /public), so they are never crawlable.
 *
 * REVIEW documents are open to prospects BEFORE they apply. They contain nothing the broker has signed:
 * the agreement is an unsigned, watermarked review copy (DocuSign signature and initials removed).
 *
 * PACKET documents are released only with an approved (or later) applicant link. The packet includes
 * the Independent Contractor Agreement as already executed by the broker, so it must never reach a
 * pending or declined applicant.
 *
 * To update a document, replace the PDF with the same file name and redeploy.
 */
export const REVIEW_DOCS = [
  { slug: "review-independent-contractor-agreement", file: "review/independent-contractor-agreement-review.pdf", title: "Independent Contractor Agreement (review copy)" },
  { slug: "review-onboarding-checklist", file: "review/onboarding-checklist.pdf", title: "Agent Onboarding Checklist" },
] as const;

/**
 * The Agent Handbook is held from public review until its fee page matches the published offer
 * ($149 onboarding, $59/month). The current PDF lists a $200 onboarding fee, a $70 monthly fee and an
 * exit recovery fee. Set HANDBOOK_REVIEW_READY=1 after the corrected handbook replaces the PDF.
 */
export const handbookReviewReady = () => process.env.HANDBOOK_REVIEW_READY === "1";

export const PACKET_DOCS = [
  { slug: "independent-contractor-agreement", title: "Independent Contractor Agreement (broker-executed)", sign: true },
  { slug: "independent-contractor-handbook", title: "Independent Contractor Policies & Procedures Handbook", sign: true },
  { slug: "onboarding-checklist", title: "Agent Onboarding Checklist", sign: false },
  { slug: "brokerage-procedures-support", title: "Brokerage Procedures & Support", sign: false },
  { slug: "agent-training-resources", title: "Agent Training & Resources", sign: false },
  { slug: "transaction-submission-workflow", title: "Under-Contract Transaction Submission Workflow", sign: false },
  { slug: "title-closing-companies", title: "Title & Closing Companies", sign: false },
  { slug: "mortgage-financing", title: "Mortgage & Financing Partners", sign: false },
  { slug: "legal-resources", title: "Legal Resources", sign: false },
  { slug: "property-service-vendors", title: "Property & Service Vendors", sign: false },
] as const;

export type ReviewSlug = (typeof REVIEW_DOCS)[number]["slug"];
export type PacketSlug = (typeof PACKET_DOCS)[number]["slug"];

const DIR = path.join(process.cwd(), "private", "onboarding");

export const isReviewSlug = (s: string | null): s is ReviewSlug => !!s && REVIEW_DOCS.some((d) => d.slug === s);
export const isPacketSlug = (s: string | null): s is PacketSlug => !!s && PACKET_DOCS.some((d) => d.slug === s);

export function reviewDocs() {
  const docs: { slug: string; title: string; url: string }[] = REVIEW_DOCS.map((d) => ({ slug: d.slug, title: d.title, url: `/api/agent-docs?f=${d.slug}` }));
  if (handbookReviewReady()) docs.splice(1, 0, { slug: "review-handbook", title: "Agent Handbook", url: "/api/agent-docs?f=review-handbook" });
  return docs;
}

export function packetLinks(origin: string, token: string) {
  return PACKET_DOCS.map((d) => ({ slug: d.slug, title: d.title, url: `${origin}/api/agent-docs?f=${d.slug}&t=${encodeURIComponent(token)}` }));
}

export function fileFor(slug: string) {
  const r = REVIEW_DOCS.find((d) => d.slug === slug);
  if (r) return { file: r.file, name: `Prime 1 Realty - ${r.title}.pdf` };
  if (slug === "review-handbook") return { file: "independent-contractor-handbook.pdf", name: "Prime 1 Realty - Agent Handbook.pdf" };
  const p = PACKET_DOCS.find((d) => d.slug === slug);
  if (p) return { file: `${p.slug}.pdf`, name: `Prime 1 Realty - ${p.title.replace(/&/g, "and")}.pdf` };
  return null;
}

export async function readDocFile(file: string) {
  return readFile(path.join(DIR, file));
}

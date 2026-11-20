import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Agent onboarding packet. The PDFs live in /private/onboarding (NOT /public), so they are never
 * crawlable. Applicants get them two ways: attached to their welcome email, and through signed
 * download links (valid 60 days) on the confirmation screen and in the email.
 * To update a document, replace the PDF in /private/onboarding with the same file name and redeploy.
 */
export const ONBOARDING_DOCS = [
  { slug: "onboarding-checklist", title: "Agent Onboarding Checklist" },
  { slug: "independent-contractor-agreement", title: "Independent Contractor Agreement" },
  { slug: "independent-contractor-handbook", title: "Independent Contractor Policies & Procedures Handbook" },
  { slug: "brokerage-procedures-support", title: "Brokerage Procedures & Support" },
  { slug: "agent-training-resources", title: "Agent Training & Resources" },
  { slug: "transaction-submission-workflow", title: "Under-Contract Transaction Submission Workflow" },
  { slug: "title-closing-companies", title: "Title & Closing Companies" },
  { slug: "mortgage-financing", title: "Mortgage & Financing Partners" },
  { slug: "legal-resources", title: "Legal Resources" },
  { slug: "property-service-vendors", title: "Property & Service Vendors" },
] as const;

export type DocSlug = (typeof ONBOARDING_DOCS)[number]["slug"];

const DIR = path.join(process.cwd(), "private", "onboarding");
const TTL_DAYS = 60;

function secret() {
  return process.env.AGENT_DOCS_SECRET || process.env.LEAD_WEBHOOK_SECRET || "prime1-onboarding-packet-v1-7f3c9a2e5b14d6";
}

function sign(exp: number) {
  return createHmac("sha256", secret()).update(`agent-docs:${exp}`).digest("base64url").slice(0, 32);
}

export function docsToken(now = Date.now()) {
  const exp = Math.floor(now / 1000) + TTL_DAYS * 86400;
  return `${exp}.${sign(exp)}`;
}

export function verifyDocsToken(token: string | null) {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp * 1000 < Date.now()) return false;
  const expected = Buffer.from(sign(exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function docFileName(slug: DocSlug) {
  const d = ONBOARDING_DOCS.find((x) => x.slug === slug)!;
  return `Prime 1 Realty - ${d.title.replace(/&/g, "and")}.pdf`;
}

export function docLinks(origin: string, token = docsToken()) {
  return ONBOARDING_DOCS.map((d) => ({
    slug: d.slug,
    title: d.title,
    url: `${origin}/api/agent-docs?f=${d.slug}&t=${encodeURIComponent(token)}`,
  }));
}

export function isDocSlug(s: string | null): s is DocSlug {
  return !!s && ONBOARDING_DOCS.some((d) => d.slug === s);
}

export async function readDoc(slug: DocSlug) {
  return readFile(path.join(DIR, `${slug}.pdf`));
}

/** All docs as base64 attachments (Resend format). About 4.4 MB total. */
export async function docAttachments() {
  return Promise.all(
    ONBOARDING_DOCS.map(async (d) => ({ filename: docFileName(d.slug), content: (await readDoc(d.slug)).toString("base64") })),
  );
}

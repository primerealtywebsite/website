import "server-only";
import { site } from "@/config/site";
import { OFFER, STANDARDS, usd } from "@/config/offer";
import { sendEmail } from "@/lib/resend";
import type { AgentToken, Applicant, Stage } from "./token";

/**
 * Prime 1 agent affiliation workflow (recreates the former Capped process on prime1realty.net).
 *
 *  1. Review & submit      prospect reviews the offer, FAQ, agreement review copy and steps on /join, then applies
 *  2. Pending broker review every submission stays pending; Antony gets ONE complete record with flags
 *  3. Decision              Antony approves, declines or requests information from his review link
 *  4. Sign                  approved agents e-sign the broker-executed agreement and handbook acknowledgment
 *  5. Pay                   $149 onboarding fee (Stripe; sandbox outside production)
 *  6. License transfer      written transfer + MLS / listings / pendings / technology instructions
 *  7. Affiliated            Antony confirms the license shows Prime 1; the Virtual Office opens; Antony onboards
 *
 * Who is responsible at each status (shown on every record email and in the Applicants sheet):
 * decisions are Antony's; administrative follow-up (incomplete files, payment exceptions, records)
 * is Northern Lights (admin inbox). Recruiting calls, objections, compensation interpretation and
 * affiliation decisions are never assigned to Northern Lights.
 */

export const BROKER = { name: site.recruiting.name, email: site.recruiting.notify };
export const OFFICE_NAME = "Northern Lights Operations (Prime 1 admin)";

export function officeInbox() {
  return [...new Set([site.recruiting.cc, ...(process.env.RECRUITING_EMAIL_CC || process.env.LEAD_EMAIL_CC || "").split(",").map((x) => x.trim())].filter(Boolean))].filter((e) => e !== BROKER.email);
}

export const FROM = () => process.env.RECRUITING_EMAIL_FROM || "Prime 1 Realty <recruiting@updates.prime1realty.net>";
/** Applicant replies go to the admin inbox (records), never an invitation to email the broker about joining. */
export const REPLY_TO = site.email;

export type Status =
  | "Incomplete"
  | "Pending broker review"
  | "More information requested"
  | "Approved - awaiting signature"
  | "Declined"
  | "Signed - awaiting payment"
  | "Payment failed"
  | "Paid - license transfer in progress"
  | "Affiliated - Virtual Office active";

export const NEXT: Record<Status, { action: string; owner: string }> = {
  Incomplete: { action: "Applicant to finish the application; flag the incomplete file after 24 hours", owner: OFFICE_NAME },
  "Pending broker review": { action: "Verify license on DBPR and decide: approve, decline or request information", owner: BROKER.name },
  "More information requested": { action: "Applicant to respond in writing", owner: "Applicant" },
  "Approved - awaiting signature": { action: "Applicant to e-sign the agreement and handbook acknowledgment", owner: "Applicant" },
  Declined: { action: "None (file closed)", owner: "-" },
  "Signed - awaiting payment": { action: `Applicant to pay the ${usd(OFFER.fees.onboarding)} onboarding fee; onboarding paperwork support begins`, owner: `Applicant / ${OFFICE_NAME}` },
  "Payment failed": { action: "Follow up so the applicant can retry payment", owner: OFFICE_NAME },
  "Paid - license transfer in progress": { action: "Process the DBPR license transfer, then confirm affiliation from the record email", owner: BROKER.name },
  "Affiliated - Virtual Office active": { action: "Personal onboarding by the broker; ADP, email and tools setup", owner: `${BROKER.name} / ${OFFICE_NAME}` },
};

export type Application = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseStatus: string;
  licenseType: string;
  licenseNumber: string;
  currentBrokerage: string;
  yearsLicensed: string;
  focus: string;
  closings: string;
  volume: string;
  commercialExperience: string;
  commercialDeals: string;
  activeListings: string;
  pendingTransactions: string;
  affiliationDate: string;
  markets: string;
  association: string;
  mls: string[];
  discipline: string;
  disciplineDetail: string;
  heardFrom: string;
  referredBy: string;
  speakRequest: string;
  message: string;
  reviewedMaterials: boolean;
};

export const trackOf = (focus: string): Applicant["track"] => (/both|\+/i.test(focus) ? "both" : /commercial/i.test(focus) ? "commercial" : "residential");

const LICENSE_RE = /^(SL|BK|BL)\d{6,7}$/;

/** Flags for the broker. Nothing is auto-declined: every submission stays pending until Antony decides. */
export function evaluate(a: Application) {
  const flags: string[] = [];
  const track = trackOf(a.focus);
  if (!LICENSE_RE.test(a.licenseNumber)) flags.push(`License number "${a.licenseNumber}" is not a valid Florida format (SL/BK/BL + 6-7 digits): cannot be verified as entered`);
  if (!/^active/i.test(a.licenseStatus)) flags.push("Applicant reports an INACTIVE license: cannot affiliate until the license is active");
  const typeLetter = a.licenseType.match(/\((SL|BL|BK)\)/)?.[1];
  if (typeLetter && LICENSE_RE.test(a.licenseNumber)) {
    const prefix = a.licenseNumber.slice(0, 2);
    const ok = typeLetter === prefix || (typeLetter === "BL" && prefix === "BK");
    if (!ok) flags.push(`Discrepancy: license type ${typeLetter} does not match number prefix ${prefix}`);
  }
  if (track !== "commercial") {
    const n = parseInt(a.closings, 10);
    if (!(n >= STANDARDS.residentialMinClosings)) flags.push(`Below residential standard: reports ${a.closings || "no"} closings in 12 months (standard: ${STANDARDS.residentialLabel})`);
  }
  if (track !== "residential" && !/sales and leasing/i.test(a.commercialExperience)) {
    flags.push(`Commercial: reports "${a.commercialExperience || "no"}" experience (standard: ${STANDARDS.commercialLabel})`);
  }
  if (/^yes/i.test(a.discipline)) flags.push("Applicant disclosed a complaint, restriction or discipline: review the DBPR record and decide whether a written explanation is needed");
  if (!a.currentBrokerage) flags.push("Current brokerage not provided");
  return { flags, track, summary: flags.length ? `Flagged for review (${flags.length})` : "Meets the published standard (pending broker review)" };
}

export const dbprLink = () => "https://www.myfloridalicense.com/wl11.asp";

// ---------- record log (Google Sheet "Applicants" tab, one row per applicant ID) ----------

export async function logRecord(r: { id: string; status: Status; name?: string; email?: string; detail?: Record<string, unknown> }) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return false;
  const next = NEXT[r.status];
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ kind: "applicant_status", secret: process.env.LEAD_WEBHOOK_SECRET ?? "", sendEmails: false, at: new Date().toISOString(), id: r.id, status: r.status, nextAction: next.action, owner: next.owner, name: r.name, email: r.email, ...r.detail }),
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const j = await res.json().catch(() => null);
    return Boolean(res.ok && j?.ok);
  } catch (e) {
    console.error("[recruiting] sheet log failed", e);
    return false;
  }
}

// ---------- email building blocks ----------

export const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const btn = (href: string, label: string, tone = "#d90a0a") =>
  `<a href="${esc(href)}" style="display:inline-block;background:${tone};color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;margin:4px 8px 4px 0">${esc(label)}</a>`;
const list = (items: string[], ordered = false) =>
  `<${ordered ? "ol" : "ul"} style="padding-left:20px;margin:0 0 12px">${items.map((t) => `<li style="margin:0 0 6px">${t}</li>`).join("")}</${ordered ? "ol" : "ul"}>`;
const table = (rows: [string, string][]) =>
  `<table style="border-collapse:collapse;margin:8px 0 14px">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:5px 14px 5px 0;color:#555;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`)
    .join("")}</table>`;
const statusBar = (id: string, status: Status) => {
  const n = NEXT[status];
  return `<p style="margin:0 0 16px;padding:10px 12px;background:#f4f4f2;border-radius:8px;font-size:13px"><b>Record ${esc(id)}</b> · Status: <b>${esc(status)}</b><br>Next action: ${esc(n.action)} · Responsible: <b>${esc(n.owner)}</b></p>`;
};
const signoff = `<p style="margin-top:24px">Prime 1 Realty<br>${esc(site.address.street)}, ${esc(site.address.city)}, ${site.address.region} ${site.address.postal}<br>${site.phone.display} · Office hours ${esc(site.hours.label)}</p>`;
const wrap = (inner: string) => `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:640px">${inner}</div>`;
export const toText = (html: string) =>
  html
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/(p|h\d|li|tr|div)>/g, "\n")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, "$2: $1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();

type Mail = { from?: string; to: string[]; cc?: string[]; reply_to?: string; subject: string; html: string; office?: boolean };
export async function send(m: Mail, tag: string) {
  return sendEmail({ from: m.from ?? FROM(), to: m.to, cc: m.cc?.length ? m.cc : undefined, reply_to: m.reply_to, subject: m.subject, html: m.html, text: toText(m.html) }, { officeNotice: m.office, tag });
}

const AFFILIATION_STEPS = [
  "Pending broker review: the broker verifies your license on DBPR and reviews your file.",
  "Decision: approval, a request for more information, or a decline, in writing.",
  "After approval: e-sign the Independent Contractor Agreement and Handbook acknowledgment.",
  `Pay the ${usd(OFFER.fees.onboarding)} onboarding fee (only after approval and signing).`,
  "License transfer to Prime 1, with written MLS, listing, pending-transaction and technology instructions.",
  "Virtual Office access and personal onboarding with the broker.",
];

// ---------- applicant emails ----------

/** Same email for qualifying and flagged applicants: every file is pending until the broker decides. */
export function mailReceived(a: Applicant, opts: { statusUrl: string; reviewDocs: { title: string; url: string }[]; speakRequest: string; updated: boolean; origin: string }) {
  return {
    to: [a.email],
    reply_to: REPLY_TO,
    subject: opts.updated ? `Prime 1 Realty: your application was updated (${a.id})` : `Prime 1 Realty: application received (${a.id})`,
    html: wrap(`<p>Hi ${esc(a.first)},</p>
<p>Thank you for applying to affiliate with <b>Prime 1 Realty</b>. ${opts.updated ? "We updated your existing application with the details you just submitted. No duplicate record was created." : "Your application has been received."}</p>
<p><b>Status: Pending broker review.</b> Every application stays pending until our Broker of Record makes a decision. You will hear from us in writing when a decision is made or if more information is needed.</p>
<h3 style="margin:22px 0 8px">How affiliation works</h3>${list(AFFILIATION_STEPS.map(esc), true)}
${opts.speakRequest ? `<p style="padding:10px 12px;background:#f4f4f2;border-radius:8px">Your written request to speak with the broker was attached to your application: <i>"${esc(opts.speakRequest)}"</i>. The broker may reply in writing, offer a call or meeting, or make a decision from your file.</p>` : ""}
<p>You can check your status, respond to a request for information, or submit a written request to speak with the broker here:</p>
<p>${btn(opts.statusUrl, "View my application status", "#111")}</p>
<h3 style="margin:22px 0 8px">Materials you reviewed</h3>
${list(opts.reviewDocs.map((d) => `<a href="${esc(opts.origin + d.url)}">${esc(d.title)}</a>`))}
<p style="font-size:13px;color:#555">These are review copies. The agreement for signature and the onboarding packet are issued only after approval. No payment is collected before approval.</p>
${signoff}`),
  };
}

export function mailInfoRequested(a: Applicant, note: string, statusUrl: string) {
  return {
    to: [a.email],
    reply_to: REPLY_TO,
    subject: `Prime 1 Realty: more information needed for your application (${a.id})`,
    html: wrap(`<p>Hi ${esc(a.first)},</p><p>Our Broker of Record reviewed your application and needs more information before making a decision:</p>
<blockquote style="margin:0 0 14px;padding:10px 14px;border-left:4px solid #d90a0a;background:#faf7f5">${esc(note).replace(/\n/g, "<br>")}</blockquote>
<p>Please respond in writing from your application page. Your response is attached to your file.</p><p>${btn(statusUrl, "Respond to this request", "#111")}</p>
<p style="font-size:13px;color:#555">Status: Pending broker review.</p>${signoff}`),
  };
}

export function mailApproved(a: Applicant, onboardingUrl: string, note: string) {
  return {
    to: [a.email],
    reply_to: REPLY_TO,
    subject: `Prime 1 Realty: application approved, next steps (${a.id})`,
    html: wrap(`<p>Hi ${esc(a.first)},</p><p>Your application to affiliate with <b>Prime 1 Realty</b> has been <b>approved</b> by ${esc(BROKER.name)}, Broker of Record.</p>
${note ? `<blockquote style="margin:0 0 14px;padding:10px 14px;border-left:4px solid #0a7a3d;background:#f3faf5">${esc(note).replace(/\n/g, "<br>")}</blockquote>` : ""}
<p>Your onboarding page guides you through each step in order:</p>${list(
      [
        "Review and e-sign the Independent Contractor Agreement and the Handbook acknowledgment.",
        `Pay the ${usd(OFFER.fees.onboarding)} one-time onboarding fee.`,
        "Start your license transfer to Prime 1 and follow the written MLS, listing, pending-transaction and technology instructions.",
        "Once the license shows Prime 1, your Virtual Office opens and the broker onboards you personally.",
      ].map(esc),
      true,
    )}<p>${btn(onboardingUrl, "Start onboarding")}</p>
<p style="font-size:13px;color:#555">This link is personal to you. Please do not change brokerages or move listings until your transfer instructions say so.</p>${signoff}`),
  };
}

export function mailDeclined(a: Applicant, note: string) {
  return {
    to: [a.email],
    reply_to: REPLY_TO,
    subject: `Prime 1 Realty: your application (${a.id})`,
    html: wrap(`<p>Hi ${esc(a.first)},</p><p>Thank you for your interest in affiliating with Prime 1 Realty and for the time you took to review our materials and apply.</p>
<p>After review, we are not able to offer affiliation at this time.${note ? "" : " This decision is final for this application."}</p>
${note ? `<blockquote style="margin:0 0 14px;padding:10px 14px;border-left:4px solid #999;background:#f6f6f6">${esc(note).replace(/\n/g, "<br>")}</blockquote>` : ""}
<p>No agreement was issued and no payment was collected. We wish you continued success.</p>${signoff}`),
  };
}

export function mailSigned(a: Applicant, sig: NonNullable<AgentToken["sig"]>, onboardingUrl: string, docs: { title: string; url: string }[], hashes: { title: string; sha256: string }[]) {
  return {
    to: [a.email],
    reply_to: REPLY_TO,
    subject: `Prime 1 Realty: signed documents and your next step (${a.id})`,
    html: wrap(`<p>Hi ${esc(a.first)},</p><p>Thank you. Your electronic signature was recorded:</p>
${table([
      ["Signed by", sig.name],
      ["Email", a.email],
      ["Signed at", new Date(sig.at).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "long", timeStyle: "short" }) + " ET"],
      ["IP address", sig.ip ?? ""],
      ["Record", a.id],
    ])}
<p style="font-size:13px;color:#555">Documents signed (SHA-256 of each file as presented):</p>${list(hashes.map((h) => `${esc(h.title)}<br><span style="font-family:monospace;font-size:11px;color:#555">${h.sha256}</span>`))}
<p><b>Next step:</b> pay the ${usd(OFFER.fees.onboarding)} onboarding fee from your onboarding page.</p><p>${btn(onboardingUrl, "Continue onboarding")}</p>
<h3 style="margin:22px 0 8px">Your documents</h3>${list(docs.map((d) => `<a href="${esc(d.url)}">${esc(d.title)}</a>`))}${signoff}`),
  };
}

export function mailPaid(a: Applicant, onboardingUrl: string, ref: string, mode: string) {
  return {
    to: [a.email],
    reply_to: REPLY_TO,
    subject: `Prime 1 Realty: onboarding fee received, start your license transfer (${a.id})`,
    html: wrap(`<p>Hi ${esc(a.first)},</p><p>We received your ${usd(OFFER.fees.onboarding)} onboarding fee${mode === "sandbox" ? " <b>(SANDBOX TEST, no real charge)</b>" : ""}. Reference: <b>${esc(ref)}</b>.</p>
<p><b>Next step: your license transfer.</b> Your onboarding page has the written instructions for the transfer, your MLS and association access, active listings, pending transactions and technology setup.</p>
<p>${btn(onboardingUrl, "Open transfer instructions")}</p>
<p>When the broker confirms your license shows Prime 1 Realty, your Virtual Office opens and the broker onboards you personally.</p>${signoff}`),
  };
}

export function mailPaymentFailed(a: Applicant, onboardingUrl: string, reason: string) {
  return {
    to: [a.email],
    reply_to: REPLY_TO,
    subject: `Prime 1 Realty: onboarding payment not completed (${a.id})`,
    html: wrap(`<p>Hi ${esc(a.first)},</p><p>Your ${usd(OFFER.fees.onboarding)} onboarding payment was not completed${reason ? ` (${esc(reason)})` : ""}. No charge was made. You can try again from your onboarding page; your signed documents and approval are kept.</p>
<p>${btn(onboardingUrl, "Retry payment")}</p>${signoff}`),
  };
}

export function mailAffiliated(a: Applicant, voUrl: string) {
  return {
    to: [a.email],
    reply_to: BROKER.email,
    subject: `Welcome to Prime 1 Realty: your Virtual Office is active`,
    html: wrap(`<p>Hi ${esc(a.first)},</p><p>Your license is now affiliated with <b>Prime 1 Realty</b>. Welcome.</p>
<p>Your <b>Virtual Office</b> is the one place for your executed documents, onboarding checklist, approved resources and instructions for the brokerage tools (Agent Portal, MoxiWorks, SkySlope, company email, ADP payment setup${a.track !== "residential" ? ", Buildout for commercial" : ""}).</p>
<p>${btn(voUrl, "Open my Virtual Office")}</p>
<p>${esc(BROKER.name)} will contact you to onboard you personally. As an affiliated agent you have direct access to the broker 24/7 for brokerage matters: ${esc(BROKER.email)} or ${site.phone.display}.</p>
<p style="font-size:13px;color:#555">Bookmark the Virtual Office. On a new device, use Agent Login on prime1realty.net.</p>${signoff}`),
  };
}

// ---------- office emails ----------

export function mailRecord(opts: { a: Applicant; app: Application; flags: string[]; summary: string; reviewUrl: string; updated: boolean; submittedLocal: string; source: [string, string][]; applicantEmailed: boolean }) {
  const { a, app } = opts;
  const rows: [string, string][] = [
    ["Name", `${a.first} ${a.last}`],
    ["Email", a.email],
    ["Phone", a.phone],
    ["License status (self-reported)", app.licenseStatus],
    ["License type", app.licenseType],
    ["License number", app.licenseNumber],
    ["Current brokerage", app.currentBrokerage],
    ["Years licensed", app.yearsLicensed],
    ["Focus", app.focus],
    ["Residential closings, last 12 months", app.closings],
    ["Residential volume, last 12 months", app.volume],
    ["Commercial experience", app.commercialExperience],
    ["Commercial transactions, last 24 months", app.commercialDeals],
    ["Active listings to transition", app.activeListings],
    ["Pending transactions to transition", app.pendingTransactions],
    ["Anticipated affiliation date", app.affiliationDate],
    ["Markets served", app.markets],
    ["REALTOR® association", app.association],
    ["MLS needs", app.mls.join(", ")],
    ["Complaints / restrictions / discipline", app.discipline + (app.disciplineDetail ? `: ${app.disciplineDetail}` : "")],
    ["Reviewed offer, FAQ, agreement and steps", app.reviewedMaterials ? "Yes (confirmed)" : "No"],
    ["Heard about Prime 1", app.heardFrom],
    ["Introduced / referred by", app.referredBy],
    ["Message", app.message],
    ...opts.source,
  ];
  return {
    to: [BROKER.email],
    cc: officeInbox(),
    reply_to: a.email,
    office: true,
    subject: `${opts.updated ? "UPDATED " : ""}Agent application ${a.id}: ${a.first} ${a.last} (${app.licenseNumber}) · ${opts.flags.length ? "FLAGGED" : "meets standard"} · PENDING`,
    html: wrap(`<h2 style="margin:0 0 6px">${opts.updated ? "Updated agent application (same record)" : "New agent application"}: pending your decision</h2>
${statusBar(a.id, "Pending broker review")}
<p style="margin:0 0 6px"><b>${esc(opts.summary)}</b></p>
${opts.flags.length ? list(opts.flags.map((f) => `<span style="color:#b30808">${esc(f)}</span>`)) : ""}
${app.speakRequest ? `<div style="margin:12px 0;padding:10px 14px;border-left:4px solid #d90a0a;background:#faf7f5"><b>Written request to speak with you (attached to the application):</b><br>${esc(app.speakRequest).replace(/\n/g, "<br>")}<br><span style="font-size:12px;color:#555">No appointment was offered or scheduled. You may reply in writing, offer a call or meeting, or decide from the file.</span></div>` : ""}
<h3 style="margin:18px 0 6px">Verify before deciding</h3>
${list([
      `License status, restrictions and discipline: <a href="${dbprLink()}">DBPR license search</a> (search ${esc(app.licenseNumber)} or the applicant's name). The review page requires you to record what DBPR shows before approving.`,
      "Production: compare the reported closings and volume with MLS history if needed.",
      "If a complaint appears, decide whether you need a written explanation (use Request more information).",
    ])}
<p>${btn(opts.reviewUrl, "Review & decide")}</p>
<h3 style="margin:18px 0 6px">Complete record</h3>${table(rows)}
<p style="color:#555;font-size:13px">The applicant ${opts.applicantEmailed ? "was emailed the standard pending-review confirmation (no booking link, no agreement, no signed documents, no payment request)" : "confirmation email did NOT go out; Northern Lights please follow up"}.<br>Submitted ${esc(opts.submittedLocal)}. Reply to this email to write to the applicant. The review link is personal to you; do not forward it.</p>`),
  };
}

export function mailApplicantMessage(a: Applicant, kind: "speak" | "info", text: string, reviewUrl: string) {
  return {
    to: [BROKER.email],
    cc: officeInbox(),
    reply_to: a.email,
    office: true,
    subject: `${kind === "speak" ? "Request to speak" : "Information provided"}: ${a.first} ${a.last} (${a.id})`,
    html: wrap(`<h2 style="margin:0 0 6px">${kind === "speak" ? "Written request to speak or meet" : "Applicant response to your information request"}</h2>${statusBar(a.id, "Pending broker review")}
<div style="margin:12px 0;padding:10px 14px;border-left:4px solid #d90a0a;background:#faf7f5">${esc(text).replace(/\n/g, "<br>")}</div>
<p style="font-size:13px;color:#555">Attached to application ${esc(a.id)}. ${kind === "speak" ? "Nothing was scheduled. You decide whether to reply in writing, offer a call or meeting, or decide from the file." : ""}</p>
<p>${btn(reviewUrl, "Review & decide")}</p>`),
  };
}

export function mailDecisionLog(a: Applicant, status: Status, detail: [string, string][]) {
  return {
    to: officeInbox().length ? officeInbox() : [BROKER.email],
    cc: officeInbox().length ? [BROKER.email] : undefined,
    office: true,
    subject: `Applicant ${a.id} ${a.first} ${a.last}: ${status}`,
    html: wrap(`<h2 style="margin:0 0 6px">Applicant record update</h2>${statusBar(a.id, status)}${table(detail)}`),
  };
}

export function mailSignedOffice(a: Applicant, sig: NonNullable<AgentToken["sig"]>, hashes: { title: string; sha256: string }[]) {
  return {
    to: officeInbox().length ? officeInbox() : [BROKER.email],
    cc: officeInbox().length ? [BROKER.email] : undefined,
    office: true,
    subject: `Signed: ${a.first} ${a.last} (${a.id}) accepted affiliation, onboarding paperwork support can begin`,
    html: wrap(`<h2 style="margin:0 0 6px">Approved agent signed and accepted</h2>${statusBar(a.id, "Signed - awaiting payment")}
<p>This is the notice to Northern Lights that an approved agent accepted. Onboarding paperwork support begins now (administrative only: records, approved written information, follow-up on administrative next steps).</p>
${table([
      ["Agent", `${a.first} ${a.last}`],
      ["Email", a.email],
      ["Phone", a.phone],
      ["License", `${a.licenseType} ${a.license}`],
      ["Track", a.track],
      ["Signed as", sig.name],
      ["Signed at", sig.at],
      ["IP", sig.ip ?? ""],
    ])}${list(hashes.map((h) => `${esc(h.title)}: <span style="font-family:monospace;font-size:11px">${h.sha256}</span>`))}`),
  };
}

export function mailPaidBroker(a: Applicant, ref: string, mode: string, affiliateUrl: string) {
  return {
    to: [BROKER.email],
    cc: officeInbox(),
    office: true,
    subject: `Paid: ${a.first} ${a.last} (${a.id}): license transfer can begin`,
    html: wrap(`<h2 style="margin:0 0 6px">Onboarding fee paid: license transfer can begin</h2>${statusBar(a.id, "Paid - license transfer in progress")}
${table([
      ["Agent", `${a.first} ${a.last}`],
      ["License", `${a.licenseType} ${a.license}`],
      ["Payment", `${usd(OFFER.fees.onboarding)} · ${mode === "sandbox" ? "SANDBOX TEST (no charge)" : mode} · ${ref}`],
    ])}
<p>The agent has the written transfer, MLS, listing, pending-transaction and technology instructions. When DBPR shows the license under Prime 1 Realty, confirm it here to open the agent's Virtual Office:</p>
<p>${btn(affiliateUrl, "Confirm license affiliated")}</p>
<p style="font-size:13px;color:#555">This confirmation link is personal to you; do not forward it.</p>`),
  };
}

export function mailException(a: Applicant, what: string, detail: [string, string][]) {
  return {
    to: officeInbox().length ? officeInbox() : [BROKER.email],
    cc: officeInbox().length ? [BROKER.email] : undefined,
    office: true,
    subject: `ACTION NEEDED (${OFFICE_NAME.split(" (")[0]}): ${what}: ${a.first} ${a.last} (${a.id})`,
    html: wrap(`<h2 style="margin:0 0 6px">Exception: ${esc(what)}</h2>${statusBar(a.id, what === "Payment failed" ? "Payment failed" : "Incomplete")}${table(detail)}`),
  };
}

export function mailAffiliatedOffice(a: Applicant, voUrl: string) {
  return {
    to: officeInbox().length ? officeInbox() : [BROKER.email],
    cc: officeInbox().length ? [BROKER.email] : undefined,
    office: true,
    subject: `Affiliated: ${a.first} ${a.last} (${a.id}): Virtual Office active`,
    html: wrap(`<h2 style="margin:0 0 6px">Agent affiliated</h2>${statusBar(a.id, "Affiliated - Virtual Office active")}
<p>Set up: company email, Agent Portal, MoxiWorks, SkySlope / DigiSign, ADP payment setup${a.track !== "residential" ? ", Buildout user (commercial)" : ""}, MLS / association per the agent's market. The broker onboards the agent personally.</p>
<p>If the agent loses their Virtual Office link, forward this one (it is personal to the agent): <a href="${esc(voUrl)}">${esc(voUrl.slice(0, 60))}…</a></p>`),
  };
}

export type { Stage };

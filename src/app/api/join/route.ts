import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { requestContext, sendCapiEvent } from "@/lib/meta-capi";
import { sendEmail } from "@/lib/resend";

/**
 * Agent application ("Join Prime 1"). Approval-first process (per Antony, Nov 2026):
 *  1. The application goes straight to Antony (site.recruiting.notify), with admin copied. Reply goes to the agent.
 *  2. The agent gets a short "application received" email. No agreement or onboarding packet is sent until
 *     Antony approves the agent; then the ICA, license affiliation and onboarding follow.
 *  3. The application is also copied to the CRM: Google Sheet, LEAD_WEBHOOK_URL and/or CRM_LEAD_EMAIL
 *     (e.g. the Buildout lead-intake address), whichever are configured.
 */

const Schema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(10).max(30),
  licenseStatus: z.enum(["Active Florida license", "Inactive Florida license", "In pre-licensing"]),
  licenseType: z.enum(["Sales Associate (SL)", "Broker Associate (BL)", "Broker (BK)", "Not licensed yet"]),
  licenseNumber: z.string().trim().max(20).optional().default("").transform((v) => v.toUpperCase().replace(/\s+/g, "")),
  currentBrokerage: z.string().trim().max(120).optional().default(""),
  yearsLicensed: z.string().trim().max(40).optional().default(""),
  transactions: z.string().trim().max(40).optional().default(""),
  volume: z.string().trim().max(60).optional().default(""),
  focus: z.string().trim().max(80).optional().default(""),
  commercialExperience: z.string().trim().max(120).optional().default(""),
  timing: z.string().trim().max(60).optional().default(""),
  market: z.string().trim().max(120).optional().default(""),
  association: z.string().trim().max(120).optional().default(""),
  nextStep: z.enum(["apply", "call", "join"]).transform((v) => (v === "join" ? "apply" : v)),
  heardFrom: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  consent: z.boolean().optional(),
  eventId: z.string().max(80),
  pageUrl: z.string().max(500).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
  company_website: z.string().max(0).optional(), // honeypot
});

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

const UTM_LABELS: Record<string, string> = {
  utm_source: "Ad source",
  utm_medium: "Ad medium",
  utm_campaign: "Ad campaign",
  utm_content: "Ad content",
  utm_term: "Ad keyword",
  gclid: "Google Ads click ID",
  gbraid: "Google Ads click ID (iOS)",
  wbraid: "Google Ads click ID (web-to-app)",
  fbclid: "Meta ad click ID",
  landing_page: "Landing page",
  referrer: "Referred from",
  device: "Device",
  ai_source: "Came from AI assistant",
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Rough fit check against the recruiting targets: 6+ closings (residential) or commercial sales + leasing. */
function fit(a: z.infer<typeof Schema>) {
  const commercial = /commercial/i.test(a.focus);
  const closings6 = /^(6|16|30)/.test(a.transactions);
  if (a.licenseStatus !== "Active Florida license") return "Review: license not active";
  if (commercial && /sales and leasing/i.test(a.commercialExperience)) return "Meets commercial target (sales + leasing)";
  if (closings6) return "Meets residential target (6+ closings)";
  return "Below target: fewer than 6 closings reported";
}

export async function POST(req: Request) {
  const ctx = requestContext(req);
  if (ctx.ip && limited(ctx.ip)) return NextResponse.json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, { status: 429 });

  let parsed;
  try {
    parsed = Schema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check your name, email and phone number." }, { status: 400 });
  }
  const a = parsed.data;
  if (a.company_website) return NextResponse.json({ ok: true, emailed: true });
  if (a.licenseStatus !== "In pre-licensing" && a.licenseNumber.replace(/\W/g, "").length < 5) {
    return NextResponse.json({ ok: false, error: "Please enter your Florida license number (e.g. SL3456789)." }, { status: 400 });
  }

  const name = `${a.firstName} ${a.lastName}`;
  const submittedAt = new Date().toISOString();
  const submittedLocal = new Date(submittedAt).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
  const telDigits = a.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  const wantsCall = a.nextStep === "call";
  const fitNote = fit(a);
  const fields: [string, string][] = [
    ["Name", name],
    ["Email", a.email],
    ["Phone", a.phone],
    ["Fit", fitNote],
    ["License status", a.licenseStatus],
    ["License type", a.licenseType],
    ["License number", a.licenseNumber.toUpperCase()],
    ["Current brokerage", a.currentBrokerage],
    ["Closings, last 12 months", a.transactions],
    ["Sales volume, last 12 months", a.volume],
    ["Years licensed", a.yearsLicensed],
    ["Focus", a.focus],
    ["Commercial experience", a.commercialExperience],
    ["Timing to affiliate", a.timing],
    ["Primary market", a.market],
    ["Association / MLS", a.association],
    ["Next step", wantsCall ? "Wants a call with Antony" : "Application only"],
    ["Heard about Prime 1", a.heardFrom],
    ["Message", a.message],
    ["Contact consent", a.consent ? "Yes" : "No"],
    ["Page", a.pageUrl ?? ""],
    ...Object.entries(a.utm ?? {}).map(([k, v]): [string, string] => [UTM_LABELS[k] ?? k, v]),
  ];
  const filled = fields.filter(([, v]) => v);
  const licenseLookup = "https://www.myfloridalicense.com/wl11.asp";

  // ---------- Application to Antony ----------
  const toAntony = {
    to: site.recruiting.notify,
    subject: `Agent application: ${name}${a.licenseNumber ? ` (${a.licenseNumber.toUpperCase()})` : ""} · ${a.transactions || "?"} closings${a.timing ? ` · ${a.timing}` : ""}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
<h2 style="margin:0 0 4px">New agent application</h2>
<p style="margin:0 0 16px;color:#555">${esc(fitNote)}. ${wantsCall ? "They asked for a call before deciding." : "Review and reply to approve or decline."} Nothing has been sent to the agent except an "application received" note.</p>
<table style="border-collapse:collapse">${filled.map(([k, v]) => `<tr><td style="padding:5px 14px 5px 0;color:#555;vertical-align:top">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`).join("")}</table>
<p style="margin:18px 0 0"><a href="tel:+1${telDigits}">Call ${esc(a.phone)}</a> · <a href="mailto:${esc(a.email)}">Email ${esc(a.firstName)}</a> · <a href="${licenseLookup}">Verify license (DBPR)</a></p>
<p style="color:#777;font-size:12px;margin-top:18px">Submitted ${submittedLocal} on prime1realty.net/join. Reply to this email to reach the agent directly.</p></div>`,
    text: `New agent application\n${fitNote}\n\n${filled.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nSubmitted ${submittedLocal}`,
  };

  // ---------- Confirmation to the agent ----------
  const toAgent = {
    to: a.email,
    subject: "We received your Prime 1 Realty application",
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:620px">
<p>Hi ${esc(a.firstName)},</p>
<p>Thank you for applying to <b>Prime 1 Realty</b>. ${esc(site.recruiting.name)}, our Broker of Record, reviews every application personally and will contact you, usually within one business day.</p>
<p><b>What happens next</b></p>
<ol style="padding-left:20px;margin:0 0 16px">
<li>Antony reviews your license and production history.</li>
<li>Once approved, you receive the Independent Contractor Agreement to review and sign.</li>
<li>We coordinate your license affiliation with Prime 1, then onboarding.</li>
</ol>
<p style="margin:22px 0"><a href="${site.recruiting.calendly}" style="background:#d90a0a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Book a 30-minute call with Antony</a></p>
<p>Questions? Reply to this email or call ${site.phone.display}.</p>
<p>Prime 1 Realty<br>${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}</p>
</div>`,
    text: `Hi ${a.firstName},\n\nThank you for applying to Prime 1 Realty. ${site.recruiting.name}, our Broker of Record, reviews every application personally and will contact you, usually within one business day.\n\nWhat happens next:\n1. Antony reviews your license and production history.\n2. Once approved, you receive the Independent Contractor Agreement to review and sign.\n3. We coordinate your license affiliation with Prime 1, then onboarding.\n\nBook a 30-minute call with Antony: ${site.recruiting.calendly}\n\nQuestions? Reply to this email or call ${site.phone.display}.`,
  };

  const record = {
    kind: "agent_application",
    submittedAt,
    name,
    fit: fitNote,
    ...Object.fromEntries(Object.entries(a).filter(([k]) => !["company_website", "consent", "utm"].includes(k))),
    consent: a.consent ? "Yes" : "No",
    utm: a.utm ?? {},
    ip: ctx.ip,
  };

  const deliveries: Promise<boolean>[] = [];
  const resend = process.env.RESEND_API_KEY;
  let agentEmailed: Promise<boolean> = Promise.resolve(false);

  if (resend) {
    const from = process.env.RECRUITING_EMAIL_FROM || process.env.LEAD_EMAIL_FROM || "Prime 1 Realty <recruiting@updates.prime1realty.net>";
    const cc = [...new Set([site.recruiting.cc, process.env.RECRUITING_EMAIL_CC].filter((v): v is string => Boolean(v) && v !== toAntony.to))];
    deliveries.push(
      sendEmail(
        { from, to: [toAntony.to], cc: cc.length ? cc : undefined, reply_to: a.email, subject: toAntony.subject, html: toAntony.html, text: toAntony.text },
        { officeNotice: true, tag: "[join]" },
      ),
    );
    agentEmailed = sendEmail({ from, to: [toAgent.to], reply_to: site.recruiting.email, subject: toAgent.subject, html: toAgent.html, text: toAgent.text }, { tag: "[join]" });
  }

  // CRM copy by email (e.g. Buildout / CRM lead-intake address)
  if (resend && process.env.CRM_LEAD_EMAIL) {
    const from = process.env.LEAD_EMAIL_FROM || "Prime 1 Website <leads@updates.prime1realty.net>";
    deliveries.push(
      sendEmail(
        { from, to: process.env.CRM_LEAD_EMAIL.split(",").map((s) => s.trim()), reply_to: a.email, subject: `[Recruiting] ${toAntony.subject}`, html: toAntony.html, text: toAntony.text },
        { tag: "[join:crm]" },
      ),
    );
  }

  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    deliveries.push(
      fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...record, secret: process.env.LEAD_WEBHOOK_SECRET ?? "", sendEmails: false }),
        redirect: "follow",
        signal: AbortSignal.timeout(25_000),
      })
        .then(async (r) => {
          const j = await r.json().catch(() => null);
          if (!r.ok || !j?.ok) console.error("[join] Google Sheets error", r.status, j?.error);
          return Boolean(r.ok && j?.ok);
        })
        .catch((e) => {
          console.error("[join] Google Sheets error", e);
          return false;
        }),
    );
  }

  if (process.env.LEAD_WEBHOOK_URL) {
    deliveries.push(
      fetch(process.env.LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record), signal: AbortSignal.timeout(20_000) })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }

  if (deliveries.length === 0) {
    console.error("[join] NO DESTINATION CONFIGURED (set RESEND_API_KEY). Application:", JSON.stringify(record));
  }

  const capi = sendCapiEvent({
    event: "SubmitApplication",
    eventId: a.eventId,
    url: a.pageUrl ?? `${site.url}/join`,
    user: { ...ctx, email: a.email, phone: a.phone, firstName: a.firstName, lastName: a.lastName },
    customData: { content_category: "agent_recruiting", next_step: a.nextStep },
  }).catch(() => null);

  const [delivered, emailed] = await Promise.all([Promise.all(deliveries), agentEmailed, capi]);
  if (delivered.length === 0 || !delivered.some(Boolean)) {
    console.error("[join] ALL DESTINATIONS FAILED. Application:", JSON.stringify(record));
    return NextResponse.json(
      { ok: false, error: `Sorry, we couldn't send that. Please email ${site.recruiting.email} or call ${site.phone.display}.` },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, emailed });
}

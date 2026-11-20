import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { requestContext, sendCapiEvent } from "@/lib/meta-capi";
import { docAttachments, docLinks, ONBOARDING_DOCS } from "@/lib/onboarding-docs";
import { sendEmail } from "@/lib/resend";

/**
 * Agent application ("Join Prime 1"). For every valid application:
 *  1. The office (admin@prime1realty.net, Antony copied) gets an email with every detail (reply goes straight to the agent).
 *  2. The agent gets a welcome email with the full onboarding packet attached + backup download links.
 *  3. The application is logged to the Google Sheet ("Agent Applications" tab) and any CRM webhook.
 * Email is sent by Resend when RESEND_API_KEY is set; otherwise by the Google Apps Script (MailApp),
 * so it works as soon as either one is configured. The confirmation screen also offers the packet
 * for instant download, so the agent always gets the documents.
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
  focus: z.string().trim().max(80).optional().default(""),
  market: z.string().trim().max(120).optional().default(""),
  association: z.string().trim().max(120).optional().default(""),
  nextStep: z.enum(["join", "call"]),
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
  const origin = new URL(req.url).origin;
  const links = docLinks(origin);
  if (a.company_website) return NextResponse.json({ ok: true, docs: links, emailed: true });
  if (a.licenseStatus !== "In pre-licensing" && a.licenseNumber.replace(/\W/g, "").length < 5) {
    return NextResponse.json({ ok: false, error: "Please enter your Florida license number (e.g. SL3456789)." }, { status: 400 });
  }

  const name = `${a.firstName} ${a.lastName}`;
  const submittedAt = new Date().toISOString();
  const submittedLocal = new Date(submittedAt).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
  const telDigits = a.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  const wantsCall = a.nextStep === "call";
  const fields: [string, string][] = [
    ["Name", name],
    ["Email", a.email],
    ["Phone", a.phone],
    ["License status", a.licenseStatus],
    ["License type", a.licenseType],
    ["License number", a.licenseNumber.toUpperCase()],
    ["Current brokerage", a.currentBrokerage],
    ["Years licensed", a.yearsLicensed],
    ["Closings, last 12 months", a.transactions],
    ["Focus", a.focus],
    ["Primary market", a.market],
    ["Association / MLS", a.association],
    ["Next step", wantsCall ? "Wants a call with Antony first" : "Ready to join (no interview)"],
    ["Heard about Prime 1", a.heardFrom],
    ["Message", a.message],
    ["Contact consent", a.consent ? "Yes" : "No"],
    ["Page", a.pageUrl ?? ""],
    ...Object.entries(a.utm ?? {}).map(([k, v]): [string, string] => [UTM_LABELS[k] ?? k, v]),
  ];
  const filled = fields.filter(([, v]) => v);
  const licenseLookup = "https://www.myfloridalicense.com/wl11.asp";

  const PACKET_NOTE = `The agent was emailed the onboarding packet (${ONBOARDING_DOCS.length} documents) and your booking link.`;
  const PACKET_FAILED = "The packet email to the agent did NOT go out (they downloaded it from the website instead). Please email them the packet.";

  // ---------- Email to Antony ----------
  const toAntony = {
    to: site.recruiting.notify,
    cc: site.recruiting.email,
    replyTo: a.email,
    subject: `New agent application: ${name}${a.licenseNumber ? ` (${a.licenseNumber.toUpperCase()})` : ""}${wantsCall ? " · wants a call" : " · ready to join"}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
<h2 style="margin:0 0 4px">New agent application</h2>
<p style="margin:0 0 16px;color:#555">${wantsCall ? "This agent would like a call before joining." : "This agent is ready to join and was sent the onboarding packet."}</p>
<table style="border-collapse:collapse">${filled.map(([k, v]) => `<tr><td style="padding:5px 14px 5px 0;color:#555;vertical-align:top">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`).join("")}</table>
<p style="margin:18px 0 0"><a href="tel:+1${telDigits}">Call ${esc(a.phone)}</a> · <a href="mailto:${esc(a.email)}">Email ${esc(a.firstName)}</a> · <a href="${licenseLookup}">Verify license (DBPR)</a></p>
<p style="color:#777;font-size:12px;margin-top:18px">Submitted ${submittedLocal}. ${PACKET_NOTE} Reply to this email to reach them directly.</p></div>`,
    text: `New agent application\n\n${filled.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nSubmitted ${submittedLocal}`,
  };

  // ---------- Welcome email to the agent ----------
  const steps = [
    "Review the Agent Onboarding Checklist and the Independent Contractor Agreement (attached).",
    "Reply with a copy of your current Florida real estate license so Antony can coordinate your license transfer.",
    "Confirm your REALTOR® association and MLS with the onboarding team (Tampa Bay: STAR and Stellar MLS), and whether you need Supra eKEY access.",
    "Activate your tech accounts when invited: Agent Portal, MoxiWorks & RISE, SkySlope & DigiSign, company email and ADP.",
    "Read and acknowledge the Policies & Procedures Handbook.",
  ];
  const toAgent = {
    to: a.email,
    replyTo: site.recruiting.email,
    subject: "Welcome to Prime 1 Realty: your onboarding packet",
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:620px">
<p>Hi ${esc(a.firstName)},</p>
<p>Thank you for your interest in joining <b>Prime 1 Realty</b>. Your onboarding packet is attached (${ONBOARDING_DOCS.length} PDFs). ${
      wantsCall
        ? "You asked to talk with Antony first. If you haven't picked a time on our website yet, book your 30-minute call below."
        : "Antony Oseitutu, our Broker of Record, personally handles onboarding and will be in touch shortly."
    }</p>
<p style="margin:22px 0"><a href="${site.recruiting.calendly}" style="background:#d90a0a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Book a 30-minute call with Antony</a></p>
<h3 style="margin:24px 0 8px">Your next steps</h3>
<ol style="padding-left:20px;margin:0">${steps.map((s) => `<li style="margin:0 0 6px">${esc(s)}</li>`).join("")}</ol>
<h3 style="margin:24px 0 8px">Your onboarding documents</h3>
<p style="margin:0 0 8px;color:#555;font-size:13px">Attached to this email. If your inbox removed the attachments, use these links (valid 60 days):</p>
<ul style="padding-left:20px;margin:0">${links.map((l) => `<li style="margin:0 0 4px"><a href="${l.url}">${esc(l.title)}</a></li>`).join("")}</ul>
<p style="margin-top:24px">Questions? Reply to this email or call the office at ${site.phone.display} (calls answered 24/7).</p>
<p>Welcome aboard,<br><b>Antony Oseitutu</b><br>Broker of Record, Prime 1 Realty<br><a href="mailto:${site.recruiting.email}">${site.recruiting.email}</a> · ${site.phone.display}<br>${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}</p>
</div>`,
    text: `Hi ${a.firstName},\n\nThank you for your interest in joining Prime 1 Realty. Your onboarding packet is attached.\n\nBook a 30-minute call with Antony: ${site.recruiting.calendly}\n\nNext steps:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nDocuments (links valid 60 days):\n${links.map((l) => `- ${l.title}: ${l.url}`).join("\n")}\n\nQuestions? Reply to this email or call ${site.phone.display}.\n\nAntony Oseitutu\nBroker of Record, Prime 1 Realty\n${site.recruiting.email}`,
  };

  const record = {
    kind: "agent_application",
    submittedAt,
    name,
    ...Object.fromEntries(Object.entries(a).filter(([k]) => !["company_website", "consent", "utm"].includes(k))),
    consent: a.consent ? "Yes" : "No",
    utm: a.utm ?? {},
    ip: ctx.ip,
  };

  const deliveries: Promise<boolean>[] = [];
  const resend = process.env.RESEND_API_KEY;
  let agentEmailed: Promise<boolean> = Promise.resolve(false);

  // 1) Resend: both emails, packet attached
  if (resend) {
    const from = process.env.RECRUITING_EMAIL_FROM || process.env.LEAD_EMAIL_FROM || "Prime 1 Realty <leads@prime1realty.net>";
    type Body = Omit<Parameters<typeof sendEmail>[0], "from">;
    const send = (body: Body, officeNotice = false) => sendEmail({ from, ...body }, { officeNotice, tag: "[join]" });
    const cc = [...new Set([toAntony.cc, process.env.RECRUITING_EMAIL_CC].filter((v): v is string => Boolean(v) && v !== toAntony.to))];
    agentEmailed = docAttachments()
      .then((attachments) => send({ to: [toAgent.to], reply_to: toAgent.replyTo, subject: toAgent.subject, html: toAgent.html, text: toAgent.text, attachments }))
      .catch((e) => {
        console.error("[join] attachment error", e);
        return send({ to: [toAgent.to], reply_to: toAgent.replyTo, subject: toAgent.subject, html: toAgent.html, text: toAgent.text });
      });
    // Antony's notice goes after the agent's email so it can say whether the packet actually went out.
    deliveries.push(
      agentEmailed.then((ok) =>
        send(
          {
            to: [toAntony.to],
            cc: cc.length ? cc : undefined,
            reply_to: toAntony.replyTo,
            subject: toAntony.subject,
            html: toAntony.html.replace(PACKET_NOTE, ok ? PACKET_NOTE : PACKET_FAILED),
            text: toAntony.text + (ok ? "" : `\n\n${PACKET_FAILED}`),
          },
          true,
        ),
      ),
    );
  }

  // 2) Google Sheet + (when Resend is not set up) both emails via Apps Script MailApp
  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    const sheet = fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...record,
        secret: process.env.LEAD_WEBHOOK_SECRET ?? "",
        sendEmails: !resend,
        emails: { toAntony, toAgent },
        docs: links.map((l) => ({ title: l.title, url: l.url })),
      }),
      redirect: "follow",
      signal: AbortSignal.timeout(25_000),
    })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok || !j?.ok) {
          console.error("[join] Google Sheets error", r.status, j?.error);
          return { ok: false, emailed: false };
        }
        return { ok: true, emailed: Boolean(j.agentEmailed) };
      })
      .catch((e) => {
        console.error("[join] Google Sheets error", e);
        return { ok: false, emailed: false };
      });
    deliveries.push(sheet.then((s) => s.ok));
    if (!resend) agentEmailed = sheet.then((s) => s.emailed);
  }

  // 3) CRM webhook
  if (process.env.LEAD_WEBHOOK_URL) {
    deliveries.push(
      fetch(process.env.LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }

  if (deliveries.length === 0) {
    console.error("[join] NO DESTINATION CONFIGURED (set GOOGLE_SHEETS_WEBHOOK_URL or RESEND_API_KEY). Application:", JSON.stringify(record));
  }

  const capi = sendCapiEvent({
    event: "SubmitApplication",
    eventId: a.eventId,
    url: a.pageUrl ?? `${site.url}/join`,
    user: { ...ctx, email: a.email, phone: a.phone, firstName: a.firstName, lastName: a.lastName },
    customData: { content_category: "agent_recruiting", next_step: a.nextStep },
  }).catch(() => null);

  const [delivered, emailed] = await Promise.all([Promise.all(deliveries), agentEmailed, capi]);
  if (delivered.length > 0 && !delivered.some(Boolean)) {
    console.error("[join] ALL DESTINATIONS FAILED. Application:", JSON.stringify(record));
    return NextResponse.json(
      { ok: false, error: `Sorry, we couldn't send that. Please email ${site.recruiting.email} or call ${site.phone.display}.` },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, docs: links, emailed });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { requestContext, sendCapiEvent } from "@/lib/meta-capi";
import { sendEmail } from "@/lib/resend";

/**
 * Routing (Nov 2026): every inquiry goes to the office inbox (LEAD_EMAIL_TO, admin@) with support staff
 * copied (LEAD_EMAIL_CC). Commercial and association-management inquiries also go to the broker
 * (antony@), who handles commercial brokerage and leads association business development.
 * Agent recruiting never comes through here: it has its own workflow at /join.
 */
const BROKER_TOO = new Set(["commercial", "management"]);

/** Short acknowledgment to the person who submitted (only when they gave an email). */
const ACK: Record<string, string> = {
  sell: "A licensed Prime 1 professional is preparing your property analysis and will contact you, usually within one business day.",
  valuation: "A licensed Prime 1 professional is preparing your home value range and will contact you, usually within one business day.",
  buy: "A licensed Prime 1 professional will review your criteria and follow up, usually within one business day.",
  rent: "We will review your criteria and follow up with available rentals, usually within one business day.",
  management: "Our Designated CAM reviews every management request. We will review your property details and follow up, usually within one business day.",
  commercial: "Your request was sent to our commercial brokerage team. We will follow up, usually within one business day.",
  contact: "We received your message and will reply, usually within one business day.",
  careers: "Agent affiliation runs through prime1realty.net/join, where you can review the complete offer and apply.",
};

const LeadSchema = z.object({
  leadType: z.enum(["sell", "valuation", "buy", "rent", "management", "commercial", "careers", "contact"]),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.union([z.string().trim().email().max(160), z.literal("")]).optional(),
  message: z.string().trim().max(2000).optional(),
  smsConsent: z.boolean().optional(),
  answers: z.record(z.string(), z.string().max(300)).default({}),
  eventId: z.string().max(80),
  pageUrl: z.string().max(500).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
  company_website: z.string().max(0).optional(), // honeypot: must stay empty
});

const LABELS: Record<string, string> = {
  sell: "Seller consultation / property analysis",
  valuation: "Home valuation request",
  buy: "Buyer consultation",
  rent: "Rental search",
  management: "Property / association management proposal",
  commercial: "Commercial real estate",
  careers: "Agent affiliation inquiry",
  contact: "General inquiry",
};

// Best-effort, per-instance rate limit.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function POST(req: Request) {
  const ctx = requestContext(req);
  if (ctx.ip && limited(ctx.ip)) return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });

  let parsed;
  try {
    parsed = LeadSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check your name and phone number." }, { status: 400 });
  }
  const lead = parsed.data;
  // Honeypot tripped: pretend success, do nothing.
  if (lead.company_website) return NextResponse.json({ ok: true });

  const [firstName, ...rest] = lead.name.split(/\s+/);
  // If the pixel never set _fbc (blocked script), rebuild it from the ad click ID so CAPI can attribute the lead.
  if (!ctx.fbc && lead.utm?.fbclid) ctx.fbc = `fb.1.${Date.now()}.${lead.utm.fbclid}`;
  const submittedAt = new Date().toISOString();
  const record = { ...lead, label: LABELS[lead.leadType], submittedAt, ip: ctx.ip };
  delete (record as { company_website?: string }).company_website;

  const tasks: Promise<unknown>[] = [];
  // Places the lead is actually stored/delivered. If every one of these fails, the visitor is told to call.
  const deliveries: Promise<boolean>[] = [];

  // 0) Google Sheet (Apps Script web app — see scripts/google-sheets-leads.gs)
  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    deliveries.push(
      fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...record, secret: process.env.LEAD_WEBHOOK_SECRET ?? "" }),
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      })
        .then(async (r) => {
          const j = await r.json().catch(() => null);
          if (!r.ok || !j?.ok) {
            console.error("[lead] Google Sheets error", r.status, j?.error);
            return false;
          }
          return true;
        })
        .catch((e) => {
          console.error("[lead] Google Sheets error", e);
          return false;
        }),
    );
  }

  // 1) Email the office
  if (process.env.RESEND_API_KEY || process.env.EMAIL_OUTBOX) {
    const SRC: Record<string, string> = { utm_source: "Ad source", utm_medium: "Ad medium", utm_campaign: "Ad campaign", utm_content: "Ad content", utm_term: "Ad keyword", gclid: "Google Ads click", gbraid: "Google Ads click (iOS)", wbraid: "Google Ads click (web)", fbclid: "Meta ad click", landing_page: "Landing page", landing_service: "Landing service", referrer: "Referred from", device: "Device", ai_source: "Came from AI assistant" };
    const tr = (k: string, v: string) => `<tr><td style="padding:5px 14px 5px 0;color:#555;vertical-align:top">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`;
    const section = (title: string, rows: [string, string][]) =>
      rows.some(([, v]) => v)
        ? `<h3 style="margin:18px 0 6px;font-size:13px;color:#d90a0a;text-transform:uppercase;letter-spacing:.04em">${title}</h3><table style="border-collapse:collapse">${rows.filter(([, v]) => v).map(([k, v]) => tr(k, v)).join("")}</table>`
        : "";
    const digits = lead.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    const contactRows: [string, string][] = [["Name", lead.name], ["Phone", lead.phone], ["Email", lead.email ?? ""], ["OK to call", lead.smsConsent ? "Yes" : "No"]];
    const answerRows: [string, string][] = [...Object.entries(lead.answers), ["Message", lead.message ?? ""]];
    const sourceRows: [string, string][] = [["Page", lead.pageUrl ?? ""], ...Object.entries(lead.utm ?? {}).map(([k, v]): [string, string] => [SRC[k] ?? k, v])];
    const when = new Date(submittedAt).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;max-width:640px">
<h2 style="margin:0 0 4px">${esc(LABELS[lead.leadType])}</h2>
<p style="margin:0 0 6px;color:#555">New website lead, ${when}. Call within 5 minutes for the best chance to connect.</p>
<p style="margin:14px 0"><a href="tel:+1${digits}" style="background:#d90a0a;color:#fff;padding:9px 14px;border-radius:6px;text-decoration:none;font-weight:bold">Call ${esc(lead.name.split(" ")[0])} ${esc(lead.phone)}</a>${lead.email ? ` &nbsp; <a href="mailto:${esc(lead.email)}" style="color:#111">Email ${esc(lead.email)}</a>` : ""}</p>
${section("Contact", contactRows)}${section("Their answers", answerRows)}${section("Source", sourceRows)}
<p style="color:#777;font-size:12px;margin-top:18px">Reply to this email to reach ${lead.email ? "the lead directly" : "the office"}.</p></div>`;
    const block = (title: string, rows: [string, string][]) => {
      const lines = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
      return lines.length ? `${title.toUpperCase()}\n${lines.join("\n")}\n` : "";
    };
    const text = `${LABELS[lead.leadType]}\n${when}\n\n${block("Contact", contactRows)}\n${block("Their answers", answerRows)}\n${block("Source", sourceRows)}`;
    deliveries.push(
      sendEmail(
        {
          from: process.env.LEAD_EMAIL_FROM || "Prime 1 Website <leads@updates.prime1realty.net>",
          // Agent inquiries also go to Antony (recruiting / HR).
          to: [process.env.LEAD_EMAIL_TO || site.email, ...(BROKER_TOO.has(lead.leadType) ? [site.recruiting.notify] : [])],
          // Support staff (e.g. Gabrielle) copied on every inquiry: LEAD_EMAIL_CC, comma-separated.
          ...(process.env.LEAD_EMAIL_CC ? { cc: process.env.LEAD_EMAIL_CC.split(",").map((x) => x.trim()).filter(Boolean) } : {}),
          ...(lead.email ? { reply_to: lead.email } : {}),
          subject: `New lead: ${LABELS[lead.leadType]} — ${lead.name}`,
          html,
          text,
        },
        { officeNotice: true, tag: "[lead]" },
      ),
    );
    if (lead.email) {
      const first = esc(firstName);
      tasks.push(
        sendEmail(
          {
            from: process.env.LEAD_EMAIL_FROM || "Prime 1 Realty <leads@updates.prime1realty.net>",
            to: [lead.email],
            reply_to: site.email,
            subject: `Prime 1 Realty: we received your request`,
            html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:600px"><p>Hi ${first},</p><p>Thank you for contacting Prime 1 Realty (${esc(LABELS[lead.leadType])}). ${esc(ACK[lead.leadType])}</p><p>Office hours are ${esc(site.hours.label)}; we are closed on federal holidays. Prime 1 Property Management provides 24/7 live phone answering for community association emergencies at ${site.phone.display}.</p><p>Prime 1 Realty · Prime 1 Property Management<br>${esc(site.address.street)}, ${esc(site.address.city)}, ${site.address.region} ${site.address.postal}<br>Serving clients throughout Florida</p></div>`,
          },
          { tag: "[lead:ack]" },
        ),
      );
    }
    // Copy to the CRM's lead-intake inbox (e.g. Buildout), comma-separated. Plain fields so the CRM can parse them.
    // Buildout is for commercial real estate only (per Antony, Nov 2026): only commercial inquiries are copied there.
    if (process.env.CRM_LEAD_EMAIL && lead.leadType === "commercial") {
      const plain = text;
      deliveries.push(
        sendEmail(
          {
            from: process.env.LEAD_EMAIL_FROM || "Prime 1 Website <leads@updates.prime1realty.net>",
            to: process.env.CRM_LEAD_EMAIL.split(",").map((s) => s.trim()),
            ...(lead.email ? { reply_to: lead.email } : {}),
            subject: `New lead: ${LABELS[lead.leadType]} — ${lead.name}`,
            html: `<pre style="font-family:Arial;font-size:14px;white-space:pre-wrap">${esc(plain)}</pre>`,
            text: plain,
          },
          { tag: "[lead:crm]" },
        ),
      );
    }
  }

  // 2) CRM / automation webhook
  if (process.env.LEAD_WEBHOOK_URL) {
    deliveries.push(
      fetch(process.env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
        .then((r) => r.ok)
        .catch((e) => {
          console.error("Webhook error", e);
          return false;
        }),
    );
  }

  if (deliveries.length === 0) {
    // Nothing configured: keep the full lead in the runtime logs so it can be recovered.
    console.error("[lead] NO LEAD DESTINATION CONFIGURED (set GOOGLE_SHEETS_WEBHOOK_URL). Lead:", JSON.stringify(record));
  }

  // 3) Meta Conversions API (dedups with the browser pixel via eventId)
  const event = lead.leadType === "careers" ? "SubmitApplication" : "Lead";
  tasks.push(
    sendCapiEvent({
      event,
      eventId: lead.eventId,
      url: lead.pageUrl ?? site.url,
      user: { ...ctx, email: lead.email || undefined, phone: lead.phone, firstName, lastName: rest.join(" ") || undefined },
      customData: { lead_type: lead.leadType, content_category: lead.leadType, service_line: lead.leadType === "valuation" ? "sell" : lead.leadType === "contact" ? "general" : lead.leadType, landing_service: lead.utm?.landing_service },
    }),
  );

  const [delivered] = await Promise.all([Promise.all(deliveries), Promise.allSettled(tasks)]);
  if (delivered.length > 0 && !delivered.some(Boolean)) {
    console.error("[lead] ALL DESTINATIONS FAILED. Lead:", JSON.stringify(record));
    return NextResponse.json(
      { ok: false, error: `Sorry, we couldn't send that. Please call us at ${site.phone.display}.` },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}

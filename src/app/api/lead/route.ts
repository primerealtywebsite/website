import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { requestContext, sendCapiEvent } from "@/lib/meta-capi";
import { sendEmail } from "@/lib/resend";

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
  if (process.env.RESEND_API_KEY) {
    const rows = Object.entries({
      Name: lead.name,
      Phone: lead.phone,
      Email: lead.email,
      ...lead.answers,
      Message: lead.message ?? "",
      "Call consent": lead.smsConsent ? "Yes" : "No",
      Page: lead.pageUrl ?? "",
      ...(lead.utm ?? {}),
    })
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${esc(k)}</td><td style="padding:4px 0"><b>${esc(String(v))}</b></td></tr>`)
      .join("");
    deliveries.push(
      sendEmail(
        {
          from: process.env.LEAD_EMAIL_FROM || "Prime 1 Website <leads@prime1realty.net>",
          // Agent inquiries also go to Antony (recruiting / HR).
          to: [process.env.LEAD_EMAIL_TO || site.email, ...(lead.leadType === "careers" ? [site.recruiting.email] : [])],
          ...(lead.email ? { reply_to: lead.email } : {}),
          subject: `New lead: ${LABELS[lead.leadType]} — ${lead.name}`,
          html: `<h2 style="font-family:Arial">${esc(LABELS[lead.leadType])}</h2><table style="font-family:Arial;font-size:14px">${rows}</table><p style="font-family:Arial;font-size:12px;color:#777">Submitted ${submittedAt}. Call within 5 minutes for the best chance to connect.</p>`,
        },
        { officeNotice: true, tag: "[lead]" },
      ),
    );
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

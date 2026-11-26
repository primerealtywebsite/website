import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { requestContext, sendCapiEvent } from "@/lib/meta-capi";
import { esc, officeInbox, send, toText } from "@/lib/recruiting/workflow";
import { sendEmail } from "@/lib/resend";

/**
 * Request an Association Management Proposal (multipart form, optional RFP attachment up to 3 MB).
 * Routing (per Antony, Nov 2026): the proposal goes to Antony, who leads business development and
 * approves scope and proposal; the admin inbox (Northern Lights) is copied to log the inquiry, send
 * the approved acknowledgment and track outstanding information. Jennifer Rivera (LCAM) assists with
 * inspections and transition planning only at Antony's direction, so she is not copied automatically.
 */
const Fields = z.object({
  associationName: z.string().trim().min(2).max(160),
  location: z.string().trim().min(2).max(160),
  propertyType: z.string().trim().min(2).max(80),
  units: z.string().trim().min(1).max(20),
  contactName: z.string().trim().min(2).max(120),
  boardRole: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(10).max(30),
  concern: z.string().trim().min(5).max(2000),
  transitionDate: z.string().trim().max(40).optional().default(""),
  currentManagement: z.string().trim().max(120).optional().default(""),
  onSite: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  eventId: z.string().max(80).optional().default(""),
  pageUrl: z.string().max(500).optional().default(""),
  utm: z.string().max(3000).optional().default("{}"),
  company_website: z.string().max(0).optional(),
});

const MAX = 3 * 1024 * 1024;
const OK_TYPES = /\.(pdf|docx?|xlsx?|png|jpe?g)$/i;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
  const parsed = Fields.safeParse(raw);
  if (!parsed.success) {
    const f = String(parsed.error.issues[0]?.path[0] ?? "form");
    return NextResponse.json({ ok: false, error: `Please check: ${f.replace(/([A-Z])/g, " $1").toLowerCase()}.`, field: f }, { status: 400 });
  }
  const d = parsed.data;
  if (d.company_website) return NextResponse.json({ ok: true });

  const file = form.get("rfp");
  let attachment: { filename: string; content: string } | undefined;
  if (file && typeof file !== "string" && file.size > 0) {
    if (file.size > MAX) return NextResponse.json({ ok: false, error: "The RFP file is larger than 3 MB. Please attach a smaller file or email it after submitting." }, { status: 400 });
    if (!OK_TYPES.test(file.name)) return NextResponse.json({ ok: false, error: "Please attach the RFP as a PDF, Word, Excel or image file." }, { status: 400 });
    attachment = { filename: file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 100), content: Buffer.from(await file.arrayBuffer()).toString("base64") };
  }

  let utm: Record<string, string> = {};
  try {
    utm = JSON.parse(d.utm);
  } catch {}
  const when = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
  const rows: [string, string][] = [
    ["Association", d.associationName],
    ["Location", d.location],
    ["Property type", d.propertyType],
    ["Units", d.units],
    ["Contact", d.contactName],
    ["Board role", d.boardRole],
    ["Email", d.email],
    ["Phone", d.phone],
    ["Primary concern", d.concern],
    ["Anticipated transition date", d.transitionDate],
    ["On-site staff needed", d.onSite || "Not sure"],
    ["Current management", d.currentManagement],
    ["Message", d.message],
    ["RFP attached", attachment ? attachment.filename : "No"],
    ["Page", d.pageUrl],
    ...Object.entries(utm).map(([k, v]): [string, string] => [k, String(v)]),
  ];
  const table = `<table style="border-collapse:collapse">${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:5px 14px 5px 0;color:#555;vertical-align:top">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`).join("")}</table>`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;max-width:640px">
<h2 style="margin:0 0 4px">Association management proposal request</h2>
<p style="margin:0 0 12px;color:#555">${when}. <b>Owner: ${esc(site.recruiting.name)}</b> (business development, scope and proposal approval). Northern Lights: log the inquiry, confirm the acknowledgment went out and track outstanding information. Jennifer Rivera assists with inspections, operational questions and transition planning only at the broker's direction.</p>
${table}<p style="color:#777;font-size:12px;margin-top:18px">Reply to this email to reach ${esc(d.contactName)}.</p></div>`;

  const office = await sendEmail(
    {
      from: process.env.LEAD_EMAIL_FROM || "Prime 1 Website <leads@updates.prime1realty.net>",
      to: [site.recruiting.notify],
      cc: officeInbox(),
      reply_to: d.email,
      subject: `Association proposal request: ${d.associationName} (${d.units} units, ${d.location})`,
      html,
      text: toText(html),
      attachments: attachment ? [attachment] : undefined,
    },
    { officeNotice: true, tag: "[proposal]" },
  );

  // Approved acknowledgment to the board contact (text for Antony's approval in the launch report).
  const ack = await send(
    {
      from: process.env.LEAD_EMAIL_FROM_PM || "Prime 1 Property Management <leads@updates.prime1realty.net>",
      to: [d.email],
      reply_to: site.email,
      subject: `Prime 1 Property Management: proposal request received for ${d.associationName}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:640px"><p>Dear ${esc(d.contactName)},</p>
<p>Thank you for requesting an association management proposal from <b>Prime 1 Property Management</b>, a licensed Florida community association management firm. We received your request for <b>${esc(d.associationName)}</b>${attachment ? " and your RFP" : ""}.</p>
<p>Our Designated CAM reviews every proposal request. Next, we review the scope and the site coverage your property needs and may ask for governing documents, the current budget and open items. We then present a written proposal to the board.</p>
<p>If anything is outstanding, we will let you know in writing. For a community association emergency, call ${site.phone.display} (live answering 24/7). Office hours are ${esc(site.hours.label)}; closed on federal holidays.</p>
<p>Prime 1 Property Management<br>${esc(site.address.street)}, ${esc(site.address.city)}, ${site.address.region} ${site.address.postal}</p></div>`,
    },
    "[proposal:ack]",
  );

  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ kind: "association_proposal", secret: process.env.LEAD_WEBHOOK_SECRET ?? "", sendEmails: false, leadType: "management", label: "Association management proposal", submittedAt: new Date().toISOString(), name: d.contactName, email: d.email, phone: d.phone, answers: Object.fromEntries(rows) }),
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
  }

  const ctx = requestContext(req);
  await sendCapiEvent({
    event: "Lead",
    eventId: d.eventId || `prop-${Date.now()}`,
    url: d.pageUrl || `${site.url}/property_management`,
    user: { ...ctx, email: d.email, phone: d.phone },
    customData: { lead_type: "management", content_category: "association_proposal", units: d.units },
  }).catch(() => null);

  if (!office) {
    console.error("[proposal] OFFICE EMAIL FAILED", JSON.stringify({ ...d, attachment: attachment?.filename }));
    return NextResponse.json({ ok: false, error: `Sorry, we couldn't send that. Please call ${site.phone.display}.` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, acknowledged: ack });
}

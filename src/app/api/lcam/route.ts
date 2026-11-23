import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { requestContext, sendCapiEvent } from "@/lib/meta-capi";
import { sendEmail } from "@/lib/resend";

/** Part-time LCAM application -> Antony (Designated CAM), admin + support staff copied; applicant gets a confirmation. */
const Schema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(10).max(30),
  license: z.string().trim().min(4).max(20).transform((v) => v.toUpperCase().replace(/\s+/g, "")),
  years: z.string().trim().max(40).optional().default(""),
  associations: z.string().trim().max(200).optional().default(""),
  hours: z.string().trim().max(40).optional().default(""),
  availability: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  eventId: z.string().max(80),
  pageUrl: z.string().max(500).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
  company_website: z.string().max(0).optional(),
});

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function POST(req: Request) {
  const ctx = requestContext(req);
  let parsed;
  try {
    parsed = Schema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please check your name, email, phone and CAM license number." }, { status: 400 });
  const a = parsed.data;
  if (a.company_website) return NextResponse.json({ ok: true });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: false, error: `Please email ${site.recruiting.email} or call ${site.phone.display}.` }, { status: 502 });

  const name = `${a.firstName} ${a.lastName}`;
  const when = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
  const rows: [string, string][] = [
    ["Name", name], ["Email", a.email], ["Phone", a.phone], ["CAM license", a.license], ["Years as a CAM", a.years],
    ["Associations managed", a.associations], ["Hours per week wanted", a.hours], ["Availability", a.availability], ["Message", a.message], ["Page", a.pageUrl ?? ""],
    ...Object.entries(a.utm ?? {}),
  ];
  const filled = rows.filter(([, v]) => v);
  const digits = a.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  const from = process.env.RECRUITING_EMAIL_FROM || "Prime 1 Realty Recruiting <recruiting@updates.prime1realty.net>";
  const cc = [...new Set([site.recruiting.cc, ...(process.env.LEAD_EMAIL_CC || "").split(",").map((x) => x.trim())].filter((v) => v && v !== site.recruiting.notify))];

  const office = sendEmail(
    {
      from,
      to: [site.recruiting.notify],
      cc: cc.length ? cc : undefined,
      reply_to: a.email,
      subject: `LCAM application (part-time): ${name} · ${a.license}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111"><h2 style="margin:0 0 4px">Part-time LCAM application</h2><p style="margin:0 0 14px;color:#555">Submitted ${when}. Verify the CAM license before scheduling an interview.</p><table style="border-collapse:collapse">${filled.map(([k, v]) => `<tr><td style="padding:5px 14px 5px 0;color:#555;vertical-align:top">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`).join("")}</table><p style="margin:16px 0 0"><a href="tel:+1${digits}">Call ${esc(a.phone)}</a> · <a href="mailto:${esc(a.email)}">Email ${esc(a.firstName)}</a> · <a href="https://www.myfloridalicense.com/wl11.asp">Verify license (DBPR)</a></p></div>`,
      text: `Part-time LCAM application\n${when}\n\n${filled.map(([k, v]) => `${k}: ${v}`).join("\n")}`,
    },
    { officeNotice: true, tag: "[lcam]" },
  );
  const applicant = sendEmail(
    {
      from,
      to: [a.email],
      reply_to: site.recruiting.email,
      subject: "We received your LCAM application | Prime 1 Property Management",
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:600px"><p>Hi ${esc(a.firstName)},</p><p>Thank you for applying for the part-time Licensed Community Association Manager position ($30 an hour, up to 20 hours a week) at Prime 1 Property Management. ${esc(site.recruiting.name)}, our Designated CAM, reviews every application and will contact you about next steps.</p><p>Questions? Reply to this email or call ${site.phone.display}.</p><p>Prime 1 Property Management<br>${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}</p></div>`,
      text: `Hi ${a.firstName},\n\nThank you for applying for the part-time LCAM position ($30 an hour, up to 20 hours a week) at Prime 1 Property Management. ${site.recruiting.name}, our Designated CAM, reviews every application and will contact you about next steps.\n\nQuestions? Reply to this email or call ${site.phone.display}.`,
    },
    { tag: "[lcam]" },
  );
  const capi = sendCapiEvent({
    event: "SubmitApplication",
    eventId: a.eventId,
    url: a.pageUrl ?? `${site.url}/careers/lcam-jobs`,
    user: { ...ctx, email: a.email, phone: a.phone, firstName: a.firstName, lastName: a.lastName },
    customData: { content_category: "lcam_recruiting" },
  }).catch(() => null);
  const [ok, emailed] = await Promise.all([office, applicant, capi]);
  if (!ok) return NextResponse.json({ ok: false, error: `Sorry, we couldn't send that. Please email ${site.recruiting.email} or call ${site.phone.display}.` }, { status: 502 });
  return NextResponse.json({ ok: true, emailed });
}

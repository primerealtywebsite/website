import { NextResponse } from "next/server";
import { z } from "zod";
import { people, site } from "@/config/site";
import { esc, officeInbox, send, toText } from "@/lib/recruiting/workflow";
import { sendEmail } from "@/lib/resend";

/**
 * Prime 1 Property Management employment application (LCAM, W-2) with résumé upload.
 * Goes to Antony Oseitutu (Designated CAM, hiring decisions) with the office inbox copied for
 * administrative support. Kept separate from agent affiliation (/api/join), from Stripe payments
 * (agents only) and from the Buildout / commercial CRM copy.
 */
const Fields = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(10).max(30),
  city: z.string().trim().max(120).optional().default(""),
  license: z.string().trim().min(3).max(40),
  years: z.string().trim().min(1).max(40),
  experience: z.string().trim().min(10).max(3000),
  preference: z.enum(["Part time", "Full time", "Either"]),
  availability: z.string().trim().min(2).max(300),
  message: z.string().trim().max(2000).optional().default(""),
  pageUrl: z.string().max(500).optional().default(""),
  company_website: z.string().max(0).optional(),
});

const MAX = 4 * 1024 * 1024;
const OK_TYPES = /\.(pdf|docx?|rtf|txt)$/i;

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

  const file = form.get("resume");
  if (!file || typeof file === "string" || file.size === 0) return NextResponse.json({ ok: false, error: "Please attach your résumé.", field: "resume" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ ok: false, error: "Your résumé is larger than 4 MB. Please attach a smaller PDF or Word file." }, { status: 400 });
  if (!OK_TYPES.test(file.name)) return NextResponse.json({ ok: false, error: "Please attach your résumé as a PDF or Word file." }, { status: 400 });
  const attachment = { filename: file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 100), content: Buffer.from(await file.arrayBuffer()).toString("base64") };

  const name = `${d.firstName} ${d.lastName}`;
  const when = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", d.email],
    ["Phone", d.phone],
    ["City", d.city],
    ["Florida CAM license number", d.license],
    ["Years of association management experience", d.years],
    ["Relevant experience", d.experience],
    ["Employment preference", d.preference],
    ["Availability", d.availability],
    ["Message", d.message],
    ["Résumé", attachment.filename],
    ["Page", d.pageUrl],
  ];
  const table = `<table style="border-collapse:collapse">${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:5px 14px 5px 0;color:#555;vertical-align:top">${esc(k)}</td><td style="padding:5px 0;white-space:pre-wrap"><b>${esc(v)}</b></td></tr>`).join("")}</table>`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;max-width:640px">
<h2 style="margin:0 0 4px">LCAM employment application (Prime 1 Property Management)</h2>
<p style="margin:0 0 12px;color:#555">${when}. Pipeline application: there are currently no open positions. Hiring decisions: ${esc(people.antony.name)}, Designated CAM. Verify the CAM license on DBPR before any next step.</p>
${table}<p style="color:#777;font-size:12px;margin-top:18px">Reply to this email to reach ${esc(name)}. Résumé attached.</p></div>`;

  const office = await sendEmail(
    {
      from: process.env.LEAD_EMAIL_FROM_PM || "Prime 1 Property Management <leads@updates.prime1realty.net>",
      to: [site.recruiting.notify],
      cc: officeInbox(),
      reply_to: d.email,
      subject: `LCAM employment application: ${name} (${d.preference}, license ${d.license})`,
      html,
      text: toText(html),
      attachments: [attachment],
    },
    { officeNotice: true, tag: "[employment]" },
  );
  if (!office) {
    console.error("[employment] OFFICE EMAIL FAILED", JSON.stringify({ ...d, resume: attachment.filename }));
    return NextResponse.json({ ok: false, error: `Sorry, we couldn't send your application. Please try again, or call ${site.phone.display}.` }, { status: 502 });
  }

  await send(
    {
      from: process.env.LEAD_EMAIL_FROM_PM || "Prime 1 Property Management <leads@updates.prime1realty.net>",
      to: [d.email],
      reply_to: site.email,
      subject: "Prime 1 Property Management: employment application received",
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:640px"><p>Dear ${esc(d.firstName)},</p>
<p>Thank you for applying for future employment with <b>Prime 1 Property Management</b> as a Licensed Community Association Manager. We received your application and résumé.</p>
<p>There are currently no open positions. Your application will be kept on file for future employment consideration as our association management portfolio expands, and we will contact you if a position that fits your preference becomes available.</p>
<p>Prime 1 Property Management<br>${esc(site.address.street)}, ${esc(site.address.city)}, ${site.address.region} ${site.address.postal}</p></div>`,
    },
    "[employment:ack]",
  ).catch(() => false);

  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ kind: "lcam_employment", secret: process.env.LEAD_WEBHOOK_SECRET ?? "", sendEmails: false, leadType: "employment", label: "LCAM employment application", submittedAt: new Date().toISOString(), name, email: d.email, phone: d.phone, answers: Object.fromEntries(rows) }),
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}

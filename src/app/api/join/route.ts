import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { requestContext, sendCapiEvent } from "@/lib/meta-capi";
import { reviewDocs } from "@/lib/onboarding-docs";
import { agentToken, applicantId, brokerToken, recruitingConfigured, type Applicant } from "@/lib/recruiting/token";
import { evaluate, logRecord, mailException, mailReceived, mailRecord, send, trackOf, type Application } from "@/lib/recruiting/workflow";

/**
 * Join Prime 1 application. Two calls:
 *  - stage "started": contact step only. Creates (or reuses) the applicant record as Incomplete so an
 *    unfinished application can be flagged and resumed without a duplicate.
 *  - stage "submit": the full application. Stays PENDING until the broker decides. The applicant gets
 *    the same neutral confirmation whether or not the file is flagged: no booking link, no agreement,
 *    nothing the broker has signed and no payment request. Antony gets one complete record.
 * The applicant ID is derived from the email, so re-submitting updates the same record.
 */

const str = (max: number) => z.string().trim().max(max).optional().default("");

const Contact = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(10).max(30),
});

const Full = Contact.extend({
  licenseStatus: z.enum(["Active", "Inactive"]),
  licenseType: z.enum(["Sales Associate (SL)", "Broker Associate (BL)", "Broker (BK)"]),
  licenseNumber: z.string().trim().min(5).max(20).transform((v) => v.toUpperCase().replace(/[\s-]+/g, "")),
  currentBrokerage: z.string().trim().min(2).max(120),
  yearsLicensed: str(40),
  focus: z.enum(["Residential", "Commercial", "Residential + commercial"]),
  closings: str(20),
  volume: str(40),
  commercialExperience: str(60),
  commercialDeals: str(40),
  activeListings: str(20),
  pendingTransactions: str(20),
  affiliationDate: z.string().trim().min(4).max(40),
  markets: z.string().trim().min(2).max(200),
  association: z.string().trim().min(2).max(160),
  mls: z.array(z.string().max(80)).max(8).default([]),
  discipline: z.enum(["No", "Yes"]),
  disciplineDetail: str(1500),
  heardFrom: z.string().trim().min(2).max(80),
  referredBy: str(120),
  speakRequest: str(2000),
  message: str(2000),
  reviewedMaterials: z.literal(true),
  consent: z.boolean().optional(),
});

const Body = z.discriminatedUnion("stage", [
  z.object({ stage: z.literal("started"), contact: Contact, pageUrl: z.string().max(500).optional(), utm: z.record(z.string(), z.string().max(200)).optional() }),
  z.object({ stage: z.literal("submit"), application: Full, eventId: z.string().max(80), pageUrl: z.string().max(500).optional(), utm: z.record(z.string(), z.string().max(200)).optional(), company_website: z.string().max(0).optional() }),
]);

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 12;
}

const UTM_LABELS: Record<string, string> = {
  utm_source: "Source (utm_source)",
  utm_medium: "Medium",
  utm_campaign: "Campaign",
  utm_content: "Ad content",
  utm_term: "Keyword",
  gclid: "Google Ads click ID",
  fbclid: "Meta ad click ID",
  li_fat_id: "LinkedIn click ID",
  landing_page: "Landing page",
  referrer: "Referred from",
  device: "Device",
  ai_source: "Came from AI assistant",
};

export async function POST(req: Request) {
  const ctx = requestContext(req);
  if (ctx.ip && limited(ctx.ip)) return NextResponse.json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  if (!recruitingConfigured()) {
    console.error("[join] RECRUITING_SECRET missing in production");
    return NextResponse.json({ ok: false, error: `Applications are temporarily unavailable. Please call ${site.phone.display} during office hours.` }, { status: 503 });
  }

  let body;
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path.at(-1);
      return NextResponse.json({ ok: false, error: field === "reviewedMaterials" ? "Please confirm you reviewed the offer, FAQ, agreement and affiliation steps." : `Please check the ${String(field ?? "form")} field.`, field }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const origin = new URL(req.url).origin;
  const utm = body.utm ?? {};
  const source = utm.utm_source || utm.referrer || "direct";

  // ---------- incomplete (contact step) ----------
  if (body.stage === "started") {
    const c = body.contact;
    const id = applicantId(c.email);
    const logged = await logRecord({ id, status: "Incomplete", name: `${c.firstName} ${c.lastName}`, email: c.email, detail: { phone: c.phone, source, page: body.pageUrl ?? "" } });
    return NextResponse.json({ ok: true, id, logged });
  }

  // ---------- full submission ----------
  if (body.company_website) return NextResponse.json({ ok: true, id: "P1-OK" });
  const app = body.application;
  if (app.discipline === "Yes" && app.disciplineDetail.length < 10) {
    return NextResponse.json({ ok: false, error: "Please briefly describe the complaint, restriction or discipline.", field: "disciplineDetail" }, { status: 400 });
  }
  const id = applicantId(app.email);
  const { flags, track, summary } = evaluate(app as Application);
  const a: Applicant = {
    id,
    first: app.firstName,
    last: app.lastName,
    email: app.email.toLowerCase(),
    phone: app.phone,
    license: app.licenseNumber,
    licenseType: app.licenseType,
    track: trackOf(app.focus) ?? track,
    market: app.markets,
    source: app.referredBy ? `${app.heardFrom} (${app.referredBy})` : app.heardFrom,
  };
  // A previous submission from the same email is treated as an update of the same record.
  const updated = req.headers.get("x-p1-resume") === id;

  const statusUrl = `${origin}/join/status?t=${encodeURIComponent(agentToken(a, "pending"))}`;
  const reviewUrl = `${origin}/join/review?t=${encodeURIComponent(brokerToken(a, flags))}`;
  const submittedLocal = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
  const sourceRows = Object.entries(utm).map(([k, v]): [string, string] => [UTM_LABELS[k] ?? k, v]);

  const applicantMail = mailReceived(a, { statusUrl, reviewDocs: reviewDocs(), speakRequest: app.speakRequest, updated, origin });
  const applicantEmailed = await send(applicantMail, "[join:applicant]");
  const recordMail = mailRecord({ a, app: app as Application, flags, summary, reviewUrl, updated, submittedLocal, source: sourceRows, applicantEmailed });
  const [brokerEmailed, logged] = await Promise.all([
    send(recordMail, "[join:record]"),
    logRecord({
      id,
      status: "Pending broker review",
      name: `${a.first} ${a.last}`,
      email: a.email,
      detail: { phone: a.phone, license: a.license, licenseStatus: app.licenseStatus, track: a.track, closings: app.closings, commercial: app.commercialExperience, brokerage: app.currentBrokerage, markets: app.markets, affiliationDate: app.affiliationDate, flags: flags.join(" | "), fit: summary, heardFrom: app.heardFrom, referredBy: app.referredBy, source, campaign: utm.utm_campaign ?? "", speakRequest: app.speakRequest },
    }),
  ]);
  if (!applicantEmailed) {
    await send(mailException(a, "Applicant confirmation email failed", [["Applicant email", a.email], ["What to do", "Confirm the address and send the standard pending-review confirmation"]]), "[join:exception]");
  }

  await sendCapiEvent({
    event: "SubmitApplication",
    eventId: body.eventId,
    url: body.pageUrl ?? `${site.url}/join`,
    user: { ...ctx, email: a.email, phone: a.phone, firstName: a.first, lastName: a.last },
    customData: { content_category: "agent_recruiting", track: a.track, qualified: flags.length === 0 ? "yes" : "flagged", source },
  }).catch(() => null);

  if (!brokerEmailed && !logged) {
    console.error("[join] ALL DESTINATIONS FAILED", JSON.stringify({ id, app, flags }));
    return NextResponse.json({ ok: false, error: `Sorry, we couldn't submit that. Please call ${site.phone.display} during office hours.` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id, emailed: applicantEmailed, statusUrl: `/join/status?t=${encodeURIComponent(new URL(statusUrl).searchParams.get("t")!)}` });
}

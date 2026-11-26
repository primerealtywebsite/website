import { NextResponse } from "next/server";
import { z } from "zod";
import { requestContext } from "@/lib/meta-capi";
import { packetLinks } from "@/lib/onboarding-docs";
import { HANDBOOK_ACKS, signHashes } from "@/lib/recruiting/steps";
import { agentToken, readAgent } from "@/lib/recruiting/token";
import { logRecord, mailSigned, mailSignedOffice, send } from "@/lib/recruiting/workflow";

/**
 * Electronic signature (ESIGN Act / Florida UETA, ch. 668): typed legal name, initials on each handbook
 * acknowledgment, and consent to sign electronically. Requires an APPROVED link; a pending or declined
 * applicant cannot reach or call this step. Records name, time, IP, user agent and a SHA-256 of each document.
 */
const Body = z.object({
  t: z.string().max(6000),
  name: z.string().trim().min(4).max(120),
  initials: z.string().trim().min(2).max(5),
  acks: z.array(z.string()).length(HANDBOOK_ACKS.length),
  consent: z.literal(true),
  reviewed: z.literal(true),
});

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "");

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please type your full legal name, your initials on every acknowledgment, and confirm both boxes." }, { status: 400 });
  const d = parsed.data;
  const tok = readAgent(d.t, ["approved"]);
  if (!tok) return NextResponse.json({ ok: false, error: "Signing is available only after broker approval, from your approval email." }, { status: 403 });
  const a = tok.a;
  if (!norm(d.name).includes(norm(a.first)) || !norm(d.name).includes(norm(a.last))) {
    return NextResponse.json({ ok: false, error: `Please type your full legal name as it appears on your license (${a.first} ${a.last}).` }, { status: 400 });
  }
  const ctx = requestContext(req);
  const sig = { at: new Date().toISOString(), name: d.name, ip: ctx.ip };
  const signedToken = agentToken(a, "signed", { sig });
  const origin = new URL(req.url).origin;
  const onboardingUrl = `${origin}/join/onboarding?t=${encodeURIComponent(signedToken)}`;
  const hashes = await signHashes();
  const [agentMailed] = await Promise.all([
    send(mailSigned(a, sig, onboardingUrl, packetLinks(origin, signedToken), hashes), "[onboarding:signed]"),
    send(mailSignedOffice(a, sig, hashes), "[onboarding:signed-office]"),
    logRecord({ id: a.id, status: "Signed - awaiting payment", name: `${a.first} ${a.last}`, email: a.email, detail: { signedAt: sig.at, signedName: d.name, initials: d.initials, ip: ctx.ip ?? "", userAgent: req.headers.get("user-agent") ?? "", docs: hashes.map((h) => `${h.title}:${h.sha256}`).join(" | ") } }),
  ]);
  return NextResponse.json({ ok: true, t: signedToken, emailed: agentMailed });
}

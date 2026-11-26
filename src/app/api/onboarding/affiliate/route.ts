import { NextResponse } from "next/server";
import { z } from "zod";
import { completeAffiliation, completePayment } from "@/lib/recruiting/steps";
import { readBroker } from "@/lib/recruiting/token";

/**
 * Broker-only actions from links in Antony's record emails:
 *  act "affiliate": DBPR shows the license under Prime 1 -> opens the agent's Virtual Office.
 *  act "paid":      records an onboarding fee received another way (e.g. Stripe outage) -> same as a paid checkout.
 * In tests, "affiliate" is a simulation: it changes nothing at DBPR, it only confirms what the broker saw.
 */
const Body = z.object({ t: z.string().max(8000), confirm: z.literal(true), ref: z.string().trim().max(80).optional().default("") });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please tick the confirmation box." }, { status: 400 });
  const b = readBroker(parsed.data.t);
  if (!b?.act || !b.ref) return NextResponse.json({ ok: false, error: "This link is invalid or expired." }, { status: 403 });
  const origin = new URL(req.url).origin;

  if (b.act === "affiliate") {
    if (b.ref.st !== "paid") return NextResponse.json({ ok: false, error: "Affiliation can be confirmed only after signing and payment." }, { status: 409 });
    const { agentMailed } = await completeAffiliation(b.ref, origin);
    return NextResponse.json({ ok: true, status: "Affiliated - Virtual Office active", emailed: agentMailed });
  }
  if (b.ref.st !== "signed") return NextResponse.json({ ok: false, error: "Payment can be recorded only after approval and signing." }, { status: 409 });
  await completePayment(b.ref, origin, parsed.data.ref || `RECORDED-${Date.now().toString(36).toUpperCase()}`, "invoice");
  return NextResponse.json({ ok: true, status: "Paid - license transfer in progress" });
}

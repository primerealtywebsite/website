import { NextResponse } from "next/server";
import { z } from "zod";
import { OFFER } from "@/config/offer";
import { completePayment, paymentMode } from "@/lib/recruiting/steps";
import { brokerToken, readAgent, type AgentToken } from "@/lib/recruiting/token";
import { logRecord, mailException, mailPaymentFailed, send } from "@/lib/recruiting/workflow";

/**
 * $149 onboarding fee. Only a SIGNED link (which only an approved applicant can obtain) can start payment,
 * so nobody is charged before approval and there are no refunds for declined applicants.
 *   POST {t}                          -> Stripe Checkout URL (or sandbox instructions)
 *   POST {t, simulate:"success"|"fail"} -> sandbox only (never in production unless PAYMENT_SANDBOX=1)
 *   GET  ?session_id&t                -> Stripe success return: verify the session with Stripe, then issue the paid link
 *   GET  ?cancel=1&t                  -> Stripe cancel/failed return: exception to the office, retry link to the agent
 */
const Body = z.object({ t: z.string().max(6000), simulate: z.enum(["success", "fail"]).optional() });

async function stripe(path: string, init?: { method?: string; form?: Record<string, string> }) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init?.method ?? "GET",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...(init?.form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body: init?.form ? new URLSearchParams(init.form) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  return { ok: r.ok, json: (await r.json().catch(() => ({}))) as Record<string, unknown> };
}

/** `raw` is the agent's own signed link, reused so they can retry without anything new being issued. */
async function failed(tok: AgentToken, raw: string, origin: string, reason: string, mode: string) {
  const onboardingUrl = `${origin}/join/onboarding?t=${encodeURIComponent(raw)}&payment=failed`;
  const confirmUrl = `${origin}/join/review?t=${encodeURIComponent(brokerToken(tok.a, [], { act: "paid", ref: tok }))}`;
  await Promise.all([
    send(mailPaymentFailed(tok.a, onboardingUrl, reason), "[onboarding:pay-failed]"),
    send(
      mailException(tok.a, "Payment failed", [
        ["Agent", `${tok.a.first} ${tok.a.last}`],
        ["Email", tok.a.email],
        ["Phone", tok.a.phone],
        ["Mode", mode],
        ["Reason", reason],
        ["What to do", "Follow up administratively so the agent can retry from their onboarding link (sent to them). No charge was made."],
        ["If paid another way", `Broker can record it: ${confirmUrl}`],
      ]),
      "[onboarding:exception]",
    ),
    logRecord({ id: tok.a.id, status: "Payment failed", name: `${tok.a.first} ${tok.a.last}`, email: tok.a.email, detail: { paymentError: reason } }),
  ]);
  return onboardingUrl;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  const tok = readAgent(parsed.data.t, ["signed"]);
  if (!tok) return NextResponse.json({ ok: false, error: "Payment opens only after broker approval and your signature." }, { status: 403 });
  const origin = new URL(req.url).origin;
  const mode = paymentMode();

  if (parsed.data.simulate) {
    if (mode !== "sandbox") return NextResponse.json({ ok: false, error: "Sandbox payments are disabled here." }, { status: 403 });
    if (parsed.data.simulate === "fail") {
      const url = await failed(tok, parsed.data.t, origin, "Sandbox: card declined (simulated)", "sandbox");
      return NextResponse.json({ ok: false, failed: true, url: url.replace(origin, ""), error: "Card declined (sandbox test). No charge was made." });
    }
    const { paidToken } = await completePayment(tok, origin, `SANDBOX-${Date.now().toString(36).toUpperCase()}`, "sandbox");
    return NextResponse.json({ ok: true, t: paidToken });
  }

  if (mode === "sandbox") return NextResponse.json({ ok: true, sandbox: true });
  if (mode === "unavailable") {
    await send(mailException(tok.a, "Payment failed", [["Reason", "Online payment is not configured (STRIPE_SECRET_KEY missing)"], ["What to do", "Technical setup: configure Stripe. Until then the broker can record payment received another way from the paid-confirmation link."], ["Agent", `${tok.a.first} ${tok.a.last} · ${tok.a.email}`]]), "[onboarding:exception]");
    return NextResponse.json({ ok: false, error: "Online payment is being set up. The office has been notified and will contact you." }, { status: 503 });
  }

  const back = (q: string) => `${origin}/api/onboarding/pay?${q}&t=${encodeURIComponent(parsed.data.t)}`;
  const s = await stripe("checkout/sessions", {
    method: "POST",
    form: {
      mode: "payment",
      customer_email: tok.a.email,
      client_reference_id: tok.a.id,
      "metadata[applicant]": tok.a.id,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(OFFER.fees.onboarding * 100),
      "line_items[0][price_data][product_data][name]": "Prime 1 Realty onboarding fee (one time)",
      success_url: back("session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: back("cancel=1"),
    },
  });
  if (!s.ok || typeof s.json.url !== "string") {
    console.error("[onboarding:pay] stripe error", s.json);
    await failed(tok, parsed.data.t, origin, "Could not start checkout", "stripe");
    return NextResponse.json({ ok: false, error: "We couldn't start checkout. The office has been notified." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, url: s.json.url });
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const t = u.searchParams.get("t");
  const origin = u.origin;
  const tok = readAgent(t, ["signed"]);
  if (!tok) {
    // Already paid (e.g. a refresh of the return URL) or not allowed: send them to their onboarding page.
    return NextResponse.redirect(`${origin}/join/onboarding?t=${encodeURIComponent(t ?? "")}`, 303);
  }
  if (u.searchParams.get("cancel")) {
    const url = await failed(tok, t!, origin, "Checkout was cancelled or the card was declined", "stripe");
    return NextResponse.redirect(url, 303);
  }
  const id = u.searchParams.get("session_id") ?? "";
  if (!process.env.STRIPE_SECRET_KEY || !/^cs_/.test(id)) return NextResponse.redirect(`${origin}/join/onboarding?t=${encodeURIComponent(t!)}`, 303);
  const s = await stripe(`checkout/sessions/${encodeURIComponent(id)}`);
  const md = s.json.metadata as Record<string, string> | undefined;
  if (!s.ok || s.json.payment_status !== "paid" || md?.applicant !== tok.a.id) {
    const url = await failed(tok, t!, origin, `Payment not confirmed (${String(s.json.payment_status ?? "unknown")})`, "stripe");
    return NextResponse.redirect(url, 303);
  }
  const { onboardingUrl } = await completePayment(tok, origin, String(s.json.payment_intent ?? id), "stripe");
  return NextResponse.redirect(onboardingUrl, 303);
}

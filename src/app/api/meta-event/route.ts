import { NextResponse } from "next/server";
import { requestContext, sendCapiEvent } from "@/lib/meta-capi";

// Only events that are true at click time. Lead / SubmitApplication come from /api/lead after a real submission.
const ALLOWED = new Set(["ViewContent", "Contact", "Schedule", "FindLocation"]);

/** Mirrors browser click events to the Conversions API (same event_id for dedup). */
export async function POST(req: Request) {
  let body: { event?: string; eventId?: string; url?: string; params?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.event || !ALLOWED.has(body.event) || !body.eventId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const result = await sendCapiEvent({
    event: body.event,
    eventId: String(body.eventId).slice(0, 80),
    url: String(body.url ?? "").slice(0, 500),
    user: requestContext(req),
    customData: body.params,
  });
  return NextResponse.json({ ok: true, ...result });
}

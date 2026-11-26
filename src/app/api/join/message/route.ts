import { NextResponse } from "next/server";
import { z } from "zod";
import { brokerToken, readAgent } from "@/lib/recruiting/token";
import { logRecord, mailApplicantMessage, send } from "@/lib/recruiting/workflow";

/** Written request to speak/meet, or a response to an information request. Attached to the application and sent to the broker. Nothing is scheduled. */
const Body = z.object({ t: z.string().max(6000), kind: z.enum(["speak", "info"]), text: z.string().trim().min(10).max(3000) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please write at least a sentence." }, { status: 400 });
  const tok = readAgent(parsed.data.t, ["pending", "approved", "signed", "paid"]);
  if (!tok) return NextResponse.json({ ok: false, error: "This link is no longer valid." }, { status: 403 });
  const origin = new URL(req.url).origin;
  const reviewUrl = `${origin}/join/review?t=${encodeURIComponent(brokerToken(tok.a, []))}`;
  const ok = await send(mailApplicantMessage(tok.a, parsed.data.kind, parsed.data.text, reviewUrl), "[join:message]");
  await logRecord({ id: tok.a.id, status: "Pending broker review", name: `${tok.a.first} ${tok.a.last}`, email: tok.a.email, detail: { [parsed.data.kind === "speak" ? "speakRequest" : "infoResponse"]: parsed.data.text } });
  if (!ok) return NextResponse.json({ ok: false, error: "We couldn't send that. Please try again later." }, { status: 502 });
  return NextResponse.json({ ok: true });
}

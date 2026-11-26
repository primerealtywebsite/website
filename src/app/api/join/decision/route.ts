import { NextResponse } from "next/server";
import { z } from "zod";
import { agentToken, readBroker } from "@/lib/recruiting/token";
import { logRecord, mailApproved, mailDeclined, mailDecisionLog, mailInfoRequested, send } from "@/lib/recruiting/workflow";

/**
 * Broker decision (from Antony's personal review link). Approval REQUIRES the DBPR result to be recorded
 * as "Current, Active" with the restrictions/discipline review confirmed; an inactive, not-found or
 * unverified license can only be declined or sent back with a request for information.
 */
const Body = z.discriminatedUnion("decision", [
  z.object({
    t: z.string().max(6000),
    decision: z.literal("approve"),
    dbpr: z.literal("Current, Active"),
    disciplineReviewed: z.literal(true),
    note: z.string().trim().max(2000).optional().default(""),
  }),
  z.object({ t: z.string().max(6000), decision: z.literal("decline"), dbpr: z.string().max(60).optional().default(""), note: z.string().trim().max(2000).optional().default("") }),
  z.object({ t: z.string().max(6000), decision: z.literal("info"), dbpr: z.string().max(60).optional().default(""), note: z.string().trim().min(10).max(2000) }),
]);

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    const approve = raw?.decision === "approve";
    return NextResponse.json(
      { ok: false, error: approve ? "Approval requires DBPR to show the license as Current, Active and the restrictions/discipline review to be confirmed." : "Please add a message for the applicant (at least a sentence)." },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const b = readBroker(d.t);
  if (!b) return NextResponse.json({ ok: false, error: "This review link is invalid or expired." }, { status: 403 });
  const a = b.a;
  const origin = new URL(req.url).origin;

  if (d.decision === "approve") {
    const url = `${origin}/join/onboarding?t=${encodeURIComponent(agentToken(a, "approved"))}`;
    const sent = await send(mailApproved(a, url, d.note), "[join:approved]");
    await Promise.all([
      send(mailDecisionLog(a, "Approved - awaiting signature", [["Decision", "Approved"], ["DBPR (recorded by broker)", d.dbpr], ["Restrictions / discipline reviewed", "Yes"], ["Note to applicant", d.note], ["Approval email delivered", sent ? "Yes" : "NO: follow up"]]), "[join:log]"),
      logRecord({ id: a.id, status: "Approved - awaiting signature", name: `${a.first} ${a.last}`, email: a.email, detail: { dbpr: d.dbpr, decidedAt: new Date().toISOString() } }),
    ]);
    return NextResponse.json({ ok: true, status: "Approved - awaiting signature", emailed: sent });
  }
  if (d.decision === "decline") {
    const sent = await send(mailDeclined(a, d.note), "[join:declined]");
    await Promise.all([
      send(mailDecisionLog(a, "Declined", [["Decision", "Declined"], ["DBPR (recorded by broker)", d.dbpr], ["Note to applicant", d.note], ["Decline email delivered", sent ? "Yes" : "NO: follow up"]]), "[join:log]"),
      logRecord({ id: a.id, status: "Declined", name: `${a.first} ${a.last}`, email: a.email, detail: { dbpr: d.dbpr, decidedAt: new Date().toISOString() } }),
    ]);
    return NextResponse.json({ ok: true, status: "Declined", emailed: sent });
  }
  const statusUrl = `${origin}/join/status?t=${encodeURIComponent(agentToken(a, "pending"))}`;
  const sent = await send(mailInfoRequested(a, d.note, statusUrl), "[join:info]");
  await Promise.all([
    send(mailDecisionLog(a, "More information requested", [["Request", d.note], ["DBPR (recorded by broker)", d.dbpr], ["Email delivered", sent ? "Yes" : "NO: follow up"]]), "[join:log]"),
    logRecord({ id: a.id, status: "More information requested", name: `${a.first} ${a.last}`, email: a.email, detail: { infoRequest: d.note } }),
  ]);
  return NextResponse.json({ ok: true, status: "More information requested", emailed: sent });
}

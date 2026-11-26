import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { readAgent } from "@/lib/recruiting/token";
import { officeInbox, send } from "@/lib/recruiting/workflow";

const VO_COOKIE = "p1_vo"; // also read in src/app/virtual-office/page.tsx

/** GET ?t=<affiliated link>: remembers the agent on this device (httpOnly cookie, ~13 months) and opens the Virtual Office. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const t = u.searchParams.get("t");
  const tok = readAgent(t, ["affiliated"]);
  const res = NextResponse.redirect(`${u.origin}/virtual-office${tok ? "" : "?invalid=1"}`, 303);
  if (tok) res.cookies.set(VO_COOKIE, t!, { httpOnly: true, secure: u.protocol === "https:", sameSite: "lax", path: "/", maxAge: 400 * 86400 });
  return res;
}

/** POST {email}: lost link. Never reveals whether the email belongs to an agent; the office resends it. */
const Body = z.object({ email: z.string().trim().email().max(160), name: z.string().trim().max(120).optional().default("") });
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please enter your email." }, { status: 400 });
  await send(
    {
      to: officeInbox().length ? officeInbox() : [site.recruiting.notify],
      office: true,
      reply_to: parsed.data.email,
      subject: `Virtual Office link requested: ${parsed.data.name || parsed.data.email}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px"><p><b>${parsed.data.name || "An agent"}</b> (${parsed.data.email}) asked for a new Virtual Office link.</p><p>If they are an affiliated agent, forward the Virtual Office link from their "Affiliated" record email. If not, no action is needed.</p></div>`,
    },
    "[vo:link-request]",
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(VO_COOKIE, "", { path: "/", maxAge: 0 });
  void req;
  return res;
}

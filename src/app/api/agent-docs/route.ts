import { connection } from "next/server";
import { fileFor, handbookReviewReady, isPacketSlug, isReviewSlug, readDocFile } from "@/lib/onboarding-docs";
import { readAgent } from "@/lib/recruiting/token";

/**
 * /api/agent-docs?f=<review-slug>               public review copies (nothing broker-signed)
 * /api/agent-docs?f=<packet-slug>&t=<token>     packet, ONLY with an approved-or-later applicant link
 * Links issued by the old workflow (before broker approval existed) no longer open anything.
 */
export async function GET(req: Request) {
  await connection();
  const u = new URL(req.url);
  const f = u.searchParams.get("f");
  const deny = (msg: string, status = 403) =>
    new Response(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } });

  let allowed = false;
  if (isReviewSlug(f)) allowed = true;
  else if (f === "review-handbook") allowed = handbookReviewReady();
  else if (isPacketSlug(f)) allowed = Boolean(readAgent(u.searchParams.get("t"), ["approved", "signed", "paid", "affiliated"]));
  else return deny("Not found", 404);

  if (!allowed) {
    return deny(
      "This document is not available from this link. Prime 1 issues the agreement packet only after the broker approves an application. Review copies are on https://www.prime1realty.net/join#materials.",
    );
  }
  const meta = fileFor(f!)!;
  const file = await readDocFile(meta.file);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${meta.name.replace(/[^\x20-\x7e]/g, "")}"`,
      "Cache-Control": isReviewSlug(f) ? "public, max-age=3600" : "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

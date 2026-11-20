import { docFileName, isDocSlug, readDoc, verifyDocsToken } from "@/lib/onboarding-docs";

/** Signed download of one onboarding PDF: /api/agent-docs?f=<slug>&t=<token> */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const f = u.searchParams.get("f");
  if (!isDocSlug(f)) return new Response("Not found", { status: 404 });
  if (!verifyDocsToken(u.searchParams.get("t"))) {
    return new Response("This download link has expired. Email antony@prime1realty.net or call (813) 295-8215 for a new copy.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const file = await readDoc(f);
  const name = docFileName(f);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${name.replace(/[^\x20-\x7e]/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

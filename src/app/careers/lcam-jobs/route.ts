/** The part-time LCAM opening was filled (Nov 2026). 410 Gone tells search engines and job boards to drop it. */
export function GET() {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Position filled | Prime 1 Property Management</title><body style="font-family:Arial,sans-serif;max-width:560px;margin:60px auto;padding:0 16px;line-height:1.6"><h1>This position has been filled</h1><p>Prime 1 Property Management's part-time Licensed Community Association Manager opening is no longer accepting applications. Thank you for your interest.</p><p><a href="/">Prime 1 Realty home</a></p></body>`,
    { status: 410, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" } },
  );
}

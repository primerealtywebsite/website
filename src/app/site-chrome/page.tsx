import type { Metadata } from "next";

/**
 * Renders only the shared layout (header, footer, mobile action bar). The MLS home-search proxy
 * (src/app/api/idx) reads this page and swaps its header and footer into the old MLS app's pages, so the
 * menu is identical on every page of the site. Not for visitors or search engines.
 */
export const metadata: Metadata = { title: "Site chrome", robots: { index: false, follow: false } };

export default function SiteChrome() {
  return null;
}

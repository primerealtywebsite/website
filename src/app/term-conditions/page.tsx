import Link from "next/link";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Terms & Conditions | Prime 1 Realty",
  description: "Terms and conditions for using the Prime 1 Realty website, including listing information, MLS data, owner and resident portals, forms and online tools.",
  path: "/term-conditions",
});

export default function Terms() {
  return (
    <LegalPage title="Terms & Conditions" path="/term-conditions" effective="November 18, 2026">
      <h2>1. Website ownership</h2>
      <p>This website is operated by {site.name}, {site.address.street}, {site.address.city}, {site.address.region} {site.address.postal}.</p>
      <h2>2. Copyright and trademarks</h2>
      <p>Content, logos and the Prime 1 name are protected. You may not copy or reuse them without permission.</p>
      <h2>3. Privacy</h2>
      <p>Your use of this site is also governed by our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
      <h2>4. Permitted use</h2>
      <p>Use this site for lawful, personal purposes only. Scraping, automated data harvesting and reverse engineering are prohibited.</p>
      <h2>5. Portals and accounts</h2>
      <p>Owner, resident, association and agent portals are provided by third parties and subject to their terms. Keep your login credentials secure.</p>
      <h2>6. Listing information</h2>
      <p>Listing information is provided for consumers&rsquo; personal, non-commercial use, is deemed reliable but not guaranteed, and should be independently verified. Listings are subject to prior sale, change or withdrawal. Some listing data is provided through the Internet Data Exchange program of {site.mls}.</p>
      <h2>7. Tools and estimates</h2>
      <p>Calculators, value ranges and market commentary are estimates for information only and are not appraisals, loan offers or legal, tax or financial advice.</p>
      <h2>8. External links</h2>
      <p>We are not responsible for content on linked third-party sites.</p>
      <h2>9. Limitation of liability</h2>
      <p>To the extent permitted by law, we are not liable for damages arising from your use of this site.</p>
      <h2>10. Termination</h2>
      <p>We may restrict or terminate access to the site for misuse, including scraping of listing data.</p>
      <h2>11. Governing law</h2>
      <p>These terms are governed by the laws of the State of Florida.</p>
      <h2>12. Fair housing</h2>
      <p>{site.name} is committed to equal housing opportunity and complies with federal and Florida fair housing laws.</p>
      <h2>13. Changes</h2>
      <p>We may update these terms and will post the new effective date on this page.</p>
      <h2>14. Contact</h2>
      <p>Phone {site.phone.display}. Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  );
}

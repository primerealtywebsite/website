import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy Policy | Prime 1 Realty",
  description: "How Prime 1 Realty and Prime 1 Property Management collect, use and protect information, including SMS, cookies, Meta Pixel and portal use.",
  path: "/privacy-policy",
});

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy-policy" effective="November 18, 2026">
      <p>This policy explains how {site.name} and {site.pmName} (DBAs of {site.legalName}), &ldquo;we&rdquo; or &ldquo;us,&rdquo; collect, use and share information when you use {site.url.replace("https://", "")} and related services.</p>
      <h2>1. Information we collect</h2>
      <ul>
        <li>Information you provide, such as your name, phone number, email, property address and answers you give in our forms and questionnaires.</li>
        <li>Information collected automatically, such as IP address, browser and device type, pages viewed, referring URLs and interactions with buttons and forms.</li>
        <li>Information from service providers, such as listing data from the MLS and portal activity from our property management software.</li>
      </ul>
      <h2>2. How we use information</h2>
      <ul>
        <li>To respond to your requests, prepare property analyses, proposals and home matches, and provide real estate and management services.</li>
        <li>To communicate with you by phone, email and, with your consent, text message.</li>
        <li>To measure and improve our website and advertising.</li>
        <li>To comply with law and protect our rights.</li>
      </ul>
      <h2>3. How we share information</h2>
      <p>We do not sell your personal information. We share it with service providers that help us operate, such as email delivery, CRM and transaction management tools, property management portals, analytics and advertising platforms, and with parties to your transaction (for example, lenders or title companies) when you ask us to.</p>
      <h2>4. SMS communications</h2>
      <p>If you opt in to text messages, we may send messages about your request. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase. Mobile opt-in data and consent are not shared with third parties for their marketing purposes.</p>
      <h2>5. Cookies, pixels and advertising</h2>
      <p>We use cookies and similar technologies, including the Meta Pixel and the Meta Conversions API, to understand how visitors use our site and to measure and improve our ads on Facebook and Instagram. When you submit a form, we may send a hashed (encrypted) version of your email and phone number to Meta to measure ad performance. You can control cookies in your browser and adjust ad preferences in your Meta account settings.</p>
      <h2>6. Data security</h2>
      <p>We use reasonable administrative, technical and physical safeguards. No method of transmission or storage is completely secure.</p>
      <h2>7. Your choices</h2>
      <p>You may ask us to access, correct or delete personal information we hold about you, subject to legal and recordkeeping requirements, by contacting us below.</p>
      <h2>8. Portals</h2>
      <p>Owner, resident and association portals are provided through third-party property management software and are subject to that provider&rsquo;s terms and privacy policy.</p>
      <h2>9. Third-party links</h2>
      <p>Our site links to other websites. We are not responsible for their privacy practices.</p>
      <h2>10. Changes</h2>
      <p>We may update this policy and will post the new effective date on this page.</p>
      <h2>11. Contact</h2>
      <p>{site.name}, {site.address.street}, {site.address.city}, {site.address.region} {site.address.postal}. Phone {site.phone.display}. Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  );
}

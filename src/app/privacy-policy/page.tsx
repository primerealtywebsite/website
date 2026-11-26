import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy Policy | Prime 1 Realty & Property Management",
  description: "How Prime 1 Realty and Prime 1 Property Management collect, use and protect information: forms, uploads, analytics, advertising, portals and payments.",
  path: "/privacy-policy",
});

/**
 * Must reflect the systems actually in use (Antony's review, 26 Nov 2026). Update this page whenever a
 * tracking, advertising, email, payment or portal provider is added or removed.
 */
export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy-policy" effective="November 26, 2026">
      <p>This policy explains how {site.name} and {site.pmName}, DBAs of {site.legalName} (&ldquo;we&rdquo; or &ldquo;us&rdquo;), collect, use and share information when you use {site.url.replace("https://", "")}, our home search and related services.</p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><b>Information you provide</b> in our forms: your name, phone number, email, property address and the answers you give (for example, buying, selling, rental, valuation, commercial and association management requests).</li>
        <li><b>Documents you upload</b>, such as an association&rsquo;s request for proposal (RFP) or supporting documents, and a résumé submitted with an employment application.</li>
        <li><b>Application information</b>: real estate agents applying to affiliate with {site.name} provide license, production and contact details; candidates applying for employment with {site.pmName} provide their Florida CAM license number, experience, employment preference and availability.</li>
        <li><b>Information collected automatically</b>, such as IP address, browser and device type, pages viewed, referring pages, advertising click identifiers and interactions with buttons and forms.</li>
        <li><b>Information from service providers</b>, such as MLS listing data and portal activity from our property management software.</li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>To respond to your requests, prepare property analyses, proposals and home matches, and provide real estate and community association management services.</li>
        <li>To review agent affiliation applications and employment applications.</li>
        <li>To contact you by phone and email about your request.</li>
        <li>To measure and improve our website and advertising.</li>
        <li>To comply with law and protect our rights.</li>
      </ul>

      <h2>3. How we share information</h2>
      <p>We do not sell your personal information. We share it only with service providers that help us operate, with parties to your transaction (for example, lenders or title companies) when you ask us to, and when required by law. Our service providers include:</p>
      <ul>
        <li><b>Website hosting</b> (Vercel) and <b>email delivery</b> (Resend and Google Workspace), which carry form submissions and uploaded documents to our office.</li>
        <li><b>MLS home search</b>: listing data is provided through the Internet Data Exchange program of Stellar MLS. Home search pages use Google Maps and Google reCAPTCHA (spam protection).</li>
        <li><b>Property management software</b> (Buildium) for owner, resident and association portals and rental applications.</li>
        <li><b>Commercial real estate software</b> (Buildout) for commercial listings and commercial inquiries only.</li>
        <li><b>Online payments</b> (Stripe), used only by approved real estate agents paying the onboarding fee. We do not receive or store full card numbers.</li>
        <li><b>Analytics and advertising platforms</b> described in section 5.</li>
      </ul>

      <h2>4. Phone, email and text messages</h2>
      <p>We contact you by phone or email about the request you submitted. Our office line, {site.phone.display}, is for calls only and does not send or receive text messages, and this website does not enroll you in text messaging. If you ever choose to receive text messages from us, message frequency varies, message and data rates may apply, you can reply STOP to opt out or HELP for help, and consent is never a condition of purchase. Mobile opt-in data and consent are not shared with third parties for their marketing purposes.</p>

      <h2>5. Cookies, analytics and advertising</h2>
      <p>We use cookies, pixels and similar technologies to understand how visitors use our site and to measure and improve our advertising:</p>
      <ul>
        <li><b>Google Analytics</b> and the <b>Google Ads</b> tag (including conversion measurement and enhanced conversions).</li>
        <li><b>Meta Pixel</b> and the <b>Meta Conversions API</b> (Facebook and Instagram advertising).</li>
        <li><b>Microsoft Clarity</b>, which records how visitors scroll and click (session replays and heatmaps) so we can improve the site. Clarity masks form entries.</li>
        <li><b>Microsoft Advertising</b> (UET tag), when we advertise on Bing.</li>
      </ul>
      <p>When you submit a form, we may send a hashed (one-way encrypted) version of your email and phone number to Google and Meta to measure ad performance. You can control cookies in your browser, opt out of personalized Google ads at adssettings.google.com, and adjust ad preferences in your Meta account settings.</p>

      <h2>6. Data security and retention</h2>
      <p>We use reasonable administrative, technical and physical safeguards. No method of transmission or storage is completely secure. We keep information as long as needed for the purpose it was collected and for legal and recordkeeping requirements. Employment applications and résumés are kept on file for future employment consideration.</p>

      <h2>7. Your choices</h2>
      <p>You may ask us to access, correct or delete personal information we hold about you, subject to legal and recordkeeping requirements, by contacting us below.</p>

      <h2>8. Portals</h2>
      <p>Owner, resident and association portals and rental applications are provided through third-party property management software and are subject to that provider&rsquo;s terms and privacy policy.</p>

      <h2>9. Third-party links</h2>
      <p>Our site links to other websites. We are not responsible for their privacy practices.</p>

      <h2>10. Changes</h2>
      <p>We may update this policy and will post the new effective date on this page.</p>

      <h2>11. Contact</h2>
      <p>
        {site.legalName}, d/b/a {site.name} and {site.pmName}, {site.address.street}, {site.address.city}, {site.address.region} {site.address.postal}. Phone {site.phone.display}. Email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}

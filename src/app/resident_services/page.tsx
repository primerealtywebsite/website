import { TrackedLink } from "@/components/analytics/Tracked";
import { ViewContent } from "@/components/analytics/ViewContent";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { FaqList, Section } from "@/components/sections/Blocks";
import { IconArrow, IconDoc, IconKey, IconLock, IconPhone, IconWrench } from "@/components/icons";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";
import type { StandardEvent } from "@/lib/meta";

export const metadata = pageMeta({
  title: "Resident Services: Pay Rent & Maintenance | Prime 1 Tampa",
  description: "Prime 1 residents: pay rent online, submit maintenance requests 24/7, apply for a rental, review resident criteria and find move-in and move-out resources.",
  path: "/resident_services",
});

const FAQS = [
  { q: "How do I apply for a rental?", a: "Apply online through the Prime 1 rental application. Please review the resident criteria first." },
  { q: "What documents do I need to apply?", a: "Typically a government-issued ID, proof of income and rental history. The resident criteria lists the full requirements." },
  { q: "How do I pay rent?", a: "Log in to the resident portal to pay rent online and view your balance." },
  { q: "How do I submit a maintenance request?", a: "Submit requests anytime through the resident portal. For emergencies such as flooding, fire or no heat or air in extreme temperatures, call 911 if anyone is in danger, then call the office." },
  { q: "Do I need to complete pet screening?", a: "Yes. All applicants complete the pet screening form, even if they do not have a pet." },
  { q: "When is rent due and is there a grace period?", a: "Rent due dates, grace periods and late fees are set in your lease. Check your lease or contact the office." },
  { q: "How do I give notice to move out?", a: "Provide written notice as required by your lease. Contact the office to confirm the required notice period and move-out instructions." },
  { q: "How is my security deposit handled?", a: "Deposits are handled as required by Florida law and your lease. After move-out, you will receive written notice about your deposit at your forwarding address." },
];

export default function ResidentServices() {
  const tiles: { icon: typeof IconLock; t: string; d: string; href: string; event?: StandardEvent; custom?: string }[] = [
    { icon: IconLock, t: "Resident login", d: "Pay rent and submit maintenance requests", href: site.portals.resident, custom: "PortalLogin" },
    { icon: IconKey, t: "Rental application", d: "Apply online in minutes", href: site.portals.rentalApplication, custom: "RentalApplicationClick" },
    { icon: IconDoc, t: "Resident criteria (PDF)", d: "Requirements before you apply", href: "/resident-criteria.pdf", custom: "ResidentCriteria" },
    { icon: IconWrench, t: "Pet screening", d: "Required for all applicants", href: site.portals.petScreening, custom: "PetScreening" },
  ];
  return (
    <>
      <ViewContent category="resident_services" name="Resident services" />
      <section className="bg-ink py-10 text-white md:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: "Rent", href: "/rent" }, { label: "Resident services", href: "/resident_services" }]} tone="dark" />
          <h1 className="mt-5 text-[2.3rem] leading-tight md:text-5xl">Resident services</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">A smooth rental experience: secure online payments, 24/7 maintenance requests and move-in and move-out coordination.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((t) => (
              <TrackedLink key={t.t} href={t.href} event={t.event} custom={t.custom} params={{ cta_location: "resident_tiles", type: undefined }} className="group flex flex-col rounded-xl bg-white p-5 text-ink transition hover:-translate-y-0.5">
                <span className="grid size-11 place-items-center rounded-lg bg-red-soft text-red"><t.icon size={22} /></span>
                <span className="mt-4 font-bold">{t.t}</span>
                <span className="text-sm text-muted">{t.d}</span>
                <IconArrow size={18} className="mt-3 text-red transition group-hover:translate-x-1" />
              </TrackedLink>
            ))}
          </div>
        </div>
      </section>
      <Section tone="white">
        <h2 className="text-3xl">Moving resources</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["USPS change of address", "https://moversguide.usps.com/"],
            ["Florida DMV address change", "https://www.flhsmv.gov/name-and-address-changes/"],
            ["Utilities set-up", "https://citizenhomesolutions.com/#residents"],
          ].map(([t, h]) => (
            <li key={t}>
              <a href={h} target="_blank" rel="noopener" className="card flex items-center justify-between p-5 font-semibold hover:shadow-[var(--shadow-lift)]">
                {t} <IconArrow size={18} className="text-red" />
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl bg-paper p-5">
          <IconPhone className="text-red" />
          <span>Questions about your lease or account? Call</span>
          <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "resident_services" }} className="font-bold underline">{site.phone.display}</TrackedLink>
          <span>or email</span>
          <TrackedLink href={`mailto:${site.email}`} event="Contact" params={{ method: "email", cta_location: "resident_services" }} className="font-bold underline">{site.email}</TrackedLink>
        </div>
      </Section>
      <Section tone="paper">
        <FaqList faqs={FAQS} title="Resident FAQ" />
      </Section>
    </>
  );
}

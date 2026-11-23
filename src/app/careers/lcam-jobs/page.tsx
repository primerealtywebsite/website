import { ViewContent } from "@/components/analytics/ViewContent";
import { TrackedLink } from "@/components/analytics/Tracked";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { CheckList, FaqList, Heading, Section } from "@/components/sections/Blocks";
import { JsonLd } from "@/components/sections/JsonLd";
import { LcamForm } from "@/components/careers/LcamForm";
import { IconCheck, IconPhone } from "@/components/icons";
import { site } from "@/config/site";
import { LCAM_JOB as J } from "@/content/lcam";
import { ORG_ID } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Part-Time LCAM Jobs Tampa | $30/Hour, Up to 20 Hrs/Week | Prime 1",
  description: "Prime 1 Property Management is hiring licensed Florida community association managers (LCAM): part-time, $30 an hour, up to 20 hours a week in Tampa Bay. Apply online.",
  path: J.path,
});

const jobPosting = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: J.title,
  description: `<p>${J.summary}</p><p><b>Responsibilities</b></p><ul>${J.duties.map((d) => `<li>${d}</li>`).join("")}</ul><p><b>Requirements</b></p><ul>${J.requirements.map((r) => `<li>${r}</li>`).join("")}</ul>`,
  datePosted: J.posted,
  validThrough: "2027-05-22T23:59",
  employmentType: "PART_TIME",
  workHours: "Up to 20 hours per week",
  baseSalary: { "@type": "MonetaryAmount", currency: "USD", value: { "@type": "QuantitativeValue", value: J.hourlyRate, unitText: "HOUR" } },
  hiringOrganization: { "@type": "Organization", "@id": ORG_ID, name: "Prime 1 Property Management", sameAs: site.url, logo: `${site.url}/icon-512.png` },
  jobLocation: {
    "@type": "Place",
    address: { "@type": "PostalAddress", streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.region, postalCode: site.address.postal, addressCountry: "US" },
  },
  qualifications: "Active Florida Community Association Manager (CAM) license",
  industry: "Community association management",
  directApply: true,
  url: `${site.url}${J.path}`,
};

export default function LcamJobs() {
  return (
    <>
      <ViewContent category="careers" name="LCAM jobs" />
      <JsonLd data={jobPosting} />

      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[520px] rounded-full bg-red/20 blur-3xl" />
        <div className="container-x relative grid gap-8 py-8 md:py-14 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
          <div className="lg:pt-4">
            <Breadcrumbs items={[{ label: "Careers", href: "/careers" }, { label: "LCAM jobs", href: J.path }]} tone="dark" />
            <p className="eyebrow mt-5 text-[#ff5a5a]">Now hiring · Prime 1 Property Management</p>
            <h1 className="mt-3 text-[2.05rem] leading-[1.06] md:text-[3.1rem]">Part-time LCAM. $30 an hour, up to 20 hours a week.</h1>
            <p className="mt-4 max-w-xl text-[1.02rem] text-white/80 md:text-lg">{J.summary}</p>
            <dl className="mt-6 grid gap-2.5 sm:grid-cols-2 md:max-w-xl">
              {J.facts.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <dt className="text-[0.78rem] uppercase tracking-wider text-white/60">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "lcam_hero" }} className="inline-flex items-center gap-2 font-semibold text-white">
                <IconPhone size={18} /> {site.phone.display}
              </TrackedLink>
              <span className="inline-flex items-center gap-2 text-white/80"><IconCheck size={16} className="text-red" /> Reviewed by our Designated CAM</span>
            </div>
          </div>
          <LcamForm />
        </div>
      </section>

      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Heading eyebrow="The role" title="What you'll do" />
            <CheckList className="mt-6" items={J.duties} />
          </div>
          <div>
            <Heading eyebrow="Requirements" title="What you need" />
            <CheckList className="mt-6" items={J.requirements} />
          </div>
        </div>
      </Section>

      <FaqList faqs={J.faqs} eyebrow="LCAM position" />

      <Section tone="white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-muted">Prime 1 Property Management is a licensed Florida community association management firm managing HOAs and condominium associations from 11 units up across Tampa Bay.</p>
          <a href="#apply" className="btn btn-red">Apply now</a>
        </div>
      </Section>
    </>
  );
}

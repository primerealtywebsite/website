import Link from "next/link";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { Answer, BrokerCard, CheckList, CtaBand, Heading, Photo, Section } from "@/components/sections/Blocks";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About Prime 1 Realty | Florida Brokerage & Association Management",
  description: "Prime 1 Realty is a licensed Florida real estate brokerage and Prime 1 Property Management a licensed Florida CAM firm. Both are headquartered in Tampa and serve clients throughout Florida.",
  path: "/about-us",
});

export default function About() {
  return (
    <>
      <section className="bg-ink py-12 text-white md:py-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Breadcrumbs items={[{ label: "About", href: "/about-us" }]} tone="dark" />
            <p className="eyebrow mt-6 text-[#ff5a5a]">About Prime 1</p>
            <h1 className="mt-3 text-[2.3rem] leading-[1.08] md:text-[3.4rem]">One Florida firm for every stage of real estate</h1>
            <p className="mt-5 max-w-lg text-lg text-white/75">Buying, selling, leasing and managing property usually means juggling several companies. Prime 1 brings brokerage and association management under one accountable team, headquartered in Tampa and serving clients throughout Florida.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/get-started" className="btn btn-red">Get started</Link>
              <Link href="/lets-connect" className="btn btn-ghost text-white">Contact us</Link>
            </div>
          </div>
          <Photo src="/images/areas/tampa-downtown-skyline.jpg" alt="Downtown Tampa skyline, headquarters city of Prime 1 Realty" ratio="5/4" priority />
        </div>
      </section>

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <Answer question="Who we are">
            {site.name} is a licensed Florida real estate brokerage. {site.pmName} is a licensed Florida community association management firm. Both are headquartered in Tampa and serve clients throughout Florida. Both are DBAs of {site.legalName}, and both are led by Antony Oseitutu, Broker of Record and Designated CAM.
          </Answer>
        </div>
      </Section>

      <Section tone="paper">
        <Heading eyebrow="What we do" title="Three service areas. One accountable team." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { t: "Residential", items: ["Buy a home", "Sell a home", "Rent a home", "Mortgage calculator"], href: "/residential" },
            { t: "Commercial", items: ["Acquisitions & dispositions", "Investment sales", "Leasing & tenant representation", "Owner's representation"], href: "/commercial" },
            { t: "Association management", items: ["HOA & condominium associations", "Commercial owners' associations & office parks", "Qualifying rental portfolios", "Owner & resident portals"], href: "/property_management" },
          ].map((c) => (
            <div key={c.t} className="card p-6">
              <h3 className="text-2xl">{c.t}</h3>
              <CheckList className="mt-4" items={c.items} />
              <Link href={c.href} className="mt-6 inline-block font-bold text-red hover:underline">Explore {c.t.toLowerCase()} →</Link>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <Heading eyebrow="The Prime 1 approach" title="How we work" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["One team", "Brokerage and management under one roof, so nothing falls between companies."],
            ["Clear paths", "Every client gets a defined next step and a named point of contact."],
            ["Statewide reach", "Headquartered in Tampa's Centro Ybor, serving clients throughout Florida."],
            ["Direct access", "Clients can reach the Broker of Record directly."],
          ].map(([t, b]) => (
            <div key={t} className="rounded-[var(--radius-card)] border border-line p-6">
              <h3 className="text-xl">{t}</h3>
              <p className="mt-2 text-muted">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <BrokerCard heading="Meet the broker behind Prime 1" />
      </Section>

      <CtaBand title="Tell us what you need" body="We'll match you with the right licensed professional." primary={{ label: "Get started", href: "/get-started" }} location="about_cta_band" />
    </>
  );
}

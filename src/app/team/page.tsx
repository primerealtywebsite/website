import Image from "next/image";
import Link from "next/link";
import { TrackedLink } from "@/components/analytics/Tracked";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { CtaBand, Heading, Section } from "@/components/sections/Blocks";
import { people, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Our Team | Prime 1 Realty & Property Management, Tampa",
  description: "Meet the Prime 1 team: Broker of Record and Designated CAM Antony Oseitutu and Licensed Community Association Manager Jennifer Rivera.",
  path: "/team",
});

function Initials({ name }: { name: string }) {
  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-ink-3 to-ink font-display text-6xl text-white">
      {name.split(" ").map((n) => n[0]).join("")}
    </div>
  );
}

export default function Team() {
  const list = [people.antony, people.jennifer];
  return (
    <>
      <section className="bg-paper pb-4 pt-10 md:pt-14">
        <div className="container-x">
          <Breadcrumbs items={[{ label: "Team", href: "/team" }]} />
          <h1 className="mt-5 text-[2.3rem] leading-tight md:text-5xl">Who you will work with</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">Licensed professionals who answer to you, backed by a Broker of Record you can reach directly.</p>
        </div>
      </section>
      <Section tone="paper" className="!pt-8">
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((p) => (
            <Link key={p.slug} href={`/team/${p.slug}`} className="card group grid overflow-hidden sm:grid-cols-[200px_1fr]">
              <div className="relative aspect-square bg-sand sm:aspect-auto sm:min-h-[240px]">
                {p.image ? <Image src={p.image} alt={`${p.name}, ${p.role}`} fill sizes="200px" className="object-cover object-top" /> : <Initials name={p.name} />}
              </div>
              <div className="p-6">
                <h2 className="text-2xl group-hover:underline">{p.name}</h2>
                <p className="mt-1 font-semibold text-red">{p.role}</p>
                <p className="mt-3 line-clamp-4 text-muted">{p.bio[0]}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <Section tone="white" id="residentialagents">
        <div className="grid gap-6 md:grid-cols-2" id="commercialagents">
          <div className="rounded-[var(--radius-card)] border border-line p-6">
            <Heading as="h3" title="We're growing our agent team" intro="Prime 1 is recruiting residential and commercial agents. Self-generated residential is 85/15 until a $15,000 cap, then 100%. Work anywhere in Florida." />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/careers" className="btn btn-ink">See the agent offer</Link>
              <TrackedLink href="/join" className="btn btn-ghost">Apply to join</TrackedLink>
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line p-6">
            <Heading as="h3" title="Need help today?" intro="Talk to the Broker of Record about buying, selling, leasing or management." />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/get-started" className="btn btn-red">Get started</Link>
              <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "team" }} className="btn btn-ghost">Call {site.phone.display}</TrackedLink>
            </div>
          </div>
        </div>
      </Section>
      <CtaBand title="Work with a team that answers to you" body="One accountable firm for buying, selling, renting and management." primary={{ label: "Get started", href: "/get-started" }} location="team_cta_band" />
    </>
  );
}

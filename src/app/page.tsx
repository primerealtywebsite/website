import Image from "next/image";
import Link from "next/link";
import { FunnelHero } from "@/components/sections/ServicePage";
import { Answer, BrokerCard, CheckList, CtaBand, FaqList, Heading, Photo, Section, Steps } from "@/components/sections/Blocks";
import { Reveal } from "@/components/sections/Reveal";
import { IconArrow, IconBadge, IconBuilding, IconBuy, IconCheck, IconClock, IconCommunity, IconKey, IconPin, IconSell } from "@/components/icons";
import { AREAS } from "@/content/areas";
import { POSTS } from "@/content/blog";
import { pageMeta } from "@/lib/seo";
import { FAQS, HOME, PATHS } from "@/content/home";

export const metadata = pageMeta({
  title: "Prime 1 Realty | Florida Real Estate & Association Management",
  description:
    "Licensed Florida real estate brokerage and community association management firm, headquartered in Tampa. Buy, sell, lease or request a management proposal.",
  path: "/",
});

const PATH_ICONS = { Sell: IconSell, Buy: IconBuy, Key: IconKey, Community: IconCommunity, Building: IconBuilding, Badge: IconBadge };

export default function Home() {
  const posts = [...POSTS].sort((a, b) => b.published.localeCompare(a.published)).slice(0, 3);
  return (
    <>
      <FunnelHero
        eyebrow="Florida real estate brokerage & community association management"
        h1={HOME.h1}
        lede={HOME.lede}
        image="/images/blog/modern-florida-luxury-home-pool.jpg"
        imageAlt="Modern Florida home with a pool and palm trees"
        bullets={HOME.bullets}
        secondary={{ label: "What's my home worth? Free value range", href: "/home-valuation" }}
        funnelTitle="Free · 60 seconds"
      />

      {/* Trust strip */}
      <div className="border-b border-line bg-white">
        <div className="container-x grid grid-cols-2 gap-4 py-6 text-sm md:grid-cols-4">
          {[
            [IconCheck, "Licensed FL brokerage", "Residential & commercial"],
            [IconCommunity, "Licensed CAM firm", "Associations throughout Florida"],
            [IconPin, "Headquartered in Tampa", "Serving clients throughout Florida"],
            [IconClock, "Office Mon–Fri, 9–5 ET", "24/7 live answering for association emergencies"],
          ].map(([Icon, t, s]) => {
            const I = Icon as typeof IconCheck;
            return (
              <div key={t as string} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-soft text-red">
                  <I size={20} />
                </span>
                <span>
                  <span className="block font-bold">{t as string}</span>
                  <span className="block text-muted">{s as string}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Choose your path */}
      <Section>
        <Heading eyebrow="Choose your path" title="What brings you to Prime 1 today?" intro="Every path ends with a licensed professional and a concrete next step. Pick yours." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((p, i) => {
            const PathIcon = PATH_ICONS[p.icon];
            return (
            <Reveal key={p.href} delay={(i % 3) * 0.06}>
              <Link href={p.href} className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                  <Image src={p.image} alt={p.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute left-4 top-4 grid size-11 place-items-center rounded-lg bg-white text-red shadow">
                    <PathIcon size={22} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-2xl">{p.title}</h3>
                  <p className="mt-2 flex-1 leading-relaxed text-muted">{p.body}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-bold text-red">
                    {p.cta} <IconArrow size={18} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <Answer question={HOME.whoQ}>
            {HOME.whoA}
          </Answer>
        </div>
      </Section>

      {/* Seller spotlight */}
      <Section tone="paper">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <Photo src="/images/sell/two-story-home-front-lawn.jpg" alt="Two-story Florida home with a front lawn" ratio="5/4" />
          </Reveal>
          <div>
            <Heading eyebrow="Thinking of selling?" title="Know your number before you list" intro="Homes priced right from day one tend to sell faster and closer to asking. Get a broker-prepared value range built from real nearby sales, free and with no obligation." />
            <CheckList className="mt-6" items={["Recent comparable sales near your home", "The listings you'd compete with today", "A pricing range with the reasoning explained"]} />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/home-valuation" className="btn btn-red">
                What&apos;s my home worth? <IconArrow size={18} />
              </Link>
              <Link href="/sell-your-home" className="btn btn-ghost">How we sell homes</Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Management spotlight */}
      <Section tone="ink">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Heading tone="dark" eyebrow="For association boards throughout Florida" title="Request an Association Management Proposal" intro="For homeowners associations, condominium associations, commercial property owners' associations and office parks. Prime 1 Property Management is a licensed Florida CAM firm led by a Designated CAM." />
            <CheckList tone="dark" className="mt-6 text-white/90" items={["Inspections and board reporting", "Budget and financial reporting support", "Vendor oversight and Florida compliance deadlines", "Online portal for payments, requests and documents", "Attach your existing RFP"]} />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/property_management#start" className="btn btn-red">
                Request an Association Management Proposal <IconArrow size={18} />
              </Link>
              <Link href="/blog/florida-designated-cam-license-explained" className="btn btn-ghost text-white">Why a Designated CAM matters</Link>
            </div>
          </div>
          <Reveal>
            <Photo src="/images/blog/florida-waterfront-condo-community-aerial.jpg" alt="Aerial view of a waterfront condominium community managed in Florida" ratio="4/3" />
          </Reveal>
        </div>
      </Section>

      <Section tone="paper">
        <Heading eyebrow="How it works" title="Three steps, then a real conversation" />
        <Steps
          steps={[
            { title: "Answer a few questions", body: "Tell us what you need. It takes about a minute and there's no obligation." },
            { title: "Get your next step", body: "A licensed professional sends your property analysis, matching homes or proposal." },
            { title: "Decide with confidence", body: "Talk it through by phone or at our Tampa headquarters. You stay in control." },
          ]}
        />
      </Section>

      <Section tone="white">
        <BrokerCard heading="Talk to the broker, not a call center" />
      </Section>

      {/* Areas */}
      <Section tone="sand">
        <Heading eyebrow="Local market guides" title="Serving all of Florida, with local guides close to home" intro="We work with clients throughout Florida. These guides cover neighborhoods, flood and insurance tips and HOA details near our Tampa headquarters." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {AREAS.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.05}>
              <Link href={`/areas/${a.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-ink">
                <Image src={a.image} alt={a.imageAlt} fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="block font-display text-2xl">{a.name}</span>
                  <span className="text-sm text-white/75">{a.county}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Insights */}
      <Section tone="paper">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading eyebrow="Insights" title="Real estate guidance for Florida" />
          <Link href="/blog" className="font-bold text-red hover:underline">All articles →</Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card group overflow-hidden transition hover:-translate-y-1">
              <div className="relative aspect-[16/10] bg-sand">
                <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-red">{p.category}</p>
                <h3 className="mt-2 text-xl leading-snug group-hover:underline">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.readMins} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <FaqList faqs={FAQS} />
      </Section>

      {/* Agents band */}
      <section className="border-y border-line bg-paper py-12">
        <div className="container-x flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="eyebrow">For experienced Florida agents</p>
            <h2 className="mt-2 text-3xl">Join Prime 1: 85/15 to a $15,000 cap, then 100%. Anywhere in Florida.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/join" className="btn btn-ink">Join Prime 1</Link>
          </div>
        </div>
      </section>

      <CtaBand title="Ready when you are" body="Answer a few questions or call the office, Monday to Friday, 9 to 5 ET." primary={{ label: "Get started", href: "/get-started" }} location="home_cta_band" />
    </>
  );
}

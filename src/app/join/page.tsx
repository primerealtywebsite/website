import Image from "next/image";
import { TrackedLink } from "@/components/analytics/Tracked";
import { ViewContent } from "@/components/analytics/ViewContent";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { Heading, Section } from "@/components/sections/Blocks";
import { JoinForm } from "@/components/join/JoinForm";
import { CalendlyEmbed } from "@/components/join/CalendlyEmbed";
import { IconArrow, IconCalendar, IconCheck, IconMail, IconPhone } from "@/components/icons";
import { people, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";
import { JOIN_STATS as STATS } from "@/content/careers";

export const metadata = pageMeta({
  title: "Join Prime 1 Realty | Apply Online or Book a Call with the Broker",
  description: "Experienced Florida agents: apply to Prime 1 Realty in 2 minutes. 85% agent share, $15,000 cap, $5,000 Producer Advantage bonus. Or book a 30-minute call with Broker Antony Oseitutu.",
  path: "/join",
  image: "/og/prime1-join-og.jpg",
});



export default function Join() {
  const a = people.antony;
  return (
    <>
      <ViewContent category="careers" name="Join Prime 1" />

      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[520px] rounded-full bg-red/20 blur-3xl" />
        <div className="container-x relative grid gap-8 py-8 md:py-14 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
          <div className="lg:pt-4">
            <Breadcrumbs items={[{ label: "Careers", href: "/careers" }, { label: "Join", href: "/join" }]} tone="dark" />
            <p className="eyebrow mt-5 text-[#ff5a5a]">Join Prime 1 · Florida-licensed agents</p>
            <h1 className="mt-3 text-[2.05rem] leading-[1.06] md:text-[3.2rem]">Apply to join Prime 1 in 2 minutes.</h1>
            <p className="mt-4 max-w-xl text-[1.02rem] text-white/80 md:text-lg">
              For experienced residential agents with 6+ closings, and established commercial agents with sales and leasing experience. Antony, our Broker of Record, reviews every application personally. Prefer to talk first? Book a 30-minute call.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-2.5 md:max-w-lg">
              {STATS.map((s) => (
                <div key={s.l} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <dd className="font-display text-[1.45rem] leading-none md:text-[1.7rem]">{s.v}</dd>
                  <dt className="mt-1.5 text-[0.82rem] text-white/70">{s.l}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-6 hidden gap-3 lg:grid">
              {[
                ["Apply online", "Your license, brokerage, production and timing go straight to Antony, and your onboarding packet is emailed to you right away."],
                ["Or book a call", "Pick a time on Antony's calendar and ask anything about the split, leads, fees or your license transfer."],
              ].map(([t, b]) => (
                <div key={t} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-red text-white"><IconCheck size={14} /></span>
                  <p className="text-white/85"><b className="text-white">{t}.</b> {b}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <a href="#call" className="inline-flex items-center gap-2 font-semibold text-white underline decoration-red decoration-2 underline-offset-[6px]">
                <IconCalendar size={18} /> Book a call with Antony
              </a>
              <TrackedLink href={`mailto:${site.recruiting.email}`} event="Contact" params={{ method: "email", cta_location: "join_hero" }} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
                <IconMail size={18} /> {site.recruiting.email}
              </TrackedLink>
            </div>
          </div>
          <JoinForm />
        </div>
      </section>

      {/* The offer */}
      <Section tone="paper">
        <Heading eyebrow="The residential offer" title="Keep more of the business you generate" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["85% agent share", "On qualifying business you generate, with a $15,000 annual cap on the brokerage contribution."],
            ["$5,000 Producer Advantage", "For five qualifying residential closings in your first 120 days, plus $1,000 per qualifying residential seller closing in that period. Both apply to business you generate."],
            ["$355 transaction coordination", "A designated transaction coordinator on every file, $355 per file, per side."],
          ].map(([t, b]) => (
            <div key={t} className="card p-6">
              <h3 className="text-xl">{t}</h3>
              <p className="mt-2 text-muted">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Bonuses require qualifying closed transactions and separate written program terms. The executed Independent Contractor Agreement governs.</p>
      </Section>

      {/* Book a call */}
      <Section tone="white" id="call">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Heading eyebrow="Talk first" title="Book a 30-minute call with Antony" intro="Get your questions answered by the Broker of Record before you decide: the split and cap, company leads, fees, your license and MLS transfer, or commercial work." />
            <div className="mt-6 flex items-center gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-sand">
                <Image src={a.image} alt={a.name} fill sizes="64px" className="object-cover" />
              </div>
              <div>
                <p className="font-bold">{a.name}</p>
                <p className="text-sm text-muted">Owner &amp; Broker of Record, Prime 1 Realty</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 text-sm">
              <TrackedLink href={`mailto:${site.recruiting.email}`} event="Contact" params={{ method: "email", cta_location: "join_call" }} className="inline-flex items-center gap-2 font-semibold hover:underline">
                <IconMail size={18} className="text-red" /> {site.recruiting.email}
              </TrackedLink>
              <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "join_call" }} className="inline-flex items-center gap-2 font-semibold hover:underline">
                <IconPhone size={18} className="text-red" /> {site.phone.display} <span className="font-normal text-muted">({site.phone.answered})</span>
              </TrackedLink>
            </div>
          </div>
          <CalendlyEmbed location="join_page" className="rounded-[18px] bg-paper p-2 ring-1 ring-line sm:p-3" />
        </div>
      </Section>

      {/* How it works */}
      <Section tone="paper">
        <Heading eyebrow="How joining works" title="From application to your first company lead" />
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Apply", "Two minutes online. Your onboarding packet is emailed instantly."],
            ["Approve & sign", "Once approved, sign the Independent Contractor Agreement and affiliate your license."],
            ["Get set up", "Association/MLS, Agent Portal, MoxiWorks, SkySlope, company email and ADP."],
            ["Produce", "Finish the 14-day Producer Activation Program to qualify for company leads."],
          ].map(([t, b], i) => (
            <li key={t} className="card p-5">
              <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 text-xl">{t}</h3>
              <p className="mt-1 text-[0.95rem] text-muted">{b}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#apply" className="btn btn-red">Apply now <IconArrow size={18} /></a>
          <TrackedLink href="/careers" className="btn btn-ghost">See the full agent offer</TrackedLink>
        </div>
      </Section>
    </>
  );
}

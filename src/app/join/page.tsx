import Image from "next/image";
import { TrackedLink } from "@/components/analytics/Tracked";
import { ViewContent } from "@/components/analytics/ViewContent";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { Heading, Section } from "@/components/sections/Blocks";
import { JoinForm } from "@/components/join/JoinForm";
import { CalendlyEmbed } from "@/components/join/CalendlyEmbed";
import { IconArrow, IconCalendar, IconCheck, IconDoc, IconMail, IconPhone } from "@/components/icons";
import { people, site } from "@/config/site";
import { ONBOARDING_DOCS } from "@/lib/onboarding-docs";
import { pageMeta } from "@/lib/seo";
import { JOIN_STATS as STATS } from "@/content/careers";

export const metadata = pageMeta({
  title: "Join Prime 1 Realty | Apply Online or Book a Call with the Broker",
  description: "Florida agents: apply to Prime 1 Realty in 2 minutes with no interview and get the onboarding packet by email, or book a 30-minute call with Broker Antony Oseitutu.",
  path: "/join",
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
            <h1 className="mt-3 text-[2.05rem] leading-[1.06] md:text-[3.2rem]">Apply in 2 minutes. No interview required.</h1>
            <p className="mt-4 max-w-xl text-[1.02rem] text-white/80 md:text-lg">
              Send your details and your onboarding packet lands in your inbox right away. Prefer to talk first? Book a 30-minute call with Antony, our Broker of Record.
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
                ["Apply online", "Fill in the form. Your onboarding packet (agreement, handbook, checklist and more) is emailed to you instantly."],
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

      {/* What you receive */}
      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Heading eyebrow="Your onboarding packet" title="Everything you need, emailed the moment you apply" intro="Every applicant gets the full Prime 1 packet by email, plus download links on the confirmation screen. Review it at your own pace before you sign." />
          <ul className="grid gap-2 sm:grid-cols-2">
            {ONBOARDING_DOCS.map((d) => (
              <li key={d.slug} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-line">
                <IconDoc size={18} className="shrink-0 text-red" />
                <span className="text-[0.95rem] font-semibold">{d.title}</span>
              </li>
            ))}
          </ul>
        </div>
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
            ["Apply", "Two minutes online. Your packet is emailed instantly."],
            ["Review & sign", "Read the agreement and handbook. Antony coordinates your license transfer."],
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

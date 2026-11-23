import { JoinForm } from "@/components/join/JoinForm";
import { TrackedLink } from "@/components/analytics/Tracked";
import { ViewContent } from "@/components/analytics/ViewContent";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { BrokerCard, CheckList, FaqList, Heading, Section } from "@/components/sections/Blocks";
import { SplitCalculator } from "@/components/sections/SplitCalculator";
import { Reveal } from "@/components/sections/Reveal";
import { IconArrow, IconCheck } from "@/components/icons";
import { pageMeta } from "@/lib/seo";
import { FAQS, STATS } from "@/content/careers";

/** Offer facts mirror the former join.prime1realty.net terms (checked 2026-11-18). The executed ICA governs. Applications now run on /join. */

export const metadata = pageMeta({
  title: "Florida Real Estate Agent Careers | 85/15, $15K Cap | Prime 1",
  description: "Join Prime 1 Realty: 85% agent share with a $15,000 annual cap, then 100%. $5,000 Producer Advantage bonus, company leads and remote work anywhere in Florida.",
  path: "/careers",
  image: "/og/prime1-join-og.jpg",
});

export default function Careers() {
  return (
    <>
      <ViewContent category="careers" name="Agent careers" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[520px] rounded-full bg-red/20 blur-3xl" />
        <div className="container-x relative grid gap-8 py-8 md:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12">
          <div>
            <Breadcrumbs items={[{ label: "Careers", href: "/careers" }]} tone="dark" />
            <p className="eyebrow mt-5 text-[#ff5a5a]">Join Prime 1 · Florida-licensed agents</p>
            <h1 className="mt-3 text-[2.05rem] leading-[1.06] md:text-[3.4rem]">Residential and commercial. One brokerage.</h1>
            <p className="mt-4 max-w-xl text-[1.02rem] text-white/80 md:text-lg">
              85/15 with a $15,000 residential cap, then 100%. Production bonuses, company-generated leads and listing appointments. Work anywhere in Florida.
            </p>
            <dl className="mt-7 grid grid-cols-2 gap-3 md:max-w-xl">
              {STATS.map((s) => (
                <div key={s.l} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                  <dd className="font-display text-[1.7rem] leading-none md:text-3xl">{s.v}</dd>
                  <dt className="mt-2 text-sm font-semibold">{s.l}</dt>
                  <p className="mt-0.5 text-xs text-white/60">{s.s}</p>
                </div>
              ))}
            </dl>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#apply" className="btn btn-red">
                Apply in 2 minutes <IconArrow size={18} />
              </a>
              <TrackedLink href="/join#call" custom="RecruitingCallClick" params={{ cta_location: "careers_hero" }} className="btn btn-ghost text-white">Book a call with Antony</TrackedLink>
            </div>
            <p className="mt-3 text-sm text-white/60">For experienced agents: 6+ closings residential, or commercial sales and leasing. Antony reviews every application.</p>
          </div>
          <JoinForm />
        </div>
      </section>

      {/* Split calculator */}
      <Section tone="paper" id="the-split">
        <Heading eyebrow="The split" title="Residential: 85/15, then 100%" intro="Self-generated residential is 85/15 until $15,000 in Prime 1 splits, then 100% for the rest of your anniversary year. Commercial is 85/15 through $250,000 qualifying GCI, then 90/10. Run your own numbers." />
        <div className="mt-10">
          <SplitCalculator />
        </div>
      </Section>

      {/* Producer Advantage */}
      <Section tone="ink" id="producer-advantage">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Heading tone="dark" eyebrow="Prime 1 Producer Advantage" title="Earn more. Close more." intro="Bonuses for agents who produce early, plus company-generated opportunities as you ramp." />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="font-display text-4xl">$5,000</p>
                <p className="mt-1 text-white/75">For 5 qualifying residential closings in your first 120 days</p>
              </div>
              <div className="rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="font-display text-4xl">$1,000</p>
                <p className="mt-1 text-white/75">Per qualifying residential seller closing in your first 120 days</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/55">Producer Advantage Program. Both incentives apply to business you generate. Bonuses require qualifying closed transactions and separate written program terms. Not guaranteed.</p>
          </div>
          <div>
            <h3 className="text-2xl">Buyer and seller leads. Qualified listing appointments.</h3>
            <CheckList
              tone="dark"
              className="mt-5 text-white/90"
              items={[
                "Company-generated buyer and seller leads, including qualified listing appointments",
                "Sources: Prime 1 advertising, websites, direct mail, social and paid digital campaigns, company databases and referrals",
                "Company-funded photography, listing prep and marketing for approved company-generated listings",
                "Company-generated business pays 70/30, outside the 85/15 and the cap",
                "Eligibility after the 14-day Producer Activation Program",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Why Prime 1 */}
      <Section tone="white" id="why-prime-1">
        <Heading eyebrow="Why Prime 1" title="A brokerage built around your business" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Remote first", "Work from anywhere in Florida. The Tampa office is available when you want it, never required."],
            ["Residential and commercial", "Residential, commercial, leasing, investment and property management under one brokerage."],
            ["Direct broker access", "Antony Oseitutu, Broker of Record and Designated CAM, is available on residential and commercial matters."],
          ].map(([t, b], i) => (
            <Reveal key={t} delay={i * 0.05}>
              <div className="card h-full p-6">
                <h3 className="text-xl">{t}</h3>
                <p className="mt-2 text-muted">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Fees + tools */}
      <Section tone="paper" id="the-tools">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="card p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl">Clear, published fees</h2>
            <dl className="mt-5 divide-y divide-line">
              {[
                ["Onboarding (one-time)", "$149"],
                ["Technology & platform", "$59 / month"],
                ["Transaction coordination", "$355 per covered file, per side at settlement"],
                ["Desk fee", "None"],
                ["Franchise fee", "None"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 py-3">
                  <dt className="font-semibold">{k}</dt>
                  <dd className="text-right text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl">Streamlined technology</h2>
            <CheckList
              className="mt-5"
              items={[
                "Virtual office for residential and commercial agents",
                "MoxiWorks CRM for clients and contacts",
                "Buildout for commercial marketing, coordinated through the brokerage account",
                "Markful for marketing",
                "Onboarding, CRM and listing maintenance and transaction coordination support",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Also hiring: LCAM */}
      <Section tone="sand">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-red">Also hiring · Prime 1 Property Management</p>
            <h2 className="mt-2 text-2xl md:text-3xl">Licensed CAM? Part-time, hourly, up to 20 hours a week.</h2>
          </div>
          <a href="/careers/lcam-jobs" className="btn btn-ink">See the LCAM position</a>
        </div>
      </Section>

      {/* Who we're looking for + join steps */}
      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Heading eyebrow="Who we're looking for" title="Experienced agents who want a brokerage that keeps up" intro="Prime 1 is not a training brokerage." />
            <CheckList
              className="mt-6"
              items={[
                "Residential agents with at least six completed transactions who already prospect and handle clients, contracts and transactions",
                "Agents who want modern tools and a virtual office",
                "Agents who value direct broker access on residential, commercial and management questions",
                "One or two established commercial agents with sales and leasing experience",
              ]}
            />
          </div>
          <div>
            <Heading eyebrow="How joining works" title="Your next chapter starts here" />
            <ol className="mt-6 space-y-3">
              {[
                "Apply online in 2 minutes. Your onboarding packet is emailed instantly, and Antony reviews every application.",
                "Once approved, sign the Independent Contractor Agreement and transfer your license. Antony handles your onboarding.",
                "Complete the 14-day Producer Activation Program.",
                "Become eligible for company-generated leads and listing appointments.",
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-1">{t}</span>
                </li>
              ))}
            </ol>
            <a href="#apply" className="btn btn-red mt-6">
              Apply to join <IconArrow size={18} />
            </a>
          </div>
        </div>
      </Section>

      <Section tone="paper" id="the-broker">
        <BrokerCard heading="Direct access to your broker" />
      </Section>

      <Section tone="white" id="faq">
        <FaqList faqs={FAQS} title="Agent questions" />
      </Section>

      {/* Closing */}
      <section className="bg-ink py-14 text-white md:py-20">
        <div className="container-x flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-[2rem] leading-tight md:text-[2.75rem]">Residential: 85/15. 100% after your cap.</h2>
            <p className="mt-2 flex items-center gap-2 text-white/70">
              <IconCheck size={18} className="text-[#ff5a5a]" /> Work anywhere in Florida. Apply online in 2 minutes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#apply" className="btn btn-red">
              Apply now <IconArrow size={18} />
            </a>
            <TrackedLink href="/join#call" custom="RecruitingCallClick" params={{ cta_location: "careers_closing" }} className="btn btn-ghost text-white">
              Book a call with Antony
            </TrackedLink>
          </div>
        </div>
      </section>
    </>
  );
}

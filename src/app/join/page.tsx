import { ViewContent } from "@/components/analytics/ViewContent";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { CheckList, FaqList, Heading, Section } from "@/components/sections/Blocks";
import { SplitCalculator } from "@/components/sections/SplitCalculator";
import { JoinForm } from "@/components/join/JoinForm";
import { IconArrow, IconCheck, IconDoc } from "@/components/icons";
import { COMMERCIAL_SCENARIOS, FEE_TABLE, OFFER, RESIDENTIAL_SCENARIOS, SCENARIO_NOTE, SPLIT_LABEL, STANDARDS, usd, type Scenario } from "@/config/offer";
import { FAQS, STATS } from "@/content/careers";
import { handbookReviewReady, reviewDocs } from "@/lib/onboarding-docs";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Join Prime 1 Realty | Florida Agent Offer, Splits & Fees",
  description: `For experienced Florida agents: ${SPLIT_LABEL.residential} to a ${usd(OFFER.residential.cap)} cap, then 100%. Commercial ${SPLIT_LABEL.commercial}, then ${SPLIT_LABEL.commercialAbove}. See what you keep, the fees, incentives and how affiliation works.`,
  path: "/join",
  image: "/og/prime1-join-og.jpg",
});

const pa = OFFER.producerAdvantage;

const STEPS = [
  ["Review", "Read the offer, FAQ, agreement review copy and these steps."],
  ["Apply", "License, production, markets, association and MLS needs. About 5 minutes."],
  ["Pending broker review", "The broker verifies your license on DBPR and reviews your file. Every application stays pending until a decision."],
  ["Decision", "Approval, a request for more information, or a decline, in writing."],
  ["Sign", "Approved agents e-sign the Independent Contractor Agreement and Handbook acknowledgment."],
  ["Onboarding fee", `${usd(OFFER.fees.onboarding)}, paid only after approval and signing.`],
  ["License transfer", "Written instructions for your transfer, MLS access, active listings, pending transactions and technology."],
  ["Virtual Office", "Once your license shows Prime 1, your Virtual Office opens and the broker onboards you personally."],
];

function ScenarioTable({ rows, caption }: { rows: Scenario[]; caption: string }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[560px] text-left text-[0.95rem]">
        <caption className="px-5 pt-5 text-left font-display text-xl text-ink">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-sm text-muted">
            <th className="px-5 py-3 font-semibold">Production</th>
            <th className="px-3 py-3 font-semibold">Prime 1 split</th>
            <th className="px-3 py-3 font-semibold">Fees</th>
            <th className="px-5 py-3 font-semibold">You keep</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line tabular-nums">
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="px-5 py-3">
                <b>{r.label}</b>
                <span className="block text-xs text-muted">{r.note}</span>
              </td>
              <td className="px-3 py-3">{usd(r.split)}</td>
              <td className="px-3 py-3">{usd(r.fees)}</td>
              <td className="px-5 py-3 font-semibold">
                {usd(r.keep)} <span className="font-normal text-muted">({Math.round(r.keepPct * 1000) / 10}%)</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Join() {
  const docs = reviewDocs();
  return (
    <>
      <ViewContent category="careers" name="Join Prime 1" />

      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[520px] rounded-full bg-red/20 blur-3xl" />
        <div className="container-x relative grid gap-8 py-8 md:py-14 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
          <div className="lg:pt-4">
            <Breadcrumbs items={[{ label: "Join Prime 1", href: "/join" }]} tone="dark" />
            <p className="eyebrow mt-5 text-[#ff5a5a]">Join Prime 1 · Experienced Florida agents</p>
            <h1 className="mt-3 text-[2.05rem] leading-[1.06] md:text-[3.2rem]">Independent contractor affiliation for producing Florida agents.</h1>
            <p className="mt-4 max-w-xl text-[1.02rem] text-white/80 md:text-lg">
              Residential and commercial, anywhere in Florida. Review the complete offer, what you keep after splits, caps and fees, and how affiliation works, then apply. The broker reviews and approves every application before any agreement, payment or license transfer.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-2.5 md:max-w-lg">
              {STATS.map((s) => (
                <div key={s.l} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <dd className="font-display text-[1.35rem] leading-none md:text-[1.6rem]">{s.v}</dd>
                  <dt className="mt-1.5 text-[0.82rem] font-semibold text-white/85">{s.l}</dt>
                  <p className="mt-0.5 text-[0.75rem] text-white/60">{s.s}</p>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#offer" className="btn btn-ghost text-white">Review the offer</a>
              <a href="#apply" className="btn btn-red">Apply <IconArrow size={18} /></a>
            </div>
            <p className="mt-4 text-sm text-white/60">For residential agents with {STANDARDS.residentialLabel}, and commercial agents with {STANDARDS.commercialLabel}.</p>
          </div>
          <JoinForm />
        </div>
      </section>

      {/* The offer */}
      <Section tone="paper" id="offer">
        <Heading eyebrow="The offer" title="Your split, your cap and every fee" intro="Shown without incentives, so you can judge the offer on the business you already have." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Residential (you generate)", `${SPLIT_LABEL.residential} until the ${usd(OFFER.residential.cap)} anniversary-year cap, then 100% on qualifying commissions for the rest of that year.`],
            ["Commercial (you generate)", `${SPLIT_LABEL.commercial} through ${usd(OFFER.commercial.threshold)} in qualifying gross commission income, then ${SPLIT_LABEL.commercialAbove}.`],
            ["Company-generated", `${SPLIT_LABEL.company}. Outside the residential cap. Eligibility after the ${OFFER.activationDays}-day Producer Activation Program.`],
          ].map(([t, b]) => (
            <div key={t} className="card p-6">
              <h3 className="text-xl">{t}</h3>
              <p className="mt-2 text-muted">{b}</p>
            </div>
          ))}
        </div>
        <div className="card mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-line text-sm text-muted">
                <th className="px-5 py-3 font-semibold">Fee</th>
                <th className="px-3 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">After the cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {FEE_TABLE.map((r) => (
                <tr key={r.fee}>
                  <td className="px-5 py-3 font-semibold">{r.fee}{r.when && <span className="block text-xs font-normal text-muted">{r.when}</span>}</td>
                  <td className="px-3 py-3">{r.amount}</td>
                  <td className="px-5 py-3 text-muted">{r.afterCap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* What you keep */}
      <Section tone="white" id="what-you-keep">
        <Heading eyebrow="What you keep" title="Take-home at realistic production levels" intro="Year one, after the split, cap and every fee. Incentives are not included." />
        <div className="mt-8 grid gap-6">
          <ScenarioTable rows={RESIDENTIAL_SCENARIOS} caption="Residential, business you generate" />
          <ScenarioTable rows={COMMERCIAL_SCENARIOS} caption="Commercial, business you generate" />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">{SCENARIO_NOTE}</p>
        <h3 className="mt-12 text-2xl">Run one transaction</h3>
        <div className="mt-5">
          <SplitCalculator />
        </div>
      </Section>

      {/* Incentives, separately */}
      <Section tone="ink" id="incentives">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Heading tone="dark" eyebrow="Incentives (separate from the offer)" title="Producer Advantage" intro="Paid under separate written program terms, on qualifying residential business you generate." />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="font-display text-4xl">{usd(pa.bonus)}</p>
                <p className="mt-1 text-white/75">For {pa.closings} qualifying residential closings in your first {pa.days} days</p>
              </div>
              <div className="rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="font-display text-4xl">{usd(pa.sellerBonus)}</p>
                <p className="mt-1 text-white/75">Per qualifying residential seller closing in your first {pa.sellerBonusDays} days</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/55">Both apply to business you generate. Requires qualifying closed transactions. Not guaranteed. The written program terms govern.</p>
          </div>
          <div>
            <h3 className="text-2xl">{OFFER.activationDays}-day Producer Activation Program</h3>
            <p className="mt-3 text-white/80">Completing the program after affiliation establishes eligibility for company-generated leads and qualified listing appointments. Earlier approval is at the broker&apos;s discretion.</p>
            <CheckList
              tone="dark"
              className="mt-5 text-white/90"
              items={[
                "Company-generated buyer and seller leads and qualified listing appointments",
                "Assignments depend on availability, performance, responsiveness and client service",
                `Company-generated business pays ${SPLIT_LABEL.company} and is outside the cap`,
                "Leads and appointments are not guaranteed",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* What you receive */}
      <Section tone="paper" id="support">
        <Heading eyebrow="What you receive" title="Support, technology, marketing and broker access" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Transaction support", ["A designated transaction coordinator on every covered file", "Contract-to-close submission workflow", "SkySlope transaction management with DigiSign"]],
            ["Technology", ["Virtual Office: documents, checklist, resources and tool access in one place", "MoxiWorks CRM, websites and marketing tools", "Company email and Agent Portal", "ADP for commission payments"]],
            ["Marketing", ["Prime 1 brand standards and approved templates", "Listing marketing support", "Buildout for commercial listings, marketing and inquiries"]],
            ["Broker access", ["Direct access to Antony Oseitutu, Broker of Record, 24/7 for brokerage matters once affiliated", "Personal onboarding by the broker", "Residential, commercial and association management under one firm"]],
          ].map(([t, items]) => (
            <div key={t as string} className="card p-6">
              <h3 className="text-xl">{t as string}</h3>
              <CheckList className="mt-4 text-[0.95rem]" items={items as string[]} />
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="text-xl">Commercial agents and Buildout</h3>
            <p className="mt-2 text-muted">Commercial listings are marketed through the brokerage Buildout account: listing pages and flyers, the commercial listings feed on the Prime 1 website, and inquiries captured in Buildout. Affiliated commercial agents get a user on the brokerage account, set up during onboarding.</p>
          </div>
          <div className="card p-6">
            <h3 className="text-xl">Anywhere in Florida. The Tampa office is optional.</h3>
            <p className="mt-2 text-muted">Live and work anywhere in Florida. If you choose to use the Tampa office, schedule your first visit for orientation and building access. After that, use the office without scheduling each visit.</p>
          </div>
        </div>
      </Section>

      {/* Moving your business */}
      <Section tone="white" id="transition">
        <Heading eyebrow="Moving your business" title="MLS access and active transactions during your move" intro="Prime 1 keeps its existing REALTOR® association and MLS setup. We confirm your path before you transfer, and you get written instructions after approval." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Association & MLS", "We confirm what you need to keep or transfer your REALTOR® membership and get the MLS access you need through Prime 1 for your market. Any additional brokerage participation, agreement or fee is approved by the broker before you transfer."],
            ["Active listings", "Listing agreements belong to your current brokerage. Your instructions cover how to request a release or transfer with your current broker and seller, and when to update MLS and signage."],
            ["Pending transactions", "Pendings usually close where they were written. Your instructions cover how to confirm the split of earned commissions with your current broker before you move."],
            ["Technology", "Company email, Agent Portal, MoxiWorks, SkySlope, ADP and (commercial) Buildout are set up after your license shows Prime 1."],
          ].map(([t, b]) => (
            <div key={t} className="card p-6">
              <h3 className="text-lg">{t}</h3>
              <p className="mt-2 text-[0.95rem] text-muted">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Steps */}
      <Section tone="paper" id="steps">
        <Heading eyebrow="Affiliation steps" title="From review to your Virtual Office" intro="Nothing is signed, issued or charged until the broker approves your application." />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, b], i) => (
            <li key={t} className="card p-5">
              <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 text-xl">{t}</h3>
              <p className="mt-1 text-[0.95rem] text-muted">{b}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Materials */}
      <Section tone="white" id="materials">
        <Heading eyebrow="Materials to review before you apply" title="Agreement, checklist and handbook" />
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {docs.map((d) => (
            <li key={d.slug}>
              <a href={d.url} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 font-semibold hover:border-ink">
                <IconDoc size={20} className="shrink-0 text-red" /> {d.title}
              </a>
            </li>
          ))}
          {!handbookReviewReady() && (
            <li className="flex items-center gap-3 rounded-xl border border-dashed border-line px-4 py-3.5 text-muted">
              <IconDoc size={20} className="shrink-0" /> Agent Handbook: updated 2026 edition is being finalized and will be posted here
            </li>
          )}
        </ul>
        <p className="mt-3 text-sm text-muted">Review copies only. The agreement for signature and the full onboarding packet are issued after broker approval. The executed Independent Contractor Agreement governs.</p>
        <p className="mt-6 flex items-center gap-2 font-semibold"><IconCheck size={18} className="text-red" /> Ready? <a href="#apply" className="text-red underline">Apply at the top of this page</a></p>
      </Section>

      <Section tone="paper" id="faq">
        <FaqList faqs={FAQS} title="Agent questions" />
      </Section>
    </>
  );
}

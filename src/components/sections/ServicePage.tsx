import Image from "next/image";
import type { ReactNode } from "react";
import type { ServicePageData } from "@/content/services";
import { Funnel } from "@/components/funnel/Funnel";
import { TrackedLink } from "@/components/analytics/Tracked";
import { ViewContent } from "@/components/analytics/ViewContent";
import { IconArrow, IconCheck, IconGauge, IconPin, IconClock, IconPhone } from "@/components/icons";
import { serviceSchema } from "@/lib/schema";
import { site } from "@/config/site";
import { Breadcrumbs } from "./Breadcrumbs";
import { JsonLd } from "./JsonLd";
import { Answer, BrokerCard, CheckList, CtaBand, FaqList, Heading, Photo, RelatedLinks, Section, Steps } from "./Blocks";
import { Reveal } from "./Reveal";
import { MobileFormReveal } from "./MobileFormReveal";

/** Hero with the question flow embedded. On phones the flow sits right under the headline. */
export function FunnelHero({
  crumbs,
  eyebrow,
  h1,
  lede,
  image,
  imageAlt,
  bullets,
  secondary,
  leadType,
  funnelTitle,
  form,
}: {
  crumbs?: { label: string; href: string }[];
  eyebrow: string;
  h1: string;
  lede: string;
  image: string;
  imageAlt: string;
  bullets: string[];
  secondary?: ServicePageData["hero"]["secondary"];
  leadType?: ServicePageData["leadType"];
  funnelTitle?: string;
  /** Replaces the question flow (e.g. the association proposal form). */
  form?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="-z-10 object-cover opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />
      <div className="container-x grid items-start gap-6 pb-12 pt-5 md:gap-8 md:pb-16 md:pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:pb-20 lg:pt-14">
        <div className="lg:pt-6">
          {crumbs && <Breadcrumbs items={crumbs} tone="dark" />}
          <p className="eyebrow mt-4 text-[#ff5a5a] md:mt-5">{eyebrow}</p>
          <h1 className="mt-3 text-[1.95rem] leading-[1.08] sm:text-5xl lg:text-[3.6rem]">{h1}</h1>
          <p className="mt-3 max-w-xl text-[0.98rem] leading-normal text-white/80 md:mt-4 md:text-lg md:leading-relaxed">{lede}</p>
          <ul className="mt-6 hidden gap-2.5 sm:grid">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-white/90">
                <span className="grid size-6 place-items-center rounded-full bg-red text-white">
                  <IconCheck size={14} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          {secondary && (
            <TrackedLink
              href={secondary.href}
              event={secondary.event}
              custom={secondary.custom}
              params={{ ...secondary.params, cta_location: "hero_secondary" }}
              className="mt-7 hidden items-center gap-2 font-semibold text-white underline decoration-red decoration-2 underline-offset-[6px] hover:decoration-white lg:inline-flex"
            >
              {secondary.label} <IconArrow size={18} />
            </TrackedLink>
          )}
        </div>
        <div className="lg:sticky lg:top-24">
          <MobileCallCta location="hero_mobile_call" />
          <MobileFormReveal label={form ? "Request an Association Management Proposal" : undefined}>{form ?? <Funnel flow={leadType} title={funnelTitle} />}</MobileFormReveal>
          <ul className="mt-4 grid gap-2 text-sm text-white/80 sm:hidden">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <IconCheck size={16} className="text-[#ff5a5a]" /> {b}
              </li>
            ))}
          </ul>
          {secondary && (
            <TrackedLink
              href={secondary.href}
              event={secondary.event}
              custom={secondary.custom}
              params={{ ...secondary.params, cta_location: "hero_secondary_mobile" }}
              className="mt-4 flex items-center justify-center gap-2 font-semibold text-white underline decoration-red decoration-2 underline-offset-[6px] lg:hidden"
            >
              {secondary.label} <IconArrow size={18} />
            </TrackedLink>
          )}
        </div>
      </div>
    </section>
  );
}

function SellerSample() {
  const rows = [
    ["Comparable sales within ~1 mile", "6 recent sales"],
    ["Homes you'd compete with today", "4 active listings"],
    ["Suggested list price range", "$ ___,___ – $ ___,___"],
    ["Typical days on market", "__ days"],
    ["Prep that pays off", "3 recommendations"],
  ];
  return (
    <Section tone="white">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Heading
          eyebrow="What you get"
          title="See your property analysis before you decide anything"
          intro="Sellers who know their number price more confidently and negotiate from strength. Your analysis is built from your home's details and current local data, then explained by a broker."
        />
        <Reveal>
          <div className="card relative overflow-hidden p-6 md:p-8">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-semibold">
                <IconGauge className="text-red" /> Property analysis
              </p>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted ring-1 ring-line">Sample</span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <IconPin size={15} /> Your address, Florida
            </p>
            <dl className="mt-6 divide-y divide-line">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[0.95rem] text-muted">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted">Sample layout. Your analysis uses your home&apos;s details and current market data.</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function ValuationExplainer() {
  const cols = [
    { t: "Online estimate", items: ["Public records only", "Can't see upgrades or condition", "One number, no reasoning"], tone: "muted" },
    { t: "Prime 1 broker valuation", items: ["Recent nearby sales, hand-picked", "Adjusted for condition and updates", "A range, with the reasoning explained"], tone: "brand" },
  ];
  return (
    <Section tone="white">
      <Heading eyebrow="Why it's different" title="Why online home estimates miss" align="center" />
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
        {cols.map((c) => (
          <div key={c.t} className={c.tone === "brand" ? "card p-6 ring-2 ring-red" : "rounded-[var(--radius-card)] border border-line bg-paper p-6"}>
            <h3 className="text-xl">{c.t}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((i) => (
                <li key={i} className="flex gap-2.5">
                  <span className={c.tone === "brand" ? "text-red" : "text-muted"}>{c.tone === "brand" ? "✓" : "–"}</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function RentalManagement() {
  return (
    <Section tone="white" id="rental-management">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Photo src="/images/buy/craftsman-home-curb-appeal.jpg" alt="Single-family rental home with a well-kept front yard" ratio="4/3" />
        <div>
          <p className="eyebrow">Rental property management</p>
          <h2 className="mt-3 text-[2rem] leading-tight md:text-[2.4rem]">Management for qualifying rental portfolios</h2>
          <p className="mt-4 text-lg text-muted">For residential rental portfolios that meet Prime 1&apos;s service criteria.</p>
          <CheckList
            className="mt-6"
            items={[
              "Leasing administration and resident screening",
              "Online rent collection",
              "Maintenance coordination and vendor oversight",
              "Tenant relations and move-in / move-out",
              "Monthly financial reporting with owner portal access",
            ]}
          />
        </div>
      </div>
    </Section>
  );
}

/** `top`: content right under the hero (e.g. live listings); `children`: content lower on the page. */
export function ServicePage({ data, children, top, form, emergency }: { data: ServicePageData; children?: ReactNode; top?: ReactNode; form?: ReactNode; emergency?: boolean }) {
  const d = data;
  return (
    <>
      <ViewContent category={d.category} name={d.schema.name} />
      <JsonLd data={serviceSchema({ name: d.schema.name, description: d.meta.description, path: d.path, serviceType: d.schema.serviceType })} />
      <FunnelHero crumbs={d.crumbs} leadType={d.leadType} {...d.hero} form={form} />

      {/* Trust strip */}
      <div className="border-b border-line bg-white">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-sm font-semibold text-muted">
          <span className="flex items-center gap-2"><IconCheck size={16} className="text-red" /> Licensed Florida brokerage</span>
          <span className="flex items-center gap-2"><IconCheck size={16} className="text-red" /> Licensed CAM firm</span>
          <span className="flex items-center gap-2"><IconPin size={16} className="text-red" /> Headquartered in Tampa · serving all of Florida</span>
          <span className="flex items-center gap-2"><IconClock size={16} className="text-red" /> {emergency ? site.phone.emergency : `Office ${site.hours.label}`}</span>
        </div>
      </div>

      {top}

      <Section>
        <div className="mx-auto max-w-3xl">
          <Answer question={d.answer.q}>{d.answer.a}</Answer>
        </div>
      </Section>

      {d.extra === "sellerSample" && <SellerSample />}
      {d.extra === "valuationExplainer" && <ValuationExplainer />}

      <Section tone={d.extra ? "paper" : "white"} id={d.includes.id}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Heading eyebrow="What's included" title={d.includes.title} intro={d.includes.intro} />
            <CheckList className="mt-7 text-[1.03rem]" items={d.includes.items} />
          </div>
          <Reveal>
            <Photo src={d.includes.image} alt={d.includes.imageAlt} ratio="5/4" />
          </Reveal>
        </div>
      </Section>

      {d.extra === "rentalManagement" && <RentalManagement />}

      {d.audiences && (
        <Section tone={d.extra === "rentalManagement" ? "paper" : "sand"}>
          <Heading eyebrow="Who it's for" title={d.audiences.title} intro={d.audiences.intro} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.audiences.items.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.05}>
                <div className="card h-full p-6">
                  <h3 className="text-xl">{a.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {children}

      <Section tone="ink">
        <Heading eyebrow="How it works" title={d.steps.title} intro={d.steps.intro} tone="dark" />
        <Steps steps={d.steps.items} tone="dark" />
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#start" className="btn btn-red">
            {d.cta.label} <IconArrow size={18} />
          </a>
        </div>
      </Section>

      <Section tone="paper">
        <BrokerCard />
      </Section>

      <Section tone="white">
        <FaqList faqs={d.faqs} />
      </Section>

      <Section tone="paper" className="!pt-0">
        <h2 className="mb-6 text-2xl">Related services</h2>
        <RelatedLinks links={d.related} />
      </Section>

      <CtaBand title={d.cta.title} body={d.cta.body} primary={{ label: d.cta.label, href: "#start" }} location={`${d.category}_cta_band`} />
    </>
  );
}

/**
 * Phones only: calling is the fastest way to reach Prime 1 (the office line is calls only, no texts),
 * so the first thing a mobile visitor sees under the headline is a big tap-to-call button.
 */
function MobileCallCta({ location }: { location: string }) {
  return (
    <div className="mb-4 md:hidden">
      <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: location }} className="btn btn-red min-h-[60px] w-full text-[1.1rem]">
        <IconPhone size={20} /> Call now: {site.phone.display}
      </TrackedLink>
      <p className="mt-2 text-center text-[0.82rem] text-white/70">Office {site.hours.label} · tap to call</p>
    </div>
  );
}

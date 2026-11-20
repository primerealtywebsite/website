import Link from "next/link";
import { ViewContent } from "@/components/analytics/ViewContent";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { Answer, CtaBand, FaqList, Section } from "@/components/sections/Blocks";
import { MortgageCalculator } from "@/components/sections/MortgageCalculator";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Florida Mortgage Payment Calculator | Tampa | Prime 1 Realty",
  description: "Estimate your monthly mortgage payment in Tampa Bay, including Florida property tax, homeowners insurance, PMI and HOA dues. Free and instant.",
  path: "/financing",
});

const FAQS = [
  { q: "What is the average property tax rate in Florida?", a: "Effective rates vary by county and by home; around 1% to 1.5% of value per year is a common planning range. Homestead exemptions can lower the taxable value for owner-occupants." },
  { q: "Why is homeowners insurance so important in Florida budgets?", a: "Insurance premiums in Florida can be a large share of the monthly cost, especially for older roofs or coastal homes. Get quotes early in your search." },
  { q: "When do I need PMI?", a: "Conventional loans usually require private mortgage insurance when the down payment is under 20%. It can typically be removed once you reach enough equity." },
];

export default function Financing() {
  return (
    <>
      <ViewContent category="financing" name="Mortgage calculator" />
      <section className="bg-paper pb-6 pt-10 md:pt-14">
        <div className="container-x">
          <Breadcrumbs items={[{ label: "Buy", href: "/residential" }, { label: "Mortgage calculator", href: "/financing" }]} />
          <h1 className="mt-5 text-[2.3rem] leading-tight md:text-5xl">Florida mortgage payment calculator</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">See what a Tampa Bay home really costs per month, including taxes, insurance, PMI and HOA dues.</p>
        </div>
      </section>
      <Section tone="paper" className="!pt-6">
        <MortgageCalculator />
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/residential#start" className="btn btn-red">Find homes in this budget</Link>
          <Link href="/get-started" className="font-bold text-red hover:underline">Need a lender recommendation? Ask us →</Link>
        </div>
      </Section>
      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <Answer question="How much house can I afford in Tampa Bay?">
            Start from the monthly payment you are comfortable with, not the maximum loan you qualify for. In Florida, include property tax, homeowners and flood insurance, HOA or CDD fees and maintenance. A lender pre-approval confirms your budget, and a buyer agent can flag homes where insurance or fees push the payment higher.
          </Answer>
        </div>
      </Section>
      <Section tone="paper">
        <FaqList faqs={FAQS} />
      </Section>
      <CtaBand title="Ready to see homes in your budget?" body="Tell us your price range and area. We'll send homes that fit." primary={{ label: "Start my home search", href: "/residential#start" }} location="financing_cta_band" />
    </>
  );
}

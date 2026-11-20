import Link from "next/link";
import { notFound } from "next/navigation";
import { FunnelHero } from "@/components/sections/ServicePage";
import { ViewContent } from "@/components/analytics/ViewContent";
import { Answer, BrokerCard, CheckList, CtaBand, FaqList, Heading, Section } from "@/components/sections/Blocks";
import { JsonLd } from "@/components/sections/JsonLd";
import { AREAS, getArea } from "@/content/areas";
import { serviceSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return AREAS.map((a) => ({ city: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/areas/[city]">) {
  const { city } = await params;
  const a = getArea(city);
  if (!a) return {};
  return pageMeta({ title: a.metaTitle, description: a.description, path: `/areas/${a.slug}`, image: a.image });
}

export default async function AreaPage({ params }: PageProps<"/areas/[city]">) {
  const { city } = await params;
  const a = getArea(city);
  if (!a) notFound();
  const others = AREAS.filter((x) => x.slug !== a.slug);
  return (
    <>
      <ViewContent category="area" name={a.name} />
      <JsonLd data={serviceSchema({ name: `Real estate services in ${a.name}, FL`, description: a.description, path: `/areas/${a.slug}`, serviceType: "Real estate brokerage and property management", areas: [a.name, a.county] })} />
      <FunnelHero
        crumbs={[{ label: "Areas", href: "/areas" }, { label: a.name, href: `/areas/${a.slug}` }]}
        eyebrow={`${a.name} · ${a.county}`}
        h1={a.h1}
        lede={a.lede}
        image={a.image}
        imageAlt={a.imageAlt}
        bullets={["Buy, sell or rent", "HOA, condo & rental management", "Licensed Tampa-based brokerage"]}
      />
      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <Answer question={`What should I know about real estate in ${a.name}?`}>{a.answer}</Answer>
        </div>
      </Section>
      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Heading eyebrow="Neighborhoods" title={`${a.name} at a glance`} />
            <ul className="mt-8 grid gap-3">
              {a.neighborhoods.map((n) => (
                <li key={n.name} className="card p-5">
                  <h3 className="text-xl">{n.name}</h3>
                  <p className="mt-1 text-muted">{n.note}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Heading eyebrow="Before you buy" title={`What to check in ${a.name}`} />
            <CheckList className="mt-8" items={a.knowBefore} />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/residential#start" className="btn btn-red">Find homes in {a.name}</Link>
              <Link href="/home-valuation" className="btn btn-ghost">Value my {a.name} home</Link>
            </div>
          </div>
        </div>
      </Section>
      <Section tone="white">
        <BrokerCard />
      </Section>
      <Section tone="paper">
        <FaqList faqs={a.faqs} title={`${a.name} real estate questions`} />
      </Section>
      <Section tone="white" className="!py-12">
        <h2 className="text-2xl">Other areas we serve</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/areas/${o.slug}`} className="rounded-full border border-line px-4 py-2 font-semibold hover:border-ink">{o.name}</Link>
          ))}
        </div>
      </Section>
      <CtaBand title={`Buying, selling or managing in ${a.name}?`} body="Tell us what you need and a licensed professional will follow up." primary={{ label: "Get started", href: "#start" }} location={`area_${a.slug}_cta`} />
    </>
  );
}

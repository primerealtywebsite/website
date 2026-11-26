import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { CtaBand, Section } from "@/components/sections/Blocks";
import { AREAS } from "@/content/areas";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Local Market Guides | Prime 1 Realty, Serving All of Florida",
  description: "Prime 1 Realty serves clients throughout Florida from its Tampa headquarters. Local market guides for Tampa, Brandon, Riverview, Clearwater and St. Petersburg.",
  path: "/areas",
});

export default function Areas() {
  return (
    <>
      <section className="bg-paper pb-4 pt-10 md:pt-14">
        <div className="container-x">
          <Breadcrumbs items={[{ label: "Areas", href: "/areas" }]} />
          <h1 className="mt-5 text-[2.3rem] leading-tight md:text-5xl">Local market guides</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">Prime 1 serves clients throughout Florida. These guides cover neighborhoods, flood zones, insurance and HOAs in communities near our Tampa headquarters.</p>
        </div>
      </section>
      <Section tone="paper" className="!pt-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <Link key={a.slug} href={`/areas/${a.slug}`} className="card group overflow-hidden">
              <div className="relative aspect-[16/10] bg-sand">
                <Image src={a.image} alt={a.imageAlt} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl group-hover:underline">{a.name}</h2>
                <p className="text-sm text-muted">{a.county}</p>
                <p className="mt-3 line-clamp-3 text-muted">{a.lede}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <CtaBand title="Not sure which area fits?" body="Tell us your budget and lifestyle and we'll help you compare." primary={{ label: "Get started", href: "/get-started" }} location="areas_cta" />
    </>
  );
}

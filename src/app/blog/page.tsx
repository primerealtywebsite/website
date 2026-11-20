import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { CtaBand, Section } from "@/components/sections/Blocks";
import { POSTS } from "@/content/blog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Tampa Bay Real Estate Insights & Guides | Prime 1 Realty Blog",
  description: "Guides for Tampa Bay buyers, sellers, landlords and HOA boards: Florida CAM licensing, market insights, renting tips and landlord requirements.",
  path: "/blog",
});

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function Blog() {
  const posts = [...POSTS].sort((a, b) => b.published.localeCompare(a.published));
  return (
    <>
      <section className="bg-paper pb-4 pt-10 md:pt-14">
        <div className="container-x">
          <Breadcrumbs items={[{ label: "Insights", href: "/blog" }]} />
          <h1 className="mt-5 text-[2.3rem] leading-tight md:text-5xl">Real estate insights for Tampa Bay</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">Plain-language guides for buyers, sellers, renters, landlords and association boards.</p>
        </div>
      </section>
      <Section tone="paper" className="!pt-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.slug} className="card group overflow-hidden">
              <Link href={`/blog/${p.slug}`}>
                <div className="relative aspect-[16/10] bg-sand">
                  <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-red">{p.category}</p>
                  <h2 className="mt-2 text-xl leading-snug group-hover:underline">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{p.description}</p>
                  <p className="mt-3 text-xs text-muted"><time dateTime={p.published}>{fmt(p.published)}</time> · {p.readMins} min read</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </Section>
      <CtaBand title="Have a question about your situation?" body="Talk to a licensed Prime 1 professional." primary={{ label: "Get started", href: "/get-started" }} location="blog_cta_band" />
    </>
  );
}

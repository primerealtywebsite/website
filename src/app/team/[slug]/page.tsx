import Image from "next/image";
import { notFound } from "next/navigation";
import { TrackedLink } from "@/components/analytics/Tracked";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { CtaBand } from "@/components/sections/Blocks";
import { JsonLd } from "@/components/sections/JsonLd";
import { IconMail, IconPhone } from "@/components/icons";
import { people, site, type PersonKey } from "@/config/site";
import { personSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

const bySlug = (slug: string) => (Object.keys(people) as PersonKey[]).find((k) => people[k].slug === slug);

export function generateStaticParams() {
  return Object.values(people).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/team/[slug]">) {
  const { slug } = await params;
  const key = bySlug(slug);
  if (!key) return {};
  const p = people[key];
  return pageMeta({
    title: `${p.name}, ${key === "antony" ? "Broker & Designated CAM" : "Licensed CAM"} | Prime 1 Realty`,
    description: `${p.name} is ${p.role} at Prime 1 in Tampa, FL. ${p.bio[0]}`.slice(0, 155),
    path: `/team/${p.slug}`,
    image: p.image ?? undefined,
  });
}

export default async function Person({ params }: PageProps<"/team/[slug]">) {
  const { slug } = await params;
  const key = bySlug(slug);
  if (!key) notFound();
  const p = people[key];
  return (
    <>
      <JsonLd data={personSchema(key)} />
      <section className="bg-paper py-10 md:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: "Team", href: "/team" }, { label: p.name, href: `/team/${p.slug}` }]} />
          <div className="mt-8 grid gap-10 md:grid-cols-[320px_1fr]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
              {p.image ? (
                <Image src={p.image} alt={`${p.name}, ${p.role} in Tampa`} fill priority sizes="320px" className="object-cover object-top" />
              ) : (
                <div className="grid h-full place-items-center bg-gradient-to-br from-ink-3 to-ink font-display text-8xl text-white">{p.name.split(" ").map((n) => n[0]).join("")}</div>
              )}
            </div>
            <div>
              <h1 className="text-[2.4rem] leading-tight md:text-5xl">{p.name}</h1>
              <ul className="mt-3 space-y-1 font-semibold text-red">
                {p.titles.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <div className="prose-p1 mt-6 max-w-2xl">
                {p.bio.map((b) => <p key={b}>{b}</p>)}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: `profile_${p.slug}` }} className="btn btn-red">
                  <IconPhone size={18} /> {site.phone.display}
                </TrackedLink>
                <TrackedLink href={`mailto:${p.email}`} event="Contact" params={{ method: "email", cta_location: `profile_${p.slug}` }} className="btn btn-ghost">
                  <IconMail size={18} /> Email {p.name.split(" ")[0]}
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CtaBand title={`Work with ${p.name.split(" ")[0]} and the Prime 1 team`} body="Tell us what you need and we'll follow up within one business day." primary={{ label: "Get started", href: "/get-started" }} location={`profile_${p.slug}_cta`} />
    </>
  );
}

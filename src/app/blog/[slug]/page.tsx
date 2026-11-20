import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { CtaBand } from "@/components/sections/Blocks";
import { JsonLd } from "@/components/sections/JsonLd";
import { POSTS, getPost } from "@/content/blog";
import { articleSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return pageMeta({ title: p.metaTitle, description: p.description, path: `/blog/${p.slug}`, image: p.image, type: "article" });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const related = POSTS.filter((x) => x.slug !== p.slug && x.category === p.category).concat(POSTS.filter((x) => x.slug !== p.slug && x.category !== p.category)).slice(0, 3);
  return (
    <>
      <JsonLd data={articleSchema({ title: p.title, description: p.description, path: `/blog/${p.slug}`, image: p.image, published: p.published, modified: p.modified })} />
      <article className="bg-paper pb-16">
        <header className="container-x max-w-3xl pt-10 md:pt-14">
          <Breadcrumbs items={[{ label: "Insights", href: "/blog" }, { label: p.title.length > 40 ? `${p.title.slice(0, 40)}…` : p.title, href: `/blog/${p.slug}` }]} />
          <p className="mt-6 text-xs font-bold uppercase tracking-wider text-red">{p.category}</p>
          <h1 className="mt-2 text-[2.1rem] leading-[1.12] md:text-[2.9rem]">{p.title}</h1>
          <p className="mt-4 text-sm text-muted">
            By {""}<Link href="/about-us" className="font-semibold text-ink underline">Prime 1 Realty</Link> · Published <time dateTime={p.published}>{fmt(p.published)}</time> · Updated <time dateTime={p.modified}>{fmt(p.modified)}</time> · {p.readMins} min read
          </p>
        </header>
        <div className="container-x mt-8 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-sand">
            <Image src={p.image} alt={p.imageAlt} fill priority sizes="(min-width:1024px) 896px, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="container-x mt-10 max-w-3xl">
          <aside className="rounded-[var(--radius-card)] border-l-4 border-red bg-white p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-bold uppercase tracking-wider text-red">Key takeaway</p>
            <p className="mt-2 text-[1.075rem] leading-relaxed">{p.tldr}</p>
          </aside>
          <div className="prose-p1 mt-8">
            {p.body.map((b, i) => (
              <section key={i}>
                {b.h2 && <h2>{b.h2}</h2>}
                {b.p?.map((t) => <p key={t}>{t}</p>)}
                {b.list && (
                  <ul>
                    {b.list.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[var(--radius-card)] bg-ink p-6 text-white sm:flex-row sm:items-center">
            <p className="font-display text-2xl">Want help with this?</p>
            <Link href={p.cta.href} className="btn btn-red">{p.cta.label}</Link>
          </div>
          <p className="mt-6 text-xs text-muted">This article is general information, not legal, tax or financial advice. Laws and market conditions change; consult a qualified professional about your situation.</p>
        </div>
        <div className="container-x mt-14">
          <h2 className="text-2xl">Related articles</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="card group overflow-hidden">
                <div className="relative aspect-[16/10] bg-sand">
                  <Image src={r.image} alt={r.imageAlt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                </div>
                <h3 className="p-5 text-lg leading-snug group-hover:underline">{r.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </article>
      <CtaBand title="Talk to a licensed professional" body="Buying, selling, renting or management: tell us what you need." primary={{ label: "Get started", href: "/get-started" }} location="blog_post_cta" />
    </>
  );
}

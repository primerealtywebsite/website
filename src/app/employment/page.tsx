import Link from "next/link";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { CheckList, FaqList, Heading, Section } from "@/components/sections/Blocks";
import { EmploymentForm } from "@/components/employment/EmploymentForm";
import { EMPLOYMENT, EMPLOYMENT_FAQS } from "@/content/employment";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "LCAM Employment | Prime 1 Property Management Florida",
  description: "Employment for Florida Licensed Community Association Managers at Prime 1 Property Management: part time and full time W2 roles. Apply with your résumé.",
  path: "/employment",
});

const crumbs = [{ label: "Employment Opportunities", href: "/employment" }];

export default function Employment() {
  return (
    <>
      <section className="bg-ink pb-12 pt-10 text-white md:pb-16 md:pt-14">
        <div className="container-x">
          <Breadcrumbs items={crumbs} tone="dark" />
          <p className="eyebrow mt-6">Employment Opportunities · {site.pmName}</p>
          <h1 className="mt-3 max-w-3xl text-[2.2rem] leading-tight md:text-5xl">{EMPLOYMENT.role}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">{EMPLOYMENT.intro}</p>
          <p className="mt-5 inline-block rounded-xl bg-white/10 px-4 py-3 text-[0.95rem] text-white"><b>Current employment status:</b> {EMPLOYMENT.status}</p>
        </div>
      </section>

      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Heading title="What do LCAM employment opportunities offer?" intro="W2 employment with Prime 1 Property Management, a licensed Florida community association management firm headquartered in Tampa." />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[EMPLOYMENT.partTime, EMPLOYMENT.fullTime].map((b) => (
                <div key={b.label} className="card p-6">
                  <h3 className="text-xl">{b.label}</h3>
                  <CheckList className="mt-3" items={[...b.items]} />
                </div>
              ))}
            </div>
            <h2 className="mt-10 text-[1.7rem] leading-tight">What are the requirements?</h2>
            <CheckList className="mt-4" items={[...EMPLOYMENT.requirements]} />
            <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-5 text-[0.95rem] text-muted">
              <b className="text-ink">Real estate agent?</b> Agents affiliate with Prime 1 Realty as independent contractors through a separate application. <Link href="/join" className="font-semibold text-ink underline underline-offset-4">Join Prime 1 Realty</Link>.
            </div>
          </div>
          <EmploymentForm />
        </div>
      </Section>

      <Section tone="white">
        <FaqList faqs={EMPLOYMENT_FAQS} title="Employment questions" />
      </Section>
    </>
  );
}

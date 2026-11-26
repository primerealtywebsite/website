import { Funnel } from "@/components/funnel/Funnel";
import { TrackedLink } from "@/components/analytics/Tracked";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { BookButton, BrokerCard, Section } from "@/components/sections/Blocks";
import { IconClock, IconMail, IconPhone, IconPin } from "@/components/icons";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact Prime 1 Realty | Tampa Headquarters (813) 295-8215",
  description: "Call (813) 295-8215, email or visit Prime 1 Realty's Tampa headquarters. Office Mon–Fri 9 AM–5 PM ET. 24/7 live answering for community association emergencies.",
  path: "/lets-connect",
});

export default function Contact() {
  const items = [
    { icon: IconPhone, label: "Call", value: site.phone.display, href: site.phone.href, event: "Contact" as const, params: { method: "phone", cta_location: "contact_page" } },
    { icon: IconMail, label: "Email", value: site.email, href: `mailto:${site.email}`, event: "Contact" as const, params: { method: "email", cta_location: "contact_page" } },
    { icon: IconPin, label: "Visit", value: `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`, href: site.mapsUrl, event: "FindLocation" as const, params: { cta_location: "contact_page" } },
  ];
  return (
    <>
      <section className="bg-ink py-10 text-white md:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <Breadcrumbs items={[{ label: "Contact", href: "/lets-connect" }]} tone="dark" />
            <h1 className="mt-5 text-[2.3rem] leading-tight md:text-5xl">Let&apos;s connect</h1>
            <p className="mt-4 max-w-lg text-lg text-white/75">Call, email, visit our Tampa headquarters or send a message below. We serve clients throughout Florida and typically respond within one business day.</p>
            <ul className="mt-8 grid gap-3">
              {items.map((it) => (
                <li key={it.label}>
                  <TrackedLink href={it.href} event={it.event} params={it.params} className="flex items-center gap-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/10">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-red"><it.icon size={20} /></span>
                    <span>
                      <span className="block text-sm text-white/60">{it.label}</span>
                      <span className="block font-semibold">{it.value}</span>
                    </span>
                  </TrackedLink>
                </li>
              ))}
              <li className="flex items-center gap-4 rounded-xl p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10"><IconClock size={20} /></span>
                <span>
                  <span className="block text-sm text-white/60">Office hours</span>
                  <span className="block font-semibold">{site.hours.label}</span>
                  <span className="block text-sm text-white/60">{site.hours.note}. {site.phone.callsOnly}.</span>
                  <span className="block text-sm text-white/60">Community association emergencies: 24/7 live phone answering.</span>
                </span>
              </li>
            </ul>
          </div>
          <Funnel flow="contact" title="Send us a message" />
        </div>
      </section>
      <Section tone="paper" id="book">
        <div className="card flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div>
            <h2 className="text-3xl">Prefer to pick a time?</h2>
            <p className="mt-2 text-muted">Book a 15-minute call with a licensed Prime 1 professional, or call the office during business hours.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <BookButton location="contact_book" variant="red" />
            <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "contact_book" }} className="btn btn-ghost">
              <IconPhone size={18} /> {site.phone.display}
            </TrackedLink>
          </div>
        </div>
      </Section>
      <Section tone="white">
        <BrokerCard />
      </Section>
    </>
  );
}

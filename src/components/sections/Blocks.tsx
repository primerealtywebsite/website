import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { people, site } from "@/config/site";
import { TrackedLink } from "@/components/analytics/Tracked";
import { IconArrow, IconCalendar, IconCheck, IconPhone, IconPlusFaq } from "./BlockIcons";
import { faqSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function Section({ id, className, children, tone = "paper" }: { id?: string; className?: string; children: ReactNode; tone?: "paper" | "white" | "ink" | "sand" }) {
  const bg = { paper: "bg-paper", white: "bg-white", ink: "bg-ink text-white", sand: "bg-sand" }[tone];
  return (
    <section id={id} className={cn(bg, "py-16 md:py-24", className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}

export function Heading({ eyebrow, title, intro, align = "left", as: As = "h2", tone }: { eyebrow?: string; title: string; intro?: ReactNode; align?: "left" | "center"; as?: "h2" | "h3"; tone?: "dark" }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className={cn("eyebrow", tone === "dark" && "text-[#ff4d4d]")}>{eyebrow}</p>}
      <As className="mt-3 text-[2rem] leading-[1.1] md:text-[2.6rem]">{title}</As>
      {intro && <div className={cn("mt-4 text-[1.075rem] leading-relaxed", tone === "dark" ? "text-white/75" : "text-muted")}>{intro}</div>}
    </div>
  );
}

/** 40–80 word direct answer block, formatted for AI/answer-engine extraction. */
export function Answer({ question, children }: { question: string; children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border-l-4 border-red bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-xl md:text-2xl">{question}</h2>
      <div className="mt-2 text-[1.05rem] leading-relaxed text-[#33363c]">{children}</div>
    </div>
  );
}

export function CheckList({ items, className, tone }: { items: string[]; className?: string; tone?: "dark" }) {
  return (
    <ul className={cn("grid gap-3", className)}>
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full", tone === "dark" ? "bg-white/10 text-white" : "bg-red-soft text-red")}>
            <IconCheck size={15} />
          </span>
          <span className="leading-snug">{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function Steps({ steps, tone }: { steps: { title: string; body: string }[]; tone?: "dark" }) {
  return (
    <ol className={cn("mt-10 grid gap-4", steps.length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3")}>
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.06}>
          <li className={cn("relative h-full rounded-[var(--radius-card)] p-6", tone === "dark" ? "bg-ink-2 ring-1 ring-white/10" : "card")}>
            <span className="font-display text-5xl leading-none text-red/90">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-4 text-xl">{s.title}</h3>
            <p className={cn("mt-2 leading-relaxed", tone === "dark" ? "text-white/70" : "text-muted")}>{s.body}</p>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export type Faq = { q: string; a: string };

export function FaqList({ faqs, title = "Frequently asked questions", eyebrow = "Questions", withSchema = true }: { faqs: Faq[]; title?: string; eyebrow?: string; withSchema?: boolean }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <Heading eyebrow={eyebrow} title={title} intro={<>Can&apos;t find your answer? Call <TrackedLink className="font-semibold text-ink underline" href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "faq" }}>{site.phone.display}</TrackedLink> and talk to a licensed professional.</>} />
      <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
        {faqs.map((f, i) => (
          <details key={f.q} className="group px-5 md:px-6" open={i === 0}>
            <summary className="flex items-start justify-between gap-4 py-5 text-left">
              <h3 className="font-sans text-[1.05rem] font-semibold leading-snug">{f.q}</h3>
              <IconPlusFaq className="faq-plus mt-0.5 shrink-0 text-red transition-transform" />
            </summary>
            <p className="-mt-1 pb-5 leading-relaxed text-[#3b3e44]">{f.a}</p>
          </details>
        ))}
      </div>
      {withSchema && <JsonLd data={faqSchema(faqs)} />}
    </div>
  );
}

/**
 * Fires Meta "Schedule" only when a real booking calendar is configured (NEXT_PUBLIC_BOOKING_URL).
 * Without one it becomes "Request a call back" (opens the contact form, which fires Lead on submit).
 */
export function BookButton({ label = "Book a 15-minute call", className, location, variant = "white" }: { label?: string; className?: string; location: string; variant?: "white" | "red" }) {
  const cls = cn("btn", variant === "red" ? "btn-red" : "btn-white", className);
  if (!site.bookingConfigured) {
    return (
      <TrackedLink href="/lets-connect#start" custom="CallbackRequestClick" params={{ cta_location: location }} className={cls}>
        <IconCalendar size={18} /> Request a call back
      </TrackedLink>
    );
  }
  return (
    <TrackedLink href={site.bookingUrl} event="Schedule" params={{ cta_location: location }} className={cls}>
      <IconCalendar size={18} /> {label}
    </TrackedLink>
  );
}

export function CallButton({ className, location, label }: { className?: string; location: string; label?: string }) {
  return (
    <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: location }} className={cn("btn btn-ghost", className)}>
      <IconPhone size={18} /> {label ?? `Call ${site.phone.display}`}
    </TrackedLink>
  );
}

/** Closing CTA band used at the end of every page. */
export function CtaBand({ title, body, primary, location }: { title: string; body: string; primary: { label: string; href: string }; location: string }) {
  return (
    <section className="relative overflow-hidden bg-ink py-16 text-white md:py-20">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-red/25 blur-3xl" />
      <div className="container-x relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-[2rem] leading-tight md:text-[2.75rem]">{title}</h2>
          <p className="mt-3 max-w-xl text-lg text-white/75">{body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-stretch">
          <TrackedLink href={primary.href} custom="CtaBand" params={{ cta_location: location }} className="btn btn-red w-full">
            {primary.label} <IconArrow size={18} />
          </TrackedLink>
          <BookButton location={location} className="w-full" />
          <CallButton location={location} className="w-full text-white" />
        </div>
      </div>
    </section>
  );
}

/** "Talk to the broker directly" proof block. Uses only facts stated by the firm. */
export function BrokerCard({ heading = "You work directly with the broker" }: { heading?: string }) {
  const a = people.antony;
  return (
    <div className="card grid overflow-hidden md:grid-cols-[240px_1fr]">
      <div className="relative min-h-[260px] bg-gradient-to-b from-sand to-[#d9d1c5]">
        <Image src={a.cutout} alt={`${a.name}, Broker of Record at Prime 1 Realty`} fill sizes="(min-width:768px) 240px, 100vw" className="object-contain object-bottom" />
      </div>
      <div className="p-6 md:p-8">
        <p className="eyebrow">Accountable leadership</p>
        <h3 className="mt-3 text-2xl md:text-3xl">{heading}</h3>
        <p className="mt-3 leading-relaxed text-muted">
          {a.name} is Broker of Record for Prime 1 Realty and Designated Community Association Manager for Prime 1 Property Management. Your request goes to a licensed professional, not a call center.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {["Licensed FL brokerage", "Licensed FL CAM firm", "REALTOR®", "EPA Lead-Safe Certified Firm"].map((b) => (
            <li key={b} className="rounded-full bg-paper px-3 py-1 font-semibold ring-1 ring-line">{b}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/team/${a.slug}`} className="btn btn-ink">Meet Antony</Link>
          <CallButton location="broker_card" />
        </div>
      </div>
    </div>
  );
}

export function RelatedLinks({ links }: { links: { label: string; href: string; desc: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="card group flex items-start justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
          <span>
            <span className="block font-semibold">{l.label}</span>
            <span className="mt-1 block text-sm text-muted">{l.desc}</span>
          </span>
          <IconArrow size={18} className="mt-1 shrink-0 text-red transition group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
}

export function Photo({ src, alt, ratio = "4/3", className, sizes = "(min-width:1024px) 50vw, 100vw", priority }: { src: string; alt: string; ratio?: string; className?: string; sizes?: string; priority?: boolean }) {
  return (
    <div className={cn("photo", className)} style={{ aspectRatio: ratio }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}

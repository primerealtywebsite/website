import { notFound } from "next/navigation";
import Link from "next/link";
import { BookButton, CallButton } from "@/components/sections/Blocks";
import { FirstName } from "@/components/funnel/FirstName";
import { IconCheck } from "@/components/icons";
import { pageMeta } from "@/lib/seo";

const COPY: Record<string, { title: string; next: string[]; link: { label: string; href: string } }> = {
  sell: { title: "Your property analysis is in progress", next: ["A broker reviews recent sales near your home", "We prepare your pricing range and notes", "We contact you, usually within one business day"], link: { label: "See how we sell homes", href: "/sell-your-home" } },
  valuation: { title: "Your home value report is on its way", next: ["A broker reviews nearby sales and listings", "We prepare your value range", "We send it, usually within one business day"], link: { label: "Thinking of selling? See our process", href: "/sell-your-home" } },
  buy: { title: "Your home search is underway", next: ["We review your area, budget and timing", "We send homes that match", "We set up tours when you're ready"], link: { label: "Estimate your monthly payment", href: "/financing" } },
  rent: { title: "We're finding rentals for you", next: ["We review your area, size and budget", "We send available homes that match", "We help you apply online"], link: { label: "Review resident services", href: "/resident_services" } },
  management: { title: "Your management proposal request is in", next: ["Our Designated CAM reviews your request", "We review the scope and site coverage and may ask for documents", "We present a written proposal to the board"], link: { label: "Read: Why a Designated CAM matters", href: "/blog/florida-designated-cam-license-explained" } },
  commercial: { title: "A commercial broker will be in touch", next: ["We review your objectives and criteria", "We prepare initial options or analysis", "We schedule a confidential conversation"], link: { label: "Explore commercial services", href: "/commercial" } },
  careers: { title: "Thanks for your interest in Prime 1", next: ["Review the complete agent offer and FAQ", "Apply online with your license and production details", "The broker reviews every application before any next step"], link: { label: "Review the offer and apply", href: "/join" } },
  contact: { title: "Thanks, we received your message", next: ["We read every message personally", "We reply within one business day", "Need us sooner? Call (813) 295-8215, Mon–Fri 9–5 ET"], link: { label: "Back to home", href: "/" } },
};

export function generateStaticParams() {
  return Object.keys(COPY).map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps<"/thank-you/[type]">) {
  const { type } = await params;
  return pageMeta({ title: "Thank You | Prime 1 Realty", description: COPY[type]?.title ?? "Thank you", path: `/thank-you/${type}`, noindex: true });
}

export default async function ThankYou({ params }: PageProps<"/thank-you/[type]">) {
  const { type } = await params;
  const c = COPY[type];
  if (!c) notFound();
  return (
    <section className="bg-paper py-14 md:py-20">
      <div className="container-x max-w-3xl">
        <span className="grid size-14 place-items-center rounded-full bg-ok text-white"><IconCheck size={28} /></span>
        <p className="mt-6 text-lg text-muted">Thank you<FirstName />.</p>
        <h1 className="mt-1 text-[2.2rem] leading-tight md:text-5xl">{c.title}</h1>
        <div className="card mt-8 p-6 md:p-8">
          <h2 className="font-sans text-lg font-bold">What happens next</h2>
          <ol className="mt-4 space-y-3">
            {c.next.map((n, i) => (
              <li key={n} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                <span className="pt-0.5">{n}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-8 rounded-[var(--radius-card)] bg-ink p-6 text-white md:p-8">
          <h2 className="text-2xl">Want to talk sooner?</h2>
          <p className="mt-2 text-white/75">Pick a time that works for you, or call the office now.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <BookButton location={`thank_you_${type}`} />
            <CallButton location={`thank_you_${type}`} className="text-white" />
          </div>
        </div>
        <Link href={c.link.href} className="mt-8 inline-block font-bold text-red hover:underline">{c.link.label} →</Link>
      </div>
    </section>
  );
}

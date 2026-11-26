import { Funnel } from "@/components/funnel/Funnel";
import { CallButton } from "@/components/sections/Blocks";
import { IconCheck } from "@/components/icons";
import { pageMeta } from "@/lib/seo";
import { site } from "@/config/site";

export const metadata = pageMeta({
  title: "Get Started with Prime 1 Realty | Florida Real Estate",
  description: "Selling, buying, leasing or need association management anywhere in Florida? Answer a few quick questions and a licensed Prime 1 professional will follow up.",
  path: "/get-started",
});

export default function GetStarted() {
  return (
    <section className="bg-paper py-8 md:py-14">
      <div className="container-x grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:pt-8">
          <p className="eyebrow">Free · No obligation · 60 seconds</p>
          <h1 className="mt-3 text-[2.2rem] leading-[1.08] md:text-5xl">Let&apos;s find the right next step for you</h1>
          <p className="mt-4 text-lg text-muted">Answer a few quick questions and we email you a clear next step. A licensed Prime 1 professional reviews your answers and follows up, usually within one business day.</p>
          <div className="mt-5 md:hidden">
            <CallButton location="get_started_mobile" label={`Call now: ${site.phone.display}`} className="btn-red w-full border-0 text-white" />
            <p className="mt-2 text-center text-sm text-muted">Office {site.phone.answered}. Or answer a few questions below.</p>
          </div>
          <ul className="mt-6 hidden gap-3 lg:grid">
            {["Sellers get a broker property analysis", "Buyers and renters get matching homes", "Association boards get a written management proposal"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-red text-white"><IconCheck size={14} /></span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden lg:block">
            <CallButton location="get_started" />
          </div>
        </div>
        <Funnel variant="page" className="rounded-[18px] border border-line shadow-[var(--shadow-lift)]" />
      </div>
    </section>
  );
}

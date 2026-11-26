import Image from "next/image";
import Link from "next/link";
import { NAV, PORTALS } from "@/config/nav";
import { site } from "@/config/site";
import { TrackedLink } from "@/components/analytics/Tracked";
import { IconMail, IconPhone, IconPin } from "@/components/icons";

const AREAS = [
  { label: "Tampa", href: "/areas/tampa" },
  { label: "Brandon", href: "/areas/brandon" },
  { label: "Riverview", href: "/areas/riverview" },
  { label: "Clearwater", href: "/areas/clearwater" },
  { label: "St. Petersburg", href: "/areas/st-petersburg" },
];

export function Footer() {
  const year = process.env.BUILD_YEAR;
  return (
    <footer data-site-chrome="footer" className="bg-ink text-white/75">
      <div className="container-x grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Image src="/images/brand/prime1-realty-logo.png" alt="Prime 1 Realty & Property Management" width={365} height={171} className="h-14 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Prime 1 Realty is a licensed Florida real estate brokerage. Prime 1 Property Management is a licensed Florida community association management firm. Both are headquartered in Tampa and serve clients throughout Florida.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li>
              <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "footer" }} className="inline-flex items-center gap-2 font-bold text-white hover:text-red">
                <IconPhone size={18} /> {site.phone.display}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={`mailto:${site.email}`} event="Contact" params={{ method: "email", cta_location: "footer" }} className="inline-flex items-center gap-2 hover:text-white">
                <IconMail size={18} /> {site.email}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={site.mapsUrl} event="FindLocation" params={{ cta_location: "footer" }} className="inline-flex items-start gap-2 hover:text-white">
                <IconPin size={18} className="mt-0.5 shrink-0" />
                <span>
                  {site.address.street}
                  <br />
                  {site.address.city}, {site.address.region} {site.address.postal}
                </span>
              </TrackedLink>
            </li>
            <li className="text-white/60">Office: {site.hours.label}. {site.hours.note}.</li>
            <li className="text-white/60">Community association emergencies: 24/7 live answering · {site.phone.callsOnly.toLowerCase()}</li>
          </ul>
          <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-[.14em] text-white">Portal login</p>
          <ul className="space-y-1.5 text-sm">
            {PORTALS.map((p) => (
              <li key={p.label}>
                <TrackedLink href={p.href} custom="PortalLogin" params={{ portal: p.label }} className="hover:text-white">{p.label}</TrackedLink>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-8">
          {NAV.slice(0, 4).map((g) => (
            <div key={g.label}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-white">{g.label}</p>
              <ul className="space-y-2 text-sm">
                {g.items.map((it) => (
                  <li key={it.label}>
                    <TrackedLink href={it.href} event={it.event} custom={it.custom} params={{ ...it.params, cta_location: "footer" }} className="hover:text-white">
                      {it.label}
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-white">Commercial</p>
            <ul className="space-y-2 text-sm">
              {NAV[4].items.map((it) => (
                <li key={it.label}>
                  <TrackedLink href={it.href} event={it.event} custom={it.custom} params={it.params} className="hover:text-white">{it.label}</TrackedLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-white">Company</p>
            <ul className="space-y-2 text-sm">
              {NAV[5].items.map((it) => (
                <li key={it.label}>
                  <TrackedLink href={it.href} event={it.event} custom={it.custom} params={it.params} className="hover:text-white">{it.label}</TrackedLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-white">Serving all of Florida · Local guides</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {AREAS.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="hover:text-white">{a.label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {Object.entries(site.socials).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener me" className="rounded-md border border-white/15 px-2.5 py-1 capitalize hover:border-white/40 hover:text-white">
                  {k === "x" ? "X" : k}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <a href="https://www.hud.gov/program_offices/fair_housing_equal_opp" target="_blank" rel="noopener" aria-label="Equal Housing Opportunity">
              <Image src="/images/brand/equal-housing-opportunity.png" alt="Equal Housing Opportunity" width={160} height={142} className="h-12 w-auto" />
            </a>
            <Image src="/images/brand/realtor-mark-white.png" alt="REALTOR® member of the National Association of REALTORS®" width={140} height={170} className="h-12 w-auto" />
            <a href="https://www.epa.gov/lead/lead-safe-certification-firm-logo-use-guidelines" target="_blank" rel="noopener">
              <Image src="/images/brand/epa-lead-safe-certified-firm.png" alt="EPA Lead-Safe Certified Firm" width={200} height={146} className="h-12 w-auto rounded bg-white p-1" />
            </a>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-white/55">
            {site.name} is a licensed Florida real estate brokerage. {site.pmName} is a licensed Florida community association management firm. Both are DBAs of {site.legalName}. Antony Oseitutu, Broker of Record and Designated CAM. Equal Housing Opportunity. We are pledged to the letter and spirit of U.S. policy for the achievement of equal housing opportunity throughout the nation.
          </p>
        </div>
        <div className="container-x flex flex-col gap-2 pb-8 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© {year} {site.legalName}, d/b/a {site.name} and {site.pmName}. All rights reserved.</p>
          <p className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/term-conditions" className="hover:text-white">Terms &amp; Conditions</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

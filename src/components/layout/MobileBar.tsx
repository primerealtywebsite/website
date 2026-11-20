"use client";

import { usePathname } from "next/navigation";
import { ctaFor } from "@/config/nav";
import { site } from "@/config/site";
import { TrackedLink } from "@/components/analytics/Tracked";
import { IconArrow, IconPhone } from "@/components/icons";
import type { StandardEvent } from "@/lib/meta";

/**
 * Fixed action bar on phones. Calling is the #1 conversion on mobile (the office line is calls only,
 * no texting), so "Call now" is the big red primary button and the page's form action is secondary.
 * Agent recruiting pages are the exception: there the application is primary.
 */
export function MobileBar() {
  const pathname = usePathname() || "/";
  const cta = ctaFor(pathname);
  const recruiting = cta.leadType === "careers";
  // Schedule only for a real calendar link; everything else is a custom click event.
  const event: StandardEvent | undefined = site.bookingConfigured && cta.href === site.bookingUrl ? "Schedule" : cta.href.startsWith("tel:") ? "Contact" : undefined;
  const custom = event ? undefined : recruiting ? "JoinClick" : "MobileBarCTA";
  const ctaIsCall = cta.href.startsWith("tel:");

  const call = (
    <TrackedLink
      href={site.phone.href}
      event="Contact"
      params={{ method: "phone", cta_location: "mobile_bar" }}
      className={recruiting ? "btn min-h-[54px] bg-white/10 text-white" : "btn btn-red min-h-[54px] text-[1.05rem]"}
    >
      <IconPhone size={19} /> {recruiting ? "Call" : "Call now"}
    </TrackedLink>
  );
  const action = ctaIsCall ? null : (
    <TrackedLink
      href={cta.href}
      event={event}
      custom={custom}
      params={{ lead_type: cta.leadType, cta_location: "mobile_bar" }}
      className={recruiting ? "btn btn-red min-h-[54px]" : "btn min-h-[54px] bg-white/10 whitespace-normal px-2.5 text-center text-[0.88rem] leading-tight text-white"}
    >
      {cta.label} {recruiting && <IconArrow size={18} />}
    </TrackedLink>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
      <div className={`mx-auto grid max-w-md gap-2 ${action ? (recruiting ? "grid-cols-[1fr_1.6fr]" : "grid-cols-[1.5fr_1fr]") : "grid-cols-1"}`}>
        {call}
        {action}
      </div>
    </div>
  );
}

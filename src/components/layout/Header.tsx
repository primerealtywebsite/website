"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV, PORTALS } from "@/config/nav";
import { site } from "@/config/site";
import { TrackedLink } from "@/components/analytics/Tracked";
import { IconChevron, IconClose, IconLock, IconMenu, IconPhone } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={cn("sticky top-0 z-50 bg-ink text-white transition-shadow", scrolled && "shadow-[0_10px_30px_-12px_rgba(0,0,0,.6)]")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div className="container-x flex h-[68px] items-center gap-4 lg:h-[76px]">
        <Link href="/" className="shrink-0" aria-label="Prime 1 Realty home">
          <Image src="/images/brand/prime1-realty-logo.png" alt="Prime 1 Realty & Property Management" width={365} height={171} priority className="h-11 w-auto lg:h-[52px]" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="ml-2 hidden flex-1 lg:block">
          <ul className="flex items-center">
            {NAV.map((g) => (
              <li key={g.label} className="group relative">
                <Link
                  href={g.href}
                  className="flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-[0.95rem] font-semibold xl:px-3 text-white/90 hover:text-white group-focus-within:text-white"
                >
                  {g.label}
                  <IconChevron size={15} className="opacity-60 transition group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="w-[300px] rounded-xl border border-line bg-white p-2 text-ink shadow-[var(--shadow-lift)]">
                    {g.items.map((it) => (
                      <li key={it.label}>
                        <TrackedLink href={it.href} event={it.event} custom={it.custom} params={{ ...it.params, cta_location: "nav" }} className="block rounded-lg px-3 py-2.5 hover:bg-paper">
                          <span className="block text-[0.95rem] font-semibold">{it.label}</span>
                          {it.desc && <span className="block text-[0.8rem] text-muted">{it.desc}</span>}
                        </TrackedLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Portal login */}
          <div className="group relative hidden xl:block">
            <button type="button" className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-white/80 hover:text-white">
              <IconLock size={16} /> Login
            </button>
            <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="w-[280px] rounded-xl border border-line bg-white p-2 text-ink shadow-[var(--shadow-lift)]">
                {PORTALS.map((p) => (
                  <li key={p.label}>
                    <TrackedLink href={p.href} custom="PortalLogin" params={{ portal: p.label }} className="block rounded-lg px-3 py-2.5 hover:bg-paper">
                      <span className="block text-sm font-semibold">{p.label}</span>
                      {p.desc && <span className="block text-xs text-muted">{p.desc}</span>}
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <TrackedLink
            href={site.phone.href}
            event="Contact"
            params={{ method: "phone", cta_location: "header" }}
            className="hidden items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-bold text-white hover:bg-white/10 sm:inline-flex"
          >
            <IconPhone size={18} className="text-red" />
            <span className="tabular-nums lg:max-xl:sr-only">{site.phone.display}</span>
          </TrackedLink>
          <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "header_mobile" }} className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-red px-3.5 font-bold text-white sm:hidden" aria-label={`Call ${site.phone.display}`}>
            <IconPhone size={18} /> Call
          </TrackedLink>
          <Link
            href="/join"
            className="btn hidden min-h-11 border border-white/25 px-4 text-white hover:border-white hover:bg-white/10 min-[1400px]:inline-flex"
          >
            Join Prime 1
          </Link>
          <Link href="/get-started" className="btn btn-red hidden min-h-11 md:inline-flex">
            Get started
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg bg-white/10 lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <IconMenu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn("fixed inset-0 z-[60] lg:hidden", open ? "visible" : "invisible")}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <button type="button" aria-label="Close menu" className={cn("absolute inset-0 bg-black/50 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <div className={cn("absolute inset-y-0 right-0 flex w-[88%] max-w-[400px] flex-col bg-white text-ink transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")}>
          <div className="flex h-[68px] items-center justify-between border-b border-line px-4">
            <span className="font-display text-xl">Menu</span>
            <button type="button" className="grid size-11 place-items-center rounded-lg hover:bg-paper" aria-label="Close menu" onClick={() => setOpen(false)}>
              <IconClose size={22} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-2">
            {NAV.map((g) => (
              <details key={g.label} className="border-b border-line">
                <summary className="flex items-center justify-between px-3 py-4 text-lg font-semibold">
                  {g.label}
                  <IconChevron size={18} className="text-muted" />
                </summary>
                <ul className="pb-3">
                  {g.items.map((it) => (
                    <li key={it.label}>
                      <TrackedLink href={it.href} event={it.event} custom={it.custom} params={{ ...it.params, cta_location: "mobile_nav" }} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-2.5 text-[0.98rem] hover:bg-paper">
                        {it.label}
                      </TrackedLink>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <details className="border-b border-line">
              <summary className="flex items-center justify-between px-3 py-4 text-lg font-semibold">
                Portal login <IconChevron size={18} className="text-muted" />
              </summary>
              <ul className="pb-3">
                {PORTALS.map((p) => (
                  <li key={p.label}>
                    <TrackedLink href={p.href} custom="PortalLogin" params={{ portal: p.label }} className="block rounded-lg px-4 py-2.5 hover:bg-paper">
                      {p.label}
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            </details>
          </nav>
          <div className="grid gap-2 border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "mobile_menu" }} className="btn btn-red w-full">
              <IconPhone size={18} /> Call now: {site.phone.display}
            </TrackedLink>
            <Link href="/get-started" onClick={() => setOpen(false)} className="btn btn-ghost w-full">
              Get started online — 60 seconds
            </Link>
            <Link href="/join" onClick={() => setOpen(false)} className="mt-1 text-center text-sm font-semibold text-muted underline underline-offset-4">
              Licensed agent? Join Prime 1
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

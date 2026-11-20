"use client";

import { useEffect, useState, type ReactNode } from "react";
import { trackCustom } from "@/lib/meta";
import { IconArrow, IconMail } from "@/components/icons";

/**
 * Phones: calling is the main action, so the questionnaire stays folded behind one tap
 * ("Prefer to send your details?"). Desktop (md and up): always open, because the form is the
 * main channel there. Any "#start" link (mobile bar, CTAs) opens it and scrolls to it.
 */
export function MobileFormReveal({ children, label = "Prefer to send your details instead?" }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reveal = () => {
      setOpen(true);
      requestAnimationFrame(() => {
        const el = document.getElementById("start");
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: "smooth" });
      });
    };
    if (window.location.hash === "#start") reveal();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href$="#start"]');
      if (!a) return;
      const url = new URL((a as HTMLAnchorElement).href, window.location.href);
      if (url.pathname !== window.location.pathname) return;
      e.preventDefault();
      reveal();
    };
    const onHash = () => window.location.hash === "#start" && reveal();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            trackCustom("MobileFormOpen", { cta_location: "hero" });
          }}
          className="btn w-full whitespace-normal border border-white/25 bg-white/5 text-center text-white md:hidden"
        >
          <IconMail size={18} /> {label} <IconArrow size={16} />
        </button>
      )}
      <div className={open ? "" : "hidden md:block"}>{children}</div>
    </>
  );
}

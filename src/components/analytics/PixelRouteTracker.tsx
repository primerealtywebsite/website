"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { captureAttribution, trackCustom } from "@/lib/meta";

export function PixelRouteTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  // Keep the Meta click ID even if the pixel script is blocked, so the Conversions API can attribute
  // the lead to the ad (Meta's recommended _fbc format: fb.1.<timestamp>.<fbclid>).
  useEffect(() => {
    captureAttribution();
    try {
      const fbclid = new URLSearchParams(window.location.search).get("fbclid");
      if (fbclid && !document.cookie.includes("_fbc=")) {
        document.cookie = `_fbc=fb.1.${Date.now()}.${encodeURIComponent(fbclid)}; path=/; max-age=${90 * 86400}; SameSite=Lax; Secure`;
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Every button / CTA click on the site goes to Meta (custom "ButtonClick") and Google ("button_click"),
  // with the button's visible label, where it goes and which section it was in. Phone and email taps are
  // already tracked as Contact (Google: click_to_call / click_to_email), and the questionnaire has its own
  // QuizStep events, so those are skipped here to avoid double counting.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button, summary");
      if (!el || el.closest("[data-no-click-track]")) return;
      const href = el.getAttribute("href") ?? "";
      if (/^(tel|mailto|sms):/.test(href)) return;
      const isCta = el.matches(".btn, header a, header button, nav a, [data-loc] a, a[href*='#start'], a[href*='#apply']") || el.tagName === "BUTTON";
      if (!isCta) return;
      const text = (el as HTMLElement).innerText || el.textContent || "";
      const label = (el.getAttribute("aria-label") || text.split("\n").map((t) => t.trim()).find(Boolean) || "").replace(/\s+/g, " ").slice(0, 60);
      if (!label) return;
      const section = el.closest("header") ? "header" : el.closest("footer") ? "footer" : el.closest("nav") ? "nav" : el.closest(".fixed.bottom-0") ? "mobile_bar" : (el.closest("section[id], div[id]")?.id || "page");
      trackCustom("ButtonClick", { button_text: label, link_url: href.slice(0, 120) || undefined, cta_location: section });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false; // the base code already fired PageView for the landing page
      return;
    }
    window.fbq?.("track", "PageView");
    window.gtag?.("event", "page_view", { page_path: pathname });
  }, [pathname]);
  return null;
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/config/site";
import { setGoogleUserData, track, trackCustom } from "@/lib/meta";

/**
 * Inline Calendly scheduler for a 30-minute call with Antony. No third-party script: a plain iframe
 * (loaded when it scrolls near view) plus Calendly's postMessage events, so a real booking fires
 * Meta "Schedule" and the Google Ads schedule conversion exactly once.
 */
export function CalendlyEmbed({ name, email, phone, notes, location, className }: { name?: string; email?: string; phone?: string; notes?: string; location: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [host, setHost] = useState("");
  const booked = useRef(false);

  useEffect(() => {
    setHost(window.location.host); // eslint-disable-line react-hooks/set-state-in-effect -- needs window
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setShow(true), { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com" || typeof e.data?.event !== "string") return;
      if (e.data.event === "calendly.date_and_time_selected") trackCustom("RecruitingTimeSelected", { cta_location: location });
      if (e.data.event === "calendly.event_scheduled" && !booked.current) {
        booked.current = true;
        if (email) setGoogleUserData({ email });
        track("Schedule", { content_category: "agent_recruiting", cta_location: location });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [location, email]);

  const src = useMemo(() => {
    const u = new URL(site.recruiting.calendly);
    u.searchParams.set("embed_type", "Inline");
    if (host) u.searchParams.set("embed_domain", host);
    u.searchParams.set("hide_gdpr_banner", "1");
    u.searchParams.set("primary_color", "d90a0a");
    if (name) u.searchParams.set("name", name);
    if (email) u.searchParams.set("email", email);
    // Antony's event is "Phone call: I will call my invitee", so pre-fill the number he should call
    // and the event's one question ("Please share anything that will help prepare for our meeting.").
    const digits = (phone ?? "").replace(/\D/g, "");
    if (digits.length === 10) u.searchParams.set("location", `+1${digits}`);
    if (notes) u.searchParams.set("a1", notes.slice(0, 500));
    return u.toString();
  }, [host, name, email, phone, notes]);

  return (
    <div ref={box} className={className}>
      {show && host ? (
        <iframe src={src} title="Book a 30-minute call with Antony Oseitutu" className="h-[1060px] w-full rounded-xl border-0 bg-white sm:h-[760px]" loading="lazy" />
      ) : (
        <div className="grid h-[400px] place-items-center rounded-xl bg-white text-muted">Loading calendar…</div>
      )}
      <p className="mt-3 text-center text-sm text-muted">
        Calendar not loading?{" "}
        <a href={site.recruiting.calendly} target="_blank" rel="noopener" onClick={() => trackCustom("RecruitingCalendlyOpen", { cta_location: location })} className="font-semibold text-ink underline underline-offset-4">
          Open it in a new tab
        </a>
      </p>
    </div>
  );
}

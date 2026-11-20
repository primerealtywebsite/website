"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { site } from "@/config/site";
import { getAttribution, newEventId, serviceLineFor, setGoogleUserData, track, trackCustom, type LeadType } from "@/lib/meta";
import { IconCheck, IconClock, IconClose, IconPhone } from "@/components/icons";

/**
 * Desktop computers can't place calls from a tel: link, so on desktop (mouse + hover) every phone
 * link opens this panel instead: number + copy, a scan-to-call QR code, and a "call me back" form.
 * Phones keep native tap-to-call. The office number is calls only (no texting).
 *
 * Tracking: opening the panel or copying the number are custom events (no real contact yet).
 * Submitting "call me back" is a real Lead.
 */
const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function ContactDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [from, setFrom] = useState("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", consent: false, hp: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    // Capture phase on window runs before React's handlers, so the click is never logged as a Meta "Contact".
    const onClick = (e: MouseEvent) => {
      if (!isDesktop() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      const loc = a.closest("[data-loc]")?.getAttribute("data-loc") ?? window.location.pathname;
      setFrom(loc);
      setCopied(false);
      setStatus((s) => (s === "done" ? "done" : "idle"));
      ref.current?.showModal();
      trackCustom("ContactPanelOpen", { cta_location: loc });
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  const close = () => ref.current?.close();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.phone.display);
      setCopied(true);
      trackCustom("PhoneNumberCopied", { cta_location: from });
    } catch {
      /* ignore */
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your name.");
    if (form.phone.replace(/\D/g, "").length < 10) return setError("Please enter a 10-digit phone number.");
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Please enter a valid email.");
    setStatus("sending");
    const eventId = newEventId();
    // Label the request with the service the visitor is looking at (or landed on from an ad), e.g. property management.
    let line: string = serviceLineFor(window.location.pathname);
    try {
      if (line === "general") line = sessionStorage.getItem("p1-landing-service") || line;
    } catch {
      /* ignore */
    }
    const leadType: LeadType = line === "general" ? "contact" : (line as LeadType);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadType,
          name: form.name,
          phone: form.phone,
          email: form.email.trim(),
          smsConsent: form.consent,
          answers: { request: "Call me back", from },
          eventId,
          pageUrl: window.location.href,
          utm: getAttribution(),
          company_website: form.hp,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Something went wrong.");
      setGoogleUserData({ email: form.email.trim() || undefined, phone: form.phone });
      track("Lead", { lead_type: leadType, content_category: "call_back_request" }, { eventId, server: false });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const input = "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-base outline-none focus:border-ink";

  return (
    <dialog
      ref={ref}
      aria-labelledby="contact-dialog-title"
      onClick={(e) => e.target === ref.current && close()}
      className="m-auto w-[min(860px,calc(100vw-2rem))] overflow-hidden rounded-[18px] p-0 text-ink shadow-[var(--shadow-lift)] backdrop:bg-black/60"
    >
      <div className="grid md:grid-cols-[1.05fr_1fr]">
        {/* Left: number + QR */}
        <div className="bg-ink p-7 text-white">
          <p className="eyebrow text-[#ff5a5a]">Call Prime 1</p>
          <h2 id="contact-dialog-title" className="mt-3 text-3xl leading-tight">Talk to a licensed professional</h2>
          <div className="mt-5 flex items-center gap-3">
            <span className="font-display text-[2.1rem] tabular-nums">{site.phone.display}</span>
            <button type="button" onClick={copy} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/65">
            <IconClock size={15} /> {site.phone.answered}
          </p>
          <figure className="mt-6 flex items-center gap-5 rounded-xl bg-white p-4 text-ink">
            <Image src="/qr/call-prime1.svg" alt="QR code that calls Prime 1 Realty" width={140} height={140} className="h-auto w-[130px] shrink-0" unoptimized />
            <figcaption>
              <span className="block text-lg font-semibold">Scan to call from your phone</span>
              <span className="mt-1 block text-sm text-muted">Point your phone&apos;s camera at the code and tap the number to call our office.</span>
            </figcaption>
          </figure>
        </div>

        {/* Right: call me back */}
        <div className="relative p-7">
          <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 grid size-10 place-items-center rounded-lg hover:bg-paper">
            <IconClose size={20} />
          </button>
          {status === "done" ? (
            <div className="pt-6">
              <span className="grid size-12 place-items-center rounded-full bg-ok text-white"><IconCheck size={24} /></span>
              <h3 className="mt-4 text-2xl">Got it. We&apos;ll reach out shortly.</h3>
              <p className="mt-2 text-muted">During office hours we usually reply the same day. After hours, expect us the next business morning.</p>
              <button type="button" onClick={close} className="btn btn-ink mt-6">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h3 className="pr-10 text-2xl leading-tight">Rather we call you?</h3>
              <p className="mt-1.5 text-muted">Leave your number and a licensed Prime 1 professional will call you back.</p>
              <div className="mt-5 grid gap-3">
                <label>
                  <span className="mb-1 block text-sm font-semibold">Name</span>
                  <input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold">Phone number</span>
                  <input type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(813) 555-0123" value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} className={input} />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold">Email <span className="font-normal text-muted">(optional)</span></span>
                  <input type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
                </label>
                <input tabIndex={-1} aria-hidden autoComplete="off" value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })} className="absolute left-[-9999px] h-0 w-0 opacity-0" />
                <label className="flex items-start gap-2.5 text-[0.78rem] leading-snug text-muted">
                  <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 size-4 accent-red" />
                  <span>
                    You may call me about my request, including with automated technology. Consent is not a condition of purchase. <a href="/privacy-policy" className="underline">Privacy</a>.
                  </span>
                </label>
              </div>
              {error && <p role="alert" className="mt-3 rounded-lg bg-red-soft px-3 py-2 text-sm font-semibold text-red-deep">{error}</p>}
              <button type="submit" disabled={status === "sending"} className="btn btn-red mt-4 w-full disabled:opacity-70">
                <IconPhone size={18} /> {status === "sending" ? "Sending…" : "Call me back"}
              </button>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}

"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { site } from "@/config/site";
import { getAttribution, newEventId, setGoogleUserData, track, trackCustom } from "@/lib/meta";
import { IconArrow, IconCheck, IconLock } from "@/components/icons";

const empty = { firstName: "", lastName: "", email: "", phone: "", license: "", years: "", associations: "", hours: "", availability: "", message: "", hp: "" };
const inputCls = "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-base outline-none placeholder:text-muted/60 focus:border-ink";

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Application for the part-time hourly LCAM role. Goes to Antony (Designated CAM) with admin + support copied. */
export function LcamForm() {
  const [f, setF] = useState(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => {
    if (!started) {
      setStarted(true);
      trackCustom("LcamFormStart", { cta_location: "lcam_jobs" });
    }
    setF((s) => ({ ...s, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.firstName.trim() || !f.lastName.trim()) return setError("Please enter your first and last name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError("Please enter a valid email.");
    if (f.phone.replace(/\D/g, "").length < 10) return setError("Please enter a 10-digit phone number.");
    if (f.license.replace(/\W/g, "").length < 4) return setError("Please enter your Florida CAM license number (e.g. CAM12345).");
    setStatus("sending");
    const eventId = newEventId();
    try {
      const res = await fetch("/api/lcam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, company_website: f.hp, hp: undefined, eventId, pageUrl: window.location.href, utm: getAttribution() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || `Something went wrong. Please email ${site.recruiting.email}.`);
      setGoogleUserData({ email: f.email, phone: f.phone, firstName: f.firstName, lastName: f.lastName });
      track("SubmitApplication", { content_category: "lcam_recruiting" }, { eventId, server: false });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "done") {
    return (
      <div id="apply" className="scroll-mt-24 rounded-[18px] border border-line bg-white p-6 text-ink shadow-[var(--shadow-lift)] sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-ok text-white"><IconCheck size={24} /></span>
        <h2 className="mt-4 text-[1.8rem] leading-tight">Thanks, {f.firstName}. Your application is in.</h2>
        <p className="mt-2 text-muted">Antony Oseitutu, our Designated CAM, reviews every application and will contact you at <b className="text-ink">{f.email}</b>. A confirmation is on its way.</p>
      </div>
    );
  }

  return (
    <form id="apply" onSubmit={submit} noValidate data-no-click-track className="relative scroll-mt-24 rounded-[18px] border border-line bg-white p-5 text-ink shadow-[var(--shadow-lift)] sm:p-7">
      <h2 className="font-display text-[1.65rem] leading-tight sm:text-[1.85rem]">Apply for the LCAM position</h2>
      <p className="mt-1.5 text-[0.95rem] text-muted">Part-time, $30 an hour, up to 20 hours a week. Takes about 2 minutes.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="First name" id="l-first"><input id="l-first" autoComplete="given-name" value={f.firstName} onChange={set("firstName")} className={inputCls} /></Field>
        <Field label="Last name" id="l-last"><input id="l-last" autoComplete="family-name" value={f.lastName} onChange={set("lastName")} className={inputCls} /></Field>
        <Field label="Email" id="l-email"><input id="l-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set("email")} className={inputCls} /></Field>
        <Field label="Mobile phone" id="l-phone"><input id="l-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(813) 555-0123" value={f.phone} onChange={set("phone")} className={inputCls} /></Field>
        <Field label="FL CAM license number" id="l-lic"><input id="l-lic" autoComplete="off" placeholder="CAM12345" value={f.license} onChange={set("license")} className={`${inputCls} uppercase placeholder:normal-case`} /></Field>
        <Field label="Years as a licensed CAM" id="l-years" optional>
          <select id="l-years" value={f.years} onChange={set("years")} className={inputCls}>
            <option value="">Choose…</option>
            {["Newly licensed", "1–2", "3–5", "6–10", "10+"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Hours per week you want" id="l-hours" optional>
          <select id="l-hours" value={f.hours} onChange={set("hours")} className={inputCls}>
            <option value="">Choose…</option>
            {["Up to 10", "10–15", "15–20"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Associations you manage or managed" id="l-assoc" optional>
          <input id="l-assoc" placeholder="e.g. 3 condos, 1 HOA (40–200 units)" value={f.associations} onChange={set("associations")} className={inputCls} />
        </Field>
        <Field label="Days and times you're available" id="l-avail" optional className="sm:col-span-2">
          <input id="l-avail" placeholder="e.g. weekday mornings, two evenings a month" value={f.availability} onChange={set("availability")} className={inputCls} />
        </Field>
        <Field label="Anything else?" id="l-msg" optional className="sm:col-span-2">
          <textarea id="l-msg" rows={2} value={f.message} onChange={set("message")} className={`${inputCls} h-auto py-3`} />
        </Field>
        <input tabIndex={-1} aria-hidden autoComplete="off" value={f.hp} onChange={set("hp")} className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-soft px-3 py-2 text-sm font-semibold text-red-deep">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="btn btn-red mt-5 w-full text-base disabled:opacity-70">
        {status === "sending" ? "Sending…" : "Submit my application"} {status !== "sending" && <IconArrow size={18} />}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"><IconLock size={14} /> Confidential. Goes directly to our Designated CAM.</p>
    </form>
  );
}

function Field({ label, id, optional, className, children }: { label: string; id: string; optional?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

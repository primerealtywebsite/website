"use client";

import { useState, type ReactNode } from "react";
import { trackCustom } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { IconArrow, IconCheck, IconDoc, IconLock } from "@/components/icons";

const inputCls = "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-base text-ink outline-none placeholder:text-muted/60 focus:border-ink";
const YEARS = ["Less than 2 years", "2 to 5 years", "5 to 10 years", "10 or more years"];
const PREFS = ["Part time", "Full time", "Either"] as const;

/** LCAM employment application with résumé upload (Prime 1 Property Management, W-2). */
export function EmploymentForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (state === "done") {
    return (
      <div id="apply" className="scroll-mt-24 rounded-[18px] border border-line bg-white p-6 text-ink shadow-[var(--shadow-lift)] sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-ok text-white"><IconCheck size={24} /></span>
        <h2 className="mt-4 text-[1.8rem] leading-tight">Application received</h2>
        <p className="mt-2 text-muted">Thank you. Your application and résumé are on file for future employment consideration. There are currently no open positions; we will contact you if a position that fits your preference becomes available. A confirmation is on its way to your email.</p>
      </div>
    );
  }

  return (
    <form
      id="apply"
      noValidate
      data-no-click-track
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        const fd = new FormData(e.currentTarget);
        const need: [string, string][] = [["firstName", "first name"], ["lastName", "last name"], ["email", "email"], ["phone", "phone"], ["license", "Florida CAM license number"], ["years", "years of experience"], ["experience", "relevant experience"], ["preference", "employment preference"], ["availability", "availability"]];
        for (const [k, l] of need) if (!String(fd.get(k) ?? "").trim()) return setErr(`Please add your ${l}.`);
        if (String(fd.get("experience")).trim().length < 10) return setErr("Please describe your relevant association management experience.");
        if (!file) return setErr("Please attach your résumé (PDF or Word).");
        if (file.size > 4 * 1024 * 1024) return setErr("Your résumé is larger than 4 MB. Please attach a smaller file.");
        fd.set("resume", file);
        fd.set("pageUrl", location.href);
        setState("sending");
        const r = await fetch("/api/employment", { method: "POST", body: fd }).catch(() => null);
        const j = r ? await r.json().catch(() => ({})) : {};
        if (!r?.ok || !j.ok) {
          setState("idle");
          return setErr(j.error || "We couldn't send that. Please try again, or call (813) 295-8215.");
        }
        // Custom event only: an employment application is not a client lead (keeps ad conversions clean).
        trackCustom("EmploymentApplication", { content_category: "lcam_employment" });
        setState("done");
      }}
      className="relative scroll-mt-24 rounded-[18px] border border-line bg-white p-5 text-ink shadow-[var(--shadow-lift)] sm:p-7"
    >
      <h2 className="font-display text-[1.6rem] leading-tight sm:text-[1.8rem]">LCAM employment application</h2>
      <p className="mt-1.5 text-[0.95rem] text-muted">For Florida Licensed Community Association Managers. There is no fee to apply.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <F label="First name" id="e-first"><input id="e-first" name="firstName" autoComplete="given-name" className={inputCls} /></F>
        <F label="Last name" id="e-last"><input id="e-last" name="lastName" autoComplete="family-name" className={inputCls} /></F>
        <F label="Email" id="e-email"><input id="e-email" name="email" type="email" autoComplete="email" className={inputCls} /></F>
        <F label="Phone" id="e-phone"><input id="e-phone" name="phone" type="tel" autoComplete="tel" className={inputCls} /></F>
        <F label="City" id="e-city" optional><input id="e-city" name="city" autoComplete="address-level2" className={inputCls} /></F>
        <F label="Florida CAM license number" id="e-lic"><input id="e-lic" name="license" placeholder="CAM 000000" autoCapitalize="characters" className={inputCls} /></F>
        <F label="Association management experience" id="e-years">
          <select id="e-years" name="years" className={inputCls} defaultValue=""><option value="">Choose…</option>{YEARS.map((t) => <option key={t}>{t}</option>)}</select>
        </F>
        <F label="Employment preference" id="e-pref">
          <select id="e-pref" name="preference" className={inputCls} defaultValue=""><option value="">Choose…</option>{PREFS.map((t) => <option key={t}>{t}</option>)}</select>
        </F>
        <F label="Relevant experience" id="e-exp" className="sm:col-span-2"><textarea id="e-exp" name="experience" rows={3} placeholder="Associations managed (type and size), responsibilities, systems used" className={cn(inputCls, "h-auto py-3")} /></F>
        <F label="Availability" id="e-avail" className="sm:col-span-2"><input id="e-avail" name="availability" placeholder="Earliest start date and days or hours available" className={inputCls} /></F>
        <F label="Résumé" id="e-resume" className="sm:col-span-2">
          <label htmlFor="e-resume" className={cn(inputCls, "flex cursor-pointer items-center gap-2 truncate text-sm")}>
            <IconDoc size={18} className="shrink-0 text-red" /> {file ? file.name : "Attach PDF or Word (max 4 MB)"}
          </label>
          <input id="e-resume" type="file" accept=".pdf,.doc,.docx,.rtf,.txt" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </F>
        <F label="Anything else we should know?" id="e-msg" optional className="sm:col-span-2"><textarea id="e-msg" name="message" rows={2} className={cn(inputCls, "h-auto py-3")} /></F>
        <input tabIndex={-1} aria-hidden autoComplete="off" name="company_website" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      </div>
      {err && <p role="alert" className="mt-3 rounded-lg bg-red-soft px-3 py-2 text-sm font-semibold text-red-deep">{err}</p>}
      <button disabled={state === "sending"} className="btn btn-red mt-5 w-full text-base disabled:opacity-70">{state === "sending" ? "Sending…" : "Submit application"} {state !== "sending" && <IconArrow size={18} />}</button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted"><IconLock size={14} className="shrink-0" /> Used only for employment consideration, never shared.</p>
    </form>
  );
}

function F({ label, id, optional, className, children }: { label: string; id: string; optional?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label} {optional && <span className="font-normal text-muted">(optional)</span>}</label>
      {children}
    </div>
  );
}

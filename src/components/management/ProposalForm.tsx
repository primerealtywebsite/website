"use client";

import { useRef, useState, type ReactNode } from "react";
import { getAttribution, newEventId, track } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { IconArrow, IconCheck, IconDoc, IconLock } from "@/components/icons";
import { ASSOCIATION_TYPES } from "@/content/management";

const inputCls = "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-base text-ink outline-none placeholder:text-muted/60 focus:border-ink";
const ROLES = ["Board president", "Board member / director", "Treasurer", "Secretary", "Community manager", "Developer / declarant", "Owner (not on the board)", "Other"];
const CONCERNS = ["Changing management companies", "Self-managed, need a licensed CAM", "Milestone inspection / reserves / SIRS", "Financial reporting and collections", "Vendor and maintenance oversight", "New association / turnover from developer", "Other"];

/** "Request an Association Management Proposal" (homepage + /property_management). */
export function ProposalForm({ variant = "card", id = "start" }: { variant?: "card" | "plain"; id?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const ref = useRef<HTMLFormElement>(null);

  if (state === "done") {
    return (
      <div id={id} className="scroll-mt-24 rounded-[18px] border border-line bg-white p-6 text-ink shadow-[var(--shadow-lift)] sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-ok text-white"><IconCheck size={24} /></span>
        <h2 className="mt-4 text-[1.8rem] leading-tight">Proposal request received</h2>
        <p className="mt-2 text-muted">Our Designated CAM reviews every association proposal request. We will review the scope and site coverage your property needs, ask for anything outstanding in writing, and present a written proposal to your board. A confirmation is on its way to your email.</p>
        <p className="mt-4 text-sm text-muted">Community association emergency? Call (813) 295-8215: live answering 24/7.</p>
      </div>
    );
  }

  return (
    <form
      ref={ref}
      id={id}
      noValidate
      data-no-click-track
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        const fd = new FormData(e.currentTarget);
        const need: [string, string][] = [["associationName", "association name"], ["location", "location (city or county)"], ["propertyType", "property type"], ["units", "unit count"], ["contactName", "your name"], ["boardRole", "your board role"], ["email", "email"], ["phone", "phone"], ["concern", "primary concern"]];
        for (const [k, l] of need) if (!String(fd.get(k) ?? "").trim()) return setErr(`Please add the ${l}.`);
        if (file && file.size > 3 * 1024 * 1024) return setErr("The RFP is larger than 3 MB. Attach a smaller file, or email it after submitting.");
        if (file) fd.set("rfp", file);
        const eventId = newEventId();
        fd.set("eventId", eventId);
        fd.set("pageUrl", location.href);
        fd.set("utm", JSON.stringify(getAttribution()));
        setState("sending");
        const r = await fetch("/api/proposal", { method: "POST", body: fd }).catch(() => null);
        const j = r ? await r.json().catch(() => ({})) : {};
        if (!r?.ok || !j.ok) {
          setState("idle");
          return setErr(j.error || "We couldn't send that. Please call (813) 295-8215.");
        }
        track("Lead", { lead_type: "management", content_category: "association_proposal" }, { eventId, server: false });
        setState("done");
      }}
      className={cn("relative scroll-mt-24 text-ink", variant === "card" && "rounded-[18px] border border-line bg-white p-5 shadow-[var(--shadow-lift)] sm:p-7")}
    >
      <h2 className="font-display text-[1.6rem] leading-tight sm:text-[1.8rem]">Request an Association Management Proposal</h2>
      <p className="mt-1.5 text-[0.95rem] text-muted">HOAs, condominium associations, commercial property owners&apos; associations and office parks throughout Florida.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <F label="Association name" id="p-name" className="sm:col-span-2"><input id="p-name" name="associationName" className={inputCls} /></F>
        <F label="Location (city or county)" id="p-loc"><input id="p-loc" name="location" placeholder="e.g. Sarasota, Sarasota County" className={inputCls} /></F>
        <F label="Property type" id="p-type">
          <select id="p-type" name="propertyType" className={inputCls} defaultValue=""><option value="">Choose…</option>{ASSOCIATION_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </F>
        <F label="Number of units" id="p-units"><input id="p-units" name="units" inputMode="numeric" className={inputCls} /></F>
        <F label="Anticipated transition date" id="p-date" optional><input id="p-date" name="transitionDate" type="date" className={inputCls} /></F>
        <F label="Your name" id="p-contact"><input id="p-contact" name="contactName" autoComplete="name" className={inputCls} /></F>
        <F label="Board role" id="p-role">
          <select id="p-role" name="boardRole" className={inputCls} defaultValue=""><option value="">Choose…</option>{ROLES.map((t) => <option key={t}>{t}</option>)}</select>
        </F>
        <F label="Email" id="p-email"><input id="p-email" name="email" type="email" autoComplete="email" className={inputCls} /></F>
        <F label="Phone" id="p-phone"><input id="p-phone" name="phone" type="tel" autoComplete="tel" className={inputCls} /></F>
        <F label="Primary concern" id="p-concern" className="sm:col-span-2">
          <select id="p-concern" name="concern" className={inputCls} defaultValue=""><option value="">Choose…</option>{CONCERNS.map((t) => <option key={t}>{t}</option>)}</select>
        </F>
        <F label="Current management company" id="p-cur" optional><input id="p-cur" name="currentManagement" placeholder="or self-managed" className={inputCls} /></F>
        <F label="Existing RFP" id="p-rfp" optional>
          <label htmlFor="p-rfp" className={cn(inputCls, "flex cursor-pointer items-center gap-2 truncate text-sm")}>
            <IconDoc size={18} className="shrink-0 text-red" /> {file ? file.name : "Attach PDF, Word or Excel (max 3 MB)"}
          </label>
          <input id="p-rfp" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </F>
        <F label="Anything else the board wants us to know?" id="p-msg" optional className="sm:col-span-2"><textarea id="p-msg" name="message" rows={2} className={cn(inputCls, "h-auto py-3")} /></F>
        <input tabIndex={-1} aria-hidden autoComplete="off" name="company_website" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      </div>
      {err && <p role="alert" className="mt-3 rounded-lg bg-red-soft px-3 py-2 text-sm font-semibold text-red-deep">{err}</p>}
      <button disabled={state === "sending"} className="btn btn-red mt-5 w-full text-base disabled:opacity-70">{state === "sending" ? "Sending…" : "Request a proposal"} {state !== "sending" && <IconArrow size={18} />}</button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"><IconLock size={14} /> Reviewed by our Designated CAM. Emergencies: call (813) 295-8215, 24/7.</p>
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

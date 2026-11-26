"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getAttribution, newEventId, setGoogleUserData, track, trackCustom } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { IconArrow, IconBack, IconCheck, IconLock } from "@/components/icons";

const LICENSE_TYPE = ["Sales Associate (SL)", "Broker Associate (BL)", "Broker (BK)"] as const;
const CLOSINGS = ["0", "1–5", "6–10", "11–20", "21–40", "40+"];
const VOLUME = ["Under $1M", "$1M–$3M", "$3M–$5M", "$5M–$10M", "$10M+"];
const COMMERCIAL = ["Sales and leasing", "Sales only", "Leasing only", "None"];
const COMMERCIAL_DEALS = ["0", "1–3", "4–10", "11+"];
const FOCUS = ["Residential", "Commercial", "Residential + commercial"] as const;
const YEARS = ["Less than 2", "2–5", "5–10", "10+"];
const ASSOC = [
  "Greater Tampa REALTORS®",
  "Pinellas REALTOR® Organization",
  "Orlando Regional REALTOR® Association",
  "Miami REALTORS®",
  "Broward, Palm Beaches & St. Lucie REALTORS®",
  "Naples Area Board of REALTORS®",
  "Northeast Florida Association of REALTORS®",
  "Other Florida association",
  "Not currently a REALTOR® member",
];
const MLS = ["Stellar MLS", "Miami REALTORS® MLS", "BeachesMLS", "Southwest Florida / Naples MLS", "Northeast Florida MLS", "Other Florida MLS", "No MLS needed (commercial only)"];
const HEARD = ["Referred by an agent", "Referred by someone else", "LinkedIn", "Facebook / Instagram", "Google search", "Email or campaign", "Prime 1 website", "Other"];

const DRAFT_KEY = "p1_join_draft_v2";
const SUBMITTED_KEY = "p1_join_submitted";

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const empty = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  licenseStatus: "" as "" | "Active" | "Inactive",
  licenseType: "" as "" | (typeof LICENSE_TYPE)[number],
  licenseNumber: "",
  currentBrokerage: "",
  yearsLicensed: "",
  focus: "" as "" | (typeof FOCUS)[number],
  closings: "",
  volume: "",
  commercialExperience: "",
  commercialDeals: "",
  discipline: "" as "" | "No" | "Yes",
  disciplineDetail: "",
  affiliationDate: "",
  markets: "",
  association: "",
  associationOther: "",
  mls: [] as string[],
  activeListings: "",
  pendingTransactions: "",
  heardFrom: "",
  referredBy: "",
  wantsToSpeak: false,
  speakRequest: "",
  message: "",
  reviewedMaterials: false,
  consent: true,
  hp: "",
};
type Form = typeof empty;
const STEPS = ["Contact", "License & production", "Your move", "Review & submit"] as const;

/**
 * The one Join Prime 1 application. Every submission stays pending until the broker decides.
 * No booking, no agreement and no payment happen here. A draft is kept on this device so the agent can
 * resume, and the record ID comes from the email, so returning never creates a duplicate.
 */
export function JoinForm() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: string; emailed: boolean; statusUrl: string } | null>(null);
  const [resumed, setResumed] = useState(false);
  const started = useRef(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { f: Form; step: number };
        if (d?.f?.email) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a saved draft once on mount
          setF({ ...empty, ...d.f, hp: "" });
          setStep(Math.min(d.step ?? 0, 3));
          setResumed(true);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!f.email || done) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ f, step }));
    } catch {}
  }, [f, step, done]);

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    if (!started.current) {
      started.current = true;
      trackCustom("JoinFormStart", { cta_location: "join" });
    }
    setF((s) => ({ ...s, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));
  };

  const top = () => {
    const el = root.current;
    if (el && el.getBoundingClientRect().top < 0) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  };
  const go = (n: number) => {
    setError("");
    setStep(n);
    top();
  };

  const residential = f.focus !== "Commercial";
  const commercial = f.focus === "Commercial" || f.focus === "Residential + commercial";

  const next = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 0) {
      if (!f.firstName.trim() || !f.lastName.trim()) return setError("Please enter your first and last name.");
      if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError("Please enter a valid email.");
      if (f.phone.replace(/\D/g, "").length < 10) return setError("Please enter a 10-digit phone number.");
      trackCustom("JoinStep", { step: "contact" });
      // Records the file as Incomplete (no duplicate: the record ID comes from the email).
      fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "started", contact: { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone }, pageUrl: location.href, utm: getAttribution() }),
      }).catch(() => null);
      return go(1);
    }
    if (step === 1) {
      if (!f.licenseStatus) return setError("Please choose your license status.");
      if (!f.licenseType) return setError("Please choose your license type.");
      if (f.licenseNumber.replace(/\W/g, "").length < 5) return setError("Please enter your Florida license number (e.g. SL3456789).");
      if (f.currentBrokerage.trim().length < 2) return setError("Please enter your current brokerage.");
      if (!f.focus) return setError("Please choose residential, commercial or both.");
      if (residential && !f.closings) return setError("Please choose your residential closings in the last 12 months.");
      if (commercial && !f.commercialExperience) return setError("Please choose your commercial experience.");
      if (!f.discipline) return setError("Please answer the license history question.");
      if (f.discipline === "Yes" && f.disciplineDetail.trim().length < 10) return setError("Please briefly describe the complaint, restriction or discipline.");
      trackCustom("JoinStep", { step: "license" });
      return go(2);
    }
    if (step === 2) {
      if (!f.affiliationDate) return setError("Please enter your anticipated affiliation date.");
      if (f.markets.trim().length < 2) return setError("Please list the Florida markets you serve.");
      if (!f.association) return setError("Please choose your REALTOR® association.");
      if (f.association === "Other Florida association" && f.associationOther.trim().length < 2) return setError("Please name your association.");
      if (f.mls.length === 0) return setError("Please choose the MLS access you need.");
      if (!f.heardFrom) return setError("Please tell us how you heard about Prime 1.");
      trackCustom("JoinStep", { step: "move" });
      return go(3);
    }
    return submit();
  };

  const submit = async () => {
    if (!f.reviewedMaterials) return setError("Please confirm you reviewed the offer, FAQ, agreement and affiliation steps.");
    if (f.wantsToSpeak && f.speakRequest.trim().length < 10) return setError("Please describe what you would like to discuss with the broker.");
    setStatus("sending");
    const eventId = newEventId();
    let prev = "";
    try {
      prev = localStorage.getItem(SUBMITTED_KEY) ?? "";
    } catch {}
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(prev ? { "x-p1-resume": prev } : {}) },
        body: JSON.stringify({
          stage: "submit",
          eventId,
          pageUrl: location.href,
          utm: getAttribution(),
          company_website: f.hp,
          application: {
            firstName: f.firstName,
            lastName: f.lastName,
            email: f.email,
            phone: f.phone,
            licenseStatus: f.licenseStatus,
            licenseType: f.licenseType,
            licenseNumber: f.licenseNumber,
            currentBrokerage: f.currentBrokerage,
            yearsLicensed: f.yearsLicensed,
            focus: f.focus,
            closings: residential ? f.closings : "",
            volume: residential ? f.volume : "",
            commercialExperience: commercial ? f.commercialExperience : "",
            commercialDeals: commercial ? f.commercialDeals : "",
            activeListings: f.activeListings,
            pendingTransactions: f.pendingTransactions,
            affiliationDate: f.affiliationDate,
            markets: f.markets,
            association: f.association === "Other Florida association" ? `Other: ${f.associationOther}` : f.association,
            mls: f.mls,
            discipline: f.discipline,
            disciplineDetail: f.discipline === "Yes" ? f.disciplineDetail : "",
            heardFrom: f.heardFrom,
            referredBy: f.referredBy,
            speakRequest: f.wantsToSpeak ? f.speakRequest : "",
            message: f.message,
            reviewedMaterials: f.reviewedMaterials,
            consent: f.consent,
          },
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setGoogleUserData({ email: f.email, phone: f.phone, firstName: f.firstName, lastName: f.lastName });
      track("SubmitApplication", { content_category: "agent_recruiting", track: f.focus }, { eventId, server: false });
      try {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.setItem(SUBMITTED_KEY, j.id);
      } catch {}
      setDone({ id: j.id, emailed: Boolean(j.emailed), statusUrl: j.statusUrl ?? "" });
      setStatus("idle");
      top();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (done) {
    return (
      <div ref={root} id="apply" className="scroll-mt-24 overflow-hidden rounded-[18px] border border-line bg-white p-6 text-ink shadow-[var(--shadow-lift)] sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-ok text-white"><IconCheck size={24} /></span>
        <h2 className="mt-4 text-[1.9rem] leading-tight">Thank you, {f.firstName}. Your application is pending broker review.</h2>
        <p className="mt-2 text-muted">
          Record <b className="text-ink">{done.id}</b>. Every application stays pending until our Broker of Record makes a decision. You will hear from us in writing.
          {done.emailed ? <> A confirmation was sent to <b className="text-ink">{f.email}</b>.</> : null}
        </p>
        <ol className="mt-5 space-y-2 text-[0.95rem]">
          {["The broker verifies your license on DBPR and reviews your file.", "You receive a decision or a request for more information, in writing.", "Only after approval: e-sign, pay the onboarding fee and transfer your license."].map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        {done.statusUrl && (
          <a href={done.statusUrl} className="btn btn-ink mt-6">View my application status <IconArrow size={18} /></a>
        )}
      </div>
    );
  }

  return (
    <div ref={root} id="apply" data-no-click-track className="relative scroll-mt-24 overflow-hidden rounded-[18px] border border-line bg-white text-ink shadow-[var(--shadow-lift)]">
      <div className="h-1.5 w-full bg-sand" aria-hidden>
        <div className="h-full bg-red transition-[width] duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <form onSubmit={next} noValidate className="p-5 sm:p-7">
        <div className="mb-4 flex min-h-8 items-center justify-between text-sm">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-muted hover:text-ink">
              <IconBack size={18} /> Back
            </button>
          ) : (
            <span className="font-semibold text-muted">Experienced Florida agents</span>
          )}
          <span className="tabular-nums text-muted">Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
        </div>
        {resumed && step > 0 && <p className="mb-3 rounded-lg bg-paper px-3 py-2 text-sm">Welcome back. We restored your saved application on this device.</p>}

        {step === 0 && (
          <>
            <h2 className="font-display text-[1.65rem] leading-tight sm:text-[1.85rem]">Apply to join Prime 1</h2>
            <p className="mt-1.5 text-[0.95rem] text-muted">About 5 minutes. Your progress is saved on this device, and coming back never creates a duplicate.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="First name" id="j-first"><input id="j-first" autoComplete="given-name" value={f.firstName} onChange={set("firstName")} className={inputCls} /></Field>
              <Field label="Last name" id="j-last"><input id="j-last" autoComplete="family-name" value={f.lastName} onChange={set("lastName")} className={inputCls} /></Field>
              <Field label="Email" id="j-email" className="sm:col-span-2"><input id="j-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set("email")} className={inputCls} /></Field>
              <Field label="Mobile phone" id="j-phone" className="sm:col-span-2"><input id="j-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(813) 555-0123" value={f.phone} onChange={set("phone")} className={inputCls} /></Field>
              <input tabIndex={-1} aria-hidden autoComplete="off" value={f.hp} onChange={set("hp")} className="absolute left-[-9999px] h-0 w-0 opacity-0" />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-display text-[1.65rem] leading-tight">License &amp; production</h2>
            <p className="mt-1.5 text-[0.95rem] text-muted">The broker verifies every license on the Florida DBPR before deciding.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Select label="License status" id="j-status" value={f.licenseStatus} onChange={set("licenseStatus")} options={["Active", "Inactive"]} />
              <Select label="License type" id="j-type" value={f.licenseType} onChange={set("licenseType")} options={[...LICENSE_TYPE]} />
              <Field label="FL license number" id="j-lic"><input id="j-lic" autoComplete="off" placeholder="SL3456789" value={f.licenseNumber} onChange={set("licenseNumber")} className={cn(inputCls, "uppercase placeholder:normal-case")} /></Field>
              <Field label="Current brokerage" id="j-brok"><input id="j-brok" autoComplete="organization" value={f.currentBrokerage} onChange={set("currentBrokerage")} className={inputCls} /></Field>
              <Select label="Years licensed" id="j-years" value={f.yearsLicensed} onChange={set("yearsLicensed")} options={YEARS} optional />
              <Select label="Focus" id="j-focus" value={f.focus} onChange={set("focus")} options={[...FOCUS]} />
              {residential && f.focus && (
                <>
                  <Select label="Residential closings, last 12 months" id="j-closings" value={f.closings} onChange={set("closings")} options={CLOSINGS} />
                  <Select label="Residential volume, last 12 months" id="j-volume" value={f.volume} onChange={set("volume")} options={VOLUME} optional />
                </>
              )}
              {commercial && (
                <>
                  <Select label="Commercial experience" id="j-comm" value={f.commercialExperience} onChange={set("commercialExperience")} options={COMMERCIAL} />
                  <Select label="Commercial transactions, last 24 months" id="j-cdeals" value={f.commercialDeals} onChange={set("commercialDeals")} options={COMMERCIAL_DEALS} optional />
                </>
              )}
              <fieldset className="sm:col-span-2">
                <legend className="mb-1 text-sm font-semibold">Any complaint, restriction or discipline on your license, now or in the past?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["No", "Yes"] as const).map((v) => (
                    <button key={v} type="button" aria-pressed={f.discipline === v} onClick={() => setF((s) => ({ ...s, discipline: v }))} className={cn("h-11 rounded-xl border-[1.5px] font-semibold", f.discipline === v ? "border-red bg-red-soft text-red-deep" : "border-line bg-white")}>
                      {v}
                    </button>
                  ))}
                </div>
              </fieldset>
              {f.discipline === "Yes" && (
                <Field label="Briefly describe it" id="j-disc" className="sm:col-span-2">
                  <textarea id="j-disc" rows={3} value={f.disciplineDetail} onChange={set("disciplineDetail")} className={cn(inputCls, "h-auto py-3")} />
                </Field>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-display text-[1.65rem] leading-tight">Your move to Prime 1</h2>
            <p className="mt-1.5 text-[0.95rem] text-muted">So we can plan your association, MLS access, listings and pending transactions.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Anticipated affiliation date" id="j-date"><input id="j-date" type="date" value={f.affiliationDate} onChange={set("affiliationDate")} className={inputCls} /></Field>
              <Field label="Florida markets you serve" id="j-mkts"><input id="j-mkts" placeholder="e.g. Orlando, Orange & Seminole" value={f.markets} onChange={set("markets")} className={inputCls} /></Field>
              <Select label="REALTOR® association" id="j-assoc" value={f.association} onChange={set("association")} options={ASSOC} className="sm:col-span-2" />
              {f.association === "Other Florida association" && (
                <Field label="Association name" id="j-assoc2" className="sm:col-span-2"><input id="j-assoc2" value={f.associationOther} onChange={set("associationOther")} className={inputCls} /></Field>
              )}
              <fieldset className="sm:col-span-2">
                <legend className="mb-1 text-sm font-semibold">MLS access you need</legend>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {MLS.map((m) => (
                    <label key={m} className={cn("flex min-h-11 items-center gap-2.5 rounded-xl border-[1.5px] px-3 text-sm", f.mls.includes(m) ? "border-red bg-red-soft" : "border-line")}>
                      <input type="checkbox" checked={f.mls.includes(m)} onChange={(e) => setF((s) => ({ ...s, mls: e.target.checked ? [...s.mls, m] : s.mls.filter((x) => x !== m) }))} className="size-4 accent-red" />
                      {m}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label="Active listings to move" id="j-al" optional><input id="j-al" inputMode="numeric" value={f.activeListings} onChange={set("activeListings")} className={inputCls} /></Field>
              <Field label="Pending transactions" id="j-pt" optional><input id="j-pt" inputMode="numeric" value={f.pendingTransactions} onChange={set("pendingTransactions")} className={inputCls} /></Field>
              <Select label="How did you hear about Prime 1?" id="j-heard" value={f.heardFrom} onChange={set("heardFrom")} options={HEARD} />
              <Field label="Who introduced you? (name)" id="j-ref" optional><input id="j-ref" placeholder="Agent or person who referred you" value={f.referredBy} onChange={set("referredBy")} className={inputCls} /></Field>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-display text-[1.65rem] leading-tight">Review &amp; submit</h2>
            <div className="mt-4 rounded-xl bg-paper p-4 text-sm leading-relaxed">
              <p><b>What happens after you submit:</b> your application stays <b>pending broker review</b>. The broker verifies your license and may approve, decline or ask for more information. Nothing is signed, issued or charged before approval.</p>
            </div>
            <label className="mt-4 flex items-start gap-2.5 rounded-xl border-[1.5px] border-line p-3.5 text-[0.92rem] leading-snug">
              <input type="checkbox" checked={f.reviewedMaterials} onChange={(e) => setF({ ...f, reviewedMaterials: e.target.checked })} className="mt-0.5 size-5 shrink-0 accent-red" />
              <span>
                I reviewed the <a href="#offer" className="font-semibold underline">offer</a>, <a href="#faq" className="font-semibold underline">FAQ</a>, <a href="/api/agent-docs?f=review-independent-contractor-agreement" target="_blank" rel="noopener" className="font-semibold underline">Independent Contractor Agreement</a>, <a href="#materials" className="font-semibold underline">Agent Handbook status</a> and <a href="#steps" className="font-semibold underline">affiliation steps</a>.
              </span>
            </label>
            <label className="mt-3 flex items-start gap-2.5 text-[0.92rem] leading-snug">
              <input type="checkbox" checked={f.wantsToSpeak} onChange={(e) => setF({ ...f, wantsToSpeak: e.target.checked })} className="mt-0.5 size-5 shrink-0 accent-red" />
              <span>I would like to request a conversation with the broker <span className="text-muted">(optional)</span></span>
            </label>
            {f.wantsToSpeak && (
              <Field label="What would you like to discuss?" id="j-speak" className="mt-2">
                <textarea id="j-speak" rows={3} value={f.speakRequest} onChange={set("speakRequest")} className={cn(inputCls, "h-auto py-3")} />
                <p className="mt-1 text-xs text-muted">Your request is attached to your application. The broker may reply in writing, offer a call or meeting, or decide from your file. There are no preliminary interviews or automatic appointments.</p>
              </Field>
            )}
            <Field label="Anything else for your file?" id="j-msg" optional className="mt-3">
              <textarea id="j-msg" rows={2} value={f.message} onChange={set("message")} className={cn(inputCls, "h-auto py-3")} />
            </Field>
            <label className="mt-4 flex items-start gap-2.5 text-[0.78rem] leading-snug text-muted">
              <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-0.5 size-4 accent-red" />
              <span>Prime 1 Realty may email and call me about my application. See our <a href="/privacy-policy" className="underline">Privacy Policy</a>.</span>
            </label>
          </>
        )}

        <Err msg={error} />
        <button type="submit" disabled={status === "sending"} className="btn btn-red mt-5 w-full text-base disabled:opacity-70">
          {status === "sending" ? "Submitting…" : step === 3 ? "Submit my application" : "Continue"} {status !== "sending" && <IconArrow size={18} />}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"><IconLock size={14} /> Confidential. Reviewed by the Broker of Record.</p>
      </form>
    </div>
  );
}

const inputCls = "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-base outline-none placeholder:text-muted/60 focus:border-ink";

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

function Select({ label, id, value, onChange, options, optional, className }: { label: string; id: string; value: string; onChange: (e: { target: { value: string } }) => void; options: string[]; optional?: boolean; className?: string }) {
  return (
    <Field label={label} id={id} optional={optional} className={className}>
      <select id={id} value={value} onChange={onChange} className={inputCls}>
        <option value="">Choose…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </Field>
  );
}

function Err({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p role="alert" className="mt-3 rounded-lg bg-red-soft px-3 py-2 text-sm font-semibold text-red-deep">{msg}</p>;
}

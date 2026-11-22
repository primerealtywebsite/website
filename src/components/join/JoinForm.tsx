"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { site } from "@/config/site";
import { getAttribution, newEventId, setGoogleUserData, track, trackCustom } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { IconArrow, IconBack, IconCalendar, IconCheck, IconLock, IconMail } from "@/components/icons";
import { CalendlyEmbed } from "./CalendlyEmbed";

const LICENSE_STATUS = ["Active Florida license", "Inactive Florida license", "In pre-licensing"] as const;
const LICENSE_TYPE = ["Sales Associate (SL)", "Broker Associate (BL)", "Broker (BK)", "Not licensed yet"] as const;
const CLOSINGS = ["0–5", "6–15", "16–30", "30+"];
const VOLUME = ["Under $1M", "$1M–$3M", "$3M–$5M", "$5M–$10M", "$10M+"];
const TIMING = ["Ready now", "Within 30 days", "1–3 months", "3+ months / exploring"];
const COMMERCIAL = ["Sales and leasing", "Sales only", "Leasing only", "None yet"];
const FOCUS = ["Residential", "Commercial", "Residential + commercial"];
const ASSOC = ["STAR / Stellar MLS (Tampa Bay)", "Pinellas / Beaches MLS", "Miami REALTORS® / RWorld", "Other Florida association", "Not a member yet"];

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
  licenseStatus: "" as "" | (typeof LICENSE_STATUS)[number],
  licenseType: "" as "" | (typeof LICENSE_TYPE)[number],
  licenseNumber: "",
  currentBrokerage: "",
  yearsLicensed: "",
  transactions: "",
  volume: "",
  timing: "",
  commercialExperience: "",
  focus: "",
  market: "",
  association: "",
  heardFrom: "",
  message: "",
  consent: true,
  hp: "",
};

/** Two-step agent application. Step 1: contact. Step 2: license, production history and timing. Antony approves before any agreement is sent. */
export function JoinForm({ defaultNext = "apply" }: { defaultNext?: "apply" | "call" }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [f, setF] = useState(empty);
  const [next, setNext] = useState<"apply" | "call">(defaultNext);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ emailed: boolean } | null>(null);
  const started = useRef(false);
  const root = useRef<HTMLDivElement>(null);

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => {
    if (!started.current) {
      started.current = true;
      trackCustom("JoinFormStart", { cta_location: "join" });
    }
    setF((s) => ({ ...s, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));
  };

  const top = () => {
    const el = root.current;
    // window.scrollTo (not scrollIntoView): scrollIntoView also scrolls overflow-hidden ancestors sideways.
    if (el && el.getBoundingClientRect().top < 0) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  };

  const toStep2 = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.firstName.trim() || !f.lastName.trim()) return setError("Please enter your first and last name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError("Please enter a valid email.");
    if (f.phone.replace(/\D/g, "").length < 10) return setError("Please enter a 10-digit phone number.");
    trackCustom("JoinStep", { step: "contact" });
    setStep(2);
    top();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.licenseStatus) return setError("Please choose your license status.");
    const prelicense = f.licenseStatus === "In pre-licensing";
    if (!prelicense && !f.licenseType) return setError("Please choose your license type.");
    if (!prelicense && f.licenseNumber.replace(/\W/g, "").length < 5) return setError("Please enter your Florida license number (e.g. SL3456789).");
    if (!prelicense && !f.transactions) return setError("Please choose your closings in the last 12 months.");
    if (!f.timing) return setError("Please tell us when you could affiliate.");
    setStatus("sending");
    const eventId = newEventId();
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: f.firstName,
          lastName: f.lastName,
          email: f.email,
          phone: f.phone,
          licenseStatus: f.licenseStatus,
          licenseType: prelicense ? "Not licensed yet" : f.licenseType,
          licenseNumber: prelicense ? "" : f.licenseNumber,
          currentBrokerage: f.currentBrokerage,
          yearsLicensed: f.yearsLicensed,
          transactions: f.transactions,
          volume: f.volume,
          timing: f.timing,
          commercialExperience: /commercial/i.test(f.focus) ? f.commercialExperience : "",
          focus: f.focus,
          market: f.market,
          association: f.association,
          nextStep: next,
          heardFrom: f.heardFrom,
          message: f.message,
          consent: f.consent,
          eventId,
          pageUrl: window.location.href,
          utm: getAttribution(),
          company_website: f.hp,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || `Something went wrong. Please email ${site.recruiting.email}.`);
      setGoogleUserData({ email: f.email, phone: f.phone, firstName: f.firstName, lastName: f.lastName });
      track("SubmitApplication", { content_category: "agent_recruiting", next_step: next }, { eventId, server: false });
      setResult({ emailed: Boolean(j.emailed) });
      setStep(3);
      top();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return;
    }
    setStatus("idle");
  };

  if (step === 3 && result) {
    return (
      <div ref={root} id="apply" className="scroll-mt-24 overflow-hidden rounded-[18px] border border-line bg-white text-ink shadow-[var(--shadow-lift)]">
        <div className="p-6 sm:p-8">
          <span className="grid size-12 place-items-center rounded-full bg-ok text-white"><IconCheck size={24} /></span>
          <h2 className="mt-4 text-[1.9rem] leading-tight">Thanks, {f.firstName}. Your application is in.</h2>
          <p className="mt-2 text-muted">
            Antony Oseitutu, our Broker of Record, reviews every application personally and will contact you, usually within one business day.
            {result.emailed && <> A confirmation is on its way to <b className="text-ink">{f.email}</b>.</>}
          </p>
          <ol className="mt-5 space-y-2 text-[0.95rem]">
            {["Antony reviews your license and production history.", "Once approved, you receive the Independent Contractor Agreement to review and sign.", "We coordinate your license affiliation, then onboarding."].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="border-t border-line bg-paper p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-2xl"><IconCalendar size={22} className="text-red" /> {next === "call" ? "Pick a time to talk with Antony" : "Want to talk sooner? (optional)"}</h3>
          <p className="mt-1 text-muted">30 minutes. Ask about the split, leads, fees, license transfer or anything else.</p>
          <CalendlyEmbed
            name={`${f.firstName} ${f.lastName}`}
            email={f.email}
            phone={f.phone}
            notes={[
              "Agent application submitted on prime1realty.net.",
              f.licenseStatus,
              f.licenseNumber && `License ${f.licenseType} ${f.licenseNumber.toUpperCase()}`,
              f.currentBrokerage && `Current brokerage: ${f.currentBrokerage}`,
              f.transactions && `Closings (12 mo): ${f.transactions}`,
              f.volume && `Volume (12 mo): ${f.volume}`,
              f.timing && `Timing: ${f.timing}`,
              f.focus && `Focus: ${f.focus}`,
              f.market && `Market: ${f.market}`,
              f.message,
            ]
              .filter(Boolean)
              .join(" | ")}
            location="join_success"
            className="mt-5"
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={root} id="apply" data-no-click-track className="relative scroll-mt-24 overflow-hidden rounded-[18px] border border-line bg-white text-ink shadow-[var(--shadow-lift)]">
      <div className="h-1.5 w-full bg-sand" aria-hidden>
        <div className="h-full bg-red transition-[width] duration-500" style={{ width: step === 1 ? "45%" : "85%" }} />
      </div>
      <div className="p-5 sm:p-7">
        <div className="mb-4 flex min-h-8 items-center justify-between text-sm">
          {step === 2 ? (
            <button type="button" onClick={() => { setError(""); setStep(1); }} className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-muted hover:text-ink">
              <IconBack size={18} /> Back
            </button>
          ) : (
            <span className="font-semibold text-muted">For experienced Florida agents</span>
          )}
          <span className="tabular-nums text-muted">Step {step} of 2</span>
        </div>

        {step === 1 && (
          <form onSubmit={toStep2} noValidate>
            <h2 className="font-display text-[1.65rem] leading-tight sm:text-[1.85rem]">Apply to join Prime 1</h2>
            <p className="mt-1.5 text-[0.95rem] text-muted">Takes about 2 minutes. Antony reviews every application personally.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="First name" id="j-first"><input id="j-first" autoComplete="given-name" value={f.firstName} onChange={set("firstName")} className={inputCls} /></Field>
              <Field label="Last name" id="j-last"><input id="j-last" autoComplete="family-name" value={f.lastName} onChange={set("lastName")} className={inputCls} /></Field>
              <Field label="Email" id="j-email" className="sm:col-span-2"><input id="j-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set("email")} className={inputCls} /></Field>
              <Field label="Mobile phone" id="j-phone" className="sm:col-span-2"><input id="j-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(813) 555-0123" value={f.phone} onChange={set("phone")} className={inputCls} /></Field>
              <input tabIndex={-1} aria-hidden autoComplete="off" value={f.hp} onChange={set("hp")} className="absolute left-[-9999px] h-0 w-0 opacity-0" />
            </div>
            <Err msg={error} />
            <button type="submit" className="btn btn-red mt-5 w-full text-base">Continue <IconArrow size={18} /></button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"><IconLock size={14} /> Confidential. Goes directly to our Broker of Record.</p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submit} noValidate>
            <h2 className="font-display text-[1.65rem] leading-tight sm:text-[1.85rem]">Your license &amp; production</h2>
            <p className="mt-1.5 text-[0.95rem] text-muted">What Antony needs to review your application.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="License status" id="j-status">
                <select id="j-status" value={f.licenseStatus} onChange={set("licenseStatus")} className={inputCls}>
                  <option value="">Choose…</option>
                  {LICENSE_STATUS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              {f.licenseStatus !== "In pre-licensing" && (
                <>
                  <Field label="License type" id="j-type">
                    <select id="j-type" value={f.licenseType} onChange={set("licenseType")} className={inputCls}>
                      <option value="">Choose…</option>
                      {LICENSE_TYPE.filter((o) => o !== "Not licensed yet").map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="FL license number" id="j-lic">
                    <input id="j-lic" autoComplete="off" placeholder="SL3456789" value={f.licenseNumber} onChange={set("licenseNumber")} className={cn(inputCls, "uppercase placeholder:normal-case")} />
                  </Field>
                  <Field label="Current brokerage" id="j-brok" optional>
                    <input id="j-brok" autoComplete="organization" value={f.currentBrokerage} onChange={set("currentBrokerage")} className={inputCls} />
                  </Field>
                  <Field label="Closings in the last 12 months" id="j-closings">
                    <select id="j-closings" value={f.transactions} onChange={set("transactions")} className={inputCls}>
                      <option value="">Choose…</option>
                      {CLOSINGS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Years licensed" id="j-years" optional>
                    <select id="j-years" value={f.yearsLicensed} onChange={set("yearsLicensed")} className={inputCls}>
                      <option value="">Choose…</option>
                      {["Less than 1", "1–3", "3–5", "5–10", "10+"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Sales volume, last 12 months" id="j-volume" optional>
                    <select id="j-volume" value={f.volume} onChange={set("volume")} className={inputCls}>
                      <option value="">Choose…</option>
                      {VOLUME.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                </>
              )}
              <Field label="Focus" id="j-focus" optional>
                <select id="j-focus" value={f.focus} onChange={set("focus")} className={inputCls}>
                  <option value="">Choose…</option>
                  {FOCUS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              {/commercial/i.test(f.focus) && (
                <Field label="Commercial experience" id="j-comm" optional>
                  <select id="j-comm" value={f.commercialExperience} onChange={set("commercialExperience")} className={inputCls}>
                    <option value="">Choose…</option>
                    {COMMERCIAL.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              )}
              <Field label="When could you affiliate?" id="j-timing">
                <select id="j-timing" value={f.timing} onChange={set("timing")} className={inputCls}>
                  <option value="">Choose…</option>
                  {TIMING.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Primary market (city or county)" id="j-market" optional>
                <input id="j-market" placeholder="e.g. Tampa, Hillsborough" value={f.market} onChange={set("market")} className={inputCls} />
              </Field>
              <Field label="REALTOR® association / MLS" id="j-assoc" optional className="sm:col-span-2">
                <select id="j-assoc" value={f.association} onChange={set("association")} className={inputCls}>
                  <option value="">Choose…</option>
                  {ASSOC.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Anything Antony should know?" id="j-msg" optional className="sm:col-span-2">
                <textarea id="j-msg" rows={2} value={f.message} onChange={set("message")} className={cn(inputCls, "h-auto py-3")} />
              </Field>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-semibold">How do you want to move forward?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <Choice active={next === "apply"} onClick={() => setNext("apply")} icon={<IconMail size={20} />} title="Submit my application" hint="Antony will follow up" />
                <Choice active={next === "call"} onClick={() => setNext("call")} icon={<IconCalendar size={20} />} title="Apply + book a call" hint="30 min with Antony" />
              </div>
            </fieldset>

            <label className="mt-4 flex items-start gap-2.5 text-[0.78rem] leading-snug text-muted">
              <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-0.5 size-4 accent-red" />
              <span>Prime 1 Realty may call and email me about affiliation. See our <a href="/privacy-policy" className="underline">Privacy Policy</a>.</span>
            </label>
            <Err msg={error} />
            <button type="submit" disabled={status === "sending"} className="btn btn-red mt-4 w-full text-base disabled:opacity-70">
              {status === "sending" ? "Sending…" : next === "call" ? "Submit & pick a time" : "Submit my application"} {status !== "sending" && <IconArrow size={18} />}
            </button>
          </form>
        )}
      </div>
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

function Choice({ active, onClick, icon, title, hint }: { active: boolean; onClick: () => void; icon: ReactNode; title: string; hint: string }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition", active ? "border-red bg-red-soft" : "border-line bg-paper/60 hover:border-ink")}>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", active ? "bg-red text-white" : "bg-white text-red ring-1 ring-line")}>{icon}</span>
      <span>
        <span className="block text-[0.95rem] font-semibold leading-snug">{title}</span>
        <span className="block text-[0.8rem] text-muted">{hint}</span>
      </span>
    </button>
  );
}

function Err({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p role="alert" className="mt-3 rounded-lg bg-red-soft px-3 py-2 text-sm font-semibold text-red-deep">{msg}</p>;
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/config/site";
import { getAttribution, newEventId, setGoogleUserData, track, trackCustom, type LeadType } from "@/lib/meta";
import { cn } from "@/lib/utils";
import {
  IconArrow,
  IconBack,
  IconBadge,
  IconBuilding,
  IconBuy,
  IconCheck,
  IconCommunity,
  IconGauge,
  IconKey,
  IconLock,
  IconPhone,
  IconSell,
} from "@/components/icons";
import { FLOWS, START, type IconName, type Step } from "./flows";

const ICONS: Record<IconName, typeof IconSell> = {
  sell: IconSell,
  buy: IconBuy,
  rent: IconKey,
  management: IconCommunity,
  commercial: IconBuilding,
  careers: IconBadge,
  valuation: IconGauge,
};

type Props = {
  /** Pre-select a branch (service pages). Omit to start with "What can we help you with?" */
  flow?: LeadType;
  className?: string;
  /** "card" sits inside heroes; "page" is the full-screen /get-started flow */
  variant?: "card" | "page";
  title?: string;
};

type Saved = { flow: LeadType | null; index: number; answers: Record<string, string> };
const STORE = "p1-funnel-v1";

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function Funnel({ flow: preset, className, variant = "card", title }: Props) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [flowId, setFlowId] = useState<LeadType | null>(preset ?? null);
  const [index, setIndex] = useState(0); // index within flow steps; steps.length === contact step
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", sms: false, hp: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const started = useRef(false);
  const restored = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const flow = flowId ? FLOWS[flowId] : null;
  const steps = flow?.steps ?? [];
  const onStart = !flow;
  const onContact = !!flow && index >= steps.length;
  const step: Step | null = onStart ? START : onContact ? null : steps[index];

  const total = (preset ? 0 : 1) + steps.length + 1 || 3;
  const position = onStart ? 0 : (preset ? 0 : 1) + index;
  const progress = Math.max(8, Math.round(((position + (onContact ? 0.6 : 0)) / Math.max(total, 3)) * 100));

  // Restore an in-progress answer set (same branch only)
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return;
      const saved: Saved = JSON.parse(raw);
      if (!saved.flow || (preset && saved.flow !== preset) || Object.keys(saved.answers ?? {}).length === 0) return;
      const savedFlow = FLOWS[saved.flow];
      if (!savedFlow) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from storage
      setFlowId(saved.flow);
      setAnswers(saved.answers ?? {});
      setIndex(Math.min(saved.index ?? 0, savedFlow.steps.length));
    } catch {
      /* ignore */
    }
  }, [preset]);

  useEffect(() => {
    try {
      // Only save real progress (at least one answer), so merely viewing a page never pre-fills another page's flow.
      if (flowId && Object.keys(answers).length > 0) localStorage.setItem(STORE, JSON.stringify({ flow: flowId, index, answers } satisfies Saved));
    } catch {
      /* ignore */
    }
  }, [flowId, index, answers]);

  useEffect(() => {
    if (step?.kind === "text") setText(answers[step.id] ?? ""); // eslint-disable-line react-hooks/set-state-in-effect
  }, [step, answers]);

  const markStart = (branch: string) => {
    if (started.current) return;
    started.current = true;
    trackCustom("QuizStart", { flow: branch });
  };

  const scrollIntoViewIfNeeded = () => {
    const el = rootRef.current;
    if (!el || variant === "page") return;
    const r = el.getBoundingClientRect();
    // window.scrollTo (not scrollIntoView): scrollIntoView also scrolls the overflow-hidden hero sideways.
    if (r.top < 0) window.scrollTo({ top: r.top + window.scrollY - 90, behavior: reduce ? "auto" : "smooth" });
  };

  const answer = (s: Step, value: string, nextFlow?: LeadType) => {
    const branch = nextFlow ?? flowId ?? "start";
    markStart(branch);
    // Never send free text (addresses, names) to Meta; only the fixed option labels.
    trackCustom("QuizStep", { flow: branch, step: s.id, answer: s.kind === "choice" ? value.slice(0, 60) : "provided" });
    if (onStart && nextFlow === "careers") {
      router.push("/join"); // agents get the dedicated application + booking page
      return;
    }
    if (onStart && nextFlow) {
      setFlowId(nextFlow);
      setIndex(0);
      setAnswers({ goal: value });
    } else {
      setAnswers((a) => ({ ...a, [s.id]: value }));
      setIndex((i) => i + 1);
    }
    scrollIntoViewIfNeeded();
  };

  const back = () => {
    setError("");
    if (onStart) return;
    if (index === 0) {
      if (preset) return;
      setFlowId(null);
      setAnswers({});
      return;
    }
    setIndex((i) => i - 1);
  };

  // Desktop (mouse) visitors can't tap-to-call, so the form is their main channel: email is required.
  // On phones, calling is the main channel and the form only needs name + phone (email optional).
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    setDesktop(window.matchMedia("(hover: hover) and (pointer: fine)").matches); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!flow) return;
    setError("");
    const digits = contact.phone.replace(/\D/g, "");
    if (contact.name.trim().length < 2) return setError("Please enter your name.");
    if (digits.length < 10) return setError("Please enter a 10-digit phone number.");
    if ((desktop || contact.email.trim()) && !/^\S+@\S+\.\S+$/.test(contact.email.trim())) return setError("Please enter a valid email.");

    setStatus("sending");
    const eventId = newEventId();
    const leadType = flow.leadType;
    // Every answer from this flow, in order, labeled with the exact question the visitor saw (this is what the office email shows).
    const named: Record<string, string> = {};
    flow.steps.forEach((s) => {
      const v = answers[s.id]?.trim();
      if (v) named[s.question.replace(/\?$/, "").slice(0, 120)] = v;
    });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadType,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          smsConsent: contact.sms,
          answers: named,
          eventId,
          pageUrl: window.location.href,
          utm: getAttribution(),
          company_website: contact.hp,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Something went wrong. Please call us instead.");
      }
      setGoogleUserData({ email: contact.email || undefined, phone: contact.phone, firstName: contact.name.split(" ")[0], lastName: contact.name.split(" ").slice(1).join(" ") });
      // Browser event uses the same eventId the server sent to the Conversions API
      track(leadType === "careers" ? "SubmitApplication" : "Lead", { lead_type: leadType, content_category: leadType }, { eventId, server: false });
      try {
        localStorage.removeItem(STORE);
        sessionStorage.setItem("p1-lead-name", contact.name.split(" ")[0]);
      } catch {
        /* ignore */
      }
      router.push(`/thank-you/${leadType}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const motionProps = reduce
    ? {}
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.22 } };

  const key = `${flowId ?? "start"}-${onContact ? "contact" : index}`;
  const headingId = `funnel-q-${variant}`;

  return (
    <div
      ref={rootRef}
      id={variant === "card" ? "start" : undefined}
      data-no-click-track
      className={cn(
        "relative overflow-hidden bg-white text-ink",
        variant === "card" ? "rounded-[18px] border border-line shadow-[var(--shadow-lift)]" : "",
        className,
      )}
    >
      {/* Progress */}
      <div className="h-1.5 w-full bg-sand" aria-hidden>
        <div className="h-full bg-red transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className={cn("p-5 sm:p-6", variant === "page" && "sm:p-8")}>
        <div className="mb-4 flex min-h-8 items-center justify-between gap-3 text-sm">
          {!onStart && !(preset && index === 0) ? (
            <button type="button" onClick={back} className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-muted hover:text-ink">
              <IconBack size={18} /> Back
            </button>
          ) : (
            <span className="font-semibold text-muted">{title ?? "Free · No obligation"}</span>
          )}
          <span className="tabular-nums text-muted" aria-live="polite">
            {onContact ? "Last step" : `Step ${position + 1} of ${Math.max(total, 3)}`}
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={key} {...motionProps}>
            {step?.kind === "choice" && (
              <fieldset>
                <legend id={headingId} className="font-display text-[1.6rem] leading-tight sm:text-[1.75rem]">
                  {step.question}
                </legend>
                {step.help && <p className="mt-1.5 text-[0.95rem] text-muted">{step.help}</p>}
                <div className={cn("mt-5 grid gap-2.5", onStart ? "sm:grid-cols-2" : "")}>
                  {step.options.map((o) => {
                    const Icon = o.icon ? ICONS[o.icon] : null;
                    const selected = answers[step.id] === o.label;
                    return (
                      <button
                        key={o.label}
                        type="button"
                        onClick={() => answer(step, o.label, onStart ? (o.next as LeadType) : undefined)}
                        className={cn(
                          "group flex min-h-[60px] w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition",
                          "border-line bg-paper/60 hover:border-ink hover:bg-white active:scale-[0.99]",
                          selected && "border-red bg-red-soft",
                        )}
                      >
                        {Icon && (
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-red ring-1 ring-line group-hover:bg-red group-hover:text-white group-hover:ring-red">
                            <Icon size={22} />
                          </span>
                        )}
                        <span className="flex-1">
                          <span className="block font-semibold leading-snug">{o.label}</span>
                          {o.hint && <span className="block text-[0.82rem] text-muted">{o.hint}</span>}
                        </span>
                        <IconArrow size={18} className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {step?.kind === "text" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!text.trim() && !step.optional) return;
                  answer(step, text.trim() || "Skipped");
                }}
              >
                <label htmlFor={`f-${step.id}`} className="block font-display text-[1.6rem] leading-tight sm:text-[1.75rem]">
                  {step.question}
                </label>
                {step.help && <p className="mt-1.5 text-[0.95rem] text-muted">{step.help}</p>}
                <input
                  id={`f-${step.id}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={step.placeholder}
                  autoComplete={step.autoComplete ?? "off"}
                  inputMode={step.inputMode}
                  className="mt-5 h-14 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-[1.05rem] outline-none placeholder:text-muted/70 focus:border-ink"
                />
                <button type="submit" className="btn btn-red mt-3 w-full" disabled={!text.trim() && !step.optional}>
                  {text.trim() || !step.optional ? "Continue" : "Skip"} <IconArrow size={18} />
                </button>
              </form>
            )}

            {onContact && flow && (
              <form onSubmit={submit} noValidate>
                <h3 className="font-display text-[1.6rem] leading-tight sm:text-[1.75rem]">{flow.contactTitle}</h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.95rem] text-muted">
                  <IconCheck size={16} className="text-ok" /> {flow.contactNote}
                </p>
                <div className="mt-5 grid gap-3">
                  <Field label="Full name" id="c-name">
                    <input id="c-name" required autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={inputCls} />
                  </Field>
                  {/* Desktop: email first (it's where the answer is sent). Phones: phone first, email optional. */}
                  {(() => {
                    const phoneField = (
                      <Field key="phone" label="Best number to call you" id="c-phone">
                        <input id="c-phone" required type="tel" inputMode="tel" autoComplete="tel-national" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: formatPhone(e.target.value) })} placeholder="(813) 555-0123" className={inputCls} />
                      </Field>
                    );
                    const emailField = (
                      <Field key="email" label={desktop ? "Email (we send your answer here)" : "Email (optional)"} id="c-email">
                        <input id="c-email" required={desktop} type="email" inputMode="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={inputCls} />
                      </Field>
                    );
                    return desktop ? [emailField, phoneField] : [phoneField, emailField];
                  })()}
                  {/* Honeypot */}
                  <input tabIndex={-1} aria-hidden autoComplete="off" name="company_website" value={contact.hp} onChange={(e) => setContact({ ...contact, hp: e.target.value })} className="absolute left-[-9999px] h-0 w-0 opacity-0" />
                  <label className="flex items-start gap-2.5 text-[0.8rem] leading-snug text-muted">
                    <input type="checkbox" checked={contact.sms} onChange={(e) => setContact({ ...contact, sms: e.target.checked })} className="mt-0.5 size-4 accent-red" />
                    <span>
                      You may call me about my request, including with automated technology. Consent is not a condition of purchase. See our{" "}
                      <a href="/privacy-policy" className="underline">Privacy Policy</a> and <a href="/term-conditions" className="underline">Terms</a>.
                    </span>
                  </label>
                </div>
                {error && (
                  <p role="alert" className="mt-3 rounded-lg bg-red-soft px-3 py-2 text-sm font-semibold text-red-deep">
                    {error}
                  </p>
                )}
                <button type="submit" disabled={status === "sending"} className="btn btn-red mt-4 w-full text-base disabled:opacity-70">
                  {status === "sending" ? "Sending…" : flow.submitLabel} {status !== "sending" && <IconArrow size={18} />}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                  <IconLock size={14} /> Your information stays with Prime 1. We never sell it.
                </p>
                {!desktop && (
                  <a
                    href={site.phone.href}
                    data-loc="funnel_contact_step"
                    onClick={() => track("Contact", { method: "phone", cta_location: "funnel_contact_step" })}
                    className="btn btn-ghost mt-3 w-full"
                  >
                    <IconPhone size={18} /> Or call now: {site.phone.display}
                  </a>
                )}
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        {variant === "card" && (
          <div className="mt-5 flex items-center justify-center gap-2 border-t border-line pt-4 text-sm text-muted">
            <span>Prefer to talk?</span>
            <a
              href={site.phone.href}
              data-loc="funnel"
              onClick={() => track("Contact", { method: "phone", cta_location: "funnel" })}
              className="inline-flex items-center gap-1.5 font-bold text-ink underline-offset-4 hover:underline"
            >
              <IconPhone size={16} /> {site.phone.display}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-4 text-base outline-none placeholder:text-muted/60 focus:border-ink";

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

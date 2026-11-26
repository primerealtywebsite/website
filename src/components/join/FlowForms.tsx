"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconArrow, IconCheck } from "@/components/icons";

const inputCls = "w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-base outline-none focus:border-ink";

async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok && j.ok, j };
}

function Done({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-ok/10 p-4 text-[0.95rem]">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ok text-white"><IconCheck size={16} /></span>
      <div>{children}</div>
    </div>
  );
}
function Err({ msg }: { msg: string }) {
  return msg ? <p role="alert" className="mt-3 rounded-lg bg-red-soft px-3 py-2 text-sm font-semibold text-red-deep">{msg}</p> : null;
}

/** Written request to speak, or a response to an information request (applicant status page). */
export function MessageForm({ t, kind }: { t: string; kind: "speak" | "info" }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");
  if (state === "sent") return <Done>Sent. It is attached to your application and the broker has it.</Done>;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        if (text.trim().length < 10) return setErr("Please write at least a sentence.");
        setState("sending");
        const { ok, j } = await post("/api/join/message", { t, kind, text });
        if (!ok) {
          setState("idle");
          return setErr(j.error || "Could not send.");
        }
        setState("sent");
      }}
    >
      <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={inputCls} placeholder={kind === "speak" ? "What would you like to discuss with the broker?" : "Your response to the broker's request"} />
      <Err msg={err} />
      <button disabled={state === "sending"} className="btn btn-ink mt-3">{state === "sending" ? "Sending…" : kind === "speak" ? "Submit my request" : "Send my response"}</button>
    </form>
  );
}

/** Broker decision form. Approval requires the DBPR result and the discipline review to be recorded. */
export function DecisionForm({ t }: { t: string }) {
  const [decision, setDecision] = useState<"approve" | "decline" | "info" | "">("");
  const [dbpr, setDbpr] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [result, setResult] = useState<{ status: string; emailed: boolean } | null>(null);
  const [err, setErr] = useState("");
  const blocked = decision === "approve" && (dbpr !== "Current, Active" || !reviewed);

  if (result)
    return (
      <Done>
        <b>Recorded: {result.status}.</b> {result.emailed ? "The applicant was emailed." : "The applicant email did not go out; the office was notified."} The office has the record update.
      </Done>
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        if (!decision) return setErr("Choose a decision.");
        setState("sending");
        const { ok, j } = await post("/api/join/decision", { t, decision, dbpr, disciplineReviewed: reviewed, note });
        setState("idle");
        if (!ok) return setErr(j.error || "Could not record the decision.");
        setResult({ status: j.status, emailed: j.emailed });
      }}
      className="space-y-5"
    >
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">1. What does DBPR show for this license?</legend>
        <select value={dbpr} onChange={(e) => setDbpr(e.target.value)} className={cn(inputCls, "h-12 py-0")}>
          <option value="">Choose after checking DBPR…</option>
          {["Current, Active", "Inactive", "Delinquent / null and void", "Not found / number could not be verified", "Active with restrictions or discipline"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <label className="mt-2 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="mt-0.5 size-4 accent-red" />
          I reviewed restrictions, disciplinary findings, complaints and any material discrepancies in the record.
        </label>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">2. Decision</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              ["approve", "Approve"],
              ["info", "Request more information"],
              ["decline", "Decline"],
            ] as const
          ).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={decision === v} onClick={() => setDecision(v)} className={cn("min-h-12 rounded-xl border-[1.5px] px-3 font-semibold", decision === v ? "border-red bg-red-soft text-red-deep" : "border-line bg-white")}>
              {l}
            </button>
          ))}
        </div>
        {decision === "approve" && dbpr && dbpr !== "Current, Active" && <p className="mt-2 text-sm font-semibold text-red-deep">Approval is blocked: the license must show Current, Active on DBPR. Request more information or decline.</p>}
      </fieldset>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">3. Message to the applicant {decision === "info" ? "(required)" : "(optional)"}</span>
        <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} placeholder={decision === "info" ? "e.g. Please provide a written explanation of the 2023 complaint shown on DBPR." : decision === "decline" ? "Optional. Leave blank to send the standard neutral decline." : "Optional welcome note"} />
      </label>
      <Err msg={err} />
      <button disabled={state === "sending" || blocked} className="btn btn-red disabled:opacity-50">{state === "sending" ? "Recording…" : "Record decision and notify the applicant"}</button>
    </form>
  );
}

/** Broker confirmation: license affiliated (opens the Virtual Office) or payment received another way. */
export function BrokerConfirmForm({ t, act }: { t: string; act: "affiliate" | "paid" }) {
  const [ok, setOk] = useState(false);
  const [ref, setRef] = useState("");
  const [err, setErr] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  if (state === "done") return <Done>{act === "affiliate" ? "Recorded. The agent was emailed their Virtual Office link and the office was notified." : "Payment recorded. The agent now has the license transfer instructions."}</Done>;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        setState("sending");
        const r = await post("/api/onboarding/affiliate", { t, confirm: ok, ref });
        if (!r.ok) {
          setState("idle");
          return setErr(r.j.error || "Could not record.");
        }
        setState("done");
      }}
    >
      {act === "paid" && <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Payment reference (check #, invoice #)" className={cn(inputCls, "mb-3")} />}
      <label className="flex items-start gap-2 text-[0.95rem]">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 size-4 accent-red" />
        {act === "affiliate" ? "I confirm DBPR now shows this license under Prime 1 Realty." : "I confirm the $149 onboarding fee was received."}
      </label>
      <Err msg={err} />
      <button disabled={!ok || state === "sending"} className="btn btn-red mt-4 disabled:opacity-50">{state === "sending" ? "Recording…" : "Confirm"}</button>
    </form>
  );
}

/** Agent e-signature. */
export function SignForm({ t, name, acks, docs }: { t: string; name: string; acks: string[]; docs: { title: string; url: string }[] }) {
  const [typed, setTyped] = useState("");
  const [initials, setInitials] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [err, setErr] = useState("");
  const [state, setState] = useState<"idle" | "sending">("idle");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        if (checked.length !== acks.length) return setErr("Please initial every handbook acknowledgment.");
        setState("sending");
        const { ok, j } = await post("/api/onboarding/sign", { t, name: typed, initials, acks: checked, consent, reviewed });
        if (!ok) {
          setState("idle");
          return setErr(j.error || "Could not record your signature.");
        }
        window.location.href = `/join/onboarding?t=${encodeURIComponent(j.t)}`;
      }}
      className="space-y-5"
    >
      <div>
        <p className="text-sm font-semibold">Documents you are signing</p>
        <ul className="mt-2 space-y-1.5">
          {docs.map((d) => (
            <li key={d.url}><a href={d.url} target="_blank" rel="noopener" className="font-semibold text-red underline">{d.title}</a></li>
          ))}
        </ul>
        <label className="mt-3 flex items-start gap-2 text-[0.95rem]">
          <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="mt-1 size-4 accent-red" />
          I opened and read both documents in full.
        </label>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Handbook acknowledgments: initial each</legend>
        <div className="mb-3 flex items-center gap-3">
          <input value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 5))} placeholder="Initials" className={cn(inputCls, "w-28 uppercase")} />
          <span className="text-sm text-muted">Applied to each box you tick</span>
        </div>
        <div className="grid gap-1.5">
          {acks.map((a) => (
            <label key={a} className={cn("flex min-h-11 items-center gap-2.5 rounded-xl border-[1.5px] px-3 text-sm", checked.includes(a) ? "border-red bg-red-soft" : "border-line")}>
              <input type="checkbox" disabled={initials.length < 2} checked={checked.includes(a)} onChange={(e) => setChecked((s) => (e.target.checked ? [...s, a] : s.filter((x) => x !== a)))} className="size-4 accent-red" />
              <span className="w-12 font-mono font-bold">{checked.includes(a) ? initials : "____"}</span> {a}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">Type your full legal name to sign</span>
        <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={name} className={cn(inputCls, "font-display text-xl")} />
      </label>
      <label className="flex items-start gap-2 text-[0.9rem] leading-snug">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 accent-red" />
        I agree to sign electronically. My typed name is my signature on the Independent Contractor Agreement and the Handbook acknowledgment, with the same effect as a handwritten signature. I can download copies at any time from my onboarding page and Virtual Office.
      </label>
      <Err msg={err} />
      <button disabled={state === "sending" || !consent || !reviewed} className="btn btn-red disabled:opacity-50">{state === "sending" ? "Signing…" : "Sign and continue"} <IconArrow size={18} /></button>
    </form>
  );
}

/** Onboarding fee step: Stripe Checkout, or the sandbox (no real charge) outside production. */
export function PayStep({ t, mode, amount }: { t: string; mode: "stripe" | "sandbox" | "unavailable"; amount: string }) {
  const [err, setErr] = useState("");
  const [state, setState] = useState<"idle" | "sending">("idle");
  const go = async (simulate?: "success" | "fail") => {
    setErr("");
    setState("sending");
    const { ok, j } = await post("/api/onboarding/pay", { t, simulate });
    if (ok && j.url) return void (window.location.href = j.url);
    if (ok && j.t) return void (window.location.href = `/join/onboarding?t=${encodeURIComponent(j.t)}`);
    setState("idle");
    if (j.failed && j.url) return void (window.location.href = j.url);
    setErr(j.error || "Payment could not start.");
  };
  if (mode === "unavailable") return <p className="rounded-xl bg-paper p-4 text-[0.95rem]">Online payment is being set up. The office has your file and will contact you with a secure payment request.</p>;
  return (
    <div>
      {mode === "sandbox" ? (
        <>
          <p className="rounded-xl border-2 border-dashed border-red/40 bg-red-soft/40 p-4 text-sm"><b>Sandbox payment (test mode).</b> No card is charged. Use the buttons to simulate a successful or declined {amount} payment.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => go("success")} disabled={state === "sending"} className="btn btn-red">Simulate successful payment</button>
            <button onClick={() => go("fail")} disabled={state === "sending"} className="btn btn-ghost">Simulate declined card</button>
          </div>
        </>
      ) : (
        <button onClick={() => go()} disabled={state === "sending"} className="btn btn-red">{state === "sending" ? "Opening secure checkout…" : `Pay ${amount} securely`} <IconArrow size={18} /></button>
      )}
      <Err msg={err} />
    </div>
  );
}

/** Agent Login: request a new Virtual Office link. */
export function LostLinkForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return <Done>Thanks. If you are an affiliated Prime 1 agent, the office will email your Virtual Office link.</Done>;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await post("/api/virtual-office", { email, name });
        setSent(true);
      }}
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={inputCls} />
      <button className="btn btn-ink">Request my link</button>
    </form>
  );
}

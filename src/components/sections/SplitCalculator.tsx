"use client";

import { useMemo, useState } from "react";
import { trackCustom } from "@/lib/meta";
import { cn } from "@/lib/utils";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const CAP = 15000;

/**
 * Mirrors the compensation rules published on join.prime1realty.net:
 * self-generated residential 85/15 until $15,000 of Prime 1 splits per anniversary year, then 100%;
 * company-generated 70/30, outside the cap. Estimates only.
 */
export function SplitCalculator() {
  const [source, setSource] = useState<"self" | "company">("self");
  const [price, setPrice] = useState(500000);
  const [pct, setPct] = useState(3);
  const [referral, setReferral] = useState(0);
  const [paid, setPaid] = useState(0);
  const [used, setUsed] = useState(false);

  const r = useMemo(() => {
    const base = Math.max(0, price * (pct / 100) - referral);
    if (source === "company") {
      return { base, prime: base * 0.3, agent: base * 0.7, split: "70/30", capLeft: Math.max(0, CAP - paid), capNote: "Company-generated business is outside the cap." };
    }
    const capLeft = Math.max(0, CAP - paid);
    const prime = Math.min(base * 0.15, capLeft);
    const agent = base - prime;
    const capped = prime < base * 0.15;
    return {
      base,
      prime,
      agent,
      split: capLeft === 0 ? "100% (capped)" : capped ? "85/15, then 100% after cap" : "85/15",
      capLeft: capLeft - prime,
      capNote: capLeft - prime <= 0 ? "Cap reached. You keep 100% of qualifying self-generated residential commission for the rest of your anniversary year." : "",
    };
  }, [source, price, pct, referral, paid]);

  const touch = () => {
    if (!used) {
      setUsed(true);
      trackCustom("SplitCalculatorUsed");
    }
  };
  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    touch();
    const n = Number(e.target.value);
    set(Number.isFinite(n) && n >= 0 ? n : 0);
  };
  const field = "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-3 text-base text-ink outline-none focus:border-ink";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form className="card grid gap-4 p-6 text-ink sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">Lead source</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["self", "Self-generated"],
                ["company", "Company-generated"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  touch();
                  setSource(v);
                }}
                aria-pressed={source === v}
                className={cn("min-h-12 rounded-xl border-[1.5px] px-3 font-semibold", source === v ? "border-red bg-red-soft text-red-deep" : "border-line bg-white")}
              >
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          <span className="mb-1 block text-sm font-semibold">Sale price</span>
          <input type="number" inputMode="numeric" step={5000} min={0} value={price} onChange={num(setPrice)} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Your commission (%)</span>
          <input type="number" inputMode="decimal" step={0.25} min={0} max={10} value={pct} onChange={num(setPct)} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Approved outside referral / co-broker ($)</span>
          <input type="number" inputMode="numeric" step={100} min={0} value={referral} onChange={num(setReferral)} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Prime 1 splits already paid this year ($)</span>
          <input type="number" inputMode="numeric" step={250} min={0} max={CAP} value={paid} onChange={num(setPaid)} className={field} disabled={source === "company"} />
        </label>
      </form>
      <div className="card p-6 text-ink" aria-live="polite">
        <p className="text-sm font-semibold text-muted">You keep on this deal</p>
        <p className="mt-1 font-display text-5xl tabular-nums">{usd(r.agent)}</p>
        <dl className="mt-5 divide-y divide-line">
          {[
            ["Split base (after approved referral)", usd(r.base)],
            ["Prime 1 split", usd(r.prime)],
            ["Split", r.split],
            ["Cap remaining after this deal", source === "company" ? "Not affected" : usd(r.capLeft)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[0.95rem] text-muted">{k}</dt>
              <dd className="font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        {r.capNote && <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm">{r.capNote}</p>}
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Estimates only. Separate fees still apply: $355 transaction coordination per covered file, per side at settlement, and $59/month technology fee. The executed Independent Contractor Agreement and compensation schedule govern.
        </p>
      </div>
    </div>
  );
}

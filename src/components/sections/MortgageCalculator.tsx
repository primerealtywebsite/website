"use client";

import { useMemo, useState } from "react";
import { trackCustom } from "@/lib/meta";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function MortgageCalculator() {
  const [v, setV] = useState({ price: 425000, down: 10, rate: 6.5, term: 30, tax: 1.2, insurance: 4200, hoa: 0 });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const n = Number(e.target.value);
    setV((s) => ({ ...s, [k]: Number.isFinite(n) ? n : 0 }));
  };

  const r = useMemo(() => {
    const loan = v.price * (1 - v.down / 100);
    const i = v.rate / 100 / 12;
    const n = v.term * 12;
    const pi = i === 0 ? loan / n : (loan * i) / (1 - Math.pow(1 + i, -n));
    const tax = (v.price * (v.tax / 100)) / 12;
    const ins = v.insurance / 12;
    const pmi = v.down < 20 ? (loan * 0.005) / 12 : 0;
    const total = pi + tax + ins + pmi + v.hoa;
    return { loan, pi, tax, ins, pmi, hoa: v.hoa, total };
  }, [v]);

  const rows: [string, number, string][] = [
    ["Principal & interest", r.pi, "bg-ink"],
    ["Property tax", r.tax, "bg-red"],
    ["Homeowners insurance", r.ins, "bg-[#e7a33e]"],
    ["PMI (est.)", r.pmi, "bg-[#8a8f98]"],
    ["HOA / other", r.hoa, "bg-[#2f7d6d]"],
  ];

  const field = "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-3 text-base outline-none focus:border-ink";
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]" onChange={() => trackCustom("CalculatorUsed")}>
      <form className="card grid gap-4 p-6 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold">Home price</span>
          <input type="number" inputMode="numeric" min={0} step={5000} value={v.price} onChange={set("price")} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Down payment (%)</span>
          <input type="number" inputMode="decimal" min={0} max={100} step={0.5} value={v.down} onChange={set("down")} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Interest rate (%)</span>
          <input type="number" inputMode="decimal" min={0} max={20} step={0.125} value={v.rate} onChange={set("rate")} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Loan term</span>
          <select value={v.term} onChange={set("term")} className={field}>
            <option value={30}>30 years</option>
            <option value={20}>20 years</option>
            <option value={15}>15 years</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Property tax (% / yr)</span>
          <input type="number" inputMode="decimal" min={0} max={5} step={0.05} value={v.tax} onChange={set("tax")} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Insurance ($ / yr)</span>
          <input type="number" inputMode="numeric" min={0} step={100} value={v.insurance} onChange={set("insurance")} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">HOA / other ($ / mo)</span>
          <input type="number" inputMode="numeric" min={0} step={10} value={v.hoa} onChange={set("hoa")} className={field} />
        </label>
      </form>
      <div className="card p-6" aria-live="polite">
        <p className="text-sm font-semibold text-muted">Estimated monthly payment</p>
        <p className="mt-1 font-display text-5xl tabular-nums">{usd(r.total)}</p>
        <p className="mt-1 text-sm text-muted">Loan amount {usd(r.loan)}</p>
        <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-sand" aria-hidden>
          {rows.map(([k, val, c]) => (r.total > 0 && val > 0 ? <span key={k} className={c} style={{ width: `${(val / r.total) * 100}%` }} /> : null))}
        </div>
        <dl className="mt-5 divide-y divide-line">
          {rows.map(([k, val, c]) => (
            <div key={k} className="flex items-center justify-between py-2.5">
              <dt className="flex items-center gap-2 text-[0.95rem]"><span className={`size-2.5 rounded-full ${c}`} />{k}</dt>
              <dd className="font-semibold tabular-nums">{usd(val)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-muted">Estimate only, not a loan offer. PMI is estimated at 0.5% of the loan per year when the down payment is under 20%. Florida insurance and flood premiums vary widely by home, so get quotes before you offer.</p>
      </div>
    </div>
  );
}

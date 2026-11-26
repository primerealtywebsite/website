"use client";

import { useMemo, useState } from "react";
import { trackCustom } from "@/lib/meta";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * Florida seller net-proceeds estimate. Florida documentary stamp tax on the deed is $0.70 per $100
 * of price in every county except Miami-Dade ($0.60 per $100 for single-family homes). Who pays title
 * insurance and other closing costs varies by county and contract, so those are an editable estimate.
 */
export function NetProceedsCalculator() {
  const [price, setPrice] = useState(450000);
  const [payoff, setPayoff] = useState(250000);
  const [commission, setCommission] = useState(5);
  const [closingPct, setClosingPct] = useState(1);
  const [concessions, setConcessions] = useState(0);
  const [miamiDade, setMiamiDade] = useState(false);
  const [used, setUsed] = useState(false);

  const r = useMemo(() => {
    const docStamps = Math.ceil(price / 100) * (miamiDade ? 0.6 : 0.7);
    const comm = price * (commission / 100);
    const closing = price * (closingPct / 100);
    const net = price - payoff - comm - closing - docStamps - concessions;
    return { docStamps, comm, closing, net };
  }, [price, payoff, commission, closingPct, concessions, miamiDade]);

  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!used) {
      setUsed(true);
      trackCustom("NetProceedsCalculatorUsed");
    }
    const n = Number(e.target.value);
    set(Number.isFinite(n) && n >= 0 ? n : 0);
  };
  const field = "h-12 w-full rounded-xl border-[1.5px] border-line bg-white px-3 text-base text-ink outline-none focus:border-ink";
  const rows: [string, string][] = [
    ["Sale price", usd(price)],
    ["Mortgage payoff", `− ${usd(payoff)}`],
    ["Real estate commission", `− ${usd(r.comm)}`],
    [`Florida doc stamps on the deed (${miamiDade ? "$0.60" : "$0.70"} per $100)`, `− ${usd(r.docStamps)}`],
    ["Title and other closing costs (estimate)", `− ${usd(r.closing)}`],
    ["Repairs, credits or concessions", `− ${usd(concessions)}`],
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form className="card grid gap-4 p-6 text-ink sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <label>
          <span className="mb-1 block text-sm font-semibold">Expected sale price ($)</span>
          <input type="number" inputMode="numeric" step={5000} min={0} value={price} onChange={num(setPrice)} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Mortgage payoff ($)</span>
          <input type="number" inputMode="numeric" step={1000} min={0} value={payoff} onChange={num(setPayoff)} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Total commission (%)</span>
          <input type="number" inputMode="decimal" step={0.25} min={0} max={10} value={commission} onChange={num(setCommission)} className={field} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">Title &amp; closing costs (% of price)</span>
          <input type="number" inputMode="decimal" step={0.1} min={0} max={5} value={closingPct} onChange={num(setClosingPct)} className={field} />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-semibold">Repairs, credits or concessions ($)</span>
          <input type="number" inputMode="numeric" step={500} min={0} value={concessions} onChange={num(setConcessions)} className={field} />
        </label>
        <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
          <input type="checkbox" checked={miamiDade} onChange={(e) => setMiamiDade(e.target.checked)} className="size-4 accent-red" />
          Single-family home in Miami-Dade County (lower doc stamp rate)
        </label>
      </form>
      <div className="card p-6 text-ink" aria-live="polite">
        <p className="text-sm font-semibold text-muted">Estimated proceeds at closing</p>
        <p className="mt-1 font-display text-5xl tabular-nums">{usd(r.net)}</p>
        <dl className="mt-5 divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[0.95rem] text-muted">{k}</dt>
              <dd className="font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Estimate only, before property tax and HOA prorations. Who pays title insurance and other closing costs depends on your county and your contract. A broker property analysis and your title company give you exact figures.
        </p>
      </div>
    </div>
  );
}

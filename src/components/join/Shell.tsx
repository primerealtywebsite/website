import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconCheck, IconLock } from "@/components/icons";

export function FlowShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-paper py-10 md:py-16">
      <div className="container-x max-w-3xl">
        <p className="eyebrow text-red">{eyebrow}</p>
        <h1 className="mt-2 text-[2rem] leading-tight md:text-[2.6rem]">{title}</h1>
        {intro && <div className="mt-3 text-lg text-muted">{intro}</div>}
        <div className="mt-8 space-y-4">{children}</div>
      </div>
    </section>
  );
}

/** Loading state for the streamed flow pages (no heading, so the page has exactly one H1). */
export function FlowLoading() {
  return (
    <section className="bg-paper py-10 md:py-16" aria-busy="true">
      <div className="container-x max-w-3xl">
        <p className="text-muted">Loading…</p>
      </div>
    </section>
  );
}

export function StepCard({ n, title, state, children }: { n: number; title: string; state: "done" | "current" | "locked"; children?: ReactNode }) {
  return (
    <div className={cn("card p-5 md:p-6", state === "locked" && "opacity-60")}>
      <div className="flex items-center gap-3">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold text-white", state === "done" ? "bg-ok" : state === "current" ? "bg-red" : "bg-muted")}>
          {state === "done" ? <IconCheck size={16} /> : state === "locked" ? <IconLock size={14} /> : n}
        </span>
        <h2 className="font-sans text-lg font-bold">{title}</h2>
        <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-muted">{state === "done" ? "Complete" : state === "current" ? "Your next step" : "Locked"}</span>
      </div>
      {children && state !== "locked" && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  return <div className={cn("rounded-xl p-4 text-[0.95rem]", tone === "warn" ? "bg-red-soft text-red-deep" : "bg-white ring-1 ring-line")}>{children}</div>;
}

export function NotAvailable({ what }: { what: string }) {
  return (
    <FlowShell eyebrow="Join Prime 1" title="This step is not available from this link">
      <Notice tone="warn">
        {what} is released only after the broker approves an application, in order. If you applied, use the most recent link in your Prime 1 emails. To apply, start at <a href="/join" className="font-semibold underline">prime1realty.net/join</a>.
      </Notice>
    </FlowShell>
  );
}

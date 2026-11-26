import { connection } from "next/server";
import { Suspense } from "react";
import { BrokerConfirmForm, DecisionForm } from "@/components/join/FlowForms";
import { FlowShell, Notice, NotAvailable } from "@/components/join/Shell";
import { readBroker } from "@/lib/recruiting/token";
import { dbprLink } from "@/lib/recruiting/workflow";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Broker Review | Prime 1 Realty", description: "Broker decision", path: "/join/review", noindex: true });

export default function Page(props: PageProps<"/join/review">) {
  return (
    <Suspense fallback={<FlowShell eyebrow="Broker review" title="Loading…">{null}</FlowShell>}>
      <Review searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Review({ searchParams }: Pick<PageProps<"/join/review">, "searchParams">) {
  await connection(); // token expiry uses the current time: render per request
  const { t } = await searchParams;
  const token = typeof t === "string" ? t : "";
  const b = readBroker(token);
  if (!b) return <NotAvailable what="This broker review page" />;
  const a = b.a;
  const facts: [string, string][] = [
    ["Record", a.id],
    ["Email", a.email],
    ["Phone", a.phone],
    ["License", `${a.licenseType} ${a.license}`],
    ["Track", a.track],
    ["Markets", a.market ?? ""],
    ["Source", a.source ?? ""],
  ];

  if (b.act) {
    return (
      <FlowShell eyebrow={`Broker action · ${a.id}`} title={b.act === "affiliate" ? `Confirm ${a.first} ${a.last}'s license is affiliated` : `Record ${a.first} ${a.last}'s onboarding fee`}>
        <div className="card p-5 md:p-6">
          <dl className="grid gap-1 text-[0.95rem]">{facts.filter(([, v]) => v).map(([k, v]) => <div key={k} className="flex gap-3"><dt className="w-28 shrink-0 text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
          {b.act === "affiliate" && <p className="mt-4 text-sm">Check <a href={dbprLink()} target="_blank" rel="noopener" className="font-semibold text-red underline">DBPR</a> for {a.license}. Confirm only when the license shows Prime 1 Realty as the employing broker. This opens the agent&apos;s Virtual Office and emails their access link.</p>}
        </div>
        <div className="card p-5 md:p-6"><BrokerConfirmForm t={token} act={b.act} /></div>
      </FlowShell>
    );
  }

  return (
    <FlowShell eyebrow={`Broker review · ${a.id}`} title={`${a.first} ${a.last}`} intro="The complete record is in your application email. Decide here; the applicant and the office are notified automatically.">
      <div className="card p-5 md:p-6">
        <dl className="grid gap-1 text-[0.95rem]">{facts.filter(([, v]) => v).map(([k, v]) => <div key={k} className="flex gap-3"><dt className="w-28 shrink-0 text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
        {b.flags.length > 0 && (
          <ul className="mt-4 space-y-1.5 rounded-xl bg-red-soft p-4 text-sm text-red-deep">
            {b.flags.map((f) => <li key={f}>• {f}</li>)}
          </ul>
        )}
        <a href={dbprLink()} target="_blank" rel="noopener" className="btn btn-ink mt-5">Open DBPR license search</a>
        <p className="mt-2 text-xs text-muted">Search {a.license} or the applicant&apos;s name. DBPR does not allow automated lookups, so the result you record below is the verification of record.</p>
      </div>
      <div className="card p-5 md:p-6"><DecisionForm t={token} /></div>
      <Notice>Approving sends the agent their personal onboarding link (sign, pay, transfer). Declining sends a neutral decline; no agreement was issued and nothing was charged. If you approve and later need to withdraw, ask for {a.id} to be added to REVOKED_APPLICANTS.</Notice>
    </FlowShell>
  );
}

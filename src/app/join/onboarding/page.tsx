import { Suspense } from "react";
import { PayStep, SignForm } from "@/components/join/FlowForms";
import { FlowShell, Notice, NotAvailable, StepCard } from "@/components/join/Shell";
import { OFFER, usd } from "@/config/offer";
import { TRANSITION } from "@/content/transition";
import { packetLinks } from "@/lib/onboarding-docs";
import { HANDBOOK_ACKS, paymentMode } from "@/lib/recruiting/steps";
import { readAgent } from "@/lib/recruiting/token";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Onboarding | Prime 1 Realty", description: "Approved agent onboarding.", path: "/join/onboarding", noindex: true });

export default function Page(props: PageProps<"/join/onboarding">) {
  return (
    <Suspense fallback={<FlowShell eyebrow="Onboarding" title="Loading…">{null}</FlowShell>}>
      <Onboarding searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Onboarding({ searchParams }: Pick<PageProps<"/join/onboarding">, "searchParams">) {
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : "";
  // Pending and declined applicants never hold an approved link, so they stop here.
  const tok = readAgent(token, ["approved", "signed", "paid", "affiliated"]);
  if (!tok) return <NotAvailable what="Signing, the onboarding payment, signed documents and license transfer instructions" />;
  const { a, st } = tok;
  const docs = packetLinks("", token);
  const signDocs = docs.filter((d) => d.slug === "independent-contractor-agreement" || d.slug === "independent-contractor-handbook");
  const failed = sp.payment === "failed";

  return (
    <FlowShell eyebrow={`Approved · Record ${a.id}`} title={`Welcome, ${a.first}. Your onboarding steps`} intro="Complete each step in order. This page is personal to you.">
      <StepCard n={1} title="Broker approval" state="done" />
      <StepCard n={2} title="Review and e-sign the agreement and handbook acknowledgment" state={st === "approved" ? "current" : "done"}>
        {st === "approved" ? (
          <SignForm t={token} name={`${a.first} ${a.last}`} acks={HANDBOOK_ACKS} docs={signDocs} />
        ) : (
          <p className="text-[0.95rem] text-muted">Signed by {tok.sig?.name} on {tok.sig ? new Date(tok.sig.at).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "long", timeStyle: "short" }) : ""} ET. A copy of the signature record was emailed to you.</p>
        )}
      </StepCard>
      <StepCard n={3} title={`Pay the ${usd(OFFER.fees.onboarding)} onboarding fee`} state={st === "approved" ? "locked" : st === "signed" ? "current" : "done"}>
        {st === "signed" ? (
          <>
            {failed && <Notice tone="warn">Your last payment attempt did not go through and no charge was made. You can try again below. The office was notified and can help.</Notice>}
            <div className={failed ? "mt-4" : ""}><PayStep t={token} mode={paymentMode()} amount={usd(OFFER.fees.onboarding)} /></div>
          </>
        ) : (
          <p className="text-[0.95rem] text-muted">Paid{tok.pay?.mode === "sandbox" ? " (sandbox test, no charge)" : ""}. Reference {tok.pay?.ref}.</p>
        )}
      </StepCard>
      <StepCard n={4} title="License transfer and moving your business" state={st === "paid" ? "current" : st === "affiliated" ? "done" : "locked"}>
        <div className="space-y-5">
          {TRANSITION.map((s) => (
            <div key={s.title}>
              <h3 className="font-sans text-base font-bold">{s.title}</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.95rem]">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </StepCard>
      <StepCard n={5} title="Virtual Office and personal onboarding with the broker" state={st === "affiliated" ? "current" : "locked"}>
        <a href={`/api/virtual-office?t=${encodeURIComponent(token)}`} className="btn btn-red">Open my Virtual Office</a>
      </StepCard>

      {st !== "approved" && (
        <div className="card p-5 md:p-6">
          <h2 className="font-sans text-lg font-bold">Your documents</h2>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">{docs.map((d) => <li key={d.slug}><a href={d.url} target="_blank" rel="noopener" className="text-[0.95rem] font-semibold underline">{d.title}</a></li>)}</ul>
        </div>
      )}
    </FlowShell>
  );
}

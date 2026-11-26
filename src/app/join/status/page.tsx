import { connection } from "next/server";
import { Suspense } from "react";
import { MessageForm } from "@/components/join/FlowForms";
import { FlowLoading, FlowShell, Notice, NotAvailable, StepCard } from "@/components/join/Shell";
import { readAgent } from "@/lib/recruiting/token";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Application Status | Prime 1 Realty", description: "Your Prime 1 Realty agent application.", path: "/join/status", noindex: true });

export default function Page(props: PageProps<"/join/status">) {
  return (
    <Suspense fallback={<FlowLoading />}>
      <Status searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Status({ searchParams }: Pick<PageProps<"/join/status">, "searchParams">) {
  await connection(); // token expiry uses the current time: render per request
  const { t } = await searchParams;
  const token = typeof t === "string" ? t : "";
  const tok = readAgent(token, ["pending"]);
  if (!tok) return <NotAvailable what="This application page" />;
  const a = tok.a;
  return (
    <FlowShell eyebrow={`Record ${a.id}`} title={`${a.first}, your application is pending broker review`} intro="Every application stays pending until the Broker of Record makes a decision. You will hear from us in writing.">
      <StepCard n={1} title="Application submitted" state="done" />
      <StepCard n={2} title="Pending broker review: license verification and file review" state="current">
        <p className="text-muted">The broker verifies your license on the Florida DBPR and reviews your qualifications. The decision is approval, a request for more information, or a decline.</p>
      </StepCard>
      <StepCard n={3} title="Sign, pay the onboarding fee and transfer your license" state="locked" />
      <StepCard n={4} title="Virtual Office and personal onboarding" state="locked" />

      <div className="card p-5 md:p-6">
        <h2 className="font-sans text-lg font-bold">Did the broker ask for more information?</h2>
        <p className="mt-1 text-sm text-muted">Respond here in writing. Your response is attached to your application.</p>
        <div className="mt-4"><MessageForm t={token} kind="info" /></div>
      </div>
      <div className="card p-5 md:p-6">
        <h2 className="font-sans text-lg font-bold">Request to speak or meet with the broker</h2>
        <p className="mt-1 text-sm text-muted">Say what you would like to discuss. The request is attached to your application; the broker may reply in writing, offer a call or meeting, or decide from your file. There are no preliminary interviews or automatic appointments.</p>
        <div className="mt-4"><MessageForm t={token} kind="speak" /></div>
      </div>
      <Notice>Nothing is signed, issued or charged before approval. Need to update your application? Submit it again from <a href="/join#apply" className="font-semibold underline">prime1realty.net/join</a> with the same email; it updates this record instead of creating a new one.</Notice>
    </FlowShell>
  );
}

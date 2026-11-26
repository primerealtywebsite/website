import { connection } from "next/server";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { LostLinkForm } from "@/components/join/FlowForms";
import { FlowShell, Notice } from "@/components/join/Shell";
import { IconDoc } from "@/components/icons";
import { site } from "@/config/site";
import { TRANSITION, VO_CHECKLIST } from "@/content/transition";
import { packetLinks } from "@/lib/onboarding-docs";
import { readAgent } from "@/lib/recruiting/token";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Agent Login · Virtual Office | Prime 1 Realty", description: "Virtual Office for affiliated Prime 1 Realty agents.", path: "/virtual-office", noindex: true });

const TOOLS = [
  { name: "Prime 1 Agent Portal", href: site.portals.agentPortal, how: "Sign in with the credentials from your welcome email. Links to brokerage forms and resources." },
  { name: "MoxiWorks (CRM, website, marketing)", href: "https://sso.moxiworks.com/", how: "Accept the MoxiWorks invitation sent to your company email, then sign in with that email." },
  { name: "SkySlope (transactions) & DigiSign", href: "https://app.skyslope.com/", how: "Accept the SkySlope invitation sent to your company email. Submit every contract here for transaction coordination." },
  { name: "Company email (Google Workspace)", href: "https://mail.google.com/", how: "Sign in with your @prime1realty.net address and the temporary password the office gives you." },
  { name: "ADP (commission payments)", href: "https://my.adp.com/", how: "Activate your account from the ADP invitation, then complete your commission payment and direct deposit forms." },
  { name: "Buildout (commercial agents)", href: "https://buildout.com/login", how: "Commercial agents: accept the Buildout invitation for the brokerage account to manage listings, marketing and inquiries." },
];

export default function Page(props: PageProps<"/virtual-office">) {
  return (
    <Suspense fallback={<FlowShell eyebrow="Agent Login" title="Virtual Office">{null}</FlowShell>}>
      <Office searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Office({ searchParams }: Pick<PageProps<"/virtual-office">, "searchParams">) {
  await connection(); // token expiry uses the current time: render per request
  const sp = await searchParams;
  const token = (await cookies()).get("p1_vo")?.value ?? "";
  const tok = readAgent(token, ["affiliated"]);

  if (!tok) {
    return (
      <FlowShell eyebrow="Agent Login" title="Prime 1 Virtual Office" intro="For affiliated Prime 1 Realty agents.">
        {sp.invalid && <Notice tone="warn">That Virtual Office link is not valid. Request a new one below.</Notice>}
        <div className="card p-5 md:p-6">
          <h2 className="font-sans text-lg font-bold">Open your Virtual Office</h2>
          <p className="mt-1 text-muted">Use the &ldquo;Open my Virtual Office&rdquo; button in your Prime 1 welcome email. This device then remembers you.</p>
          <h3 className="mt-6 font-sans font-bold">Lost your link or using a new device?</h3>
          <div className="mt-3"><LostLinkForm /></div>
        </div>
        <div className="card p-5 md:p-6">
          <h2 className="font-sans text-lg font-bold">Already set up? Go straight to a tool</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {TOOLS.slice(0, 3).map((t) => <li key={t.name}><a href={t.href} target="_blank" rel="noopener" className="font-semibold underline">{t.name}</a></li>)}
          </ul>
        </div>
        <Notice>Interested in joining Prime 1? Start at <a href="/join" className="font-semibold underline">prime1realty.net/join</a>.</Notice>
      </FlowShell>
    );
  }

  const a = tok.a;
  const docs = packetLinks("", token);
  const showCommercial = a.track !== "residential";
  return (
    <FlowShell eyebrow={`Virtual Office · ${a.id}`} title={`Welcome to Prime 1, ${a.first}`} intro="Your executed documents, onboarding checklist, approved resources and brokerage tools, in one place.">
      <div className="card p-5 md:p-6">
        <h2 className="font-sans text-lg font-bold">Your broker</h2>
        <p className="mt-1">{site.recruiting.name}, Broker of Record, onboards you personally and is available to you 24/7 for brokerage matters: <a href={`mailto:${site.recruiting.email}`} className="font-semibold underline">{site.recruiting.email}</a> · <a href={site.phone.href} className="font-semibold underline">{site.phone.display}</a>.</p>
        <p className="mt-2 text-sm text-muted">Administrative questions (records, accounts, paperwork): <a href={`mailto:${site.email}`} className="underline">{site.email}</a>, {site.hours.label}.</p>
      </div>

      <div className="card p-5 md:p-6">
        <h2 className="font-sans text-lg font-bold">Executed documents</h2>
        <p className="mt-1 text-sm text-muted">Signed electronically by {tok.sig?.name ?? `${a.first} ${a.last}`}{tok.sig ? ` on ${new Date(tok.sig.at).toLocaleDateString("en-US", { dateStyle: "long" })}` : ""}. Affiliated {tok.aff ? new Date(tok.aff.at).toLocaleDateString("en-US", { dateStyle: "long" }) : ""}.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {docs.map((d) => (
            <li key={d.slug}><a href={d.url} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm font-semibold hover:border-ink"><IconDoc size={16} className="shrink-0 text-red" /> {d.title}</a></li>
          ))}
        </ul>
      </div>

      <div className="card p-5 md:p-6">
        <h2 className="font-sans text-lg font-bold">Onboarding checklist</h2>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          {VO_CHECKLIST.filter((g) => showCommercial || !g.group.startsWith("Commercial")).map((g) => (
            <div key={g.group}>
              <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-muted">{g.group}</h3>
              <ul className="mt-2 space-y-1.5 text-[0.95rem]">{g.items.map((i) => <li key={i} className="flex gap-2"><span className="mt-1 size-3.5 shrink-0 rounded border-[1.5px] border-ink/40" />{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 md:p-6">
        <h2 className="font-sans text-lg font-bold">Brokerage tools: how to get access</h2>
        <ul className="mt-3 space-y-3">
          {TOOLS.filter((t) => showCommercial || !t.name.startsWith("Buildout")).map((t) => (
            <li key={t.name}><a href={t.href} target="_blank" rel="noopener" className="font-semibold text-red underline">{t.name}</a><p className="text-sm text-muted">{t.how}</p></li>
          ))}
        </ul>
      </div>

      <details className="card p-5 md:p-6">
        <summary className="cursor-pointer font-sans text-lg font-bold">Transition instructions (license, MLS, listings, pendings, technology)</summary>
        <div className="mt-4 space-y-5">
          {TRANSITION.map((s) => (
            <div key={s.title}><h3 className="font-sans font-bold">{s.title}</h3><ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.95rem]">{s.items.map((i) => <li key={i}>{i}</li>)}</ul></div>
          ))}
        </div>
      </details>

      <Notice>Tampa office (optional): if you plan to use it, schedule your first visit with the office for orientation and building access. After that, use the office without scheduling each visit.</Notice>
    </FlowShell>
  );
}

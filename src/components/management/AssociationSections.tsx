import { CheckList, Heading, Section } from "@/components/sections/Blocks";
import { TrackedLink } from "@/components/analytics/Tracked";
import { IconPhone } from "@/components/icons";
import { BOARD_DECIDES, DELIVERABLES, MANAGER_HANDLES, PROPOSAL_STEPS, SERVICE_CRITERIA } from "@/content/management";
import { site } from "@/config/site";

/** Board-facing sections for /property_management: criteria, deliverables, responsibilities, process, residents. */
export function AssociationSections() {
  return (
    <>
      <Section tone="white" id="criteria">
        <Heading eyebrow="Service criteria" title="Accounts Prime 1 accepts" intro="Prime 1 Property Management's service criteria, throughout Florida." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_CRITERIA.map((c) => (
            <div key={c.t} className="card p-6">
              <h3 className="text-xl">{c.t}</h3>
              <p className="mt-2 text-muted">{c.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper" id="deliverables">
        <Heading eyebrow="What boards receive" title="Inspections, reporting and a portal that works" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DELIVERABLES.map(([t, b]) => (
            <div key={t} className="card p-6">
              <h3 className="text-xl">{t}</h3>
              <p className="mt-2 text-muted">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">A sample board report or inspection summary is available to boards on request during the proposal.</p>
      </Section>

      <Section tone="white" id="responsibilities">
        <Heading eyebrow="Who decides what" title="The board governs. The manager carries it out." intro="Exact responsibilities and spending limits are set in the management agreement." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="text-xl">Decisions that stay with the board</h3>
            <CheckList className="mt-4" items={BOARD_DECIDES} />
          </div>
          <div className="card p-6">
            <h3 className="text-xl">What the manager handles under the agreement</h3>
            <CheckList className="mt-4" items={MANAGER_HANDLES} />
          </div>
        </div>
      </Section>

      <Section tone="paper" id="process">
        <Heading eyebrow="From request to transition" title="How we propose and take over" />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROPOSAL_STEPS.map(([t, b], i) => (
            <li key={t} className="card p-5">
              <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 text-xl">{t}</h3>
              <p className="mt-1 text-[0.95rem] text-muted">{b}</p>
            </li>
          ))}
        </ol>
        <a href="#start" className="btn btn-red mt-8">Request an Association Management Proposal</a>
      </Section>

      <Section tone="ink" id="residents">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Heading tone="dark" eyebrow="Current residents & owners" title="Your portal, payments, requests and documents" />
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                ["Resident & owner portal", site.portals.resident],
                ["Pay dues or rent", site.portals.resident],
                ["Maintenance request", site.portals.resident],
                ["Community documents", site.portals.resident],
              ].map(([l, h]) => (
                <TrackedLink key={l} href={h} custom="PortalLogin" params={{ portal: l }} className="rounded-xl bg-white/5 px-4 py-3.5 font-semibold text-white ring-1 ring-white/15 hover:ring-white/40">{l} →</TrackedLink>
              ))}
            </div>
            <p className="mt-3 text-sm text-white/60">All four open in the Buildium resident portal. Owners: <a href={site.portals.owner} className="underline">owner portal login</a>.</p>
          </div>
          <div className="rounded-2xl bg-red p-6 text-white md:p-8">
            <h3 className="text-2xl">Community association emergency?</h3>
            <p className="mt-2 text-white/90">Fire, flooding, a water leak affecting units or common areas, a security or life-safety issue: call now. Live phone answering 24/7.</p>
            <TrackedLink href={site.phone.href} event="Contact" params={{ method: "phone", cta_location: "association_emergency" }} className="btn mt-5 bg-white text-red-deep"><IconPhone size={18} /> {site.phone.display}</TrackedLink>
            <p className="mt-3 text-sm text-white/80">If anyone is in danger, call 911 first. Non-emergency requests: use the portal; the office is open {site.hours.label}.</p>
          </div>
        </div>
      </Section>
    </>
  );
}

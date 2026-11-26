import "server-only";
import { idx, people, site, type PersonKey } from "@/config/site";
import { SERVICES } from "@/content/services";
import { AREAS } from "@/content/areas";
import { POSTS } from "@/content/blog";
import { HOME, FAQS as HOME_FAQS, PATHS } from "@/content/home";
import { FAQS as AGENT_FAQS, STATS as AGENT_STATS } from "@/content/careers";
import { COMMERCIAL_SCENARIOS, FEE_TABLE, OFFER, RESIDENTIAL_SCENARIOS, SCENARIO_NOTE, usd } from "@/config/offer";
import { articleSchema, breadcrumbSchema, faqSchema, organizationSchema, personSchema, serviceSchema } from "@/lib/schema";
import { EMPLOYMENT, EMPLOYMENT_FAQS } from "@/content/employment";

/**
 * AI version (agent view) of each public page. Built only from the content files the human pages
 * render, so every fact here also appears on the human page (fact parity). Rendered as minimal HTML
 * for AI agents and as Markdown for /page.md. See AI-Ready-Website-Playbook.pdf.
 */

type Faq = { q: string; a: string };
type Section = { h2: string; paras?: string[]; list?: string[] };
export type AgentDoc = {
  path: string;
  title: string;
  description: string;
  h1: string;
  answer: string[];
  facts?: string[];
  sections: Section[];
  faqs?: Faq[];
  start?: string[];
  related?: { label: string; href: string }[];
  updated: string;
  schema: object[];
};

const CONTENT_UPDATED = "2026-11-26";
const u = (path: string) => `${site.url}${path}`;
const ADDRESS = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`;

/** Same lines shown in the site footer/contact page, repeated on every AI page. */
export const ENTITY = [
  `${site.name} is a licensed Florida real estate brokerage. ${site.pmName} is a licensed Florida community association management (CAM) firm. Both are headquartered in Tampa and serve clients throughout Florida.`,
  `Broker of Record and Designated CAM: ${people.antony.name}.`,
  `Headquarters: ${ADDRESS}. Office hours: ${site.hours.label}. ${site.hours.note}.`,
  `Phone: ${site.phone.display}. ${site.phone.callsOnly}. ${site.pmName} provides ${site.phone.emergency}. Email: ${site.email}.`,
  `Service area: throughout Florida.`,
];

const START_DEFAULT = [
  `Call ${site.phone.display} during office hours (${site.hours.label}).`,
  `Or answer a few questions online at ${u("/get-started")}; a licensed professional replies, usually within one business day.`,
];

function servicesDoc(key: string): AgentDoc {
  const s = SERVICES[key];
  const sections: Section[] = [
    { h2: s.includes.title, paras: [s.includes.intro], list: s.includes.items },
    ...(s.audiences ? [{ h2: s.audiences.title, list: s.audiences.items.map((a) => `${a.title}: ${a.body}`) }] : []),
    { h2: s.steps.title, list: s.steps.items.map((st, i) => `${i + 1}. ${st.title}: ${st.body}`) },
  ];
  return {
    path: s.path,
    title: s.meta.title,
    description: s.meta.description,
    h1: s.hero.h1,
    answer: [s.hero.lede],
    facts: s.hero.bullets,
    sections: [{ h2: s.answer.q, paras: [s.answer.a] }, ...sections],
    faqs: s.faqs,
    start: [`${s.cta.title}: ${s.cta.body}`, `Request it online at ${u(s.path)} (form on the page) or call ${site.phone.display} during office hours (${site.hours.label}).`],
    related: s.related.map((r) => ({ label: r.label, href: r.href })),
    updated: CONTENT_UPDATED,
    schema: [
      serviceSchema({ name: s.schema.name, description: s.meta.description, path: s.path, serviceType: s.schema.serviceType }),
      faqSchema(s.faqs),
      breadcrumbSchema(s.crumbs),
    ],
  };
}

function homeDoc(): AgentDoc {
  return {
    path: "/",
    title: "Prime 1 Realty | Florida Real Estate & Association Management",
    description: "Licensed Florida real estate brokerage and community association management firm, headquartered in Tampa. Buy, sell, lease or request a management proposal.",
    h1: HOME.h1,
    answer: [HOME.whoA, HOME.lede],
    facts: HOME.bullets,
    sections: [{ h2: "What Prime 1 helps with", list: PATHS.map((p) => `${p.title}: ${p.body} (${u(p.href)})`) }],
    faqs: HOME_FAQS,
    start: START_DEFAULT,
    related: PATHS.map((p) => ({ label: p.title, href: p.href })),
    updated: CONTENT_UPDATED,
    schema: [faqSchema(HOME_FAQS)],
  };
}

function areaDocs(): AgentDoc[] {
  const index: AgentDoc = {
    path: "/areas",
    title: "Local Market Guides | Prime 1 Realty, Serving All of Florida",
    description: "Prime 1 Realty serves clients throughout Florida from its Tampa headquarters. Local market guides for Tampa, Brandon, Riverview, Clearwater and St. Petersburg.",
    h1: "Local market guides",
    answer: ["Prime 1 serves clients throughout Florida. These guides cover neighborhoods, flood zones, insurance and HOAs in communities near our Tampa headquarters."],
    sections: [{ h2: "Area guides", list: AREAS.map((a) => `${a.name} (${a.county}): ${a.lede} ${u(`/areas/${a.slug}`)}`) }],
    start: START_DEFAULT,
    updated: CONTENT_UPDATED,
    schema: [breadcrumbSchema([{ label: "Areas", href: "/areas" }])],
  };
  const each = AREAS.map(
    (a): AgentDoc => ({
      path: `/areas/${a.slug}`,
      title: a.metaTitle,
      description: a.description,
      h1: a.h1,
      answer: [a.answer, a.lede],
      sections: [
        ...(a.neighborhoods.length ? [{ h2: `Neighborhoods in ${a.name}`, list: a.neighborhoods.map((n) => `${n.name}: ${n.note}`) }] : []),
        ...(a.knowBefore.length ? [{ h2: `Know before you buy or rent in ${a.name}`, list: a.knowBefore }] : []),
      ],
      faqs: a.faqs,
      start: START_DEFAULT,
      related: AREAS.filter((x) => x.slug !== a.slug).map((x) => ({ label: x.name, href: `/areas/${x.slug}` })),
      updated: CONTENT_UPDATED,
      schema: [faqSchema(a.faqs), breadcrumbSchema([{ label: "Areas", href: "/areas" }, { label: a.name, href: `/areas/${a.slug}` }])],
    }),
  );
  return [index, ...each];
}

function blogDocs(): AgentDoc[] {
  const sorted = [...POSTS].sort((a, b) => b.published.localeCompare(a.published));
  const index: AgentDoc = {
    path: "/blog",
    title: "Florida Real Estate Insights & Guides | Prime 1 Realty Blog",
    description: "Guides for Florida buyers, sellers, landlords and association boards: Florida CAM licensing, market insights, renting tips and landlord requirements.",
    h1: "Real estate insights for Florida",
    answer: ["Plain-language guides for buyers, sellers, renters, landlords and association boards."],
    sections: [{ h2: "Articles", list: sorted.map((p) => `${p.title} ${u(`/blog/${p.slug}`)}`) }],
    start: START_DEFAULT,
    updated: sorted[0]?.modified ?? CONTENT_UPDATED,
    schema: [breadcrumbSchema([{ label: "Blog", href: "/blog" }])],
  };
  const each = POSTS.map(
    (p): AgentDoc => ({
      path: `/blog/${p.slug}`,
      title: p.metaTitle,
      description: p.description,
      h1: p.title,
      answer: [p.tldr],
      sections: p.body.map((b, i) => ({ h2: b.h2 ?? (i === 0 ? "Overview" : "More"), paras: b.p, list: b.list })),
      start: [`${p.cta.label}: ${u(p.cta.href)}`, ...START_DEFAULT],
      updated: p.modified,
      schema: [
        articleSchema({ title: p.title, description: p.description, path: `/blog/${p.slug}`, image: p.image, published: p.published, modified: p.modified }),
        breadcrumbSchema([{ label: "Blog", href: "/blog" }, { label: p.title, href: `/blog/${p.slug}` }]),
      ],
    }),
  );
  return [index, ...each];
}

function careersDocs(): AgentDoc[] {
  const facts = AGENT_STATS.map((s) => `${s.v} ${s.l.toLowerCase()} (${s.s})`);
  const row = (r: (typeof RESIDENTIAL_SCENARIOS)[number]) => `${r.label}: Prime 1 split ${usd(r.split)}, fees ${usd(r.fees)}, you keep ${usd(r.keep)} (${Math.round(r.keepPct * 1000) / 10}%). ${r.note}.`;
  return [
    {
      path: "/join",
      title: "Join Prime 1 Realty | Florida Agent Offer, Splits & Fees",
      description: "For experienced Florida agents: the complete Prime 1 offer, what you keep after splits and fees, incentives, support and how affiliation works.",
      h1: "Independent contractor affiliation for producing Florida agents.",
      answer: [
        "Residential and commercial, anywhere in Florida. Review the complete offer, what you keep after splits, caps and fees, and how affiliation works, then apply. The broker reviews and approves every application before any agreement, payment or license transfer.",
      ],
      facts,
      sections: [
        { h2: "Fees", list: FEE_TABLE.map((f) => `${f.fee}: ${f.amount}${f.afterCap ? ` (after the cap: ${f.afterCap.toLowerCase()})` : ""}`) },
        { h2: "What you keep (year one, before incentives)", paras: [SCENARIO_NOTE], list: [...RESIDENTIAL_SCENARIOS.map((r) => `Residential ${row(r)}`), ...COMMERCIAL_SCENARIOS.map((r) => `Commercial ${row(r)}`)] },
        {
          h2: "Incentives (separate)",
          list: [
            `Producer Advantage: ${usd(OFFER.producerAdvantage.bonus)} for ${OFFER.producerAdvantage.closings} qualifying residential closings in the first ${OFFER.producerAdvantage.days} days, and ${usd(OFFER.producerAdvantage.sellerBonus)} per qualifying residential seller closing in the first ${OFFER.producerAdvantage.sellerBonusDays} days. Both apply to business the agent generates.`,
            `${OFFER.activationDays}-day Producer Activation Program: establishes eligibility for company-generated leads and qualified listing appointments after affiliation. Earlier approval is at the broker's discretion. Assignments depend on availability, performance, responsiveness and client service.`,
          ],
        },
        {
          h2: "Affiliation steps",
          paras: ["There is no mandatory phone consultation, interview or calendar appointment. Gabrielle Ortiz provides administrative support throughout the process; all affiliation approvals and license transfers remain exclusively with the Broker of Record."],
          list: ["1. Submit the affiliation application.", "2. The Broker of Record reviews the application (DBPR license verification).", "3. Approved applicants receive the Independent Contractor Agreement for electronic signature.", `4. Following execution, the applicant pays the ${usd(OFFER.fees.onboarding)} onboarding fee.`, "5. The Broker of Record processes the license affiliation through the Florida Department of Business and Professional Regulation (DBPR).", "6. Brokerage onboarding is completed, including ADP payment setup, applicable technology access and Virtual Office credentials."],
        },
      ],
      faqs: AGENT_FAQS,
      start: [`Review the offer and apply: ${u("/join")}`],
      related: [{ label: "Our team", href: "/team" }],
      updated: CONTENT_UPDATED,
      schema: [faqSchema(AGENT_FAQS)],
    },
  ];
}

function employmentDoc(): AgentDoc {
  return {
    path: "/employment",
    title: "LCAM Employment | Prime 1 Property Management Florida",
    description: "Employment for Florida Licensed Community Association Managers at Prime 1 Property Management: part time and full time W2 roles. Apply with your résumé.",
    h1: EMPLOYMENT.role,
    answer: [EMPLOYMENT.intro, `Current employment status: ${EMPLOYMENT.status}`],
    sections: [
      { h2: EMPLOYMENT.partTime.label, list: [...EMPLOYMENT.partTime.items] },
      { h2: EMPLOYMENT.fullTime.label, list: [...EMPLOYMENT.fullTime.items] },
      { h2: "Requirements", list: [...EMPLOYMENT.requirements] },
      { h2: "How to apply", paras: [`Submit the online employment application with your résumé, contact information, Florida CAM license number, relevant experience, employment preference and availability: ${u("/employment#apply")}. There is no fee to apply. Real estate agents affiliate separately with Prime 1 Realty as independent contractors: ${u("/join")}.`] },
    ],
    faqs: EMPLOYMENT_FAQS,
    start: [`Apply: ${u("/employment#apply")}`],
    related: [{ label: "Association management", href: "/property_management" }, { label: "Our team", href: "/team" }],
    updated: CONTENT_UPDATED,
    schema: [faqSchema(EMPLOYMENT_FAQS)],
  };
}

function teamDocs(): AgentDoc[] {
  const keys = Object.keys(people) as PersonKey[];
  const index: AgentDoc = {
    path: "/team",
    title: "Our Team | Prime 1 Realty & Property Management, Tampa",
    description: "Meet the Prime 1 team: Broker of Record and Designated CAM Antony Oseitutu, licensed Community Association Manager Jennifer M. Rivera and operations & transaction support Gabrielle Ortiz.",
    h1: "Who you will work with",
    answer: ["Licensed professionals who answer to you, backed by a Broker of Record you can reach directly."],
    sections: [{ h2: "People", list: keys.map((k) => `${people[k].name}, ${people[k].role}: ${u(`/team/${people[k].slug}`)}`) }],
    start: START_DEFAULT,
    updated: CONTENT_UPDATED,
    schema: keys.map((k) => personSchema(k)),
  };
  const each = keys.map(
    (k): AgentDoc => ({
      path: `/team/${people[k].slug}`,
      title: `${people[k].name}, ${people[k].short} | Prime 1`,
      description: `${people[k].name} is ${people[k].role} at Prime 1 in Tampa, FL. ${people[k].bio[0]}`.slice(0, 155),
      h1: people[k].name,
      answer: [people[k].bio[0]],
      facts: [...people[k].titles],
      sections: people[k].bio.length > 1 ? [{ h2: "About", paras: people[k].bio.slice(1) }] : [],
      start: START_DEFAULT,
      related: [{ label: "Our team", href: "/team" }],
      updated: CONTENT_UPDATED,
      schema: [personSchema(k)],
    }),
  );
  return [index, ...each];
}

function contactDoc(): AgentDoc {
  return {
    path: "/lets-connect",
    title: "Contact Prime 1 Realty | Tampa Office (813) 295-8215",
    description: `Call ${site.phone.display}, email or visit Prime 1 Realty at ${ADDRESS}. Office Mon–Fri 9 AM–5 PM ET. 24/7 live answering for community association emergencies.`,
    h1: "Let's connect",
    answer: [`Call ${site.phone.display} during office hours (${site.hours.label}), email ${site.email} or visit the Tampa headquarters at ${ADDRESS}. Prime 1 serves clients throughout Florida.`],
    facts: [
      `Phone: ${site.phone.display}. ${site.phone.callsOnly}. ${site.phone.emergency}.`,
      `Email: ${site.email}`,
      `Office: ${ADDRESS}`,
      `Office hours: ${site.hours.label}. ${site.hours.note}.`,
      `Directions: ${site.mapsUrl}`,
    ],
    sections: [
      {
        h2: "Portals",
        list: [`Resident portal (tenants): ${site.portals.resident}`, `Association portal (homeowners and boards): ${site.portals.association}`, `Rental owner portal (Buildium owner sign-in): ${site.portals.owner}`, `Rental application: ${site.portals.rentalApplication}`, `Home search (MLS listings): ${idx.search}`],
      },
    ],
    start: START_DEFAULT,
    updated: CONTENT_UPDATED,
    schema: [],
  };
}

let cache: Map<string, AgentDoc> | null = null;
export function agentDocs() {
  if (!cache) {
    const all = [homeDoc(), ...Object.keys(SERVICES).map(servicesDoc), ...areaDocs(), ...blogDocs(), ...careersDocs(), employmentDoc(), ...teamDocs(), contactDoc()];
    cache = new Map(all.map((d) => [d.path, d]));
  }
  return cache;
}
export const agentDoc = (path: string) => agentDocs().get(path) ?? null;

/* ---------- Renderers ---------- */

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
/** Turn bare URLs in plain text into links. */
const linkify = (s: string) => esc(s).replace(/https?:\/\/[^\s<)]+[^\s<).,;]/g, (m) => `<a href="${m}">${m}</a>`);

export function renderAgentHtml(d: AgentDoc) {
  const ld = [organizationSchema(), ...d.schema].map((s) => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`).join("");
  const list = (items: string[]) =>
    items.every((i) => /^\d+\.\s/.test(i))
      ? `<ol>${items.map((i) => `<li>${linkify(i.replace(/^\d+\.\s/, ""))}</li>`).join("")}</ol>`
      : `<ul>${items.map((i) => `<li>${linkify(i)}</li>`).join("")}</ul>`;
  const body = [
    `<h1>${esc(d.h1)}</h1>`,
    ...d.answer.map((p) => `<p>${linkify(p)}</p>`),
    d.facts?.length ? `<h2>Key facts</h2>${list(d.facts)}` : "",
    ...d.sections.map((s) => `<h2>${esc(s.h2)}</h2>${(s.paras ?? []).map((p) => `<p>${linkify(p)}</p>`).join("")}${s.list?.length ? list(s.list) : ""}`),
    d.faqs?.length ? `<h2>Frequently asked questions</h2>${d.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${linkify(f.a)}</p>`).join("")}` : "",
    `<h2>How to get started</h2>${list(d.start ?? START_DEFAULT)}`,
    `<h2>About ${esc(site.name)}</h2>${list(ENTITY)}`,
    d.related?.length ? `<h2>Related pages</h2><ul>${d.related.map((r) => `<li><a href="${u(r.href)}">${esc(r.label)}</a></li>`).join("")}</ul>` : "",
    `<p>Last updated: ${d.updated}. Page: <a href="${u(d.path)}">${u(d.path)}</a></p>`,
  ].join("\n");
  return `<!doctype html>
<html lang="en-US"><head>
<meta charset="utf-8">
<title>${esc(d.title)}</title>
<meta name="description" content="${esc(d.description)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${u(d.path)}">
<link rel="alternate" type="text/markdown" href="${u(d.path === "/" ? "/index.md" : `${d.path}.md`)}">
${ld}
</head><body><main>
${body}
</main></body></html>
`;
}

export function renderAgentMarkdown(d: AgentDoc) {
  const out: string[] = [`# ${d.h1}`, "", ...d.answer.flatMap((p) => [p, ""])];
  if (d.facts?.length) out.push("## Key facts", ...d.facts.map((f) => `- ${f}`), "");
  for (const s of d.sections) out.push(`## ${s.h2}`, ...(s.paras ?? []).flatMap((p) => [p, ""]), ...(s.list ?? []).map((i) => (/^\d+\./.test(i) ? i : `- ${i}`)), "");
  if (d.faqs?.length) out.push("## Frequently asked questions", ...d.faqs.flatMap((f) => [`### ${f.q}`, f.a, ""]));
  out.push("## How to get started", ...(d.start ?? START_DEFAULT).map((s) => `- ${s}`), "");
  out.push(`## About ${site.name}`, ...ENTITY.map((e) => `- ${e}`), "");
  if (d.related?.length) out.push("## Related pages", ...d.related.map((r) => `- [${r.label}](${u(r.href)})`), "");
  out.push(`Last updated: ${d.updated}. Canonical: ${u(d.path)}`);
  return `---\ntitle: ${JSON.stringify(d.title)}\ndescription: ${JSON.stringify(d.description)}\ncanonical: ${u(d.path)}\nupdated: ${d.updated}\n---\n\n${out.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

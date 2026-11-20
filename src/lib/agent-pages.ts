import "server-only";
import { idx, people, site, type PersonKey } from "@/config/site";
import { SERVICES } from "@/content/services";
import { AREAS } from "@/content/areas";
import { POSTS } from "@/content/blog";
import { HOME, FAQS as HOME_FAQS, PATHS } from "@/content/home";
import { FAQS as AGENT_FAQS, JOIN_STATS, STATS as AGENT_STATS } from "@/content/careers";
import { ONBOARDING_DOCS } from "@/lib/onboarding-docs";
import { articleSchema, breadcrumbSchema, faqSchema, organizationSchema, personSchema, serviceSchema } from "@/lib/schema";

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

const CONTENT_UPDATED = "2026-11-20";
const u = (path: string) => `${site.url}${path}`;
const ADDRESS = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`;

/** Same lines shown in the site footer/contact page, repeated on every AI page. */
export const ENTITY = [
  `${site.name} is a licensed Florida real estate brokerage. ${site.pmName} is its licensed Florida community association management (CAM) firm.`,
  `Broker of Record and Designated CAM: ${people.antony.name}.`,
  `Office: ${ADDRESS}. Office hours: ${site.hours.label}.`,
  `Phone: ${site.phone.display}. ${site.phone.answered}. ${site.phone.callsOnly}. Email: ${site.email}.`,
  `Service area: ${site.serviceArea.join(", ")}.`,
];

const START_DEFAULT = [
  `Call ${site.phone.display}. ${site.phone.answered}.`,
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
    start: [`${s.cta.title}: ${s.cta.body}`, `Request it online at ${u(s.path)} (form on the page) or call ${site.phone.display} (${site.phone.answered.toLowerCase()}).`],
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
    title: "Tampa Bay Real Estate & Property Management | Prime 1 Realty",
    description: "Buy, sell, rent or get your HOA, condo or rental managed in Tampa Bay. Licensed Florida brokerage and CAM firm. Get started in 60 seconds.",
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
    title: "Areas We Serve in Tampa Bay | Prime 1 Realty",
    description: "Prime 1 Realty serves Tampa, Brandon, Riverview, Clearwater, St. Petersburg and surrounding Hillsborough and Pinellas County communities.",
    h1: "Areas we serve across Tampa Bay",
    answer: ["Local notes on neighborhoods, flood zones, insurance and HOAs for each community."],
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
    title: "Tampa Bay Real Estate Insights & Guides | Prime 1 Realty Blog",
    description: "Guides for Tampa Bay buyers, sellers, landlords and HOA boards: Florida CAM licensing, market insights, renting tips and landlord requirements.",
    h1: "Real estate insights for Tampa Bay",
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
  return [
    {
      path: "/careers",
      title: "Florida Real Estate Agent Careers | 85/15, $15K Cap | Prime 1",
      description: "Join Prime 1 Realty: 85/15 with a $15,000 residential cap, then 100%. Company leads, a $5,000 production accelerator and remote work anywhere in Florida.",
      h1: "Residential and commercial. One brokerage.",
      answer: ["85/15 with a $15,000 residential cap, then 100%. Production bonuses, company-generated leads and listing appointments. Work anywhere in Florida."],
      facts,
      sections: [],
      faqs: AGENT_FAQS,
      start: [`Apply online in about 2 minutes (no interview) or book a 30-minute call with ${site.recruiting.name}: ${u("/join")}`, `Email ${site.recruiting.email}.`],
      related: [{ label: "Join Prime 1", href: "/join" }],
      updated: CONTENT_UPDATED,
      schema: [faqSchema(AGENT_FAQS)],
    },
    {
      path: "/join",
      title: "Join Prime 1 Realty | Apply Online or Book a Call with the Broker",
      description: "Florida agents: apply to Prime 1 Realty in 2 minutes with no interview and get the onboarding packet by email, or book a 30-minute call with Broker Antony Oseitutu.",
      h1: "Apply in 2 minutes. No interview required.",
      answer: [
        `Send your details and your onboarding packet lands in your inbox right away. Prefer to talk first? Book a 30-minute call with ${site.recruiting.name}, our Broker of Record.`,
      ],
      facts: JOIN_STATS.map((s) => `${s.v}: ${s.l}`),
      sections: [
        { h2: "Your onboarding packet", paras: ["Every applicant gets the full Prime 1 packet by email, plus download links on the confirmation screen."], list: ONBOARDING_DOCS.map((d) => d.title) },
        {
          h2: "How joining works",
          list: [
            "1. Apply: two minutes online. Your packet is emailed instantly.",
            "2. Review & sign: read the agreement and handbook. Antony coordinates your license transfer.",
            "3. Get set up: association/MLS, Agent Portal, MoxiWorks, SkySlope, company email and ADP.",
            "4. Produce: finish the 14-day Producer Activation Program to qualify for company leads.",
          ],
        },
      ],
      start: [`Apply online: ${u("/join")}`, `Book a 30-minute call with ${site.recruiting.name}: ${site.recruiting.calendly}`, `Email ${site.recruiting.email} or call ${site.phone.display}.`],
      related: [{ label: "Agent careers and compensation", href: "/careers" }],
      updated: CONTENT_UPDATED,
      schema: [],
    },
  ];
}

function teamDocs(): AgentDoc[] {
  const keys = Object.keys(people) as PersonKey[];
  const index: AgentDoc = {
    path: "/team",
    title: "Our Team | Prime 1 Realty & Property Management, Tampa",
    description: "Meet the Prime 1 team: Broker of Record and Designated CAM Antony Oseitutu and licensed Community Association Manager Jennifer Rivera.",
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
      title: `${people[k].name}, ${k === "antony" ? "Broker & Designated CAM" : "Licensed CAM"} | Prime 1 Realty`,
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
    description: `Call ${site.phone.display}, email or visit Prime 1 Realty at ${ADDRESS}. Calls answered 24/7. Office Mon–Fri 9 AM–6 PM.`,
    h1: "Let's connect",
    answer: [`Call ${site.phone.display} (${site.phone.answered.toLowerCase()}), email ${site.email} or visit the office at ${ADDRESS}.`],
    facts: [
      `Phone: ${site.phone.display}. ${site.phone.answered}. ${site.phone.callsOnly}.`,
      `Email: ${site.email}`,
      `Office: ${ADDRESS}`,
      `Office hours: ${site.hours.label}`,
      `Directions: ${site.mapsUrl}`,
    ],
    sections: [
      {
        h2: "Portals",
        list: [`Owner portal: ${site.portals.owner}`, `Resident and association portal: ${site.portals.resident}`, `Rental application: ${site.portals.rentalApplication}`, `Home search (MLS listings): ${idx.search}`],
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
    const all = [homeDoc(), ...Object.keys(SERVICES).map(servicesDoc), ...areaDocs(), ...blogDocs(), ...careersDocs(), ...teamDocs(), contactDoc()];
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

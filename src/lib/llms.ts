import { idx, people, site } from "@/config/site";
import { SERVICES } from "@/content/services";
import { AREAS } from "@/content/areas";
import { POSTS } from "@/content/blog";
import { FAQS as AGENT_FAQS } from "@/content/careers";
import { OFFER, SPLIT_LABEL, usd } from "@/config/offer";

/**
 * AI-only version of the site (llms.txt standard): plain Markdown built from the same content files
 * the pages use, so ChatGPT, Claude, Perplexity and Gemini get accurate, current facts in one read.
 */

const u = (path: string) => `${site.url}${path}`;
const addr = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`;

const FACTS = [
  `Business: ${site.name}, a licensed Florida real estate brokerage.`,
  `Sister company: ${site.pmName}, a licensed Florida community association management (CAM) firm. Both are DBAs of ${site.legalName}.`,
  `Broker of Record and Designated CAM: ${people.antony.name}.`,
  `Office: ${addr} (${site.address.neighborhood}, Tampa). Office hours: ${site.hours.label}.`,
  `Phone: ${site.phone.display}. Office hours ${site.hours.label}; ${site.hours.note.toLowerCase()}. Prime 1 Property Management provides ${site.phone.emergency}. The line is for calls only and does not receive text messages.`,
  `Email: ${site.email}. Agent affiliation: ${u("/join")}.`,
  `Service area: clients throughout Florida, from the Tampa headquarters. Local market guides cover Tampa Bay communities; inquiries are welcome for any Florida location.`,
  `MLS: ${site.mls}. Live home search: ${idx.search}`,
];

const PM_LICENSING = [
  "Under Florida law (Chapter 468, Part VIII, Florida Statutes), managing a community association (HOA or condominium) for compensation requires a licensed community association manager (CAM) when the association has more than 10 units OR an annual budget over $100,000. Either condition is enough.",
  "Prime 1 Property Management is a licensed Florida CAM firm with a Designated CAM. Service criteria: homeowners and condominium associations with 10 or more units, commercial property owners' associations and office parks throughout Florida, and qualifying rental portfolios.",
  `Boards request a proposal at ${u("/property_management#start")} (an existing RFP can be attached). Community association emergencies: 24/7 live phone answering at ${site.phone.display}.`,
];

const HOW_TO_CONTACT = [
  `Call ${site.phone.display} during office hours (${site.hours.label}). Community association emergencies: 24/7 live answering on the same number.`,
  `Online: answer a few questions at ${u("/get-started")} and a licensed professional replies, usually within one business day.`,
  `Sellers: free broker home valuation at ${u("/home-valuation")}.`,
  `HOA, condo and rental owners: free management proposal at ${u("/property_management")}.`,
  `Experienced, producing Florida agents: review the offer and apply at ${u("/join")}. Every application stays pending until the broker decides.`,
];

export function llmsTxt() {
  const services = Object.values(SERVICES)
    .map((s) => `- [${s.schema.name}](${u(s.path)}): ${s.meta.description}`)
    .join("\n");
  const areas = AREAS.map((a) => `- [${a.name}, ${a.county}](${u(`/areas/${a.slug}`)}): ${a.description}`).join("\n");
  const posts = [...POSTS]
    .sort((a, b) => b.published.localeCompare(a.published))
    .map((p) => `- [${p.title}](${u(`/blog/${p.slug}`)}): ${p.description}`)
    .join("\n");

  return `# ${site.name}

> ${site.description}

## Key facts
${FACTS.map((f) => `- ${f}`).join("\n")}

## Property management licensing (Florida)
${PM_LICENSING.map((f) => `- ${f}`).join("\n")}

## How to contact or get started
${HOW_TO_CONTACT.map((f) => `- ${f}`).join("\n")}

## Services
${services}

## Agents: join Prime 1
- [Join Prime 1 Realty](${u("/join")}): the complete offer, what agents keep at realistic production levels, fees, incentives, support, MLS and transaction transition, affiliation steps and the application. Residential ${SPLIT_LABEL.residential} to a ${usd(OFFER.residential.cap)} anniversary-year cap, then 100%; commercial ${SPLIT_LABEL.commercial} through ${usd(OFFER.commercial.threshold)} qualifying GCI, then ${SPLIT_LABEL.commercialAbove}; company-generated ${SPLIT_LABEL.company}. ${usd(OFFER.fees.onboarding)} onboarding, ${usd(OFFER.fees.techMonthly)}/month technology, ${usd(OFFER.fees.transactionCoordination)} transaction coordination per covered file per side; no desk or franchise fee. Every application stays pending until the broker decides; nothing is signed or charged before approval.

## Areas served
${areas}

## Guides
${posts}

## Optional
- [Full content for AI assistants](${u("/llms-full.txt")}): every service, FAQ, area and guide summary on one page.
- Markdown copies: add .md to any main page URL, e.g. ${u("/property_management.md")} or ${u("/index.md")} for the homepage.
- [About Prime 1](${u("/about-us")})
- [Team](${u("/team")})
- [Contact](${u("/lets-connect")})
`;
}

export function llmsFullTxt() {
  const out: string[] = [llmsTxt().replace(/\n## Optional[\s\S]*$/, "").trim(), "", "---", ""];

  for (const s of Object.values(SERVICES)) {
    out.push(`## ${s.hero.h1}`, `URL: ${u(s.path)}`, "", s.hero.lede, "", `**${s.answer.q}** ${s.answer.a}`, "");
    out.push(`### ${s.includes.title}`, s.includes.intro, ...s.includes.items.map((i) => `- ${i}`), "");
    if (s.audiences) out.push(`### ${s.audiences.title}`, ...s.audiences.items.map((a) => `- **${a.title}:** ${a.body}`), "");
    out.push(`### ${s.steps.title}`, ...s.steps.items.map((st, i) => `${i + 1}. **${st.title}:** ${st.body}`), "");
    out.push("### FAQ", ...s.faqs.flatMap((f) => [`**Q: ${f.q}**`, `A: ${f.a}`, ""]));
  }

  out.push("## Join Prime 1 (experienced Florida agents)", `URL: ${u("/join")}`, "", ...AGENT_FAQS.flatMap((f) => [`**Q: ${f.q}**`, `A: ${f.a}`, ""]));

  for (const a of AREAS) {
    out.push(`## Living in ${a.name} (${a.county})`, `URL: ${u(`/areas/${a.slug}`)}`, "", a.answer, "");
    if (a.neighborhoods.length) out.push("### Neighborhoods", ...a.neighborhoods.map((n) => `- **${n.name}:** ${n.note}`), "");
    if (a.knowBefore.length) out.push("### Know before you move", ...a.knowBefore.map((k) => `- ${k}`), "");
    if (a.faqs.length) out.push("### FAQ", ...a.faqs.flatMap((f) => [`**Q: ${f.q}**`, `A: ${f.a}`, ""]));
  }

  out.push("## Guides");
  for (const p of POSTS) out.push(`### ${p.title}`, `URL: ${u(`/blog/${p.slug}`)} · Published ${p.published}`, "", p.tldr, "");

  return out.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}

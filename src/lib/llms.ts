import { idx, people, site } from "@/config/site";
import { SERVICES } from "@/content/services";
import { AREAS } from "@/content/areas";
import { POSTS } from "@/content/blog";
import { FAQS as AGENT_FAQS } from "@/content/careers";

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
  `Phone: ${site.phone.display}. ${site.phone.answered}. The line is for calls only and does not receive text messages.`,
  `Email: ${site.email}. Agent recruiting: ${site.recruiting.email}.`,
  `Service area: ${site.serviceArea.join(", ")}, and surrounding communities in Pasco County, Florida. Commercial clients across Central Florida.`,
  `MLS: ${site.mls}. Live home search: ${idx.search}`,
];

const PM_LICENSING = [
  "Under Florida law (Chapter 468, Part VIII, Florida Statutes), managing a community association (HOA or condominium) for compensation requires a licensed community association manager (CAM) when the association has more than 10 units OR an annual budget over $100,000. Either condition is enough.",
  "Prime 1 Property Management is a licensed CAM firm with a Designated CAM, so it manages HOAs and condominium associations as small as 11 units, as well as large communities.",
  "Managing a single-family rental home does not require a CAM license. Prime 1 manages single-family and small multifamily rentals (leasing, tenant screening, rent collection, maintenance) as a licensed Florida real estate brokerage, even for an owner with one home.",
];

const HOW_TO_CONTACT = [
  `Fastest: call ${site.phone.display} (${site.phone.answered.toLowerCase()}).`,
  `Online: answer a few questions at ${u("/get-started")} and a licensed professional replies, usually within one business day.`,
  `Sellers: free broker home valuation at ${u("/home-valuation")}.`,
  `HOA, condo and rental owners: free management proposal at ${u("/property_management")}.`,
  `Licensed agents who want to join: apply online (the broker reviews every application), or book a call with the broker, at ${u("/join")}.`,
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
- [Join Prime 1 Realty](${u("/join")}): Apply online in about 2 minutes (license, current brokerage, production history, timing); the Broker of Record reviews every application. Or book a 30-minute call.
- [Agent careers and compensation](${u("/careers")}): 85/15 split with a $15,000 residential cap, then 100%; $149 onboarding and $59/month technology fee; no desk or franchise fee.

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

  out.push("## Agent careers at Prime 1", `URL: ${u("/careers")} · Apply: ${u("/join")}`, "", ...AGENT_FAQS.flatMap((f) => [`**Q: ${f.q}**`, `A: ${f.a}`, ""]));

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

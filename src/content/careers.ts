/** Agent offer copy for /join and its AI version. Numbers come from src/config/offer.ts. The executed ICA governs. */
import { OFFER, SPLIT_LABEL, STANDARDS, usd } from "@/config/offer";

const pa = OFFER.producerAdvantage;

export const STATS = [
  { v: SPLIT_LABEL.residential, l: "Residential split", s: `Until the ${usd(OFFER.residential.cap)} anniversary-year cap, then 100%` },
  { v: SPLIT_LABEL.commercial, l: "Commercial split", s: `Through ${usd(OFFER.commercial.threshold)} qualifying GCI, then ${SPLIT_LABEL.commercialAbove}` },
  { v: `${usd(OFFER.fees.onboarding)} + ${usd(OFFER.fees.techMonthly)}/mo`, l: "Onboarding + technology", s: "No desk fee. No franchise fee." },
  { v: usd(pa.bonus), l: "Producer Advantage", s: `${pa.closings} qualifying residential closings in your first ${pa.days} days` },
];

export const JOIN_STATS = STATS;

export const FAQS = [
  {
    q: "Who is Prime 1 looking for?",
    a: `Experienced, producing Florida agents who want independent contractor affiliation: residential agents with ${STANDARDS.residentialLabel}, and commercial agents with ${STANDARDS.commercialLabel}. Prime 1 is not a training brokerage.`,
  },
  {
    q: "What is the residential split and cap?",
    a: `Qualifying residential business you generate is ${SPLIT_LABEL.residential} until you pay ${usd(OFFER.residential.cap)} to Prime 1 in your anniversary year. You then keep 100% of qualifying commissions for the rest of that anniversary year. At ${SPLIT_LABEL.residential}, about ${usd(OFFER.residential.cap / (1 - OFFER.residential.agentShare))} of qualifying GCI reaches the cap.`,
  },
  {
    q: "What is the commercial split?",
    a: `Qualifying commercial business you generate is ${SPLIT_LABEL.commercial} through ${usd(OFFER.commercial.threshold)} in qualifying gross commission income, then ${SPLIT_LABEL.commercialAbove}.`,
  },
  {
    q: "What about company-generated business?",
    a: `Company-generated business is ${SPLIT_LABEL.company}. It is outside the residential cap and stays Prime 1 business.`,
  },
  {
    q: "What fees are there, and which continue after the cap?",
    a: `${usd(OFFER.fees.onboarding)} one-time onboarding, ${usd(OFFER.fees.techMonthly)} per month for technology, and mandatory transaction coordination of ${usd(OFFER.fees.transactionCoordination)} per covered file, per side, at settlement. There are no desk or franchise fees. The technology fee and transaction coordination continue after you reach the cap; only the split stops.`,
  },
  {
    q: "What is the Producer Advantage Program?",
    a: `Incentives, separate from your split: ${usd(pa.bonus)} for ${pa.closings} qualifying residential closings in your first ${pa.days} days, and ${usd(pa.sellerBonus)} per qualifying residential seller closing in your first ${pa.sellerBonusDays} days. Both apply to business you generate and are paid under separate written program terms.`,
  },
  {
    q: "How do I become eligible for company leads and listing appointments?",
    a: `After affiliation you complete the ${OFFER.activationDays}-day Producer Activation Program. Completing it establishes eligibility for company-generated leads and qualified listing appointments. Earlier approval is at the broker's discretion. Assignments depend on availability, performance, responsiveness and client service, and are not guaranteed.`,
  },
  {
    q: "Do I have to work from the Tampa office?",
    a: "No. Qualified agents can live and work anywhere in Florida, and using the Tampa office is optional. If you choose to use it, schedule your first visit for orientation and building access. After that you can use the office without scheduling each visit.",
  },
  {
    q: "What happens to my MLS, association, listings and pending deals?",
    a: "Prime 1 keeps its existing REALTOR® association and MLS setup. Before you transfer, we confirm what you need to keep or transfer your membership and get the MLS access you need through Prime 1. After approval you get written transition instructions for MLS access, active listings, pending transactions and technology. Any additional brokerage participation, agreement or fee is approved by the broker before you transfer.",
  },
  {
    q: "How does affiliation work?",
    a: "Review the offer, FAQ, agreement review copy and steps on this page, then apply. Every application stays pending until the broker decides. After approval you e-sign the agreement, pay the onboarding fee, and transfer your license. Once your license shows Prime 1, your Virtual Office opens and the broker onboards you personally.",
  },
  {
    q: "Can I talk with the broker before deciding?",
    a: "You can include a written request to speak or meet with your application and say what you want to discuss. It is attached to your file. The broker may reply in writing, offer a call or meeting, or decide from your file. There are no preliminary interviews or automatic appointments.",
  },
  {
    q: "Will I be charged before I am approved?",
    a: "No. The agreement, anything the broker has signed, the onboarding payment and license transfer instructions are released only after broker approval.",
  },
];

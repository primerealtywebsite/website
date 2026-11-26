/**
 * Written transition instructions given to an agent AFTER approval and payment (onboarding page) and
 * kept in the Virtual Office. Prime 1 keeps its existing REALTOR® association and MLS setup; any
 * additional brokerage participation, agreement or fee needs the broker's approval before the transfer.
 */
export const TRANSITION = [
  {
    title: "1. License transfer (DBPR)",
    items: [
      "Do not end your current affiliation until your Prime 1 onboarding page shows this step (it means you are approved, signed and paid).",
      "Notify your current broker in writing of your departure date, following your current independent contractor agreement.",
      "Request the change of employing broker to Prime 1 Realty through your DBPR online account (myfloridalicense.com), or as the Prime 1 office instructs. Prime 1's broker confirms the change on DBPR.",
      "Do not practice real estate between brokerages: you may perform licensed activity only once DBPR shows Prime 1 Realty as your employing broker.",
      "The broker confirms on DBPR that your license shows Prime 1 Realty; your Virtual Office then opens.",
    ],
  },
  {
    title: "2. REALTOR® association and MLS access",
    items: [
      "Tell the Prime 1 office your current association and MLS. We confirm, for your market, whether you keep or transfer your membership and how you get MLS access through Prime 1.",
      "Complete the association's office-change (transfer) form and pay any association fees that apply to you.",
      "Request your MLS office change to Prime 1 Realty after your license shows Prime 1. Confirm your Supra eKEY / lockbox access is moved too.",
      "Do not assume saved searches, client portals or lockbox access transfer automatically. Export what you need before your old MLS office access ends.",
      "Any additional brokerage MLS participation, agreement or fee is approved by the broker before your transfer.",
    ],
  },
  {
    title: "3. Active listings",
    items: [
      "Listing agreements belong to your current brokerage. Ask your current broker, in writing, whether they will release listings so the sellers can sign with Prime 1.",
      "Only after a written release and a new Prime 1 listing agreement signed by the seller: update the MLS listing office, signage and marketing.",
      "Never move or re-list a listing without the release and new agreement on file.",
    ],
  },
  {
    title: "4. Pending transactions",
    items: [
      "Pending contracts usually close at the brokerage where they were written. Confirm in writing with your current broker how earned commissions on your pendings will be paid.",
      "Give Prime 1 a list of your pendings and expected closing dates so nothing is missed during the move.",
      "New contracts written after your license shows Prime 1 go through Prime 1 transaction coordination and SkySlope.",
    ],
  },
  {
    title: "5. Technology setup",
    items: [
      "Company email: set up by the office after affiliation.",
      "Agent Portal, MoxiWorks (CRM, website, marketing) and SkySlope with DigiSign: activation invitations follow your Virtual Office access.",
      "ADP: activate your account when invited and complete your commission payment and direct deposit forms. ADP is how Prime 1 pays agents.",
      "Commercial agents: Buildout user on the brokerage account for listings, marketing and inquiries.",
      "Update your email signature, business cards, social profiles and website to show Prime 1 Realty and follow Florida advertising rules.",
    ],
  },
];

/** Virtual Office onboarding checklist (mirrors the Agent Onboarding Checklist PDF). */
export const VO_CHECKLIST = [
  { group: "License & association", items: ["License shows Prime 1 Realty on DBPR", "Association transfer form submitted and fees paid", "MLS office changed to Prime 1; Supra eKEY updated"] },
  { group: "Accounts", items: ["Company email activated", "Agent Portal login", "MoxiWorks account activated and profile complete", "SkySlope and DigiSign activated", "ADP account activated; commission payment and direct deposit forms submitted"] },
  { group: "Commercial (if applicable)", items: ["Buildout user set up on the brokerage account", "Commercial listing and inquiry routing confirmed with the broker"] },
  { group: "Policies", items: ["Handbook policies reviewed: Code of Conduct, Confidentiality, Ethics, Data Protection", "Transaction submission workflow reviewed"] },
  { group: "Producer Activation", items: ["14-day Producer Activation Program started", "Broker onboarding session completed"] },
  { group: "Tampa office (optional)", items: ["First visit scheduled for orientation and building access (only if you plan to use the office)"] },
];

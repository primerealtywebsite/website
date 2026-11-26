export type Block = { h2?: string; p?: string[]; list?: string[] };

export type Post = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  published: string;
  modified: string;
  image: string;
  imageAlt: string;
  category: "Community associations" | "Market insights" | "Buying & owning" | "Landlords & rentals";
  readMins: number;
  tldr: string;
  body: Block[];
  cta: { label: string; href: string };
};

/** Migrated from prime1realty.net/blog/* (same slugs). Content rewritten, fact-checked and structured for search and AI answers. */
export const POSTS: Post[] = [
  {
    slug: "how-to-choose-a-community-association-management-company-in-florida",
    title: "How to Choose a Community Association Management Company in Florida",
    metaTitle: "How to Choose an HOA or Condo Management Company in Florida",
    description: "A board's guide to choosing a Florida community association management company: licensing, scope, reporting, transition, and the questions to ask before you sign.",
    published: "2026-11-25",
    modified: "2026-11-25",
    image: "/images/management/townhome-community-row.jpg",
    imageAlt: "Row of townhomes in a managed community",
    category: "Community associations",
    readMins: 7,
    tldr: "Start with licensing: in Florida both the management firm and the individual manager must be licensed, and the firm names a Designated CAM. Then compare written scope, site coverage, reporting, financial controls, portal tools, emergency response and the transition plan. Get every promise in the management agreement.",
    body: [
      {
        h2: "1. Verify licensing first",
        p: [
          "Under Chapter 468, Part VIII of the Florida Statutes, a community association management firm must be licensed, and the individuals who manage associations for compensation must hold a Community Association Manager (CAM) license once the association has more than 10 units or an annual budget over $100,000. The firm designates a licensed CAM who is responsible for its management work.",
          "Look up the firm and the proposed manager on the Florida DBPR license search at myfloridalicense.com before you compare anything else.",
        ],
      },
      {
        h2: "2. Compare the written scope, not the sales pitch",
        list: [
          "Which inspections are included, how often, and what the written findings look like",
          "Board meeting support: notices, agendas, attendance and minutes",
          "Budget preparation support and the monthly financial statements you will receive",
          "Collections and delinquency procedures, and when accounts go to the association attorney",
          "Vendor bidding, contracts, insurance certificates and performance follow-up",
          "Florida compliance calendar: notices, records, milestone inspections and reserve study coordination",
        ],
      },
      {
        h2: "3. Ask how the site will be covered",
        p: [
          "Site coverage drives cost and service. Ask how often the manager will be on site, who covers inspections between visits, and how open work orders are tracked and reported to the board.",
        ],
      },
      {
        h2: "4. Look at reporting and financial controls",
        list: [
          "A sample board report or inspection summary (ask to see one)",
          "Who can approve spending, and the limits set in the management agreement",
          "How association funds are held and reconciled, and who reviews the reconciliations",
          "What the board can see in the owner and board portal",
        ],
      },
      {
        h2: "5. Check resident tools and emergency response",
        p: [
          "Residents should be able to pay, submit maintenance requests and get community documents online. For water leaks, fire, security or life-safety issues, ask whether a person answers the phone around the clock and how the on-call manager is reached.",
        ],
      },
      {
        h2: "6. Understand who decides what",
        p: [
          "The board sets policy, approves the budget, reserves and assessments, approves contracts and spending above the agreed limit, and decides on legal action. The manager carries out the board's decisions and runs day-to-day administration under the management agreement. A good proposal spells this out.",
        ],
      },
      {
        h2: "7. Ask for the transition plan in writing",
        list: [
          "Transfer of official records and financial records from the current manager",
          "Bank accounts, signature cards and reconciliations",
          "Open work orders, vendor contracts and insurance certificates",
          "Resident and owner portal setup and communication to owners",
          "A start date that respects the notice period in your current contract",
        ],
      },
      {
        h2: "Questions to ask every company you interview",
        list: [
          "Who is your Designated CAM, and who will manage our community day to day?",
          "How many associations does our manager handle, and how often will they be on site?",
          "Can we see a sample board report and inspection summary?",
          "What is included in the fee, and what is billed separately?",
          "How do residents reach you after hours for an emergency?",
          "What does your transition timeline look like for an association our size?",
        ],
      },
    ],
    cta: { label: "Request an Association Management Proposal", href: "/property_management#start" },
  },
  {
    slug: "florida-designated-cam-license-explained",
    title: "What Is a Florida Designated CAM License, and Why Your Association Should Require One",
    metaTitle: "Florida Designated CAM License Explained | Prime 1",
    description: "What a Florida CAM license is, how a Designated CAM differs from a licensed manager, and the questions every HOA or condo board should ask a management company.",
    published: "2026-05-12",
    modified: "2026-11-18",
    image: "/images/blog/florida-condo-association-marina.jpg",
    imageAlt: "Condominium towers with palm trees in Tampa",
    category: "Community associations",
    readMins: 6,
    tldr: "Florida requires community association managers to be licensed under Chapter 468, Part VIII of the Florida Statutes, and management firms must designate a licensed CAM who is responsible for the firm's management work. Boards should verify both the firm and the individual manager at myfloridalicense.com before signing a contract.",
    body: [
      {
        h2: "The short answer",
        p: [
          "A Community Association Manager (CAM) license is issued by the Florida Department of Business and Professional Regulation (DBPR). It allows a person to manage the business of a homeowners or condominium association for compensation once the association reaches the size or budget thresholds set in state law.",
          "A management firm that manages associations must also be licensed, and it designates a licensed CAM who is responsible for the firm's community association management. That person is commonly called the firm's Designated CAM.",
        ],
      },
      {
        h2: "What it takes to hold a Florida CAM license",
        list: [
          "Completion of the required pre-licensing education",
          "Passing the state CAM licensing examination",
          "Background screening and DBPR application",
          "Continuing education to renew the license",
          "Compliance with the professional standards in state law and DBPR rules",
        ],
      },
      {
        h2: "Designated CAM vs. licensed CAM",
        p: [
          "Every manager who performs licensed work must hold an individual CAM license. The Designated CAM is the licensed manager a management firm names as responsible for its association management activities. For a board, this means there is a named, licensed person accountable for how the firm operates, not only for the manager assigned to your community.",
        ],
      },
      {
        h2: "Why this matters more now",
        p: [
          "Florida has tightened the rules for associations in recent years. Condominium reforms passed after 2021 added milestone structural inspections and structural integrity reserve study requirements for many buildings. Later HOA reforms added education requirements for directors and stricter record-keeping and transparency rules. Boards rely on their manager to keep track of these obligations and deadlines.",
          "Working with an unlicensed manager, or a firm without proper licensing, exposes the association to compliance gaps and potential liability for the board.",
        ],
      },
      {
        h2: "Five questions to ask a management company",
        list: [
          "Is the firm licensed as a community association management firm, and who is its Designated CAM?",
          "Will the manager assigned to us hold an active individual CAM license?",
          "How do you track milestone inspections, reserve studies and statutory deadlines?",
          "What financial reports will the board receive, and how often?",
          "How do owners and residents access documents, payments and requests?",
        ],
      },
      {
        h2: "How to verify a license in about a minute",
        p: [
          "Go to myfloridalicense.com, choose to search for a licensee, and search by the individual's name or the firm's name. Confirm the license type is community association management, and that the status is current and active.",
          "Prime 1 Property Management is a licensed Florida community association management firm, and Antony Oseitutu serves as its Designated CAM.",
        ],
      },
    ],
    cta: { label: "Request a management proposal", href: "/property_management" },
  },
  {
    slug: "luxury-real-estate-in-florida-remains-resilient-2025-market-insights",
    title: "Luxury Real Estate in Florida Remains Resilient: 2025 Market Insights",
    metaTitle: "Florida Luxury Real Estate 2025 Market Insights | Prime 1",
    description: "Why Florida's luxury market held up in 2025: limited inventory, cash buyers and relocation. What it means for luxury buyers and sellers in Tampa Bay.",
    published: "2025-12-16",
    modified: "2026-11-18",
    image: "/images/blog/modern-florida-luxury-home-pool.jpg",
    imageAlt: "Modern white luxury home with palm trees and a large pool",
    category: "Market insights",
    readMins: 4,
    tldr: "Florida's upper-tier market has been supported by limited inventory of well-located homes, a high share of cash buyers and continued relocation from higher-tax states. For sellers, pricing discipline still matters; for buyers, the best homes still move quickly.",
    body: [
      {
        h2: "Limited inventory supports pricing",
        p: [
          "Move-in-ready luxury homes in desirable waterfront and close-in neighborhoods remain a small share of total listings. When supply of the best homes is thin, well-presented properties continue to attract strong interest even as the broader market normalizes.",
        ],
      },
      {
        h2: "Who is buying",
        p: [
          "High-end buyers in Florida are frequently cash buyers or use large down payments, which makes them less sensitive to mortgage rate swings. Relocation from higher-cost, higher-tax states, together with Florida's lack of a state income tax, continues to bring new buyers to markets such as Tampa Bay.",
        ],
      },
      {
        h2: "What this means for sellers",
        list: [
          "Price to the most recent comparable sales, not last year's peak",
          "Presentation matters: photography, staging and pre-listing repairs",
          "Expect informed buyers who compare insurance, flood zone and HOA details closely",
        ],
      },
      {
        h2: "What this means for buyers",
        list: [
          "Have proof of funds or a pre-approval ready before touring",
          "Check flood zone, elevation and insurance quotes early",
          "Be prepared to act quickly on homes that are priced right",
        ],
      },
      {
        h2: "The takeaway",
        p: [
          "Florida's luxury segment rewards preparation on both sides of the deal. Sellers who price with current data and buyers who arrive ready tend to get the best outcomes. Prime 1 Realty works with buyers and sellers across Tampa and Hillsborough County and the wider Tampa Bay area.",
        ],
      },
    ],
    cta: { label: "Get a property analysis", href: "/sell-your-home" },
  },
  {
    slug: "florida-tops-the-retirement-charts-what-that-means-for-luxury-real-estate",
    title: "Florida Tops the Retirement Charts: What That Means for Luxury Real Estate",
    metaTitle: "Florida Retirement Demand & Luxury Real Estate | Prime 1",
    description: "Florida keeps ranking as a top state for retirees. Here's how retiree demand shapes luxury and right-sized home buying in Tampa Bay, Sarasota and Naples.",
    published: "2025-11-07",
    modified: "2026-11-18",
    image: "/images/blog/gulf-coast-beach-homes-aerial.jpg",
    imageAlt: "Aerial view of Gulf Coast beach homes near the shoreline",
    category: "Market insights",
    readMins: 4,
    tldr: "Retirees keep choosing Florida for its tax environment, climate and healthcare access. Many are right-sizing into lower-maintenance luxury homes and condos, which keeps demand steady for well-located, single-level and amenity-rich properties.",
    body: [
      {
        h2: "Why retirees choose Florida",
        list: ["No state income tax", "Year-round outdoor lifestyle", "Established healthcare systems in major metro areas", "A wide range of communities, from urban condos to golf and waterfront neighborhoods"],
      },
      {
        h2: "The luxury buyer profile is shifting",
        p: [
          "Many retirees are right-sizing rather than downsizing. They want fewer rooms but higher quality: single-level living, low-maintenance exteriors, impact windows, generators and access to amenities. Condos with strong association management and healthy reserves are especially attractive.",
        ],
      },
      {
        h2: "Demand meets limited supply",
        p: [
          "Homes that fit this profile in Tampa Bay, Sarasota and Naples are limited, which supports pricing for well-located properties. Buyers should review association finances, insurance costs and building inspection status before making an offer on a condo.",
        ],
      },
      {
        h2: "The Prime 1 perspective",
        p: [
          "Because Prime 1 offers both brokerage and community association management, we look at condo and HOA purchases from both sides: the home itself and the health of the association behind it.",
        ],
      },
    ],
    cta: { label: "Start a home search", href: "/residential" },
  },
  {
    slug: "what-luxury-really-means-in-todays-real-estate-market",
    title: "What 'Luxury' Really Means in Today's Real Estate Market",
    metaTitle: "What Luxury Means in Today's Real Estate Market | Prime 1",
    description: "Luxury real estate is defined by more than price. Location, quality, privacy, resilience and service now define high-end homes in Florida.",
    published: "2025-10-27",
    modified: "2026-11-18",
    image: "/images/blog/tampa-bay-fishing-pier-aerial.jpg",
    imageAlt: "Aerial view of a fishing pier on Tampa Bay",
    category: "Buying & owning",
    readMins: 3,
    tldr: "In today's Florida market, luxury is defined by location, build quality, privacy, storm resilience and ease of ownership as much as by price.",
    body: [
      {
        h2: "Beyond the price tag",
        p: ["A high price alone does not make a home luxury. Buyers at the top of the market look for a combination of location, craftsmanship and lifestyle that is hard to replicate."],
      },
      {
        h2: "What high-end buyers look for now",
        list: [
          "Irreplaceable location: water, views or walkability",
          "Build quality and recent major systems",
          "Storm resilience: impact windows, roof age, elevation and generators",
          "Privacy and outdoor living space",
          "Low-friction ownership, including well-run associations where applicable",
        ],
      },
      {
        h2: "Why resilience is now part of luxury",
        p: ["In Florida, insurance cost and storm readiness affect both comfort and long-term value. Homes with documented upgrades are easier to insure and often easier to sell."],
      },
    ],
    cta: { label: "Talk to a Prime 1 agent", href: "/get-started" },
  },
  {
    slug: "is-waterfront-living-right-for-you-tips-for-renting-a-condo-in-florida",
    title: "Is Waterfront Living Right for You? Tips for Renting a Condo in Florida",
    metaTitle: "Tips for Renting a Waterfront Condo in Florida | Prime 1",
    description: "Thinking about renting a waterfront condo in Florida? What to check about association rules, parking, storms, insurance and costs before you sign a lease.",
    published: "2025-10-17",
    modified: "2026-11-18",
    image: "/images/blog/florida-waterfront-condo-community-aerial.jpg",
    imageAlt: "Aerial view of a waterfront condominium community in Florida",
    category: "Landlords & rentals",
    readMins: 4,
    tldr: "Before renting a waterfront condo, read the association's rules for tenants, ask about parking, guests and pets, plan for hurricane season, get renters insurance and confirm which utilities and fees you pay.",
    body: [
      { h2: "Why renters love waterfront condos", p: ["Water views, amenities such as pools and docks, and a lower-maintenance lifestyle make waterfront condos popular with renters in Tampa Bay."] },
      {
        h2: "What to check before you sign",
        list: [
          "Association approval: many condos require tenant applications and board approval",
          "Rules on pets, guests, parking and vehicles",
          "Move-in and move-out rules, such as elevator reservations and deposits",
          "Hurricane procedures, including shutters and evacuation information",
          "Which utilities, fees and amenities are included in rent",
        ],
      },
      { h2: "Protect yourself", p: ["Get renters insurance that covers your belongings and liability. Ask the landlord or manager how maintenance requests are handled and how to reach someone after hours."] },
    ],
    cta: { label: "Find a rental", href: "/rent" },
  },
  {
    slug: "the-homeownership-difference-essential-resources-for-advocates",
    title: "The Homeownership Difference: Essential Resources for Future Homeowners",
    metaTitle: "Homeownership Resources for Florida Buyers | Prime 1",
    description: "Helpful resources for future homeowners in Florida: budgeting, credit, down payment programs, homebuyer education and choosing the right team.",
    published: "2026-11-18",
    modified: "2026-11-18",
    image: "/images/buy/family-home-with-garage.jpg",
    imageAlt: "Two-story family home with a garage and front lawn",
    category: "Buying & owning",
    readMins: 4,
    tldr: "Future homeowners should start with a budget and credit review, explore down payment assistance and homebuyer education, and assemble a team: lender, agent, inspector, insurance agent and title company.",
    body: [
      { h2: "Start with your numbers", list: ["Review your credit reports and scores", "Estimate a comfortable monthly payment, including taxes, insurance and HOA dues", "Save for down payment, closing costs and reserves"] },
      { h2: "Look into assistance programs", p: ["Florida Housing and some local governments offer down payment and closing cost assistance for eligible buyers. A lender who participates in these programs can explain eligibility."] },
      { h2: "Take a homebuyer education course", p: ["HUD-approved housing counseling agencies offer homebuyer education, and some assistance programs require it."] },
      { h2: "Build your team", list: ["Lender for pre-approval", "Buyer's agent to find and negotiate", "Home inspector", "Insurance agent for homeowners and flood quotes", "Title company for closing"] },
    ],
    cta: { label: "Estimate a mortgage payment", href: "/financing" },
  },
  {
    slug: "why-owning-a-home-is-still-a-smart-investment-in-2025",
    title: "Why Owning a Home Is Still a Smart Investment",
    metaTitle: "Is Owning a Home Still a Smart Investment? | Prime 1",
    description: "Owning a home builds equity, stabilizes housing costs and can offer tax benefits. How to decide whether buying makes sense for you in Tampa Bay.",
    published: "2026-11-18",
    modified: "2026-11-18",
    image: "/images/buy/craftsman-home-curb-appeal.jpg",
    imageAlt: "Craftsman-style home with landscaped front yard",
    category: "Buying & owning",
    readMins: 4,
    tldr: "Homeownership builds equity through principal payments and appreciation over time, and a fixed-rate mortgage stabilizes principal and interest. Whether it is right for you depends on how long you plan to stay and your total monthly cost.",
    body: [
      { h2: "How owning builds wealth", list: ["Each principal payment increases your equity", "Long-term appreciation can add to that equity", "A fixed-rate mortgage locks in principal and interest"] },
      { h2: "What to weigh honestly", list: ["Total monthly cost, including taxes, insurance, HOA and maintenance", "How long you plan to stay; buying usually makes more sense over several years", "Emergency savings after closing"] },
      { h2: "A simple next step", p: ["Use a mortgage calculator to compare a realistic monthly payment with your current rent, then talk to a lender about pre-approval."] },
    ],
    cta: { label: "Try the mortgage calculator", href: "/financing" },
  },
  {
    slug: "top-4-essential-legal-requirements-for-landlords",
    title: "Top 4 Essential Legal Requirements for Florida Landlords",
    metaTitle: "4 Legal Requirements for Florida Landlords | Prime 1",
    description: "Key legal basics for Florida landlords: fair housing, security deposit rules, required notices and habitability. A plain-language overview for rental owners.",
    published: "2026-11-18",
    modified: "2026-11-18",
    image: "/images/rent/apartment-building-balconies.jpg",
    imageAlt: "Residential rental building with balconies",
    category: "Landlords & rentals",
    readMins: 5,
    tldr: "Florida landlords must follow fair housing laws, handle security deposits as required by Chapter 83 of the Florida Statutes, give proper written notices, and keep the property in compliance with building, housing and health codes. This overview is general information, not legal advice.",
    body: [
      { h2: "1. Fair housing compliance", p: ["Federal and Florida fair housing laws prohibit discrimination in advertising, screening and leasing. Apply the same written criteria to every applicant and document your decisions."] },
      { h2: "2. Security deposit rules", p: ["Florida law sets requirements for how deposits are held, what tenants must be told, and the deadlines and notice process for returning a deposit or making a claim after move-out. Follow the statute exactly; mistakes can cost you the right to make a claim."] },
      { h2: "3. Proper notices", p: ["Rent demands, lease non-renewals, entry for repairs and other actions require specific written notices and timeframes under Florida's residential landlord and tenant law."] },
      { h2: "4. Habitability and maintenance", p: ["Landlords must comply with applicable building, housing and health codes, and keep key systems in working order as required by law and the lease."] },
      { h2: "How a property manager helps", p: ["A professional manager standardizes screening, notices, deposits and maintenance so owners stay compliant. Consult a Florida attorney for legal advice on specific situations."] },
    ],
    cta: { label: "Get a rental management proposal", href: "/property_management#rental-management" },
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

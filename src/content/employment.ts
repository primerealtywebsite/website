/**
 * Prime 1 Property Management employment (W-2), kept separate from Prime 1 Realty's independent
 * contractor agent affiliation (/join). Wording approved by Antony Oseitutu, 26 Nov 2026.
 * Do not change pay, hours, requirements or status without his approval.
 *
 * No open positions right now, so the page carries NO JobPosting schema (Google only allows it for
 * real openings). When a position opens, set `openPositions` and add JobPosting for that role.
 */
export const EMPLOYMENT = {
  openPositions: 0,
  role: "Licensed Community Association Managers (LCAM)",
  intro:
    "Prime 1 Property Management welcomes applications from experienced Florida Licensed Community Association Managers interested in future employment opportunities.",
  partTime: { label: "Part Time Employment", items: ["Starting at $36.06 per hour", "20 hours per week", "W2 employment"] },
  fullTime: { label: "Full Time Employment", items: ["Starting at $75,000 annually", "40 hours per week", "W2 employment with benefits"] },
  requirements: [
    "Active Florida Community Association Manager license",
    "Demonstrated association management experience",
    "Strong communication and organizational skills",
    "In person office attendance and association site visits",
  ],
  status:
    "There are currently no open positions. Qualified candidates are encouraged to submit their applications and résumés for future employment consideration as our association management portfolio expands.",
} as const;

export const EMPLOYMENT_FAQS = [
  {
    q: "Is this the same as joining Prime 1 Realty as an agent?",
    a: "No. Employment with Prime 1 Property Management is W2 employment for Florida Licensed Community Association Managers. Real estate agents affiliate with Prime 1 Realty as independent contractors through a separate application at prime1realty.net/join.",
  },
  {
    q: "Are there open positions right now?",
    a: "There are currently no open positions. Applications and résumés are kept on file for future employment consideration as the association management portfolio expands.",
  },
  {
    q: "What does the part time and full time pay look like?",
    a: "Part time employment starts at $36.06 per hour for 20 hours per week (W2). Full time employment starts at $75,000 annually for 40 hours per week (W2 with benefits).",
  },
  {
    q: "Do I need a Florida CAM license to apply?",
    a: "Yes. Applicants need an active Florida Community Association Manager license, demonstrated association management experience, strong communication and organizational skills, and the ability to work in person at the office and on association site visits.",
  },
  {
    q: "Is there a fee to apply?",
    a: "No. There is no fee to apply for employment with Prime 1 Property Management.",
  },
];

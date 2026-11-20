# Prime 1 Realty: website rebuild

This is a Next.js 16 (App Router) rebuild of prime1realty.net, built as a question flow that turns visitors into leads. All of the old URLs are kept.

## Run

```bash
npm install
npm run dev            # local dev
npm run build          # production build (Turbopack, used by Vercel)
npm run build:webpack  # same build with webpack (use if Turbopack can't bind a local port)
```

Copy `.env.example` to `.env.local` and fill in the values. For production, set the same variables in Vercel.

## Before launch (client to-do)

| Item | Where | Why |
|---|---|---|
| `NEXT_PUBLIC_BOOKING_URL` | Vercel env | Real Calendly / Cal.com link. Every Book button fires Meta `Schedule`. |
| `META_CAPI_TOKEN` | Vercel env | Turns on the Conversions API (server events deduplicated with the pixel). |
| `RESEND_API_KEY` + verify prime1realty.net in Resend | Vercel env | Sends lead emails to admin@prime1realty.net. |
| `LEAD_WEBHOOK_URL` (optional) | Vercel env | Pushes every lead to a CRM, Zapier or GoHighLevel. |
| **Keep MLS home search syncing** | DNS + Vercel env | See "Domain switch without breaking home search" below. |
| MLS name | `src/config/site.ts` | The old site cited both Stellar MLS and realMLS. Confirm which one applies. |
| Experience claims | `src/content/*` | "15+ years / 25+ communities / NARPM" from the old CAM blog post were left out until verified. |
| Jennifer Rivera photo | `public/images/team/` | Her profile shows initials until a photo is added. |
| Search Console + Bing Webmaster | — | Submit `https://www.prime1realty.net/sitemap.xml`. |
| Meta ads | Ads Manager | Use the **Housing special ad category**. |

## Agent recruiting (/join)

The site no longer links to the old join.prime1realty.net portal. Every "Join Prime 1" link goes to `/join` (the /careers hero has the same form).

- **Apply online (no interview):** two short steps (contact details, then license number, type, status, brokerage, market, association/MLS). On submit:
  1. antony@prime1realty.net gets every detail. Replying goes straight to the agent.
  2. The agent gets a welcome email with all 10 onboarding PDFs attached, the next steps from the Onboarding Checklist, the Calendly link and backup download links.
  3. The application is added to the "Agent Applications" tab of the leads Google Sheet.
  4. The confirmation screen shows the 10 PDFs for instant download (signed links valid 60 days) and Antony's Calendly.
- **Book a call:** Antony's Calendly (https://calendly.com/prime1realty-proton/30min) is embedded on /join and on the confirmation screen. A finished booking fires Meta `Schedule` and the Google Ads schedule conversion.
- **Documents:** the PDFs live in `private/onboarding/` (never public). To update one, replace the PDF with the same file name and redeploy.
- **Email delivery (Resend, set up 2026-11-20):** `RESEND_API_KEY` (send-only key), `LEAD_EMAIL_FROM`, `LEAD_EMAIL_TO`, `RECRUITING_EMAIL_FROM` and `RESEND_FALLBACK_TO` are set in Vercel. **prime1realty.net must be verified in Resend** (Resend > Domains > Add domain, then add its 3 DNS records at GoDaddy). Until then, Resend rejects every "@prime1realty.net" sender. Office notices (leads and agent applications) fall back to prime1realty@proton.me with a red banner. Agents can't be emailed the packet yet and get it as on-screen downloads instead. Antony's notice says whether the packet went out.

## Mobile = calls, desktop = forms

- Phones: red "Call" in the header, a big "Call now" button above every hero form, and "Call now" as the main button in the bottom bar. The form only asks for name + phone (email optional).
- Desktop (mouse): the forms lead. Email is required, and the phone number opens the call panel (copy number, scan-to-call QR, call-me-back form with email).
- The office number is calls only. The site never offers texting.

## Google Ads tag

`AW-17574854752` loads on every page via gtag.js. The supplied snippet used gtm.js; both URLs serve the same tag, but only the gtag.js version turns on the Ads destination, and the snippet had no `config` line. The tag also forwards to the linked GA4 property G-8ZBBQ5C8L2. Enhanced conversions are on: hashed email and phone are sent with each lead.

Every Meta event is mirrored to Google with the same parameters:

| Meta | Google event | Conversion label variable |
|---|---|---|
| Lead (any form) | `generate_lead` | `NEXT_PUBLIC_GADS_LABEL_LEAD` |
| Contact, phone tap (mobile) | `click_to_call` | `NEXT_PUBLIC_GADS_LABEL_CALL` |
| Contact, email tap | `click_to_email` | none |
| Schedule (Calendly booking) | `book_appointment` | `NEXT_PUBLIC_GADS_LABEL_SCHEDULE` |
| SubmitApplication (agent) | `agent_application` | `NEXT_PUBLIC_GADS_LABEL_AGENT` |
| ViewContent / FindLocation | `view_content` / `get_directions` | none |
| Every custom event (HomeSearchClick, QuizStart, QuizStep, ContactPanelOpen, PhoneNumberCopied, JoinFormStart, PortalLogin, ...) | same name in snake_case (`home_search_click`, `quiz_start`, ...) | none |
| ButtonClick: any button or CTA click, sent to both | `button_click` {button_text, link_url, cta_location} | none |

There is no text/SMS tracking because the office number is calls only and the site has no text links. A conversion counts in Google Ads only after its label is pasted into the matching variable. (Google Ads > Goals > Conversions > the action > Tag setup > Use Google tag: the label is the part after the slash in `send_to`.) Without a label, the event is still recorded, and Google Ads can build a conversion from it. Ad click IDs (gclid, gbraid, wbraid, fbclid, UTMs) are kept for the whole visit and saved with every lead.

## Property management ad tracking

Every Meta and Google event carries two extra fields:
- `service_line`: what the action is about (`management`, `sell`, `buy`, `rent`, `commercial`, `careers`, `general`).
- `landing_service`: what the ad's landing page was about. A new ad or UTM click resets it.

A visitor who lands on /property_management from an ad, moves to the homepage and calls still counts as a PM call. The desktop call-back form also files the request under the service the visitor came in on, e.g. "Property / association management proposal".

PM pages: /property_management, /commercial_property_management and the Designated CAM blog post.

**Google Ads**
- Every PM form lead also sends `pm_lead`, and every PM phone tap also sends `pm_call`.
- Create two conversion actions in Google Ads (Goals > Conversions > New > Website):
  - "PM Lead" (category: Submit lead form).
  - "PM Call" (category: Phone call lead).
- Paste their labels into `NEXT_PUBLIC_GADS_LABEL_LEAD_MANAGEMENT` and `NEXT_PUBLIC_GADS_LABEL_CALL_MANAGEMENT`, then redeploy. PM actions then fire only the PM conversion (no double count); everything else keeps firing the general lead/call labels.
- For the PM campaigns, set "PM Lead" and "PM Call" as the campaign's conversion goals so Google bids for property management leads only.
- Also add a call asset with call reporting on the PM ads. Calls placed straight from the ad (they never visit the site) are only counted there.

**Meta (Events Manager > Custom conversions)**
- "PM Lead": event Lead, rule `service_line` = management.
- "PM Call": event Contact, rule `service_line` = management, or `landing_service` = management.
- Optimize PM ad sets for "PM Lead".

**Leads sheet**
- New columns: Landing service, Landing page, Device, Referrer. Existing sheets add these headers automatically on the next lead after the updated script is deployed.
- Filter "Landing service = management" plus Source/Campaign/gclid to see which PM ad produced each lead.



`/home-search`, `/search` and `/property/*` are served by the **old Prime 1 app** (Laravel/PHP on Apache), which syncs the MLS listings into its own database. The new site keeps those URLs alive by passing any URL it doesn't own through to the old app. Visitors and Google keep the same www links, and listings keep syncing.

1. Keep the old server running. Add a DNS record **idx.prime1realty.net** pointing to the same server www uses today, and make sure that server answers for that hostname with SSL.
2. In Vercel, set `IDX_ORIGIN=https://idx.prime1realty.net` for Production and redeploy. Leave `NEXT_PUBLIC_IDX_BASE_URL` at its default.
3. Check `https://prime1realty.vercel.app/home-search?page=15` shows listings.
4. Point www.prime1realty.net at Vercel. Keep the old app's own site URL set to `https://www.prime1realty.net`, so its links and search form still point at www.

Tested on 2026-11-18 with a preview proxying to the live server: `/home-search?page=15`, property pages and old assets all returned 200 with current listings. Never set `IDX_ORIGIN` to the www host after the switch, because requests would loop. The build refuses to deploy that to Production.

## Meta event map

Rule: a **standard event fires only when the action really happened on this site**. Clicks that leave the site go out as custom events. Every standard event carries an `event_id`, and the server sends the same event to the Conversions API so Meta counts it once.

| Action | Event | Fires when |
|---|---|---|
| Questionnaire submitted (sell, valuation, buy, rent, management, commercial, contact) | `Lead` {lead_type} | Server accepts the form (`/api/lead`) |
| Careers questionnaire submitted | `SubmitApplication` | Server accepts the form |
| Book button, **only once `NEXT_PUBLIC_BOOKING_URL` is set** | `Schedule` | Click to the booking calendar |
| Phone or email tap | `Contact` {method, cta_location} | Click |
| Office directions | `FindLocation` | Click |
| Service, area, careers and financing page view | `ViewContent` {content_category} | Page load |
| Agent application submitted on /join or /careers | `SubmitApplication` | Server accepts the application (`/api/join`) |
| Calendly booking with Antony completed | `Schedule` {content_category: agent_recruiting} | Calendly confirms the booking |
| Rental application (to Buildium) | custom `RentalApplicationClick` | Click |
| Search homes (to IDX) | custom `HomeSearchClick` | Click |
| Book button with no calendar set | custom `CallbackRequestClick` | Click (opens the contact form) |
| Questionnaire start / each answer | custom `QuizStart`, `QuizStep` | Fixed option labels only, never typed text |
| Portal login, mortgage or split calculator | custom `PortalLogin`, `CalculatorUsed`, `SplitCalculatorUsed` | Click / first use |

Ad click IDs: if a visitor lands from a Meta ad and the pixel is blocked, the site stores the `fbclid` as `_fbc`. The Conversions API then still credits the lead to the ad.

Thank-you URLs (`/thank-you/sell`, `/thank-you/careers`, etc.) also work as URL-based custom conversions.

## Where things live

- `src/config/site.ts` holds phone, address, portals, IDX, booking and pixel settings. Edit them here only.
- `src/config/nav.ts` holds the menus and the per-page mobile action bar labels.
- `src/components/funnel/flows.ts` holds every questionnaire. Edit the questions here.
- `src/content/services.ts`, `areas.ts` and `blog.ts` hold the page copy, FAQs and articles.
- `src/lib/schema.ts` holds the JSON-LD (RealEstateAgent, Service, FAQPage, Person, BlogPosting, Breadcrumb).
- `public/images/**` holds the photos, all JPG. Credits are in `IMAGE-CREDITS.md`.

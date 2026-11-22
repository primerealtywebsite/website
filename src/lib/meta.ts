"use client";

import { site } from "@/config/site";

/**
 * Meta Pixel helpers. Every standard event gets an event_id that is also sent to the
 * Conversions API (/api/meta-event or /api/lead), so Meta deduplicates browser + server.
 */

export type StandardEvent =
  | "PageView"
  | "ViewContent"
  | "Contact"
  | "Lead"
  | "Schedule"
  | "Search"
  | "SubmitApplication"
  | "FindLocation"
  | "CompleteRegistration";

export type LeadType =
  | "sell"
  | "valuation"
  | "buy"
  | "rent"
  | "management"
  | "commercial"
  | "careers"
  | "contact";

export type TrackParams = Record<string, string | number | boolean | undefined>;

type Fbq = ((...args: unknown[]) => void) & { callMethod?: unknown };

declare global {
  interface Window {
    fbq?: Fbq;
    gtag?: (...args: unknown[]) => void;
    uetq?: unknown[];
    dataLayer?: unknown[];
  }
}

/**
 * Google Ads mirror of every Meta standard event: Google event name + which conversion label (if set).
 * PageView is handled by the Google tag itself (config + PixelRouteTracker).
 */
const GOOGLE_MAP: Record<Exclude<StandardEvent, "PageView">, { name: string; label?: keyof typeof site.googleAds.labels }> = {
  Lead: { name: "generate_lead", label: "lead" },
  Contact: { name: "contact", label: "call" },
  Schedule: { name: "book_appointment", label: "schedule" },
  SubmitApplication: { name: "agent_application", label: "agent" },
  FindLocation: { name: "get_directions" },
  ViewContent: { name: "view_content" },
  Search: { name: "search" },
  CompleteRegistration: { name: "sign_up" },
};

/**
 * Service line of a page, so every event says which business it belongs to (property management vs
 * buying, selling, renting, commercial, recruiting). Lets you report PM ad leads and calls on their own.
 */
export type ServiceLine = "management" | "sell" | "buy" | "rent" | "commercial" | "careers" | "general";
const SERVICE_PATHS: [RegExp, ServiceLine][] = [
  [/^\/(property_management|commercial_property_management)|^\/blog\/florida-designated-cam/, "management"],
  [/^\/(sell-your-home|home-valuation)/, "sell"],
  [/^\/(residential|financing)/, "buy"],
  [/^\/(rent|resident_services)/, "rent"],
  [/^\/(commercial|commercial_properties|sales_acquisitions|tenant_buyer_representation|owners-representation)/, "commercial"],
  [/^\/(careers|join)/, "careers"],
];
export function serviceLineFor(path: string): ServiceLine {
  return SERVICE_PATHS.find(([re]) => re.test(path))?.[1] ?? "general";
}
const LEAD_TO_SERVICE: Record<string, ServiceLine> = { management: "management", sell: "sell", valuation: "sell", buy: "buy", rent: "rent", commercial: "commercial", careers: "careers" };

/** service_line (what this action is about) + landing_service (what the ad/first page of the visit was about). */
function serviceParams(params: TrackParams) {
  const path = window.location.pathname;
  const fromLead = typeof params.lead_type === "string" ? LEAD_TO_SERVICE[params.lead_type] : undefined;
  let landing: string | undefined;
  try {
    landing = sessionStorage.getItem("p1-landing-service") ?? undefined;
  } catch {
    /* ignore */
  }
  return { service_line: fromLead ?? serviceLineFor(path), landing_service: landing };
}

/** "HomeSearchClick" -> "home_search_click" (Google event-name style). */
const snake = (n: string) => n.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase().slice(0, 40);

function sendGoogle(event: StandardEvent, params: TrackParams, eventId: string) {
  const g = typeof window !== "undefined" ? window.gtag : undefined;
  if (!g || event === "PageView") return;
  const m = GOOGLE_MAP[event];
  // Only phone taps count as a call conversion (email taps are logged as a plain event).
  const isCall = event !== "Contact" || params.method === "phone";
  const name = event === "Contact" ? (isCall ? "click_to_call" : "click_to_email") : m.name;
  g("event", name, { ...params, event_id: eventId });

  // Property management gets its own events (pm_lead, pm_call) so PM ads can be measured and bid on
  // separately. A call counts as PM when made on a PM page, or on a general page (home, contact) during
  // a visit that landed on a PM page.
  const pm =
    params.service_line === "management" || (params.service_line === "general" && params.landing_service === "management");
  const kind = event === "Lead" ? "lead" : event === "Contact" && isCall ? "call" : null;
  if (pm && kind) g("event", `pm_${kind}`, { ...params, event_id: eventId });

  const L = site.googleAds.labels;
  const pmLabel = pm && kind === "lead" ? L.leadManagement : pm && kind === "call" ? L.callManagement : "";
  // One conversion per action: the PM label when it is set for a PM action, otherwise the general label.
  const label = pmLabel || (m.label && isCall ? L[m.label] : "");
  if (label) g("event", "conversion", { send_to: `${site.googleAds.id}/${label}`, transaction_id: eventId });
}

/**
 * Microsoft Ads (UET) mirror. Goals in Microsoft Ads: create "Event" goals on these actions:
 * submit_lead_form (leads; category = service line), phone_call_click, book_appointment, agent_application.
 */
const MS_MAP: Partial<Record<StandardEvent, string>> = { Lead: "submit_lead_form", Schedule: "book_appointment", SubmitApplication: "agent_application" };
function sendMicrosoft(event: StandardEvent, params: TrackParams) {
  if (typeof window === "undefined" || !site.msUetId) return;
  const action = event === "Contact" ? (params.method === "phone" ? "phone_call_click" : "email_click") : MS_MAP[event];
  if (!action) return;
  window.uetq = window.uetq || [];
  window.uetq.push("event", action, { event_category: String(params.service_line ?? "general"), event_label: String(params.lead_type ?? params.cta_location ?? "") });
}

/** Enhanced conversions: give Google the submitted email/phone (hashed by gtag) before a lead conversion fires. */
export function setGoogleUserData(u: { email?: string; phone?: string; firstName?: string; lastName?: string }) {
  if (typeof window === "undefined" || !window.gtag) return;
  const digits = (u.phone ?? "").replace(/\D/g, "");
  const phone = digits.length === 10 ? `+1${digits}` : digits.length === 11 ? `+${digits}` : undefined;
  window.gtag("set", "user_data", {
    ...(u.email ? { email: u.email.trim().toLowerCase() } : {}),
    ...(phone ? { phone_number: phone } : {}),
    ...(u.firstName ? { address: { first_name: u.firstName, last_name: u.lastName ?? "", country: "US", region: "FL" } } : {}),
  });
}

const ATTR_KEY = "p1-attribution";
const ATTR_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "gbraid", "wbraid"];

/** Remember ad/UTM parameters from the landing URL for the whole visit, so a lead submitted on a later page keeps its source. */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const p = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    ATTR_PARAMS.forEach((k) => {
      const v = p.get(k);
      if (v) found[k] = v.slice(0, 200);
    });
    if (Object.keys(found).length) {
      // A new ad/UTM click starts a new attribution: its landing page decides the landing service.
      found.landing_page = window.location.pathname.slice(0, 200);
      sessionStorage.setItem(ATTR_KEY, JSON.stringify(found));
      sessionStorage.setItem("p1-landing-service", serviceLineFor(window.location.pathname));
    } else if (!sessionStorage.getItem("p1-landing-service")) {
      sessionStorage.setItem("p1-landing-service", serviceLineFor(window.location.pathname));
    }
    // Visits referred by AI assistants (ChatGPT, Perplexity, Claude, Gemini, Copilot), tracked once per visit.
    if (!sessionStorage.getItem("p1-ai-source")) {
      const aiSource = aiSourceFrom(document.referrer, p.get("utm_source"));
      if (aiSource) {
        sessionStorage.setItem("p1-ai-source", aiSource);
        trackCustom("AIReferralVisit", { ai_source: aiSource });
      }
    }
    if (!sessionStorage.getItem("p1-referrer") && document.referrer && !document.referrer.includes(window.location.host)) {
      sessionStorage.setItem("p1-referrer", document.referrer.slice(0, 200));
    }
  } catch {
    /* ignore */
  }
}

const AI_HOSTS: [RegExp, string][] = [
  [/chatgpt\.com|chat\.openai\.com|openai\.com/i, "chatgpt"],
  [/perplexity\.ai/i, "perplexity"],
  [/claude\.ai|anthropic\.com/i, "claude"],
  [/gemini\.google\.com|bard\.google\.com/i, "gemini"],
  [/copilot\.microsoft\.com|bing\.com\/chat/i, "copilot"],
  [/meta\.ai/i, "meta_ai"],
  [/you\.com|phind\.com|duckduckgo\.com\/\?.*ia=chat/i, "other_ai"],
];
/** Which AI assistant sent this visit, from the referrer or utm_source (ChatGPT adds utm_source=chatgpt.com). */
export function aiSourceFrom(referrer: string, utmSource: string | null) {
  const hay = `${referrer} ${utmSource ?? ""}`;
  return AI_HOSTS.find(([re]) => re.test(hay))?.[1] ?? null;
}

export function getAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  try {
    Object.assign(out, JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}"));
    const ref = sessionStorage.getItem("p1-referrer");
    if (ref) out.referrer = ref;
    const aiSource = sessionStorage.getItem("p1-ai-source");
    if (aiSource) out.ai_source = aiSource;
    const landingService = sessionStorage.getItem("p1-landing-service");
    if (landingService) out.landing_service = landingService;
  } catch {
    /* ignore */
  }
  const p = new URLSearchParams(window.location.search);
  ATTR_PARAMS.forEach((k) => {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 200);
  });
  out.device = window.matchMedia("(hover: hover) and (pointer: fine)").matches ? "desktop" : "mobile";
  return out;
}

export function newEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function clean(params: TrackParams) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

/** Fire a standard event in the browser and mirror it server-side for dedup. */
export function track(event: StandardEvent, params: TrackParams = {}, opts: { eventId?: string; server?: boolean } = {}) {
  if (typeof window === "undefined") return;
  const eventId = opts.eventId ?? newEventId();
  const payload = clean({ ...serviceParams(params), ...params, page_path: window.location.pathname });
  window.fbq?.("track", event, payload, { eventID: eventId });
  try {
    sendGoogle(event, payload, eventId);
  } catch {
    /* tracking must never break the page */
  }
  try {
    sendMicrosoft(event, payload);
  } catch {
    /* tracking must never break the page */
  }

  if (opts.server !== false) {
    const body = JSON.stringify({ event, params: payload, eventId, url: window.location.href });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/meta-event", new Blob([body], { type: "application/json" }));
      } else {
        void fetch("/api/meta-event", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
      }
    } catch {
      /* tracking must never break the page */
    }
  }
  return eventId;
}

/** Custom events (button clicks, funnel progress). Browser only. Sent to Meta and to Google Ads with the same data. */
export function trackCustom(name: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;
  const payload = clean({ ...serviceParams(params), ...params, page_path: window.location.pathname });
  window.fbq?.("trackCustom", name, payload);
  try {
    window.gtag?.("event", snake(name), payload);
  } catch {
    /* tracking must never break the page */
  }
}

export function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

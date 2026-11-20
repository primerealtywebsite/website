import "server-only";
import { createHash } from "node:crypto";
import { site } from "@/config/site";

const GRAPH_VERSION = "v21.0";

const sha = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export type CapiUser = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  zip?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

export function capiEnabled() {
  return Boolean(process.env.META_CAPI_TOKEN);
}

/** Normalize a US phone number to digits with country code, as Meta requires. */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

/**
 * Send one server event to the Meta Conversions API. Silently no-ops when no token is set.
 * Uses the same event_id as the browser pixel so Meta deduplicates.
 */
export async function sendCapiEvent(input: {
  event: string;
  eventId: string;
  url: string;
  user: CapiUser;
  customData?: Record<string, unknown>;
}) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return { skipped: true };

  const u = input.user;
  const user_data: Record<string, unknown> = {
    client_ip_address: u.ip,
    client_user_agent: u.userAgent,
    fbp: u.fbp,
    fbc: u.fbc,
    st: [sha("fl")],
    country: [sha("us")],
  };
  if (u.email) user_data.em = [sha(u.email)];
  if (u.phone) user_data.ph = [sha(normalizePhone(u.phone))];
  if (u.firstName) user_data.fn = [sha(u.firstName)];
  if (u.lastName) user_data.ln = [sha(u.lastName)];
  if (u.zip) user_data.zp = [sha(u.zip)];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.url,
        action_source: "website",
        user_data,
        custom_data: input.customData ?? {},
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${site.metaPixelId}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
    return { ok: res.ok, status: res.status };
  } catch (error) {
    console.error("Meta CAPI error", error);
    return { ok: false };
  }
}

export function requestContext(req: Request) {
  const h = req.headers;
  const cookie = h.get("cookie") ?? "";
  const read = (n: string) => cookie.match(new RegExp(`(?:^|; )${n}=([^;]*)`))?.[1];
  return {
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || undefined,
    userAgent: h.get("user-agent") ?? undefined,
    fbp: read("_fbp"),
    fbc: read("_fbc"),
  };
}

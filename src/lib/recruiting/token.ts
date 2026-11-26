import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed, tamper-proof links that carry an applicant's stage through the affiliation workflow.
 *
 * Every gated step (signed documents, e-signature, the $149 payment, license transfer, Virtual Office)
 * checks the stage inside a link that only the previous step's server code can issue:
 *   pending  -> issued on submission (status page, written requests only)
 *   approved -> issued ONLY when the broker approves from his review link
 *   signed   -> issued after the agent e-signs (requires an approved link)
 *   paid     -> issued after payment succeeds (requires a signed link)
 *   affiliated -> issued ONLY when the broker confirms the license is affiliated
 * A pending or declined applicant never holds an approved link, so direct URLs to signing, payment,
 * signed documents or transfer instructions return "not available".
 *
 * Broker links (kind "broker") are separate and let Antony approve, decline or request information.
 * To revoke any applicant's links (for example after approving and later declining), add the
 * applicant ID to the REVOKED_APPLICANTS env var (comma separated) and redeploy.
 */

export const STAGES = ["pending", "approved", "signed", "paid", "affiliated"] as const;
export type Stage = (typeof STAGES)[number];

export type Applicant = {
  id: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  license: string;
  licenseType: string;
  track: "residential" | "commercial" | "both";
  market?: string;
  source?: string;
};

export type AgentToken = {
  k: "agent";
  st: Stage;
  a: Applicant;
  iat: number;
  exp: number;
  /** e-signature record (stage >= signed) */
  sig?: { at: string; name: string; ip?: string };
  /** payment record (stage >= paid) */
  pay?: { at: string; ref: string; mode: "stripe" | "sandbox" | "invoice" };
  /** affiliation confirmed (stage = affiliated) */
  aff?: { at: string };
};

export type BrokerToken = { k: "broker"; a: Applicant; flags: string[]; iat: number; exp: number; act?: "affiliate" | "paid"; ref?: AgentToken };

type Payload = AgentToken | BrokerToken;

const DAY = 86_400;
const TTL: Record<Stage, number> = { pending: 120 * DAY, approved: 60 * DAY, signed: 60 * DAY, paid: 120 * DAY, affiliated: 400 * DAY };

let warned = false;
function secret() {
  const s = process.env.RECRUITING_SECRET || process.env.AGENT_DOCS_SECRET;
  if (s && s.length >= 24) return s;
  // The repository is public, so a built-in fallback would let anyone forge an approval link.
  // Production fails closed: no gated link can be issued or accepted without a real secret.
  if (process.env.VERCEL_ENV === "production") throw new Error("RECRUITING_SECRET is not set (min 24 chars).");
  if (!warned) {
    warned = true;
    console.warn("[recruiting] RECRUITING_SECRET not set; using a development-only secret.");
  }
  return "dev-only-recruiting-secret-not-for-production";
}

export const recruitingConfigured = () => {
  try {
    secret();
    return true;
  } catch {
    return false;
  }
};

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");
const mac = (body: string) => createHmac("sha256", secret()).update(`p1r:${body}`).digest("base64url");

function encode(p: Payload) {
  const body = b64(JSON.stringify(p));
  return `${body}.${mac(body)}`;
}

function decode(token: string | null | undefined): Payload | null {
  if (!token || token.length > 6000) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  let expected: Buffer;
  try {
    expected = Buffer.from(mac(body));
  } catch {
    return null;
  }
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(unb64(body)) as Payload;
    if (!p.exp || p.exp * 1000 < Date.now()) return null;
    if (revoked().has(p.a.id)) return null;
    return p;
  } catch {
    return null;
  }
}

function revoked() {
  return new Set((process.env.REVOKED_APPLICANTS || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean));
}

const now = () => Math.floor(Date.now() / 1000);

export function agentToken(a: Applicant, st: Stage, extra: Partial<Pick<AgentToken, "sig" | "pay" | "aff">> = {}) {
  return encode({ k: "agent", st, a, iat: now(), exp: now() + TTL[st], ...extra });
}

export function brokerToken(a: Applicant, flags: string[], opts: { act?: "affiliate" | "paid"; ref?: AgentToken } = {}) {
  return encode({ k: "broker", a, flags, iat: now(), exp: now() + 90 * DAY, ...opts });
}

/** Returns the agent token only if its stage is one of `allowed`. */
export function readAgent(token: string | null | undefined, allowed: readonly Stage[]): AgentToken | null {
  const p = decode(token);
  if (!p || p.k !== "agent") return null;
  return allowed.includes(p.st) ? p : null;
}

export function readBroker(token: string | null | undefined): BrokerToken | null {
  const p = decode(token);
  return p && p.k === "broker" ? p : null;
}

/** Stable applicant ID from the email, so a returning applicant updates the same record instead of creating a duplicate. */
export function applicantId(email: string) {
  const h = createHmac("sha256", "prime1-applicant-id").update(email.trim().toLowerCase()).digest();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[h[i] % alphabet.length];
  return `P1-${out}`;
}

export const atLeast = (st: Stage, min: Stage) => STAGES.indexOf(st) >= STAGES.indexOf(min);

import "server-only";

/**
 * Resend sender with a safety net. Mail is sent from updates.prime1realty.net (verified in Resend;
 * Google Workspace mail on prime1realty.net is untouched). If that domain ever fails verification, emails are rejected (403). Office notices (leads, agent applications) then go to the Resend
 * account's own inbox (RESEND_FALLBACK_TO, default prime1realty@proton.me) from onboarding@resend.dev,
 * which Resend always allows, so no lead is ever lost. Emails to outside people (the agent's welcome
 * packet) can't use the fallback; the site then shows the packet for download instead.
 */
type Email = {
  from: string;
  to: string[];
  cc?: string[];
  reply_to?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: string }[];
};

export const resendEnabled = () => Boolean(process.env.RESEND_API_KEY);

async function post(body: Email) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  });
  const text = r.ok ? "" : await r.text();
  return { ok: r.ok, status: r.status, text };
}

/** Returns true only when the email reached the intended recipients (or the office fallback, for office notices). */
export async function sendEmail(email: Email, opts: { officeNotice?: boolean; tag?: string } = {}) {
  const tag = opts.tag ?? "[email]";
  try {
    const first = await post(email);
    if (first.ok) return true;
    console.error(tag, "Resend error", first.status, first.text);
    const unverified = first.status === 403 || /domain|verify|testing emails/i.test(first.text);
    if (!opts.officeNotice || !unverified) return false;
    const fallbackTo = process.env.RESEND_FALLBACK_TO || "prime1realty@proton.me";
    const second = await post({
      ...email,
      from: "Prime 1 Website <onboarding@resend.dev>",
      to: [fallbackTo],
      cc: undefined,
      subject: `${email.subject} [for ${email.to.join(", ")}]`,
      html: `<p style="font-family:Arial;font-size:12px;color:#b30808;background:#fdecec;padding:8px 10px;border-radius:6px">Delivered to this inbox because the sending domain was rejected by Resend. Intended for: ${email.to.join(", ")}. Check the updates.prime1realty.net domain in Resend.</p>${email.html}`,
    });
    if (!second.ok) console.error(tag, "Resend fallback error", second.status, second.text);
    return second.ok;
  } catch (e) {
    console.error(tag, "Resend error", e);
    return false;
  }
}

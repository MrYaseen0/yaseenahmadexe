/**
 * Lead email notifications via the Resend API (direct fetch, no extra dependency).
 *
 * Server-side only. Reads RESEND_API_KEY and LEAD_NOTIFY_EMAIL from the
 * environment — never hardcode or log them. Email failure never breaks the
 * form response; the lead is already saved in the database.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export type LeadKind = "contact" | "hire" | "booking";

export interface LeadEmailInput {
  kind: LeadKind;
  subject: string;
  /** Key detail lines, e.g. "Name: ...". Already length-capped by the route. */
  lines: string[];
  /** Lead's email so the owner can hit Reply directly. */
  replyTo?: string;
}

const KIND_LABEL: Record<LeadKind, string> = {
  contact: "New contact message",
  hire: "New hire request",
  booking: "New booking request",
};

export async function sendLeadNotification(input: LeadEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;

  // Not configured -> skip silently (lead is still saved).
  if (!apiKey || !to) return false;

  const body = [
    `${KIND_LABEL[input.kind]} — yaseenahmadexe.vercel.app`,
    "",
    ...input.lines,
    "",
    `Received: ${new Date().toISOString()}`,
  ].join("\n");

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Free tier: onboarding@resend.dev works for self-notifications.
        // For client-facing mail, verify your own domain and set LEAD_FROM_EMAIL.
        from: process.env.LEAD_FROM_EMAIL || "onboarding@resend.dev",
        to: [to],
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        subject: input.subject,
        text: body,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`Lead email failed (${input.kind}):`, res.status, detail.slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Lead email error (${input.kind}):`, err);
    return false;
  }
}

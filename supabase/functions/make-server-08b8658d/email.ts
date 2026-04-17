/**
 * ══════════════════════════════════════════════════════════════
 *  email.ts — Transactional email via Resend (fetch-native)
 *
 *  Uses Deno fetch directly — no Node SDK required.
 *  All emails sent from: MasteryTalk <hola@masterytalk.pro>
 * ══════════════════════════════════════════════════════════════
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "MasteryTalk <hello@masterytalk.pro>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** Optional reply-to address */
  replyTo?: string;
}

/**
 * Send a transactional email via Resend.
 * Fire-and-forget safe — logs errors but never throws.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not configured — skipping email");
    return false;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        ...(options.replyTo && { reply_to: options.replyTo }),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[Email] Resend ${res.status}: ${errBody.slice(0, 300)}`);
      return false;
    }

    const data = await res.json();
    console.log(`[Email] ✅ Sent to ${options.to} — id: ${data.id}`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send to ${options.to}:`, err);
    return false;
  }
}

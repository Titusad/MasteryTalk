/**
 * ══════════════════════════════════════════════════════════════
 *  twilio.ts — Twilio SDK + helpers for WhatsApp SR Coach
 *
 *  Handles:
 *  - Sending WhatsApp messages via Twilio API
 *  - Downloading incoming media (OGG audio)
 *  - Validating Twilio webhook signatures
 *  - OTP verification via Twilio Verify
 *
 *  Environment variables (set via `supabase secrets set`):
 *  - TWILIO_ACCOUNT_SID     → ACxxxxxxx
 *  - TWILIO_AUTH_TOKEN       → your auth token
 *  - TWILIO_PHONE_NUMBER     → whatsapp:+14155238886 (sandbox) or +1XXX (production)
 *  - TWILIO_VERIFY_SID       → VAxxxxxxx (for OTP verification)
 * ══════════════════════════════════════════════════════════════
 */

/* ── Credentials ── */

function getTwilioCredentials() {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const phoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid) throw new Error("[Twilio] TWILIO_ACCOUNT_SID not configured");
  if (!authToken) throw new Error("[Twilio] TWILIO_AUTH_TOKEN not configured");
  if (!phoneNumber) throw new Error("[Twilio] TWILIO_PHONE_NUMBER not configured");

  return { accountSid, authToken, phoneNumber };
}

/* ── Send WhatsApp Message ── */

export async function sendWhatsAppMessage(params: {
  to: string;
  body: string;
  mediaUrl?: string;
}): Promise<{ messageSid: string }> {
  const { accountSid, authToken, phoneNumber } = getTwilioCredentials();

  const fromNumber = phoneNumber.startsWith("whatsapp:")
    ? phoneNumber
    : `whatsapp:${phoneNumber}`;
  const toNumber = params.to.startsWith("whatsapp:")
    ? params.to
    : `whatsapp:${params.to}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const formBody = new URLSearchParams({
    From: fromNumber,
    To: toNumber,
    Body: params.body,
  });

  if (params.mediaUrl) {
    formBody.append("MediaUrl", params.mediaUrl);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
    },
    body: formBody.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[Twilio] Send failed (${res.status}): ${errBody.slice(0, 300)}`);
    throw new Error(`Twilio send failed: ${res.status}`);
  }

  const data = await res.json();
  return { messageSid: data.sid };
}

/* ── Download Incoming Media (OGG audio from WhatsApp) ── */

export async function downloadTwilioMedia(mediaUrl: string): Promise<ArrayBuffer> {
  const { accountSid, authToken } = getTwilioCredentials();

  const res = await fetch(mediaUrl, {
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
    },
  });

  if (!res.ok) {
    throw new Error(`[Twilio] Media download failed: ${res.status}`);
  }

  return res.arrayBuffer();
}

/* ── Twilio Webhook Signature Validation ── */

export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
): boolean {
  // For the Sandbox, we skip signature validation (the Sandbox doesn't use it reliably).
  // For production, implement HMAC-SHA1 validation per:
  // https://www.twilio.com/docs/usage/security#validating-requests
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!authToken) return false;

  // Build the data string: URL + sorted params concatenated
  let data = url;
  const sortedKeys = Object.keys(params).sort();
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  // HMAC-SHA1
  const encoder = new TextEncoder();
  return crypto.subtle
    .importKey("raw", encoder.encode(authToken), { name: "HMAC", hash: "SHA-1" }, false, ["sign"])
    .then((key) => crypto.subtle.sign("HMAC", key, encoder.encode(data)))
    .then((sig) => {
      const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
      return computed === signature;
    })
    .catch(() => false) as unknown as boolean;
}

/* ── Twilio Verify (OTP for phone number linking) ── */

export async function sendVerificationOTP(phoneNumber: string): Promise<{ status: string }> {
  const { accountSid, authToken } = getTwilioCredentials();
  const verifySid = Deno.env.get("TWILIO_VERIFY_SID");
  if (!verifySid) throw new Error("[Twilio] TWILIO_VERIFY_SID not configured");

  const url = `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`;
  const formBody = new URLSearchParams({
    To: phoneNumber,
    Channel: "whatsapp",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
    },
    body: formBody.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`[Twilio Verify] Send OTP failed (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return { status: data.status };
}

export async function checkVerificationOTP(
  phoneNumber: string,
  code: string,
): Promise<{ valid: boolean }> {
  const { accountSid, authToken } = getTwilioCredentials();
  const verifySid = Deno.env.get("TWILIO_VERIFY_SID");
  if (!verifySid) throw new Error("[Twilio] TWILIO_VERIFY_SID not configured");

  const url = `https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`;
  const formBody = new URLSearchParams({
    To: phoneNumber,
    Code: code,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
    },
    body: formBody.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`[Twilio Verify] Check OTP failed (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return { valid: data.status === "approved" };
}

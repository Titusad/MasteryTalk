/**
 * ══════════════════════════════════════════════════════════════
 *  whatsapp-verify.ts — Phone number verification routes
 *
 *  POST /whatsapp/send-otp   — Send verification code via WhatsApp
 *  POST /whatsapp/verify-otp — Verify code and link number to profile
 *
 *  Both routes require auth (user must be logged in).
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import { getAuthUser, getAdminClient } from "../_shared.ts";
import { sendVerificationOTP, checkVerificationOTP } from "../twilio.ts";

const app = new Hono();

/* ── Send OTP ── */
app.post("/make-server-08b8658d/whatsapp/send-otp", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { phoneNumber } = await c.req.json();

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return c.json({ error: "Missing phoneNumber" }, 400);
    }

    // Basic E164 validation
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!e164Regex.test(phoneNumber)) {
      return c.json({ error: "Invalid phone number format. Use E.164: +521234567890" }, 400);
    }

    // Check if number is already verified by another user
    const supabase = getAdminClient();
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("whatsapp_number", phoneNumber)
      .eq("whatsapp_verified", true)
      .neq("id", user.id)
      .single();

    if (existing) {
      return c.json({ error: "This number is already linked to another account" }, 409);
    }

    // Save unverified number to profile
    await supabase
      .from("profiles")
      .update({ whatsapp_number: phoneNumber, whatsapp_verified: false })
      .eq("id", user.id);

    // Send OTP via Twilio Verify
    const result = await sendVerificationOTP(phoneNumber);

    console.log(`[WA Verify] OTP sent to ${phoneNumber} for user ${user.id}: ${result.status}`);
    return c.json({ status: result.status });
  } catch (err) {
    console.error("[WA Verify] Send OTP error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Failed to send verification: ${message}` }, 500);
  }
});

/* ── Verify OTP ── */
app.post("/make-server-08b8658d/whatsapp/verify-otp", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { phoneNumber, code } = await c.req.json();

    if (!phoneNumber || !code) {
      return c.json({ error: "Missing phoneNumber or code" }, 400);
    }

    // Verify via Twilio
    const result = await checkVerificationOTP(phoneNumber, code);

    if (!result.valid) {
      return c.json({ error: "Invalid or expired code" }, 400);
    }

    // Mark as verified in profile
    const supabase = getAdminClient();
    await supabase
      .from("profiles")
      .update({ whatsapp_number: phoneNumber, whatsapp_verified: true })
      .eq("id", user.id);

    console.log(`[WA Verify] ✅ Number verified: ${phoneNumber} → user ${user.id}`);
    return c.json({ verified: true });
  } catch (err) {
    console.error("[WA Verify] Verify OTP error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: `Verification failed: ${message}` }, 500);
  }
});

export default app;

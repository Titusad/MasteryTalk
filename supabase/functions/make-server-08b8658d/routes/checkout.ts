/**
 * ══════════════════════════════════════════════════════════════
 *  checkout.ts — Stripe Subscription Checkout session creation
 *
 *  POST /create-checkout
 *  Body: { tier: 'early_bird' | 'monthly' | 'quarterly' }
 *  Returns: { checkoutUrl, checkoutId, tier }
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import { getAuthUser } from "../_shared.ts";
import { createStripeCheckout, isEarlyBirdAvailable, getEarlyBirdCount, getStripe, type SubscriptionTier } from "../stripe.ts";
import * as kv from "../kv_store.ts";

const app = new Hono();

const VALID_TIERS: SubscriptionTier[] = ["early_bird", "monthly", "quarterly"];

app.post("/make-server-08b8658d/create-checkout", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const body = await c.req.json().catch(() => ({}));
    const tier: SubscriptionTier = VALID_TIERS.includes(body.tier) ? body.tier : "monthly";

    // Validate Early Bird availability
    if (tier === "early_bird") {
      const available = await isEarlyBirdAvailable();
      if (!available) {
        const count = await getEarlyBirdCount();
        return c.json({ error: "Early Bird is full", slotsUsed: count, maxSlots: 20 }, 409);
      }
    }

    const origin =
      c.req.header("Origin") ||
      c.req.header("Referer")?.replace(/\/[^/]*$/, "") ||
      "https://masterytalk.pro";

    const successUrl = `${origin}/#dashboard?payment=success&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${origin}/#dashboard?payment=cancelled`;

    console.log(`[Checkout] Creating ${tier} checkout for user ${user.id}`);

    const result = await createStripeCheckout({
      userId:   user.id,
      userEmail: user.email || undefined,
      tier,
      successUrl,
      cancelUrl,
    });

    console.log(`[Checkout] ✅ ${tier} session created: ${result.checkoutId}`);
    return c.json({ ...result, tier });

  } catch (err) {
    console.error("[Checkout] Error:", err);
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("Early Bird slots are full")) {
      return c.json({ error: "Early Bird is full (20/20)" }, 409);
    }
    if (message.includes("not configured")) {
      return c.json({ error: `Stripe configuration error: ${message}` }, 500);
    }

    return c.json({ error: "Failed to create checkout session" }, 500);
  }
});

app.post("/make-server-08b8658d/create-portal-session", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profileRaw = await kv.get(`profile:${user.id}`);
    const profile = profileRaw
      ? (typeof profileRaw === "string" ? JSON.parse(profileRaw) : profileRaw)
      : null;

    const customerId = profile?.stripe_customer_id;
    if (!customerId) {
      return c.json({ error: "No active subscription found" }, 404);
    }

    const origin =
      c.req.header("Origin") ||
      c.req.header("Referer")?.replace(/\/[^/]*$/, "") ||
      "https://masterytalk.pro";

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/#account`,
    });

    console.log(`[Portal] ✅ Portal session created for user ${user.id}`);
    return c.json({ url: session.url });

  } catch (err) {
    console.error("[Portal] Error:", err);
    return c.json({ error: "Failed to create portal session" }, 500);
  }
});

export default app;

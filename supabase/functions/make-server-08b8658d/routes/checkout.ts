/**
 * ══════════════════════════════════════════════════════════════
 *  checkout.ts — Stripe Subscription Checkout session creation
 *
 *  POST /create-checkout
 *  Body: { tier: 'monthly' | 'quarterly' }
 *  Returns: { checkoutUrl, checkoutId, tier, isEarlyBird, slotsLeft }
 *
 *  Early bird pricing is applied automatically when slots remain —
 *  the user just picks the tier, the backend picks the price.
 * ══════════════════════════════════════════════════════════════
 */
import { Hono } from "npm:hono";
import { getAuthUser } from "../_shared.ts";
import { createStripeCheckout, isEarlyBirdAvailable, getEarlyBirdCount, type SubscriptionTier } from "../stripe.ts";
import * as kv from "../kv_store.ts";

const app = new Hono();

const VALID_TIERS: SubscriptionTier[] = ["monthly", "quarterly"];

app.post("/make-server-08b8658d/create-checkout", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized — valid session required" }, 401);
    }

    const body = await c.req.json().catch(() => ({}));
    const tier: SubscriptionTier = VALID_TIERS.includes(body.tier) ? body.tier : "monthly";
    const primaryPath: string | undefined = body.primary_path || undefined;

    // Expose slot info so frontend can show "X spots left at launch price"
    const ebAvailable = await isEarlyBirdAvailable();
    const slotsUsed   = await getEarlyBirdCount();
    const slotsLeft   = Math.max(0, 25 - slotsUsed);

    const origin =
      c.req.header("Origin") ||
      c.req.header("Referer")?.replace(/\/[^/]*$/, "") ||
      "https://masterytalk.pro";

    const successUrl = `${origin}/#dashboard?payment=success&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${origin}/#dashboard?payment=cancelled`;

    console.log(`[Checkout] tier=${tier} earlyBird=${ebAvailable} slotsLeft=${slotsLeft} user=${user.id}`);

    const result = await createStripeCheckout({
      userId:    user.id,
      userEmail: user.email || undefined,
      tier,
      primaryPath,
      successUrl,
      cancelUrl,
    });

    console.log(`[Checkout] ✅ session created: ${result.checkoutId}`);
    return c.json({ ...result, tier, isFoundingMember: ebAvailable, slotsLeft });

  } catch (err) {
    console.error("[Checkout] Error:", err);
    const message = err instanceof Error ? err.message : String(err);
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
